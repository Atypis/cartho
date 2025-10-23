'use client';

/**
 * TaskRow Component - Unified display for obligations and groups
 *
 * Single, consistent component that handles both:
 * - Individual obligations (single PN)
 * - Grouped obligations (multiple PNs with shared requirements)
 *
 * Design principle: Same visual pattern regardless of type
 * Grouping is indicated by member count and expand arrow, not different styling
 */

import { useState } from 'react';

export interface PNStatus {
  pnId: string;
  article: string;
  title: string;
  status: 'applies' | 'not-applicable' | 'pending' | 'evaluating';
  evaluationId?: string;
  evaluatedAt?: string;
  rootDecision?: boolean;
  progressCurrent?: number;
  progressTotal?: number;
}

export interface Group {
  id: string;
  title: string;
  article: string;
  description: string;
  effective_date: string;
  shared_gates: string[];
  members: string[];
}

export interface SharedPrimitive {
  id: string;
  title?: string;
  path: string;
}

interface TaskRowProps {
  // Either a group OR an individual PN (mutually exclusive)
  group?: Group;
  pnStatus?: PNStatus;

  // Required for groups
  groupPNStatuses?: PNStatus[];
  sharedPrimitives?: SharedPrimitive[];

  // Actions
  onEvaluate: (pnIds: string[], options?: { forceGroup?: boolean }) => void;
  onViewDetails: (pnId: string, evaluationId?: string) => void;

  // Selection state (for pending tasks)
  isSelectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function TaskRow({
  group,
  pnStatus,
  groupPNStatuses = [],
  sharedPrimitives = [],
  onEvaluate,
  onViewDetails,
  isSelectable = false,
  isSelected = false,
  onToggleSelect,
}: TaskRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if this is a group or individual task
  const isGroup = !!group;
  const isIndividual = !!pnStatus;

  if (!isGroup && !isIndividual) {
    throw new Error('TaskRow requires either group or pnStatus prop');
  }

  // Get task metadata
  const taskId = isGroup ? group!.id : pnStatus!.pnId;
  const taskArticle = isGroup ? group!.article : pnStatus!.article;
  const taskTitle = isGroup ? group!.title : pnStatus!.title;
  const taskDescription = isGroup ? group!.description : null;

  // Calculate status for groups (aggregated from members)
  const groupStatus = isGroup ? calculateGroupStatus(groupPNStatuses) : null;
  const taskStatus = isGroup ? groupStatus!.overallStatus : pnStatus!.status;

  // Member count for groups
  const memberCount = isGroup ? group!.members.length : null;

  // Progress for individual evaluating tasks
  const showProgress = isIndividual && pnStatus!.progressCurrent !== undefined && pnStatus!.progressTotal;
  const progress = showProgress ? `${pnStatus!.progressCurrent}/${pnStatus!.progressTotal}` : null;

  // Evaluation date
  const evaluatedAt = isIndividual && pnStatus!.evaluatedAt
    ? new Date(pnStatus!.evaluatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })
    : null;

  // Can expand? (groups can always expand, individuals only when evaluated)
  const canExpand = isGroup || (isIndividual && (pnStatus!.status === 'applies' || pnStatus!.status === 'not-applicable' || pnStatus!.status === 'evaluating'));

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-sm transition-all">
      {/* Main Row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Checkbox (only for pending tasks) */}
        {isSelectable && onToggleSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 text-neutral-900 rounded flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Status Indicator */}
        <div className="flex-shrink-0">
          <StatusBadge status={taskStatus} />
        </div>

        {/* Task Info - Clickable area */}
        <button
          onClick={() => {
            if (canExpand) {
              if (isGroup) {
                setIsExpanded(!isExpanded);
              } else if (isIndividual && pnStatus!.evaluationId) {
                onViewDetails(pnStatus!.pnId, pnStatus!.evaluationId);
              }
            }
          }}
          disabled={!canExpand}
          className="flex-1 flex items-start justify-between text-left min-w-0 gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {/* ID or Group label */}
              <span className="text-xs font-mono font-semibold text-neutral-900 flex-shrink-0">
                {isGroup ? `Group` : taskId}
              </span>

              {/* Article chip */}
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider flex-shrink-0">
                Art. {taskArticle}
              </span>

              {/* Member count for groups */}
              {isGroup && memberCount && (
                <span className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded font-medium">
                  {memberCount} obligations
                </span>
              )}
            </div>

            {/* Title */}
            <div className="text-sm text-neutral-900 font-medium truncate">
              {taskTitle}
            </div>

            {/* Description (for groups) */}
            {isGroup && taskDescription && !isExpanded && (
              <div className="text-xs text-neutral-600 truncate mt-0.5">
                {taskDescription}
              </div>
            )}
          </div>

          {/* Right side: Metadata */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Group Stats */}
            {isGroup && groupStatus && (
              <div className="flex items-center gap-2 text-xs">
                {groupStatus.appliesCount > 0 && (
                  <span className="text-green-700 font-medium">{groupStatus.appliesCount} apply</span>
                )}
                {groupStatus.notApplicableCount > 0 && (
                  <span className="text-neutral-500">{groupStatus.notApplicableCount} N/A</span>
                )}
                {groupStatus.evaluatingCount > 0 && (
                  <span className="text-blue-600 font-medium">{groupStatus.evaluatingCount} running</span>
                )}
                {groupStatus.pendingCount > 0 && (
                  <span className="text-neutral-600">{groupStatus.pendingCount} pending</span>
                )}
              </div>
            )}

