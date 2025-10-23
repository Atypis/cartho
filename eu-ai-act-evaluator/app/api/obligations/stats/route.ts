/**
 * Obligations Stats API Route
 *
 * GET: Fetch aggregated compliance statistics for dashboard
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const useCaseId = searchParams.get('use_case_id');

    // Fetch all obligations (optionally filtered by use case)
    let query = supabase
      .from('obligation_instances')
      .select('applicability_state, implementation_state, risk_level, due_date');

    if (useCaseId) {
      query = query.eq('use_case_id', useCaseId);
    }

    const { data: obligations, error } = await query;

    if (error) {
      console.error('❌ [Stats API] Error fetching obligations:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!obligations) {
      return new Response(
        JSON.stringify({ error: 'No obligations found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate stats
    const total = obligations.length;

    // Applicability breakdown
    const applicabilityStats = {
      pending: obligations.filter(o => o.applicability_state === 'pending').length,
      evaluating: obligations.filter(o => o.applicability_state === 'evaluating').length,
      applies: obligations.filter(o => o.applicability_state === 'applies').length,
      not_applicable: obligations.filter(o => o.applicability_state === 'not_applicable').length,
    };

    // Compliance breakdown (only for applicable obligations)
    const applicableObligations = obligations.filter(o => o.applicability_state === 'applies');
    const complianceStats = {
      not_started: applicableObligations.filter(o => o.implementation_state === 'not_started').length,
      in_progress: applicableObligations.filter(o => o.implementation_state === 'in_progress').length,
      compliant: applicableObligations.filter(o => o.implementation_state === 'compliant').length,
      partial: applicableObligations.filter(o => o.implementation_state === 'partial').length,
      non_compliant: applicableObligations.filter(o => o.implementation_state === 'non_compliant').length,
      waived: applicableObligations.filter(o => o.implementation_state === 'waived').length,
    };

    // Risk level breakdown (only for applicable obligations)
    const riskStats = {
      low: applicableObligations.filter(o => o.risk_level === 'low').length,
      medium: applicableObligations.filter(o => o.risk_level === 'medium').length,
      high: applicableObligations.filter(o => o.risk_level === 'high').length,
      critical: applicableObligations.filter(o => o.risk_level === 'critical').length,
      unassigned: applicableObligations.filter(o => !o.risk_level).length,
    };

    // Upcoming deadlines (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = applicableObligations.filter(o => {
      if (!o.due_date) return false;
      const dueDate = new Date(o.due_date);
      return dueDate >= now && dueDate <= thirtyDaysFromNow;
    }).length;

    // Overdue obligations
    const overdue = applicableObligations.filter(o => {
      if (!o.due_date) return false;
      const dueDate = new Date(o.due_date);
      return dueDate < now;
    }).length;

    // High-risk non-compliant
    const highRiskNonCompliant = applicableObligations.filter(o =>
      (o.risk_level === 'high' || o.risk_level === 'critical') &&
      (o.implementation_state === 'non_compliant' || o.implementation_state === 'not_started')
    ).length;

    const stats = {
      total,
      applicability: applicabilityStats,
      compliance: complianceStats,
      risk: riskStats,
      deadlines: {
        upcoming: upcomingDeadlines,
        overdue,
      },
      needsAttention: {
        highRiskNonCompliant,
        overdue,
        total: highRiskNonCompliant + overdue,
      },
    };

    console.log(`✅ [Stats API] Calculated stats for ${total} obligations`);

    return new Response(
      JSON.stringify(stats),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ [Stats API] Unexpected error:', error);
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
