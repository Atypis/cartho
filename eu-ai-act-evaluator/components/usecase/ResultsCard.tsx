'use client';

/**
 * ResultsCard Component - Modern expandable card for evaluation results
 *
 * Sophisticated design inspired by Linear, Vercel, and Stripe.
 * Emphasis on typography, spacing, and subtle interactions.
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

  // Configuration based on type
  const config = type === 'applies' ? {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    ),
    title: 'Applies',
    accentColor: 'text-green-600',
    iconBg: 'bg-green-500',
    countColor: 'text-neutral-900',
    metaColor: 'text-neutral-500',
  } : {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    title: 'Does Not Apply',
    accentColor: 'text-neutral-600',
    iconBg: 'bg-neutral-400',
    countColor: 'text-neutral-900',
    metaColor: 'text-neutral-500',
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
      })
    : null;

  return (
    <div className="group/card rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Card Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-5 text-left hover:bg-neutral-50/50 transition-colors duration-200"
      >
        <div className="flex items-center justify-between gap-6">
          {/* Left: Icon + Content */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Icon - Circular with solid color */}
            <div className={`w-11 h-11 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0 text-white shadow-sm`}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              {/* Title */}
              <div className="flex items-baseline gap-3 mb-1">
                <h3 className={`text-base font-semibold ${config.accentColor}`}>
                  {config.title}
                </h3>
                <span className={`text-2xl font-bold tabular-nums ${config.countColor}`}>
                  {totalCount}
                </span>
              </div>

              {/* Metadata - Clean, minimal */}
              {!isExpanded && (
                <div className={`flex items-center gap-4 text-sm ${config.metaColor}`}>
                  {/* Composition */}
                  {(groupCount > 0 || individualCount > 0) && (
                    <span className="font-medium">
                      {[
                        groupCount > 0 && `${groupCount} ${groupCount === 1 ? 'group' : 'groups'}`,
                        individualCount > 0 && `${individualCount} individual`
                      ].filter(Boolean).join(' · ')}
                    </span>
                  )}

                  {/* Articles */}
                  {articles.length > 0 && (
                    <span>
                      {articles.length === 1 ? `Art. ${articles[0]}` : `${articles.length} articles`}
                    </span>
                  )}

                  {/* Last Evaluated */}
                  {mostRecentDate && (
                    <span className="text-neutral-400">
                      {mostRecentDate}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Expand Button */}
          <div className={`w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover/card:bg-neutral-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Card Content - Expandable */}
      {isExpanded && (
        <div className="px-6 pb-5 pt-1 space-y-2 bg-neutral-50/30">
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
