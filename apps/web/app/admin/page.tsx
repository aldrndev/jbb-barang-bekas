'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { formatIDR, formatTimeAgo } from '@/lib/utils';
import {
  Building,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.getAdminStats()
  });

  const stats = statsData?.data || {
    escrowHoldingTotal: 48500000,
    completedPayoutTotal: 124500000,
    totalGmv: 173000000,
    activeDisputesCount: 2,
    pendingKycCount: 3,
    totalUsersCount: 120,
    totalListingsCount: 45,
    activeListingsCount: 38
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Ringkasan Operasional & Brankas Rekber
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Pantau volume dana escrow aktif, status settlement perbankan, dan antrean mediasi secara real-time.
        </p>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="rounded-3xl border border-brand-200 bg-white p-4 sm:p-6 shadow-xs space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-bold">
            <span>Dana Ditahan Rekber</span>
            <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
          </div>
          <p className="text-base sm:text-2xl font-black text-brand-700">
            {formatIDR(stats.escrowHoldingTotal)}
          </p>
          <span className="text-[10px] text-slate-500 font-medium block">
            Dana aman dalam perlindungan Rekber JBB
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-1.5">
          <span className="text-slate-400 text-[10px] sm:text-xs font-bold block">
            Total Pencairan Selesai
          </span>
          <p className="text-base sm:text-2xl font-black text-slate-900">
            {formatIDR(stats.completedPayoutTotal)}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold block">
            ✓ Telah ditransfer ke rekening penjual
          </span>
        </div>

        <Link
          href="/admin/sengketa"
          className="rounded-3xl border border-slate-200 bg-white hover:border-rose-300 p-4 sm:p-6 shadow-xs space-y-1.5 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-bold">
            <span>Sengketa / Komplain</span>
            <span className="rounded-full bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.2">
              {stats.activeDisputesCount} Kasus
            </span>
          </div>
          <p className="text-base sm:text-2xl font-black text-rose-600 group-hover:text-rose-700">
            {stats.activeDisputesCount} Pesanan
          </p>
          <span className="text-[10px] text-slate-500 font-medium flex items-center justify-between">
            <span>Butuh investigasi mediasi</span>
            <ArrowRight className="h-3 w-3 text-rose-500 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        <Link
          href="/admin/kyc"
          className="rounded-3xl border border-slate-200 bg-white hover:border-amber-300 p-4 sm:p-6 shadow-xs space-y-1.5 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-bold">
            <span>Antrean Verifikasi KYC</span>
            <span className="rounded-full bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.2">
              {stats.pendingKycCount} Baru
            </span>
          </div>
          <p className="text-base sm:text-2xl font-black text-amber-600 group-hover:text-amber-700">
            {stats.pendingKycCount} Akun
          </p>
          <span className="text-[10px] text-slate-500 font-medium flex items-center justify-between">
            <span>Validasi foto KTP & NIK</span>
            <ArrowRight className="h-3 w-3 text-amber-500 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </div>

      {/* Escrow System Architecture */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">Arsitektur Perlindungan Rekber JBB</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Status operasional gerbang escrow dan sistem perlindungan 48 jam.</p>
          </div>
          <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Escrow Gateway 100% Online</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Building className="h-4 w-4 text-brand-600" />
              <span>Rekening Penampung Rekber</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Dana pembeli dienkripsi dan ditampung di Escrow Pool Bank Central Asia (BCA) & Virtual Account Mandiri.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <span>Garansi Inspeksi 48 Jam</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Timer otomatis menghitung mundur setelah pembeli menerima paket. Dana terkunci rapat jika ada komplain.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CreditCard className="h-4 w-4 text-brand-600" />
              <span>Pencairan Otomatis (Settlement)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Setelah 48 jam tanpa sengketa, sistem langsung mengirim instruksi transfer ke rekening bank terdaftar penjual.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
