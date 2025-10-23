'use client';

/**
 * Requirements Grid Component
 *
 * Main layout component that displays requirements in a tabular structure:
 * - Root-level requirements horizontally
 * - Sub-requirements expand vertically
 * - Integrated live progress tracking during evaluation
 */

import { useState, useEffect, useRef } from 'react';
import { RequirementBlock } from './RequirementBlock';
import { toRomanNumeral } from '@/lib/evaluation/layout-utils';
import type { RequirementNode, EvaluationState } from '@/lib/evaluation/types';

interface RequirementsGridProps {
  nodes: RequirementNode[];
  rootId: string;
  evaluationStates: EvaluationState[];
  onNodeClick: (nodeId: string) => void;
  selectedNodeId?: string | null;
  isRunning?: boolean;
  totalNodes?: number;
  evaluationStatus?: string;
  pnTitle?: string;
  pnArticle?: string | number;
  pnLegalText?: string;
}

export function RequirementsGrid({
  nodes,
  rootId,
  evaluationStates,
  onNodeClick,
  selectedNodeId,
  isRunning = false,
  totalNodes = 0,
  evaluationStatus,
  pnTitle,
  pnArticle,
  pnLegalText,
}: RequirementsGridProps) {
  const [progressExpanded, setProgressExpanded] = useState(true);
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'tree'>('tree'); // TREE IS DEFAULT 🌲
  const summaryCardRef = useRef<HTMLDivElement>(null);

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const root = nodeMap.get(rootId);

  // Calculate evaluation completion status early (needed for useEffect hook)
  const primitiveStatesForHook = evaluationStates.filter(s => {
    const node = nodeMap.get(s.nodeId);
    return node?.kind === 'primitive';
  });
  const completedForHook = primitiveStatesForHook.filter(s => s.status === 'completed').length;
  const skippedForHook = primitiveStatesForHook.filter(s => s.status === 'skipped').length;
  const resolvedForHook = completedForHook + skippedForHook;
  const allCompletedForHook =
    evaluationStatus === 'completed' || (resolvedForHook === totalNodes && totalNodes > 0);
  const isEvaluationFinishedForHook = allCompletedForHook && !isRunning;

  // Auto-scroll to summary card when evaluation completes (MUST be before early return!)
  useEffect(() => {
    if (isEvaluationFinishedForHook && summaryCardRef.current) {
      console.log('📜 [Auto-scroll] Scrolling to summary card');
      summaryCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      // Also expand the card if it's collapsed
      setSummaryExpanded(true);
    }
  }, [isEvaluationFinishedForHook]);

  if (!root) {
    return (
      <div className="text-center py-12 text-neutral-500">
        No requirements found
      </div>
    );
  }

  // Determine root-level requirements
  // If root is allOf, each child is a top-level requirement (horizontal layout)
  // Otherwise, root itself is the only top-level requirement
  const rootLevelRequirements =
    root.kind === 'composite' && root.operator === 'allOf' && root.children
      ? root.children.map(id => nodeMap.get(id)).filter((n): n is RequirementNode => n !== undefined)
      : [root];

  // Calculate stats - ONLY COUNT PRIMITIVE NODES (composites are structural, not evaluated by LLM)
  const primitiveNodes = nodes.filter(n => n.kind === 'primitive');
  const primitiveStates = evaluationStates.filter(s => {
    const node = nodeMap.get(s.nodeId);
    return node?.kind === 'primitive';
  });

  const completed = primitiveStates.filter(s => s.status === 'completed').length;
  const skipped = primitiveStates.filter(s => s.status === 'skipped').length;
  const evaluating = primitiveStates.filter(s => s.status === 'evaluating').length;
  const errors = primitiveStates.filter(s => s.status === 'error').length;
  const pending = primitiveStates.filter(s => s.status === 'pending').length;
  const passed = primitiveStates.filter(s => s.status === 'completed' && s.result?.decision).length;
  const failed = primitiveStates.filter(s => s.status === 'completed' && !s.result?.decision).length;
  const resolved = completed + skipped;

  // Debug logging
  console.log('📊 [Grid Stats]', {
    totalNodes,
    totalNodesInTree: nodes.length,
    primitiveNodesInTree: primitiveNodes.length,
    evaluationStatesCount: evaluationStates.length,
    primitiveStatesCount: primitiveStates.length,
    completed,
    skipped,
    passed,
    failed,
    isRunning,
  });

  // Progress calculation: Handle short-circuit optimization
  // If evaluation status is 'completed', always show 100% (even if some nodes skipped)
  // If evaluation status is 'running' but all nodes are completed/pending (no 'evaluating'), treat as complete (short-circuit)
  const noNodesCurrentlyEvaluating = primitiveStates.every(s => s.status !== 'evaluating');
  const hasResolvedNodes = resolved > 0;
  const isShortCircuited =
    (evaluationStatus === 'running' || isRunning) &&
    noNodesCurrentlyEvaluating &&
    hasResolvedNodes;

  const progress = (() => {
    if (totalNodes === 0) return 0;
    if (evaluationStatus === 'completed' || isShortCircuited) return 100;
    return Math.min(100, (resolved / totalNodes) * 100);
  })();
  const currentNode = primitiveStates.find(s => s.status === 'evaluating');

  // Show progress header if evaluation is running or has results
  const showProgress = isRunning || hasResolvedNodes;

  // Calculate applicability status (generic across PNs)
  const hasResults = hasResolvedNodes;
  // Check BOTH database status AND completion count (handles short-circuit optimization)
  const allCompleted =
    evaluationStatus === 'completed' ||
    isShortCircuited ||
    (resolved === totalNodes && totalNodes > 0);
  const isEvaluationFinished = allCompleted && !isRunning;

  // Get ROOT node evaluation result - this determines if the norm APPLIES or NOT
  const rootState = evaluationStates.find(s => s.nodeId === rootId);
  const rootDecision = rootState?.result?.decision;

  console.log('🎯 [Applicability Check]', {
    evaluationStatus,
    completed,
    skipped,
    totalNodes,
    allCompleted,
    isRunning,
    isEvaluationFinished,
    rootId,
    rootDecision,
  });

  // Always show summary once evaluation has started (has any results or is running)
  const showSummary = hasResults || isRunning;

  // Determine if norm APPLIES (not compliance - that's a separate question!)
  const applicabilityStatus = !hasResults ? 'pending' :
    (isRunning || !isEvaluationFinished) ? 'evaluating' :
    rootDecision === true ? 'applies' :
    rootDecision === false ? 'does-not-apply' :
    'unknown';

  return (
    <div className="space-y-3">
      {/* Compact Stats Bar - Refined */}
      {showProgress && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between gap-4">
            {/* Left: Status & Progress */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isRunning ? (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                ) : (
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                )}
                <span className="text-xs font-medium text-neutral-700 tabular-nums">
                  {evaluationStatus === 'completed' ? totalNodes : resolved}/{totalNodes}
                </span>
              </div>

              {/* Inline Progress Bar */}
              <div className="flex-1 bg-neutral-100 rounded-full h-1.5 min-w-[100px] max-w-[200px]">
                <div
                  className="h-full bg-blue-500 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="text-xs font-semibold text-blue-600 tabular-nums min-w-[3ch]">
                {Math.round(progress)}%
              </span>

              {/* Stats Pills - Compact */}
              <div className="flex items-center gap-1.5 text-[10px]">
                {passed > 0 && (
                  <div className="px-2 py-0.5 bg-green-50 text-green-700 rounded font-medium border border-green-200">
                    {passed}
                  </div>
                )}
                {failed > 0 && (
                  <div className="px-2 py-0.5 bg-red-50 text-red-700 rounded font-medium border border-red-200">
                    {failed}
                  </div>
                )}
                {skipped > 0 && (
                  <div className="px-2 py-0.5 bg-neutral-50 text-neutral-500 rounded font-medium border border-neutral-200">
                    {skipped}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Current Node (if running) */}
            {currentNode && (
              <div className="flex items-center gap-2 text-xs text-neutral-600 truncate max-w-md">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                <span className="truncate font-mono">{currentNode.nodeId}</span>
              </div>
            )}

            {/* Expand Button */}
            <button
              onClick={() => setProgressExpanded(!progressExpanded)}
              className="p-1 hover:bg-neutral-50 rounded transition-colors flex-shrink-0"
            >
              <svg
                className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                  progressExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Expanded Details */}
          {progressExpanded && (
            <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-500 uppercase tracking-wide font-medium text-[10px]">Status</span>
                  <div className="text-neutral-900 font-medium mt-0.5">
                    {isRunning ? 'In Progress' : 'Complete'}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase tracking-wide font-medium text-[10px]">Completed</span>
                  <div className="text-neutral-900 font-medium mt-0.5 tabular-nums">{resolved} of {totalNodes}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Obligation Summary Card */}
      {showSummary && (
        <div ref={summaryCardRef} className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2 flex items-center justify-between gap-3 bg-neutral-50 border-b border-neutral-200">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Title */}
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide break-words">
                {pnArticle && pnTitle ? `Article ${pnArticle}: ${pnTitle}` : (pnTitle || 'Obligation Summary')}
              </h4>

              {/* Status Badge - Only show final status when complete */}
              {isEvaluationFinished && (
                <div className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${
                  applicabilityStatus === 'applies' ? 'bg-green-50 text-green-700 border border-green-200' :
                  applicabilityStatus === 'does-not-apply' ? 'bg-neutral-50 text-neutral-700 border border-neutral-200' :
                  'bg-neutral-50 text-neutral-700 border border-neutral-200'
                }`}>
                  {applicabilityStatus === 'applies' ? 'Applies' :
                   applicabilityStatus === 'does-not-apply' ? 'Does Not Apply' :
                   'Unknown'}
                </div>
              )}

              {(isRunning || !isEvaluationFinished) && hasResults && (
                <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Evaluating
                </div>
              )}
            </div>

            {/* Expand Button */}
            <button
              onClick={() => setSummaryExpanded(!summaryExpanded)}
              className="p-1 hover:bg-neutral-100 rounded transition-colors flex-shrink-0"
            >
              <svg
                className={`w-3.5 h-3.5 text-neutral-600 transition-transform duration-200 ${
                  summaryExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Expanded Content */}
          {summaryExpanded && (
            <div className="px-4 py-3 space-y-3 text-xs w-full min-w-0">
              {/* Legal Consequence (if available) */}
              {pnLegalText && (
                <div className="min-w-0">
                  <div className="font-bold text-neutral-900 mb-1.5 text-[10px] uppercase tracking-wide">
                    Legal Consequence
                  </div>
                  <div className="text-neutral-700 text-xs leading-relaxed bg-neutral-50 rounded p-3 border border-neutral-200 break-words">
                    {pnLegalText}
                  </div>
                </div>
              )}

              {/* Applicability Result - Only show when complete */}
              {isEvaluationFinished && applicabilityStatus === 'applies' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-semibold text-green-900 mb-2 text-sm">
                    This Obligation Applies
                  </div>
                  <div className="text-green-900 text-xs leading-relaxed mb-2 opacity-90">
                    {`Based on the evaluation, `}
                    <strong>
                      {pnArticle && pnTitle
                        ? `Article ${pnArticle} ${pnTitle} obligations apply to your AI system.`
                        : 'this obligation applies to your AI system.'}
                    </strong>
                  </div>
                  <div className="text-green-900 text-xs leading-relaxed opacity-90">
                    <strong>What this means:</strong> You must implement measures to ensure sufficient AI literacy
                    among your staff and persons dealing with the operation and use of your AI system.
                  </div>
                </div>
              )}

              {isEvaluationFinished && applicabilityStatus === 'does-not-apply' && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <div className="font-semibold text-neutral-900 mb-2 text-sm">
                    This Obligation Does Not Apply
                  </div>
                  <div className="text-neutral-700 text-xs leading-relaxed">
                    {`Based on the evaluation, `}
                    <strong>
                      {pnArticle && pnTitle
                        ? `Article ${pnArticle} ${pnTitle} obligations do not apply to your AI system.`
                        : 'this obligation does not apply to your AI system.'}
                    </strong>
                    {` You may not be required to implement measures under this specific obligation.`}
                  </div>
                </div>
              )}

              {!isEvaluationFinished && (isRunning || hasResults) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Evaluation In Progress
                  </div>
                  <div className="text-blue-900 text-xs leading-relaxed opacity-90">
                    {pnArticle && pnTitle
                      ? `AI is currently evaluating whether Article ${pnArticle} ${pnTitle} obligations apply to your AI system.`
                      : 'AI is currently evaluating whether this obligation applies to your AI system.'}
                    {` The result will be determined once the evaluation is complete.`}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Title - Compact with View Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
          Requirements Assessment
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="flex bg-neutral-100 rounded p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-2.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
                viewMode === 'tree'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Tree
            </button>
          </div>
        </div>
      </div>

      {/* Requirements View - Grid or Tree */}
      {viewMode === 'grid' ? (
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${rootLevelRequirements.length}, minmax(280px, 1fr))`,
          }}
        >
          {rootLevelRequirements.map((req, idx) => (
            <RequirementBlock
              key={req.id}
              node={req}
              nodeMap={nodeMap}
              allNodes={nodes}
              evaluationStates={evaluationStates}
              onNodeClick={onNodeClick}
              numberPrefix={toRomanNumeral(idx + 1)} // I, II, III...
              depth={0}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          {rootLevelRequirements.map((req, idx) => (
            <TreeNode
              key={req.id}
              node={req}
              nodeMap={nodeMap}
              allNodes={nodes}
              evaluationStates={evaluationStates}
              onNodeClick={onNodeClick}
              numberPrefix={toRomanNumeral(idx + 1)}
              depth={0}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// TREEMAXX 🌲💪 - The Ultimate Interactive Tree View
function TreeNode({
  node,
  nodeMap,
  allNodes,
  evaluationStates,
  onNodeClick,
  numberPrefix,
  depth,
  selectedNodeId,
}: {
  node: RequirementNode;
  nodeMap: Map<string, RequirementNode>;
  allNodes: RequirementNode[];
  evaluationStates: EvaluationState[];
  onNodeClick: (nodeId: string) => void;
  numberPrefix: string;
  depth: number;
  selectedNodeId?: string | null;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const state = evaluationStates.find(s => s.nodeId === node.id);
  const status = state?.status || 'pending';
  const result = state?.result;
  const isSelected = selectedNodeId === node.id;
  const isEvaluating = status === 'evaluating';
  const isPrimitive = node.kind === 'primitive';
  const hasChildren = node.kind === 'composite' && node.children && node.children.length > 0;

  // ONLY primitives get the full "AI thinking" treatment!
  const isActiveSubsumption = isEvaluating && isPrimitive;

  // Auto-expand ONLY when completed (not when evaluating - keeps focus tight!)
  useEffect(() => {
    if (status === 'completed' && !isExpanded && hasChildren) {
      setIsExpanded(true);
    }
  }, [status, isExpanded, hasChildren]);

  // Auto-show details ONLY for primitive nodes being evaluated (actual subsumption)
  useEffect(() => {
    if (isActiveSubsumption && !showDetails) {
      setShowDetails(true);
    }
  }, [isActiveSubsumption, showDetails]);

  // Auto-select ONLY when evaluating primitive nodes
  useEffect(() => {
    if (isActiveSubsumption && selectedNodeId !== node.id) {
      onNodeClick(node.id);
    }
  }, [isActiveSubsumption, selectedNodeId, node.id, onNodeClick]);

  // Auto-scroll ONLY to primitive nodes being evaluated
  useEffect(() => {
    if (isActiveSubsumption && nodeRef.current) {
      nodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isActiveSubsumption]);

  // Calculate child stats for composite nodes
  const childStats = hasChildren && node.children ? {
    total: node.children.length,
    passed: node.children.filter(id => {
      const childState = evaluationStates.find(s => s.nodeId === id);
      return childState?.status === 'completed' && childState?.result?.decision;
    }).length,
    failed: node.children.filter(id => {
      const childState = evaluationStates.find(s => s.nodeId === id);
      return childState?.status === 'completed' && !childState?.result?.decision;
    }).length,
    evaluating: node.children.filter(id => {
      const childState = evaluationStates.find(s => s.nodeId === id);
      return childState?.status === 'evaluating';
    }).length,
  } : null;

  return (
    <>
      <div
        ref={nodeRef}
        className={`group relative transition-all duration-200 ${
          isActiveSubsumption
            ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset animate-pulse shadow-lg z-10'
            : isSelected
            ? 'bg-blue-50/50'
            : ''
        } ${
          status === 'completed' && result?.decision ? 'bg-green-50/30' : ''
        } ${status === 'completed' && !result?.decision ? 'bg-red-50/30' : ''}`}
      >
        {/* Main Row */}
        <div
          className={`flex items-center gap-2 px-3 py-2 hover:bg-neutral-100/50 border-b border-neutral-100 cursor-pointer transition-all ${
            isActiveSubsumption
              ? 'border-l-4 border-l-blue-600 shadow-md bg-gradient-to-r from-blue-100 to-transparent'
              : isSelected
              ? 'border-l-4 border-l-blue-500 shadow-sm'
              : 'border-l-4 border-l-transparent'
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => {
            onNodeClick(node.id);
          }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-0.5 hover:bg-neutral-200 rounded transition-colors"
            >
              <svg
                className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>
            </button>
          ) : (
            <div className="w-4 flex-shrink-0">
              <div className="w-1 h-1 rounded-full bg-neutral-300 mx-auto" />
            </div>
          )}

          {/* Number with depth coloring */}
          <span className={`text-xs font-mono flex-shrink-0 w-12 font-semibold ${
            depth === 0 ? 'text-blue-600' :
            depth === 1 ? 'text-indigo-600' :
            depth === 2 ? 'text-purple-600' :
            'text-neutral-500'
          }`}>
            {numberPrefix}.
          </span>

          {/* Status Icon with animations */}
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {status === 'evaluating' && (
              <div className="relative">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 w-4 h-4 border-2 border-blue-400 rounded-full animate-ping opacity-25" />
              </div>
            )}
            {status === 'completed' && result && (
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                result.decision
                  ? 'bg-gradient-to-br from-green-400 to-green-500 text-white'
                  : 'bg-gradient-to-br from-red-400 to-red-500 text-white'
              }`}>
                {result.decision ? '✓' : '✗'}
              </div>
            )}
            {status === 'pending' && (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-300 bg-white" />
            )}
            {status === 'error' && (
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-xs font-bold text-red-600">!</span>
              </div>
            )}
          </div>

          {/* Label with depth sizing */}
          <span className={`flex-1 text-neutral-900 truncate font-medium ${
            depth === 0 ? 'text-base' :
            depth === 1 ? 'text-sm' :
            'text-sm'
          }`}>
            {node.label}
          </span>

          {/* Operator badge for composite nodes */}
          {node.kind === 'composite' && node.operator && (
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              node.operator === 'allOf'
                ? 'bg-blue-100 text-blue-700'
                : node.operator === 'anyOf'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-neutral-100 text-neutral-700'
            }`}>
              {node.operator === 'allOf' ? 'ALL' : node.operator === 'anyOf' ? 'ANY' : node.operator}
            </span>
          )}

          {/* Child Stats (for composite) */}
          {childStats && childStats.total > 0 && (
            <div className="flex items-center gap-1 text-xs">
              {childStats.passed > 0 && (
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                  {childStats.passed}✓
                </span>
              )}
              {childStats.failed > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium">
                  {childStats.failed}✗
                </span>
              )}
              {childStats.evaluating > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium animate-pulse">
                  {childStats.evaluating}⟳
                </span>
              )}
            </div>
          )}

          {/* Confidence Badge with color coding */}
          {status === 'completed' && result && (
            <div className={`px-2 py-0.5 rounded text-xs font-semibold ${
              result.confidence >= 0.9 ? 'bg-green-100 text-green-700' :
              result.confidence >= 0.7 ? 'bg-yellow-100 text-yellow-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {(result.confidence * 100).toFixed(0)}%
            </div>
          )}

          {/* Details toggle */}
          {(node.kind === 'primitive' && node.question) || (status === 'completed' && result) ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              className="p-1 hover:bg-neutral-200 rounded transition-colors opacity-0 group-hover:opacity-100"
              title="Show details"
            >
              <svg
                className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${
                  showDetails ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : (
            <div className="w-5" />
          )}
        </div>

        {/* Inline Details Panel */}
        {showDetails && (
          <div className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200 px-4 py-2 text-xs animate-in slide-in-from-top-2 fade-in duration-200"
               style={{ paddingLeft: `${depth * 20 + 40}px` }}>

            {/* AI Thinking Indicator - ONLY for primitives */}
            {isActiveSubsumption && (
              <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-500 rounded animate-pulse">
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <span className="font-semibold text-blue-900 text-xs">
                    AI is analyzing this requirement...
                  </span>
                </div>
                <div className="mt-1.5 text-blue-700 italic text-[10px]">
                  Evaluating compliance based on legal context and case facts
                </div>
              </div>
            )}

            {/* Question */}
            {node.kind === 'primitive' && node.question && (
              <div className="mb-2">
                <div className="font-semibold text-neutral-700 mb-1 uppercase tracking-wide text-[10px]">Question:</div>
                <div className="text-neutral-900 leading-relaxed text-xs">{node.question.prompt}</div>
                {node.question.help && (
                  <div className="mt-1 text-neutral-600 italic text-[10px]">{node.question.help}</div>
                )}
              </div>
            )}

            {/* Legal Context */}
            {node.context?.items && node.context.items.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold text-neutral-700 mb-1 uppercase tracking-wide text-[10px]">Legal Context:</div>
                {node.context.items.map((item, idx) => (
                  <div key={idx} className="pl-2 border-l-2 border-neutral-300 mb-1.5">
                    <div className="font-medium text-neutral-800 text-xs">{item.label}</div>
                    <div className="text-neutral-600 leading-relaxed text-xs">{item.text}</div>
                    {item.sources?.[0] && (
                      <div className="mt-0.5 font-mono text-neutral-500 text-[10px]">
                        Art. {item.sources[0].article}
                        {item.sources[0].paragraph && `(${item.sources[0].paragraph})`}
                        {item.sources[0].point && ` pt. ${item.sources[0].point}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* AI Reasoning */}
            {status === 'completed' && result && (
              <div>
                <div className="font-semibold text-neutral-700 mb-1 uppercase tracking-wide text-[10px]">AI Analysis:</div>
                <div className="bg-white rounded p-2 border border-neutral-200 text-neutral-900 leading-relaxed text-xs">
                  {result.reasoning}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Children - Recursive */}
      {isExpanded && hasChildren && node.children?.map((childId, idx) => {
        const child = nodeMap.get(childId);
        if (!child) return null;

        return (
          <TreeNode
            key={childId}
            node={child}
            nodeMap={nodeMap}
            allNodes={allNodes}
            evaluationStates={evaluationStates}
            onNodeClick={onNodeClick}
            numberPrefix={`${numberPrefix}.${toLetterOrNumber(idx, depth + 1)}`}
            depth={depth + 1}
            selectedNodeId={selectedNodeId}
          />
        );
      })}
    </>
  );
}

// Helper function for numbering
function toLetterOrNumber(index: number, depth: number): string {
  if (depth === 1) return String.fromCharCode(65 + index); // A, B, C
  if (depth === 2) return (index + 1).toString();           // 1, 2, 3
  if (depth === 3) return String.fromCharCode(97 + index); // a, b, c
  return (index + 1).toString(); // fallback
}
