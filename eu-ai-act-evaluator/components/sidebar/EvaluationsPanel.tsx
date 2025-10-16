'use client';

/**
 * Evaluations Panel
 *
 * Displays list of evaluations for a selected use-case
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import { formatDistanceToNow } from 'date-fns';

type Evaluation = Database['public']['Tables']['evaluations']['Row'];

interface EvaluationsPanelProps {
  useCaseId: string | null;
  onSelectEvaluation: (evaluationId: string) => void;
  selectedEvaluationId: string | null;
}

export function EvaluationsPanel({
  useCaseId,
  onSelectEvaluation,
  selectedEvaluationId,
}: EvaluationsPanelProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!useCaseId) {
      setEvaluations([]);
      return;
    }

    loadEvaluations();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`evaluations_${useCaseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evaluations',
          filter: `use_case_id=eq.${useCaseId}`,
        },
        () => {
          loadEvaluations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [useCaseId]);

  const loadEvaluations = async () => {
    if (!useCaseId) return;

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

  const getStatusColor = (status: Evaluation['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'running':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  if (!useCaseId) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-900">Evaluations</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-neutral-500 text-center">
            Select a use-case to view evaluations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-900">Evaluations</h3>
        <p className="text-xs text-neutral-500 mt-1">
          {evaluations.length} {evaluations.length === 1 ? 'evaluation' : 'evaluations'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-neutral-500">
            Loading...
          </div>
        ) : evaluations.length === 0 ? (
          <div className="p-4 text-center text-sm text-neutral-500">
            No evaluations yet
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {evaluations.map((evaluation) => (
              <button
                key={evaluation.id}
                onClick={() => onSelectEvaluation(evaluation.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedEvaluationId === evaluation.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-neutral-50 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-mono text-neutral-500">
                    {evaluation.pn_ids.join(', ')}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${getStatusColor(
                      evaluation.status
                    )}`}
                  >
                    {evaluation.status}
                  </span>
                </div>
                <div className="text-xs text-neutral-500">
                  {formatDistanceToNow(new Date(evaluation.triggered_at), {
                    addSuffix: true,
                  })}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
