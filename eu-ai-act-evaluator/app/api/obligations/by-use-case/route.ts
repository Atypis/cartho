import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type ObligationInstance = Database['public']['Tables']['obligation_instances']['Row'];

interface UseCaseWithObligations {
  use_case_id: string;
  use_case_title: string;
  use_case_description: string;
  obligations: ObligationInstance[];
  summary: {
    total_applicable: number;
    compliant: number;
    in_progress: number;
    non_compliant: number;
    not_started: number;
    high_risk_issues: number;
    critical_risk_issues: number;
  };
}

/**
 * GET /api/obligations/by-use-case
 *
 * Returns obligations grouped by use case with summary statistics.
 * Filters out not_applicable obligations by default.
 *
 * Query params:
 * - include_na: "true" to include not_applicable obligations
 * - risk_level: filter by risk level
 * - implementation_state: filter by implementation state
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeNA = searchParams.get('include_na') === 'true';
    const riskFilter = searchParams.get('risk_level');
    const implementationFilter = searchParams.get('implementation_state');

    // Build query
    let query = supabase
      .from('obligation_instances')
      .select(`
        *,
        use_cases (
          id,
          title,
          description
        )
      `)
      .order('use_case_id')
      .order('pn_id');

    // Filter out not_applicable by default
    if (!includeNA) {
      query = query.neq('applicability_state', 'not_applicable');
    }

    // Apply additional filters
    if (riskFilter) {
      query = query.eq('risk_level', riskFilter);
    }
    if (implementationFilter) {
      query = query.eq('implementation_state', implementationFilter);
    }

    const { data: obligations, error } = await query;

    if (error) {
      console.error('Error fetching obligations:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by use case
    const useCaseMap = new Map<string, UseCaseWithObligations>();

    for (const obl of obligations || []) {
      const useCaseId = obl.use_case_id;
      const useCase = (obl as any).use_cases;

      if (!useCaseMap.has(useCaseId)) {
        useCaseMap.set(useCaseId, {
          use_case_id: useCaseId,
          use_case_title: useCase?.title || 'Unknown',
          use_case_description: useCase?.description || '',
          obligations: [],
          summary: {
            total_applicable: 0,
            compliant: 0,
            in_progress: 0,
            non_compliant: 0,
            not_started: 0,
            high_risk_issues: 0,
            critical_risk_issues: 0,
          },
        });
      }

      const useCaseData = useCaseMap.get(useCaseId)!;
      useCaseData.obligations.push(obl);

      // Update summary stats
      if (obl.applicability_state === 'applies') {
        useCaseData.summary.total_applicable++;

        // Implementation status
        if (obl.implementation_state === 'compliant') {
          useCaseData.summary.compliant++;
        } else if (obl.implementation_state === 'in_progress') {
          useCaseData.summary.in_progress++;
        } else if (obl.implementation_state === 'non_compliant') {
          useCaseData.summary.non_compliant++;
        } else if (obl.implementation_state === 'not_started') {
          useCaseData.summary.not_started++;
        }

        // Risk level
        if (obl.risk_level === 'high') {
          useCaseData.summary.high_risk_issues++;
        } else if (obl.risk_level === 'critical') {
          useCaseData.summary.critical_risk_issues++;
        }
      }
    }

    // Convert map to array
    const useCases = Array.from(useCaseMap.values());

    return NextResponse.json({
      use_cases: useCases,
      total: useCases.length,
    });
  } catch (error) {
    console.error('Error in /api/obligations/by-use-case:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
