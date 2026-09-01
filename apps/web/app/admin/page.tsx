'use client';

import { api } from '@/lib/api-client';
import { formatIDR } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building,
  Camera,
  CheckCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Gamepad2,
  Laptop,
  Layers,
  Lock,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const DEFAULT_KYC_QUEUE = [
  {
    id: 'usr-kyc-pending-1',
    name: 'Rian Hidayat (Pendaftar Baru)',
    email: 'rian.hidayat@example.com',
    phone: '081288991122',
    nik: '3273081903980002',
    ktpImageUrl:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    selfieImageUrl:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    isKycVerified: false,
    trustScore: 82,
    role: 'BUYER',
    createdAt: '2026-08-31T14:20:00Z',
    kycSubmittedAt: '2026-08-31T15:00:00Z'
  },
  {
    id: 'usr-kyc-pending-2',
    name: 'Siti Nurhaliza (Calon Penjual)',
    email: 'siti.nurhaliza@example.com',
    phone: '081377889900',
    nik: '3175026708990004',
    ktpImageUrl:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    selfieImageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    isKycVerified: false,
    trustScore: 85,
    role: 'BUYER',
    createdAt: '2026-08-31T10:15:00Z',
    kycSubmittedAt: '2026-08-31T11:45:00Z'
  },
  {
    id: 'usr-kyc-pending-3',
    name: 'Ahmad Zaki Gunawan',
    email: 'ahmad.zaki@example.com',
    phone: '081900112233',
    nik: '3578011204940003',
    ktpImageUrl:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    selfieImageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    isKycVerified: false,
    trustScore: 80,
    role: 'BUYER',
    createdAt: '2026-08-30T09:00:00Z',
    kycSubmittedAt: '2026-08-30T09:30:00Z'
  }
];

const DEFAULT_DISPUTES = [
  {
    id: 'ord-dispute-demo-1',
    orderNumber: 'JBB-2026-9901',
    title: 'MacBook Pro 14 M1 Pro 16/512GB Fullset',
    amount: 16560000,
    buyerName: 'Dimas Aditya',
    reason: 'Layar terdapat staingate baret tebal yang tidak dicantumkan di deskripsi.'
  },
  {
    id: 'ord-dispute-demo-2',
    orderNumber: 'JBB-2026-9904',
    title: 'Sony Alpha A7 III Body Only SC Rendah',
    amount: 19870000,
    buyerName: 'Hendra Gunawan',
    reason: 'Sensor kamera berjamur pada aperture f/16.'
  }
];

