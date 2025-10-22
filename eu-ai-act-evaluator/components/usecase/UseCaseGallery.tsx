'use client';

import type { Database } from '@/lib/supabase/types';

type UseCase = Database['public']['Tables']['use_cases']['Row'];

interface UseCaseGalleryProps {
  useCases: UseCase[];
  onSelectUseCase: (useCaseId: string) => void;
  onCreateNew: () => void;
}

export function UseCaseGallery({ useCases, onSelectUseCase, onCreateNew }: UseCaseGalleryProps) {
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

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2 tracking-tight">
            Your Use Cases
          </h2>
          <p className="text-neutral-600 text-[15px]">
            {useCases.length} {useCases.length === 1 ? 'system' : 'systems'} documented
          </p>
        </div>

        {/* Use Case Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create New Card */}
          <button
            onClick={onCreateNew}
            className="group bg-white border-2 border-dashed border-neutral-300 rounded-xl p-6
                     hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-200
                     flex flex-col items-center justify-center min-h-[200px] gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-neutral-100 group-hover:bg-neutral-200
                          flex items-center justify-center transition-colors">
              <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-[15px] font-medium text-neutral-700 group-hover:text-neutral-900">
              Create New Use Case
            </div>
          </button>

          {/* Existing Use Cases */}
          {useCases.map((useCase) => (
            <button
              key={useCase.id}
              onClick={() => onSelectUseCase(useCase.id)}
              className="group bg-white border border-neutral-200 rounded-xl p-6
                       hover:border-neutral-300 hover:shadow-md transition-all duration-200
                       text-left flex flex-col min-h-[200px]"
            >
              <div className="flex-1">
                <h3 className="text-[16px] font-semibold text-neutral-900 mb-2 line-clamp-2
                             group-hover:text-blue-600 transition-colors">
                  {useCase.title}
                </h3>
                <p className="text-[14px] text-neutral-600 leading-relaxed line-clamp-3">
                  {useCase.description}
                </p>
              </div>

              {/* Metadata Footer */}
              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {useCase.tags && useCase.tags.length > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded font-medium">
                      {useCase.tags[0]}
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-500">
                  {new Date(useCase.created_at).toLocaleDateString('en', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
