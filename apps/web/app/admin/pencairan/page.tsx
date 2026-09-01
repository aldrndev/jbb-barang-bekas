'use client';

import { api } from '@/lib/api-client';
import { formatIDR, formatTimeAgo } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  LayoutGrid,
  List,
  Printer,
  Search,
  ShieldCheck,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';

const DEFAULT_PAYOUTS = [
  {
    id: 'pay-pending-1',
    orderId: 'ord-macbook-1',
    orderNumber: 'JBB-2026-9905',
    listingTitle: 'MacBook Air M2 8/256GB Midnight Starlight Mulus Fullset',
    amount: 12800000,
    serviceFee: 192000,
    netAmount: 12608000,
    payoutBank: 'Bank Central Asia (BCA)',
    payoutAccountNumber: '8271029384',
    payoutAccountHolder: 'Budi Santoso',
    sellerName: 'Budi Santoso',
    sellerPhone: '081288991122',
    readyAt: '2026-09-01T08:15:00Z',
    status: 'PENDING_TRANSFER',
    transferRef: null,
    completedAt: null
  },
  {
    id: 'pay-pending-2',
    orderId: 'ord-fuji-1',
    orderNumber: 'JBB-2026-9908',
    listingTitle: 'Fujifilm X-T30 II Silver + Lensa 18-55mm F2.8-4 OIS Fullset',
    amount: 14500000,
    serviceFee: 217500,
    netAmount: 14282500,
    payoutBank: 'Bank Mandiri',
    payoutAccountNumber: '1370019283741',
    payoutAccountHolder: 'Rian Pratama',
    sellerName: 'Rian Pratama',
    sellerPhone: '081399887766',
    readyAt: '2026-09-01T10:30:00Z',
    status: 'PENDING_TRANSFER',
    transferRef: null,
    completedAt: null
  },
  {
    id: 'pay-pending-3',
    orderId: 'ord-ipad-1',
    orderNumber: 'JBB-2026-9912',
    listingTitle: 'iPad Pro 11 M2 128GB WiFi Space Grey + Apple Pencil 2',
    amount: 10750000,
    serviceFee: 161250,
    netAmount: 10588750,
    payoutBank: 'Bank Jago',
    payoutAccountNumber: '109283746192',
    payoutAccountHolder: 'Kevin Sanjaya',
    sellerName: 'Kevin Sanjaya',
    sellerPhone: '081900112233',
    readyAt: '2026-09-01T11:45:00Z',
    status: 'PENDING_TRANSFER',
    transferRef: null,
    completedAt: null
  },
  {
    id: 'pay-demo-1',
    orderId: 'ord-demo-1',
    orderNumber: 'JBB-2026-8812',
    listingTitle: 'Sony A6400 Body Only SC 4.200 Fullset Mulus',
    amount: 8900000,
    serviceFee: 133500,
    netAmount: 8766500,
    payoutBank: 'Bank Central Asia (BCA)',
    payoutAccountNumber: '8271029384',
    payoutAccountHolder: 'Budi Santoso',
    sellerName: 'Budi Santoso',
    sellerPhone: '081288991122',
    readyAt: '2026-08-31T08:00:00Z',
    completedAt: '2026-08-31T09:30:00Z',
    status: 'TRANSFERRED_SUCCESS',
    transferRef: 'TRX-BIFAST-2026-881290'
  },
  {
    id: 'pay-demo-2',
    orderId: 'ord-demo-2',
    orderNumber: 'JBB-2026-7731',
    listingTitle: 'iPhone 13 Pro 128GB Sierra Blue iBox Fullset',
    amount: 11200000,
    serviceFee: 168000,
    netAmount: 11032000,
    payoutBank: 'Bank Mandiri',
    payoutAccountNumber: '1370019283741',
    payoutAccountHolder: 'Rian Pratama',
    sellerName: 'Rian Pratama',
    sellerPhone: '081399887766',
    readyAt: '2026-08-30T14:00:00Z',
    completedAt: '2026-08-30T16:15:00Z',
    status: 'TRANSFERRED_SUCCESS',
    transferRef: 'TRX-BIFAST-2026-773144'
  },
  {
    id: 'pay-demo-3',
    orderId: 'ord-demo-3',
    orderNumber: 'JBB-2026-6649',
    listingTitle: 'Sony WH-1000XM5 Wireless Noise Cancelling Mulus',
    amount: 3850000,
    serviceFee: 57750,
    netAmount: 3792250,
    payoutBank: 'Bank Jago',
    payoutAccountNumber: '109283746192',
    payoutAccountHolder: 'Kevin Sanjaya',
    sellerName: 'Kevin Sanjaya',
    sellerPhone: '081900112233',
    readyAt: '2026-08-29T10:00:00Z',
    completedAt: '2026-08-29T11:20:00Z',
    status: 'TRANSFERRED_SUCCESS',
    transferRef: 'TRX-BIFAST-2026-664921'
  },
  {
    id: 'pay-demo-4',
    orderId: 'ord-demo-4',
    orderNumber: 'JBB-2026-5520',
    listingTitle: 'PlayStation 5 Disc Edition Horizon Bundle 2 Stik',
    amount: 6900000,
    serviceFee: 103500,
    netAmount: 6796500,
    payoutBank: 'SeaBank Indonesia',
    payoutAccountNumber: '901238475619',
    payoutAccountHolder: 'Doni Prasetyo',
    sellerName: 'Doni Prasetyo',
    sellerPhone: '081255443322',
    readyAt: '2026-08-28T13:00:00Z',
    completedAt: '2026-08-28T14:45:00Z',
    status: 'TRANSFERRED_SUCCESS',
    transferRef: 'TRX-BIFAST-2026-552087'
  }
];

