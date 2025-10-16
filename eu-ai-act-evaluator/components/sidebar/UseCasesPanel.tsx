'use client';

/**
 * Use Cases Panel
 *
 * Displays list of use-cases with click-to-view functionality
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type UseCase = Database['public']['Tables']['use_cases']['Row'];

interface UseCasesPanelProps {
  onSelectUseCase: (useCaseId: string) => void;
  selectedUseCaseId: string | null;
}

export function UseCasesPanel({ onSelectUseCase, selectedUseCaseId }: UseCasesPanelProps) {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUseCases();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('use_cases_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'use_cases' },
        (payload) => {
          console.log('Use case change detected:', payload);
          loadUseCases();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUseCases = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('use_cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading use-cases:', error);
    } else {
      setUseCases(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-900">Use Cases</h3>
        <p className="text-xs text-neutral-500 mt-1">
          {useCases.length} {useCases.length === 1 ? 'case' : 'cases'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-neutral-500">
            Loading...
          </div>
        ) : useCases.length === 0 ? (
          <div className="p-4 text-center text-sm text-neutral-500">
            No use-cases yet. Create one in the chat!
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {useCases.map((useCase) => (
              <button
                key={useCase.id}
                onClick={() => onSelectUseCase(useCase.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedUseCaseId === useCase.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-neutral-50 border border-transparent'
                }`}
              >
                <div className="text-sm font-medium text-neutral-900 mb-1">
                  {useCase.title}
                </div>
                <div className="text-xs text-neutral-500 line-clamp-2">
                  {useCase.description}
                </div>
                {useCase.tags && useCase.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {useCase.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
