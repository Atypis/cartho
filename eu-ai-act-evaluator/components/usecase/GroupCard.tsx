'use client';

/**
 * GroupCard Component
 *
 * Displays a group of Prescriptive Norms with:
 * - Shared applicability gates
 * - Individual obligations
 * - Group evaluation capability
 * - Progress tracking
 */

import { useState } from 'react';

interface PNStatus {
  pnId: string;
  article: string;
  title: string;
  status: 'applies' | 'not-applicable' | 'pending' | 'evaluating';
  evaluationId?: string;
  evaluatedAt?: string;
  rootDecision?: boolean;
}

interface Group {
  id: string;
  title: string;
  article: string;
  description: string;
  effective_date: string;
  shared_gates: string[];
  members: string[];
}

interface SharedPrimitive {
  id: string;
  title?: string;
  path: string;
}

interface GroupCardProps {
  group: Group;
  pnStatuses: PNStatus[];
  sharedPrimitives: SharedPrimitive[];
  onEvaluateGroup: (groupId: string, pnIds: string[]) => void;
  onEvaluatePN: (pnId: string) => void;
  onViewPN: (pnId: string, evaluationId?: string) => void;
}

// Helper function to resolve gate label
function resolveGateLabel(gateRef: string, sharedPrimitives: SharedPrimitive[]): string {
  const primitive = sharedPrimitives.find(sp => sp.id === gateRef);
  return primitive?.title || gateRef;
}

