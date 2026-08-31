import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ItemCondition } from '@jbb/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Baru saja';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function getConditionMeta(condition: ItemCondition) {
  switch (condition) {
    case 'NEW':
      return {
        label: 'Baru Segel',
        score: '100%',
        color: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/50 dark:text-brand-300'
      };
    case 'LIKE_NEW':
      return {
        label: 'Mulus 95%+',
        score: '96%',
        color: 'bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-950/50 dark:text-brand-300'
      };
    case 'USED_EXCELLENT':
      return {
        label: 'Bekas 85%+',
        score: '90%',
        color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300'
      };
    case 'USED_GOOD':
      return {
        label: 'Bekas 70%+',
        score: '75%',
        color: 'bg-deal-50 text-deal-700 border-deal-200 dark:bg-deal-950/50 dark:text-deal-400'
      };
    case 'USED_FAIR':
      return {
        label: 'Minus Fisik 50%+',
        score: '60%',
        color: 'bg-orange-50 text-orange-700 border-orange-200'
      };
    case 'PARTS_ONLY':
      return {
        label: 'Sparepart / Mati',
        score: 'Mati',
        color: 'bg-rose-50 text-rose-700 border-rose-200'
      };
    default:
      return {
        label: 'Kondisi Bekas',
        score: '80%',
        color: 'bg-slate-50 text-slate-700 border-slate-200'
      };
  }
}
