'use client';

/**
 * Use Case Cockpit Page (PN-Centric View)
 *
 * 2-column layout:
 * - Left: Chat interface (same as main page)
 * - Right: PN-centric cockpit showing:
 *   - Which prescriptive norms APPLY (require action)
 *   - Which prescriptive norms DO NOT APPLY
 *   - Which prescriptive norms are PENDING evaluation
 *   - Inline TREEMAXX expansion for detailed view
 *   - Collapsible evaluation history
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { RequirementsGrid } from '@/components/evaluation/RequirementsGrid';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import type { PrescriptiveNorm, SharedPrimitive, RequirementNode, EvaluationState } from '@/lib/evaluation/types';
import { expandSharedRequirements } from '@/lib/evaluation/expand-shared';

type UseCase = Database['public']['Tables']['use_cases']['Row'];
type Evaluation = Database['public']['Tables']['evaluations']['Row'];
type EvaluationResult = Database['public']['Tables']['evaluation_results']['Row'];
type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];

interface PNStatus {
  pnId: string;
  article: string;
  title: string;
  status: 'applies' | 'not-applicable' | 'pending';
  evaluationId?: string;
  evaluatedAt?: string;
  rootDecision?: boolean;
  progressCurrent?: number;
  progressTotal?: number;
}

export default function UseCaseCockpitPage() {
  const router = useRouter();
  const params = useParams();
  const useCaseId = params.id as string;

  // Chat state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showAllChats, setShowAllChats] = useState(false);

  // Use case state
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(true);

  // PN catalog and status
  const [availablePNs, setAvailablePNs] = useState<any[]>([]);
  const [pnStatuses, setPNStatuses] = useState<PNStatus[]>([]);
  const [selectedPNs, setSelectedPNs] = useState<string[]>([]);
  const [triggering, setTriggering] = useState(false);

  // Expanded PN state
  const [expandedPNId, setExpandedPNId] = useState<string | null>(null);
  const [expandedPNData, setExpandedPNData] = useState<any>(null);

  // Evaluation history
  const [showHistory, setShowHistory] = useState(false);
  const [evaluationHistory, setEvaluationHistory] = useState<Evaluation[]>([]);

  // Load chat sessions
  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = async () => {
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (data) {
      setChatSessions(data);
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
      }
    }
  };

  const createNewSession = async () => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ title: 'New Chat' })
      .select()
      .single();

    if (!error && data) {
      await loadChatSessions();
      setActiveSessionId(data.id);
    }
  };

  // Load PN catalog
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/catalog');
        if (res.ok) {
          const data = await res.json();
          const pns = data?.prescriptive_norms || [];
          setAvailablePNs(pns);
        }
      } catch (e) {
        console.warn('[Catalog] Failed to load PN catalog');
        setAvailablePNs([{ id: 'PN-04', article: '4', title: 'AI Literacy' }]);
      }
    })();
  }, []);

  // Load use case and evaluations
  useEffect(() => {
    if (!useCaseId) return;
    loadUseCaseAndEvaluations();

    // Real-time subscription
    const subscription = supabase
      .channel(`usecase_cockpit_${useCaseId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evaluations', filter: `use_case_id=eq.${useCaseId}` }, () => {
        loadUseCaseAndEvaluations();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [useCaseId]);

  const loadUseCaseAndEvaluations = async () => {
    setLoading(true);

    // Load use case
    const { data: useCaseData, error: ucError } = await supabase
      .from('use_cases')
      .select('*')
      .eq('id', useCaseId)
      .single();

    if (ucError || !useCaseData) {
      console.error('Error loading use case:', ucError);
      router.push('/');
      return;
    }
    setUseCase(useCaseData);

    // Load all evaluations for this use case
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select('*')
      .eq('use_case_id', useCaseId)
      .order('triggered_at', { ascending: false });

    setEvaluationHistory(evaluations || []);

    // Build PN status map
    await buildPNStatusMap(evaluations || []);
    setLoading(false);
  };

  const buildPNStatusMap = async (evaluations: Evaluation[]) => {
    const statusMap = new Map<string, PNStatus>();

    // Initialize all available PNs as pending
    for (const pn of availablePNs) {
      statusMap.set(pn.id, {
        pnId: pn.id,
        article: pn.article || pn.id.replace('PN-', ''),
        title: pn.title || pn.id,
        status: 'pending'
      });
    }

    // Update with evaluation results
    for (const evaluation of evaluations) {
      const pnIds = evaluation.pn_ids as string[];

      // Only process completed evaluations
      if (evaluation.status !== 'completed') continue;

      // For each PN in this evaluation
      for (const pnId of pnIds) {
        // Load evaluation results
        const { data: results } = await supabase
          .from('evaluation_results')
          .select('*')
          .eq('evaluation_id', evaluation.id);

        if (!results || results.length === 0) continue;

        // Load PN data to get root node ID
        const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${encodeURIComponent(pnId)}`);
        if (!bundleRes.ok) continue;

        const bundle = await bundleRes.json();
        const pnData = bundle.pns?.[0];
        if (!pnData) continue;

        const rootId = pnData.requirements.root;

        // Find root node result
        const rootResult = results.find((r: any) => r.node_id === rootId);

        if (rootResult) {
          const primitiveCount = pnData.requirements.nodes.filter((n: any) => n.kind === 'primitive').length;
          const completedCount = results.filter((r: any) => {
            const node = pnData.requirements.nodes.find((n: any) => n.id === r.node_id);
            return node?.kind === 'primitive';
          }).length;

          statusMap.set(pnId, {
            pnId,
            article: availablePNs.find(p => p.id === pnId)?.article || pnId.replace('PN-', ''),
            title: availablePNs.find(p => p.id === pnId)?.title || pnId,
            status: rootResult.decision ? 'applies' : 'not-applicable',
            evaluationId: evaluation.id,
            evaluatedAt: evaluation.triggered_at,
            rootDecision: rootResult.decision,
            progressCurrent: completedCount,
            progressTotal: primitiveCount
          });
        }
      }
    }

    setPNStatuses(Array.from(statusMap.values()));
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
        setSelectedPNs([]);
        // Navigate to main page to run evaluation
        router.push(`/?evaluation=${data.id}`);
      }
    } catch (error) {
      console.error('Failed to trigger evaluation:', error);
      alert('Failed to trigger evaluation');
    } finally {
      setTriggering(false);
    }
  };

  const evaluateAllPending = async () => {
    const pendingPNs = pnStatuses.filter(p => p.status === 'pending').map(p => p.pnId);
    if (pendingPNs.length === 0) return;

    setSelectedPNs(pendingPNs);
    // Trigger after a brief delay to let state update
    setTimeout(() => triggerEvaluation(), 100);
  };

  const handleExpandPN = async (pnId: string) => {
    if (expandedPNId === pnId) {
      setExpandedPNId(null);
      setExpandedPNData(null);
      return;
    }

    const pnStatus = pnStatuses.find(p => p.pnId === pnId);
    if (!pnStatus || !pnStatus.evaluationId) return;

    // Load full evaluation data
    const { data: evaluation } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', pnStatus.evaluationId)
      .single();

    const { data: results } = await supabase
      .from('evaluation_results')
      .select('*')
      .eq('evaluation_id', pnStatus.evaluationId);

    const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${encodeURIComponent(pnId)}`);
    const bundle = await bundleRes.json();
    const pnData = bundle.pns[0];
    const sharedPrimitives = bundle.sharedPrimitives || [];

    const expandedNodes = expandSharedRequirements(pnData.requirements.nodes, sharedPrimitives);
    const evaluationStates: EvaluationState[] = (results || []).map((result: any) => ({
      nodeId: result.node_id,
      status: 'completed' as const,
      result: {
        nodeId: result.node_id,
        decision: result.decision,
        confidence: result.confidence || 0,
        reasoning: result.reasoning || '',
        citations: result.citations || [],
      },
    }));

    setExpandedPNData({
      evaluation,
      nodes: expandedNodes,
      rootId: pnData.requirements.root,
      evaluationStates,
    });
    setExpandedPNId(pnId);
  };

  const appliesPNs = pnStatuses.filter(p => p.status === 'applies');
  const notApplicablePNs = pnStatuses.filter(p => p.status === 'not-applicable');
  const pendingPNs = pnStatuses.filter(p => p.status === 'pending');

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
    <div className="flex h-screen bg-white">
      {/* Left Panel: Chat (same as main page) */}
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

        {/* Chat History */}
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

      {/* Right Panel: Use Case Cockpit */}
      <div className="flex-1 flex flex-col bg-neutral-50 overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-white border-b border-neutral-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm px-3 py-1.5 text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Link>
              <div className="text-sm text-neutral-400">/</div>
              <h3 className="text-sm font-semibold text-neutral-900">
                {useCase.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
            {/* Use Case Header */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h1 className="text-xl font-bold text-neutral-900 mb-2">
                {useCase.title}
              </h1>
              <p className="text-neutral-600 leading-relaxed">
                {useCase.description}
              </p>
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

            {/* Dashboard Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                <div className="text-xs text-green-700 uppercase tracking-wide mb-1">Obligations Apply</div>
                <div className="text-2xl font-bold text-green-700">{appliesPNs.length}</div>
              </div>
              <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
                <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Not Applicable</div>
                <div className="text-2xl font-bold text-neutral-700">{notApplicablePNs.length}</div>
              </div>
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <div className="text-xs text-blue-700 uppercase tracking-wide mb-1">Pending Evaluation</div>
                <div className="text-2xl font-bold text-blue-700">{pendingPNs.length}</div>
              </div>
            </div>

            {/* APPLIES Table */}
            {appliesPNs.length > 0 && (
              <PNTable
                title="✓ OBLIGATIONS THAT APPLY - Action Required"
                pns={appliesPNs}
                expandedPNId={expandedPNId}
                expandedPNData={expandedPNData}
                onExpandPN={handleExpandPN}
                type="applies"
              />
            )}

            {/* NOT APPLICABLE Table */}
            {notApplicablePNs.length > 0 && (
              <PNTable
                title="✗ OBLIGATIONS THAT DO NOT APPLY"
                pns={notApplicablePNs}
                expandedPNId={expandedPNId}
                expandedPNData={expandedPNData}
                onExpandPN={handleExpandPN}
                type="not-applicable"
              />
            )}

            {/* PENDING Table */}
            {pendingPNs.length > 0 && (
              <PNTable
                title="○ PENDING EVALUATION"
                pns={pendingPNs}
                expandedPNId={expandedPNId}
                expandedPNData={expandedPNData}
                onExpandPN={handleExpandPN}
                type="pending"
              />
            )}

            {/* Trigger Evaluation Section */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Evaluate Prescriptive Norms
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-3 block">
                    Select Prescriptive Norms to Evaluate:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availablePNs.map((pn) => (
                      <button
                        key={pn.id}
                        onClick={() => {
                          setSelectedPNs(prev =>
                            prev.includes(pn.id)
                              ? prev.filter(p => p !== pn.id)
                              : [...prev, pn.id]
                          );
                        }}
                        className={`text-sm px-4 py-2 rounded-lg border transition-all ${
                          selectedPNs.includes(pn.id)
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-900'
                        }`}
                      >
                        {pn.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={triggerEvaluation}
                    disabled={selectedPNs.length === 0 || triggering}
                    className="px-6 py-3 bg-neutral-900 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {triggering
                      ? 'Triggering...'
                      : `Trigger Selected ${selectedPNs.length > 0 ? `(${selectedPNs.length})` : ''}`}
                  </button>
                  {pendingPNs.length > 0 && (
                    <button
                      onClick={evaluateAllPending}
                      disabled={triggering}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Evaluate All Pending ({pendingPNs.length})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Evaluation History */}
            {evaluationHistory.length > 0 && (
              <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
                    Evaluation History ({evaluationHistory.length} runs)
                  </h3>
                  <svg
                    className={`w-4 h-4 text-neutral-500 transition-transform ${showHistory ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showHistory && (
                  <div className="border-t border-neutral-200 p-6">
                    <div className="space-y-2">
                      {evaluationHistory.map((evaluation) => (
                        <div
                          key={evaluation.id}
                          className="flex items-center justify-between p-3 rounded border border-neutral-200 hover:border-neutral-900 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-neutral-900">
                              {(evaluation.pn_ids as string[]).join(', ')}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {new Date(evaluation.triggered_at).toLocaleString('en', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            evaluation.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : evaluation.status === 'running'
                              ? 'bg-blue-100 text-blue-700'
                              : evaluation.status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {evaluation.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// PN Table Component
function PNTable({
  title,
  pns,
  expandedPNId,
  expandedPNData,
  onExpandPN,
  type
}: {
  title: string;
  pns: PNStatus[];
  expandedPNId: string | null;
  expandedPNData: any;
  onExpandPN: (pnId: string) => void;
  type: 'applies' | 'not-applicable' | 'pending';
}) {
  const getBorderColor = () => {
    if (type === 'applies') return 'border-green-200';
    if (type === 'not-applicable') return 'border-neutral-200';
    return 'border-blue-200';
  };

  const getHeaderBg = () => {
    if (type === 'applies') return 'bg-green-50';
    if (type === 'not-applicable') return 'bg-neutral-50';
    return 'bg-blue-50';
  };

  return (
    <div className={`bg-white rounded-lg border ${getBorderColor()} overflow-hidden`}>
      <div className={`px-6 py-3 ${getHeaderBg()} border-b ${getBorderColor()}`}>
        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
          {title}
        </h3>
      </div>

      <div className="divide-y divide-neutral-100">
        {pns.map((pn) => {
          const isExpanded = expandedPNId === pn.pnId;

          return (
            <div key={pn.pnId}>
              {/* Row */}
              <button
                onClick={() => onExpandPN(pn.pnId)}
                disabled={pn.status === 'pending'}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors text-left disabled:cursor-default disabled:hover:bg-transparent"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-sm font-mono font-semibold text-neutral-900">
                    {pn.pnId}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Art. {pn.article}
                  </div>
                  <div className="text-sm text-neutral-900 flex-1">
                    {pn.title}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {pn.evaluatedAt && (
                    <div className="text-xs text-neutral-500">
                      {new Date(pn.evaluatedAt).toLocaleDateString('en', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  )}

                  {pn.progressCurrent !== undefined && pn.progressTotal && (
                    <div className="text-xs text-neutral-600">
                      {pn.progressCurrent}/{pn.progressTotal}
                    </div>
                  )}

                  {pn.status !== 'pending' && (
                    <svg
                      className={`w-4 h-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Expanded TREEMAXX View */}
              {isExpanded && expandedPNData && (
                <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-6">
                  <RequirementsGrid
                    nodes={expandedPNData.nodes || []}
                    rootId={expandedPNData.rootId || ''}
                    evaluationStates={expandedPNData.evaluationStates || []}
                    onNodeClick={() => {}}
                    selectedNodeId={null}
                    isRunning={false}
                    totalNodes={expandedPNData.nodes?.filter((n: any) => n.kind === 'primitive').length || 0}
                    evaluationStatus={expandedPNData.evaluation?.status}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
