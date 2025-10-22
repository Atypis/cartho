'use client';

import type { UseCaseFormData, UseCaseAnalysis } from '@/lib/usecase/types';

interface CompletionSummaryProps {
  formData: UseCaseFormData;
  analysis: UseCaseAnalysis;
  onProceed: () => void;
}

export function CompletionSummary({ formData, analysis, onProceed }: CompletionSummaryProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 animate-fadeIn">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900 mb-3 tracking-tight">
          Use Case Ready
        </h1>
        <p className="text-neutral-600 text-[15px] leading-relaxed max-w-2xl mx-auto">
          We have {analysis.isComplete ? 'everything' : 'enough'} we need to evaluate your AI system against EU AI Act requirements.
        </p>
      </div>

      {/* Use Case Summary Card */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-semibold text-neutral-900 mb-2">
              {formData.title}
            </h3>
            <p className="text-[14px] text-neutral-600 leading-relaxed line-clamp-3">
              {formData.description}
            </p>
          </div>
        </div>

        {/* Extracted Information Summary */}
        {analysis.extractedInfo && (
          <div className="mt-6 pt-6 border-t border-neutral-200 grid grid-cols-2 gap-4">
            {analysis.extractedInfo.systemPurpose && (
              <div>
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                  Purpose
                </div>
                <div className="text-[13px] text-neutral-700">
                  {analysis.extractedInfo.systemPurpose.substring(0, 80)}
                  {analysis.extractedInfo.systemPurpose.length > 80 ? '...' : ''}
                </div>
              </div>
            )}
            {analysis.extractedInfo.geographicScope && (
              <div>
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                  Geographic Scope
                </div>
                <div className="text-[13px] text-neutral-700">
                  {analysis.extractedInfo.geographicScope}
                </div>
              </div>
            )}
            {analysis.extractedInfo.userRole && (
              <div>
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                  Your Role
                </div>
                <div className="text-[13px] text-neutral-700">
                  {analysis.extractedInfo.userRole}
                </div>
              </div>
            )}
            {analysis.extractedInfo.technicalDetails && (
              <div>
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                  Technical Approach
                </div>
                <div className="text-[13px] text-neutral-700">
                  {analysis.extractedInfo.technicalDetails.substring(0, 80)}
                  {analysis.extractedInfo.technicalDetails.length > 80 ? '...' : ''}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Completeness Indicator */}
      {!analysis.isComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-[14px] text-amber-900 leading-relaxed">
                Some details are still missing, but we have enough to begin the evaluation. You may be asked for additional clarification during the assessment if needed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={onProceed}
          type="button"
          className="px-10 py-3 bg-neutral-900 text-white rounded-lg text-[15px]
                   font-medium hover:bg-neutral-800 transition-all duration-200
                   hover:scale-[1.02] active:scale-[0.98] shadow-sm"
        >
          Proceed to Evaluation
        </button>
      </div>
    </div>
  );
}
