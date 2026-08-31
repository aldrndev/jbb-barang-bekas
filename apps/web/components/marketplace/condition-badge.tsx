import React from 'react';
import type { ItemCondition } from '@jbb/types';
import { getConditionMeta } from '../../lib/utils';
import { Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ConditionBadgeProps {
  condition: ItemCondition;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ConditionBadge({ condition, size = 'md', className = '' }: ConditionBadgeProps) {
  const meta = getConditionMeta(condition);

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[10px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-bold gap-2'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold tracking-tight shadow-2xs backdrop-blur-md transition-all ${meta.badgeClasses} ${sizeClasses} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotColor}`} />
      <span>{meta.displayLabel}</span>
    </span>
  );
}
