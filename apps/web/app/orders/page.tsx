'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { formatIDR } from '../../lib/utils';
import { ConditionBadge } from '../../components/marketplace/condition-badge';
import { EscrowStatusBadge } from '../../components/marketplace/escrow-status-badge';
import { EscrowTimeline } from '../../components/marketplace/escrow-timeline';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';
import type { Order } from '@jbb/types';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Package,
  Copy,
  Search,
  ExternalLink,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
  Send,
  Sparkles,
  ArrowRight,
  Clock,
  AlertCircle,
  Check,
  Filter,
  MessageSquare,
  Lock
} from 'lucide-react';

function OrderHistoryContent() {
  const { user, openAuthModal } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const queryRole = searchParams.get('role') as 'buyer' | 'seller' | null;

  const [orderMode, setOrderMode] = useState<'buyer' | 'seller'>(() => {
    if (queryRole === 'seller' || queryRole === 'buyer') return queryRole;
    if (user?.role === 'SELLER') return 'seller';
    return 'buyer';
  });
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [copiedResi, setCopiedResi] = useState<string | null>(null);
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);

  // Seller Resi input modal/inline state
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [courierNameInput, setCourierNameInput] = useState('JNE Reguler');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // Buyer Release Funds & Dispute Modals
  const [releaseOrderId, setReleaseOrderId] = useState<string | null>(null);
  const [isSubmittingRelease, setIsSubmittingRelease] = useState(false);
  const [disputeOrderId, setDisputeOrderId] = useState<string | null>(null);
  const [disputeReasonInput, setDisputeReasonInput] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.getOrders();
      if (res.success && res.data) {
        return res.data;
      }
      return [];
    },
    enabled: !!user
  });

  // Automatically sync role mode only when queryRole explicitly changes
  useEffect(() => {
    if (queryRole === 'seller' || queryRole === 'buyer') {
      setOrderMode(queryRole);
    }
  }, [queryRole]);

  if (!user) {
    return (
      <div className="bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xs space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 shadow-xs">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900">Masuk untuk Melihat Riwayat Pesanan</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Akses status escrow rekening bersama, pantau resi ekspedisi, dan konfirmasi barang.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={openAuthModal}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 py-3 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
            >
              <Lock className="h-4 w-4" />
              <span>Masuk / Daftar Akun</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter orders by role tab (buyer vs seller)
  const modeOrders = orders.filter((order) => {
    if (orderMode === 'buyer') {
      return order.buyerId === user.id;
    }
    return order.sellerId === user.id;
  });

  // Filter orders by tab and search query
  const filteredOrders = modeOrders.filter((order) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchTitle = order.listing?.title?.toLowerCase().includes(q);
      if (!matchNumber && !matchTitle) return false;
    }

    if (activeTab === 'all') return true;
    if (activeTab === 'pending_payment') return order.escrowStatus === 'WAITING_PAYMENT';
    if (activeTab === 'packing') return order.escrowStatus === 'PAYMENT_CONFIRMED' || order.escrowStatus === 'SELLER_PACKING';
    if (activeTab === 'shipped') return order.escrowStatus === 'IN_TRANSIT';
    if (activeTab === 'inspection') return order.escrowStatus === 'DELIVERED_INSPECTION';
    if (activeTab === 'completed') return order.escrowStatus === 'COMPLETED';
    if (activeTab === 'disputed') return order.escrowStatus === 'DISPUTED' || order.escrowStatus === 'CANCELLED';
    return true;
  });

  const handleCopyResi = (resi: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(resi);
      setCopiedResi(resi);
      toast.success('Resi Disalin', `Nomor resi ${resi} berhasil disalin ke clipboard.`);
      setTimeout(() => setCopiedResi(null), 2000);
    }
  };

  const confirmReleaseFunds = async () => {
    if (!releaseOrderId) return;
    setIsSubmittingRelease(true);
    const res = await api.completeOrder(releaseOrderId);
    if (res.success) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      ]);
      toast.success('Dana Berhasil Dicairkan', 'Terima kasih telah mengonfirmasi penerimaan barang. Transaksi selesai aman.');
      setReleaseOrderId(null);
      refetch();
    } else {
      toast.error('Gagal Melepaskan Dana', res.error?.message || 'Terjadi kesalahan sistem.');
    }
    setIsSubmittingRelease(false);
  };

  const confirmSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeOrderId) return;
    if (!disputeReasonInput.trim()) {
      toast.warning('Alasan Wajib Diisi', 'Mohon jelaskan kendala barang yang Anda terima.');
      return;
    }
    setIsSubmittingDispute(true);
    const res = await api.disputeOrder(disputeOrderId, disputeReasonInput.trim(), []);
    if (res.success) {
      toast.success('Komplain Terdaftar', 'Tim CS Rekber Bekasin akan menahan dana dan memediasi dengan penjual.');
      setDisputeOrderId(null);
      setDisputeReasonInput('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      ]);
      refetch();
    } else {
      toast.error('Gagal Mengajukan Komplain', res.error?.message || 'Terjadi kendala saat mengirim komplain.');
    }
    setIsSubmittingDispute(false);
  };

  const handleSubmitShipping = async (orderId: string) => {
    if (!trackingNumberInput.trim()) {
      toast.warning('Nomor Resi Wajib Diisi', 'Masukkan nomor resi pengiriman kurir yang valid.');
      return;
    }
    const res = await api.updateShipping(orderId, courierNameInput, trackingNumberInput.trim());
    if (res.success) {
      toast.success('Resi Pengiriman Disimpan', 'Pembeli telah menerima notifikasi nomor resi pengiriman.');
      setShippingOrderId(null);
      setTrackingNumberInput('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      ]);
      refetch();
    } else {
      toast.error('Gagal Mengupdate Resi', res.error?.message || 'Terjadi kesalahan saat menyimpan resi.');
    }
  };

  const buyerCount = orders.filter((o) => o.buyerId === user.id).length;
  const sellerCount = orders.filter((o) => o.sellerId === user.id).length;

  return (
    <div className="bg-slate-50 py-3 sm:py-6 px-3.5 sm:px-6 lg:px-8 pb-6 sm:pb-8">
      <div className="mx-auto max-w-5xl space-y-4 sm:space-y-5">
        {/* Top Header Row: Breadcrumbs */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <Breadcrumbs
            items={[
              { label: orderMode === 'buyer' ? 'Belanjaan Saya' : 'Penjualan Saya' }
            ]}
          />
        </div>

        {/* 1. Mode Segmented Switcher Bar (Mobile-Friendly 2-Tabs) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs space-y-3.5">
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setOrderMode('buyer');
                setActiveTab('all');
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                orderMode === 'buyer'
                  ? 'bg-white text-slate-900 shadow-xs scale-101'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="h-4 w-4 text-brand-600" />
              <span>Belanjaan Saya</span>
              {buyerCount > 0 && (
                <span className="rounded-full bg-brand-50 border border-brand-200 text-brand-800 px-1.5 py-0.2 text-[10px] font-black">
                  {buyerCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setOrderMode('seller');
                setActiveTab('all');
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                orderMode === 'seller'
                  ? 'bg-white text-slate-900 shadow-xs scale-101'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tag className="h-4 w-4 text-amber-600" />
              <span>Penjualan Saya</span>
              {sellerCount > 0 && (
                <span className="rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-1.5 py-0.2 text-[10px] font-black">
                  {sellerCount}
                </span>
              )}
            </button>
          </div>

          {/* Search bar & Action Shortcuts */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={orderMode === 'buyer' ? 'Cari nomor pesanan atau nama barang...' : 'Cari transaksi penjualan...'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-9 pr-3.5 py-2.5 text-xs text-slate-800 focus:border-brand-500 focus:outline-none focus:bg-white transition-colors"
              />
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
            </div>

            {orderMode === 'seller' && (
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Link
                  href="/jual"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-2xl bg-brand-600 hover:bg-brand-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
                >
                  <span>+ Pasang Iklan</span>
                </Link>
              </div>
            )}
          </div>

          {/* Status Filter Horizontal Scroll Bar */}
          <div className="border-t border-slate-100 pt-3 flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {[
              { id: 'all', label: 'Semua', count: modeOrders.length },
              { id: 'packing', label: orderMode === 'seller' ? 'Perlu Dikirim' : 'Dikemas', count: modeOrders.filter((o) => o.escrowStatus === 'PAYMENT_CONFIRMED' || o.escrowStatus === 'SELLER_PACKING').length },
              { id: 'shipped', label: 'Pengiriman', count: modeOrders.filter((o) => o.escrowStatus === 'IN_TRANSIT').length },
              { id: 'inspection', label: 'Cek 48 Jam', count: modeOrders.filter((o) => o.escrowStatus === 'DELIVERED_INSPECTION').length },
              { id: 'completed', label: 'Selesai & Cair', count: modeOrders.filter((o) => o.escrowStatus === 'COMPLETED').length },
              { id: 'disputed', label: 'Komplain', count: modeOrders.filter((o) => o.escrowStatus === 'DISPUTED' || o.escrowStatus === 'CANCELLED').length }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && <span className="ml-1 opacity-70">({tab.count})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Order List Cards (Optimized for Mobile & Desktop) */}
        {isLoading ? (
          <div className="space-y-3.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-3xl bg-white border border-slate-200 p-5 shadow-2xs" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs space-y-4">
            <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 border border-slate-200">
              {orderMode === 'buyer' ? <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10" /> : <Tag className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600" />}
            </div>
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                {orderMode === 'buyer' ? 'Belum Ada Transaksi Pembelian' : 'Belum Ada Transaksi Penjualan'}
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                {orderMode === 'buyer'
                  ? 'Barang bekas berkualitas yang Anda beli lewat Rekber Bekasin akan otomatis terpantau di sini.'
                  : 'Pesanan barang Anda yang dibayar pembeli lewat Rekber Bekasin akan muncul di sini untuk Anda proses.'}
              </p>
            </div>
            <div className="pt-1">
              {orderMode === 'buyer' ? (
                <Link
                  href="/cari"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Cari Barang Bekas</span>
                </Link>
              ) : (
                <Link
                  href="/jual"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
                >
                  <Tag className="h-3.5 w-3.5" />
                  <span>Pasang Iklan Sekarang</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 sm:space-y-4">
            {filteredOrders.map((order) => {
              const primaryImg =
                order.listing?.images?.find((img: any) => img.isPrimary)?.url ||
                order.listing?.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=200&auto=format&fit=crop&q=80';

              const isBuyer = order.buyerId === user.id;
              const isSeller = order.sellerId === user.id;
              const isTimelineExpanded = expandedTimelineId === order.id;

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-3.5 hover:border-slate-300 transition-colors"
                >
                  {/* Card Header: Order No, Date, Partner & Escrow Badge */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-black text-slate-900 font-mono text-[11px] sm:text-xs">
                          {order.orderNumber}
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-semibold truncate">
                        {isBuyer
                          ? `Penjual: ${order.seller?.name || 'Penjual Terpercaya'}`
                          : `Pembeli: ${order.buyer?.name || order.recipientName || 'Pembeli Rekber'}`}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <EscrowStatusBadge status={order.escrowStatus} size="sm" />
                    </div>
                  </div>

                  {/* Card Body: Product Info & Price */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <img
                      src={primaryImg}
                      alt={order.listing?.title || 'Produk'}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <ConditionBadge condition={order.listing?.condition || 'LIKE_NEW'} size="sm" />
                        <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.2 rounded-md">
                          {order.deliveryMethod === 'COD_KETEMUAN' ? '⚡ COD Ketemuan' : '📦 Kurir Kilat'}
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                        {order.listing?.title || 'Barang Bekas'}
                      </h3>

                      <div className="flex items-baseline justify-between gap-2 pt-0.5">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {isSeller ? 'Saldo Cair:' : 'Total Bayar:'}
                        </span>
                        <span className="text-sm sm:text-base font-black text-brand-700">
                          {formatIDR(isSeller ? order.amount : order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery & Tracking Info Banner */}
                  {order.deliveryMethod === 'KURIR_REGULER' && order.trackingNumber ? (
                    <div className="rounded-2xl bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Truck className="h-4 w-4 text-brand-600 shrink-0" />
                        <span className="text-[11px] text-slate-600 truncate">
                          {order.courierName || 'JNE/J&T'}: <strong className="font-mono text-slate-900">{order.trackingNumber}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyResi(order.trackingNumber!)}
                        className="flex items-center gap-1 text-[10px] font-bold text-brand-700 hover:text-brand-800 bg-white border border-slate-200 px-2 py-1 rounded-lg shrink-0 cursor-pointer shadow-2xs"
                      >
                        {copiedResi === order.trackingNumber ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedResi === order.trackingNumber ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  ) : order.deliveryMethod === 'COD_KETEMUAN' ? (
                    <div className="rounded-2xl bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80 flex items-center gap-2 text-[11px] text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
                      <span className="truncate">
                        Titik Temu COD: <strong className="text-slate-900">{order.shippingAddress || 'Area Publik Aman'}</strong>
                      </span>
                    </div>
                  ) : null}

                  {/* Seller Action: Inline Resi Input Form */}
                  {isSeller && shippingOrderId === order.id && (
                    <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-3.5 sm:p-4 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Truck className="h-4 w-4 text-brand-600" />
                          <span>Input Resi Pengiriman</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShippingOrderId(null)}
                          className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                          value={courierNameInput}
                          onChange={(e) => setCourierNameInput(e.target.value)}
                          className="rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 font-bold focus:border-brand-500 focus:outline-none"
                        >
                          <option value="JNE Reguler">JNE Reguler</option>
                          <option value="J&T Express">J&T Express</option>
                          <option value="SiCepat Express">SiCepat Express</option>
                          <option value="GoSend / GrabExpress">GoSend / GrabExpress</option>
                          <option value="Anteraja">Anteraja</option>
                        </select>
                        <input
                          type="text"
                          value={trackingNumberInput}
                          onChange={(e) => setTrackingNumberInput(e.target.value)}
                          placeholder="Nomor Resi / AWB..."
                          className="rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 font-mono font-bold focus:border-brand-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSubmitShipping(order.id)}
                          className="rounded-xl bg-brand-600 hover:bg-brand-700 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                        >
                          Simpan & Kirim
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Collapsible Escrow Timeline */}
                  {isTimelineExpanded && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4 animate-in fade-in">
                      <EscrowTimeline
                        status={order.escrowStatus}
                        trackingNumber={order.trackingNumber}
                        courierName={order.courierName}
                      />
                    </div>
                  )}

                  {/* Card Action Footer Bar */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                      >
                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                        <span>Bukti Rekber</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedTimelineId(isTimelineExpanded ? null : order.id)}
                        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                      >
                        <span>Alur</span>
                        {isTimelineExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Seller Action: Input Resi */}
                      {isSeller && (order.escrowStatus === 'PAYMENT_CONFIRMED' || order.escrowStatus === 'SELLER_PACKING') && (
                        <button
                          type="button"
                          onClick={() => setShippingOrderId(order.id)}
                          className="flex items-center gap-1 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          <span>Input Resi</span>
                        </button>
                      )}

                      {/* Buyer Actions: Confirm release or dispute */}
                      {isBuyer && order.escrowStatus === 'DELIVERED_INSPECTION' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setDisputeOrderId(order.id);
                              setDisputeReasonInput('');
                            }}
                            className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700 transition-colors cursor-pointer"
                          >
                            Komplain
                          </button>
                          <button
                            type="button"
                            onClick={() => setReleaseOrderId(order.id)}
                            className="rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                          >
                            Konfirmasi Cair
                          </button>
                        </>
                      )}

                      {order.listing?.slug && (
                        <Link
                          href={`/listing/${order.listing.slug}`}
                          className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors"
                        >
                          <span>Iklan</span>
                          <ExternalLink className="h-3 w-3 text-slate-400" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* E-Invoice / Bukti Rekber Modal */}
        {selectedInvoiceOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-600 text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Bukti Transaksi Rekber Bekasin</h3>
                    <p className="text-[10px] text-slate-400">Nomor Transaksi Resmi Terverifikasi</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nomor Pesanan:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedInvoiceOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Status Rekber:</span>
                  <EscrowStatusBadge status={selectedInvoiceOrder.escrowStatus} size="sm" />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nama Pembeli:</span>
                  <span className="font-bold text-slate-900">{selectedInvoiceOrder.recipientName || user.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nama Penjual:</span>
                  <span className="font-bold text-slate-900">{selectedInvoiceOrder.seller?.name || 'Penjual'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Harga Barang:</span>
                  <span className="font-bold text-slate-900">{formatIDR(selectedInvoiceOrder.amount)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Biaya Proteksi Rekber (1%):</span>
                  <span className="font-bold text-slate-900">{formatIDR(selectedInvoiceOrder.serviceFee)}</span>
                </div>
                <div className="flex justify-between items-center py-1 pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                  <span>Total Dana Ditahan:</span>
                  <span className="text-brand-700">{formatIDR(selectedInvoiceOrder.totalAmount)}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-brand-50/80 p-3.5 border border-brand-200 text-[11px] text-brand-900 leading-relaxed font-medium">
                🛡️ <strong>Jaminan Rekber:</strong> Dana transaksi berada dalam rekening perantara resmi Bekasin dan baru akan dicairkan ke penjual setelah barang diterima dan melewati masa inspeksi fisik 48 jam.
              </div>

              <button
                type="button"
                onClick={() => setSelectedInvoiceOrder(null)}
                className="w-full rounded-full bg-slate-900 hover:bg-slate-800 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Tutup Bukti Transaksi
              </button>
            </div>
          </div>
        )}

        {/* Custom Confirmation Modal for Releasing Funds to Seller */}
        {releaseOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900">Konfirmasi Pelepasan Dana</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Apakah barang yang Anda terima sudah diperiksa dan sesuai dengan deskripsi iklan? Dana akan langsung diteruskan ke saldo rekening penjual.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmittingRelease}
                  onClick={() => setReleaseOrderId(null)}
                  className="flex-1 rounded-full border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSubmittingRelease}
                  onClick={confirmReleaseFunds}
                  className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingRelease ? 'Memproses...' : 'Ya, Cairkan Dana'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Dispute / Komplain Modal Dialog */}
        {disputeOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Pengajuan Komplain Garansi 48 Jam</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDisputeOrderId(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Dana transaksi Anda akan <strong>otomatis dibekukan sementara</strong>. Tim Mediasi Bekasin akan menghubungi Anda dan penjual untuk verifikasi bukti kendala.
              </p>

              <form onSubmit={confirmSubmitDispute} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detail Alasan Komplain / Kerusakan / Ketidaksesuaian:
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={disputeReasonInput}
                    onChange={(e) => setDisputeReasonInput(e.target.value)}
                    placeholder="Contoh: Layar HP bergaris tidak sesuai deskripsi mulus, kelengkapan charger tidak ada..."
                    className="w-full rounded-2xl border border-slate-200 p-3 text-xs focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none font-medium"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSubmittingDispute}
                    onClick={() => setDisputeOrderId(null)}
                    className="flex-1 rounded-full border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDispute}
                    className="flex-1 rounded-full bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/25 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingDispute ? 'Mengirim...' : 'Kirim Komplain'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 py-12 text-center text-xs text-slate-400">Memuat riwayat transaksi...</div>}>
      <OrderHistoryContent />
    </Suspense>
  );
}
