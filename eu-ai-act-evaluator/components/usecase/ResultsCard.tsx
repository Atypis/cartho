'use client';

/**
 * ResultsCard Component - Polished expandable card for evaluation results
 *
 * Displays a summary of evaluated obligations with rich metadata,
 * expandable to show individual obligation details.
 */

import { useState } from 'react';
import { TaskRow, PNStatus, Group, SharedPrimitive } from './TaskRow';

interface ResultsCardProps {
  type: 'applies' | 'not-applicable';
  groups: Group[];
  ungroupedPNs: PNStatus[];
  allPNs: PNStatus[];
  sharedPrimitives: SharedPrimitive[];
  onEvaluate: (pnIds: string[]) => void;
  onViewDetails: (pnId: string, evaluationId?: string) => void;
  defaultExpanded?: boolean;
}

export function ResultsCard({
  type,
  groups,
  ungroupedPNs,
  allPNs,
  sharedPrimitives,
  onEvaluate,
  onViewDetails,
  defaultExpanded = false,
}: ResultsCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Configuration based on type
  const config = type === 'applies' ? {
    icon: '✓',
    title: 'Obligations That Apply',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
  } : {
    icon: '✗',
    title: 'Obligations That Do Not Apply',
    bgColor: 'bg-neutral-50',
    borderColor: 'border-neutral-200',
    textColor: 'text-neutral-700',
    badgeBg: 'bg-neutral-100',
    badgeText: 'text-neutral-600',
    iconBg: 'bg-neutral-100',
    iconText: 'text-neutral-500',
  };

  // Calculate metadata
  const totalCount = allPNs.length;
  const groupCount = groups.length;
  const individualCount = ungroupedPNs.length;

  // Get unique articles
  const articles = Array.from(new Set(allPNs.map(pn => pn.article))).sort();

  // Get most recent evaluation date
  const evaluationDates = allPNs
    .map(pn => pn.evaluatedAt)
    .filter(Boolean)
    .sort()
    .reverse();
  const mostRecentDate = evaluationDates[0]
    ? new Date(evaluationDates[0]).toLocaleDateString('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  return (
    <div className={`rounded-lg border-2 ${config.borderColor} overflow-hidden transition-all hover:shadow-sm bg-white`}>
      {/* Card Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-5 py-4 ${config.bgColor} hover:brightness-95 transition-all flex items-center justify-between gap-4`}
      >
        {/* Left: Icon + Title + Count */}
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-lg ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
            <span className={`text-lg font-bold ${config.iconText}`}>{config.icon}</span>
          </div>

          {/* Title + Count */}
          <div className="text-left">
            <h3 className={`text-sm font-bold ${config.textColor} uppercase tracking-wide`}>
              {config.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-lg font-bold ${config.textColor}`}>
                {totalCount}
              </span>
              <span className="text-xs text-neutral-600">
                {totalCount === 1 ? 'obligation' : 'obligations'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Metadata + Expand Button */}
        <div className="flex items-center gap-4">
          {/* Summary Metadata (when collapsed) */}
          {!isExpanded && (
            <div className="flex items-center gap-3 text-xs text-neutral-600">
              {/* Groups + Individuals */}
              {(groupCount > 0 || individualCount > 0) && (
                <div className="flex items-center gap-1.5">
                  {groupCount > 0 && (
                    <span className={`px-2 py-1 rounded ${config.badgeBg} ${config.badgeText} font-medium`}>
                      {groupCount} {groupCount === 1 ? 'group' : 'groups'}
                    </span>
                  )}
                  {individualCount > 0 && (
                    <span className={`px-2 py-1 rounded ${config.badgeBg} ${config.badgeText} font-medium`}>
                      {individualCount} individual
                    </span>
                  )}
                </div>
              )}

              {/* Articles */}
              {articles.length > 0 && (
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-neutral-500">
                    Art. {articles.length === 1 ? articles[0] : `${articles.length} articles`}
                  </span>
                </div>
              )}

              {/* Last Evaluated */}
              {mostRecentDate && (
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-neutral-500">{mostRecentDate}</span>
                </div>
              )}
            </div>
          )}

          {/* Expand/Collapse Button */}
          <div className={`w-8 h-8 rounded-lg ${config.iconBg} flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className={`w-4 h-4 ${config.iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Card Content - Expandable */}
      {isExpanded && (
        <div className="p-4 space-y-2 bg-white border-t border-neutral-100">
          {/* Groups */}
          {groups.map(group => (
            <TaskRow
              key={group.id}
              group={group}
              groupPNStatuses={allPNs.filter(ps => group.members.includes(ps.pnId))}
              sharedPrimitives={sharedPrimitives}
              onEvaluate={onEvaluate}
              onViewDetails={onViewDetails}
            />
          ))}

          {/* Individual PNs */}
          {ungroupedPNs.map(pn => (
            <TaskRow
              key={pn.pnId}
              pnStatus={pn}
              onEvaluate={onEvaluate}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
