'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type UseCase = Database['public']['Tables']['use_cases']['Row'];

interface UseCaseGalleryProps {
  useCases: UseCase[];
  onSelectUseCase: (useCaseId: string) => void;
  onCreateNew: () => void;
}

interface UseCaseWithMetadata extends UseCase {
  evaluation_count?: number;
  latest_evaluation_date?: string | null;
}

export function UseCaseGallery({ useCases, onSelectUseCase, onCreateNew }: UseCaseGalleryProps) {
  const [useCasesWithMetadata, setUseCasesWithMetadata] = useState<UseCaseWithMetadata[]>([]);

  useEffect(() => {
    async function loadMetadata() {
      const enriched = await Promise.all(
        useCases.map(async (useCase) => {
          const { count } = await supabase
            .from('evaluations')
            .select('*', { count: 'exact', head: true })
            .eq('use_case_id', useCase.id);

          const { data: latestEval } = await supabase
            .from('evaluations')
            .select('created_at')
            .eq('use_case_id', useCase.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...useCase,
            evaluation_count: count || 0,
            latest_evaluation_date: latestEval?.created_at || null,
          };
        })
      );
      setUseCasesWithMetadata(enriched);
    }

    if (useCases.length > 0) {
      loadMetadata();
    }
  }, [useCases]);

  if (useCases.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="text-center max-w-xl">
          <h2 className="text-3xl font-semibold text-neutral-900 mb-4 tracking-tight">
            EU AI Act Compliance Evaluator
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-8">
            Document your AI systems and evaluate them against prescriptive norms from the EU AI Act.
          </p>
          <button
            onClick={onCreateNew}
            className="px-8 py-3 bg-neutral-900 text-white rounded-lg text-[15px]
                     font-medium hover:bg-neutral-800 transition-all duration-200
                     hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          >
            Create Your First Use Case
          </button>
        </div>
      </div>
    );
  }

  const displayData = useCasesWithMetadata.length > 0 ? useCasesWithMetadata : useCases;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">
              Use Cases
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              {useCases.length} {useCases.length === 1 ? 'system' : 'systems'} documented
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm
                     font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Use Case
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider px-6 py-3">
                  System
                </th>
                <th className="text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider px-6 py-3">
                  Category
                </th>
                <th className="text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider px-6 py-3">
                  Created
                </th>
                <th className="text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider px-6 py-3">
                  Evaluations
                </th>
                <th className="text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-semibold text-neutral-700 uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {displayData.map((useCase) => (
                <tr
                  key={useCase.id}
                  className="hover:bg-neutral-50 transition-colors cursor-pointer"
                  onClick={() => onSelectUseCase(useCase.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-neutral-900 line-clamp-1">
                        {useCase.title}
                      </span>
                      <span className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                        {useCase.description}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {useCase.tags && useCase.tags.length > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700">
                        {useCase.tags[0]}
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-600">
                      {new Date(useCase.created_at).toLocaleDateString('en', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-neutral-900">
                        {(useCase as UseCaseWithMetadata).evaluation_count ?? '—'}
                      </span>
                      {(useCase as UseCaseWithMetadata).latest_evaluation_date && (
                        <span className="text-xs text-neutral-500">
                          Last: {new Date((useCase as UseCaseWithMetadata).latest_evaluation_date!).toLocaleDateString('en', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(useCase as UseCaseWithMetadata).evaluation_count && (useCase as UseCaseWithMetadata).evaluation_count! > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Evaluated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectUseCase(useCase.id);
                      }}
                      className="text-sm text-neutral-600 hover:text-neutral-900 font-medium"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
