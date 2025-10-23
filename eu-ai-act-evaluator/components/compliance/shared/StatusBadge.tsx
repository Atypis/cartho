/**
 * StatusBadge Component
 *
 * Displays applicability and implementation status with appropriate styling
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ApplicabilityState = 'pending' | 'evaluating' | 'applies' | 'not_applicable';
type ImplementationState = 'not_started' | 'in_progress' | 'compliant' | 'partial' | 'non_compliant' | 'waived';

interface StatusBadgeProps {
  type: 'applicability' | 'implementation';
  status: ApplicabilityState | ImplementationState;
  className?: string;
}

const applicabilityConfig: Record<ApplicabilityState, { label: string; variant: string; className: string }> = {
  pending: {
    label: 'Pending',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  evaluating: {
    label: 'Evaluating',
    variant: 'secondary',
    className: 'bg-blue-100 text-blue-700 border-blue-300 animate-pulse',
  },
  applies: {
    label: 'Applies',
    variant: 'default',
    className: 'bg-green-100 text-green-700 border-green-300',
  },
  not_applicable: {
    label: 'Not Applicable',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-500 border-gray-300',
  },
};

const implementationConfig: Record<ImplementationState, { label: string; variant: string; className: string }> = {
  not_started: {
    label: 'Not Started',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  in_progress: {
    label: 'In Progress',
    variant: 'default',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  },
  compliant: {
    label: 'Compliant',
    variant: 'default',
    className: 'bg-green-100 text-green-700 border-green-300',
  },
  partial: {
    label: 'Partial',
    variant: 'default',
    className: 'bg-orange-100 text-orange-700 border-orange-300',
  },
  non_compliant: {
    label: 'Non-Compliant',
    variant: 'destructive',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
  waived: {
    label: 'Waived',
    variant: 'secondary',
    className: 'bg-purple-100 text-purple-700 border-purple-300',
  },
};

export function StatusBadge({ type, status, className }: StatusBadgeProps) {
  const config = type === 'applicability'
    ? applicabilityConfig[status as ApplicabilityState]
    : implementationConfig[status as ImplementationState];

  if (!config) {
    return <Badge variant="outline">Unknown</Badge>;
  }

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
