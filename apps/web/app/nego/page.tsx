'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useAuth } from '../../context/auth-context';
import { formatIDR, formatTimeAgo } from '../../lib/utils';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';
import { ConditionBadge } from '../../components/marketplace/condition-badge';
import type { Offer } from '@jbb/types';
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
  Inbox,
  User,
  MapPin,
  ExternalLink,
  Tag,
  AlertCircle,
  Zap,
  BadgeCheck
} from 'lucide-react';

function NegoDashboardContent() {
  const { user, loginAsDemoBuyer, loginAsDemoSeller } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab') as 'received' | 'sent' | null;

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [counterPriceInput, setCounterPriceInput] = useState<number>(0);
  const [counterMessageInput, setCounterMessageInput] = useState('');
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

  const handleRespond = async (offerId: string, action: 'ACCEPT' | 'REJECT' | 'COUNTER', counterPrice?: number, counterMessage?: string) => {
    const res = await api.respondOffer(offerId, action, counterPrice, counterMessage);
    if (res.success) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['offers'] }),
        queryClient.invalidateQueries({ queryKey: ['my-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      ]);
      refetchReceived();
      refetchSent();
      setSelectedOfferForCounter(null);
      setCounterMessageInput('');
    } else {
      alert(res.error?.message || 'Gagal merespons tawaran');
    }
  };

  const getRemainingTime = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Kedaluwarsa';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}j ${mins}m`;
    return `${mins} menit`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 border border-brand-100 shadow-xs">
            <MessageSquareQuote className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">Masuk ke Pusat Tawar & Nego</h2>
            <p className="text-xs text-slate-500">
              Pantau tawaran masuk dari calon pembeli dan kelola penawaran harga Anda ke penjual secara aman.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={loginAsDemoBuyer}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 py-3 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Masuk Demo (Pembeli: Dimas)</span>
            </button>
            <button
              type="button"
              onClick={loginAsDemoSeller}
              className="w-full flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <Tag className="h-3.5 w-3.5 text-amber-600" />
              <span>Masuk Demo (Penjual: Budi)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: activeTab === 'received' ? 'Tawaran Masuk (Penjual)' : 'Tawaran Keluar (Pembeli)' }
          ]}
        />

        {/* Header & Quick Role Switcher Bar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
                <MessageSquareQuote className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Pusat Tawar & Nego Harga
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Kelola tawaran resmi masuk dan keluar dengan kepastian harga terkunci 24 jam.
                </p>
              </div>
            </div>

            {/* Quick Demo Switcher Pill */}
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-2 border border-slate-200 shrink-0">
              <div className="flex items-center gap-2 px-2 text-xs">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-slate-500" />
                )}
                <span className="text-slate-900 font-bold">{user.name.split(' ')[0]}</span>
                <span className={`rounded-md px-1.5 py-0.2 text-[10px] font-black border ${
                  user.role === 'SELLER' ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-brand-100 text-brand-900 border-brand-200'
                }`}>
                  {user.role}
                </span>
              </div>
              <button
                type="button"
                onClick={user.role === 'BUYER' ? loginAsDemoSeller : loginAsDemoBuyer}
                className="rounded-xl bg-white border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
              >
                Ganti ke {user.role === 'BUYER' ? 'Penjual (Budi)' : 'Pembeli (Dimas)'}
              </button>
            </div>
          </div>

          {/* Streamlined Link to Order History */}
          <div className="rounded-2xl bg-brand-50/60 p-3.5 border border-brand-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4.5 w-4.5 text-brand-700 shrink-0" />
              <p className="text-brand-950 font-medium">
                Tawaran yang telah disetujui akan <strong>mengunci harga selama 24 jam</strong> untuk proses pembayaran Rekber aman.
              </p>
            </div>
            <Link
              href="/orders"
              className="flex items-center gap-1 font-bold text-brand-800 hover:text-brand-900 hover:underline shrink-0"
            >
              <span>Lihat Riwayat Pesanan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* 2 Tabs: Tawaran Masuk vs Tawaran Keluar */}
          <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-bold border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('received')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all cursor-pointer ${
                activeTab === 'received'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Inbox className="h-4 w-4 text-amber-600" />
              <span>Tawaran Masuk ({receivedOffers.length})</span>
              {receivedOffers.filter((o) => o.status === 'PENDING').length > 0 && (
                <span className="rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[10px] font-black">
                  {receivedOffers.filter((o) => o.status === 'PENDING').length} Baru
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sent')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all cursor-pointer ${
                activeTab === 'sent'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="h-4 w-4 text-brand-600" />
              <span>Tawaran Keluar ({sentOffers.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Tawaran Masuk (Sebagai Penjual) */}
        {activeTab === 'received' && (
          <div className="space-y-4">
            {receivedOffers.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 border border-slate-200">
                  <Inbox className="h-8 w-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Belum Ada Tawaran Masuk</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Penawaran harga dari calon pembeli yang menawar iklan barang bekas Anda akan otomatis tampil di sini.
                </p>
              </div>
            ) : (
              receivedOffers.map((offer) => {
                const listing = offer.listing;
                const originalPrice = listing?.price || offer.offeredPrice;
                const discountAmount = originalPrice - offer.offeredPrice;
                const discountPercent = originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;
                const primaryImg =
                  listing?.images?.find((i: any) => i.isPrimary)?.url ||
                  listing?.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=250&auto=format&fit=crop&q=80';

                const isCountering = selectedOfferForCounter === offer.id;

                return (
                  <div
                    key={offer.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
                  >
                    {/* Top Status & 24h Countdown Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Buyer Profile Preview Badge */}
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
                          {offer.buyer?.avatarUrl ? (
                            <img src={offer.buyer.avatarUrl} alt={offer.buyer.name} className="h-4.5 w-4.5 rounded-full object-cover" />
                          ) : (
                            <User className="h-3.5 w-3.5 text-slate-400" />
                          )}
                          <span className="font-bold text-slate-900">{offer.buyer?.name || 'Calon Pembeli'}</span>
                          <span className="text-slate-300">&bull;</span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Trust {offer.buyer?.trustScore || 90}%
                          </span>
                          {offer.buyer?.city && (
                            <>
                              <span className="text-slate-300">&bull;</span>
                              <span className="text-[11px] text-slate-500">{offer.buyer.city}</span>
                            </>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400 font-medium">
                          {formatTimeAgo(offer.createdAt)}
                        </span>
                      </div>

                      {/* Expiry & Status Badges */}
                      <div className="flex items-center gap-2">
                        {offer.status === 'PENDING' && offer.expiresAt && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold">
                            <Clock className="h-3 w-3 text-amber-600" />
                            <span>Sisa {getRemainingTime(offer.expiresAt)}</span>
                          </span>
                        )}

                        <span
                          className={`rounded-full px-3 py-0.5 text-[11px] font-extrabold border ${
                            offer.status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : offer.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : offer.status === 'COUNTERED'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}
                        >
                          {offer.status === 'ACCEPTED'
                            ? '✓ Disetujui'
                            : offer.status === 'REJECTED'
                            ? '✕ Ditolak'
                            : offer.status === 'COUNTERED'
                            ? '⇄ Ditawar Balik'
                            : '⏳ Menunggu Respon'}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Product Thumbnail, Title, Price Delta */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Product Visual & Condition */}
                      <div className="flex items-start gap-4">
                        <img
                          src={primaryImg}
                          alt={listing?.title || 'Produk'}
                          className="h-20 w-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {listing?.condition && <ConditionBadge condition={listing.condition} size="sm" />}
                            {listing?.isCodAvailable && (
                              <span className="rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 border border-slate-200 flex items-center gap-1">
                                <Zap className="h-2.5 w-2.5 text-brand-600" />
                                <span>Siap COD</span>
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                            {listing?.title || 'Barang Bekas'}
                          </h3>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span>{listing?.city || 'Jakarta'}, {listing?.district || 'Indonesia'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Visual Price Comparison Delta Box */}
                      <div className="w-full sm:w-auto rounded-2xl bg-slate-50 p-3.5 border border-slate-200 text-left sm:text-right space-y-0.5">
                        <div className="flex sm:justify-end items-center gap-1.5 text-xs text-slate-400">
                          <span>Harga Iklan:</span>
                          <span className="line-through">{formatIDR(originalPrice)}</span>
                        </div>
                        <div className="flex sm:justify-end items-baseline gap-2">
                          <span className="text-xs font-bold text-slate-500">Ditawar:</span>
                          <span className="text-lg font-black text-brand-700">
                            {formatIDR(offer.offeredPrice)}
                          </span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex sm:justify-end">
                            <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.2 text-[10px] font-extrabold">
                              Hemat {formatIDR(discountAmount)} (-{discountPercent}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chat Speech Bubble for Buyer Message */}
                    {offer.message && (
                      <div className="rounded-2xl bg-brand-50/60 p-3.5 border border-brand-200/80 flex items-start gap-2.5 text-xs">
                        <MessageSquareQuote className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-brand-900 block">Pesan dari Pembeli:</span>
                          <p className="text-slate-800 italic leading-relaxed">
                            "{offer.message}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Inline Counter Offer Form */}
                    {isCountering && (
                      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Send className="h-3.5 w-3.5 text-blue-600" />
                            <span>Ajukan Harga Tawar Balik (Counter Offer)</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setSelectedOfferForCounter(null)}
                            className="text-xs text-slate-500 hover:text-slate-800"
                          >
                            Batal
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">Nominal Counter (Rp):</label>
                              <input
                                type="number"
                                value={counterPriceInput}
                                onChange={(e) => setCounterPriceInput(Number(e.target.value))}
                                className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">Pesan Tambahan (Opsional):</label>
                              <input
                                type="text"
                                value={counterMessageInput}
                                onChange={(e) => setCounterMessageInput(e.target.value)}
                                placeholder="Contoh: Pasnya segini gan, bonus case original..."
                                className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Quick Percent Presets */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] text-slate-500 font-medium">Preset Cepat:</span>
                            {[
                              { label: 'Pas di Tengah', price: Math.round((originalPrice + offer.offeredPrice) / 2) },
                              { label: '-5% dari Asli', price: Math.round(originalPrice * 0.95) },
                              { label: '-10% dari Asli', price: Math.round(originalPrice * 0.9) }
                            ].map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setCounterPriceInput(preset.price)}
                                className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                              >
                                {preset.label} ({formatIDR(preset.price)})
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleRespond(offer.id, 'COUNTER', counterPriceInput, counterMessageInput)}
                            className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                          >
                            Kirim Tawar Balik ke Pembeli
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons Toolbar for Pending Offers */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {listing?.slug && (
                          <Link
                            href={`/listing/${listing.slug}`}
                            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-brand-600 p-1"
                          >
                            <span>Buka Iklan</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>

                      {offer.status === 'PENDING' && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOfferForCounter(isCountering ? null : offer.id);
                              setCounterPriceInput(Math.round((originalPrice + offer.offeredPrice) / 2));
                            }}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                          >
                            <span>⇄ Tawar Balik (Counter)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRespond(offer.id, 'REJECT')}
                            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 text-xs font-bold text-rose-700 transition-colors cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Tolak</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRespond(offer.id, 'ACCEPT')}
                            className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
                          >
                            <Check className="h-4 w-4 stroke-3" />
                            <span>Terima Tawaran ({formatIDR(offer.offeredPrice)})</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Tawaran Terkirim (Sebagai Pembeli) */}
        {activeTab === 'sent' && (
          <div className="space-y-4">
            {sentOffers.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 border border-slate-200">
                  <Send className="h-8 w-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Belum Ada Tawaran Terkirim</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Tawaran harga yang Anda ajukan untuk barang-barang bekas idaman akan terpantau statusnya di sini.
                </p>
                <div className="pt-2">
                  <Link
                    href="/cari?isNego=true"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all"
                  >
                    <span>Cari Barang yang Bisa Dinego</span>
                  </Link>
                </div>
              </div>
            ) : (
              sentOffers.map((offer) => {
                const listing = offer.listing;
                const originalPrice = listing?.price || offer.offeredPrice;
                const discountAmount = originalPrice - offer.offeredPrice;
                const discountPercent = originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;
                const primaryImg =
                  listing?.images?.find((i: any) => i.isPrimary)?.url ||
                  listing?.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=250&auto=format&fit=crop&q=80';

                return (
                  <div
                    key={offer.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
                  >
                    {/* Top Status & Time Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">
                          Penjual: <strong>{offer.seller?.name || 'Penjual'}</strong>
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Diajukan {formatTimeAgo(offer.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {offer.status === 'PENDING' && offer.expiresAt && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold">
                            <Clock className="h-3 w-3 text-amber-600" />
                            <span>Sisa {getRemainingTime(offer.expiresAt)}</span>
                          </span>
                        )}

                        <span
                          className={`rounded-full px-3 py-0.5 text-[11px] font-extrabold border ${
                            offer.status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : offer.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : offer.status === 'COUNTERED'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}
                        >
                          {offer.status === 'ACCEPTED'
                            ? '✓ Disetujui Penjual'
                            : offer.status === 'REJECTED'
                            ? '✕ Ditolak'
                            : offer.status === 'COUNTERED'
                            ? '⇄ Penjual Tawar Balik'
                            : '⏳ Menunggu Respon'}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Product Info & Price Comparison */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={primaryImg}
                          alt={listing?.title || 'Produk'}
                          className="h-20 w-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="space-y-1">
                          {listing?.condition && <ConditionBadge condition={listing.condition} size="sm" />}
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                            {listing?.title || 'Barang Bekas'}
                          </h3>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span>{listing?.city || 'Indonesia'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto rounded-2xl bg-slate-50 p-3.5 border border-slate-200 text-left sm:text-right space-y-0.5">
                        <div className="flex sm:justify-end items-center gap-1.5 text-xs text-slate-400">
                          <span>Harga Asli:</span>
                          <span className="line-through">{formatIDR(originalPrice)}</span>
                        </div>
                        <div className="flex sm:justify-end items-baseline gap-2">
                          <span className="text-xs font-bold text-slate-500">Tawaran Anda:</span>
                          <span className="text-lg font-black text-brand-700">
                            {formatIDR(offer.offeredPrice)}
                          </span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex sm:justify-end">
                            <span className="rounded-full bg-emerald-100 text-brand-900 border border-brand-200 px-2 py-0.2 text-[10px] font-extrabold">
                              Hemat {formatIDR(discountAmount)} (-{discountPercent}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chat Bubble for Message */}
                    {offer.message && (
                      <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700 italic">
                        <MessageSquareQuote className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <p>"{offer.message}"</p>
                      </div>
                    )}

                    {/* Accepted State: CTA to Checkout */}
                    {offer.status === 'ACCEPTED' && (
                      <div className="rounded-2xl bg-emerald-50/80 p-4 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                            <Check className="h-4 w-4 text-emerald-600" />
                            <span>Selamat! Penjual menyetujui tawaran Anda seharga {formatIDR(offer.offeredPrice)}.</span>
                          </div>
                          <div className="text-[11px] text-emerald-800">
                            Harga telah terkunci khusus untuk akun Anda. Segera selesaikan pembayaran Rekber sebelum waktu habis.
                          </div>
                        </div>

                        <Link
                          href={`/checkout?listingId=${offer.listing?.slug || offer.listingId}&offerId=${offer.id}`}
                          className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all shrink-0 cursor-pointer"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          <span>Beli Sekarang ({formatIDR(offer.counterPrice || offer.offeredPrice)})</span>
                        </Link>
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

export default function NegoDashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Memuat dashboard nego...</div>}>
      <NegoDashboardContent />
    </Suspense>
  );
}