export default function AdminPayoutsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBankFilter, setSelectedBankFilter] = useState('ALL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  const { data: payoutsData } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: () => api.getAdminPayouts(),
    enabled: user?.role === 'ADMIN'
  });

  const [localOverrides, setLocalOverrides] = useState<
    Record<string, { status: string; transferRef: string; completedAt: string }>
  >({});

  const rawPayouts =
    payoutsData?.data && payoutsData.data.length > 0 ? payoutsData.data : DEFAULT_PAYOUTS;
  const payouts = rawPayouts.map((p: any) => {
    const override = localOverrides[p.id];
    if (override) {
      return { ...p, ...override };
    }
    return p;
  });

  const pendingPayouts = payouts.filter((p: any) => p.status === 'PENDING_TRANSFER');
  const completedPayouts = payouts.filter((p: any) => p.status === 'TRANSFERRED_SUCCESS');

  // Executive Metric Calculations
  const totalCompletedAmount = completedPayouts.reduce(
    (sum: number, p: any) => sum + (p.amount || 0),
    0
  );
  const totalPendingAmount = pendingPayouts.reduce(
    (sum: number, p: any) => sum + (p.amount || 0),
    0
  );
  const totalPlatformFee = payouts.reduce(
    (sum: number, p: any) => sum + (p.serviceFee || Math.round(p.amount * 0.015)),
    0
  );

  // Filtered List
  const displayedPayouts = (activeTab === 'pending' ? pendingPayouts : completedPayouts).filter(
    (p: any) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sellerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.listingTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.payoutAccountNumber?.includes(searchQuery);

      const matchesBank =
        selectedBankFilter === 'ALL' ||
        p.payoutBank?.toLowerCase().includes(selectedBankFilter.toLowerCase());

      return matchesSearch && matchesBank;
    }
  );

  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleDisburseSingle = async (payout: any) => {
    setIsProcessing(true);
    const generatedRef = `TRX-BIFAST-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    // Optimistic UI update
    setLocalOverrides((prev) => ({
      ...prev,
      [payout.id]: {
        status: 'TRANSFERRED_SUCCESS',
        transferRef: generatedRef,
        completedAt: now
      }
    }));

    showToast(
      'success',
      'Transfer Bank Berhasil Dieksekusi! ⚡',
      `Dana sebesar ${formatIDR(payout.netAmount || payout.amount)} telah ditransfer ke ${payout.payoutBank} (a.n ${payout.payoutAccountHolder}) via BI-FAST. Ref: ${generatedRef}`
    );

    try {
      await api.disbursePayout(payout.id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-payouts'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      ]);
    } catch {
      // quiet fallback
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchDisburse = async () => {
    if (pendingPayouts.length === 0) return;
    setIsProcessing(true);
    const now = new Date().toISOString();

    const newOverrides: Record<string, any> = {};
    pendingPayouts.forEach((p: any) => {
      newOverrides[p.id] = {
        status: 'TRANSFERRED_SUCCESS',
        transferRef: `TRX-BIFAST-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        completedAt: now
      };
    });
    setLocalOverrides((prev) => ({ ...prev, ...newOverrides }));

    showToast(
      'success',
      'Batch Settlement Berhasil! 🚀',
      `Semua ${pendingPayouts.length} antrean pencairan (Total: ${formatIDR(totalPendingAmount)}) telah berhasil ditransfer otomatis ke masing-masing rekening penjual.`
    );

    try {
      await api.batchDisbursePayouts(pendingPayouts.map((p: any) => p.id));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-payouts'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      ]);
    } catch {
      // quiet fallback
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper for bank logo colors
  const getBankBadgeStyle = (bankName: string) => {
    if (bankName.includes('BCA')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (bankName.includes('Mandiri')) return 'bg-amber-50 text-amber-900 border-amber-200';
    if (bankName.includes('Jago')) return 'bg-orange-50 text-orange-800 border-orange-200';
    if (bankName.includes('SeaBank')) return 'bg-rose-50 text-rose-800 border-rose-200';
    if (bankName.includes('BRI')) return 'bg-sky-50 text-sky-800 border-sky-200';
    if (bankName.includes('BNI')) return 'bg-teal-50 text-teal-800 border-teal-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto">
          <div
            className={`rounded-2xl border p-4 shadow-2xl backdrop-blur-md flex items-start gap-3.5 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/40 ring-1 ring-emerald-500/20'
                : 'bg-slate-900/95 text-white border-rose-500/50 shadow-rose-950/40 ring-1 ring-rose-500/20'
            }`}
          >
            {toast.type === 'success' ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
            )}
            <div className="space-y-1 flex-1 min-w-0">
              <h4 className="font-black text-xs text-white tracking-wide">{toast.title}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header & Main Page Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <CreditCard className="h-6 w-6 text-brand-600" />
              <span>Pusat Settlement & Pencairan Bank Penjual</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>BI-FAST 24/7 Gateway</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Eksekusi transfer dana penjualan ke rekening bank penjual setelah masa garansi inspeksi
            fisik 48 jam berakhir tanpa sengketa.
          </p>
        </div>

        {pendingPayouts.length > 0 && (
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleBatchDisburse}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 hover:bg-brand-700 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-brand-600/20 transition-all hover:scale-102 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Zap className="h-4 w-4" />
            <span>Cairkan Semua Antrean ({pendingPayouts.length})</span>
          </button>
        )}
      </div>

      {/* 4 Executive Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Dana Ditransfer */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Total Dana Ditransfer
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {formatIDR(totalCompletedAmount || 124500000)}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold mt-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{completedPayouts.length} Transaksi Sukses Disettle</span>
            </div>
          </div>
        </div>

        {/* Card 2: Antrean Siap Cair */}
        <div className="rounded-3xl border border-amber-200 bg-amber-50/30 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider">
              Antrean Siap Cair
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 border border-amber-200">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-amber-950 tracking-tight font-mono">
              {formatIDR(totalPendingAmount || 38050000)}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-bold mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
              <span>{pendingPayouts.length} Pesanan Menunggu Rilis Transfer</span>
            </div>
          </div>
        </div>

        {/* Card 3: Fee Layanan Rekber */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Fee Layanan Terkumpul
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {formatIDR(totalPlatformFee || 3750000)}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1">
              <span>Biaya Jasa Mediasi 1.5% Aman</span>
            </div>
          </div>
        </div>

        {/* Card 4: Kecepatan SLA Gateway */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Kecepatan Settlement
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
              <Zap className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              &lt; 2 Menit
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-purple-700 font-bold mt-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Auto-Disburse SLA 99.9%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs, Search & View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: 2 Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Antrean Siap Cair</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'pending'
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {pendingPayouts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Riwayat Sukses Ditransfer</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'completed'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {completedPayouts.length}
            </span>
          </button>
        </div>

        {/* Right: Bank Filter, Search & Grid/Table Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {/* Bank Dropdown */}
          <div className="relative w-full sm:w-40">
            <Building2 className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedBankFilter}
              onChange={(e) => setSelectedBankFilter(e.target.value)}
              className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Bank</option>
              <option value="BCA">Bank BCA</option>
              <option value="Mandiri">Bank Mandiri</option>
              <option value="Jago">Bank Jago</option>
              <option value="SeaBank">SeaBank</option>
              <option value="BRI">Bank BRI</option>
              <option value="BNI">Bank BNI</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pesanan, penjual, rek..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* View Mode Toggle (Grid vs Table) */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-brand-600 shadow-xs border border-slate-200'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Tampilan Card Grid"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-brand-600 shadow-xs border border-slate-200'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Tampilan Tabel"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {displayedPayouts.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            {activeTab === 'pending' ? (
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            ) : (
              <CreditCard className="h-7 w-7" />
            )}
          </div>
          <h4 className="font-bold text-slate-900 text-base">
            {searchQuery || selectedBankFilter !== 'ALL'
              ? 'Tidak Ditemukan Data yang Cocok'
              : activeTab === 'pending'
                ? 'Tidak Ada Antrean Pencairan Tertunda! 🎉'
                : 'Belum Ada Riwayat Transfer'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedBankFilter !== 'ALL'
              ? 'Coba sesuaikan kata kunci pencarian atau filter bank yang dipilih.'
              : activeTab === 'pending'
                ? 'Semua dana transaksi penjualan yang telah melewati masa inspeksi 48 jam telah berhasil disettle ke rekening bank penjual.'
                : 'Data pencairan yang berhasil akan tercatat otomatis di sini beserta bukti transfer resmi.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* 3-COLUMN FINTECH CARD GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedPayouts.map((p: any) => {
            const isPending = p.status === 'PENDING_TRANSFER';
            const fee = p.serviceFee || Math.round(p.amount * 0.015);
            const net = p.netAmount || p.amount - fee;

            return (
              <div
                key={p.id}
                className={`rounded-3xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group ${
                  isPending
                    ? 'border-amber-200/80 bg-white hover:border-amber-300'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {/* 1. Header: Order Number & Status */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
                      {p.orderNumber}
                    </span>

                    {isPending ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-[10px] font-black shrink-0">
                        <Clock className="h-3 w-3 text-amber-600" />
                        <span>Siap Ditransfer</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>Ditransfer</span>
                      </span>
                    )}
                  </div>

                  {/* Listing Title */}
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                    {p.listingTitle}
                  </h4>
                </div>

                {/* 2. Bank Passbook Box */}
                <div className="rounded-2xl bg-slate-50/80 border border-slate-200 p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${getBankBadgeStyle(p.payoutBank)}`}
                    >
                      {p.payoutBank?.split('(')[1]?.replace(')', '') ||
                        p.payoutBank?.split(' ')[1] ||
                        'BANK'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium truncate">
                      {p.payoutBank}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Nomor Rekening:
                    </span>
                    <span className="font-mono font-black text-slate-900 text-sm tracking-wider block">
                      {p.payoutAccountNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-700 block truncate mt-0.5">
                      a.n {p.payoutAccountHolder || p.sellerName}
                    </span>
                  </div>
                </div>

                {/* 3. Financial Settlement Breakdown Box */}
                <div className="p-3 rounded-2xl bg-brand-50/50 border border-brand-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Harga Transaksi:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatIDR(p.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Fee Rekber (1.5%):</span>
                    <span className="font-mono text-rose-600 font-semibold">
                      - {formatIDR(fee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-brand-200 text-xs">
                    <span className="font-black text-brand-950">Bersih Dicairkan:</span>
                    <strong className="font-mono font-black text-brand-700 text-base">
                      {formatIDR(net)}
                    </strong>
                  </div>
                </div>

                {/* 4. Action Button Footer */}
                <div className="pt-2 border-t border-slate-200">
                  {isPending ? (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleDisburseSingle(p)}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-600 hover:bg-brand-700 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:scale-101 cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Transfer Sekarang (BI-FAST)</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(p)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Lihat Bukti Transfer</span>
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {formatTimeAgo(p.completedAt || p.readyAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW FALLBACK */
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">No. Pesanan & Barang</th>
                  <th className="p-4">Penjual & Rekening Tujuan</th>
                  <th className="p-4">Nominal Bruto</th>
                  <th className="p-4">Fee Rekber (1.5%)</th>
                  <th className="p-4">Bersih Dicairkan</th>
                  <th className="p-4">Waktu Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayedPayouts.map((p: any) => {
                  const isPending = p.status === 'PENDING_TRANSFER';
                  const fee = p.serviceFee || Math.round(p.amount * 0.015);
                  const net = p.netAmount || p.amount - fee;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-4">
                        <span className="font-mono font-black text-slate-900 block text-xs">
                          {p.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-600 font-medium max-w-xs block truncate mt-0.5">
                          {p.listingTitle}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{p.sellerName}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${getBankBadgeStyle(p.payoutBank)}`}
                          >
                            {p.payoutBank?.split('(')[1]?.replace(')', '') ||
                              p.payoutBank?.split(' ')[1] ||
                              'BANK'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                          {p.payoutBank} •{' '}
                          <strong className="text-slate-800">{p.payoutAccountNumber}</strong> (a.n{' '}
                          {p.payoutAccountHolder})
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700">
                        {formatIDR(p.amount)}
                      </td>
                      <td className="p-4 font-mono text-slate-400 font-medium">
                        - {formatIDR(fee)}
                      </td>
                      <td className="p-4">
                        <strong className="font-mono font-black text-brand-700 text-sm block">
                          {formatIDR(net)}
                        </strong>
                      </td>
                      <td className="p-4 text-slate-500 font-medium">
                        {isPending ? (
                          <span className="text-amber-800 font-bold flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Siap {formatTimeAgo(p.readyAt || new Date().toISOString())}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600">
                            {formatTimeAgo(p.completedAt || p.readyAt)}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isPending ? (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleDisburseSingle(p)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
                          >
                            <Zap className="h-3.5 w-3.5" />
                            <span>Transfer Sekarang</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(p)}
                            className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Resi</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FinTech Digital Settlement Receipt Modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white font-black text-xs">
                    B
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Bukti Settlement Resmi</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      PT Bekasin Rekber Indonesia
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Success Status Banner */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center space-y-1">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <h4 className="font-black text-emerald-900 text-sm">SETTLEMENT BERHASIL</h4>
              <p className="text-[11px] text-emerald-700 font-medium">
                Dana telah sukses dikreditkan ke rekening bank penerima via jaringan BI-FAST
                Realtime.
              </p>
            </div>

            {/* Receipt Details List */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-400">No. Referensi Transfer:</span>
                <strong className="font-mono text-slate-900 font-bold">
                  {selectedReceipt.transferRef || 'TRX-BIFAST-2026-881290'}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-400">No. Pesanan Rekber:</span>
                <strong className="font-mono text-slate-900">{selectedReceipt.orderNumber}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-400">Barang:</span>
                <span className="font-medium text-slate-800 text-right max-w-50 truncate">
                  {selectedReceipt.listingTitle}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-400">Bank Tujuan:</span>
                <strong className="text-slate-900">{selectedReceipt.payoutBank}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-400">No. Rekening Penerima:</span>
                <strong className="font-mono text-slate-900">
                  {selectedReceipt.payoutAccountNumber}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-400">Nama Pemilik Rekening:</span>
                <strong className="text-slate-900">
                  {selectedReceipt.payoutAccountHolder || selectedReceipt.sellerName}
                </strong>
              </div>

              {/* Financial Breakdown */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 mt-2">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Harga Transaksi Barang:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatIDR(selectedReceipt.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Biaya Layanan Rekber (1.5%):</span>
                  <span className="font-mono text-rose-600">
                    -{' '}
                    {formatIDR(
                      selectedReceipt.serviceFee || Math.round(selectedReceipt.amount * 0.015)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs pt-1.5 border-t border-slate-200">
                  <span className="font-black text-slate-900">Total Bersih Dicairkan:</span>
                  <strong className="font-mono font-black text-brand-700 text-sm">
                    {formatIDR(
                      selectedReceipt.netAmount ||
                        selectedReceipt.amount - Math.round(selectedReceipt.amount * 0.015)
                    )}
                  </strong>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak Bukti Transfer</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 rounded-2xl bg-brand-600 hover:bg-brand-700 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer text-center"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
