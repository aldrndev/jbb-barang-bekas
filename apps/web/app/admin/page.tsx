'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useAuth } from '../../context/auth-context';
import { formatIDR, formatTimeAgo } from '../../lib/utils';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';
import { ConditionBadge } from '../../components/marketplace/condition-badge';
import {
  ShieldAlert,
  ShieldCheck,
  Building,
  CreditCard,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  ArrowRight,
  RefreshCw,
  Eye,
  Trash2,
  Lock,
  Sparkles,
  Search,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  BadgeCheck,
  TrendingUp,
  DollarSign,
  Activity,
  Layers,
  FileText,
  User
} from 'lucide-react';

export default function AdminPortalPage() {
  const queryClient = useQueryClient();
  const { user, loginAsDemoAdmin, loginAsDemoSeller, loginAsDemoBuyer, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'overview' | 'disputes' | 'kyc' | 'payouts' | 'listings'>('overview');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Queries
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.getAdminStats(),
    enabled: isAdmin
  });

  const { data: kycData, refetch: refetchKyc } = useQuery({
    queryKey: ['admin-kyc'],
    queryFn: () => api.getAdminKycQueue(),
    enabled: isAdmin
  });

  const { data: disputesData, refetch: refetchDisputes } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => api.getAdminDisputes(),
    enabled: isAdmin
  });

  const { data: payoutsData, refetch: refetchPayouts } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: () => api.getAdminPayouts(),
    enabled: isAdmin
  });

  const { data: listingsData, refetch: refetchListings } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => api.getAdminListings(),
    enabled: isAdmin
  });

  const stats = statsData?.data || {
    escrowHoldingTotal: 48500000,
    completedPayoutTotal: 124500000,
    totalGmv: 173000000,
    activeDisputesCount: 1,
    pendingKycCount: 2,
    totalUsersCount: 120,
    totalListingsCount: 45,
    activeListingsCount: 38
  };

  const kycQueue = kycData?.data || [];
  const disputes = disputesData?.data || [];
  const payouts = payoutsData?.data || [];
  const listings = listingsData?.data || [];

  const handleApproveKyc = async (userId: string) => {
    setIsProcessingAction(true);
    const res = await api.approveKyc(userId);
    if (res.success) {
      alert(res.message || 'KYC berhasil disetujui!');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-kyc'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      ]);
    } else {
      alert(res.error?.message || 'Gagal menyetujui KYC');
    }
    setIsProcessingAction(false);
  };

  const handleRejectKyc = async (userId: string) => {
    setIsProcessingAction(true);
    const res = await api.rejectKyc(userId);
    if (res.success) {
      alert(res.message || 'KYC telah ditolak.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-kyc'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      ]);
    } else {
      alert(res.error?.message || 'Gagal menolak KYC');
    }
    setIsProcessingAction(false);
  };

  const handleResolveDispute = async (orderId: string, action: 'REFUND_BUYER' | 'RELEASE_TO_SELLER') => {
    const confirmText =
      action === 'REFUND_BUYER'
        ? 'Apakah Anda yakin ingin ME-REFUND DANA PENUH ke pembeli? Status pesanan akan menjadi REFUNDED.'
        : 'Apakah Anda yakin ingin MENCAIRKAN DANA KE PENJUAL? Sengketa akan ditutup dan status menjadi COMPLETED.';

    if (!confirm(confirmText)) return;

    setIsProcessingAction(true);
    const res = await api.resolveDispute(orderId, action, adminNotes);
    if (res.success) {
      alert(res.message || 'Sengketa berhasil diselesaikan!');
      setSelectedDisputeId(null);
      setAdminNotes('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-disputes'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-payouts'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      ]);
    } else {
      alert(res.error?.message || 'Gagal menyelesaikan sengketa');
    }
    setIsProcessingAction(false);
  };

  const handleToggleListingStatus = async (listingId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    const res = await api.updateAdminListingStatus(listingId, nextStatus as any);
    if (res.success) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['listings'] })
      ]);
    }
  };

  // Auth Guard for Non-Admin
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xs space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 border border-rose-100 shadow-xs">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-black text-slate-900">Portal Admin & Mediasi Rekber</h1>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Halaman ini khusus untuk Tim Kepatuhan, Petugas Mediasi Sengketa, dan Administrator Keuangan Rekber JBB.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={loginAsDemoAdmin}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-slate-900 hover:bg-black px-6 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Masuk Sebagai Demo Admin (Master)</span>
            </button>
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 px-6 py-2.5 text-xs font-bold text-slate-700 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-3 sm:py-6 px-3.5 sm:px-6 lg:px-8 pb-6 sm:pb-8">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        {/* Breadcrumb & Demo Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div>
            <Breadcrumbs items={[{ label: 'Portal Admin Rekber' }]} />
            <h1 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
              <ShieldAlert className="h-5 w-5 text-brand-600 shrink-0" />
              <span>Back-Office & Escrow Resolution Center</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Pusat kendali mediasi sengketa transaksi, persetujuan KYC KTP, dan pemantauan brankas Rekber.
            </p>
          </div>

          {/* Quick Role Switcher */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400">Mode Switcher:</span>
            <button
              onClick={loginAsDemoAdmin}
              className="rounded-full bg-slate-900 text-white px-2.5 py-1 text-[10px] font-bold shadow-xs cursor-pointer"
            >
              👑 Admin (Aktif)
            </button>
            <button
              onClick={loginAsDemoSeller}
              className="rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-2.5 py-1 text-[10px] font-bold cursor-pointer"
            >
              Penjual (Budi)
            </button>
            <button
              onClick={loginAsDemoBuyer}
              className="rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-2.5 py-1 text-[10px] font-bold cursor-pointer"
            >
              Pembeli (Dimas)
            </button>
          </div>
        </div>

        {/* 4 Key Financial & Operational Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-3xl border border-brand-200 bg-white p-4 sm:p-5 shadow-xs space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-bold">
              <span>Saldo Escrow Ditahan</span>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-base sm:text-2xl font-black text-brand-700">
              {formatIDR(stats.escrowHoldingTotal)}
            </p>
            <span className="text-[10px] text-slate-500 font-medium block">
              Dana aman dalam perlindungan Rekber
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-1">
            <span className="text-slate-400 text-[10px] sm:text-xs font-bold block">
              Total Pencairan Sukses
            </span>
            <p className="text-base sm:text-2xl font-black text-slate-900">
              {formatIDR(stats.completedPayoutTotal)}
            </p>
            <span className="text-[10px] text-emerald-600 font-bold block">
              ✓ Telah ditransfer ke rekening penjual
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-bold">
              <span>Sengketa / Komplain</span>
              {stats.activeDisputesCount > 0 && (
                <span className="rounded-full bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.2">
                  {stats.activeDisputesCount} Kasus
                </span>
              )}
            </div>
            <p className="text-base sm:text-2xl font-black text-rose-600">
              {stats.activeDisputesCount} Pesanan
            </p>
            <span className="text-[10px] text-slate-500 font-medium block">
              Butuh investigasi & putusan mediasi
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-1">
            <span className="text-slate-400 text-[10px] sm:text-xs font-bold block">
              Antrean Verifikasi KYC
            </span>
            <p className="text-base sm:text-2xl font-black text-amber-600">
              {stats.pendingKycCount} Akun
            </p>
            <span className="text-[10px] text-slate-500 font-medium block">
              Menunggu validasi KTP & NIK
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-brand-500" />
            <span>1. Ringkasan & Brankas Escrow</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('disputes')}
            className={`flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer relative ${
              activeTab === 'disputes'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            <span>2. Pusat Mediasi Sengketa ({disputes.length})</span>
            {disputes.length > 0 && (
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping absolute top-1 right-1" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kyc')}
            className={`flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'kyc'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5 text-amber-500" />
            <span>3. Moderasi KYC KTP ({kycQueue.filter((u) => !u.isKycVerified).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payouts')}
            className={`flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'payouts'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
            <span>4. Riwayat Pencairan Bank ({payouts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'listings'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Package className="h-3.5 w-3.5 text-blue-500" />
            <span>5. Moderasi Iklan ({listings.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview & Escrow Vault */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">Arsitektur Perlindungan Rekber JBB</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Status operasional gerbang escrow dan sistem perlindungan 48 jam.</p>
                </div>
                <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Escrow Gateway 100% Online</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
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
        )}

        {/* Tab 2: Dispute Resolution Center */}
        {activeTab === 'disputes' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <span>Pusat Mediasi Sengketa Transaksi ({disputes.length} Kasus)</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Tinjau bukti unboxing dan klaim pembeli untuk memutuskan arah pengembalian dana atau pencairan.
                </p>
              </div>
            </div>

            {disputes.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Tidak Ada Sengketa Aktif</h4>
                <p className="text-xs text-slate-400">Semua transaksi berjalan lancar tanpa perselisihan.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map((d: any) => (
                  <div
                    key={d.id}
                    className="rounded-2xl border-2 border-rose-200 bg-rose-50/30 p-4 sm:p-5 space-y-4 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/80 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                          {d.orderNumber}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">
                          {d.listing?.title || 'Barang Sengketa'}
                        </h4>
                      </div>
                      <span className="text-base font-black text-brand-700">
                        {formatIDR(d.totalAmount || d.itemPrice)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Buyer claim & reason */}
                      <div className="rounded-xl bg-white p-3.5 border border-rose-200 space-y-2 shadow-2xs">
                        <span className="font-bold text-rose-900 block flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-rose-600" />
                          <span>Klaim & Alasan Komplain Pembeli ({d.buyer?.name}):</span>
                        </span>
                        <p className="text-slate-800 leading-relaxed font-medium bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                          "{d.disputeReason || 'Barang tidak sesuai dengan foto dan deskripsi yang dicantumkan penjual.'}"
                        </p>

                        {/* Evidence Photos */}
                        {d.disputeEvidenceUrls && d.disputeEvidenceUrls.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-bold text-slate-500 block">Foto Bukti Kerusakan:</span>
                            <div className="flex gap-2 flex-wrap">
                              {d.disputeEvidenceUrls.map((imgUrl: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={imgUrl}
                                  alt="Evidence"
                                  onClick={() => setPreviewImageUrl(imgUrl)}
                                  className="h-16 w-16 rounded-lg object-cover border border-slate-200 cursor-pointer hover:scale-105 transition-transform"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Seller & Payout Details */}
                      <div className="rounded-xl bg-white p-3.5 border border-slate-200 space-y-2 shadow-2xs">
                        <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-brand-600" />
                          <span>Informasi Penjual ({d.seller?.name}):</span>
                        </span>
                        <div className="space-y-1 text-slate-600">
                          <p>WhatsApp: <strong>{d.seller?.phone || '081987654321'}</strong></p>
                          <p>Rekening Tujuan: <strong>{d.seller?.bankName || 'BCA'} - {d.seller?.bankAccountNumber || '8271029384'}</strong></p>
                          <p>Kurir / Resi: <strong>{d.courierName || 'JNE'} ({d.trackingNumber || 'JNE-882910293'})</strong></p>
                        </div>
                      </div>
                    </div>

                    {/* Admin Action Bar */}
                    <div className="rounded-xl bg-white p-3.5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-700">
                        Eksekusi Putusan Mediasi Admin:
                      </span>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          disabled={isProcessingAction}
                          onClick={() => handleResolveDispute(d.id, 'REFUND_BUYER')}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-full bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>🔄 Refund Penuh ke Pembeli</span>
                        </button>
                        <button
                          type="button"
                          disabled={isProcessingAction}
                          onClick={() => handleResolveDispute(d.id, 'RELEASE_TO_SELLER')}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>💰 Cairkan Dana ke Penjual</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: KYC Moderation Queue */}
        {activeTab === 'kyc' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-amber-600" />
                  <span>Daftar Pengajuan Verifikasi KYC KTP</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Validasi kesesuaian NIK, foto KTP, dan foto selfie pengguna sebelum memberikan lencana resmi.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {kycQueue.map((u: any) => (
                <div
                  key={u.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={u.selfieImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={u.name}
                        className="h-12 w-12 rounded-2xl object-cover border border-slate-200"
                      />
                      {u.isKycVerified && (
                        <BadgeCheck className="h-4 w-4 text-brand-600 fill-brand-100 absolute -bottom-1 -right-1" />
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">{u.name}</span>
                        {u.isKycVerified ? (
                          <span className="rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.2 text-[9px] font-bold">
                            ✓ Terverifikasi
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.2 text-[9px] font-bold">
                            Menunggu Persetujuan
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 font-mono text-[11px]">NIK: {u.nik || '3174092801950001'}</p>
                      <p className="text-slate-400 text-[10px]">Email: {u.email} &bull; WA: {u.phone || '-'}</p>
                    </div>
                  </div>

                  {/* KTP Image Preview & Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => setPreviewImageUrl(u.ktpImageUrl)}
                        className="relative h-12 w-20 rounded-xl overflow-hidden border border-slate-300 bg-white cursor-pointer hover:ring-2 hover:ring-brand-500 transition-all"
                        title="Klik untuk perbesar KTP"
                      >
                        <img src={u.ktpImageUrl} alt="KTP" className="h-full w-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[8px] text-center font-bold">
                          Foto KTP
                        </span>
                      </div>

                      <div
                        onClick={() => setPreviewImageUrl(u.selfieImageUrl)}
                        className="relative h-12 w-12 rounded-xl overflow-hidden border border-slate-300 bg-white cursor-pointer hover:ring-2 hover:ring-brand-500 transition-all"
                        title="Klik untuk perbesar Selfie"
                      >
                        <img src={u.selfieImageUrl} alt="Selfie" className="h-full w-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[8px] text-center font-bold">
                          Selfie
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!u.isKycVerified ? (
                        <>
                          <button
                            type="button"
                            disabled={isProcessingAction}
                            onClick={() => handleApproveKyc(u.id)}
                            className="flex items-center gap-1 rounded-full bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Setujui (Approve)</span>
                          </button>
                          <button
                            type="button"
                            disabled={isProcessingAction}
                            onClick={() => handleRejectKyc(u.id)}
                            className="flex items-center gap-1 rounded-full bg-slate-200 hover:bg-rose-50 hover:text-rose-700 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Tolak</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={isProcessingAction}
                          onClick={() => handleRejectKyc(u.id)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 hover:text-rose-600 cursor-pointer"
                        >
                          Cabut Verifikasi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Payouts History */}
        {activeTab === 'payouts' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>Riwayat Transfer Pencairan Dana Rekber ke Penjual</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Log transfer otomatis settlement ke rekening bank setelah 48 jam masa garansi selesai.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-2.5">No Pesanan & Barang</th>
                    <th className="pb-2.5">Penjual</th>
                    <th className="pb-2.5">Rekening Bank Tujuan</th>
                    <th className="pb-2.5">Jumlah Dana</th>
                    <th className="pb-2.5">Status Transfer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {payouts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pr-3">
                        <span className="font-mono font-bold text-slate-900 block text-[11px]">{p.orderNumber}</span>
                        <span className="text-slate-500 text-[11px] block truncate max-w-xs">{p.listingTitle}</span>
                      </td>
                      <td className="py-3 pr-3 font-bold text-slate-900">{p.sellerName}</td>
                      <td className="py-3 pr-3">
                        <span className="font-bold text-slate-900 block">{p.payoutBank}</span>
                        <span className="font-mono text-slate-500 text-[11px] block">{p.payoutAccountNumber} (a.n {p.payoutAccountHolder})</span>
                      </td>
                      <td className="py-3 pr-3 font-black text-brand-700 text-sm">
                        {formatIDR(p.amount)}
                      </td>
                      <td className="py-3">
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold inline-flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          <span>Berhasil Ditransfer</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Listings Moderation */}
        {activeTab === 'listings' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span>Manajemen & Moderasi Iklan Barang ({listings.length})</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Takedown iklan yang melanggar aturan atau aktifkan kembali listing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {listings.map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/80 p-3.5 bg-white flex gap-3 items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80'}
                      alt={item.title}
                      className="h-14 w-14 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="space-y-0.5 min-w-0 text-xs">
                      <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                      <p className="font-black text-brand-700">{formatIDR(item.price)}</p>
                      <span className="text-[10px] text-slate-400 block">
                        Penjual: {item.seller?.name || 'User'} &bull; Status: <strong>{item.status}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/listing/${item.slug || item.id}`}
                      target="_blank"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      title="Lihat Iklan"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleToggleListingStatus(item.id, item.status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        item.status === 'ACTIVE'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {item.status === 'ACTIVE' ? 'Takedown' : 'Aktifkan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Image Preview Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs cursor-pointer animate-in fade-in"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] w-full flex flex-col items-center">
            <img
              src={previewImageUrl}
              alt="Dokumen"
              className="max-h-[80vh] w-auto object-contain rounded-2xl border-2 border-white/20 shadow-2xl"
            />
            <p className="text-white text-xs font-bold mt-2">Klik di mana saja untuk menutup pratinjau</p>
          </div>
        </div>
      )}
    </div>
  );
}
