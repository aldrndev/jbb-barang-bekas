'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const routeLabelMap: Record<string, string> = {
  cari: 'Katalog Barang',
  listing: 'Detail Barang',
  checkout: 'Checkout Rekber',
  nego: 'Tawaran Nego',
  orders: 'Riwayat Pesanan',
  'my-listings': 'Barang Dijual',
  wishlist: 'Wishlist & Favorit',
  profile: 'Profil Saya',
  jual: 'Pasang Iklan'
};

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();

  // If items not provided, automatically generate from pathname
  let breadcrumbItems: BreadcrumbItem[] = items || [];

  if (!items) {
    const segments = pathname.split('/').filter(Boolean);
    breadcrumbItems = segments.map((segment, idx) => {
      const href = '/' + segments.slice(0, idx + 1).join('/');
      const label = routeLabelMap[segment] || decodeURIComponent(segment.replace(/-/g, ' '));
      const isLast = idx === segments.length - 1;

      return {
        label: label.charAt(0).toUpperCase() + label.slice(1),
        href: isLast ? undefined : href
      };
    });
  }

  // If on homepage and no items, don't render
  if (pathname === '/' && (!items || items.length === 0)) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs font-semibold text-slate-500 overflow-x-auto pb-1 hide-scrollbar ${className}`}
    >
      <ol className="inline-flex items-center gap-1.5 flex-nowrap">
        {/* Home Root */}
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-brand-600 transition-colors p-1 rounded-md hover:bg-slate-100/70"
            title="Kembali ke Beranda"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Beranda</span>
          </Link>
        </li>

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={index} className="inline-flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-brand-600 transition-colors truncate max-w-40 sm:max-w-xs p-1 rounded-md hover:bg-slate-100/70"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="font-bold text-slate-900 truncate max-w-48 sm:max-w-md"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
