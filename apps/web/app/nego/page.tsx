'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useAuth } from '../../context/auth-context';
import { formatIDR, formatTimeAgo } from '../../lib/utils';
import { EscrowTimeline } from '../../components/marketplace/escrow-timeline';
import {
  MessageSquareQuote,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  ShoppingBag,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  UserCheck
} from 'lucide-react';

function NegoDashboardContent() {
  const { user, openAuthModal, loginAsDemoBuyer, loginAsDemoSeller } = useAuth();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab') as 'received' | 'sent' | 'orders' | null;

  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'orders'>('received');
  const [counterPriceInput, setCounterPriceInput] = useState<number>(0);
  const [selectedOfferForCounter, setSelectedOfferForCounter] = useState<string | null>(null);
  const [shippingTrackingInput, setShippingTrackingInput] = useState('');
  const [courierNameInput, setCourierNameInput] = useState('JNE Reguler');
  const [selectedOrderForShip, setSelectedOrderForShip] = useState<string | null>(null);

  useEffect(() => {
    if (queryTab && ['received', 'sent', 'orders'].includes(queryTab)) {
      setActiveTab(queryTab);
    } else if (user?.role === 'BUYER') {
      setActiveTab('sent');
    } else if (user?.role === 'SELLER') {
      setActiveTab('received');
    }
  }, [queryTab, user?.role]);

  // Queries
  const { data: receivedOffersData, refetch: refetchReceived } = useQuery({
    queryKey: ['offers', 'received'],
    queryFn: () => api.getReceivedOffers(),
    enabled: !!user
  });

  const { data: sentOffersData, refetch: refetchSent } = useQuery({
    queryKey: ['offers', 'sent'],
    queryFn: () => api.getSentOffers(),
    enabled: !!user
  });

  const { data: ordersData, refetch: refetchOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getOrders(),
    enabled: !!user
  });

  const receivedOffers = receivedOffersData?.data || [];
  const sentOffers = sentOffersData?.data || [];
  const orders = ordersData?.data || [];

  const handleRespond = async (offerId: string, action: 'ACCEPT' | 'REJECT' | 'COUNTER', counterPrice?: number) => {
    const res = await api.respondOffer(offerId, action, counterPrice);
    if (res.success) {
      refetchReceived();
      refetchSent();
      setSelectedOfferForCounter(null);
    }
  };

  const handleShipOrder = async (orderId: string) => {
    if (!shippingTrackingInput.trim()) return;
    const res = await api.updateShipping(orderId, courierNameInput, shippingTrackingInput.trim());
    if (res.success) {
      refetchOrders();
      setSelectedOrderForShip(null);
      setShippingTrackingInput('');
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    const res = await api.completeOrder(orderId);
    if (res.success) {
      refetchOrders();
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-4 border border-brand-200">
          <MessageSquareQuote className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Masuk untuk Mengakses Dashboard</h2>
        <p className="text-xs text-slate-500 mt-1">
          Pantau tawaran masuk, penawaran Anda ke penjual, dan status transaksi rekening bersama.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={loginAsDemoBuyer}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-xs font-bold text-white hover:bg-brand-700 transition-colors shadow-md shadow-brand-600/20 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Masuk Cepat Demo (Pembeli: Dimas)</span>
          </button>
          <button
            type="button"
            onClick={loginAsDemoSeller}
            className="w-full flex items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span>Masuk Demo (Penjual: Budi)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="mx-auto max-w-5xl">
        {/* Header & Quick Role Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Pusat Nego & Transaksi Rekber
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola penawaran harga dan lacak aliran dana rekening bersama secara transparan.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-white p-2 border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 px-2 text-xs">
              <span className="text-slate-500">Akun:</span>
              <strong className="text-slate-900 font-bold">{user.name}</strong>
              <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 border border-brand-200">
                {user.role}
              </span>
            </div>
            <button
              type="button"
              onClick={user.role === 'BUYER' ? loginAsDemoSeller : loginAsDemoBuyer}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Ganti ke {user.role === 'BUYER' ? 'Penjual (Budi)' : 'Pembeli (Dimas)'}
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-slate-200/70 p-1 mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('received')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 transition-all cursor-pointer ${
              activeTab === 'received'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquareQuote className="h-4 w-4 text-brand-600" />
            <span>Tawaran Masuk ({receivedOffers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sent')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 transition-all cursor-pointer ${
              activeTab === 'sent'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-4 w-4 text-blue-600" />
            <span>Tawaran Keluar ({sentOffers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            <span>Pesanan Rekber ({orders.length})</span>
          </button>
        </div>

        {/* Tab 1: Tawaran Masuk (Untuk Penjual) */}
        {activeTab === 'received' && (
          <div className="space-y-4">
            {receivedOffers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-xs">
                <MessageSquareQuote className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Belum Ada Tawaran Masuk</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tawaran harga dari calon pembeli atas barang dagangan Anda akan muncul di sini.
                </p>
              </div>
            ) : (
              receivedOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                        Tawaran dari {offer.buyer?.name}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {offer.listing?.title}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Harga Pasang: {formatIDR(offer.listing?.price || 0)} &bull; Ditawar:{' '}
                        <strong className="text-brand-700 text-sm font-black">{formatIDR(offer.offeredPrice)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold border ${
                          offer.status === 'ACCEPTED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : offer.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        {offer.status === 'ACCEPTED'
                          ? '✓ Disetujui'
                          : offer.status === 'REJECTED'
                          ? '✗ Ditolak'
                          : 'Menunggu Respon'}
                      </span>
                    </div>
                  </div>

                  {offer.message && (
                    <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 italic border border-slate-100">
                      "{offer.message}"
                    </div>
                  )}

                  {/* Actions for Pending Offer */}
                  {offer.status === 'PENDING' && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleRespond(offer.id, 'ACCEPT')}
                        className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 cursor-pointer shadow-md shadow-brand-600/20"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Terima Tawaran</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOfferForCounter(
                            selectedOfferForCounter === offer.id ? null : offer.id
                          );
                          setCounterPriceInput(
                            Math.round(((offer.listing?.price || 0) + offer.offeredPrice) / 2)
                          );
                        }}
                        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-brand-600" />
                        <span>Tawar Balik</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRespond(offer.id, 'REJECT')}
                        className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Tolak</span>
                      </button>
                    </div>
                  )}

                  {/* Counter Price Form */}
                  {selectedOfferForCounter === offer.id && (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="number"
                        min="1000"
                        step="any"
                        placeholder="Harga Tawar Balik (Rp)"
                        value={counterPriceInput}
                        onChange={(e) => setCounterPriceInput(Number(e.target.value))}
                        className="w-full sm:w-64 rounded-xl border border-slate-200 p-2 text-xs font-bold bg-white focus:border-brand-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRespond(offer.id, 'COUNTER', counterPriceInput)}
                        className="w-full sm:w-auto rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
                      >
                        Kirim Tawaran Balik
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Tawaran Keluar (Untuk Pembeli) */}
        {activeTab === 'sent' && (
          <div className="space-y-4">
            {sentOffers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-xs">
                <MessageSquareQuote className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Belum Ada Tawaran yang Diajukan</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mulai eksplor barang bekas dan ajukan tawaran nego hemat.
                </p>
                <Link
                  href="/cari"
                  className="inline-flex items-center gap-1 mt-4 rounded-full bg-brand-600 px-4.5 py-2 text-xs font-bold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700"
                >
                  <span>Cari Barang Sekarang</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              sentOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {offer.listing?.title}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Harga Asli: {formatIDR(offer.listing?.price || 0)} &bull; Tawaran Anda:{' '}
                        <strong className="text-brand-700 font-bold">{formatIDR(offer.offeredPrice)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold border ${
                          offer.status === 'ACCEPTED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : offer.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        {offer.status === 'ACCEPTED'
                          ? '✓ Disetujui Penjual'
                          : offer.status === 'REJECTED'
                          ? '✗ Ditolak'
                          : 'Menunggu Respon'}
                      </span>
                    </div>
                  </div>

                  {offer.status === 'ACCEPTED' && (
                    <div className="mt-4 rounded-2xl bg-brand-50/80 p-4 border border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-brand-950">
                          Selamat! Penjual menyetujui tawaran Anda seharga {formatIDR(offer.offeredPrice)}.
                        </div>
                        <div className="text-[11px] text-brand-800">
                          Harga terkunci untuk Anda. Segera lakukan pembayaran rekber sebelum masa berlaku habis.
                        </div>
                      </div>

                      <Link
                        href={`/listing/${offer.listing?.slug || offer.listingId}?offerId=${offer.id}&checkout=true`}
                        className="flex items-center gap-2 rounded-full bg-brand-600 px-4.5 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-md shadow-brand-600/20"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>Beli Sekarang ({formatIDR(offer.counterPrice || offer.offeredPrice)})</span>
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Pesanan Rekber */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-xs">
                <ShieldCheck className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Belum Ada Transaksi Rekber</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Transaksi yang diamankan dengan Rekber JBB akan muncul di sini.
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400">
                        Pesanan: {order.orderNumber}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {order.listing?.title}
                      </h3>
                      <div className="text-xs text-slate-500">
                        Total Dana Ditahan: <strong className="text-brand-700">{formatIDR(order.totalAmount)}</strong>
                      </div>
                    </div>
                    <div>
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800 border border-brand-200">
                        {order.escrowStatus}
                      </span>
                    </div>
                  </div>

                  <EscrowTimeline
                    status={order.escrowStatus}
                    trackingNumber={order.trackingNumber}
                    courierName={order.courierName}
                  />

                  {/* Seller Action: Update Tracking */}
                  {user.id === order.sellerId && (order.escrowStatus === 'PAYMENT_CONFIRMED' || order.escrowStatus === 'SELLER_PACKING') && (
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900">
                        Input Resi Pengiriman Barang
                      </h4>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Nomor Resi / Bukti Kirim"
                          value={shippingTrackingInput}
                          onChange={(e) => setShippingTrackingInput(e.target.value)}
                          className="flex-1 rounded-xl border border-slate-200 p-2 text-xs bg-white focus:border-brand-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleShipOrder(order.id)}
                          className="rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 cursor-pointer shadow-md shadow-brand-600/20"
                        >
                          Konfirmasi Pengiriman
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Buyer Action: Complete & Release Escrow */}
                  {user.id === order.buyerId && order.escrowStatus === 'DELIVERED_INSPECTION' && (
                    <div className="rounded-2xl bg-brand-50 p-4 border border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-brand-950">
                          Barang Sudah Selesai Dicek?
                        </h4>
                        <p className="text-[11px] text-brand-800 mt-0.5">
                          Jika kondisi fisik dan fungsi sesuai deskripsi, klik untuk mencairkan dana ke penjual.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCompleteOrder(order.id)}
                        className="rounded-full bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 cursor-pointer"
                      >
                        Cairkan Dana ke Penjual
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NegoDashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Memuat dashboard nego...</div>}>
      <NegoDashboardContent />
    </Suspense>
  );
}
