'use client';

/**
 * Use Case Cockpit Page
 *
 * Comprehensive dashboard for a single use case showing:
 * - Use case details (title, description, tags)
 * - All evaluations in a sortable/filterable table
 * - Quick stats overview
 * - Trigger new evaluation interface
 * - Live updates via real-time subscriptions
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { EvaluationsTable } from '@/components/usecase/EvaluationsTable';
import type { Database } from '@/lib/supabase/types';

type UseCase = Database['public']['Tables']['use_cases']['Row'];
type Evaluation = Database['public']['Tables']['evaluations']['Row'];

export default function UseCasePage() {
  const router = useRouter();
  const params = useParams();
  const useCaseId = params.id as string;

  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [availablePNs, setAvailablePNs] = useState<string[]>([]);
  const [selectedPNs, setSelectedPNs] = useState<string[]>([]);
  const [triggering, setTriggering] = useState(false);

  // Load available PNs from catalog
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/catalog');
        if (res.ok) {
          const data = await res.json();
          const ids = (data?.prescriptive_norms || []).map((p: any) => p.id);
          setAvailablePNs(ids);
        }
      } catch (e) {
        console.warn('[Catalog] Failed to load PN-INDEX, falling back to default');
        setAvailablePNs(['PN-04']);
      }
    })();
  }, []);

  // Load use case details
  useEffect(() => {
    if (!useCaseId) return;
    loadUseCase();

    // Real-time subscription for use case updates
    const subscription = supabase
      .channel(`usecase_${useCaseId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'use_cases',
          filter: `id=eq.${useCaseId}`
        },
        (payload) => {
          console.log('📝 [UseCase] Update detected:', payload);
          loadUseCase();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [useCaseId]);

  const loadUseCase = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('use_cases')
      .select('*')
      .eq('id', useCaseId)
      .single();

    if (error) {
      console.error('Error loading use case:', error);
      // Navigate back if not found
      router.push('/');
    } else {
      setUseCase(data);
    }
    setLoading(false);
  };

  const triggerEvaluation = async () => {
    if (selectedPNs.length === 0) return;
    setTriggering(true);

    try {
      const { data, error } = await supabase
        .from('evaluations')
        .insert({
          use_case_id: useCaseId,
          pn_ids: selectedPNs,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        console.log('✅ [Trigger] Evaluation created:', data.id);
        setSelectedPNs([]);
        // Navigate to main page which will handle running the evaluation
        router.push(`/?evaluation=${data.id}`);
      }
    } catch (error) {
      console.error('❌ [Trigger] Error:', error);
      alert('Failed to trigger evaluation');
    } finally {
      setTriggering(false);
    }
  };

  const handleSelectEvaluation = (evaluationId: string) => {
    router.push(`/?evaluation=${evaluationId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-neutral-500">Loading use case...</div>
      </div>
    );
  }

  if (!useCase) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-neutral-500">Use case not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-neutral-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: 'Use Cases', href: '/' },
              { label: useCase.title }
            ]}
          />
          <button
            onClick={() => router.push('/')}
            className="text-sm px-4 py-2 text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Use Case Details Card */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                {useCase.title}
              </h1>
              <p className="text-neutral-600 leading-relaxed">
                {useCase.description}
              </p>
            </div>
          </div>

          {useCase.tags && useCase.tags.length > 0 && (
            <div className="flex gap-2 mt-4">
              {useCase.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Evaluations Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900">
              Evaluations
            </h2>
          </div>

          <EvaluationsTable
            useCaseId={useCaseId}
            onSelectEvaluation={handleSelectEvaluation}
          />
        </div>

        {/* Trigger New Evaluation Section */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Trigger New Evaluation
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-3 block">
                Select Prescriptive Norms to Evaluate:
              </label>
              <div className="flex flex-wrap gap-2">
                {availablePNs.map((pn) => (
                  <button
                    key={pn}
                    onClick={() => {
                      setSelectedPNs(prev =>
                        prev.includes(pn)
                          ? prev.filter(p => p !== pn)
                          : [...prev, pn]
                      );
                    }}
                    className={`text-sm px-4 py-2 rounded-lg border transition-all ${
                      selectedPNs.includes(pn)
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-900'
                    }`}
                  >
                    {pn}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={triggerEvaluation}
              disabled={selectedPNs.length === 0 || triggering}
              className="w-full px-6 py-3 bg-neutral-900 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {triggering
                ? 'Triggering Evaluation...'
                : `Trigger Evaluation ${selectedPNs.length > 0 ? `(${selectedPNs.length} selected)` : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
