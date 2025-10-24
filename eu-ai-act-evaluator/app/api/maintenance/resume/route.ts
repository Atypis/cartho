/**
 * Maintenance: Resume/Restart Evaluations
 *
 * Scans for stalled or failed evaluations and creates fresh evaluation rows
 * that continue from where they left off. Optionally triggers the runs
 * immediately (server-side), consuming the SSE streams in the background.
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';

type EvalRow = {
  id: string;
  use_case_id: string;
  pn_ids: string[];
  status: string;
  triggered_at?: string | null;
  heartbeat_at?: string | null;
};

async function fetchStalledOrFailed(useCaseId?: string, staleSeconds = 120): Promise<EvalRow[]> {
  const now = Date.now();
  const cutoff = new Date(now - staleSeconds * 1000).toISOString();

  const filters = (q: any) => {
    if (useCaseId) q = q.eq('use_case_id', useCaseId);
    return q;
  };

  // 1) Stalled: running but heartbeat too old (or null)
  const stalledQuery = filters(
    supabase
      .from('evaluations' as any)
      .select('*')
      .eq('status', 'running')
  );

  const { data: stalled, error: stalledErr } = await stalledQuery;
  if (stalledErr) {
    console.warn('⚠️  [Resume] Failed to fetch stalled evaluations:', stalledErr);
  }
  const stalledList: EvalRow[] = (stalled as any[] || []).filter((e) => {
    const hb = e.heartbeat_at ? new Date(e.heartbeat_at).toISOString() : null;
    return !hb || hb < cutoff;
  });

  // 2) Failed: explicitly failed
  const failedQuery = filters(
    supabase
      .from('evaluations' as any)
      .select('*')
      .eq('status', 'failed')
  );
  const { data: failed, error: failedErr } = await failedQuery;
  if (failedErr) {
    console.warn('⚠️  [Resume] Failed to fetch failed evaluations:', failedErr);
  }

  const unique: Record<string, EvalRow> = {};
  for (const row of [...(stalledList as any[]), ...(failed as any[] || [])]) {
    if (!row?.id) continue;
    unique[row.id] = row as EvalRow;
  }
  return Object.values(unique);
}

async function triggerEvaluationServerSide(baseUrl: string, evaluationId: string, useCaseId: string, pnIds: string[], baseEvaluationId?: string) {
  // Load PN bundle + use case description
  const bundleRes = await fetch(`${baseUrl}/api/prescriptive/bundle?pnIds=${encodeURIComponent(pnIds.join(','))}`);
  if (!bundleRes.ok) throw new Error('Failed to load PN bundle');
  const bundle = await bundleRes.json();

  const { data: useCase } = await supabase
    .from('use_cases' as any)
    .select('description')
    .eq('id', useCaseId)
    .single();

  const caseInput = (useCase as any)?.description || '';

  // Sequentially trigger PN evaluations; consume SSE to completion
  for (let i = 0; i < pnIds.length; i++) {
    const pnId = pnIds[i];
    const pnData = bundle.pns[i];
    const sharedPrimitives = bundle.sharedPrimitives || [];

    const res = await fetch(`${baseUrl}/api/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prescriptiveNorm: pnData,
        sharedPrimitives,
        caseInput,
        evaluationId,
        baseEvaluationId,
        skipResolved: true,
      }),
    });

    if (!res.body) continue;
    const reader = res.body.getReader();
    // Drain stream
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const useCaseId = url.searchParams.get('useCaseId') || undefined;
    const auto = url.searchParams.get('auto') === 'true';
    const staleSeconds = parseInt(url.searchParams.get('stale') || '120', 10);

    const toResume = await fetchStalledOrFailed(useCaseId, isFinite(staleSeconds) ? staleSeconds : 120);
    const baseUrl = new URL(req.url).origin;
    const created: { baseId: string; newId: string; count: number }[] = [];

    for (const base of toResume) {
      if (!Array.isArray(base.pn_ids) || base.pn_ids.length === 0) continue;

      // Create a fresh evaluation row that will continue from base
      const { data: newEval, error: insertErr } = await supabase
        .from('evaluations' as any)
        .insert({
          use_case_id: base.use_case_id,
          pn_ids: base.pn_ids,
          status: 'pending',
        })
        .select()
        .single();

      if (insertErr || !newEval) {
        console.warn('⚠️  [Resume] Insert failed for base', base.id, insertErr);
        continue;
      }

      created.push({ baseId: base.id, newId: newEval.id, count: (base.pn_ids as any[]).length });

      // Auto-run sequentially, reusing resolved nodes from base
      if (auto) {
        try {
          await supabase
            .from('evaluations' as any)
            .update({ status: 'running', heartbeat_at: new Date().toISOString() as any })
            .eq('id', newEval.id);

          await triggerEvaluationServerSide(baseUrl, newEval.id, base.use_case_id, base.pn_ids as string[], base.id);
        } catch (e) {
          console.error('❌ [Resume] Auto run error:', e);
        }
      }
    }

    return new Response(
      JSON.stringify({
        resumed: created.length,
        evaluations: created,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ [Resume] Error:', error);
    return new Response(JSON.stringify({ error: 'Resume failed' }), { status: 500 });
  }
}
