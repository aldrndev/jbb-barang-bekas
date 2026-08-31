'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  ArrowRight
} from 'lucide-react';

export default function NegoDashboardPage() {
  const { user, openAuthModal } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'orders'>('received');
  const [counterPriceInput, setCounterPriceInput] = useState<number>(0);
  const [selectedOfferForCounter, setSelectedOfferForCounter] = useState<string | null>(null);
  const [shippingTrackingInput, setShippingTrackingInput] = useState('');
  const [courierNameInput, setCourierNameInput] = useState('JNE Reguler');
  const [selectedOrderForShip, setSelectedOrderForShip] = useState<string | null>(null);

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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
          <MessageSquareQuote className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Masuk untuk Mengakses Dashboard</h2>
        <p className="text-xs text-slate-500 mt-1">
          Pantau tawaran masuk, penawaran Anda ke penjual, dan status transaksi rekening bersama.
        </p>
        <button
          onClick={openAuthModal}
          className="mt-6 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          Masuk / Daftar Akun
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Pusat Nego & Transaksi Rekber
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola penawaran harga dan lacak aliran dana rekening bersama secara transparan.
          </p>
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
            <MessageSquareQuote className="h-4 w-4 text-emerald-600" />
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

        {/* Tab 1: Tawaran Masuk */}
        {activeTab === 'received' && (
          <div className="space-y-4">
            {receivedOffers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                <MessageSquareQuote className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Belum Ada Tawaran Masuk</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tawaran harga dari calon pembeli akan muncul di sini.
                </p>
              </div>
            ) : (
              receivedOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Tawaran dari {offer.buyer?.name}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {offer.listing?.title}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Harga Asli: {formatIDR(offer.listing?.price || 0)} &bull; Ditawar:{' '}
                        <strong className="text-emerald-700 text-sm">{formatIDR(offer.offeredPrice)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-xl px-2.5 py-1 text-xs font-bold ${
                          offer.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : offer.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {offer.status}
                      </span>
                    </div>
                  </div>

                  {offer.message && (
                    <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 italic">
                      "{offer.message}"
                    </div>
                  )}

                  {/* Actions for Pending Offer */}
                  {offer.status === 'PENDING' && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleRespond(offer.id, 'ACCEPT')}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
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
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Tawar Balik</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRespond(offer.id, 'REJECT')}
                        className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
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
                        placeholder="Harga Tawar Balik (Rp)"
                        value={counterPriceInput}
                        onChange={(e) => setCounterPriceInput(Number(e.target.value))}
                        className="w-full sm:w-64 rounded-xl border border-slate-200 p-2 text-xs font-bold bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRespond(offer.id, 'COUNTER', counterPriceInput)}
                        className="w-full sm:w-auto rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
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

        {/* Tab 2: Tawaran Keluar */}
        {activeTab === 'sent' && (
          <div className="space-y-4">
            {sentOffers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                <MessageSquareQuote className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Belum Ada Tawaran yang Diajukan</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mulai eksplor barang bekas dan ajukan tawaran nego hemat.
                </p>
                <Link
                  href="/cari"
                  className="inline-flex items-center gap-1 mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
                >
                  <span>Cari Barang</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              sentOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {offer.listing?.title}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Harga Asli: {formatIDR(offer.listing?.price || 0)} &bull; Tawaran Anda:{' '}
                        <strong className="text-emerald-700">{formatIDR(offer.offeredPrice)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-xl px-2.5 py-1 text-xs font-bold ${
                          offer.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : offer.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
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
                    <div className="mt-4 rounded-2xl bg-emerald-50 p-4 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-emerald-900">
                          Selamat! Penjual menyetujui tawaran Anda seharga {formatIDR(offer.offeredPrice)}.
                        </div>
                        <div className="text-[11px] text-emerald-700">
                          Harga terkunci untuk Anda. Segera lakukan pembayaran rekber sebelum masa berlaku habis.
                        </div>
                      </div>

                      <Link
                        href={`/listing/${offer.listing?.slug || offer.listingId}`}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>Beli Sekarang ({formatIDR(offer.offeredPrice)})</span>
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
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                <ShieldCheck className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Belum Ada Transaksi Rekber</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Transaksi aman yang Anda buat akan tercatat di sini.
                </p>
              </div>
            ) : (
              orders.map((order) => {
                const isBuyer = order.buyerId === user.id;
                const isSeller = order.sellerId === user.id;

                return (
                  <div
                    key={order.id}
                    className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                          No. Pesanan: {order.orderNumber}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">
                          {order.listing?.title}
                        </h3>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Total Nilai: <strong className="text-slate-900">{formatIDR(order.totalAmount)}</strong> &bull; Peran Anda:{' '}
                          <span className="font-bold text-emerald-700">{isBuyer ? 'Pembeli' : 'Penjual'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {order.deliveryMethod === 'COD_KETEMUAN' ? 'COD Ketemuan' : 'Kurir Reguler'}
                        </span>
                      </div>
                    </div>

                    {/* Escrow Progress Stepper */}
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <EscrowTimeline
                        status={order.escrowStatus}
                        trackingNumber={order.trackingNumber}
                        courierName={order.courierName}
                      />
                    </div>

                    {/* Seller Action: Input Resi */}
                    {isSeller && order.escrowStatus === 'PAYMENT_CONFIRMED' && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
                        <div className="text-xs font-bold text-emerald-950">
                          Dana pembeli sudah masuk di Rekber. Silakan kirim barang & input nomor resi:
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Nama Ekspedisi (JNE / J&T / SiCepat)"
                            value={courierNameInput}
                            onChange={(e) => setCourierNameInput(e.target.value)}
                            className="rounded-xl border border-slate-200 p-2 text-xs bg-white flex-1"
                          />
                          <input
                            type="text"
                            placeholder="Nomor Resi Pengiriman"
                            value={shippingTrackingInput}
                            onChange={(e) => setShippingTrackingInput(e.target.value)}
                            className="rounded-xl border border-slate-200 p-2 text-xs bg-white flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleShipOrder(order.id)}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                          >
                            Update Resi
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Buyer Action: Confirm Receipt */}
                    {isBuyer && order.escrowStatus === 'IN_TRANSIT' && (
                      <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-teal-950">
                            Barang sudah sampai & sesuai deskripsi?
                          </div>
                          <div className="text-[11px] text-teal-700">
                            Konfirmasi penerimaan untuk meneruskan dana ke penjual.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCompleteOrder(order.id)}
                          className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Konfirmasi Terima & Lepas Dana</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
