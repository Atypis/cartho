'use client';

/**
 * ResultsCard Component - True minimalism
 *
 * Design philosophy: Remove everything that doesn't serve a purpose.
 * Let typography and white space do the work.
 */

import { useState } from 'react';
import { TaskRow, PNStatus, Group, SharedPrimitive } from './TaskRow';

interface ResultsCardProps {
  type: 'applies' | 'not-applicable';
  groups: Group[];
  ungroupedPNs: PNStatus[];
  allPNs: PNStatus[];
  sharedPrimitives: SharedPrimitive[];
  onEvaluate: (pnIds: string[], options?: { forceGroup?: boolean }) => void;
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
      })
    : null;

  // Minimal semantic color
  const accentColor = type === 'applies' ? 'text-green-600' : 'text-neutral-900';

  return (
    <div className="border border-neutral-200 rounded-lg bg-white hover:border-neutral-300 transition-colors">
      {/* Card Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Content */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Count */}
            <div className={`text-2xl font-bold tabular-nums ${accentColor}`}>
              {totalCount}
            </div>

            {/* Label + Metadata */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-neutral-900">
                {type === 'applies' ? 'Obligations Apply' : 'Obligations Do Not Apply'}
              </div>

              {!isExpanded && (
                <div className="text-xs text-neutral-400 truncate">
                  {[
                    groupCount > 0 && `${groupCount} ${groupCount === 1 ? 'group' : 'groups'}`,
                    individualCount > 0 && `${individualCount} individual`,
                    articles.length > 0 && (articles.length === 1 ? `Art. ${articles[0]}` : `${articles.length} articles`),
                    mostRecentDate
                  ].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
          </div>

          {/* Chevron */}
          <div className={`text-neutral-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Card Content */}
      {isExpanded && (
        <div className="px-4 pb-3 pt-1 space-y-2 border-t border-neutral-100">
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
