'use client';

import { PeygoLogoIcon } from '@/components/common/peygo-logo';
import { useAuth } from '@/context/auth-context';
import {
  AlertTriangle,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  ShieldAlert,
  Store,
  UserCheck,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, openAuthModal, logout, isLoading } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  // Navigation Items (Clean & Minimalist without misleading static badges)
  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      isActive: pathname === '/admin'
    },
    {
      label: 'Faktur & Invoice',
      href: '/admin/invoices',
      icon: Receipt,
      isActive: pathname.startsWith('/admin/invoices')
    },
    {
      label: 'Sengketa',
      href: '/admin/sengketa',
      icon: AlertTriangle,
      isActive: pathname.startsWith('/admin/sengketa')
    },
    {
      label: 'KYC User',
      href: '/admin/kyc',
      icon: UserCheck,
      isActive: pathname === '/admin/kyc'
    },
    {
      label: 'Pencairan',
      href: '/admin/pencairan',
      icon: CreditCard,
      isActive: pathname === '/admin/pencairan'
    },
    {
      label: 'Moderasi Iklan',
      href: '/admin/moderasi',
      icon: Package,
      isActive: pathname.startsWith('/admin/moderasi')
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="h-12 w-12 rounded-2xl bg-brand-600/20 flex items-center justify-center border border-brand-500/30 text-white">
            <PeygoLogoIcon size="sm" />
          </div>
          <span className="text-xs font-bold text-slate-400 tracking-wide">
            Memverifikasi Hak Akses Admin...
          </span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">Akses Terbatas: Administrator Only</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Panel ini khusus untuk administrator marketplace dan petugas resolusi sengketa
              transaksi.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={openAuthModal}
              className="w-full rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 shadow-md shadow-brand-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <span>Masuk Akun Admin</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1 text-xs font-bold text-slate-600 hover:text-white transition-colors w-full py-2"
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
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <PeygoLogoIcon size="sm" className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-slate-900 tracking-tight">
                  PEYGO.ADMIN
                </span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 border border-emerald-200">
                  PRO
                </span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Pusat Kontrol Marketplace
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
                  <Icon
                    className={`h-4 w-4 ${item.isActive ? 'text-brand-600 font-bold' : 'text-slate-400'}`}
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom User Profile & Navigation */}
        <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50/80">
          <div className="flex items-center gap-2.5 px-1">
            <img
              src={
                user.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={user.name}
              className="h-8 w-8 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black text-slate-900 truncate block">{user.name}</span>
              <span className="text-[10px] font-bold text-brand-600 block">Master Admin</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
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
          <button
            type="button"
            aria-label="Tutup menu navigasi sidebar"
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-default"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative flex w-72 max-w-xs flex-1 flex-col bg-white border-r border-slate-200 pt-5 pb-4 shadow-xl">
            <div className="flex items-center justify-between px-5 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <PeygoLogoIcon size="sm" />
                <span className="text-base font-black text-slate-900">PEYGO.ADMIN</span>
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

          {/* Right Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Sistem Pembayaran 100% Normal</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
