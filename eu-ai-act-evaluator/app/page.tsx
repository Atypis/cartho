'use client';

/**
 * Main Application Page (Redesigned)
 *
 * 3-column layout:
 * - Left: Chat sessions management + active chat
 * - Center: Main canvas (evaluation results, summary views)
 * - Right: Use-cases and evaluations panels
 */

import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { RequirementsGrid } from '@/components/evaluation/RequirementsGrid';
import { DetailPanel } from '@/components/evaluation/DetailPanel';
import { EvaluationProgress } from '@/components/evaluation/EvaluationProgress';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import type { PrescriptiveNorm, SharedPrimitive, EvaluationState, RequirementNode } from '@/lib/evaluation/types';
import { expandSharedRequirements } from '@/lib/evaluation/expand-shared';

type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
type UseCase = Database['public']['Tables']['use_cases']['Row'];
type Evaluation = Database['public']['Tables']['evaluations']['Row'];
type EvaluationResult = Database['public']['Tables']['evaluation_results']['Row'];

export default function Home() {
  // Chat session state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showAllChats, setShowAllChats] = useState(false);

  // Right panel state
  const [selectedUseCaseId, setSelectedUseCaseId] = useState<string | null>(null);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
  const [showUseCaseModal, setShowUseCaseModal] = useState(false);

  // Canvas state
  const [canvasView, setCanvasView] = useState<'welcome' | 'evaluation' | 'summary'>('welcome');
  const [evaluationData, setEvaluationData] = useState<EvaluationResult | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Evaluation progress state
  const [runningEvaluationId, setRunningEvaluationId] = useState<string | null>(null);
  const [evaluationStates, setEvaluationStates] = useState<EvaluationState[]>([]);
  const [totalNodes, setTotalNodes] = useState(0);
  const [isEvaluationComplete, setIsEvaluationComplete] = useState(false);

  // Load chat sessions on mount and create default if none exist
  useEffect(() => {
    loadChatSessions();
  }, []);

  useEffect(() => {
    // Create default session if none exist
    if (chatSessions.length === 0 && !activeSessionId) {
      createNewSession();
    }
  }, [chatSessions.length]);

  // Load evaluation when selected
  useEffect(() => {
    if (selectedEvaluationId) {
      loadEvaluationResults(selectedEvaluationId);
    }
  }, [selectedEvaluationId]);

  const loadChatSessions = async () => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading chat sessions:', error);
    } else {
      setChatSessions(data || []);
      if (data && data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
      }
    }
  };

  const createNewSession = async () => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        title: 'New Chat',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
    } else {
      await loadChatSessions();
      setActiveSessionId(data.id);
    }
  };

  const loadEvaluationResults = async (evaluationId: string) => {
    // First get the evaluation metadata
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', evaluationId)
      .single();

    if (evalError) {
      console.error('Error loading evaluation:', evalError);
      setCanvasView('welcome');
      return;
    }

    // Then get the results (may not exist yet if evaluation is pending)
    const { data: results, error: resultsError } = await supabase
      .from('evaluation_results')
      .select('*')
      .eq('evaluation_id', evaluationId);

    if (resultsError) {
      console.error('Error loading evaluation results:', resultsError);
    }

    // Load PN data and expand shared requirements
    const pnIds = evaluation.pn_ids as string[];
    const allNodes: RequirementNode[] = [];
    let rootId = '';

    // First, collect all shared primitive IDs needed
    const sharedPrimitiveIds = new Set<string>();
    const pnDataList: PrescriptiveNorm[] = [];

    for (const pnId of pnIds) {
      try {
        const response = await fetch(`/data/prescriptive-norms/${pnId}.json`);
        if (response.ok) {
          const pnData: PrescriptiveNorm = await response.json();
          pnDataList.push(pnData);

          // Collect shared primitive IDs from shared_refs field
          if (pnData.shared_refs) {
            pnData.shared_refs.forEach(id => sharedPrimitiveIds.add(id));
          }

          if (pnIds.length === 1) {
            rootId = pnData.requirements.root;
          }
        }
      } catch (error) {
        console.error(`Error loading ${pnId}:`, error);
      }
    }

    // Load all shared primitives
    const sharedPrimitives: SharedPrimitive[] = [];
    for (const spId of Array.from(sharedPrimitiveIds)) {
      try {
        const spFileName = spId.replace(':', '-'); // qp:is_deployer -> qp-is_deployer
        const response = await fetch(`/data/prescriptive-norms/shared-primitives/${spFileName}.json`);
        if (response.ok) {
          const spData: SharedPrimitive = await response.json();
          sharedPrimitives.push(spData);
        }
      } catch (error) {
        console.error(`Error loading shared primitive ${spId}:`, error);
      }
    }

    // Now expand each PN's nodes with the shared primitives
    console.log('Loaded shared primitives:', sharedPrimitives.map(sp => sp.id));
    for (const pnData of pnDataList) {
      const expandedNodes = expandSharedRequirements(pnData.requirements.nodes, sharedPrimitives);
      console.log(`Expanded ${pnData.requirements.nodes.length} nodes to ${expandedNodes.length} nodes`);
      allNodes.push(...expandedNodes);
    }
    console.log('Total nodes after expansion:', allNodes.length);

    // Convert results to EvaluationState format
    const evaluationStates: EvaluationState[] = (results || []).map((result: any) => ({
      nodeId: result.node_id,
      status: 'completed' as const,
      result: {
        decision: result.decision,
        confidence: result.confidence || 0,
        reasoning: result.reasoning || '',
        citations: result.citations || [],
      },
    }));

    // Show evaluation view
    setEvaluationData({
      evaluation,
      nodes: allNodes,
      rootId,
      evaluationStates,
    } as any);
    setCanvasView('evaluation');
  };

  const runEvaluation = async (evaluationId: string, useCaseId: string, pnIds: string[]) => {
    try {
      setRunningEvaluationId(evaluationId);
      setEvaluationStates([]);
      setIsEvaluationComplete(false);

      // Load use case description
      const { data: useCase } = await supabase
        .from('use_cases')
        .select('*')
        .eq('id', useCaseId)
        .single();

      if (!useCase) throw new Error('Use case not found');

      // Load PN and shared primitives
      const pnDataList: PrescriptiveNorm[] = [];
      const sharedPrimitiveIds = new Set<string>();

      for (const pnId of pnIds) {
        const response = await fetch(`/data/prescriptive-norms/${pnId}.json`);
        if (response.ok) {
          const pnData: PrescriptiveNorm = await response.json();
          pnDataList.push(pnData);
          if (pnData.shared_refs) {
            pnData.shared_refs.forEach(id => sharedPrimitiveIds.add(id));
          }
        }
      }

      const sharedPrimitives: SharedPrimitive[] = [];
      for (const spId of Array.from(sharedPrimitiveIds)) {
        const spFileName = spId.replace(':', '-');
        const response = await fetch(`/data/prescriptive-norms/shared-primitives/${spFileName}.json`);
        if (response.ok) {
          const spData = await response.json();
          sharedPrimitives.push(spData);
        }
      }

      // Count total nodes for progress
      let totalNodeCount = 0;
      for (const pnData of pnDataList) {
        const expandedNodes = expandSharedRequirements(pnData.requirements.nodes, sharedPrimitives);
        totalNodeCount += expandedNodes.length;
      }
      setTotalNodes(totalNodeCount);

      // Start SSE stream
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId,
          prescriptiveNorm: pnDataList[0], // For now, just first PN
          sharedPrimitives,
          caseInput: `${useCase.title}\n\n${useCase.description}`,
        }),
      });

      if (!response.ok) throw new Error('Evaluation failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'progress') {
              setEvaluationStates(data.states);
              // Also update the grid view in real-time
              setEvaluationData((prev: any) => {
                if (prev && prev.evaluation?.id === evaluationId) {
                  return {
                    ...prev,
                    evaluationStates: data.states,
                  };
                }
                return prev;
              });
            } else if (data.type === 'complete') {
              // Save results to Supabase
              await supabase.from('evaluations').update({ status: 'completed' }).eq('id', evaluationId);

              for (const state of data.result.states) {
                if (state.result) {
                  await supabase.from('evaluation_results').insert({
                    evaluation_id: evaluationId,
                    node_id: state.nodeId,
                    decision: state.result.decision,
                    confidence: state.result.confidence,
                    reasoning: state.result.reasoning,
                    citations: state.result.citations || [],
                  });
                }
              }

              setIsEvaluationComplete(true);
              loadEvaluationResults(evaluationId);
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      setIsEvaluationComplete(true);
      await supabase.from('evaluations').update({ status: 'failed' }).eq('id', evaluationId);
    }
  };

  const handleSelectUseCase = (useCaseId: string) => {
    setSelectedUseCaseId(useCaseId);
    setSelectedEvaluationId(null);
    setShowUseCaseModal(true);
  };

  const handleSelectEvaluation = (evaluationId: string) => {
    setSelectedEvaluationId(evaluationId);
    setShowUseCaseModal(false);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Panel: Chat */}
      <div className="w-[500px] border-r border-neutral-200 flex flex-col">
        {/* Header */}
        <div className="border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
              Assistant
            </h2>
            <button
              onClick={createNewSession}
              className="text-xs px-3 py-1.5 bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors font-medium"
            >
              New Chat
            </button>
          </div>
        </div>

        {/* Chat History - Expandable */}
        {chatSessions.length > 1 && (
          <div className="border-b border-neutral-200">
            {/* Recent Chats Preview */}
            <div className="px-4 py-2 space-y-1">
              {chatSessions.slice(0, showAllChats ? chatSessions.length : 3).map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setShowAllChats(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                    activeSessionId === session.id
                      ? 'bg-neutral-900 text-white'
                      : 'hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate flex-1">{session.title}</span>
                    <span className={`text-[10px] ${
                      activeSessionId === session.id ? 'text-neutral-400' : 'text-neutral-400'
                    }`}>
                      {new Date(session.updated_at).toLocaleDateString('en', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Show More/Less Toggle */}
            {chatSessions.length > 3 && (
              <button
                onClick={() => setShowAllChats(!showAllChats)}
                className="w-full px-6 py-2 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1"
              >
                {showAllChats ? (
                  <>
                    <span>Show less</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>{chatSessions.length - 3} more chats</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Active Chat Interface */}
        <div className="flex-1 overflow-hidden">
          {activeSessionId ? (
            <ChatInterface sessionId={activeSessionId} />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* Center + Right: Main Content Area */}
      <div className="flex-1 flex flex-col bg-neutral-50 overflow-hidden">
        {/* Top Bar: Use Cases & Evaluations */}
        <div className="bg-white border-b border-neutral-200 px-6 py-3">
          <div className="flex items-center gap-6">
            {/* Use Cases Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Use Cases
              </span>
              <div className="flex gap-1 overflow-x-auto">
                <UseCasesPills
                  onSelectUseCase={handleSelectUseCase}
                  selectedUseCaseId={selectedUseCaseId}
                />
              </div>
            </div>

            {/* Evaluations Pills */}
            {selectedUseCaseId && (
              <>
                <div className="w-px h-4 bg-neutral-200" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Evaluations
                  </span>
                  <div className="flex gap-1 overflow-x-auto">
                    <EvaluationsPills
                      useCaseId={selectedUseCaseId}
                      onSelectEvaluation={handleSelectEvaluation}
                      selectedEvaluationId={selectedEvaluationId}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        {canvasView === 'welcome' && (
          <div className="flex items-center justify-center h-full p-12">
            <div className="text-center max-w-xl">
              <h2 className="text-3xl font-semibold text-neutral-900 mb-4 tracking-tight">
                EU AI Act Compliance Evaluator
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-8">
                Use the assistant to document AI systems and evaluate them against
                prescriptive norms from the EU AI Act. Results appear here.
              </p>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-white p-4 rounded-lg border border-neutral-200">
                  <div className="text-sm font-semibold text-neutral-900 mb-1">
                    Document Use Cases
                  </div>
                  <div className="text-xs text-neutral-600">
                    Describe your AI system to the assistant
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-neutral-200">
                  <div className="text-sm font-semibold text-neutral-900 mb-1">
                    Trigger Evaluations
                  </div>
                  <div className="text-xs text-neutral-600">
                    Check compliance against prescriptive norms
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {canvasView === 'evaluation' && evaluationData && (
          <>
            {/* Compact header */}
            <div className="bg-white border-b border-neutral-200 px-8 py-4 flex items-center gap-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                {(evaluationData as any).evaluation?.pn_ids?.join(', ')}
              </h2>
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                (evaluationData as any).evaluation?.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : (evaluationData as any).evaluation?.status === 'running'
                  ? 'bg-blue-100 text-blue-800'
                  : (evaluationData as any).evaluation?.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-neutral-100 text-neutral-800'
              }`}>
                {(evaluationData as any).evaluation?.status?.toUpperCase() || 'PENDING'}
              </div>
            </div>

            <div className="flex-1 overflow-auto p-8">
              <RequirementsGrid
                nodes={(evaluationData as any).nodes || []}
                rootId={(evaluationData as any).rootId || ''}
                evaluationStates={
                  // Use live states if we have them for this evaluation, otherwise use stored states
                  evaluationStates.length > 0 && (evaluationData as any).evaluation?.id
                    ? evaluationStates
                    : (evaluationData as any).evaluationStates || []
                }
                onNodeClick={setSelectedNodeId}
                selectedNodeId={selectedNodeId}
                isRunning={runningEvaluationId === (evaluationData as any).evaluation?.id && !isEvaluationComplete}
                totalNodes={totalNodes}
              />
            </div>
          </>
        )}

        {canvasView === 'summary' && selectedUseCaseId && (
          <div className="flex-1 overflow-auto p-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Use Case Summary
            </h2>
            <p className="text-neutral-600">
              Summary view showing all evaluations for this use-case will go here
            </p>
          </div>
        )}
      </div>

      {/* Use Case Modal */}
      {showUseCaseModal && selectedUseCaseId && (
        <UseCaseModal
          useCaseId={selectedUseCaseId}
          onClose={() => setShowUseCaseModal(false)}
          onSelectEvaluation={handleSelectEvaluation}
          onRunEvaluation={runEvaluation}
        />
      )}

      {/* Evaluation Progress */}
      {runningEvaluationId && (
        <EvaluationProgress
          evaluationId={runningEvaluationId}
          states={evaluationStates}
          totalNodes={totalNodes}
          isRunning={!isEvaluationComplete}
          onCancel={() => {
            // Just close the progress card, don't clear states
            setRunningEvaluationId(null);
          }}
        />
      )}
    </div>
  );
}

// Use Case Detail Modal
function UseCaseModal({
  useCaseId,
  onClose,
  onSelectEvaluation,
  onRunEvaluation,
}: {
  useCaseId: string;
  onClose: () => void;
  onSelectEvaluation: (id: string) => void;
  onRunEvaluation: (evaluationId: string, useCaseId: string, pnIds: string[]) => void;
}) {
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [availablePNs] = useState(['PN-04', 'PN-05', 'PN-06']); // TODO: Load from DB
  const [selectedPNs, setSelectedPNs] = useState<string[]>([]);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    loadUseCase();
    loadEvaluations();

    const subscription = supabase
      .channel(`use_case_modal_${useCaseId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evaluations', filter: `use_case_id=eq.${useCaseId}` }, () => {
        loadEvaluations();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [useCaseId]);

  const loadUseCase = async () => {
    const { data } = await supabase.from('use_cases').select('*').eq('id', useCaseId).single();
    setUseCase(data);
  };

  const loadEvaluations = async () => {
    const { data } = await supabase.from('evaluations').select('*').eq('use_case_id', useCaseId).order('triggered_at', { ascending: false });
    setEvaluations(data || []);
  };

  const triggerEvaluation = async () => {
    if (selectedPNs.length === 0) return;
    setTriggering(true);

    const { data, error } = await supabase
      .from('evaluations')
      .insert({
        use_case_id: useCaseId,
        pn_ids: selectedPNs,
        status: 'pending',
      })
      .select()
      .single();

    setTriggering(false);

    if (!error && data) {
      setSelectedPNs([]);
      // Run the evaluation with progress tracking
      onRunEvaluation(data.id, useCaseId, selectedPNs);
      // Immediately show the evaluation in the canvas
      onSelectEvaluation(data.id);
    }
  };

  const getStatusColor = (status: Evaluation['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  if (!useCase) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-neutral-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">{useCase.title}</h2>
            <p className="text-sm text-neutral-600">{useCase.description}</p>
            {useCase.tags && useCase.tags.length > 0 && (
              <div className="flex gap-2 mt-3">
                {useCase.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 ml-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Trigger New Evaluation */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">
              Trigger New Evaluation
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-600 mb-2 block">
                  Select Prescriptive Norms to Evaluate:
                </label>
                <div className="flex flex-wrap gap-2">
                  {availablePNs.map((pn) => (
                    <button
                      key={pn}
                      onClick={() => {
                        setSelectedPNs(prev =>
                          prev.includes(pn) ? prev.filter(p => p !== pn) : [...prev, pn]
                        );
                      }}
                      className={`text-xs px-3 py-2 rounded border transition-colors ${
                        selectedPNs.includes(pn)
                          ? 'bg-neutral-900 text-white border-neutral-900'
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
                className="w-full px-4 py-2 bg-neutral-900 text-white rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {triggering ? 'Triggering...' : `Trigger Evaluation (${selectedPNs.length} selected)`}
              </button>
            </div>
          </div>

          {/* Existing Evaluations */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">
              Evaluations ({evaluations.length})
            </h3>
            {evaluations.length === 0 ? (
              <p className="text-sm text-neutral-500 italic">No evaluations yet</p>
            ) : (
              <div className="space-y-2">
                {evaluations.map((evaluation) => (
                  <button
                    key={evaluation.id}
                    onClick={() => {
                      onSelectEvaluation(evaluation.id);
                    }}
                    className="w-full text-left p-3 rounded border border-neutral-200 hover:border-neutral-900 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-neutral-700">
                        {evaluation.pn_ids.join(', ')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(evaluation.status)}`}>
                        {evaluation.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500">
                      {new Date(evaluation.triggered_at).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact Pills Component for Use Cases
function UseCasesPills({
  onSelectUseCase,
  selectedUseCaseId,
}: {
  onSelectUseCase: (id: string) => void;
  selectedUseCaseId: string | null;
}) {
  const [useCases, setUseCases] = useState<UseCase[]>([]);

  useEffect(() => {
    loadUseCases();
    const subscription = supabase
      .channel('use_cases_pills')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'use_cases' }, () => {
        loadUseCases();
      })
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUseCases = async () => {
    const { data } = await supabase.from('use_cases').select('*').order('created_at', { ascending: false });
    setUseCases(data || []);
  };

  if (useCases.length === 0) {
    return <span className="text-xs text-neutral-400 italic">No use cases yet</span>;
  }

  return (
    <>
      {useCases.map((uc) => (
        <button
          key={uc.id}
          onClick={() => onSelectUseCase(uc.id)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors whitespace-nowrap ${
            selectedUseCaseId === uc.id
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-900'
          }`}
        >
          {uc.title}
        </button>
      ))}
    </>
  );
}

// Compact Pills Component for Evaluations
function EvaluationsPills({
  useCaseId,
  onSelectEvaluation,
  selectedEvaluationId,
}: {
  useCaseId: string | null;
  onSelectEvaluation: (id: string) => void;
  selectedEvaluationId: string | null;
}) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    if (!useCaseId) {
      setEvaluations([]);
      return;
    }
    loadEvaluations();
    const subscription = supabase
      .channel(`evaluations_pills_${useCaseId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evaluations', filter: `use_case_id=eq.${useCaseId}` }, () => {
        loadEvaluations();
      })
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [useCaseId]);

  const loadEvaluations = async () => {
    if (!useCaseId) return;
    const { data } = await supabase.from('evaluations').select('*').eq('use_case_id', useCaseId).order('triggered_at', { ascending: false });
    setEvaluations(data || []);
  };

  if (evaluations.length === 0) {
    return <span className="text-xs text-neutral-400 italic">No evaluations yet</span>;
  }

  const getStatusColor = (status: Evaluation['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50 text-green-700';
      case 'running':
        return 'border-blue-500 bg-blue-50 text-blue-700';
      case 'failed':
        return 'border-red-500 bg-red-50 text-red-700';
      default:
        return 'border-neutral-300 bg-neutral-50 text-neutral-700';
    }
  };

  return (
    <>
      {evaluations.map((evaluation) => (
        <button
          key={evaluation.id}
          onClick={() => onSelectEvaluation(evaluation.id)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors whitespace-nowrap ${
            selectedEvaluationId === evaluation.id
              ? 'bg-neutral-900 text-white border-neutral-900'
              : getStatusColor(evaluation.status)
          }`}
        >
          {evaluation.pn_ids.join(', ')}
        </button>
      ))}
    </>
  );
}