            {/* Individual Progress */}
            {progress && (
              <span className="text-xs text-blue-600 font-medium tabular-nums">
                {progress}
              </span>
            )}

            {/* Evaluated Date */}
            {evaluatedAt && (
              <span className="text-xs text-neutral-400">
                {evaluatedAt}
              </span>
            )}

            {/* Expand Arrow */}
            {canExpand && (
              <svg
                className={`w-4 h-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </button>

        {/* Action Button (only for pending) */}
        {taskStatus === 'pending' && !isSelectable && (
          <button
            onClick={() => {
              const pnIds = isGroup ? group!.members : [pnStatus!.pnId];
              onEvaluate(pnIds, isGroup ? { forceGroup: true } : undefined);
            }}
            className="px-4 py-1.5 text-sm bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium flex-shrink-0"
          >
            Evaluate
          </button>
        )}
      </div>

      {/* Expanded Content (for groups) */}
      {isGroup && isExpanded && (
        <div className="border-t border-neutral-200">
          {/* Shared Gates */}
          <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
            <h4 className="text-xs font-semibold text-neutral-900 mb-2">
              Shared Applicability Conditions
            </h4>
            <div className="text-xs text-neutral-600 space-y-1">
              {group!.shared_gates.map((gate, idx) => {
                const isNegated = gate.startsWith('!');
                const gateRef = gate.replace('!', '');
                const primitive = sharedPrimitives.find(sp => sp.id === gateRef);
                const gateLabel = primitive?.title || gateRef;

                return (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="flex-shrink-0 font-semibold">
                      {isNegated ? '✗' : '✓'}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium">{gateLabel}</div>
                      {gateLabel !== gateRef && (
                        <div className="text-neutral-400 font-mono text-[10px]">{gateRef}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-neutral-500 mt-2 italic">
              These conditions are evaluated once for all {memberCount} obligations
            </p>
          </div>

          {/* Member Obligations */}
          <div className="px-4 py-3">
            <h4 className="text-xs font-semibold text-neutral-900 mb-2">
              Member Obligations ({memberCount})
            </h4>
            <div className="space-y-1.5">
              {group!.members.map((pnId) => {
                const memberStatus = groupPNStatuses.find(ps => ps.pnId === pnId);
                if (!memberStatus) return null;

                return (
                  <button
                    key={pnId}
                    onClick={() => memberStatus.evaluationId && onViewDetails(pnId, memberStatus.evaluationId)}
                    disabled={!memberStatus.evaluationId}
                    className="w-full flex items-center justify-between p-2 rounded border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors text-left disabled:cursor-default disabled:hover:bg-white disabled:hover:border-neutral-200"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-mono font-semibold text-neutral-900 flex-shrink-0">
                        {pnId}
                      </span>
                      <span className="text-xs text-neutral-700 truncate">
                        {memberStatus.title}
                      </span>
                    </div>
                    <StatusBadge status={memberStatus.status} compact />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: Calculate group status from member statuses
function calculateGroupStatus(memberStatuses: PNStatus[]) {
  const total = memberStatuses.length;
  const appliesCount = memberStatuses.filter(ps => ps.status === 'applies').length;
  const notApplicableCount = memberStatuses.filter(ps => ps.status === 'not-applicable').length;
  const evaluatingCount = memberStatuses.filter(ps => ps.status === 'evaluating').length;
  const pendingCount = memberStatuses.filter(ps => ps.status === 'pending').length;

  // Determine overall status
  let overallStatus: PNStatus['status'];
  if (evaluatingCount > 0) {
    overallStatus = 'evaluating';
  } else if (pendingCount === total) {
    overallStatus = 'pending';
  } else if (appliesCount === total) {
    overallStatus = 'applies';
  } else if (notApplicableCount === total) {
    overallStatus = 'not-applicable';
  } else if (pendingCount > 0) {
    overallStatus = 'pending'; // Mixed with pending = still pending
  } else {
    overallStatus = 'applies'; // Mixed evaluated states = show as applies if any apply
  }

  return {
    overallStatus,
    total,
    appliesCount,
    notApplicableCount,
    evaluatingCount,
    pendingCount,
  };
}

// Status Badge Component
function StatusBadge({ status, compact = false }: { status: PNStatus['status']; compact?: boolean }) {
  const config = {
    pending: {
      icon: '○',
      label: 'Pending',
      bg: 'bg-neutral-100',
      text: 'text-neutral-600',
      border: 'border-neutral-200',
    },
    evaluating: {
      icon: '⟳',
      label: 'Evaluating',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      animated: true,
    },
    applies: {
      icon: '✓',
      label: 'Applies',
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    'not-applicable': {
      icon: '✗',
      label: 'Does Not Apply',
      bg: 'bg-neutral-50',
      text: 'text-neutral-600',
      border: 'border-neutral-200',
    },
  };

  const c = config[status];

  if (compact) {
    return (
      <span className={`text-xs px-2 py-0.5 rounded font-medium border ${c.bg} ${c.text} ${c.border} ${c.animated ? 'animate-pulse' : ''}`}>
        {c.icon}
      </span>
    );
  }

  return (
    <div className={`px-3 py-1 rounded-md text-xs font-semibold border flex items-center gap-1.5 ${c.bg} ${c.text} ${c.border} ${c.animated ? 'animate-pulse' : ''}`}>
      <span>{c.icon}</span>
      <span>{c.label}</span>
    </div>
  );
}
