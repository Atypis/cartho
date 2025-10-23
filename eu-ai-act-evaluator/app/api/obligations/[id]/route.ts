/**
 * Single Obligation API Route
 *
 * GET: Fetch a single obligation instance with full details
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch obligation with related data
    const { data: obligation, error } = await supabase
      .from('obligation_instances')
      .select(`
        *,
        use_cases!inner(
          id,
          title,
          description,
          tags
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`❌ [Obligation API] Error fetching obligation ${id}:`, error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!obligation) {
      return new Response(
        JSON.stringify({ error: 'Obligation not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch evaluation history for this obligation
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select('*')
      .eq('use_case_id', obligation.use_case_id)
      .contains('pn_ids', [obligation.pn_id])
      .order('triggered_at', { ascending: false });

    // Fetch status history
    const { data: history } = await supabase
      .from('obligation_status_history')
      .select('*')
      .eq('obligation_instance_id', id)
      .order('changed_at', { ascending: false });

    console.log(`✅ [Obligation API] Fetched obligation ${id}`);

    return new Response(
      JSON.stringify({
        obligation,
        evaluations: evaluations || [],
        history: history || [],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ [Obligation API] Unexpected error:', error);
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
