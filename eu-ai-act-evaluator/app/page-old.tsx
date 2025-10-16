'use client';

/**
 * Main Evaluation Interface (Redesigned)
 *
 * Clean tabular layout with Legora-inspired professional aesthetic
 * No React Flow - custom layout implementation
 */

import { useState, useMemo } from 'react';
import { RequirementsGrid } from '@/components/evaluation/RequirementsGrid';
import { DetailPanel } from '@/components/evaluation/DetailPanel';
import { expandSharedRequirements } from '@/lib/evaluation/expand-shared';
import type { PrescriptiveNorm, SharedPrimitive, EvaluationState, RequirementNode } from '@/lib/evaluation/types';
import PN04 from '@/data/prescriptive-norms/PN-04.json';
import qpIsProvider from '@/data/prescriptive-norms/shared-primitives/qp-is_provider.json';
import qpIsDeployer from '@/data/prescriptive-norms/shared-primitives/qp-is_deployer.json';
import qpInScopeArt2 from '@/data/prescriptive-norms/shared-primitives/qp-in_scope_art2.json';

export default function Home() {
  const [step, setStep] = useState<'select' | 'input' | 'evaluate'>('select');
  const [caseInput, setCaseInput] = useState('');
  const [evaluationStates, setEvaluationStates] = useState<EvaluationState[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [finalVerdict, setFinalVerdict] = useState<boolean | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const prescriptiveNorm = PN04 as unknown as PrescriptiveNorm;
  const sharedPrimitives = [
    qpIsProvider,
    qpIsDeployer,
    qpInScopeArt2,
  ] as unknown as SharedPrimitive[];

  // Expand shared requirements into the main tree
  const expandedNodes = useMemo(() => {
    return expandSharedRequirements(
      prescriptiveNorm.requirements.nodes,
      sharedPrimitives
    );
  }, []);

  const handleSelectPN = () => {
    setStep('input');
  };

  const handleStartEvaluation = async () => {
    if (!caseInput.trim()) {
      alert('Please enter case facts');
      return;
    }

    setStep('evaluate');
    setIsEvaluating(true);
    setEvaluationStates([]);
    setFinalVerdict(null);
    setSelectedNodeId(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptiveNorm,
          sharedPrimitives,
          caseInput,
        }),
      });

      if (!response.ok) {
        throw new Error('Evaluation failed');
      }

      const result = await response.json();
      setEvaluationStates(result.states);
      setFinalVerdict(result.compliant);
    } catch (error) {
      console.error('Evaluation error:', error);
      alert('Evaluation failed. Check console for details.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleCloseDetail = () => {
    setSelectedNodeId(null);
  };

  // Get all nodes including expanded shared primitives
  const allNodes = expandedNodes;
  const nodeMap = new Map(allNodes.map((n: RequirementNode) => [n.id, n]));
  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;
  const selectedState = evaluationStates.find(s => s.nodeId === selectedNodeId);

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-[400px] bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-8 border-b border-neutral-200">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
            EU AI Act Evaluator
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Evaluate compliance with prescriptive norms
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {step === 'select' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Step 1: Select Prescriptive Norm
              </h2>

              <div
                className="border border-neutral-200 rounded-lg p-5 hover:border-neutral-400 hover:shadow-sm cursor-pointer transition-all"
                onClick={handleSelectPN}
              >
                <div className="text-xs font-mono text-neutral-500 mb-2">PN-04</div>
                <div className="font-medium text-neutral-900 mb-2">
                  {prescriptiveNorm.title}
                </div>
                <div className="text-xs text-neutral-600">
                  Article {prescriptiveNorm.article_refs[0].article}
                </div>
              </div>

              <div className="opacity-40 pointer-events-none">
                <div className="border border-neutral-200 rounded-lg p-5">
                  <div className="text-xs font-mono text-neutral-500 mb-2">PN-05</div>
                  <div className="font-medium text-neutral-900 mb-2">
                    Coming soon...
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'input' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Step 2: Enter Case Facts
              </h2>

              <div className="text-sm text-neutral-600">
                Selected: <span className="font-medium text-neutral-900">{prescriptiveNorm.title}</span>
              </div>

              <textarea
                className="w-full h-64 p-4 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm leading-relaxed resize-none"
                placeholder="Enter the case facts here. Describe the AI system, the actor(s) involved, and relevant context..."
                value={caseInput}
                onChange={(e) => setCaseInput(e.target.value)}
              />

              <div className="text-xs text-neutral-600 bg-blue-50 border border-blue-100 p-4 rounded-lg leading-relaxed">
                <strong className="text-blue-900">Example:</strong> Acme Corp (based in Germany) develops and deploys an AI-powered customer service chatbot for use within the EU. The chatbot is used by their customer service staff daily. Acme Corp has not provided any AI literacy training to their staff.
              </div>

              <button
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                onClick={handleStartEvaluation}
              >
                Start Evaluation
              </button>
            </div>
          )}

          {step === 'evaluate' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Evaluation Results
              </h2>

              {finalVerdict !== null && (
                <div className={`p-5 rounded-lg border-2 ${
                  finalVerdict
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}>
                  <div className="font-bold text-lg mb-1">
                    {finalVerdict ? '✓ Compliant' : '✗ Non-Compliant'}
                  </div>
                  <div className="text-sm">
                    {finalVerdict
                      ? 'All requirements are satisfied'
                      : 'One or more requirements are not satisfied'}
                  </div>
                </div>
              )}

              {isEvaluating && (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-neutral-200 border-t-blue-500 rounded-full animate-spin" />
                  <div className="mt-4 text-neutral-600 text-sm">Evaluating requirements...</div>
                </div>
              )}

              <button
                className="w-full bg-white border border-neutral-200 text-neutral-700 py-3 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
                onClick={() => {
                  setStep('input');
                  setEvaluationStates([]);
                  setFinalVerdict(null);
                  setSelectedNodeId(null);
                }}
              >
                New Evaluation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col bg-stone-50 overflow-hidden">
        {/* Obligation Header */}
        {step !== 'select' && (
          <div className="bg-white border-b border-neutral-200 p-8 flex-shrink-0">
            <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2 font-medium">
              Article {prescriptiveNorm.article_refs[0].article}
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3 leading-tight">
              {prescriptiveNorm.title}
            </h2>
            <div className="text-sm text-neutral-700 leading-relaxed max-w-4xl">
              {prescriptiveNorm.legal_consequence.verbatim}
            </div>
          </div>
        )}

        {/* Requirements Grid (Scrollable) */}
        <div className="flex-1 overflow-auto p-8">
          {step !== 'select' && (
            <RequirementsGrid
              nodes={allNodes}
              rootId={prescriptiveNorm.requirements.root}
              evaluationStates={evaluationStates}
              onNodeClick={handleNodeClick}
              selectedNodeId={selectedNodeId}
            />
          )}

          {step === 'select' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-neutral-400">
                <div className="text-lg mb-2">Select a prescriptive norm to begin</div>
                <div className="text-sm">Choose PN-04 from the sidebar</div>
              </div>
            </div>
          )}
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
