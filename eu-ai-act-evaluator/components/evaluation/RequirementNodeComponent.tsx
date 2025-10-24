'use client';

/**
 * Custom Node Component for Requirement Visualization
 *
 * Shows requirement status, confidence, and provides visual feedback
 * Click to expand for detailed view
 */

import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeStatus, EvaluationResult, Question, Context } from '@/lib/evaluation/types';

interface RequirementNodeData {
  label: string;
  kind: 'composite' | 'primitive';
  operator?: 'allOf' | 'anyOf';
  status: NodeStatus;
  result?: EvaluationResult;
  error?: string;
  question?: Question;
  context?: Context;
}

export const RequirementNodeComponent = memo(({ data, selected }: NodeProps & { data: RequirementNodeData }) => {
  const { label, kind, operator, status, result, error, question, context } = data;
  const [expanded, setExpanded] = useState(false);

  // Determine node styling based on status
  const getNodeStyle = () => {
    const baseClasses = expanded
      ? 'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[200px] max-w-[400px]'
      : 'px-4 py-3 rounded-lg border-2 shadow-md min-w-[200px] max-w-[300px]';

    const selectedRing = selected ? 'ring-2 ring-blue-400 ring-offset-2' : '';

    switch (status) {
      case 'evaluating':
        return `${baseClasses} ${selectedRing} bg-blue-50 border-blue-400 animate-pulse cursor-pointer`;
      case 'completed':
        if (result?.decision) {
          return `${baseClasses} ${selectedRing} bg-green-50 border-green-500 cursor-pointer`;
        } else {
          return `${baseClasses} ${selectedRing} bg-red-50 border-red-500 cursor-pointer`;
        }
      case 'error':
        return `${baseClasses} ${selectedRing} bg-red-100 border-red-600 cursor-pointer`;
      case 'pending':
      default:
        return `${baseClasses} ${selectedRing} bg-gray-50 border-gray-300 cursor-pointer`;
    }
  };

  // Status indicator icon
  const getStatusIcon = () => {
    switch (status) {
      case 'evaluating':
        return (
          <div className="inline-block w-3 h-3 rounded-full bg-blue-500 animate-ping" />
        );
      case 'completed':
        if (result?.decision) {
          return <span className="text-green-600 font-bold">✓</span>;
        } else {
          return <span className="text-red-600 font-bold">✗</span>;
        }
      case 'error':
        return <span className="text-red-600 font-bold">!</span>;
      default:
        return <span className="text-gray-400">○</span>;
    }
  };

  return (
    <div className={getNodeStyle()} onClick={() => setExpanded(!expanded)}>
      {/* Input handle for parent connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-400 !w-3 !h-3"
      />

      {/* Node content */}
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-1">{getStatusIcon()}</div>
        <div className="flex-1 min-w-0">
          {/* Node label */}
          <div className="font-medium text-sm text-gray-900 break-words">
            {label}
          </div>

          {/* Node type badge */}
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            {kind === 'composite' && operator && (
              <span className="text-xs font-mono px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                {operator === 'allOf' ? 'AND' : 'OR'}
              </span>
            )}
            {kind === 'primitive' && (
              <span className="text-xs font-mono px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                EVAL
              </span>
            )}
            {/* Expand indicator */}
            <button
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            >
              {expanded ? '▼' : '▶'}
            </button>
          </div>

          {/* Confidence score for completed evaluations */}
          {status === 'completed' && result && !expanded && (
            <div className="mt-2 text-xs text-gray-600">
              Confidence: {(result.confidence * 100).toFixed(0)}%
            </div>
          )}

          {/* Error message */}
          {error && !expanded && (
            <div className="mt-2 text-xs text-red-600 break-words">
              Error: {error}
            </div>
          )}

          {/* Expanded details */}
          {expanded && (
            <div className="mt-3 space-y-3 text-xs border-t border-gray-200 pt-3">
              {/* Question (for primitive nodes) */}
              {kind === 'primitive' && question && (
                <div>
                  <div className="font-semibold text-gray-700 mb-1">Question:</div>
                  <div className="text-gray-600 italic">{question.prompt}</div>
                  {question.help && (
                    <div className="mt-1 text-gray-500">
                      <span className="font-medium">Guidance:</span> {question.help}
                    </div>
                  )}
                </div>
              )}

              {/* Context */}
              {context && context.items && context.items.length > 0 && (
                <div>
                  <div className="font-semibold text-gray-700 mb-1">Legal Context:</div>
                  <div className="space-y-2">
                    {context.items.map((item, idx) => (
                      <div key={idx} className="pl-2 border-l-2 border-gray-300">
                        <div className="font-medium text-gray-600">{item.label}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{item.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evaluation Result */}
              {status === 'completed' && result && (
                <div>
                  <div className="font-semibold text-gray-700 mb-1">Evaluation Result:</div>
                  <div className="space-y-1">
                    <div>
                      <span className="font-medium">Decision:</span>{' '}
                      <span className={result.decision ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {result.decision ? 'YES ✓' : 'NO ✗'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Confidence:</span> {(result.confidence * 100).toFixed(0)}%
                    </div>
                    <div>
                      <span className="font-medium">Reasoning:</span>
                      <div className="mt-1 text-gray-600 bg-gray-50 p-2 rounded">
                        {result.reasoning}
                      </div>
                    </div>
                  </div>

                  {/* LLM Transparency Details */}
                  {(result.prompt || result.llm_raw_response) && (
                    <details className="mt-3 group">
                      <summary className="cursor-pointer text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1">
                        <span className="group-open:rotate-90 transition-transform">▶</span>
                        🔍 Show LLM Details (Transparency)
                      </summary>
                      <div className="mt-2 space-y-2 pl-3 border-l-2 border-blue-300">
                        <div>
                          <div className="font-medium text-gray-700 mb-1">Model:</div>
                          <div className="font-mono text-xs text-gray-600">GPT-5-mini (reasoning: high)</div>
                        </div>

                        {result.prompt && (
                          <div>
                            <div className="font-medium text-gray-700 mb-1">Full Prompt Sent:</div>
                            <pre className="text-[10px] bg-slate-900 text-green-400 p-2 rounded overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
                              {result.prompt}
                            </pre>
                          </div>
                        )}

                        {result.llm_raw_response && (
                          <div>
                            <div className="font-medium text-gray-700 mb-1">Raw LLM Response:</div>
                            <pre className="text-[10px] bg-slate-900 text-green-400 p-2 rounded overflow-x-auto max-h-48 overflow-y-auto font-mono">
                              {JSON.stringify(result.llm_raw_response, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {/* Status info */}
              {status === 'evaluating' && (
                <div className="text-blue-600 font-medium">⏳ Evaluating...</div>
              )}

              {error && (
                <div>
                  <div className="font-semibold text-red-700 mb-1">Error:</div>
                  <div className="text-red-600 bg-red-50 p-2 rounded">{error}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Output handle for child connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-400 !w-3 !h-3"
      />
    </div>
  );
});

RequirementNodeComponent.displayName = 'RequirementNodeComponent';