export function GroupCard({
  group,
  pnStatuses,
  sharedPrimitives,
  onEvaluateGroup,
  onEvaluatePN,
  onViewPN
}: GroupCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedPNs, setSelectedPNs] = useState<string[]>([]);

  // Get statuses for PNs in this group
  const groupPNStatuses = pnStatuses.filter(ps => group.members.includes(ps.pnId));

  // Calculate group statistics
  const totalObligations = group.members.length;
  const evaluatedCount = groupPNStatuses.filter(ps => ps.status !== 'pending').length;
  const appliesCount = groupPNStatuses.filter(ps => ps.status === 'applies').length;
  const notApplicableCount = groupPNStatuses.filter(ps => ps.status === 'not-applicable').length;
  const evaluatingCount = groupPNStatuses.filter(ps => ps.status === 'evaluating').length;
  const pendingCount = groupPNStatuses.filter(ps => ps.status === 'pending').length;

  // Determine overall group status
  let groupStatus: 'pending' | 'partial' | 'evaluated';
  if (pendingCount === totalObligations) {
    groupStatus = 'pending';
  } else if (pendingCount > 0 || evaluatingCount > 0) {
    groupStatus = 'partial';
  } else {
    groupStatus = 'evaluated';
  }

  const handleSelectAll = () => {
    if (selectedPNs.length === group.members.length) {
      setSelectedPNs([]);
    } else {
      setSelectedPNs([...group.members]);
    }
  };

  const handleTogglePN = (pnId: string) => {
    setSelectedPNs(prev =>
      prev.includes(pnId)
        ? prev.filter(id => id !== pnId)
        : [...prev, pnId]
    );
  };

  const handleEvaluateGroup = () => {
    const pnsToEvaluate = selectedPNs.length > 0 ? selectedPNs : group.members;
    onEvaluateGroup(group.id, pnsToEvaluate);
    setSelectedPNs([]);
  };

  return (
    <div data-group-card className="bg-white rounded-lg border border-neutral-200 mb-2">
      {/* Header - Always Visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-neutral-900 truncate">{group.title}</h3>
            <span className="text-[10px] text-neutral-500 flex-shrink-0">
              {totalObligations} obligations
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-neutral-600 break-words">{group.description}</span>
            {groupStatus === 'pending' && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                Pending Evaluation
              </span>
            )}
            {groupStatus === 'partial' && (
              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded font-medium">
                {evaluatedCount}/{totalObligations} Evaluated
              </span>
            )}
            {groupStatus === 'evaluated' && (
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                ✓ Fully Evaluated
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Status Summary */}
          {evaluatedCount > 0 && (
            <div className="flex items-center gap-2 text-xs">
              {appliesCount > 0 && (
                <span className="text-green-700">{appliesCount} apply</span>
              )}
              {notApplicableCount > 0 && (
                <span className="text-neutral-500">{notApplicableCount} N/A</span>
              )}
              {evaluatingCount > 0 && (
                <span className="text-blue-600">{evaluatingCount} running</span>
              )}
            </div>
          )}

          {/* Expand Icon */}
          <svg
            className={`w-5 h-5 text-neutral-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-neutral-200">
          {/* Shared Applicability Gates */}
          <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-neutral-900 mb-1.5">
                  Shared Applicability Gates ({group.shared_gates.length})
                </h4>
                <div className="text-[11px] text-neutral-600 space-y-1">
                  {group.shared_gates.map((gate, idx) => {
                    const isNegated = gate.startsWith('!');
                    const gateRef = gate.replace('!', '');
                    const gateLabel = resolveGateLabel(gateRef, sharedPrimitives);

                    return (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="flex-shrink-0 font-semibold">
                          {isNegated ? '✗ NOT' : '✓'}
                        </span>
                        <div>
                          <div className="font-medium">{gateLabel}</div>
                          {gateLabel !== gateRef && (
                            <div className="text-neutral-400 font-mono text-[10px]">{gateRef}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  These conditions are evaluated once and reused across all {totalObligations} obligations
                </p>
              </div>
              <div className="text-xs text-neutral-500">
                Effective: {new Date(group.effective_date).toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>

          {/* Individual Obligations List */}
          <div className="px-4 py-3">
            <h4 className="text-xs font-semibold text-neutral-900 mb-2">
              Individual Obligations ({group.members.length})
            </h4>

            <div className="space-y-1.5 mb-3">
              {group.members.map((pnId, idx) => {
                const pnStatus = groupPNStatuses.find(ps => ps.pnId === pnId);
                const status = pnStatus?.status || 'pending';

                return (
                  <div
                    key={pnId}
                    className="flex items-center gap-2 p-2 rounded border border-neutral-200 hover:border-neutral-300 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPNs.includes(pnId)}
                      onChange={() => handleTogglePN(pnId)}
                      className="w-3.5 h-3.5 text-neutral-900 rounded flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-neutral-900">{pnId}</span>
                        {status === 'applies' && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                            Applies
                          </span>
                        )}
                        {status === 'not-applicable' && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded font-medium">
                            N/A
                          </span>
                        )}
                        {status === 'pending' && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-600 truncate">
                        {pnStatus?.title || `Obligation ${idx + 1}`}
                      </div>
                    </div>

                    {pnStatus?.evaluationId && (
                      <button
                        onClick={() => onViewPN(pnId, pnStatus.evaluationId)}
                        className="text-xs px-3 py-1.5 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                      >
                        View Details →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
              <button
                onClick={handleSelectAll}
                className="text-xs px-3 py-1.5 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
              >
                {selectedPNs.length === group.members.length ? 'Deselect All' : 'Select All'}
              </button>

              <button
                onClick={handleEvaluateGroup}
                disabled={selectedPNs.length === 0 && pendingCount === 0}
                className="text-xs px-4 py-1.5 bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {selectedPNs.length > 0
                  ? `Evaluate Selected (${selectedPNs.length})`
                  : `Evaluate All (${totalObligations})`}
              </button>

              {pendingCount > 0 && pendingCount < totalObligations && (
                <button
                  onClick={() => {
                    const pendingPNIds = groupPNStatuses
                      .filter(ps => ps.status === 'pending')
                      .map(ps => ps.pnId);
                    onEvaluateGroup(group.id, pendingPNIds);
                  }}
                  className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Evaluate Pending ({pendingCount})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
