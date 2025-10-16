'use client';

/**
 * Requirement Block Component
 *
 * Displays a single requirement card with its children
 * Handles status visualization, numbering, and interaction
 */

import { useState } from 'react';
import type { RequirementNode, EvaluationState, NodeStatus, EvaluationResult } from '@/lib/evaluation/types';
import { shouldSkipNode } from '@/lib/evaluation/skip-logic';

interface RequirementBlockProps {
  node: RequirementNode;
  nodeMap: Map<string, RequirementNode>;
  allNodes: RequirementNode[];
  evaluationStates: EvaluationState[];
  onNodeClick: (nodeId: string) => void;
  numberPrefix: string;
  depth: number;
  selectedNodeId?: string | null;
}

export function RequirementBlock({
  node,
  nodeMap,
  allNodes,
  evaluationStates,
  onNodeClick,
  numberPrefix,
  depth,
  selectedNodeId,
}: RequirementBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const state = evaluationStates.find(s => s.nodeId === node.id);
  const status = state?.status || 'pending';
  const result = state?.result;

  const isSkipped = shouldSkipNode(node.id, allNodes, evaluationStates);
  const isSelected = selectedNodeId === node.id;

  // Show detail panel if there's content to show
  const hasDetails = (node.kind === 'primitive' && node.question) ||
                     (node.context?.items && node.context.items.length > 0) ||
                     (status === 'completed' && result);

  return (
    <div className="space-y-3">
      {/* Main Card */}
      <div
        className={`
          bg-white border rounded-lg overflow-hidden
          transition-all duration-300 ease-in-out
          ${isSkipped ? 'opacity-60' : 'opacity-100'}
          ${getStatusBorderClass(status, result, isSelected)}
          ${isExpanded ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : 'hover:shadow-md'}
        `}
      >
        <div
          className="p-4 cursor-pointer group"
          onClick={() => {
            if (hasDetails) {
              setIsExpanded(!isExpanded);
            }
            onNodeClick(node.id);
          }}
        >
        {/* Number + Label */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-xs font-mono text-neutral-400 w-8 mt-0.5">
            {numberPrefix}.
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-neutral-900 leading-snug group-hover:text-neutral-700 transition-colors">
              {node.label}
            </div>
            {/* Operator Badge for Composites */}
            {node.kind === 'composite' && node.operator && (
              <div className="mt-2">
                <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded font-medium">
                  {node.operator === 'allOf' ? 'ALL required' : 'ONE required'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            {getStatusIcon(status, result, isSkipped)}
            {hasDetails && (
              <svg
                className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Confidence Badge (if completed) */}
        {status === 'completed' && result && !isSkipped && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-600">
            <div className="w-1 h-1 rounded-full bg-neutral-400" />
            {(result.confidence * 100).toFixed(0)}% confidence
          </div>
        )}
        </div>

        {/* Expandable Detail Panel */}
        {isExpanded && hasDetails && (
          <div className="border-t border-neutral-200 bg-gradient-to-b from-neutral-50 to-white p-5 animate-in slide-in-from-top-2 fade-in duration-300">
            {/* Question (for primitive nodes) */}
            {node.kind === 'primitive' && node.question && (
              <div className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                  Question
                </div>
                <div className="text-sm text-neutral-900 leading-relaxed">
                  {node.question.prompt}
                </div>
                {node.question.help && (
                  <div className="mt-2 text-xs text-neutral-600 bg-white rounded p-3 leading-relaxed">
                    <span className="font-medium">Guidance:</span> {node.question.help}
                  </div>
                )}
              </div>
            )}

            {/* Legal Context */}
            {node.context?.items && node.context.items.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                  Legal Context
                </div>
                <div className="space-y-3">
                  {node.context.items.map((item, idx) => (
                    <div key={idx} className="pl-3 border-l-2 border-neutral-300">
                      <div className="text-xs font-medium text-neutral-700 mb-1">
                        {item.label}
                      </div>
                      <div className="text-xs text-neutral-600 leading-relaxed">
                        {item.text}
                      </div>
                      {item.sources?.[0] && (
                        <div className="mt-1 text-xs font-mono text-neutral-500">
                          Art. {item.sources[0].article}
                          {item.sources[0].paragraph && `(${item.sources[0].paragraph})`}
                          {item.sources[0].point && ` pt. ${item.sources[0].point}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evaluation Result */}
            {status === 'completed' && result && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                  Evaluation Result
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      result.decision ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.decision ? 'YES ✓' : 'NO ✗'}
                    </span>
                    <span className="text-xs text-neutral-600">
                      {(result.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <div className="text-xs text-neutral-700 bg-white rounded p-3 leading-relaxed">
                    {result.reasoning}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Children (Vertical Expansion) */}
      {node.kind === 'composite' && node.children && node.children.length > 0 && (
        <div className="space-y-2 pl-6 border-l-2 border-neutral-200">
          {node.children.map((childId, idx) => {
            const child = nodeMap.get(childId);
            if (!child) return null;

            return (
              <RequirementBlock
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
        </div>
      )}
    </div>
  );
}

/**
 * Helper: Convert index to letter or number based on depth
 */
function toLetterOrNumber(index: number, depth: number): string {
  if (depth === 1) return String.fromCharCode(65 + index); // A, B, C
  if (depth === 2) return (index + 1).toString();           // 1, 2, 3
  if (depth === 3) return String.fromCharCode(97 + index); // a, b, c
  return (index + 1).toString(); // fallback
}

/**
 * Helper: Get border/background classes based on status
 */
function getStatusBorderClass(
  status: NodeStatus,
  result?: EvaluationResult,
  isSelected?: boolean
): string {
  const selectedClass = isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : '';

  if (status === 'evaluating') {
    return `border-blue-500 bg-blue-50 ${selectedClass}`;
  }
  if (status === 'completed') {
    return result?.decision
      ? `border-green-500 bg-green-50 ${selectedClass}`
      : `border-red-500 bg-red-50 ${selectedClass}`;
  }
  if (status === 'error') {
    return `border-red-600 bg-red-50 ${selectedClass}`;
  }
  return `border-neutral-200 ${selectedClass}`; // pending
}

/**
 * Helper: Get status icon
 */
function getStatusIcon(
  status: NodeStatus,
  result?: EvaluationResult,
  isSkipped?: boolean
): JSX.Element {
  if (isSkipped) {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-neutral-300 bg-neutral-100" />
    );
  }

  if (status === 'evaluating') {
    return (
      <div className="w-5 h-5">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-neutral-200 border-t-blue-500" />
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        result?.decision ? 'bg-green-100' : 'bg-red-100'
      }`}>
        <span className={`text-xs font-bold ${
          result?.decision ? 'text-green-600' : 'text-red-600'
        }`}>
          {result?.decision ? '✓' : '✗'}
        </span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
        <span className="text-xs font-bold text-red-600">!</span>
      </div>
    );
  }

  // pending
  return (
    <div className="w-5 h-5 rounded-full border-2 border-neutral-300" />
  );
}
