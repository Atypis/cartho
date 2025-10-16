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
}

export function RequirementsGrid({
  nodes,
  rootId,
  evaluationStates,
  onNodeClick,
  selectedNodeId,
  isRunning = false,
  totalNodes = 0,
}: RequirementsGridProps) {
  const [progressExpanded, setProgressExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'tree'>('tree'); // TREE IS DEFAULT 🌲
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const root = nodeMap.get(rootId);

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

  // Calculate stats
  const completed = evaluationStates.filter(s => s.status === 'completed').length;
  const evaluating = evaluationStates.filter(s => s.status === 'evaluating').length;
  const errors = evaluationStates.filter(s => s.status === 'error').length;
  const pending = evaluationStates.filter(s => s.status === 'pending').length;
  const passed = evaluationStates.filter(s => s.status === 'completed' && s.result?.decision).length;
  const failed = evaluationStates.filter(s => s.status === 'completed' && !s.result?.decision).length;

  const progress = totalNodes > 0 ? (completed / totalNodes) * 100 : 0;
  const currentNode = evaluationStates.find(s => s.status === 'evaluating');

  // Show progress header if evaluation is running or has results
  const showProgress = isRunning || completed > 0;

  return (
    <div className="space-y-4">
      {/* Compact Stats Bar - Cockpit Style */}
      {showProgress && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 overflow-hidden">
          <div className="px-4 py-2.5 flex items-center justify-between gap-4">
            {/* Left: Status & Progress */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isRunning ? (
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
                    <div className="absolute inset-0 w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping opacity-75" />
                  </div>
                ) : (
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                )}
                <span className="text-xs font-semibold text-neutral-700">
                  {completed}/{totalNodes}
                </span>
              </div>

              {/* Inline Progress Bar */}
              <div className="flex-1 bg-blue-200 rounded-full h-1.5 min-w-[100px] max-w-[200px]">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Stats Pills - Compact */}
              <div className="flex items-center gap-1.5 text-xs">
                {passed > 0 && (
                  <div className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                    ✓ {passed}
                  </div>
                )}
                {failed > 0 && (
                  <div className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-medium">
                    ✗ {failed}
                  </div>
                )}
                {evaluating > 0 && (
                  <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                    ⟳ {evaluating}
                  </div>
                )}
                {pending > 0 && (
                  <div className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded font-medium">
                    {pending}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Current Node (if running) */}
            {currentNode && (
              <div className="flex items-center gap-2 text-xs text-neutral-700 truncate max-w-md">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span className="truncate font-mono">{currentNode.nodeId}</span>
              </div>
            )}

            {/* Expand Button */}
            <button
              onClick={() => setProgressExpanded(!progressExpanded)}
              className="p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
            >
              <svg
                className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
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
            <div className="border-t border-blue-200 bg-white/50 px-4 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-500 uppercase tracking-wide font-semibold">Status:</span>
                  <span className="ml-2 text-neutral-900">
                    {isRunning ? 'In Progress' : 'Complete'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase tracking-wide font-semibold">Progress:</span>
                  <span className="ml-2 text-neutral-900">{progress.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Title - Compact with View Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-neutral-900">
          Requirements Assessment
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex bg-neutral-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
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
  const hasChildren = node.kind === 'composite' && node.children && node.children.length > 0;

  // Auto-expand when evaluating or completed
  useEffect(() => {
    if ((status === 'evaluating' || status === 'completed') && !isExpanded && hasChildren) {
      setIsExpanded(true);
    }
  }, [status, isExpanded, hasChildren]);

  // Auto-show details when evaluating (FOLLOW THE AI!)
  useEffect(() => {
    if (isEvaluating && !showDetails) {
      setShowDetails(true);
    }
  }, [isEvaluating, showDetails]);

  // Auto-select when evaluating (highlight it!)
  useEffect(() => {
    if (isEvaluating && selectedNodeId !== node.id) {
      onNodeClick(node.id);
    }
  }, [isEvaluating, selectedNodeId, node.id, onNodeClick]);

  // Auto-scroll to evaluating node (FOLLOW THE AI IN REAL-TIME!)
  useEffect(() => {
    if (isEvaluating && nodeRef.current) {
      nodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isEvaluating]);

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
          isEvaluating ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset animate-pulse shadow-lg z-10' :
          isSelected ? 'bg-blue-50/50' : ''
        } ${
          status === 'completed' && result?.decision ? 'bg-green-50/30' : ''
        } ${status === 'completed' && !result?.decision ? 'bg-red-50/30' : ''}`}
      >
        {/* Main Row */}
        <div
          className={`flex items-center gap-2 px-3 py-2 hover:bg-neutral-100/50 border-b border-neutral-100 cursor-pointer transition-all ${
            isEvaluating
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
          <div className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200 px-6 py-3 text-xs animate-in slide-in-from-top-2 fade-in duration-200"
               style={{ paddingLeft: `${depth * 20 + 60}px` }}>

            {/* AI Thinking Indicator */}
            {isEvaluating && (
              <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <span className="font-semibold text-blue-900 text-sm">
                    AI is analyzing this requirement...
                  </span>
                </div>
                <div className="mt-2 text-blue-700 italic">
                  Reviewing legal context, applying reasoning, and determining compliance
                </div>
              </div>
            )}

            {/* Question */}
            {node.kind === 'primitive' && node.question && (
              <div className="mb-3">
                <div className="font-semibold text-neutral-700 mb-1 uppercase tracking-wide">Question:</div>
                <div className="text-neutral-900 leading-relaxed">{node.question.prompt}</div>
                {node.question.help && (
                  <div className="mt-1 text-neutral-600 italic">{node.question.help}</div>
                )}
              </div>
            )}

            {/* Legal Context */}
            {node.context?.items && node.context.items.length > 0 && (
              <div className="mb-3">
                <div className="font-semibold text-neutral-700 mb-1 uppercase tracking-wide">Legal Context:</div>
                {node.context.items.map((item, idx) => (
                  <div key={idx} className="pl-2 border-l-2 border-neutral-300 mb-2">
                    <div className="font-medium text-neutral-800">{item.label}</div>
                    <div className="text-neutral-600 leading-relaxed">{item.text}</div>
                    {item.sources?.[0] && (
                      <div className="mt-0.5 font-mono text-neutral-500">
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
                <div className="font-semibold text-neutral-700 mb-1 uppercase tracking-wide">AI Analysis:</div>
                <div className="bg-white rounded p-2 border border-neutral-200 text-neutral-900 leading-relaxed">
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
