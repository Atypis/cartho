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

import { useState, useEffect } from 'react';
import { RequirementsGrid } from '@/components/evaluation/RequirementsGrid';
import { GroupCard } from '@/components/usecase/GroupCard';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import type { EvaluationState } from '@/lib/evaluation/types';
import { expandSharedRequirements } from '@/lib/evaluation/expand-shared';

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
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(true);

  // PN catalog and status
  const [groups, setGroups] = useState<Group[]>([]);
  const [availablePNs, setAvailablePNs] = useState<any[]>([]);
  const [ungroupedPNs, setUngroupedPNs] = useState<any[]>([]);
  const [sharedPrimitives, setSharedPrimitives] = useState<any[]>([]);
  const [pnStatuses, setPNStatuses] = useState<PNStatus[]>([]);
  const [selectedPNs, setSelectedPNs] = useState<string[]>([]);
  const [triggering, setTriggering] = useState(false);

  // Expanded PN state
  const [expandedPNId, setExpandedPNId] = useState<string | null>(null);
  const [expandedPNData, setExpandedPNData] = useState<any>(null);

  // Evaluation history
  const [showHistory, setShowHistory] = useState(false);
  const [evaluationHistory, setEvaluationHistory] = useState<Evaluation[]>([]);

  // Running evaluations (inline cockpit mode)
  const [runningEvaluations, setRunningEvaluations] = useState<Set<string>>(new Set());
  const [evaluationProgress, setEvaluationProgress] = useState<Map<string, { current: number, total: number }>>(new Map());

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
    loadUseCaseAndEvaluations();

    // Real-time subscription
    const subscription = supabase
      .channel(`usecase_cockpit_${useCaseId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evaluations', filter: `use_case_id=eq.${useCaseId}` }, () => {
        console.log('🔄 [Cockpit] Evaluation changed, reloading...');
        loadUseCaseAndEvaluations();
      })
      .subscribe();

    return () => {
      console.log(`🧹 [Cockpit] Cleanup for use case: ${useCaseId}`);
      subscription.unsubscribe();
    };
  }, [useCaseId, availablePNs.length]); // Add availablePNs.length to re-trigger when catalog loads

  const loadUseCaseAndEvaluations = async () => {
    console.log(`📂 [Cockpit] loadUseCaseAndEvaluations called for use case: ${useCaseId}`);
    console.log(`📂 [Cockpit] Available PNs count: ${availablePNs.length}`);

    if (availablePNs.length === 0) {
      console.log('⚠️ [Cockpit] Waiting for PN catalog to load...');
      // Wait for catalog to load
      return;
    }

    setLoading(true);
    console.log(`🔄 [Cockpit] Loading use case data...`);

    // Load use case
    const { data: useCaseData, error: ucError } = await supabase
      .from('use_cases')
      .select('*')
      .eq('id', useCaseId)
      .single();

    if (ucError || !useCaseData) {
      console.error('Error loading use case:', ucError);
      setLoading(false);
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
  };

  const buildPNStatusMapOptimized = async (evaluations: Evaluation[]) => {
    const statusMap = new Map<string, PNStatus>();

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
      const pnIds = evaluation.pn_ids as string[];
      const progress = evaluationProgress.get(evaluation.id);

      for (const pnId of pnIds) {
        const existing = statusMap.get(pnId);
        if (existing) {
          statusMap.set(pnId, {
            ...existing,
            status: 'evaluating' as any, // Add 'evaluating' to status type
            evaluationId: evaluation.id,
            progressCurrent: progress?.current,
            progressTotal: progress?.total,
          });
        }
      }

      // Add to running evaluations set
      setRunningEvaluations(prev => new Set(prev).add(evaluation.id));
    }

    // Process only completed evaluations
    const completedEvaluations = evaluations.filter(e => e.status === 'completed');
    console.log(`✅ [Cockpit] Found ${completedEvaluations.length} completed evaluations`);

    for (const evaluation of completedEvaluations) {
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

      if (resultsError || !results || results.length === 0) {
        console.warn(`⚠️ [Cockpit] No results for evaluation ${evaluation.id}`);
        continue;
      }

      // Load PN bundle for all PNs at once
      try {
        const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${encodeURIComponent(pnIds.join(','))}`);
        if (!bundleRes.ok) {
          console.warn(`[Cockpit] Failed to load bundle for ${pnIds.join(',')}`);
          continue;
        }

        const bundle = await bundleRes.json();
        const pnDataList = bundle.pns || [];
        const sharedPrimitives = bundle.sharedPrimitives || [];

        // Process each PN
        for (let i = 0; i < pnIds.length; i++) {
          const pnId = pnIds[i];
          const pnData = pnDataList[i];

          if (!pnData) {
            console.warn(`[Cockpit] No PN data for ${pnId}`);
            continue;
          }

          const rootId = pnData.requirements.root;
          const expandedNodes = expandSharedRequirements(pnData.requirements.nodes, sharedPrimitives);
          const rootNode = expandedNodes.find((n: any) => n.id === rootId);

          console.log(`🌳 [Cockpit] PN ${pnId}: rootId=${rootId}, rootNode.kind=${rootNode?.kind}`);
          console.log(`🔎 [Cockpit] Looking for result with node_id=${rootId}`);

          // Find root node result
          const rootResult = results.find((r: any) => r.node_id === rootId);

          console.log(`${rootResult ? '✅' : '❌'} [Cockpit] Root result ${rootResult ? 'FOUND' : 'NOT FOUND'} for ${pnId}`);

          if (rootResult) {
            console.log(`📊 [Cockpit] Root decision for ${pnId}: ${rootResult.decision}`);

            const primitiveCount = expandedNodes.filter((n: any) => n.kind === 'primitive').length;
            const completedCount = results.filter((r: any) => {
              const node = expandedNodes.find((n: any) => n.id === r.node_id);
              return node?.kind === 'primitive';
            }).length;

            const status = rootResult.decision ? 'applies' : 'not-applicable';
            console.log(`🎯 [Cockpit] Setting ${pnId} status to: ${status}`);

            statusMap.set(pnId, {
              pnId,
              article: availablePNs.find(p => p.id === pnId)?.article || pnId.replace('PN-', ''),
              title: availablePNs.find(p => p.id === pnId)?.title || pnId,
              status,
              evaluationId: evaluation.id,
              evaluatedAt: evaluation.triggered_at,
              rootDecision: rootResult.decision,
              progressCurrent: completedCount,
              progressTotal: primitiveCount
            });
          } else {
            console.warn(`⚠️ [Cockpit] No root result for ${pnId} (root: ${rootId})`);
            console.warn(`⚠️ [Cockpit] Available node_ids in results:`, results.map((r: any) => r.node_id).join(', '));
          }
        }
      } catch (error) {
        console.error('[Cockpit] Error processing evaluation:', error);
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

        // Calculate progress from evaluation_results (since API doesn't update progress_current/total)
        const { data: results, error: resultsError } = await supabase
          .from('evaluation_results')
          .select('node_id')
          .eq('evaluation_id', evaluationId);

        if (!resultsError && results) {
          const pnIds = evaluation.pn_ids as string[];

          // Load PN bundle to count total primitives (WITH EXPANSION)
          const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${encodeURIComponent(pnIds.join(','))}`);
          if (bundleRes.ok) {
            const bundle = await bundleRes.json();

            // Count total primitive nodes across all PNs (AFTER expanding shared requirements)
            let totalPrimitives = 0;
            for (const pnData of bundle.pns) {
              if (pnData?.requirements?.nodes) {
                // Expand shared requirements BEFORE counting (same as buildPNStatusMapOptimized)
                const expandedNodes = expandSharedRequirements(pnData.requirements.nodes, bundle.sharedPrimitives || []);
                const primitives = expandedNodes.filter((n: any) => n.kind === 'primitive');
                totalPrimitives += primitives.length;
              }
            }

            const completedCount = results.length;

            console.log(`📊 [Polling] Progress: ${completedCount}/${totalPrimitives} (expanded nodes)`);

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

      // Start polling BEFORE triggering API (so we catch it when it starts)
      startPollingEvaluation(evaluation.id);

      // Load PN bundle
      const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${encodeURIComponent(pnIds.join(','))}`);
      if (!bundleRes.ok) {
        throw new Error('Failed to load PN bundle');
      }
      const bundle = await bundleRes.json();

      // Trigger evaluation for each PN
      for (let i = 0; i < pnIds.length; i++) {
        const pnId = pnIds[i];
        const pnData = bundle.pns[i];

        if (!pnData) {
          console.warn(`⚠️ [Inline Eval] No data for ${pnId}, skipping`);
          continue;
        }

        console.log(`🎯 [Inline Eval] Starting evaluation for ${pnId}`);

        // Call API for this PN (don't await - let it run in background)
        fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prescriptiveNorm: pnData,
            sharedPrimitives: bundle.sharedPrimitives || [],
            caseInput: useCase.description,
            evaluationId: evaluation.id,
          }),
        }).catch(error => {
          console.error(`❌ [Inline Eval] Error evaluating ${pnId}:`, error);
        });
      }

      console.log(`✅ [Inline Eval] All ${pnIds.length} evaluations triggered`);

      // Clear selection
      setSelectedPNs([]);

      // Reload immediately to show "evaluating" status
      await loadUseCaseAndEvaluations();

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

  const handleExpandPN = async (pnId: string) => {
    if (expandedPNId === pnId) {
      setExpandedPNId(null);
      setExpandedPNData(null);
      return;
    }

    const pnStatus = pnStatuses.find(p => p.pnId === pnId);
    if (!pnStatus || !pnStatus.evaluationId) {
      console.warn(`[Cockpit] Cannot expand ${pnId}: no evaluationId`);
      return;
    }

    console.log(`[Cockpit] Expanding ${pnId}...`);

    // Load full evaluation data
    await loadExpandedPNData(pnId, pnStatus.evaluationId);
    setExpandedPNId(pnId);

    // If running, start polling for live updates
    if (pnStatus.status === 'evaluating' || runningEvaluations.has(pnStatus.evaluationId)) {
      console.log(`🔄 [Live Updates] Starting live polling for ${pnId}`);
      startLiveUpdates(pnId, pnStatus.evaluationId);
    }
  };

  // Load expanded PN data (used by handleExpandPN and live updates)
  const loadExpandedPNData = async (pnId: string, evaluationId: string) => {
    const { data: evaluation } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', evaluationId)
      .single();

    const { data: results } = await supabase
      .from('evaluation_results')
      .select('*')
      .eq('evaluation_id', evaluationId);

    const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${encodeURIComponent(pnId)}`);
    const bundle = await bundleRes.json();
    const pnData = bundle.pns[0];
    const sharedPrimitives = bundle.sharedPrimitives || [];

    const expandedNodes = expandSharedRequirements(pnData.requirements.nodes, sharedPrimitives);

    // Map results to evaluation states with proper status
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

    // Mark nodes without results as pending
    const resultNodeIds = new Set((results || []).map((r: any) => r.node_id));
    const primitiveNodes = expandedNodes.filter(n => n.kind === 'primitive');

    for (const node of primitiveNodes) {
      if (!resultNodeIds.has(node.id)) {
        evaluationStates.push({
          nodeId: node.id,
          status: 'pending' as const,
        });
      }
    }

    setExpandedPNData({
      evaluation,
      nodes: expandedNodes,
      rootId: pnData.requirements.root,
      evaluationStates,
    });
  };

  // Start live updates for running evaluation
  const startLiveUpdates = (pnId: string, evaluationId: string) => {
    const pollInterval = setInterval(async () => {
      // Check if still expanded
      if (expandedPNId !== pnId) {
        clearInterval(pollInterval);
        return;
      }

      // Check if still running
      const pnStatus = pnStatuses.find(p => p.pnId === pnId);
      if (!pnStatus || pnStatus.status !== 'evaluating') {
        console.log(`✅ [Live Updates] Stopping polling for ${pnId} - completed`);
        clearInterval(pollInterval);
        return;
      }

      // Reload the expanded data
      await loadExpandedPNData(pnId, evaluationId);
    }, 1000); // Poll every second

    return () => clearInterval(pollInterval);
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-500">Loading use case...</div>
      </div>
    );
  }

  if (!useCase) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-500">Use case not found</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-4 space-y-4">
        {/* Use Case Header with Inline Stats */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <h1 className="text-base font-bold text-neutral-900 mb-1">
            {useCase.title}
          </h1>
          <p className="text-sm text-neutral-600 mb-3">
            {useCase.description}
          </p>
          <div className="flex items-center justify-between">
            {useCase.tags && useCase.tags.length > 0 && (
              <div className="flex gap-2">
                {useCase.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {/* Compact Inline Stats */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="text-green-700">✓ {appliesPNs.length} Apply</span>
              <span className="text-neutral-500">✗ {notApplicablePNs.length} N/A</span>
              <span className="text-blue-700">○ {pendingPNs.length} Pending</span>
            </div>
          </div>
        </div>

        {/* APPLIES Section - Groups + Individual PNs */}
        {(appliesGroups.length > 0 || ungroupedAppliesPNs.length > 0) && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide px-1">
              ✓ OBLIGATIONS THAT APPLY
            </h2>

            {/* Groups in Applies */}
            {appliesGroups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                pnStatuses={pnStatuses}
                sharedPrimitives={sharedPrimitives}
                onEvaluateGroup={handleEvaluateGroup}
                onEvaluatePN={(pnId) => {
                  setSelectedPNs([pnId]);
                  setTimeout(() => triggerEvaluation(), 100);
                }}
                onViewPN={handleViewPN}
              />
            ))}

            {/* Individual PNs in Applies */}
            {ungroupedAppliesPNs.length > 0 && (
              <PNTable
                title=""
                pns={ungroupedAppliesPNs}
                expandedPNId={expandedPNId}
                expandedPNData={expandedPNData}
                onExpandPN={handleExpandPN}
                type="applies"
                showHeader={false}
              />
            )}
          </div>
        )}

        {/* NOT APPLICABLE Section - Groups + Individual PNs */}
        {(notApplicableGroups.length > 0 || ungroupedNotApplicablePNs.length > 0) && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide px-1">
              ✗ OBLIGATIONS THAT DO NOT APPLY
            </h2>

            {/* Groups in N/A */}
            {notApplicableGroups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                pnStatuses={pnStatuses}
                sharedPrimitives={sharedPrimitives}
                onEvaluateGroup={handleEvaluateGroup}
                onEvaluatePN={(pnId) => {
                  setSelectedPNs([pnId]);
                  setTimeout(() => triggerEvaluation(), 100);
                }}
                onViewPN={handleViewPN}
              />
            ))}

            {/* Individual PNs in N/A */}
            {ungroupedNotApplicablePNs.length > 0 && (
              <PNTable
                title=""
                pns={ungroupedNotApplicablePNs}
                expandedPNId={expandedPNId}
                expandedPNData={expandedPNData}
                onExpandPN={handleExpandPN}
                type="not-applicable"
                showHeader={false}
              />
            )}
          </div>
        )}

        {/* EVALUATIONS IN PROGRESS Section */}
        {runningEvaluations.size > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide px-1 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ⟳ EVALUATIONS IN PROGRESS
            </h2>

            {Array.from(runningEvaluations).map(evaluationId => {
              const evaluation = evaluationHistory.find(e => e.id === evaluationId);
              if (!evaluation) return null;

              const pnIds = evaluation.pn_ids as string[];
              const progress = evaluationProgress.get(evaluationId);
              const runningPNs = pnStatuses.filter(ps =>
                pnIds.includes(ps.pnId) && ps.evaluationId === evaluationId
              );

              return (
                <div key={evaluationId} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 overflow-hidden">
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-bold text-blue-900">
                          Evaluating {pnIds.length} obligation{pnIds.length !== 1 ? 's' : ''}
                        </div>
                        {progress && (
                          <div className="text-xs font-medium text-blue-700">
                            {progress.current}/{progress.total} complete
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-blue-600 font-mono">
                        ID: {evaluationId.slice(0, 8)}...
                      </div>
                    </div>

                    {/* Progress bar */}
                    {progress && (
                      <div className="mb-3">
                        <div className="flex-1 bg-blue-200 rounded-full h-2">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-full"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* List of PNs being evaluated */}
                    <div className="space-y-1">
                      {pnIds.map(pnId => {
                        const pnStatus = pnStatuses.find(ps => ps.pnId === pnId);
                        const isExpanded = expandedPNId === pnId;

                        return (
                          <div key={pnId}>
                            <button
                              onClick={() => handleExpandPN(pnId)}
                              className="w-full text-left px-3 py-2 bg-white/50 hover:bg-white rounded border border-blue-200 hover:border-blue-300 transition-colors flex items-center gap-2"
                            >
                              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                              <div className="text-xs font-mono font-semibold text-blue-900">{pnId}</div>
                              <div className="text-[10px] text-blue-600 flex-1">{pnStatus?.title || 'Evaluating...'}</div>
                              {pnStatus?.progressCurrent !== undefined && pnStatus.progressTotal && (
                                <div className="text-xs text-blue-700 font-medium">
                                  {pnStatus.progressCurrent}/{pnStatus.progressTotal}
                                </div>
                              )}
                              <svg
                                className={`w-3.5 h-3.5 text-blue-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {/* Inline TREEMAXX expansion for running evaluation */}
                            {isExpanded && expandedPNData && (
                              <div className="mt-2 bg-white rounded border border-blue-300 px-4 py-3">
                                <RequirementsGrid
                                  nodes={expandedPNData.nodes || []}
                                  rootId={expandedPNData.rootId || ''}
                                  evaluationStates={expandedPNData.evaluationStates || []}
                                  onNodeClick={() => {}}
                                  selectedNodeId={null}
                                  isRunning={true}
                                  totalNodes={expandedPNData.nodes?.filter((n: any) => n.kind === 'primitive').length || 0}
                                  evaluationStatus={expandedPNData.evaluation?.status || 'running'}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PENDING Section - Groups + Individual PNs */}
        {(pendingGroups.length > 0 || ungroupedPendingPNs.length > 0) && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide px-1">
              ○ PENDING EVALUATION
            </h2>

            {/* Groups in Pending */}
            {pendingGroups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                pnStatuses={pnStatuses}
                sharedPrimitives={sharedPrimitives}
                onEvaluateGroup={handleEvaluateGroup}
                onEvaluatePN={(pnId) => {
                  setSelectedPNs([pnId]);
                  setTimeout(() => triggerEvaluation(), 100);
                }}
                onViewPN={handleViewPN}
              />
            ))}

            {/* Individual PNs in Pending */}
            {ungroupedPendingPNs.length > 0 && (
              <PNTable
                title=""
                pns={ungroupedPendingPNs}
                expandedPNId={expandedPNId}
                expandedPNData={expandedPNData}
                onExpandPN={handleExpandPN}
                type="pending"
                showHeader={false}
                selectedPNs={selectedPNs}
                onTogglePN={handleTogglePN}
                onEvaluateSelected={handleEvaluateSelectedPNs}
                onEvaluateAll={() => handleEvaluateAllPendingPNs(ungroupedPendingPNs.map(p => p.pnId))}
              />
            )}
          </div>
        )}

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
                    <button
                      key={evaluation.id}
                      onClick={() => onViewEvaluation(evaluation.id)}
                      className="w-full flex items-center justify-between p-3 rounded border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 transition-colors text-left"
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
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
  type,
  showHeader = true,
  selectedPNs = [],
  onTogglePN,
  onEvaluateSelected,
  onEvaluateAll
}: {
  title: string;
  pns: PNStatus[];
  expandedPNId: string | null;
  expandedPNData: any;
  onExpandPN: (pnId: string) => void;
  type: 'applies' | 'not-applicable' | 'pending';
  showHeader?: boolean;
  selectedPNs?: string[];
  onTogglePN?: (pnId: string) => void;
  onEvaluateSelected?: () => void;
  onEvaluateAll?: () => void;
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
      {showHeader && title && (
        <div className={`px-4 py-2 ${getHeaderBg()} border-b ${getBorderColor()}`}>
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
            {title}
          </h3>
        </div>
      )}

      <div className="divide-y divide-neutral-100">
        {pns.map((pn) => {
          const isExpanded = expandedPNId === pn.pnId;
          const isPending = pn.status === 'pending';
          const isEvaluating = pn.status === 'evaluating';
          const isCompleted = pn.status === 'applies' || pn.status === 'not-applicable';
          const isSelected = selectedPNs.includes(pn.pnId);
          const showCheckbox = isPending && onTogglePN;

          return (
            <div key={pn.pnId}>
              {/* Row */}
              <div className="w-full px-4 py-2 flex items-center gap-3 hover:bg-neutral-50 transition-colors">
                {/* Checkbox for pending PNs (not evaluating) */}
                {showCheckbox && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onTogglePN(pn.pnId)}
                    className="w-3.5 h-3.5 text-neutral-900 rounded flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {/* Running indicator for evaluating PNs */}
                {isEvaluating && (
                  <div className="w-3.5 h-3.5 flex-shrink-0">
                    <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* Clickable area for expansion */}
                <button
                  onClick={() => (isCompleted || isEvaluating) && onExpandPN(pn.pnId)}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-between text-left disabled:cursor-default"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-xs font-mono font-semibold text-neutral-900">
                      {pn.pnId}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Art. {pn.article}
                    </div>
                    <div className="text-xs text-neutral-900 flex-1">
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
                      <div className={`text-xs font-medium ${isEvaluating ? 'text-blue-600' : 'text-neutral-600'}`}>
                        ⟳ {pn.progressCurrent}/{pn.progressTotal}
                      </div>
                    )}

                    {isEvaluating && (
                      <div className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium animate-pulse">
                        Running
                      </div>
                    )}

                    {(isCompleted || isEvaluating) && (
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
              </div>

              {/* Expanded TREEMAXX View */}
              {isExpanded && expandedPNData && (
                <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-3">
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

      {/* Action Buttons for Pending PNs */}
      {type === 'pending' && pns.length > 0 && (onEvaluateSelected || onEvaluateAll) && (
        <div className="border-t border-neutral-200 px-4 py-3 bg-neutral-50 flex items-center gap-2">
          {onEvaluateSelected && selectedPNs.length > 0 && (
            <button
              onClick={onEvaluateSelected}
              className="text-xs px-4 py-1.5 bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors font-medium"
            >
              Evaluate Selected ({selectedPNs.length})
            </button>
          )}

          {onEvaluateAll && (
            <button
              onClick={onEvaluateAll}
              className="text-xs px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
            >
              Evaluate All ({pns.length})
            </button>
          )}

          {selectedPNs.length > 0 && (
            <button
              onClick={() => {
                selectedPNs.forEach(pnId => onTogglePN?.(pnId));
              }}
              className="text-xs px-3 py-1.5 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
            >
              Deselect All
            </button>
          )}
        </div>
      )}
    </div>
  );
}
