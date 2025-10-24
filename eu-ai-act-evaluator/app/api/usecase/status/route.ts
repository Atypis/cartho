import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const useCaseId = searchParams.get('useCaseId');
    if (!useCaseId) {
      return new Response(JSON.stringify({ error: 'Missing useCaseId' }), { status: 400 });
    }

    // 1) Final statuses from obligation_instances (fast path)
    const { data: obligations } = await supabase
      .from('obligation_instances' as any)
      .select('pn_id, pn_title, pn_article, applicability_state, evaluated_at, latest_evaluation_id')
      .eq('use_case_id', useCaseId);

    const applies: any[] = [];
    const notApplicable: any[] = [];
    const finalByPn: Record<string, any> = {};

    for (const row of (obligations as any[]) || []) {
      const status = row.applicability_state === 'applies' ? 'applies' : 'not-applicable';
      const entry = {
        pnId: row.pn_id as string,
        title: row.pn_title as string | null,
        article: row.pn_article as string | number | null,
        status,
        evaluatedAt: row.evaluated_at as string | null,
        evaluationId: row.latest_evaluation_id as string | null,
      };
      finalByPn[entry.pnId] = entry;
      if (status === 'applies') applies.push(entry); else notApplicable.push(entry);
    }

    // 2) Running evaluations overlay
    const { data: running } = await supabase
      .from('evaluations' as any)
      .select('id, pn_ids, status, triggered_at, progress_current, progress_total')
      .eq('use_case_id', useCaseId)
      .eq('status', 'running');

    const runningEvaluations = ((running as any[]) || []).map((r) => ({
      id: r.id as string,
      pn_ids: r.pn_ids as string[],
      status: r.status as string,
      triggered_at: r.triggered_at as string | null,
      progress_current: r.progress_current as number | null,
      progress_total: r.progress_total as number | null,
    }));

    // Build PN-level overlay for evaluating items
    const evaluatingPNs: any[] = [];
    for (const ev of runningEvaluations) {
      const current = ev.progress_current ?? null;
      const total = ev.progress_total ?? null;
      for (const pnId of ev.pn_ids || []) {
        evaluatingPNs.push({
          pnId,
          status: 'evaluating',
          evaluationId: ev.id,
          progressCurrent: current ?? undefined,
          progressTotal: total ?? undefined,
          evaluatedAt: ev.triggered_at || null,
        });
      }
    }

    return new Response(
      JSON.stringify({
        applies,
        notApplicable,
        evaluatingPNs,
        runningEvaluations,
        finalByPn,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('[Status] Error:', e);
    return new Response(JSON.stringify({ error: 'Failed to load status' }), { status: 500 });
  }
}

