'use client';

/**
 * Standalone Evaluation Page (Old Working Pattern)
 *
 * This is the ORIGINAL working evaluation system that properly consumes SSE streams.
 * Used for testing/verification that live evaluation still works.
 *
 * URL: /evaluation-standalone?pnId=PN-04&useCaseId=xxx
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RequirementsGrid } from '@/components/evaluation/RequirementsGrid';
import { DetailPanel } from '@/components/evaluation/DetailPanel';
import { expandSharedRequirements } from '@/lib/evaluation/expand-shared';
import { supabase } from '@/lib/supabase/client';
import type { PrescriptiveNorm, SharedPrimitive, EvaluationState, RequirementNode } from '@/lib/evaluation/types';

export default function StandaloneEvaluationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pnId = searchParams.get('pnId');
  const useCaseId = searchParams.get('useCaseId');

  const [loading, setLoading] = useState(true);
  const [pnData, setPnData] = useState<PrescriptiveNorm | null>(null);
  const [sharedPrimitives, setSharedPrimitives] = useState<SharedPrimitive[]>([]);
  const [useCase, setUseCase] = useState<any>(null);
  const [evaluationStates, setEvaluationStates] = useState<EvaluationState[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [finalVerdict, setFinalVerdict] = useState<boolean | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);

  // Load PN and use case data
  useEffect(() => {
    if (!pnId || !useCaseId) {
      setLoading(false);
      return;
    }

    loadData();
  }, [pnId, useCaseId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load PN bundle
      const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${pnId}`);
      if (!bundleRes.ok) throw new Error('Failed to load PN');

      const bundle = await bundleRes.json();
      setPnData(bundle.pns[0]);
      setSharedPrimitives(bundle.sharedPrimitives || []);

      // Load use case
      const { data: useCaseData } = await supabase
        .from('use_cases')
        .select('*')
        .eq('id', useCaseId)
        .single();

      setUseCase(useCaseData);

      // Auto-start evaluation
      setTimeout(() => handleStartEvaluation(bundle.pns[0], bundle.sharedPrimitives || [], useCaseData), 500);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load evaluation data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEvaluation = async (pn: PrescriptiveNorm, primitives: SharedPrimitive[], uc: any) => {
    if (!pn || !uc) return;

    setIsEvaluating(true);
    setEvaluationStates([]);
    setFinalVerdict(null);
    setSelectedNodeId(null);

    try {
      // Create evaluation record
      const { data: evaluation, error: evalError } = await supabase
        .from('evaluations')
        .insert({
          use_case_id: useCaseId,
          pn_ids: [pnId],
          status: 'running',
        })
        .select()
        .single();

      if (evalError) throw evalError;
      setEvaluationId(evaluation.id);

      console.log(`🚀 [Standalone] Starting evaluation ${evaluation.id}`);

      // Start SSE stream (THE OLD WORKING PATTERN)
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptiveNorm: pn,
          sharedPrimitives: primitives,
          caseInput: uc.description,
          evaluationId: evaluation.id,
        }),
      });

      if (!response.ok) throw new Error('Evaluation failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      console.log('📡 [Standalone] SSE stream started');

      // Read SSE stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('📡 [Standalone] SSE stream ended');
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'progress') {
              const completedCount = data.states.filter((s: any) => s.status === 'completed').length;
              const skippedCount = data.states.filter((s: any) => s.status === 'skipped').length;
              console.log(`📊 [Standalone Progress] ${completedCount + skippedCount} nodes resolved`);

              // LIVE UPDATE: Set states immediately
              setEvaluationStates(data.states);
            } else if (data.type === 'complete') {
              console.log('✅ [Standalone Complete] Evaluation finished');

              setEvaluationStates(data.result.states);
              setFinalVerdict(data.result.compliant);
              setIsEvaluating(false);

              // Update DB status
              await supabase
                .from('evaluations')
                .update({ status: 'completed', completed_at: new Date().toISOString() })
                .eq('id', evaluation.id);
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ [Standalone] Evaluation error:', error);
      alert('Evaluation failed: ' + (error as Error).message);
      setIsEvaluating(false);

      if (evaluationId) {
        await supabase
          .from('evaluations')
          .update({ status: 'failed' })
          .eq('id', evaluationId);
      }
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleCloseDetail = () => {
    setSelectedNodeId(null);
  };

  const handleBack = () => {
    router.push(`/use-cases/${useCaseId}`);
  };

  // Expand shared requirements
  const expandedNodes = useMemo(() => {
    if (!pnData) return [];
    return expandSharedRequirements(pnData.requirements.nodes, sharedPrimitives);
  }, [pnData, sharedPrimitives]);

  const nodeMap = new Map(expandedNodes.map((n: RequirementNode) => [n.id, n]));
  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;
  const selectedState = evaluationStates.find(s => s.nodeId === selectedNodeId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-neutral-200 border-t-blue-500 rounded-full animate-spin" />
          <div className="mt-4 text-neutral-600">Loading evaluation...</div>
        </div>
      </div>
    );
  }

  if (!pnData || !useCase) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center text-neutral-600">
          <p className="mb-4">Invalid evaluation parameters</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-[400px] bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-8 border-b border-neutral-200">
          <button
            onClick={handleBack}
            className="mb-4 text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-2"
          >
            ← Back to Cockpit
          </button>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
            Standalone Evaluation
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Old working pattern - SSE stream consumption
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
                Use Case
              </div>
              <div className="font-medium text-neutral-900">{useCase.title}</div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
                Prescriptive Norm
              </div>
              <div className="text-xs font-mono text-neutral-500 mb-1">{pnData.id}</div>
              <div className="font-medium text-neutral-900 text-sm">{pnData.title}</div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
                Status
              </div>
              {isEvaluating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-blue-600 font-medium">Evaluating...</span>
                </div>
              ) : finalVerdict !== null ? (
                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  finalVerdict
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {finalVerdict ? '✓ Compliant' : '✗ Non-Compliant'}
                </div>
              ) : (
                <div className="text-sm text-neutral-500">Ready</div>
              )}
            </div>

            {evaluationStates.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
                  Progress
                </div>
                <div className="text-sm text-neutral-700">
                  {evaluationStates.filter(s => s.status === 'completed' || s.status === 'skipped').length} / {expandedNodes.filter((n: any) => n.kind === 'primitive').length} nodes resolved
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col bg-stone-50 overflow-hidden">
        {/* PN Header */}
        <div className="bg-white border-b border-neutral-200 p-8 flex-shrink-0">
          <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2 font-medium">
            Article {pnData.article_refs[0].article}
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3 leading-tight">
            {pnData.title}
          </h2>
          <div className="text-sm text-neutral-700 leading-relaxed max-w-4xl">
            {pnData.legal_consequence.verbatim}
          </div>
        </div>

        {/* Requirements Grid (Scrollable) */}
        <div className="flex-1 overflow-auto p-8">
          <RequirementsGrid
            nodes={expandedNodes}
            rootId={pnData.requirements.root}
            evaluationStates={evaluationStates}
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedNodeId}
            isRunning={isEvaluating}
            totalNodes={expandedNodes.filter((n: any) => n.kind === 'primitive').length}
            evaluationStatus={isEvaluating ? 'running' : 'completed'}
            pnTitle={pnData.title}
            pnArticle={pnData.article_refs?.[0]?.article?.toString()}
            pnLegalText={pnData.legal_consequence?.verbatim}
            pnLegalNotes={pnData.legal_consequence?.notes}
            pnLegalContextItems={pnData.legal_consequence?.context?.items}
            pnLegalContextRefs={pnData.legal_consequence?.context?.refs}
            pnEffectiveFrom={pnData.side_info?.effective_from}
            pnArticleRefs={pnData.article_refs}
          />
        </div>

        {/* Detail Panel (Fixed at Bottom) */}
        {selectedNode && (
          <div className="bg-white border-t border-neutral-200 p-6 flex-shrink-0 max-h-[400px] overflow-y-auto">
            <DetailPanel
              node={selectedNode}
              state={selectedState}
              onClose={handleCloseDetail}
            />
          </div>
        )}
      </div>
    </div>
  );
}
