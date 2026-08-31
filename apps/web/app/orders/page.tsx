'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useAuth } from '../../context/auth-context';
import { formatIDR } from '../../lib/utils';
import { ConditionBadge } from '../../components/marketplace/condition-badge';
import { EscrowStatusBadge } from '../../components/marketplace/escrow-status-badge';
import { EscrowTimeline } from '../../components/marketplace/escrow-timeline';
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
  Sparkles
} from 'lucide-react';

export default function OrderHistoryPage() {
  const { user, openAuthModal } = useAuth();
  const [orderMode, setOrderMode] = useState<'buyer' | 'seller'>('buyer');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [copiedResi, setCopiedResi] = useState<string | null>(null);
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);

  // Seller Resi input state
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [courierNameInput, setCourierNameInput] = useState('JNE Reguler');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

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

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 border border-brand-100">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">Masuk untuk Melihat Riwayat Pesanan</h2>
            <p className="text-xs text-slate-500">
              Pantau status penahanan dana Rekber, nomor resi pengiriman, dan pencairan saldo penjualan.
            </p>
          </div>
          <button
            type="button"
            onClick={openAuthModal}
            className="w-full rounded-full bg-brand-600 hover:bg-brand-700 py-3 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
          >
            Masuk / Daftar Akun
          </button>
        </div>
      </div>
    );
  }

  // Filter orders by mode (buyer purchases vs seller sales)
  const modeOrders = orders.filter((order) => {
    if (orderMode === 'buyer') {
      return order.buyerId === user.id;
    } else {
      return order.sellerId === user.id;
    }
  });

  // Filter orders by tab and search query
  const filteredOrders = modeOrders.filter((order) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchTitle = order.listing?.title?.toLowerCase().includes(q);
      if (!matchNumber && !matchTitle) return false;
    }

    // Tab status match
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
    navigator.clipboard.writeText(resi);
    setCopiedResi(resi);
    setTimeout(() => setCopiedResi(null), 2500);
  };

  const handleReleaseFunds = async (orderId: string) => {
    if (confirm('Konfirmasi bahwa barang telah Anda terima dan sesuai deskripsi? Dana akan diteruskan ke penjual.')) {
      const res = await api.completeOrder(orderId);
      if (res.success) {
        refetch();
      } else {
        alert(res.error?.message || 'Gagal melepaskan dana');
      }
    }
  };

  const handleDispute = async (orderId: string) => {
    const reason = prompt('Masukkan alasan komplain / retur garansi 48 jam:');
    if (reason && reason.trim()) {
      const res = await api.disputeOrder(orderId, reason.trim(), []);
      if (res.success) {
        alert('Komplain Anda telah terdaftar. Tim CS Rekber JBB akan menahan dana dan memediasi dengan penjual.');
        refetch();
      } else {
        alert(res.error?.message || 'Gagal mengajukan komplain');
      }
    }
  };

  const handleSubmitShipping = async (orderId: string) => {
    if (!trackingNumberInput.trim()) {
      alert('Masukkan nomor resi pengiriman');
      return;
    }
    const res = await api.updateShipping(orderId, courierNameInput, trackingNumberInput.trim());
    if (res.success) {
      alert('Resi pengiriman berhasil disimpan! Pembeli telah diberi tahu.');
      setShippingOrderId(null);
      setTrackingNumberInput('');
      refetch();
    } else {
      alert(res.error?.message || 'Gagal mengupdate resi');
    }
  };

  const buyerCount = orders.filter((o) => o.buyerId === user.id).length;
  const sellerCount = orders.filter((o) => o.sellerId === user.id).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Main Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 shadow-xs">
                {orderMode === 'buyer' ? <ShoppingBag className="h-6 w-6" /> : <Tag className="h-6 w-6" />}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {orderMode === 'buyer' ? 'Riwayat Pembelian Rekber' : 'Riwayat Penjualan Rekber'}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {orderMode === 'buyer'
                    ? 'Lacak barang yang Anda beli, nomor resi pengiriman, dan inspeksi fisik 48 jam'
                    : 'Kelola pesanan masuk dari pembeli, input resi kirim, dan pantau pencairan dana'}
                </p>
              </div>
            </div>

            {/* Buyer vs Seller Mode Switcher Pills */}
            <div className="flex items-center rounded-2xl bg-slate-100 p-1 border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setOrderMode('buyer');
                  setActiveTab('all');
                }}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  orderMode === 'buyer'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5 text-brand-600" />
                <span>Belanjaan Saya</span>
                {buyerCount > 0 && (
                  <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-black text-slate-700">
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
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  orderMode === 'seller'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tag className="h-3.5 w-3.5 text-amber-600" />
                <span>Penjualan Saya</span>
                {sellerCount > 0 && (
                  <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-black text-amber-800">
                    {sellerCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search bar & Quick Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={orderMode === 'buyer' ? 'Cari nomor pesanan / barang...' : 'Cari transaksi penjualan...'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-9 pr-3.5 py-2 text-xs text-slate-800 focus:border-brand-500 focus:outline-none focus:bg-white"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            {orderMode === 'seller' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href="/my-listings"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors"
                >
                  <Package className="h-3.5 w-3.5 text-slate-500" />
                  <span>Kelola Barang yang Dijual</span>
                </Link>
                <Link
                  href="/jual"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors"
                >
                  <span>+ Pasang Iklan</span>
                </Link>
              </div>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="border-t border-slate-200 pt-4 flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {[
              { id: 'all', label: 'Semua Status', count: modeOrders.length },
              { id: 'packing', label: orderMode === 'seller' ? 'Perlu Dikirim' : 'Sedang Dikemas', count: modeOrders.filter((o) => o.escrowStatus === 'PAYMENT_CONFIRMED' || o.escrowStatus === 'SELLER_PACKING').length },
              { id: 'shipped', label: 'Dalam Pengiriman', count: modeOrders.filter((o) => o.escrowStatus === 'IN_TRANSIT').length },
              { id: 'inspection', label: 'Masa Cek 48 Jam', count: modeOrders.filter((o) => o.escrowStatus === 'DELIVERED_INSPECTION').length },
              { id: 'completed', label: 'Selesai & Cair', count: modeOrders.filter((o) => o.escrowStatus === 'COMPLETED').length },
              { id: 'disputed', label: 'Komplain / Retur', count: modeOrders.filter((o) => o.escrowStatus === 'DISPUTED' || o.escrowStatus === 'CANCELLED').length }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && <span className="ml-1.5 opacity-70">({tab.count})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-white border border-slate-200 p-6 animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 border border-slate-200">
              {orderMode === 'buyer' ? <ShoppingBag className="h-10 w-10" /> : <Tag className="h-10 w-10" />}
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {orderMode === 'buyer' ? 'Belum Ada Transaksi Pembelian' : 'Belum Ada Transaksi Penjualan'}
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {orderMode === 'buyer'
                  ? 'Barang bekas berkualitas yang Anda beli lewat Rekber JBB akan otomatis terpantau di sini.'
                  : 'Pesanan barang Anda yang dibayar pembeli lewat Rekber JBB akan muncul di sini untuk Anda proses.'}
              </p>
            </div>
            <div className="pt-2">
              {orderMode === 'buyer' ? (
                <Link
                  href="/cari"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Cari Barang Idaman</span>
                </Link>
              ) : (
                <Link
                  href="/jual"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
                >
                  <Tag className="h-4 w-4" />
                  <span>Pasang Barang untuk Dijual</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
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
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 hover:border-slate-300 transition-colors"
                >
                  {/* Card Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-black text-slate-900 font-mono">
                        {order.orderNumber}
                      </span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {isBuyer
                          ? `Penjual: ${order.seller?.name || 'Penjual'}`
                          : `Pembeli: ${order.buyer?.name || order.recipientName || 'Pembeli'}`}
                      </span>
                    </div>

                    {/* Clean Human-Readable Status Badge */}
                    <div>
                      <EscrowStatusBadge status={order.escrowStatus} size="md" />
                    </div>
                  </div>

                  {/* Card Body: Product Info & Price */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={primaryImg}
                        alt={order.listing?.title || 'Produk'}
                        className="h-20 w-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <ConditionBadge condition={order.listing?.condition || 'LIKE_NEW'} size="sm" />
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                          {order.listing?.title || 'Barang Bekas'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Metode:{' '}
                          <strong className="text-slate-800">
                            {order.deliveryMethod === 'COD_KETEMUAN' ? 'COD Ketemuan Langsung' : 'Kurir Kilat'}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right w-full sm:w-auto p-3 sm:p-0 rounded-2xl bg-slate-50 sm:bg-transparent border sm:border-0 border-slate-200">
                      <span className="text-[11px] text-slate-400 font-medium block">
                        {isSeller ? 'Total Saldo yang Akan Diterima' : 'Total Pembayaran Rekber'}
                      </span>
                      <span className="text-base sm:text-lg font-black text-brand-700">
                        {formatIDR(isSeller ? order.amount : order.totalAmount)}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {isSeller ? '(Dana cair setelah 48 jam)' : '(Termasuk proteksi garansi 1%)'}
                      </span>
                    </div>
                  </div>

                  {/* Delivery & Tracking Info */}
                  {order.deliveryMethod === 'KURIR_REGULER' && order.trackingNumber ? (
                    <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-brand-600 shrink-0" />
                        <span className="text-slate-600">
                          Kurir: <strong className="text-slate-900">{order.courierName || 'JNE / J&T'}</strong> &bull; Resi:
                        </span>
                        <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono font-bold text-slate-900">
                          {order.trackingNumber}
                        </code>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyResi(order.trackingNumber!)}
                        className="flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:text-brand-800 cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{copiedResi === order.trackingNumber ? 'Tersalin!' : 'Salin Resi'}</span>
                      </button>
                    </div>
                  ) : order.deliveryMethod === 'COD_KETEMUAN' ? (
                    <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
                      <span>
                        Titik Temu COD: <strong className="text-slate-900">{order.shippingAddress || 'Sesuai kesepakatan chat'}</strong>
                      </span>
                    </div>
                  ) : null}

                  {/* Seller Action: Inline Resi Input Form */}
                  {isSeller && shippingOrderId === order.id && (
                    <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Truck className="h-4 w-4 text-brand-600" />
                          <span>Input Nomor Resi Pengiriman Barang</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShippingOrderId(null)}
                          className="text-xs text-slate-500 hover:text-slate-800"
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
                          Simpan & Kirimkan
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Collapsible Escrow Timeline */}
                  {isTimelineExpanded && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 animate-in fade-in">
                      <EscrowTimeline
                        status={order.escrowStatus}
                        trackingNumber={order.trackingNumber}
                        courierName={order.courierName}
                      />
                    </div>
                  )}

                  {/* Card Action Buttons */}
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                        <span>Bukti Rekber</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedTimelineId(isTimelineExpanded ? null : order.id)}
                        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        <span>Lacak Alur</span>
                        {isTimelineExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Seller Action: Input Resi */}
                      {isSeller && (order.escrowStatus === 'PAYMENT_CONFIRMED' || order.escrowStatus === 'SELLER_PACKING') && (
                        <button
                          type="button"
                          onClick={() => setShippingOrderId(order.id)}
                          className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          <span>Input Resi Pengiriman</span>
                        </button>
                      )}

                      {/* Buyer Actions: Confirm release or dispute */}
                      {isBuyer && order.escrowStatus === 'DELIVERED_INSPECTION' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDispute(order.id)}
                            className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3.5 py-1.5 text-xs font-bold text-rose-700 transition-colors cursor-pointer"
                          >
                            Ajukan Komplain 48 Jam
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReleaseFunds(order.id)}
                            className="rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                          >
                            Konfirmasi & Lepas Dana
                          </button>
                        </>
                      )}

                      {order.listing?.slug && (
                        <Link
                          href={`/listing/${order.listing.slug}`}
                          className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors"
                        >
                          <span>Buka Iklan</span>
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
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-600 text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Bukti Transaksi Rekber JBB</h3>
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

              <div className="space-y-3 text-xs">
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

              <div className="rounded-2xl bg-brand-50/80 p-3.5 border border-brand-200 text-[11px] text-brand-900 leading-relaxed">
                🛡️ <strong>Jaminan Rekber:</strong> Dana transaksi berada dalam rekening perantara resmi JBB dan baru akan dicairkan ke penjual setelah barang diterima dan melewati masa inspeksi fisik 48 jam.
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
      </div>
    </div>
  );
}
