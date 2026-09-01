'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  CreditCard,
  Package,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  Store,
  Menu,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loginAsDemoAdmin, loginAsDemoSeller, loginAsDemoBuyer, logout } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  // Navigation Items
  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      badge: null,
      isActive: pathname === '/admin'
    },
    {
      label: 'Sengketa',
      href: '/admin/sengketa',
      icon: AlertTriangle,
      badge: '2 Kasus',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      isActive: pathname.startsWith('/admin/sengketa')
    },
    {
      label: 'Verifikasi KYC',
      href: '/admin/kyc',
      icon: UserCheck,
      badge: '3 Baru',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      isActive: pathname.startsWith('/admin/kyc')
    },
    {
      label: 'Pencairan Bank',
      href: '/admin/pencairan',
      icon: CreditCard,
      badge: null,
      isActive: pathname.startsWith('/admin/pencairan')
    },
    {
      label: 'Moderasi Iklan',
      href: '/admin/moderasi',
      icon: Package,
      badge: null,
      isActive: pathname.startsWith('/admin/moderasi')
    }
  ];

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center space-y-5 shadow-lg">
          <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Akses Terbatas: Administrator</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Halaman ini dikhususkan untuk Staff Operasional & Mediasi Rekber JBB Marketplace.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
            <span className="font-bold text-slate-700 block">Uji Coba Cepat (1-Klik Mode Demo):</span>
            <button
              type="button"
              onClick={() => loginAsDemoAdmin()}
              className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Masuk Sebagai Master Admin Rekber</span>
            </button>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
            >
              <span>← Kembali ke Marketplace Utama</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 1. STANDALONE LIGHT SIDEBAR (DESKTOP) */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen z-40 shadow-xs">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-black text-base shadow-sm shadow-brand-600/25 group-hover:scale-105 transition-transform">
              J
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-slate-900 tracking-tight">JBB.ADMIN</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 border border-emerald-200">
                  PRO
                </span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Pusat Kontrol Rekber
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-2">
            Menu Utama
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  item.isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${item.isActive ? 'text-brand-600 font-bold' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom User Profile & Navigation */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <div className="flex items-center gap-2.5 px-1">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="h-8 w-8 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black text-slate-900 truncate block">{user.name}</span>
              <span className="text-[10px] font-bold text-brand-600 block">Master Admin</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Marketplace</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative flex w-72 max-w-xs flex-1 flex-col bg-white border-r border-slate-200 pt-5 pb-4 shadow-xl">
            <div className="flex items-center justify-between px-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white font-black text-base shadow-xs">
                  J
                </div>
                <span className="text-base font-black text-slate-900">JBB.ADMIN</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      item.isActive
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Portal Admin</span>
                <span className="text-xs text-slate-300">/</span>
                <span className="text-xs font-black text-slate-800">
                  {navItems.find((n) => n.isActive)?.label || 'Dashboard'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Profile & Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Escrow Gateway 100% Online</span>
            </div>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-black text-slate-900 block">{user.name}</span>
                <span className="text-[10px] font-extrabold text-brand-600 uppercase tracking-wider block">
                  Master Admin
                </span>
              </div>
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user.name}
                className="h-9 w-9 rounded-xl object-cover ring-2 ring-brand-500/20"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
