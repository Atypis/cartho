'use client';

/**
 * Evaluations Table Component
 *
 * Comprehensive table showing all evaluations for a use case with:
 * - Status badges, timestamps, result summaries
 * - Sorting and filtering
 * - Live updates via real-time subscription
 * - Click to view evaluation details
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Evaluation = Database['public']['Tables']['evaluations']['Row'];

interface EvaluationsTableProps {
  useCaseId: string;
  onSelectEvaluation: (evaluationId: string) => void;
  selectedEvaluationId?: string | null;
  runningEvaluations?: Set<string>;
}

type FilterStatus = 'all' | 'completed' | 'running' | 'failed' | 'pending';

export function EvaluationsTable({
  useCaseId,
  onSelectEvaluation,
  selectedEvaluationId,
  runningEvaluations = new Set()
}: EvaluationsTableProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    loadEvaluations();

    // Real-time subscription
    const subscription = supabase
      .channel(`evaluations_table_${useCaseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evaluations',
          filter: `use_case_id=eq.${useCaseId}`
        },
        (payload) => {
          console.log('📊 [Table] Evaluation change detected:', payload);
          loadEvaluations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [useCaseId]);

  const loadEvaluations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('use_case_id', useCaseId)
      .order('triggered_at', { ascending: false });

    if (error) {
      console.error('Error loading evaluations:', error);
    } else {
      setEvaluations(data || []);
    }
    setLoading(false);
  };

  const getStatusInfo = (evaluation: Evaluation) => {
    const isRunning = runningEvaluations.has(evaluation.id);

    if (isRunning) {
      return {
        label: 'RUNNING',
        color: 'bg-blue-500 text-white',
        icon: '⟳',
        animate: true
      };
    }

    switch (evaluation.status) {
      case 'completed':
        return {
          label: 'COMPLETED',
          color: 'bg-green-500 text-white',
          icon: '✓',
          animate: false
        };
      case 'running':
        return {
          label: 'RUNNING',
          color: 'bg-blue-500 text-white',
          icon: '⟳',
          animate: true
        };
      case 'failed':
        return {
          label: 'FAILED',
          color: 'bg-red-500 text-white',
          icon: '✗',
          animate: false
        };
      default:
        return {
          label: 'PENDING',
          color: 'bg-neutral-400 text-white',
          icon: '○',
          animate: false
        };
    }
  };

  const filteredEvaluations = evaluations.filter(eval => {
    if (filter === 'all') return true;

    // Check if currently running in frontend
    if (filter === 'running' && runningEvaluations.has(eval.id)) return true;

    return eval.status === filter;
  });

  const stats = {
    total: evaluations.length,
    completed: evaluations.filter(e => e.status === 'completed').length,
    running: evaluations.filter(e => e.status === 'running' || runningEvaluations.has(e.id)).length,
    failed: evaluations.filter(e => e.status === 'failed').length,
    pending: evaluations.filter(e => e.status === 'pending').length,
  };

  return (
    <div className="space-y-4">
      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total</div>
          <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-xs text-green-700 uppercase tracking-wide mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="text-xs text-blue-700 uppercase tracking-wide mb-1">Running</div>
          <div className="text-2xl font-bold text-blue-700">{stats.running}</div>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="text-xs text-red-700 uppercase tracking-wide mb-1">Failed</div>
          <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
        </div>
        <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
          <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Pending</div>
          <div className="text-2xl font-bold text-neutral-700">{stats.pending}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200">
        {(['all', 'completed', 'running', 'failed', 'pending'] as FilterStatus[]).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              filter === status
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-500">
            Loading evaluations...
          </div>
        ) : filteredEvaluations.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            {filter === 'all'
              ? 'No evaluations yet. Trigger your first evaluation below!'
              : `No ${filter} evaluations found.`}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                  PN IDs
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                  Triggered
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                  Completed
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredEvaluations.map((evaluation) => {
                const statusInfo = getStatusInfo(evaluation);
                const isSelected = selectedEvaluationId === evaluation.id;

                return (
                  <tr
                    key={evaluation.id}
                    onClick={() => onSelectEvaluation(evaluation.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50'
                        : 'hover:bg-neutral-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {evaluation.pn_ids.map((pn, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded font-mono"
                          >
                            {pn}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${statusInfo.color} ${
                        statusInfo.animate ? 'animate-pulse' : ''
                      }`}>
                        <span className={statusInfo.animate ? 'animate-spin' : ''}>
                          {statusInfo.icon}
                        </span>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {new Date(evaluation.triggered_at).toLocaleString('en', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {evaluation.completed_at
                        ? new Date(evaluation.completed_at).toLocaleString('en', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvaluation(evaluation.id);
                        }}
                        className="text-xs px-3 py-1.5 bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
