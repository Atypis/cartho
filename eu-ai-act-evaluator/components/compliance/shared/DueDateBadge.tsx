/**
 * DueDateBadge Component
 *
 * Displays due date with urgency indicator
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';

interface DueDateBadgeProps {
  dueDate: string | null;
  showIcon?: boolean;
  className?: string;
}

export function DueDateBadge({ dueDate, showIcon = true, className }: DueDateBadgeProps) {
  if (!dueDate) {
    return (
      <Badge variant="outline" className={cn('bg-gray-100 text-gray-500 border-gray-300', className)}>
        {showIcon && <Calendar className="w-3 h-3 mr-1" />}
        No Due Date
      </Badge>
    );
  }

  const date = new Date(dueDate);
  const isOverdue = isPast(date);
  const daysUntilDue = differenceInDays(date, new Date());

  let urgencyClass = 'bg-gray-100 text-gray-700 border-gray-300';
  let icon = <Calendar className="w-3 h-3 mr-1" />;

  if (isOverdue) {
    urgencyClass = 'bg-red-100 text-red-700 border-red-300';
    icon = <Clock className="w-3 h-3 mr-1" />;
  } else if (daysUntilDue <= 7) {
    urgencyClass = 'bg-orange-100 text-orange-700 border-orange-300';
    icon = <Clock className="w-3 h-3 mr-1" />;
  } else if (daysUntilDue <= 30) {
    urgencyClass = 'bg-yellow-100 text-yellow-700 border-yellow-300';
  }

  const formattedDate = format(date, 'MMM d, yyyy');
  const label = isOverdue
    ? `Overdue (${formattedDate})`
    : daysUntilDue === 0
    ? 'Due Today'
    : daysUntilDue === 1
    ? 'Due Tomorrow'
    : daysUntilDue <= 7
    ? `Due in ${daysUntilDue} days`
    : formattedDate;

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', urgencyClass, className)}
    >
      {showIcon && icon}
      {label}
    </Badge>
  );
}
