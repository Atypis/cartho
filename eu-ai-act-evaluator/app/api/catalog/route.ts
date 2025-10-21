/**
 * Catalog API: Serves the PN-INDEX.json from the cartography repo
 *
 * Returns:
 * - groups: Array of group definitions
 * - grouped_pns: PNs that belong to groups (with group metadata)
 * - ungrouped_pns: PNs that don't belong to any group
 * - all_pns: All PNs (for backward compatibility)
 */
import { NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(_req: NextRequest) {
  try {
    const indexPath = path.join(process.cwd(), '..', 'eu-ai-act-cartography', 'prescriptive-norms', 'PN-INDEX.json');
    const rawData = await readFile(indexPath, 'utf-8');
    const index = JSON.parse(rawData);

    // Separate grouped and ungrouped PNs
    const grouped_pns = index.prescriptive_norms.filter((pn: any) => pn.group_id);
    const ungrouped_pns = index.prescriptive_norms.filter((pn: any) => !pn.group_id);

    // Enhanced response with grouping information
    const response = {
      version: index.version,
      generated_at: index.generated_at,
      schema_version: index.schema_version,
      groups: index.groups || [],
      grouped_pns,
      ungrouped_pns,
      all_pns: index.prescriptive_norms, // Backward compatibility
      shared_primitives: index.shared_primitives
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to read PN-INDEX.json:', error);
    return new Response(JSON.stringify({ error: 'Index not found' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

