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
        displayLabel: 'Baru Segel 100%',
        score: '100%',
        badgeClasses: 'bg-white/95 text-emerald-800 border border-emerald-300/80 shadow-2xs',
        dotColor: 'bg-emerald-500'
      };
    case 'LIKE_NEW':
      return {
        label: 'Like New',
        displayLabel: 'Like New (96% Mulus)',
        score: '96%',
        badgeClasses: 'bg-white/95 text-emerald-800 border border-emerald-300/80 shadow-2xs',
        dotColor: 'bg-emerald-500 animate-pulse'
      };
    case 'USED_EXCELLENT':
      return {
        label: 'Sangat Mulus',
        displayLabel: 'Sangat Mulus (90%)',
        score: '90%',
        badgeClasses: 'bg-white/95 text-teal-800 border border-teal-300/80 shadow-2xs',
        dotColor: 'bg-teal-500'
      };
    case 'USED_GOOD':
      return {
        label: 'Normal Terawat',
        displayLabel: 'Normal Terawat (75%)',
        score: '75%',
        badgeClasses: 'bg-white/95 text-blue-800 border border-blue-300/80 shadow-2xs',
        dotColor: 'bg-blue-500'
      };
    case 'USED_FAIR':
      return {
        label: 'Minus Fisik',
        displayLabel: 'Minus Fisik (60%)',
        score: '60%',
        badgeClasses: 'bg-white/95 text-amber-900 border border-amber-300/80 shadow-2xs',
        dotColor: 'bg-amber-500'
      };
    case 'PARTS_ONLY':
      return {
        label: 'Sparepart',
        displayLabel: 'Sparepart / Mati',
        score: 'Mati',
        badgeClasses: 'bg-white/95 text-rose-800 border border-rose-300/80 shadow-2xs',
        dotColor: 'bg-rose-500'
      };
    default:
      return {
        label: 'Bekas',
        displayLabel: 'Kondisi Bekas (80%)',
        score: '80%',
        badgeClasses: 'bg-white/95 text-slate-800 border border-slate-300/80 shadow-2xs',
        dotColor: 'bg-slate-500'
      };
  }
}
