'use client';

import { useState } from 'react';
import type { UseCaseAnalysis, ClarificationAnswers } from '@/lib/usecase/types';

interface ClarificationViewProps {
  analysis: UseCaseAnalysis;
  onSubmit: (answers: ClarificationAnswers) => void;
  onSkip: () => void;
}

export function ClarificationView({ analysis, onSubmit, onSkip }: ClarificationViewProps) {
  const [answers, setAnswers] = useState<ClarificationAnswers>({});

  const handleSubmit = () => {
    // Filter out empty answers
    const validAnswers = Object.fromEntries(
      Object.entries(answers).filter(([_, value]) => value.trim() !== '')
    );
    onSubmit(validAnswers);
  };

  const hasAnyAnswers = Object.values(answers).some(a => a.trim() !== '');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-3 tracking-tight">
          We need a bit more information
        </h1>
        <p className="text-neutral-600 text-[15px] leading-relaxed max-w-2xl mx-auto">
          We understood the core of your use case, but need clarification on a few points to provide an accurate evaluation.
        </p>
      </div>

      {/* Coverage Dashboard */}
      <div className="mb-8 bg-neutral-50 border border-neutral-200 rounded-xl p-6">
        <div className="space-y-3">
          {analysis.coverageAreas.map((area) => (
            <div key={area.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {area.status === 'complete' && (
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                )}
                {area.status === 'needs_clarification' && (
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                )}
                {area.status === 'missing' && (
                  <div className="w-2 h-2 rounded-full bg-neutral-300"></div>
                )}
                <span className="text-[14px] font-medium text-neutral-900">
                  {area.label}
                </span>
              </div>
              <span className={`text-[13px] font-medium ${
                area.status === 'complete'
                  ? 'text-green-700'
                  : area.status === 'needs_clarification'
                  ? 'text-orange-700'
                  : 'text-neutral-500'
              }`}>
                {area.status === 'complete' && 'Clear'}
                {area.status === 'needs_clarification' && 'Needs clarification'}
                {area.status === 'missing' && 'Missing'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-neutral-200"></div>
        <span className="text-[13px] font-medium text-neutral-500 uppercase tracking-wide">
          Questions for you
        </span>
        <div className="flex-1 h-px bg-neutral-200"></div>
      </div>

      {/* Question Cards */}
      <div className="space-y-6 mb-8">
        {analysis.clarificationQuestions.map((question, index) => (
          <div
            key={question.id}
            className="border border-neutral-200 rounded-xl p-6 hover:border-neutral-300 transition-colors"
          >
            {/* Question Header */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-[15px] font-semibold text-neutral-900 flex items-center gap-2">
                {index + 1}. {question.area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              {question.status === 'needs_clarification' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[11px] font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                  NEEDS CLARIFICATION
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400"></div>
                  MISSING
                </span>
              )}
            </div>

            {/* Question Text */}
            <p className="text-[15px] text-neutral-700 leading-relaxed mb-4">
              {question.question}
            </p>

            {/* Context (if provided) */}
            {question.context && (
              <p className="text-[13px] text-neutral-500 italic mb-4">
                {question.context}
              </p>
            )}

            {/* Answer Textarea */}
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => setAnswers(prev => ({
                ...prev,
                [question.id]: e.target.value
              }))}
              placeholder="Answer here..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-neutral-200
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                       focus:outline-none transition-all duration-200 text-[15px]
                       resize-none placeholder:text-neutral-400 leading-relaxed"
            />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
        <button
          onClick={onSkip}
          type="button"
          className="px-6 py-2.5 text-[14px] font-medium text-neutral-600
                   hover:text-neutral-900 transition-colors"
        >
          Skip for now
        </button>
        <button
          onClick={handleSubmit}
          type="button"
          disabled={!hasAnyAnswers}
          className="px-8 py-2.5 bg-neutral-900 text-white rounded-lg text-[14px]
                   font-medium hover:bg-neutral-800 disabled:opacity-50
                   disabled:cursor-not-allowed transition-all duration-200
                   hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
        >
          Update & Re-analyze
        </button>
      </div>
    </div>
  );
}
