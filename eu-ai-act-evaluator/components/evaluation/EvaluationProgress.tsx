'use client';

/**
 * Evaluation Progress Component
 *
 * Shows real-time progress of an ongoing evaluation
 * Displays: progress bar, current node, completed/remaining counts
 */

import { useState } from 'react';
import type { EvaluationState } from '@/lib/evaluation/types';

interface EvaluationProgressProps {
  evaluationId: string;
  states: EvaluationState[];
  totalNodes: number;
  isRunning: boolean;
  onCancel?: () => void;
}

export function EvaluationProgress({
  evaluationId,
  states,
  totalNodes,
  isRunning,
  onCancel,
}: EvaluationProgressProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completed = states.filter(s => s.status === 'completed').length;
  const evaluating = states.filter(s => s.status === 'evaluating').length;
  const errors = states.filter(s => s.status === 'error').length;
  const pending = states.filter(s => s.status === 'pending').length;

  const progress = totalNodes > 0 ? (completed / totalNodes) * 100 : 0;

  const currentNode = states.find(s => s.status === 'evaluating');

  if (!isRunning && completed === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-96 animate-in slide-in-from-right duration-300">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-500 overflow-hidden">
        {/* Header */}
        <div
          className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              {isRunning ? (
                <div className="relative">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-75" />
                </div>
              ) : (
                <div className="w-3 h-3 bg-green-400 rounded-full" />
              )}
              <div>
                <div className="font-semibold text-sm">
                  {isRunning ? 'Evaluation Running' : 'Evaluation Complete'}
                </div>
                <div className="text-xs opacity-90">
                  {completed}/{totalNodes} requirements
                </div>
              </div>
            </div>
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 bg-blue-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stats */}
          <div className="mt-2 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>{completed} done</span>
            </div>
            {evaluating > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span>{evaluating} running</span>
              </div>
            )}
            {pending > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-neutral-400 rounded-full" />
                <span>{pending} pending</span>
              </div>
            )}
            {errors > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                <span>{errors} errors</span>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="max-h-96 overflow-y-auto">
            {/* Current Node */}
            {currentNode && (
              <div className="bg-yellow-50 border-b border-yellow-200 p-4">
                <div className="text-xs font-semibold text-yellow-800 mb-1 uppercase tracking-wide">
                  Currently Evaluating
                </div>
                <div className="text-sm text-yellow-900 font-medium">
                  {currentNode.nodeId}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-1 h-1 bg-yellow-600 rounded-full animate-pulse" />
                  <div className="text-xs text-yellow-700">Analyzing with AI...</div>
                </div>
              </div>
            )}

            {/* Node List */}
            <div className="p-3 space-y-1 max-h-64 overflow-y-auto">
              {states.map((state) => (
                <div
                  key={state.nodeId}
                  className={`px-3 py-2 rounded text-xs flex items-center gap-2 ${
                    state.status === 'completed'
                      ? 'bg-green-50 text-green-900'
                      : state.status === 'evaluating'
                      ? 'bg-yellow-50 text-yellow-900 ring-1 ring-yellow-300'
                      : state.status === 'error'
                      ? 'bg-red-50 text-red-900'
                      : 'bg-neutral-50 text-neutral-600'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {state.status === 'completed' ? (
                      <span className="text-green-600">✓</span>
                    ) : state.status === 'evaluating' ? (
                      <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                    ) : state.status === 'error' ? (
                      <span className="text-red-600">✗</span>
                    ) : (
                      <div className="w-2 h-2 bg-neutral-400 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 truncate font-mono">{state.nodeId}</div>
                  {state.result && (
                    <div className={`text-xs font-semibold ${
                      state.result.decision ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {state.result.decision ? 'YES' : 'NO'}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Button */}
            {onCancel && (
              <div className="border-t border-neutral-200 p-3">
                <button
                  onClick={onCancel}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isRunning
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-neutral-600 hover:bg-neutral-700 text-white'
                  }`}
                >
                  {isRunning ? 'Cancel Evaluation' : 'Close'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
