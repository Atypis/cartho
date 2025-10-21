'use client';

/**
 * Main Application Page (Redesigned - No More Modal!)
 *
 * Layout:
 * - Left: Chat sessions management + active chat
 * - Right: Main canvas (evaluation results, welcome screen)
 * - Top: Breadcrumb navigation (Use Cases button → links to dedicated page)
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { RequirementsGrid } from '@/components/evaluation/RequirementsGrid';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { UseCaseCockpit } from '@/components/usecase/UseCaseCockpit';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import type { PrescriptiveNorm, SharedPrimitive, EvaluationState, RequirementNode } from '@/lib/evaluation/types';
import { expandSharedRequirements } from '@/lib/evaluation/expand-shared';

type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
type UseCase = Database['public']['Tables']['use_cases']['Row'];
type Evaluation = Database['public']['Tables']['evaluations']['Row'];
type EvaluationResult = Database['public']['Tables']['evaluation_results']['Row'];

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Chat session state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showAllChats, setShowAllChats] = useState(false);
  const [showUseCasesList, setShowUseCasesList] = useState(false);
  const [useCases, setUseCases] = useState<UseCase[]>([]);

  // Canvas state
  const [canvasView, setCanvasView] = useState<'welcome' | 'evaluation' | 'usecase-cockpit'>('welcome');
  const [evaluationData, setEvaluationData] = useState<EvaluationResult | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
  const [selectedUseCaseId, setSelectedUseCaseId] = useState<string | null>(null);

  // NEW: Concurrent evaluation support with Map-based state
  const [runningEvaluations, setRunningEvaluations] = useState<Set<string>>(new Set());
  const [evaluationStatesMap, setEvaluationStatesMap] = useState<Map<string, EvaluationState[]>>(new Map());
  const [totalNodesMap, setTotalNodesMap] = useState<Map<string, number>>(new Map());

  // Handle query params for routing from use case page
  useEffect(() => {
    const evaluationParam = searchParams.get('evaluation');
    if (evaluationParam && evaluationParam !== selectedEvaluationId) {
      console.log(`🔗 [Route] Query param evaluation: ${evaluationParam}`);
      setSelectedEvaluationId(evaluationParam);

      // Check if we need to run this evaluation
      supabase
        .from('evaluations')
        .select('*')
        .eq('id', evaluationParam)
        .single()
        .then(({ data }) => {
          if (data && data.status === 'pending') {
            // This is a new evaluation that needs to be run
            runEvaluation(data.id, data.use_case_id, data.pn_ids as string[]);
          }
        });
    }
  }, [searchParams]);

  // Restore persisted state on mount
  useEffect(() => {
    console.log('🔄 [Persistence] Restoring state from localStorage...');
    try {
      const persistedEvaluationId = localStorage.getItem('selectedEvaluationId');

      if (persistedEvaluationId) {
        console.log(`✅ [Persistence] Restored evaluation: ${persistedEvaluationId}`);
        setSelectedEvaluationId(persistedEvaluationId);
      }
    } catch (error) {
      console.error('❌ [Persistence] Error restoring state:', error);
    }
  }, []);

  // Load chat sessions and use cases on mount
  useEffect(() => {
    loadChatSessions();
    loadUseCases();
  }, []);

  useEffect(() => {
    // Create default session if none exist
    if (chatSessions.length === 0 && !activeSessionId) {
      createNewSession();
    }
  }, [chatSessions.length]);

  // Persist selectedEvaluationId to localStorage
  useEffect(() => {
    if (selectedEvaluationId) {
      console.log(`💾 [Persistence] Saving evaluation: ${selectedEvaluationId}`);
      localStorage.setItem('selectedEvaluationId', selectedEvaluationId);
    } else {
      console.log('🗑️ [Persistence] Clearing evaluation from localStorage');
      localStorage.removeItem('selectedEvaluationId');
    }
  }, [selectedEvaluationId]);

  // Load evaluation when selected
  useEffect(() => {
    if (selectedEvaluationId) {
      loadEvaluationResults(selectedEvaluationId);
    }
  }, [selectedEvaluationId]);

  const loadChatSessions = async () => {
    console.log('📂 [Sessions] Loading chat sessions...');
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ [Sessions] Error loading chat sessions:', error);
      } else {
        console.log(`✅ [Sessions] Loaded ${data?.length || 0} sessions`);
        setChatSessions(data || []);
        if (data && data.length > 0 && !activeSessionId) {
          setActiveSessionId(data[0].id);
        }
      }
    } catch (error) {
      console.error('❌ [Sessions] Exception loading chat sessions:', error);
    }
  };

  const loadUseCases = async () => {
    const { data } = await supabase
      .from('use_cases')
      .select('*')
      .order('created_at', { ascending: false });
    setUseCases(data || []);
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
    console.log(`📊 [Load] Loading evaluation ${evaluationId}...`);

    // First get the evaluation metadata
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', evaluationId)
      .single();

    if (evalError) {
      console.error('❌ [Load] Error loading evaluation:', evalError);
      console.log('🗑️ [Load] Clearing invalid evaluation from state and localStorage');
      setSelectedEvaluationId(null);
      setCanvasView('welcome');
      return;
    }

    console.log(`✅ [Load] Evaluation metadata loaded (status: ${evaluation.status})`);

    // Then get the results
    const { data: results, error: resultsError } = await supabase
      .from('evaluation_results')
      .select('*')
      .eq('evaluation_id', evaluationId);

    if (resultsError) {
      console.error('❌ [Load] Error loading evaluation results:', resultsError);
    } else {
      console.log(`✅ [Load] Loaded ${results?.length || 0} evaluation results`);
    }

    // Load PN data and expand shared requirements
    const pnIds = evaluation.pn_ids as string[];
    const allNodes: RequirementNode[] = [];
    let rootId = '';

    const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${encodeURIComponent(pnIds.join(','))}`);
    if (!bundleRes.ok) throw new Error('Failed to load PN bundle');
    const bundle = await bundleRes.json();
    const pnDataList: PrescriptiveNorm[] = bundle.pns || [];
    const sharedPrimitives: SharedPrimitive[] = bundle.sharedPrimitives || [];

    if (pnIds.length === 1 && pnDataList[0]) {
      rootId = pnDataList[0].requirements.root;
    }

    for (const pnData of pnDataList) {
      const expandedNodes = expandSharedRequirements(pnData.requirements.nodes, sharedPrimitives);
      allNodes.push(...expandedNodes);
    }

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

    // Count total primitive nodes
    const primitiveCount = allNodes.filter(node => node.kind === 'primitive').length;
    setTotalNodesMap(prev => new Map(prev).set(evaluationId, primitiveCount));

    // Store states in map
    setEvaluationStatesMap(prev => new Map(prev).set(evaluationId, evaluationStates));

    // Show evaluation view
    setEvaluationData({
      evaluation,
      nodes: allNodes,
      rootId,
      evaluationStates,
    } as any);
    setCanvasView('evaluation');
    console.log('✅ [Load] Evaluation loaded successfully');
  };

  const runEvaluation = async (evaluationId: string, useCaseId: string, pnIds: string[]) => {
    try {
      console.log(`🚀 [Run] Starting evaluation ${evaluationId}...`);

      // Navigate to evaluation view and set it as selected
      setSelectedEvaluationId(evaluationId);
      setCanvasView('evaluation');

      // Add to running set
      setRunningEvaluations(prev => new Set(prev).add(evaluationId));
      setEvaluationStatesMap(prev => new Map(prev).set(evaluationId, []));

      // Load use case description
      const { data: useCase } = await supabase
        .from('use_cases')
        .select('*')
        .eq('id', useCaseId)
        .single();

      if (!useCase) throw new Error('Use case not found');

      // Load PN bundle
      const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${encodeURIComponent(pnIds.join(','))}`);
      if (!bundleRes.ok) throw new Error('Failed to load PN bundle');
      const bundle = await bundleRes.json();
      const pnDataList: PrescriptiveNorm[] = bundle.pns || [];
      const sharedPrimitives: SharedPrimitive[] = bundle.sharedPrimitives || [];

      // Build nodes array and count PRIMITIVE nodes for progress
      const allNodes: any[] = [];
      let rootId = '';
      let totalNodeCount = 0;

      if (pnIds.length === 1 && pnDataList[0]) {
        rootId = pnDataList[0].requirements.root;
      }

      for (const pnData of pnDataList) {
        const expandedNodes = expandSharedRequirements(pnData.requirements.nodes, sharedPrimitives);
        allNodes.push(...expandedNodes);
        totalNodeCount += expandedNodes.filter(n => n.kind === 'primitive').length;
      }

      setTotalNodesMap(prev => new Map(prev).set(evaluationId, totalNodeCount));
      console.log(`📊 Total primitive nodes to evaluate: ${totalNodeCount}`);

      // Load evaluation metadata
      const { data: evaluation, error: evalError } = await supabase
        .from('evaluations')
        .select('*')
        .eq('id', evaluationId)
        .single();

      if (evalError) {
        console.error('❌ [Run] Error loading evaluation:', evalError);
        throw new Error('Failed to load evaluation metadata');
      }

      // Set up evaluation data structure for display (with empty states initially)
      setEvaluationData({
        evaluation,
        nodes: allNodes,
        rootId,
        evaluationStates: [],
      } as any);

      console.log(`📊 [Run] Evaluation view initialized with ${allNodes.length} nodes`);

      // Start SSE stream
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId,
          prescriptiveNorm: pnDataList[0],
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
              // Update states map for this specific evaluation
              setEvaluationStatesMap(prev => new Map(prev).set(evaluationId, data.states));

              // Also update grid view if this is the currently displayed evaluation
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
              console.log('✅ [Evaluation] Complete! Saving results...');
              console.log(`📊 [Save] Total states received: ${data.result.states.length}`);

              // Log evaluation details before update
              console.log(`🔍 [Save] About to update evaluation:`, {
                evaluationId,
                evaluationIdType: typeof evaluationId,
                updatePayload: {
                  status: 'completed',
                  completed_at: new Date().toISOString()
                }
              });

              // Save results to Supabase
              const { error: updateError } = await supabase.from('evaluations').update({
                status: 'completed',
                completed_at: new Date().toISOString()
              }).eq('id', evaluationId);

              if (updateError) {
                console.error('❌ [Save] Error updating evaluation status:', {
                  raw: updateError,
                  stringified: JSON.stringify(updateError),
                  message: updateError?.message,
                  code: updateError?.code,
                  details: updateError?.details,
                  hint: updateError?.hint,
                  // Extract ALL properties (including non-enumerable)
                  allProperties: Object.getOwnPropertyNames(updateError),
                  allDescriptors: Object.getOwnPropertyDescriptors(updateError),
                  constructor: updateError?.constructor?.name,
                  toString: updateError?.toString(),
                  typeof: typeof updateError,
                });
                console.error('❌ [Save] Full error object:', updateError);
              } else {
                console.log('✅ [Save] Evaluation status updated to completed');
              }

              let savedCount = 0;
              let skippedCount = 0;

              for (const state of data.result.states) {
                if (state.result) {
                  console.log(`💾 [Save] Inserting result for node: ${state.nodeId}`, {
                    decision: state.result.decision,
                    confidence: state.result.confidence
                  });

                  const { error: insertError } = await supabase.from('evaluation_results').insert({
                    evaluation_id: evaluationId,
                    node_id: state.nodeId,
                    decision: state.result.decision,
                    confidence: state.result.confidence,
                    reasoning: state.result.reasoning,
                    citations: state.result.citations || [],
                  });

                  if (insertError) {
                    console.error(`❌ [Save] Error inserting result for ${state.nodeId}:`, insertError);
                  } else {
                    savedCount++;
                  }
                } else {
                  console.warn(`⚠️ [Save] Skipping state ${state.nodeId} - no result`);
                  skippedCount++;
                }
              }

              console.log(`✅ [Save] Saved ${savedCount} results, skipped ${skippedCount}`);
              setRunningEvaluations(prev => {
                const next = new Set(prev);
                next.delete(evaluationId);
                return next;
              });

              // Reload to show final results
              loadEvaluationResults(evaluationId);
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ [Evaluation] Error:', error);
      setRunningEvaluations(prev => {
        const next = new Set(prev);
        next.delete(evaluationId);
        return next;
      });
      alert('Evaluation failed: ' + (error as Error).message);
      await supabase.from('evaluations').update({ status: 'failed' }).eq('id', evaluationId);
    }
  };

  const handleViewEvaluation = (evaluationId: string) => {
    console.log(`👁️ [View] Navigating to evaluation ${evaluationId}`);

    // Clear old evaluation data first to prevent showing stale data
    setEvaluationData(null);
    setSelectedNodeId(null);

    // Set the new evaluation ID and switch view
    setSelectedEvaluationId(evaluationId);
    setCanvasView('evaluation');

    // loadEvaluationResults will be called automatically by the useEffect
  };

  // Get breadcrumb items based on current view
  const getBreadcrumbItems = () => {
    const items = [];

    if (canvasView === 'evaluation' && evaluationData) {
      const eval_data = evaluationData as any;
      items.push(
        { label: 'Evaluations', href: '/' },
        { label: eval_data.evaluation?.pn_ids?.join(', ') || 'Evaluation' }
      );
    }

    return items;
  };

  const currentEvaluationStates = selectedEvaluationId
    ? evaluationStatesMap.get(selectedEvaluationId) || []
    : [];

  const currentTotalNodes = selectedEvaluationId
    ? totalNodesMap.get(selectedEvaluationId) || 0
    : 0;

  const isCurrentEvaluationRunning = selectedEvaluationId
    ? runningEvaluations.has(selectedEvaluationId)
    : false;

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
                    <span className="text-[10px] text-neutral-400">
                      {new Date(session.updated_at).toLocaleDateString('en', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </button>
              ))}
            </div>

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

      {/* Right Panel: Main Content Area */}
      <div className="flex-1 flex flex-col bg-neutral-50 overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-neutral-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {canvasView === 'evaluation' ? (
                <>
                  {/* Back button from evaluation */}
                  <button
                    onClick={() => {
                      // If evaluation has a use_case_id, return to that use case's cockpit
                      const useCaseId = (evaluationData as any)?.evaluation?.use_case_id;
                      if (useCaseId) {
                        console.log(`🔙 [Nav] Returning to use case cockpit: ${useCaseId}`);
                        setSelectedUseCaseId(useCaseId);
                        setCanvasView('usecase-cockpit');
                      } else {
                        console.log(`🔙 [Nav] Returning to welcome screen`);
                        setCanvasView('welcome');
                      }
                      setSelectedEvaluationId(null);
                      setEvaluationData(null);
                    }}
                    className="text-sm px-3 py-1.5 text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                  </button>
                  <Breadcrumb items={getBreadcrumbItems()} />
                </>
              ) : canvasView === 'usecase-cockpit' ? (
                <>
                  {/* Back button from use case cockpit */}
                  <button
                    onClick={() => {
                      setCanvasView('welcome');
                      setSelectedUseCaseId(null);
                      setEvaluationData(null);
                      setSelectedEvaluationId(null);
                    }}
                    className="text-sm px-3 py-1.5 text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                  </button>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {useCases.find(uc => uc.id === selectedUseCaseId)?.title || 'Use Case Cockpit'}
                  </h3>
                </>
              ) : (
                <h3 className="text-sm font-semibold text-neutral-900">
                  EU AI Act Compliance Evaluator
                </h3>
              )}
            </div>

            {/* Use Cases Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUseCasesList(!showUseCasesList)}
                className="text-xs px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors font-medium flex items-center gap-2"
              >
                Use Cases
                <svg
                  className={`w-3 h-3 transition-transform ${showUseCasesList ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {showUseCasesList && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border border-neutral-200 shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {useCases.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-neutral-500">
                        No use cases yet. Create one in the chat!
                      </div>
                    ) : (
                      useCases.map((useCase) => (
                        <button
                          key={useCase.id}
                          onClick={() => {
                            setSelectedUseCaseId(useCase.id);
                            setCanvasView('usecase-cockpit');
                            setShowUseCasesList(false);
                          }}
                          className="block w-full text-left px-3 py-2 rounded hover:bg-neutral-50 transition-colors"
                        >
                          <div className="text-sm font-medium text-neutral-900 mb-1">
                            {useCase.title}
                          </div>
                          <div className="text-xs text-neutral-500 line-clamp-2">
                            {useCase.description}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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

        {canvasView === 'evaluation' && (
          <>
            {evaluationData ? (
              <>
                {/* Evaluation Header */}
                <div className="bg-white border-b border-neutral-200 px-8 py-4 flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    {(evaluationData as any).evaluation?.pn_ids?.join(', ')}
                  </h2>
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    (evaluationData as any).evaluation?.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : (evaluationData as any).evaluation?.status === 'running' || isCurrentEvaluationRunning
                      ? 'bg-blue-100 text-blue-800'
                      : (evaluationData as any).evaluation?.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-neutral-100 text-neutral-800'
                  }`}>
                    {isCurrentEvaluationRunning
                      ? 'RUNNING'
                      : (evaluationData as any).evaluation?.status?.toUpperCase() || 'PENDING'}
                  </div>
                </div>

                {/* Evaluation Content */}
                <div className="flex-1 overflow-auto p-8">
                  <RequirementsGrid
                    nodes={(evaluationData as any).nodes || []}
                    rootId={(evaluationData as any).rootId || ''}
                    evaluationStates={
                      currentEvaluationStates.length > 0
                        ? currentEvaluationStates
                        : (evaluationData as any).evaluationStates || []
                    }
                    onNodeClick={setSelectedNodeId}
                    selectedNodeId={selectedNodeId}
                    isRunning={isCurrentEvaluationRunning}
                    totalNodes={currentTotalNodes}
                    evaluationStatus={(evaluationData as any).evaluation?.status}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-lg font-semibold text-neutral-900 mb-2">
                    Loading evaluation...
                  </div>
                  <div className="text-sm text-neutral-500">
                    Please wait while we load the evaluation data
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {canvasView === 'usecase-cockpit' && selectedUseCaseId && (
          <UseCaseCockpit
            useCaseId={selectedUseCaseId}
            onTriggerEvaluation={runEvaluation}
            onViewEvaluation={handleViewEvaluation}
          />
        )}
      </div>
    </div>
  );
}
