/**
 * RiskBadge Component
 *
 * Displays risk level with appropriate styling
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface RiskBadgeProps {
  level: RiskLevel | null;
  showIcon?: boolean;
  className?: string;
}

const riskConfig: Record<RiskLevel, { label: string; className: string }> = {
  low: {
    label: 'Low Risk',
    className: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  medium: {
    label: 'Medium Risk',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  },
  high: {
    label: 'High Risk',
    className: 'bg-orange-100 text-orange-700 border-orange-300',
  },
  critical: {
    label: 'Critical Risk',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
};

export function RiskBadge({ level, showIcon = false, className }: RiskBadgeProps) {
  if (!level) {
    return (
      <Badge variant="outline" className={cn('bg-gray-100 text-gray-500 border-gray-300', className)}>
        No Risk Assigned
      </Badge>
    );
  }

  const config = riskConfig[level];

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className, className)}
    >
      {showIcon && <AlertCircle className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
