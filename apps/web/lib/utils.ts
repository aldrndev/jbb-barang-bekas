import type { ItemCondition } from '@jbb/types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
        badgeClasses: 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs',
        dotColor: 'bg-emerald-600'
      };
    case 'LIKE_NEW':
      return {
        label: 'Like New',
        displayLabel: 'Like New (96% Mulus)',
        score: '96%',
        badgeClasses: 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs',
        dotColor: 'bg-emerald-600'
      };
    case 'USED_EXCELLENT':
      return {
        label: 'Sangat Mulus',
        displayLabel: 'Sangat Mulus (90%)',
        score: '90%',
        badgeClasses: 'bg-teal-50 text-teal-900 border border-teal-300 shadow-xs',
        dotColor: 'bg-teal-600'
      };
    case 'USED_GOOD':
      return {
        label: 'Normal Terawat',
        displayLabel: 'Normal Terawat (75%)',
        score: '75%',
        badgeClasses: 'bg-blue-50 text-blue-900 border border-blue-300 shadow-xs',
        dotColor: 'bg-blue-600'
      };
    case 'USED_FAIR':
      return {
        label: 'Minus Fisik',
        displayLabel: 'Minus Fisik (60%)',
        score: '60%',
        badgeClasses: 'bg-amber-50 text-amber-950 border border-amber-300 shadow-xs',
        dotColor: 'bg-amber-600'
      };
    case 'PARTS_ONLY':
      return {
        label: 'Sparepart',
        displayLabel: 'Sparepart / Mati',
        score: 'Mati',
        badgeClasses: 'bg-rose-50 text-rose-950 border border-rose-300 shadow-xs',
        dotColor: 'bg-rose-600'
      };
    default:
      return {
        label: 'Bekas',
        displayLabel: 'Kondisi Bekas (80%)',
        score: '80%',
        badgeClasses: 'bg-slate-100 text-slate-900 border border-slate-300 shadow-xs',
        dotColor: 'bg-slate-600'
      };
  }
}

/**
 * Capitalizes each word in a string cleanly (Title Case), removing excess whitespace.
 * Ideal for person names, meeting points, locations, and spec keys.
 * Example: "gandaria city blok m" -> "Gandaria City Blok M"
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => {
      if (!word) return '';
      // Preserve words that are already all-uppercase acronyms like COD, BCA, PS5, RAM, SSD
      if (word.length > 1 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Cleans product titles: trims excess spaces and capitalizes the leading character,
 * while preserving custom brand casing (e.g. "iPhone 13 Pro", "macOS", "PS5").
 */
export function cleanTitle(str: string): string {
  if (!str) return '';
  const cleaned = str.trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Normalizes multiline text / descriptions by collapsing excessive blank lines.
 */
export function cleanWhitespace(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
}
