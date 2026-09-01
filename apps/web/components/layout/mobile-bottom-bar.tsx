'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Plus, MessageSquareText, User } from 'lucide-react';
import { useAuth } from '../../context/auth-context';

export function MobileBottomBar() {
  const pathname = usePathname();
  const { user, openAuthModal } = useAuth();

  // Hide global navigation bottom bar on product detail, checkout, and admin pages
  if (pathname.startsWith('/listing') || pathname.startsWith('/checkout') || pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/cari', label: 'Eksplor', icon: Compass },
    { href: '/jual', label: 'Jual', icon: Plus, isHighlight: true },
    { href: '/nego', label: 'Tawaran', icon: MessageSquareText },
    {
      href: user ? '/profile' : '#',
      label: user ? 'Profil' : 'Masuk',
      icon: User,
      onClick: !user ? openAuthModal : undefined
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block border-t border-slate-200/90 bg-white/95 px-3 pt-1 pb-2 sm:pb-2.5 backdrop-blur-xl md:hidden shadow-lg shadow-slate-900/5">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && item.href !== '#' && pathname.startsWith(item.href));

          if (item.isHighlight) {
            return user ? (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6 group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-brand-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-brand-600/35 ring-4 ring-white group-active:scale-95 transition-all duration-200">
                  <Plus className="h-6 w-6 stroke-3" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-800 mt-1">{item.label}</span>
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={openAuthModal}
                className="flex flex-col items-center justify-center -mt-6 group cursor-pointer"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-brand-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-brand-600/35 ring-4 ring-white group-active:scale-95 transition-all duration-200">
                  <Plus className="h-6 w-6 stroke-3" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-800 mt-1">{item.label}</span>
              </button>
            );
          }

          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-1 flex-col items-center justify-center py-1 text-slate-500 hover:text-brand-600 active:scale-95 transition-all cursor-pointer relative"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
              </button>
            );
          }

          // Special profile icon with user avatar thumbnail if available
          if (item.href === '/profile' && user?.avatarUrl) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center py-1 active:scale-95 transition-all ${
                  isActive ? 'text-brand-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <div className="relative">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className={`h-5 w-5 rounded-full object-cover ring-2 ${
                      isActive ? 'ring-brand-600' : 'ring-slate-200'
                    }`}
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-brand-600"></span>
                  )}
                </div>
                <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center py-1 active:scale-95 transition-all relative ${
                isActive ? 'text-brand-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-2.5 text-brand-600' : 'stroke-2'}`} />
                {item.href === '/nego' && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-brand-500 ring-1.5 ring-white"></span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-black text-brand-700' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="h-0.5 w-4 rounded-full bg-brand-600 mt-0.5 animate-in fade-in zoom-in-50"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