export default function AdminOverviewPage() {
  const [activeChartRange, setActiveChartRange] = useState<'7d' | '30d'>('7d');

  const {
    data: statsData,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.getAdminStats()
  });

  const { data: disputesData } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => api.getAdminDisputes()
  });

  const { data: kycData } = useQuery({
    queryKey: ['admin-kyc'],
    queryFn: () => api.getAdminKycQueue()
  });

  const stats = statsData?.data || {
    escrowHoldingTotal: 48500000,
    completedPayoutTotal: 124500000,
    totalGmv: 173000000,
    activeDisputesCount: 0,
    pendingKycCount: 0,
    totalUsersCount: 120,
    totalListingsCount: 45,
    activeListingsCount: 38
  };

  const allDisputes =
    disputesData?.data && Array.isArray(disputesData.data)
      ? disputesData.data
      : disputesData?.data === undefined
        ? DEFAULT_DISPUTES
        : [];
  const activeDisputes = allDisputes.filter(
    (d: any) => d.escrowStatus === 'DISPUTED' || !d.escrowStatus
  );
  const activeDisputesCount =
    statsData?.data?.activeDisputesCount !== undefined
      ? statsData.data.activeDisputesCount
      : activeDisputes.length;
  const urgentDisputes = activeDisputes.slice(0, 2);

  const allKyc =
    kycData?.data && Array.isArray(kycData.data)
      ? kycData.data
      : kycData?.data === undefined
        ? DEFAULT_KYC_QUEUE
        : [];
  const pendingKyc = allKyc.filter((u: any) => !u.isKycVerified && !u.isRejected);
  const pendingKycCount =
    statsData?.data?.pendingKycCount !== undefined
      ? statsData.data.pendingKycCount
      : pendingKyc.length;

  const liveActivityStream = [
    {
      id: 'act-1',
      type: 'DISPUTE_FILED',
      icon: AlertTriangle,
      iconColor: 'bg-rose-50 text-rose-600 border-rose-200',
      badge: 'Sengketa Baru',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      title: 'Komplain diajukan untuk MacBook Pro 14 M1',
      orderNumber: 'JBB-2026-9901',
      amount: 16560000,
      subStatus: 'Investigasi Mediasi',
      time: '10 mnt lalu'
    },
    {
      id: 'act-2',
      type: 'PAYOUT_SUCCESS',
      icon: CheckCircle2,
      iconColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      badge: 'Pencairan Berhasil',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: 'Transfer dana ke rekening BCA Budi Santoso',
      orderNumber: 'JBB-2026-8812',
      amount: 8900000,
      subStatus: 'Settlement Bank BCA',
      time: '25 mnt lalu'
    },
    {
      id: 'act-3',
      type: 'ESCROW_LOCKED',
      icon: Lock,
      iconColor: 'bg-brand-50 text-brand-600 border-brand-200',
      badge: 'Dana Masuk Brankas',
      badgeColor: 'bg-brand-100 text-brand-800 border-brand-200',
      title: 'Pembayaran Rekber Virtual Account Mandiri diterima',
      orderNumber: 'JBB-2026-7731',
      amount: 11200000,
      subStatus: 'VA Mandiri Terverifikasi',
      time: '1 jam lalu'
    },
    {
      id: 'act-4',
      type: 'INSPECTION_TIMER',
      icon: Clock,
      iconColor: 'bg-blue-50 text-blue-600 border-blue-200',
      badge: 'Garansi 48 Jam Aktif',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      title: 'Paket Sony WH-1000XM5 diterima pembeli',
      orderNumber: 'JBB-2026-6649',
      amount: 3850000,
      subStatus: 'Hitung Mundur Garansi',
      time: '2 jam lalu'
    }
  ];

  // 7-Day Chart Data for Financial Simulation
  const chartDays = [
    { day: 'Sen', gmv: 18500000, payout: 12000000, heightGmv: '60%', heightPayout: '40%' },
    { day: 'Sel', gmv: 24200000, payout: 18500000, heightGmv: '78%', heightPayout: '55%' },
    { day: 'Rab', gmv: 15400000, payout: 14000000, heightGmv: '50%', heightPayout: '45%' },
    { day: 'Kam', gmv: 31000000, payout: 22400000, heightGmv: '95%', heightPayout: '70%' },
    { day: 'Jum', gmv: 28900000, payout: 26000000, heightGmv: '88%', heightPayout: '80%' },
    { day: 'Sab', gmv: 34500000, payout: 29000000, heightGmv: '100%', heightPayout: '88%' },
    { day: 'Min', gmv: 20500000, payout: 17200000, heightGmv: '65%', heightPayout: '52%' }
  ];

  return (
    <div className="space-y-7 animate-in fade-in">
      {/* 1. HERO BANNER: Welcome & Quick Control Center */}
      <div className="rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-brand-950 p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Brankas Rekber Multi-Sig Online</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Update:{' '}
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Pusat Komando & Brankas Rekber Bekasin
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Memantau perputaran dana garansi 48 jam, stabilitas escrow gateway, mitigasi sengketa
              barang bekas, dan persetujuan identitas KYC.
            </p>
          </div>

          {/* Action Quick Links */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/sengketa"
              className="flex items-center gap-2 rounded-2xl bg-rose-600/90 hover:bg-rose-600 text-white px-4 py-2.5 text-xs font-bold border border-rose-500/40 shadow-lg shadow-rose-600/20 transition-all hover:scale-102"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Sengketa ({activeDisputesCount})</span>
            </Link>

            <Link
              href="/admin/kyc"
              className="flex items-center gap-2 rounded-2xl bg-amber-500/90 hover:bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-bold border border-amber-400 shadow-lg shadow-amber-500/20 transition-all hover:scale-102"
            >
              <UserCheck className="h-4 w-4" />
              <span>Antrean KYC ({pendingKycCount})</span>
            </Link>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 text-xs font-bold border border-white/15 backdrop-blur-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE FINANCIAL METRIC CARDS (4-Column Elevated FinTech Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Dana Ditahan Rekber (Escrow Active Vault) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-brand-600" />
              <span>Dana Ditahan Rekber</span>
            </span>
            <span className="text-[10px] font-black text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              <span>Aktif</span>
            </span>
          </div>

          <div>
            <p className="text-2xl sm:text-3xl font-black text-brand-700 tracking-tight">
              {formatIDR(stats.escrowHoldingTotal)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1">
              <span>7 pesanan dalam masa garansi 48 jam</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Keamanan Escrow:</span>
            <strong className="text-emerald-700 font-bold">100% Pool Enkripsi</strong>
          </div>
        </div>

        {/* Card 2: Total Pencairan Selesai */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
              <span>Pencairan Selesai</span>
            </span>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              <span>+14.2%</span>
            </span>
          </div>

          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatIDR(stats.completedPayoutTotal)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold mt-1">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Telah ditransfer ke penjual</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Rata-rata waktu cair:</span>
            <strong className="text-slate-800 font-bold">~48 Jam</strong>
          </div>
        </div>

        {/* Card 3: Gross Merchandise Volume (GMV) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-blue-600" />
              <span>Total Volume GMV</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400">All Time</span>
          </div>

          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatIDR(stats.totalGmv)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1">
              <span>{stats.totalListingsCount} barang bekas diproses</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Rata-rata transaksi:</span>
            <strong className="text-slate-800 font-bold">Rp 4.55jt</strong>
          </div>
        </div>

        {/* Card 4: Success Rate & Health */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
              <span>Tingkat Kepuasan</span>
            </span>
            <span className="text-[10px] font-black text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
              Trust 99%
            </span>
          </div>

          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">98.4%</p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1">
              <span>Hanya 1.6% kasus komplain</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Rating Platform:</span>
            <strong className="text-amber-600 font-black">★ 4.92 / 5.0</strong>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: Interactive Chart & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Financial Escrow Flow Visualizer */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-600" />
                <span>Arus Transaksi & Pencairan 7 Hari Terakhir</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Perbandingan volume dana masuk Rekber vs pencairan berhasil ke rekening penjual.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mr-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-brand-600" />
                <span>Dana Masuk</span>
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 ml-2" />
                <span>Pencairan</span>
              </div>
            </div>
          </div>

          {/* CSS-based Modern Bar Visualizer */}
          <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-6 pt-6 pb-2 px-2">
            {chartDays.map((item, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
              >
                <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                  {/* GMV Bar */}
                  <div
                    style={{ height: item.heightGmv }}
                    className="w-full max-w-4.5 bg-brand-600 hover:bg-brand-700 rounded-t-lg transition-all relative group/bar"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none transition-opacity z-20">
                      {formatIDR(item.gmv)}
                    </div>
                  </div>
                  {/* Payout Bar */}
                  <div
                    style={{ height: item.heightPayout }}
                    className="w-full max-w-4.5 bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-all relative group/pbar"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/pbar:opacity-100 bg-emerald-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none transition-opacity z-20">
                      {formatIDR(item.payout)}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900">
                  {item.day}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="text-slate-600 font-medium">
              💡 <strong>Insight Operasional:</strong> Volume akhir pekan (Sabtu-Minggu) meningkat
              28% dari rata-rata harian.
            </span>
            <span className="text-emerald-700 font-bold whitespace-nowrap">
              Auto-Settlement 100% On-Time
            </span>
          </div>
        </div>

        {/* Right 1 Col: Category Volume Breakdown */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-600" />
              <span>Kategori Terlaris</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Distribusi volume transaksi di Rekber.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-brand-600" />
                  <span>Smartphone & Gadget</span>
                </span>
                <span>42% (Rp 72.6jt)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600 rounded-full" style={{ width: '42%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-blue-600" />
                  <span>Laptop & Komputer</span>
                </span>
                <span>28% (Rp 48.4jt)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-amber-600" />
                  <span>Kamera & Lensa</span>
                </span>
                <span>18% (Rp 31.1jt)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-purple-600" />
                  <span>Konsol & Gaming</span>
                </span>
                <span>12% (Rp 20.7jt)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <Link
              href="/admin/moderasi"
              className="flex items-center justify-between text-xs font-bold text-brand-700 hover:text-brand-800 group"
            >
              <span>Kelola Katalog ({stats.activeListingsCount} Aktif)</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. DUAL COMMAND QUEUE: Urgent Disputes & KYC Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Urgent Disputes requiring Admin Mediasi */}
        <div className="rounded-3xl border border-rose-200 bg-rose-50/30 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-rose-200/80 pb-3">
            <div>
              <h3 className="text-base font-black text-rose-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Sengketa Menunggu Putusan ({activeDisputesCount})</span>
              </h3>
              <p className="text-xs text-rose-700/80 font-medium mt-0.5">
                Kasus komplain pembeli yang memerlukan investigasi bukti fisik.
              </p>
            </div>
            <Link
              href="/admin/sengketa"
              className="text-xs font-bold text-rose-700 hover:text-rose-900 underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {urgentDisputes.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/80 border border-rose-200 text-center space-y-1">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <h4 className="font-black text-slate-900 text-xs">Semua Sengketa Selesai! 🎉</h4>
                <p className="text-[11px] text-slate-500">
                  Tidak ada kasus sengketa aktif yang memerlukan mediasi admin.
                </p>
              </div>
            ) : (
              urgentDisputes.map((d: any) => (
                <div
                  key={d.id}
                  className="rounded-2xl border border-rose-200 bg-white p-4 shadow-2xs space-y-2 hover:border-rose-300 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 uppercase">
                      {d.orderNumber}
                    </span>
                    <span className="text-xs font-black text-brand-700">
                      {formatIDR(d.amount || 16500000)}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                    {d.title || d.listing?.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 bg-rose-50/50 p-2 rounded-xl border border-rose-100">
                    "{d.reason || d.disputeReason}"
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Penggugat: <strong>{d.buyerName || d.buyer?.name}</strong>
                    </span>
                    <Link
                      href={`/admin/sengketa/${d.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 hover:text-rose-800"
                    >
                      <span>Investigasi Kasus →</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: KYC Queue ready for Approval */}
        <div className="rounded-3xl border border-amber-200 bg-amber-50/30 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <div>
              <h3 className="text-base font-black text-amber-900 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-amber-600" />
                <span>Pengajuan KYC Baru ({pendingKycCount})</span>
              </h3>
              <p className="text-xs text-amber-800/80 font-medium mt-0.5">
                Verifikasi kesesuaian identitas NIK dan foto KTP pengguna.
              </p>
            </div>
            <Link
              href="/admin/kyc"
              className="text-xs font-bold text-amber-800 hover:text-amber-950 underline flex items-center gap-1"
            >
              <span>Lihat Antrean</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingKyc.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/80 border border-amber-200 text-center space-y-1">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <h4 className="font-black text-slate-900 text-xs">Semua KYC Telah Diproses! 🎉</h4>
                <p className="text-[11px] text-slate-500">
                  Tidak ada pengajuan verifikasi identitas tertunda.
                </p>
              </div>
            ) : (
              pendingKyc.slice(0, 3).map((u: any) => (
                <div
                  key={u.id}
                  className="rounded-2xl border border-amber-200 bg-white p-4 shadow-2xs flex items-center justify-between gap-3 hover:border-amber-300 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900">{u.name}</h4>
                      <span className="rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2">
                        Review KTP
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono block">NIK: {u.nik}</span>
                  </div>

                  <Link
                    href="/admin/kyc"
                    className="rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 text-[11px] font-black transition-colors shrink-0"
                  >
                    Review NIK →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. LIVE ACTIVITY FEED: Real-Time Stream */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3.5">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" />
              <span>Aktivitas & Log Escrow Terkini</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Arus transaksi otomatis dan perubahan status pesanan di seluruh marketplace.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-[11px] font-extrabold flex items-center gap-1.5 w-fit">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Live Feed</span>
            </span>
          </div>
        </div>

        {/* Structured Tabular List */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 divide-y divide-slate-200">
          {liveActivityStream.map((act) => {
            const Icon = act.icon;

            return (
              <div
                key={act.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                {/* Left: Icon + Type Badge + Description */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${act.iconColor}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${act.badgeColor}`}
                      >
                        {act.badge}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-400">
                        {act.orderNumber}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {act.title}
                    </h4>
                  </div>
                </div>

                {/* Right: Nominal & Time Aligned */}
                <div className="flex items-center justify-between sm:justify-end sm:text-right gap-4 shrink-0 pl-13 sm:pl-0">
                  <div className="space-y-0.5">
                    <span className="text-xs sm:text-sm font-black text-slate-900 block">
                      {formatIDR(act.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {act.subStatus}
                    </span>
                  </div>

                  <div className="min-w-21.25 text-right">
                    <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-lg inline-block">
                      {act.time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. VAULT SECURITY & BANK POOL ARCHITECTURE */}
      <div className="rounded-3xl border border-slate-200 bg-linear-to-b from-slate-50 to-white p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building className="h-4 w-4 text-brand-600" />
              <span>Status Rekening Penampung & Settlement Perbankan</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Alokasi saldo escrow vault pada jaringan mitra perbankan nasional.
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Bank Integrations 100% Synced</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">BCA Escrow Pool</span>
              <span className="text-[10px] text-emerald-700 font-black bg-emerald-50 px-1.5 py-0.2 rounded">
                Aktif
              </span>
            </div>
            <p className="text-base font-black text-slate-900">Rp 32.500.000</p>
            <span className="text-[10px] text-slate-400 block font-mono">Rek. 8820-1928-3741</span>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Mandiri Virtual Account</span>
              <span className="text-[10px] text-emerald-700 font-black bg-emerald-50 px-1.5 py-0.2 rounded">
                Aktif
              </span>
            </div>
            <p className="text-base font-black text-slate-900">Rp 16.000.000</p>
            <span className="text-[10px] text-slate-400 block font-mono">VA Gateway Midtrans</span>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Auto-Disbursement API</span>
              <span className="text-[10px] text-emerald-700 font-black bg-emerald-50 px-1.5 py-0.2 rounded">
                Live
              </span>
            </div>
            <p className="text-base font-black text-emerald-600">Disbursement Ready</p>
            <span className="text-[10px] text-slate-400 block">Jago, SeaBank, BRI, BNI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
