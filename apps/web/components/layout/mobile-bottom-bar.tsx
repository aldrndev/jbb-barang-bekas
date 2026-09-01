'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, MessageSquareText, User } from 'lucide-react';
import { useAuth } from '../../context/auth-context';

export function MobileBottomBar() {
  const pathname = usePathname();
  const { user, openAuthModal } = useAuth();

  // Hide global navigation bottom bar on product detail and checkout pages
  // so the dedicated transaction & checkout action bar is visible
  if (pathname.startsWith('/listing') || pathname.startsWith('/checkout')) {
    return null;
  }

  const navItems = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/cari', label: 'Eksplor', icon: Search },
    { href: '/jual', label: 'Jual', icon: PlusCircle, isHighlight: true },
    { href: '/nego', label: 'Tawaran', icon: MessageSquareText },
    {
      href: user ? '/profile' : '#',
      label: user ? 'Profil' : 'Masuk',
      icon: User,
      onClick: !user ? openAuthModal : undefined
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block border-t border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isHighlight) {
            return user ? (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30 active:scale-95 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-800 mt-1">{item.label}</span>
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={openAuthModal}
                className="flex flex-col items-center justify-center -mt-5 cursor-pointer"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30 active:scale-95 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-800 mt-1">{item.label}</span>
              </button>
            );
          }

          return item.onClick ? (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex flex-col items-center gap-0.5 py-1 text-slate-500 hover:text-emerald-600 cursor-pointer"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
