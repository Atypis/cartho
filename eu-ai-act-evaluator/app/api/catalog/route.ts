/**
 * Catalog API: Serves the PN-INDEX.json from the cartography repo
 */
import { NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(_req: NextRequest) {
  try {
    const indexPath = path.join(process.cwd(), '..', 'eu-ai-act-cartography', 'prescriptive-norms', 'PN-INDEX.json');
    const data = await readFile(indexPath, 'utf-8');
    return new Response(data, {
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

