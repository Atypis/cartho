/**
 * Prescriptive Norm Bundle API
 *
 * GET /api/prescriptive/bundle?pnIds=PN-04,PN-05
 * Returns: { pns: PrescriptiveNorm[], sharedPrimitives: SharedPrimitive[] }
 */
import { NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

type PNIndex = {
  prescriptive_norms: Array<{ id: string; path: string; title?: string; shared_refs?: string[] }>; 
  shared_primitives: Array<{ id: string; path: string }>; 
};

async function loadIndex(): Promise<PNIndex> {
  const indexPath = path.join(process.cwd(), '..', 'eu-ai-act-cartography', 'prescriptive-norms', 'PN-INDEX.json');
  const data = await readFile(indexPath, 'utf-8');
  return JSON.parse(data);
}

async function loadJSON(filePath: string): Promise<any> {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), '..', filePath);
  const data = await readFile(abs, 'utf-8');
  return JSON.parse(data);
}

function idToSharedPath(id: string): string {
  // qp:is_deployer -> eu-ai-act-cartography/prescriptive-norms/shared-primitives/qp-is_deployer.json
  const filename = id.replace(':', '-') + '.json';
  return path.join('eu-ai-act-cartography', 'prescriptive-norms', 'shared-primitives', filename);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pnIdsParam = searchParams.get('pnIds') || '';
    const pnIds = pnIdsParam
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (pnIds.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing pnIds query parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const index = await loadIndex();
    const idxMap = new Map(index.prescriptive_norms.map(p => [p.id, p]));

    // Load PNs
    const pns = [] as any[];
    const sharedIds = new Set<string>();
    for (const id of pnIds) {
      const entry = idxMap.get(id);
      if (!entry) {
        return new Response(JSON.stringify({ error: `PN not found in index: ${id}` }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const pnJson = await loadJSON(entry.path);
      pns.push(pnJson);
      (pnJson.shared_refs || []).forEach((r: string) => sharedIds.add(r));
    }

    // Load shared primitives (by id)
    const sharedPrimitives = [] as any[];
    for (const spId of Array.from(sharedIds)) {
      const fp = idToSharedPath(spId);
      try {
        const spJson = await loadJSON(fp);
        sharedPrimitives.push(spJson);
      } catch (e) {
        // Attempt to resolve via index.shared_primitives list
        const idxSp = index.shared_primitives.find(sp => sp.id === spId);
        if (idxSp) {
          const spJson = await loadJSON(idxSp.path);
          sharedPrimitives.push(spJson);
        } else {
          console.warn(`[Bundle] Shared primitive not found: ${spId}`);
        }
      }
    }

    return new Response(JSON.stringify({ pns, sharedPrimitives }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Bundle API error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

