import React from 'react';
import type { ItemCondition } from '@jbb/types';
import { getConditionMeta } from '../../lib/utils';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface ConditionBadgeProps {
  condition: ItemCondition;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConditionBadge({ condition, showScore = true, size = 'md' }: ConditionBadgeProps) {
  const meta = getConditionMeta(condition);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-bold'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold tracking-tight ${meta.color} ${sizeClasses}`}
    >
      <Sparkles className="h-3 w-3 opacity-80" />
      <span>{meta.label}</span>
      {showScore && (
        <span className="ml-0.5 rounded bg-black/10 px-1 py-0.2 text-[9px] font-extrabold">
          {meta.score}
        </span>
      )}
    </span>
  );
}
