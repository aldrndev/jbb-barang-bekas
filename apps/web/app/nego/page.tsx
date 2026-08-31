'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useAuth } from '../../context/auth-context';
import { formatIDR, formatTimeAgo } from '../../lib/utils';
import {
  MessageSquareQuote,
  ShieldCheck,
  Check,
  X,
  ShoppingBag,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  Inbox
} from 'lucide-react';

function NegoDashboardContent() {
  const { user, loginAsDemoBuyer, loginAsDemoSeller } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab') as 'received' | 'sent' | null;

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [counterPriceInput, setCounterPriceInput] = useState<number>(0);
  const [selectedOfferForCounter, setSelectedOfferForCounter] = useState<string | null>(null);

  useEffect(() => {
    if (queryTab && ['received', 'sent'].includes(queryTab)) {
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

  const receivedOffers = receivedOffersData?.data || [];
  const sentOffers = sentOffersData?.data || [];

  const handleRespond = async (offerId: string, action: 'ACCEPT' | 'REJECT' | 'COUNTER', counterPrice?: number) => {
    const res = await api.respondOffer(offerId, action, counterPrice);
    if (res.success) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['offers'] }),
        queryClient.invalidateQueries({ queryKey: ['my-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      ]);
      refetchReceived();
      refetchSent();
      setSelectedOfferForCounter(null);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-4 border border-brand-200">
          <MessageSquareQuote className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Masuk untuk Mengakses Pusat Nego</h2>
        <p className="text-xs text-slate-500 mt-1">
          Pantau tawaran masuk dari calon pembeli dan kelola penawaran harga Anda ke penjual.
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
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header & Quick Role Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Pusat Tawar & Nego Harga
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola tawaran resmi masuk dan keluar dengan kepastian harga terkunci 24 jam.
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

        {/* Shortcut Banner to Order History */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shrink-0">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Mencari Status Pesanan & Pembayaran Rekber?</h3>
              <p className="text-[11px] text-slate-500">Semua pesanan yang telah dibayar dapat dipantau di halaman Riwayat Pesanan.</p>
            </div>
          </div>
          <Link
            href="/orders"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors shrink-0"
          >
            <span>Buka Riwayat Pesanan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Tab switcher (Only 2 Tabs: Received vs Sent) */}
        <div className="flex rounded-2xl bg-slate-200/70 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('received')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 transition-all cursor-pointer ${
              activeTab === 'received'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="h-4 w-4 text-brand-600" />
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
            <Send className="h-4 w-4 text-blue-600" />
            <span>Tawaran Keluar ({sentOffers.length})</span>
          </button>
        </div>

        {/* Tab 1: Tawaran Masuk (Sebagai Penjual) */}
        {activeTab === 'received' && (
          <div className="space-y-4">
            {receivedOffers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-xs">
                <MessageSquareQuote className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Belum Ada Tawaran Masuk</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tawaran harga dari calon pembeli barang Anda akan muncul di sini.
                </p>
              </div>
            ) : (
              receivedOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
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
                    <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 italic border border-slate-200">
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
                        <Check className="h-4 w-4" />
                        <span>Terima Tawaran ({formatIDR(offer.offeredPrice)})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOfferForCounter(offer.id);
                          setCounterPriceInput(offer.offeredPrice);
                        }}
                        className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <span>Tawar Balik (Counter)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRespond(offer.id, 'REJECT')}
                        className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                        <span>Tolak</span>
                      </button>
                    </div>
                  )}

                  {/* Counter Price Form Inline */}
                  {selectedOfferForCounter === offer.id && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900">
                        Ajukan Harga Counter ke Pembeli
                      </h4>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={counterPriceInput}
                          onChange={(e) => setCounterPriceInput(Number(e.target.value))}
                          className="w-48 rounded-xl border border-slate-300 bg-white p-2 text-xs font-bold text-slate-900 focus:border-brand-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRespond(offer.id, 'COUNTER', counterPriceInput)}
                          className="rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 cursor-pointer"
                        >
                          Kirim Tawar Balik
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedOfferForCounter(null)}
                          className="text-xs text-slate-500 hover:text-slate-800"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Tawaran Terkirim (Sebagai Pembeli) */}
        {activeTab === 'sent' && (
          <div className="space-y-4">
            {sentOffers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-xs">
                <Clock className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Belum Ada Tawaran Terkirim</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tawaran harga yang Anda ajukan untuk barang-barang bekas yang bisa dinego akan muncul di sini.
                </p>
                <div className="mt-4">
                  <Link
                    href="/cari?isNego=true"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 transition-colors"
                  >
                    <span>Cari Barang yang Bisa Dinego</span>
                  </Link>
                </div>
              </div>
            ) : (
              sentOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
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
                        href={`/checkout?listingId=${offer.listing?.slug || offer.listingId}&offerId=${offer.id}`}
                        className="flex items-center gap-2 rounded-full bg-brand-600 px-4.5 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 cursor-pointer"
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
