/**
 * Find Obligation Instance API Route
 *
 * GET: Find obligation instance by use_case_id and pn_id
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const useCaseId = searchParams.get('use_case_id');
    const pnId = searchParams.get('pn_id');

    if (!useCaseId || !pnId) {
      return new Response(
        JSON.stringify({ error: 'Missing use_case_id or pn_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: obligation, error } = await supabase
      .from('obligation_instances')
      .select('id')
      .eq('use_case_id', useCaseId)
      .eq('pn_id', pnId)
      .single();

    if (error || !obligation) {
      return new Response(
        JSON.stringify({ found: false, id: null }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ found: true, id: obligation.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ [Find Obligation API] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
