/**
 * Obligations API Route
 *
 * GET: Fetch obligation instances with filtering and enrichment
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse filters from query params
    const useCaseId = searchParams.get('use_case_id');
    const pnId = searchParams.get('pn_id');
    const applicabilityState = searchParams.get('applicability_state');
    const implementationState = searchParams.get('implementation_state');
    const riskLevel = searchParams.get('risk_level');
    const ownerId = searchParams.get('owner_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('obligation_instances')
      .select(`
        *,
        use_cases!inner(
          id,
          title,
          description
        )
      `)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (useCaseId) {
      query = query.eq('use_case_id', useCaseId);
    }
    if (pnId) {
      query = query.eq('pn_id', pnId);
    }
    if (applicabilityState) {
      query = query.eq('applicability_state', applicabilityState);
    }
    if (implementationState) {
      query = query.eq('implementation_state', implementationState);
    }
    if (riskLevel) {
      query = query.eq('risk_level', riskLevel);
    }
    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data: obligations, error } = await query;

    if (error) {
      console.error('❌ [Obligations API] Error fetching obligations:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('obligation_instances')
      .select('*', { count: 'exact', head: true });

    if (useCaseId) countQuery = countQuery.eq('use_case_id', useCaseId);
    if (pnId) countQuery = countQuery.eq('pn_id', pnId);
    if (applicabilityState) countQuery = countQuery.eq('applicability_state', applicabilityState);
    if (implementationState) countQuery = countQuery.eq('implementation_state', implementationState);
    if (riskLevel) countQuery = countQuery.eq('risk_level', riskLevel);
    if (ownerId) countQuery = countQuery.eq('owner_id', ownerId);

    const { count } = await countQuery;

    console.log(`✅ [Obligations API] Fetched ${obligations?.length || 0} obligations (total: ${count})`);

    return new Response(
      JSON.stringify({
        obligations: obligations || [],
        total: count || 0,
        limit,
        offset,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ [Obligations API] Unexpected error:', error);
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
