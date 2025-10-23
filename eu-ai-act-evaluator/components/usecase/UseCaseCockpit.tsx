'use client';

/**
 * Use Case Cockpit Component (PN-Centric View)
 *
 * Displays prescriptive norms categorized by applicability:
 * - Which PNs APPLY (require action)
 * - Which PNs DO NOT APPLY
 * - Which PNs are PENDING evaluation
 *
 * Includes inline TREEMAXX expansion and evaluation history
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RequirementsGrid } from '@/components/evaluation/RequirementsGrid';
import { TaskRow } from '@/components/usecase/TaskRow';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import type { EvaluationState } from '@/lib/evaluation/types';
import { expandSharedRequirements } from '@/lib/evaluation/expand-shared';
import { reconstructEvaluation } from '@/lib/evaluation/reconstruct';

type UseCase = Database['public']['Tables']['use_cases']['Row'];
type Evaluation = Database['public']['Tables']['evaluations']['Row'];

interface PNStatus {
  pnId: string;
  article: string;
  title: string;
  status: 'applies' | 'not-applicable' | 'pending' | 'evaluating';
  evaluationId?: string;
  evaluatedAt?: string;
  rootDecision?: boolean;
  progressCurrent?: number;
  progressTotal?: number;
}

interface Group {
  id: string;
  title: string;
  article: string;
  description: string;
  effective_date: string;
  shared_gates: string[];
  members: string[];
}

interface UseCaseCockpitProps {
  useCaseId: string;
  onTriggerEvaluation: (evaluationId: string, useCaseId: string, pnIds: string[]) => void;
  onViewEvaluation: (evaluationId: string) => void;
}

export function UseCaseCockpit({ useCaseId, onTriggerEvaluation, onViewEvaluation }: UseCaseCockpitProps) {
  const router = useRouter();
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // For background reloads without skeleton

  // Description editing
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');

  // PN catalog and status
  const [groups, setGroups] = useState<Group[]>([]);
  const [availablePNs, setAvailablePNs] = useState<any[]>([]);
  const [ungroupedPNs, setUngroupedPNs] = useState<any[]>([]);
  const [sharedPrimitives, setSharedPrimitives] = useState<any[]>([]);
  const [pnStatuses, setPNStatuses] = useState<PNStatus[]>([]);
  const [selectedPNs, setSelectedPNs] = useState<string[]>([]);
  const [triggering, setTriggering] = useState(false);

  // Focus Mode during batch evaluation
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [batchEvaluationProgress, setBatchEvaluationProgress] = useState({
    current: 0,
    total: 0,
    currentTaskId: '',
  });

  // Tab system for IDE-style inspector (multiple open PNs)
  const [openTabs, setOpenTabs] = useState<string[]>([]); // Array of open PN IDs
  const [activeTab, setActiveTab] = useState<string | null>(null); // Currently visible tab
  const [tabData, setTabData] = useState<Map<string, any>>(new Map()); // Cache data for each tab

  // Ref to track current activeTab (for SSE handler closure)
  const activeTabRef = useRef<string | null>(activeTab);
  // Ref to track current openTabs (avoid stale captures inside SSE loop)
  const openTabsRef = useRef<string[]>(openTabs);
  // Helper: politely auto-follow current PN when no tab chosen by user
  const politelyActivateTab = (pnId: string) => {
    if (!activeTabRef.current) {
      setActiveTab(pnId);
    }
  };

  // Evaluation history
  const [showHistory, setShowHistory] = useState(false);
  const [evaluationHistory, setEvaluationHistory] = useState<Evaluation[]>([]);

  // Running evaluations (inline cockpit mode)
  const [runningEvaluations, setRunningEvaluations] = useState<Set<string>>(new Set());
  const [evaluationProgress, setEvaluationProgress] = useState<Map<string, { current: number, total: number }>>(new Map());
  const [evaluationBundles, setEvaluationBundles] = useState<Map<string, any>>(new Map()); // Cache bundles to avoid repeated fetches
  const [evaluationStatesMap, setEvaluationStatesMap] = useState<Map<string, EvaluationState[]>>(new Map()); // Live states from SSE streams
  const [livePNStatusMap, setLivePNStatusMap] = useState<Map<string, PNStatus>>(new Map());
  const [pnSelectedNodeMap, setPnSelectedNodeMap] = useState<Map<string, string | null>>(new Map());
  const pnSelectedNodeMapRef = useRef(pnSelectedNodeMap);

  // Coalesced reload control to avoid duplicate expensive reloads
  const reloadTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reloadInFlightRef = useRef(false);
  const reloadQueuedRef = useRef(false);

  const performReload = async (isInitialLoad = false) => {
    if (reloadInFlightRef.current) {
      reloadQueuedRef.current = true;
      return;
    }
    reloadInFlightRef.current = true;
    try {
      await loadUseCaseAndEvaluations(isInitialLoad);
    } finally {
      reloadInFlightRef.current = false;
      if (reloadQueuedRef.current) {
        reloadQueuedRef.current = false;
        // run again immediately to process the queued request
        performReload(false); // Subsequent reloads are never initial
      }
    }
  };

  const scheduleReload = (reason: string, delay = 150) => {
    if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    reloadTimerRef.current = setTimeout(() => {
      // console.log(`♻️  [Reload] ${reason}`);
      performReload();
    }, delay);
  };

  // Keep activeTab ref in sync with state (for SSE handler closure)
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    openTabsRef.current = openTabs;
  }, [openTabs]);

  useEffect(() => {
    pnSelectedNodeMapRef.current = pnSelectedNodeMap;
  }, [pnSelectedNodeMap]);

  // Reset live overlays when switching use cases
  useEffect(() => {
    setLivePNStatusMap(new Map());
    setEvaluationStatesMap(new Map());
    setPnSelectedNodeMap(new Map());
  }, [useCaseId]);

  // Load PN catalog
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/catalog');
        if (res.ok) {
          const data = await res.json();
          console.log('[Catalog] Loaded catalog:', {
            groups: data.groups?.length || 0,
            grouped_pns: data.grouped_pns?.length || 0,
            ungrouped_pns: data.ungrouped_pns?.length || 0
          });

          setGroups(data.groups || []);
          setAvailablePNs(data.all_pns || data.prescriptive_norms || []);
          setUngroupedPNs(data.ungrouped_pns || []);
          setSharedPrimitives(data.shared_primitives || []);
        }
      } catch (e) {
        console.warn('[Catalog] Failed to load PN catalog');
        setAvailablePNs([{ id: 'PN-04', article: '4', title: 'AI Literacy' }]);
        setUngroupedPNs([{ id: 'PN-04', article: '4', title: 'AI Literacy' }]);
      }
    })();
  }, []);

  // Load use case and evaluations
  useEffect(() => {
    console.log(`🏗️ [Cockpit] Component mounted/updated for use case: ${useCaseId}, availablePNs: ${availablePNs.length}`);
    if (!useCaseId) return;
    loadUseCaseAndEvaluations(true); // Initial load

    // Real-time subscription
    const subscription = supabase
      .channel(`usecase_cockpit_${useCaseId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evaluations', filter: `use_case_id=eq.${useCaseId}` }, () => {
        console.log('🔄 [Cockpit] Evaluation changed, scheduling reload...');
        scheduleReload('realtime-evaluations-change', 120);
      })
      .subscribe();

    return () => {
      console.log(`🧹 [Cockpit] Cleanup for use case: ${useCaseId}`);
      subscription.unsubscribe();
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    };
  }, [useCaseId, availablePNs.length]); // Add availablePNs.length to re-trigger when catalog loads

  const loadUseCaseAndEvaluations = async (isInitialLoad = false) => {
    console.log(`📂 [Cockpit] loadUseCaseAndEvaluations called for use case: ${useCaseId}, isInitialLoad: ${isInitialLoad}`);
    console.log(`📂 [Cockpit] Available PNs count: ${availablePNs.length}`);

    if (availablePNs.length === 0) {
      console.log('⚠️ [Cockpit] Waiting for PN catalog to load...');
      // Wait for catalog to load
      return;
    }

    // Only show skeleton on initial load; use isRefreshing for background updates
    if (isInitialLoad) {
      setLoading(true);
      console.log(`🔄 [Cockpit] Initial load - showing skeleton...`);
    } else {
      setIsRefreshing(true);
      console.log(`🔄 [Cockpit] Background refresh - keeping UI visible...`);
    }

    // Load use case
    const { data: useCaseData, error: ucError } = await supabase
      .from('use_cases')
      .select('*')
      .eq('id', useCaseId)
      .single();

    if (ucError || !useCaseData) {
      console.error('Error loading use case:', ucError);
      setLoading(false);
      setIsRefreshing(false);
      return;
    }
    setUseCase(useCaseData);

    // Load all evaluations for this use case
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select('*')
      .eq('use_case_id', useCaseId)
      .order('triggered_at', { ascending: false });

    console.log(`📊 [Cockpit] Loaded ${evaluations?.length || 0} evaluations for use case`);

    setEvaluationHistory(evaluations || []);

    // Build PN status map (OPTIMIZED)
    console.log(`🔨 [Cockpit] About to call buildPNStatusMapOptimized...`);
    await buildPNStatusMapOptimized(evaluations || []);
    console.log(`✅ [Cockpit] buildPNStatusMapOptimized completed`);
    setLoading(false);
    setIsRefreshing(false);
  };

  const buildPNStatusMapOptimized = async (evaluations: Evaluation[]) => {
    const statusMap = new Map<string, PNStatus>();
    const nextRunningEvaluations = new Set<string>();

    console.log(`🔍 [Cockpit] Building PN status map from ${evaluations.length} evaluations`);

    // Initialize all available PNs as pending
    for (const pn of availablePNs) {
      statusMap.set(pn.id, {
        pnId: pn.id,
        article: pn.article || pn.id.replace('PN-', ''),
        title: pn.title || pn.id,
        status: 'pending'
      });
    }

    // First, mark PNs in running evaluations as "evaluating"
    const runningEvals = evaluations.filter(e => e.status === 'running');
    console.log(`⟳ [Cockpit] Found ${runningEvals.length} running evaluations`);

    for (const evaluation of runningEvals) {
      nextRunningEvaluations.add(evaluation.id);

      const pnIds = evaluation.pn_ids as string[];
      const progress = evaluationProgress.get(evaluation.id);

      for (const pnId of pnIds) {
        const existing = statusMap.get(pnId);
        if (existing) {
          statusMap.set(pnId, {
            ...existing,
            status: 'evaluating',
            evaluationId: evaluation.id,
            progressCurrent: progress?.current,
            progressTotal: progress?.total,
          });
        }
      }

    }

    // Process evaluations that have either completed or have results we can replay
    const evaluationsToProcess = evaluations.filter(e => e.status === 'completed' || e.status === 'running');
    console.log(`📊 [Cockpit] Processing ${evaluationsToProcess.length} evaluations for status derivation`);

    for (const evaluation of evaluationsToProcess) {
      const pnIds = evaluation.pn_ids as string[];
      console.log(`📊 [Cockpit] Processing evaluation ${evaluation.id} for PNs: ${pnIds.join(', ')}`);

      // Load all results for this evaluation at once
      const { data: results, error: resultsError } = await supabase
        .from('evaluation_results')
        .select('*')
        .eq('evaluation_id', evaluation.id);

      console.log(`📦 [Cockpit] Loaded ${results?.length || 0} results for evaluation ${evaluation.id}`);
      if (results && results.length > 0) {
        console.log(`📝 [Cockpit] Sample result node_ids:`, results.slice(0, 3).map((r: any) => r.node_id));
      }

      if (resultsError) {
        console.warn(`⚠️ [Cockpit] Failed to load results for evaluation ${evaluation.id}`);
        continue;
      }

      try {
        const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${encodeURIComponent(pnIds.join(','))}`);
        if (!bundleRes.ok) {
          console.warn(`[Cockpit] Failed to load bundle for ${pnIds.join(',')}`);
          continue;
        }

        const bundle = await bundleRes.json();
        const pnDataList = bundle.pns || [];
        const sharedPrimitives = bundle.sharedPrimitives || [];

        let evaluationFullyResolved = true;

        for (let i = 0; i < pnIds.length; i += 1) {
          const pnId = pnIds[i];
          const pnData = pnDataList[i];

          if (!pnData) {
            console.warn(`[Cockpit] No PN data for ${pnId}`);
            continue;
          }

          if (!results || results.length === 0) {
            evaluationFullyResolved = false;
            continue;
          }

          const reconstruction = reconstructEvaluation(pnData, sharedPrimitives, results ?? []);

          const primitiveTotal = reconstruction.primitiveTotal;
          const primitiveResolved = reconstruction.primitiveResolved;
          const rootDecision = reconstruction.rootDecision;

          const pnResolved = rootDecision !== null && (primitiveTotal === 0 || primitiveResolved === primitiveTotal);
          if (!pnResolved) {
            evaluationFullyResolved = false;
          }

          if (primitiveTotal === 0) {
            console.warn(`⚠️ [Cockpit] PN ${pnId} has no primitive nodes after expansion`);
          }

          const status = pnResolved
            ? (rootDecision ? 'applies' : 'not-applicable')
            : 'evaluating';

          console.log(
            `🎯 [Cockpit] Setting ${pnId} status to: ${status} (${primitiveResolved}/${primitiveTotal})`
          );

          statusMap.set(pnId, {
            pnId,
            article: availablePNs.find(p => p.id === pnId)?.article || pnId.replace('PN-', ''),
            title: availablePNs.find(p => p.id === pnId)?.title || pnId,
            status,
            evaluationId: evaluation.id,
            evaluatedAt: evaluation.triggered_at,
            rootDecision: rootDecision ?? undefined,
            progressCurrent: primitiveResolved,
            progressTotal: primitiveTotal,
          });
        }

        if (evaluation.status === 'running' && evaluationFullyResolved) {
          console.log(`✅ [Cockpit] Evaluation ${evaluation.id} resolved via reconstruction`);
          nextRunningEvaluations.delete(evaluation.id);
        }
      } catch (error) {
        console.error('[Cockpit] Error processing evaluation:', error);
      }
    }

    const mergedStatusMap = new Map(statusMap);
    livePNStatusMap.forEach((liveStatus, pnId) => {
      mergedStatusMap.set(pnId, liveStatus);
      if (liveStatus.evaluationId && liveStatus.status !== 'evaluating') {
        nextRunningEvaluations.delete(liveStatus.evaluationId);
      }
    });

    setRunningEvaluations(nextRunningEvaluations);
    setEvaluationProgress(prev => {
      const next = new Map(prev);
      for (const key of Array.from(next.keys())) {
        if (!nextRunningEvaluations.has(key)) {
          next.delete(key);
        }
      }
      return next;
    });

    const orderedStatuses: PNStatus[] = availablePNs.map(pn => {
      const status = mergedStatusMap.get(pn.id);
      if (status) return status;
      return {
        pnId: pn.id,
        article: pn.article || pn.id.replace('PN-', ''),
        title: pn.title || pn.id,
        status: 'pending',
      };
    });

    setPNStatuses(orderedStatuses);
  };

  const publishLiveStatus = (pnStatus: PNStatus) => {
    setLivePNStatusMap(prev => {
      const next = new Map(prev);
      next.set(pnStatus.pnId, pnStatus);
      return next;
    });

    if (availablePNs.length === 0) {
      return;
    }

    setPNStatuses(prev => {
      const statusMap = new Map(prev.map(status => [status.pnId, status]));
      statusMap.set(pnStatus.pnId, pnStatus);

      return availablePNs.map(pn => {
        const status = statusMap.get(pn.id);
        if (status) return status;
        return {
          pnId: pn.id,
          article: pn.article || pn.id.replace('PN-', ''),
          title: pn.title || pn.id,
          status: 'pending',
        };
      });
    });
  };

  const saveDescription = async (newDescription: string) => {
    const { error } = await supabase
      .from('use_cases')
      .update({ description: newDescription })
      .eq('id', useCaseId);

    if (error) {
      console.error('Error updating description:', error);
      alert('Failed to save description');
      return false;
    }

    // Update local state
    if (useCase) {
      setUseCase({ ...useCase, description: newDescription });
    }
    return true;
  };

  const setPNSelection = (pnId: string, nodeId: string | null) => {
    setPnSelectedNodeMap(prev => {
      const current = prev.get(pnId) ?? null;
      if (current === nodeId) {
        return prev;
      }
      const next = new Map(prev);
      next.set(pnId, nodeId);
      return next;
    });
  };

  // Helper: Check if all PNs in a bundle have identical requirements (are a group)
  const areRequirementsIdentical = (pns: any[]): boolean => {
    if (pns.length <= 1) return false;

    const firstRoot = pns[0]?.requirements?.root;
    if (!firstRoot) return false;

    // Compare root node IDs - if identical, requirements are shared
    return pns.every(pn => pn?.requirements?.root === firstRoot);
  };

  const autoSelectFromStates = (pnId: string, states: EvaluationState[], fallback?: string | null) => {
    const evaluatingState = states.find(state => state.status === 'evaluating');
    if (evaluatingState) {
      if ((pnSelectedNodeMapRef.current.get(pnId) ?? null) !== evaluatingState.nodeId) {
        setPNSelection(pnId, evaluatingState.nodeId);
      }
      return;
    }

    if (fallback !== undefined) {
      if ((pnSelectedNodeMapRef.current.get(pnId) ?? null) !== fallback) {
        setPNSelection(pnId, fallback);
      }
    }
  };

  const handleNodeSelection = (pnId: string, nodeId: string | null) => {
    setPNSelection(pnId, nodeId);
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
        // Trigger evaluation via parent callback
        onTriggerEvaluation(data.id, useCaseId, selectedPNs);
      }
    } catch (error: any) {
      console.error('Failed to trigger evaluation:', {
        raw: error,
        stringified: JSON.stringify(error),
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      alert(`Failed to trigger evaluation: ${error?.message || 'Unknown error'}`);
    } finally {
      setTriggering(false);
    }
  };

  const evaluateAllPending = async () => {
    const pendingPNs = pnStatuses.filter(p => p.status === 'pending').map(p => p.pnId);
    if (pendingPNs.length === 0) return;

    setSelectedPNs(pendingPNs);
    setTimeout(() => triggerEvaluation(), 100);
  };

  // Poll for evaluation progress
  const startPollingEvaluation = (evaluationId: string) => {
    console.log(`🔄 [Polling] Starting poll for evaluation ${evaluationId}`);

    // Pre-load bundle once and cache it
    let bundleCache: any = null;

    const pollInterval = setInterval(async () => {
      try {
        // Fetch evaluation status
        const { data: evaluation, error } = await supabase
          .from('evaluations')
          .select('*')
          .eq('id', evaluationId)
          .single();

        if (error) throw error;
        if (!evaluation) return;

        console.log(`🔄 [Polling] Evaluation ${evaluationId} status: ${evaluation.status}`);

        // Calculate progress from evaluation_results (API now writes to DB!)
        const { data: results, error: resultsError } = await supabase
          .from('evaluation_results')
          .select('node_id')
          .eq('evaluation_id', evaluationId);

        if (!resultsError && results) {
          const pnIds = evaluation.pn_ids as string[];

          // Load bundle ONCE and cache (avoid fetching 100+ times)
          if (!bundleCache) {
            const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${encodeURIComponent(pnIds.join(','))}`);
            if (bundleRes.ok) {
              bundleCache = await bundleRes.json();
              console.log(`📦 [Polling] Cached bundle for evaluation ${evaluationId}`);
            }
          }

          if (bundleCache) {
            // Count total primitive nodes across all PNs (AFTER expanding shared requirements)
            let totalPrimitives = 0;
            for (const pnData of bundleCache.pns) {
              if (pnData?.requirements?.nodes) {
                // Expand shared requirements BEFORE counting (same as buildPNStatusMapOptimized)
                const expandedNodes = expandSharedRequirements(pnData.requirements.nodes, bundleCache.sharedPrimitives || []);
                const primitives = expandedNodes.filter((n: any) => n.kind === 'primitive');
                totalPrimitives += primitives.length;
              }
            }

            const completedCount = results.length;

            console.log(`📊 [Polling] Progress: ${completedCount}/${totalPrimitives} (${results.length} results in DB)`);

            setEvaluationProgress(prev => {
              const newMap = new Map(prev);
              newMap.set(evaluationId, {
                current: completedCount,
                total: totalPrimitives
              });
              return newMap;
            });
          }
        }

        // If completed or failed, stop polling
        if (evaluation.status === 'completed' || evaluation.status === 'failed') {
          console.log(`✅ [Polling] Evaluation ${evaluationId} finished with status: ${evaluation.status}`);
          clearInterval(pollInterval);
          setRunningEvaluations(prev => {
            const newSet = new Set(prev);
            newSet.delete(evaluationId);
            return newSet;
          });
          setEvaluationProgress(prev => {
            const newMap = new Map(prev);
            newMap.delete(evaluationId);
            return newMap;
          });

          // Reload to update UI
          await loadUseCaseAndEvaluations();
        }
      } catch (error) {
        console.error(`❌ [Polling] Error polling evaluation ${evaluationId}:`, error);
      }
    }, 1000); // Poll every second

    // Cleanup on unmount
    return () => clearInterval(pollInterval);
  };

  // Run evaluation INLINE (stay on cockpit)
  const runInlineEvaluation = async (pnIds: string[]) => {
    if (pnIds.length === 0) return;
    if (!useCase) return;

    setTriggering(true);
    try {
      // Create evaluation record
      const { data: evaluation, error: evalError } = await supabase
        .from('evaluations')
        .insert({
          use_case_id: useCaseId,
          pn_ids: pnIds,
          status: 'pending',
        })
        .select()
        .single();

      if (evalError) throw evalError;
      if (!evaluation) throw new Error('Failed to create evaluation');

      console.log(`🚀 [Inline Eval] Starting evaluation ${evaluation.id} for ${pnIds.length} PNs`);

      // Add to running evaluations immediately
      setRunningEvaluations(prev => new Set(prev).add(evaluation.id));

      // Update status to 'running' in database
      await supabase
        .from('evaluations')
        .update({ status: 'running' })
        .eq('id', evaluation.id);

      // Load PN bundle
      const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${encodeURIComponent(pnIds.join(','))}`);
      if (!bundleRes.ok) {
        throw new Error('Failed to load PN bundle');
      }
      const bundle = await bundleRes.json();

      // ✅ GROUP DETECTION: Check if all PNs share identical requirements (are a group)
      // If yes, evaluate only once and propagate results to all members
      const isGroup = pnIds.length > 1 && areRequirementsIdentical(bundle.pns);

      if (isGroup) {
        console.log(`📦 [Group Eval] Detected group with ${pnIds.length} members sharing identical requirements`);
        console.log(`📦 [Group Eval] Will evaluate once and propagate to all members`);
      }

      // ✅ Sequential evaluation to avoid overwhelming SSE streams
      // (Previously: unbounded concurrency caused UI blank/freeze)
      const pnsToEvaluate = isGroup ? [bundle.pns[0]] : bundle.pns; // Only evaluate first PN if group
      const evaluationIndices = isGroup ? [0] : pnIds.map((_, i) => i); // Track which indices to process

      console.log(`📋 [Inline Eval] Starting SEQUENTIAL evaluation of ${pnsToEvaluate.length} obligation(s)...`);
      if (isGroup) {
        console.log(`📋 [Inline Eval] Group mode: will replicate results to ${pnIds.length} members`);
      }

      for (let idx = 0; idx < evaluationIndices.length; idx++) {
        const i = evaluationIndices[idx];
        const pnId = pnIds[i];
        const pnData = bundle.pns[i];

        if (!pnData) {
          console.warn(`⚠️ [Inline Eval] No data for ${pnId}, skipping`);
          continue;
        }

        console.log(`🎯 [Inline Eval] [${i + 1}/${pnIds.length}] Starting evaluation for ${pnId}`);

        const expandedNodes = expandSharedRequirements(pnData.requirements.nodes, bundle.sharedPrimitives || []);
        const primitiveNodes = expandedNodes.filter((n: any) => n.kind === 'primitive');
        const primitiveNodeIds = new Set(primitiveNodes.map((node: any) => node.id));
        const totalPrimitiveNodes = primitiveNodes.length;
        const pnMeta = availablePNs.find(p => p.id === pnId);
        const pnArticle = pnMeta?.article || pnId.replace('PN-', '');
        const pnTitle = pnMeta?.title || pnId;

        try {
          // Start SSE stream
          const response = await fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prescriptiveNorm: pnData,
              sharedPrimitives: bundle.sharedPrimitives || [],
              caseInput: useCase.description,
              evaluationId: evaluation.id,
            }),
          });

          if (!response.ok) throw new Error(`Evaluation failed for ${pnId}`);

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) throw new Error(`No response body for ${pnId}`);

          console.log(`📡 [SSE] Stream started for ${pnId}`);

          // Read SSE stream
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log(`📡 [SSE] Stream ended for ${pnId}`);
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = JSON.parse(line.slice(6));

                if (data.type === 'progress') {
                  const states = data.states as EvaluationState[];
                  const resolvedCount = states.reduce((count, state) => {
                    if (!primitiveNodeIds.has(state.nodeId)) return count;
                    if (state.status === 'completed' || state.status === 'skipped') {
                      return count + 1;
                    }
                    return count;
                  }, 0);

                  console.log(`📊 [SSE Progress] ${pnId}: ${resolvedCount}/${totalPrimitiveNodes}`);

                  // ✅ ALWAYS cache states in memory (even if PN not expanded)
                  setEvaluationStatesMap(prev => {
                    const next = new Map(prev);
                    next.set(pnId, states);
                    return next;
                  });

                  setEvaluationProgress(prev => {
                    const next = new Map(prev);
                    next.set(evaluation.id, {
                      current: resolvedCount,
                      total: totalPrimitiveNodes,
                    });
                    return next;
                  });

                  publishLiveStatus({
                    pnId,
                    article: pnArticle,
                    title: pnTitle,
                    status: 'evaluating',
                    evaluationId: evaluation.id,
                    progressCurrent: resolvedCount,
                    progressTotal: totalPrimitiveNodes,
                  });

                  autoSelectFromStates(pnId, states);

                  // Ensure the inspector follows the currently evaluated PN
                  // In batch mode (multiple PNs), keep only ONE tab open to avoid DOM bloat
                  const isBatchMode = pnIds.length > 1;

                  if (!openTabsRef.current.includes(pnId)) {
                    // Load data directly and open tab without relying on pnStatuses
                    await loadExpandedPNData(pnId, evaluation.id);

                    if (isBatchMode) {
                      // ✅ Batch mode: REPLACE tabs (keep only current PN)
                      setOpenTabs([pnId]);
                      setActiveTab(pnId);
                      console.log(`📑 [Batch Tab] Switched to ${pnId} (replacing tabs)`);
                    } else {
                      // Single evaluation: accumulate tabs
                      setOpenTabs(prev => (prev.includes(pnId) ? prev : [...prev, pnId]));
                      politelyActivateTab(pnId);
                    }
                  } else {
                    // Tab already open, just activate it
                    if (isBatchMode) {
                      setActiveTab(pnId);
                    } else {
                      politelyActivateTab(pnId);
                    }
                  }

                  // If this PN has an open tab, update its tree live (using ref to avoid stale closure)
                  if (openTabsRef.current.includes(pnId)) {
                    setTabData(prev => {
                      const next = new Map(prev);
                      next.set(pnId, {
                        evaluation,
                        nodes: expandedNodes,
                        rootId: pnData.requirements.root,
                        evaluationStates: states,
                      });
                      return next;
                    });
                  }
                } else if (data.type === 'complete') {
                  console.log(`✅ [SSE Complete] ${pnId}: Evaluation finished`);

                  // Remove from running evaluations
                  setRunningEvaluations(prev => {
                    const next = new Set(prev);
                    next.delete(evaluation.id);
                    return next;
                  });

                  // Clear progress tracking
                  setEvaluationProgress(prev => {
                    const next = new Map(prev);
                    next.delete(evaluation.id);
                    return next;
                  });

                  const finalStates: EvaluationState[] = (data.result?.states || []) as EvaluationState[];
                  const statesForPN = finalStates.length > 0 ? finalStates : (evaluationStatesMap.get(pnId) || []);

                  if (statesForPN.length > 0) {
                    setEvaluationStatesMap(prev => {
                      const next = new Map(prev);
                      next.set(pnId, statesForPN);
                      return next;
                    });
                  }

                  const resolvedCount = statesForPN.reduce((count, state) => {
                    if (!primitiveNodeIds.has(state.nodeId)) return count;
                    if (state.status === 'completed' || state.status === 'skipped') {
                      return count + 1;
                    }
                    return count;
                  }, 0);

                  const rootState = statesForPN.find(s => s.nodeId === pnData.requirements.root);
                  const rootDecision = rootState?.result?.decision;

                  const finalStatusType: PNStatus['status'] = rootDecision === true
                    ? 'applies'
                    : rootDecision === false
                      ? 'not-applicable'
                      : 'evaluating';

                  publishLiveStatus({
                    pnId,
                    article: pnArticle,
                    title: pnTitle,
                    status: finalStatusType,
                    evaluationId: evaluation.id,
                    evaluatedAt: new Date().toISOString(),
                    rootDecision: rootDecision ?? undefined,
                    progressCurrent: resolvedCount,
                    progressTotal: totalPrimitiveNodes,
                  });

                  // ✅ GROUP PROPAGATION: If this is a group evaluation, propagate results to all members
                  if (isGroup) {
                    console.log(`📦 [Group Propagation] Propagating result to ${pnIds.length} group members`);

                    for (const memberPnId of pnIds) {
                      if (memberPnId === pnId) continue; // Skip the one we just evaluated

                      const memberMeta = availablePNs.find(p => p.id === memberPnId);
                      const memberArticle = memberMeta?.article || memberPnId.replace('PN-', '');
                      const memberTitle = memberMeta?.title || memberPnId;

                      // Publish the same status for this member
                      publishLiveStatus({
                        pnId: memberPnId,
                        article: memberArticle,
                        title: memberTitle,
                        status: finalStatusType,
                        evaluationId: evaluation.id,
                        evaluatedAt: new Date().toISOString(),
                        rootDecision: rootDecision ?? undefined,
                        progressCurrent: resolvedCount,
                        progressTotal: totalPrimitiveNodes,
                      });

                      // Cache states for this member too
                      setEvaluationStatesMap(prev => {
                        const next = new Map(prev);
                        next.set(memberPnId, statesForPN);
                        return next;
                      });

                      console.log(`📦 [Group Propagation] ✅ ${memberPnId}: ${finalStatusType}`);
                    }
                  }

                  autoSelectFromStates(pnId, statesForPN, pnData.requirements.root);

                  // Keep focus on the PN tab if it's open and no other tab was explicitly chosen
                  politelyActivateTab(pnId);

                  // Ensure any open inspector tab reflects the final state as soon as it arrives
                  if (openTabsRef.current.includes(pnId)) {
                    setTabData(prev => {
                      const next = new Map(prev);
                      next.set(pnId, {
                        evaluation,
                        nodes: expandedNodes,
                        rootId: pnData.requirements.root,
                        evaluationStates: statesForPN,
                      });
                      return next;
                    });
                  }

                  // ❌ REMOVED: Per-PN completion reload (caused UI blank during batch)
                  // scheduleReload('sse-complete', 300);
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              }
            }
          }
        } catch (error) {
          console.error(`❌ [Inline Eval] Error evaluating ${pnId}:`, error);
          // Continue to next PN even if this one fails
        }
      }

      console.log(`✅ [Inline Eval] All ${pnIds.length} evaluations completed sequentially`);

      // Clear selection
      setSelectedPNs([]);

      // Single reload after all evaluations complete
      scheduleReload('batch-complete', 500);

    } catch (error: any) {
      console.error('Failed to run inline evaluation:', error);
      alert(`Failed to start evaluation: ${error?.message || 'Unknown error'}`);

      // Remove from running on error
      setRunningEvaluations(prev => {
        const newSet = new Set(prev);
        newSet.delete(error.evaluationId);
        return newSet;
      });
    } finally {
      setTriggering(false);
    }
  };

  // Individual PN handlers
  const handleTogglePN = (pnId: string) => {
    setSelectedPNs(prev =>
      prev.includes(pnId)
        ? prev.filter(id => id !== pnId)
        : [...prev, pnId]
    );
  };

  const handleEvaluateSelectedPNs = async () => {
    if (selectedPNs.length === 0) return;
    await runInlineEvaluation(selectedPNs);
  };

  const handleEvaluateAllPendingPNs = async (pnIds: string[]) => {
    await runInlineEvaluation(pnIds);
  };

  // Group evaluation handler
  const handleEvaluateGroup = async (groupId: string, pnIds: string[]) => {
    await runInlineEvaluation(pnIds);
  };

  // Handler for viewing individual PN from group
  const handleViewPN = async (pnId: string, evaluationId?: string) => {
    if (!evaluationId) {
      console.warn(`[Cockpit] Cannot view ${pnId}: no evaluationId`);
      return;
    }

    // Expand the PN to show its evaluation tree
    await handleExpandPN(pnId);
  };

  // Tab management functions
  const openTab = async (pnId: string) => {
    const pnStatus = pnStatuses.find(p => p.pnId === pnId);
    if (!pnStatus || !pnStatus.evaluationId) {
      console.warn(`[Cockpit] Cannot open ${pnId}: no evaluationId`);
      return;
    }

    // If tab already open, just switch to it
    if (openTabs.includes(pnId)) {
      setActiveTab(pnId);
      return;
    }

    console.log(`[Cockpit] Opening tab for ${pnId}...`);

    // Load data for this tab
    await loadExpandedPNData(pnId, pnStatus.evaluationId);

    // Add to tabs and make it active
    setOpenTabs(prev => [...prev, pnId]);
    setActiveTab(pnId);
  };

  const closeTab = (pnId: string) => {
    setOpenTabs(prev => {
      const newTabs = prev.filter(id => id !== pnId);

      // If we closed the active tab, switch to another tab
      if (activeTab === pnId) {
        const index = prev.indexOf(pnId);
        const newActiveTab = newTabs[index] || newTabs[index - 1] || null;
        setActiveTab(newActiveTab);
      }

      return newTabs;
    });

    // Clear tab data
    setTabData(prev => {
      const next = new Map(prev);
      next.delete(pnId);
      return next;
    });
  };

  const switchTab = (pnId: string) => {
    setActiveTab(pnId);
  };

  const handleExpandPN = async (pnId: string) => {
    await openTab(pnId);
  };

  // Load expanded PN data (used by handleExpandPN and live updates)
  const loadExpandedPNData = async (pnId: string, evaluationId: string) => {
    console.log(`📂 [ExpandedData] Loading data for ${pnId}, evaluation ${evaluationId}`);

    // Check memory cache first (for running evaluations)
    const cachedStates = evaluationStatesMap.get(pnId);
    if (cachedStates && cachedStates.length > 0) {
      console.log(`⚡ [ExpandedData] Using cached live states (${cachedStates.length} states)`);

      // Load minimal data (just nodes structure)
      const { data: evaluation } = await supabase
        .from('evaluations')
        .select('*')
        .eq('id', evaluationId)
        .single();

      const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${encodeURIComponent(pnId)}`);
      const bundle = await bundleRes.json();
      const pnData = bundle.pns[0];
      const sharedPrimitives = bundle.sharedPrimitives || [];
      const expandedNodes = expandSharedRequirements(pnData.requirements.nodes, sharedPrimitives);

      autoSelectFromStates(pnId, cachedStates, pnData.requirements.root);

      const data = {
        evaluation,
        nodes: expandedNodes,
        rootId: pnData.requirements.root,
        evaluationStates: cachedStates, // ✅ Use live states from SSE
        pnMeta: {
          id: pnId,
          title: pnData.title || availablePNs.find((p) => p.id === pnId)?.title,
          article:
            availablePNs.find((p) => p.id === pnId)?.article ||
            (pnData.article_refs && pnData.article_refs[0]?.article),
          legalText: pnData.legal_consequence?.verbatim,
        },
      };

      setTabData(prev => {
        const next = new Map(prev);
        next.set(pnId, data);
        return next;
      });
      return;
    }

    // Fallback to DB (for completed/old evaluations)
    console.log(`💾 [ExpandedData] Loading from database`);

    const { data: evaluation } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', evaluationId)
      .single();

    const { data: results, error: resultsError } = await supabase
      .from('evaluation_results')
      .select('*')
      .eq('evaluation_id', evaluationId);

    console.log(`📊 [ExpandedData] Query results: ${results?.length || 0} rows, error:`, resultsError);
    if (results && results.length > 0) {
      console.log(`📝 [ExpandedData] Sample node IDs:`, results.slice(0, 3).map(r => r.node_id));
    }

    const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${encodeURIComponent(pnId)}`);
    const bundle = await bundleRes.json();
    const pnData = bundle.pns[0];
    const sharedPrimitives = bundle.sharedPrimitives || [];

    const reconstruction = reconstructEvaluation(pnData, sharedPrimitives, results || []);
    const evaluationStates = reconstruction.states;

    autoSelectFromStates(pnId, evaluationStates, pnData.requirements.root);

    const completedCount = evaluationStates.filter(s => s.status === 'completed').length;
    const skippedCount = evaluationStates.filter(s => s.status === 'skipped').length;
    const evaluatingCount = evaluationStates.filter(s => s.status === 'evaluating').length;

    console.log(
      `📋 [ExpandedData] Final states: ${completedCount} completed, ${skippedCount} skipped, ${evaluatingCount} evaluating`
    );

    const data = {
      evaluation,
      nodes: reconstruction.nodes,
      rootId: pnData.requirements.root,
      evaluationStates,
      pnMeta: {
        id: pnId,
        title: pnData.title || availablePNs.find((p) => p.id === pnId)?.title,
        article:
          availablePNs.find((p) => p.id === pnId)?.article ||
          (pnData.article_refs && pnData.article_refs[0]?.article),
        legalText: pnData.legal_consequence?.verbatim,
      },
    };

    setTabData(prev => {
      const next = new Map(prev);
      next.set(pnId, data);
      return next;
    });
  };

  // Start live updates for running evaluation (deprecated - now using SSE live updates)
  // Keeping this for reference but SSE streams handle live updates automatically

  // Calculate PN statuses
  const appliesPNs = pnStatuses.filter(p => p.status === 'applies');
  const notApplicablePNs = pnStatuses.filter(p => p.status === 'not-applicable');
  const pendingPNs = pnStatuses.filter(p => p.status === 'pending'); // ONLY pending, not evaluating
  const evaluatingPNs = pnStatuses.filter(p => p.status === 'evaluating');

  // Categorize groups and PNs by status
  const groupedPNIds = new Set(groups.flatMap(g => g.members));

  // Helper to determine group status
  const getGroupStatus = (group: Group) => {
    const groupPNStatuses = pnStatuses.filter(ps => group.members.includes(ps.pnId));
    const pendingCount = groupPNStatuses.filter(ps => ps.status === 'pending').length;
    const appliesCount = groupPNStatuses.filter(ps => ps.status === 'applies').length;
    const notApplicableCount = groupPNStatuses.filter(ps => ps.status === 'not-applicable').length;

    // If all pending or mixed, treat as pending
    if (pendingCount > 0) return 'pending';
    // If all apply
    if (appliesCount === group.members.length) return 'applies';
    // If all N/A
    if (notApplicableCount === group.members.length) return 'not-applicable';
    // Mixed evaluated states - treat as pending for now
    return 'pending';
  };

  // Categorize groups
  const appliesGroups = groups.filter(g => getGroupStatus(g) === 'applies');
  const notApplicableGroups = groups.filter(g => getGroupStatus(g) === 'not-applicable');
  const pendingGroups = groups.filter(g => getGroupStatus(g) === 'pending');

  // Ungrouped PNs
  const ungroupedAppliesPNs = appliesPNs.filter(pn => !groupedPNIds.has(pn.pnId));
  const ungroupedNotApplicablePNs = notApplicablePNs.filter(pn => !groupedPNIds.has(pn.pnId));
  const ungroupedPendingPNs = pendingPNs.filter(pn => !groupedPNIds.has(pn.pnId));

  // Don't show blank loading screen - render UI immediately with loading states
  if (!useCase && !loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-500">Use case not found</div>
      </div>
    );
  }

  // Calculate all obligations (groups + ungrouped)
  const totalObligations = availablePNs.length;
  const evaluatedCount = appliesPNs.length + notApplicablePNs.length;
  const evaluatedPercent = totalObligations > 0 ? (evaluatedCount / totalObligations) * 100 : 0;

  // All pending tasks (groups + ungrouped)
  const allPendingTasks = [...pendingGroups, ...ungroupedPendingPNs];
  const totalPendingObligations = pendingPNs.length;

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main Content Area - Takes 3/5 of space (60%) */}
      <div className="flex-[3] min-w-0 min-h-0 overflow-y-auto overscroll-contain border-r border-neutral-200">
        <div className="px-6 py-4 space-y-4">
          {/* Use Case Header */}
          {useCase ? (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <h1 className="text-lg font-semibold text-neutral-900 tracking-tight flex-1">
                  {useCase.title}
                </h1>
                {useCase.tags && useCase.tags.length > 0 && (
                  <div className="flex gap-2">
                    {useCase.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Use Case Description - Collapsible */}
              {useCase.description && (
                <details className="group bg-white rounded-lg border border-neutral-200 overflow-hidden">
                  <summary className="cursor-pointer px-4 py-2.5 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                    <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide">Description</h3>
                    <svg
                      className="w-4 h-4 text-neutral-400 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="border-t border-neutral-200 p-4">
                    {!isEditingDescription ? (
                      <>
                        <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap mb-2">
                          {useCase.description}
                        </div>
                        <button
                          className="text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
                          onClick={() => {
                            setEditedDescription(useCase.description);
                            setIsEditingDescription(true);
                          }}
                        >
                          Edit
                        </button>
                      </>
                    ) : (
                      <>
                        <textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          className="w-full min-h-[150px] text-sm text-neutral-700 leading-relaxed border border-neutral-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                          placeholder="Enter use case description..."
                        />
                        <div className="flex gap-2">
                          <button
                            className="text-xs px-3 py-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                            onClick={() => {
                              setIsEditingDescription(false);
                              setEditedDescription('');
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                            onClick={async () => {
                              const success = await saveDescription(editedDescription);
                              if (success) {
                                setIsEditingDescription(false);
                                setEditedDescription('');
                              }
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>
          ) : (
            <div className="h-6 bg-neutral-100 rounded animate-pulse w-1/3"></div>
          )}

          {/* Progress Dashboard */}
          {!loading && totalObligations > 0 && (
            <div className="bg-white rounded-lg border border-neutral-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-neutral-900">Compliance Assessment Progress</h3>
                <div className="text-xs text-neutral-500">{evaluatedCount} of {totalObligations} evaluated</div>
              </div>
              <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden mb-2">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${evaluatedPercent}%` }}
                />
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-neutral-700">{appliesPNs.length} Apply</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-neutral-400"></div>
                  <span className="text-neutral-700">{notApplicablePNs.length} Do Not Apply</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-neutral-700">{pendingPNs.length} Pending</span>
                </div>
              </div>
            </div>
          )}


          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-neutral-200 p-4">
                <div className="h-5 bg-neutral-100 rounded animate-pulse mb-3 w-48"></div>
                <div className="space-y-2">
                  <div className="h-16 bg-neutral-50 rounded animate-pulse"></div>
                  <div className="h-16 bg-neutral-50 rounded animate-pulse"></div>
                  <div className="h-16 bg-neutral-50 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content - Single Page Layout */}
          {!loading && (
            <div className="space-y-4">
              {/* RESULTS SECTIONS - Top Position (The Answer) */}
              {/* APPLIES Section - Open by default (Critical obligations!) */}
              {(appliesGroups.length > 0 || ungroupedAppliesPNs.length > 0) && (
                <details open className="group">
                  <summary className="cursor-pointer flex items-center justify-between px-1 py-2 hover:bg-neutral-50 rounded transition-colors">
                    <h2 className="text-sm font-bold text-green-700 uppercase tracking-wide flex items-center gap-2">
                      <span>✓ Obligations That Apply ({appliesPNs.length})</span>
                    </h2>
                    <svg
                      className="w-4 h-4 text-neutral-400 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-2 space-y-2">
                    {appliesGroups.map(group => (
                      <TaskRow
                        key={group.id}
                        group={group}
                        groupPNStatuses={pnStatuses.filter(ps => group.members.includes(ps.pnId))}
                        sharedPrimitives={sharedPrimitives}
                        onEvaluate={(pnIds) => runInlineEvaluation(pnIds)}
                        onViewDetails={handleViewPN}
                      />
                    ))}
                    {ungroupedAppliesPNs.map(pn => (
                      <TaskRow
                        key={pn.pnId}
                        pnStatus={pn}
                        onEvaluate={(pnIds) => runInlineEvaluation(pnIds)}
                        onViewDetails={handleViewPN}
                      />
                    ))}
                  </div>
                </details>
              )}

              {/* DOES NOT APPLY Section - Collapsed by default (Less critical) */}
              {(notApplicableGroups.length > 0 || ungroupedNotApplicablePNs.length > 0) && (
                <details className="group">
                  <summary className="cursor-pointer flex items-center justify-between px-1 py-2 hover:bg-neutral-50 rounded transition-colors">
                    <h2 className="text-sm font-bold text-neutral-600 uppercase tracking-wide flex items-center gap-2">
                      <span>✗ Obligations That Do Not Apply ({notApplicablePNs.length})</span>
                    </h2>
                    <svg
                      className="w-4 h-4 text-neutral-400 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-2 space-y-2">
                    {notApplicableGroups.map(group => (
                      <TaskRow
                        key={group.id}
                        group={group}
                        groupPNStatuses={pnStatuses.filter(ps => group.members.includes(ps.pnId))}
                        sharedPrimitives={sharedPrimitives}
                        onEvaluate={(pnIds) => runInlineEvaluation(pnIds)}
                        onViewDetails={handleViewPN}
                      />
                    ))}
                    {ungroupedNotApplicablePNs.map(pn => (
                      <TaskRow
                        key={pn.pnId}
                        pnStatus={pn}
                        onEvaluate={(pnIds) => runInlineEvaluation(pnIds)}
                        onViewDetails={handleViewPN}
                      />
                    ))}
                  </div>
                </details>
              )}

              {/* Empty Results State */}
              {appliesPNs.length === 0 && notApplicablePNs.length === 0 && allPendingTasks.length === 0 && runningEvaluations.size === 0 && (
                <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
                  <div className="text-neutral-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-1">No Obligations</h3>
                  <p className="text-xs text-neutral-600">This use case has no obligations to evaluate.</p>
                </div>
              )}

              {/* RUNNING EVALUATIONS - Middle Position (The Work) */}
              {runningEvaluations.size > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Evaluating Now
                  </h2>

                  {Array.from(runningEvaluations).map(evaluationId => {
                    const evaluation = evaluationHistory.find(e => e.id === evaluationId);
                    if (!evaluation) return null;

                    const pnIds = evaluation.pn_ids as string[];
                    const progress = evaluationProgress.get(evaluationId);
                    const progressPercent = progress ? (progress.current / progress.total) * 100 : 0;

                    return (
                      <div key={evaluationId} className="bg-white rounded-lg border-2 border-blue-200 overflow-hidden">
                        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-blue-900">
                              Evaluating {pnIds.length} {pnIds.length === 1 ? 'obligation' : 'obligations'}
                            </div>
                            {progress && (
                              <div className="text-sm font-semibold text-blue-700">
                                {progress.current}/{progress.total} ({Math.round(progressPercent)}%)
                              </div>
                            )}
                          </div>
                          {progress && (
                            <div className="relative h-2 bg-blue-200 rounded-full overflow-hidden">
                              <div
                                className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="divide-y divide-neutral-100">
                          {pnIds.map(pnId => {
                            const pnStatus = pnStatuses.find(ps => ps.pnId === pnId);
                            return (
                              <button
                                key={pnId}
                                onClick={() => handleExpandPN(pnId)}
                                className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 transition-colors flex items-center gap-3"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                                <span className="text-xs font-mono font-semibold text-neutral-900 flex-shrink-0">{pnId}</span>
                                <span className="text-xs text-neutral-600 flex-1 truncate">{pnStatus?.title}</span>
                                {pnStatus?.progressCurrent !== undefined && pnStatus.progressTotal && (
                                  <span className="text-xs text-blue-600 font-medium tabular-nums">
                                    {pnStatus.progressCurrent}/{pnStatus.progressTotal}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PENDING EVALUATION - Bottom Position (The Action) */}
              {allPendingTasks.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                      Pending Evaluation
                    </h2>
                    <button
                      onClick={() => {
                        const allPendingPNIds = pendingPNs.map(p => p.pnId);
                        if (allPendingPNIds.length > 0) {
                          runInlineEvaluation(allPendingPNIds);
                        }
                      }}
                      disabled={totalPendingObligations === 0 || triggering}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm shadow-sm"
                    >
                      Evaluate All Pending ({totalPendingObligations})
                    </button>
                  </div>

                  {/* Groups */}
                  {pendingGroups.map(group => (
                    <TaskRow
                      key={group.id}
                      group={group}
                      groupPNStatuses={pnStatuses.filter(ps => group.members.includes(ps.pnId))}
                      sharedPrimitives={sharedPrimitives}
                      onEvaluate={(pnIds) => runInlineEvaluation(pnIds)}
                      onViewDetails={handleViewPN}
                    />
                  ))}

                  {/* Individual PNs */}
                  {ungroupedPendingPNs.map(pn => (
                    <TaskRow
                      key={pn.pnId}
                      pnStatus={pn}
                      onEvaluate={(pnIds) => runInlineEvaluation(pnIds)}
                      onViewDetails={handleViewPN}
                    />
                  ))}
                </div>
              ) : (
                /* All Complete State */
                runningEvaluations.size === 0 && (appliesPNs.length > 0 || notApplicablePNs.length > 0) && (
                  <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
                    <div className="text-green-600 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900 mb-1">All Evaluations Complete!</h3>
                    <p className="text-xs text-neutral-600">Review your results above.</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right-Side Inspector Panel - Always Visible IDE Style - Takes 2/5 of space (40%) */}
      <div className="flex-[2] min-w-0 bg-neutral-50 flex flex-col overflow-hidden">
        {/* Tab Bar */}
        {openTabs.length > 0 ? (
          <div className="border-b border-neutral-200 bg-white flex items-center overflow-x-auto">
            {openTabs.map(pnId => (
              <div
                key={pnId}
                className={`group flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-r border-neutral-200 transition-colors flex-shrink-0 cursor-pointer ${
                  activeTab === pnId
                    ? 'bg-neutral-50 text-neutral-900'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
                onClick={() => switchTab(pnId)}
              >
                <span className="font-mono">{pnId}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(pnId);
                  }}
                  className="p-0.5 hover:bg-neutral-200 rounded transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Close tab"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {/* Inspector Content */}
        <div className="flex-1 min-w-0 min-h-0 overflow-y-auto overscroll-contain">
          {openTabs.length > 0 ? (
            openTabs.map((pnId) => {
              const data = tabData.get(pnId);
              if (!data) return null;
              const isActive = activeTab === pnId;
              return (
                <div key={pnId} className={isActive ? '' : 'hidden'}>
                  <div className="p-5 min-w-0">
                    <RequirementsGrid
                      key={pnId}
                      nodes={data.nodes || []}
                      rootId={data.rootId || ''}
                      evaluationStates={data.evaluationStates || []}
                      onNodeClick={(nodeId) => handleNodeSelection(pnId, nodeId)}
                      selectedNodeId={pnSelectedNodeMap.get(pnId) ?? null}
                      isRunning={pnStatuses.find(p => p.pnId === pnId)?.status === 'evaluating'}
                      totalNodes={data.nodes?.filter((n: any) => n.kind === 'primitive').length || 0}
                      evaluationStatus={pnStatuses.find(p => p.pnId === pnId)?.status || data.evaluation?.status || 'pending'}
                      pnTitle={data.pnMeta?.title || pnStatuses.find(p => p.pnId === pnId)?.title}
                      pnArticle={data.pnMeta?.article || pnStatuses.find(p => p.pnId === pnId)?.article}
                      pnLegalText={data.pnMeta?.legalText}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center p-12">
              <div className="text-center max-w-sm">
                <svg className="w-16 h-16 mx-auto mb-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-sm font-medium text-neutral-900 mb-2">No Obligation Selected</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Select an obligation from the list to inspect its evaluation tree and requirements.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// PN Table Component
function PNTable({
  title,
  pns,
  activeTab,
  onExpandPN,
  type,
  showHeader = true,
  selectedPNs = [],
  onTogglePN,
  onEvaluateSelected,
  onEvaluateAll,
  useCaseId,
  pnSelectedNodeMap,
  onSelectNode,
}: {
  title: string;
  pns: PNStatus[];
  activeTab: string | null;
  onExpandPN: (pnId: string) => void;
  type: 'applies' | 'not-applicable' | 'pending';
  showHeader?: boolean;
  selectedPNs?: string[];
  onTogglePN?: (pnId: string) => void;
  onEvaluateSelected?: () => void;
  onEvaluateAll?: () => void;
  useCaseId?: string;
  pnSelectedNodeMap: Map<string, string | null>;
  onSelectNode: (pnId: string, nodeId: string | null) => void;
}) {
  const router = useRouter();
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
    <div data-pn-box className={`rounded-lg border ${getBorderColor()} overflow-hidden`}>
      {showHeader && title && (
        <div className={`px-4 py-2 ${getHeaderBg()} border-b ${getBorderColor()}`}>
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
            {title}
          </h3>
        </div>
      )}

      <div className="divide-y divide-neutral-100">
        {pns.map((pn) => {
          const isActive = activeTab === pn.pnId;
          const isPending = pn.status === 'pending';
          const isEvaluating = pn.status === 'evaluating';
          const isCompleted = pn.status === 'applies' || pn.status === 'not-applicable';
          const isSelected = selectedPNs.includes(pn.pnId);
          const showCheckbox = isPending && onTogglePN;

          return (
            <div key={pn.pnId}>
              {/* Row */}
              <div className={`w-full px-5 py-3 flex items-center gap-3 transition-colors ${
                isActive
                  ? 'bg-blue-50 border-l-2 border-blue-500'
                  : 'hover:bg-neutral-50'
              }`}>
                {/* Checkbox for pending PNs (not evaluating) */}
                {showCheckbox && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onTogglePN(pn.pnId)}
                    className="w-4 h-4 text-neutral-900 rounded flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {/* Running indicator for evaluating PNs */}
                {isEvaluating && (
                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  </div>
                )}

                {/* Standalone evaluation button for pending PNs */}
                {isPending && !isEvaluating && (
                  <button
                    onClick={() => router.push(`/evaluation-standalone?pnId=${pn.pnId}&useCaseId=${useCaseId}`)}
                    className="text-[10px] px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded font-medium transition-colors flex-shrink-0"
                    title="Open in standalone evaluation page (old working pattern)"
                  >
                    Test
                  </button>
                )}

                {/* Clickable area for expansion */}
                <button
                  onClick={() => (isCompleted || isEvaluating) && onExpandPN(pn.pnId)}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-between text-left disabled:cursor-default"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-xs font-mono font-semibold text-neutral-900 flex-shrink-0">
                      {pn.pnId}
                    </div>
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider flex-shrink-0">
                      Art. {pn.article}
                    </div>
                    <div className="text-sm text-neutral-700 flex-1 min-w-0 truncate">
                      {pn.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    {pn.evaluatedAt && (
                      <div className="text-xs text-neutral-400">
                        {new Date(pn.evaluatedAt).toLocaleDateString('en', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    )}

                    {pn.progressCurrent !== undefined && pn.progressTotal && (
                      <div className={`text-xs font-medium tabular-nums ${isEvaluating ? 'text-blue-600' : 'text-neutral-500'}`}>
                        {pn.progressCurrent}/{pn.progressTotal}
                      </div>
                    )}

                    {(isCompleted || isEvaluating) && (
                      <svg
                        className={`w-4 h-4 text-neutral-300 transition-transform ${isActive ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons for Pending PNs */}
      {type === 'pending' && pns.length > 0 && (onEvaluateSelected || onEvaluateAll) && (
        <div className="border-t border-neutral-200 px-5 py-3 bg-neutral-50 flex items-center gap-3">
          {onEvaluateSelected && selectedPNs.length > 0 && (
            <button
              onClick={onEvaluateSelected}
              className="text-sm px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
            >
              Evaluate Selected ({selectedPNs.length})
            </button>
          )}

          {onEvaluateAll && (
            <button
              onClick={onEvaluateAll}
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Evaluate All ({pns.length})
            </button>
          )}

          {selectedPNs.length > 0 && (
            <button
              onClick={() => {
                selectedPNs.forEach(pnId => onTogglePN?.(pnId));
              }}
              className="text-sm px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Clear Selection
            </button>
          )}
        </div>
      )}
    </div>
  );
}
