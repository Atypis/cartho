'use client';

/**
 * Detail Panel Component
 *
 * Shows detailed information about a selected requirement node
 * Displays: question, legal context, evaluation result
 */

import type { RequirementNode, EvaluationState } from '@/lib/evaluation/types';

interface DetailPanelProps {
  node: RequirementNode;
  state?: EvaluationState;
  onClose: () => void;
}

export function DetailPanel({ node, state, onClose }: DetailPanelProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1 font-medium">
            Selected Requirement
          </div>
          <div className="text-lg font-semibold text-neutral-900">
            {node.label}
          </div>
        </div>
        <button
          className="text-neutral-400 hover:text-neutral-900 transition-colors p-1"
          onClick={onClose}
          aria-label="Close detail panel"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Question (for primitive nodes) */}
      {node.kind === 'primitive' && node.question && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
            Question
          </div>
          <div className="text-sm text-neutral-900 leading-relaxed">
            {node.question.prompt}
          </div>
          {node.question.help && (
            <div className="mt-3 text-sm text-neutral-600 bg-neutral-50 rounded-lg p-4 leading-relaxed">
              <span className="font-medium">Guidance:</span> {node.question.help}
            </div>
          )}
        </div>
      )}

      {/* Legal Context */}
      {node.context?.items && node.context.items.length > 0 && (
        <div className="border-t border-neutral-200 pt-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">
            Legal Context
          </div>
          <div className="space-y-4">
            {node.context.items.map((item, idx) => (
              <div key={idx} className="pl-4 border-l-2 border-neutral-200">
                <div className="text-xs font-medium text-neutral-700 mb-1">
                  {item.label}
                </div>
                <div className="text-sm text-neutral-600 leading-relaxed">
                  {item.text}
                </div>
                {item.sources?.[0] && (
                  <div className="mt-2 text-xs font-mono text-neutral-500">
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

      {/* Source References (if no context items) */}
      {node.sources && node.sources.length > 0 && (!node.context?.items || node.context.items.length === 0) && (
        <div className="border-t border-neutral-200 pt-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">
            Legal Sources
          </div>
          <div className="space-y-2">
            {node.sources.map((source, idx) => (
              <div key={idx} className="text-sm text-neutral-700">
                <span className="font-mono text-xs text-neutral-500">
                  Art. {source.article}
                  {source.paragraph && `(${source.paragraph})`}
                  {source.point && ` pt. ${source.point}`}
                </span>
                {source.quote && (
                  <div className="mt-1 text-xs text-neutral-600 italic pl-3 border-l-2 border-neutral-200">
                    "{source.quote}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluation Result */}
      {state?.status === 'completed' && state.result && (
        <div className="border-t border-neutral-200 pt-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">
            Evaluation Result
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold ${
                state.result.decision ? 'text-green-600' : 'text-red-600'
              }`}>
                {state.result.decision ? 'YES ✓' : 'NO ✗'}
              </span>
              <span className="text-sm text-neutral-600">
                {(state.result.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            <div className="text-sm text-neutral-700 bg-neutral-50 rounded-lg p-4 leading-relaxed">
              {state.result.reasoning}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {state?.status === 'evaluating' && (
        <div className="flex items-center gap-3 text-blue-600 border-t border-neutral-200 pt-6">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-blue-600" />
          <span className="text-sm font-medium">Evaluating this requirement...</span>
        </div>
      )}

      {/* Error State */}
      {state?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 border-t border-neutral-200 mt-6">
          <div className="text-sm font-medium text-red-900 mb-1">Error</div>
          <div className="text-sm text-red-700">{state.error}</div>
        </div>
      )}
    </div>
  );
}
