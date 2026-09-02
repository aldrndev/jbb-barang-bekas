'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  Clock,
  ExternalLink,
  Inbox,
  Lock,
  MessageSquareQuote,
  Send,
  ShoppingBag,
  User,
  X,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';
import { ConditionBadge } from '../../components/marketplace/condition-badge';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { api } from '../../lib/api-client';
import { formatIDR, formatTimeAgo } from '../../lib/utils';

function NegoDashboardContent() {
  const { user, openAuthModal } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab') as 'received' | 'sent' | null;
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>(() => {
    if (queryTab && ['received', 'sent'].includes(queryTab)) return queryTab;
    return 'received';
  });
  const [counterPriceInput, setCounterPriceInput] = useState<number>(0);
  const [counterMessageInput, setCounterMessageInput] = useState('');
  const [selectedOfferForCounter, setSelectedOfferForCounter] = useState<string | null>(null);

  useEffect(() => {
    if (queryTab && ['received', 'sent'].includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

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

  const handleRespond = async (
    offerId: string,
    action: 'ACCEPT' | 'REJECT' | 'COUNTER',
    counterPrice?: number,
    counterMessage?: string
  ) => {
    const res = await api.respondOffer(offerId, action, counterPrice, counterMessage);
    if (res.success) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['offers'] }),
        queryClient.invalidateQueries({ queryKey: ['my-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      ]);
      const actionLabels = {
        ACCEPT: 'Tawaran Disetujui',
        REJECT: 'Tawaran Ditolak',
        COUNTER: 'Tawaran Balik Terkirim'
      };
      toast.success(actionLabels[action], 'Status negosiasi harga berhasil diperbarui.');
      refetchReceived();
      refetchSent();
      setSelectedOfferForCounter(null);
      setCounterMessageInput('');
    } else {
      toast.error('Gagal Merespons', res.error?.message || 'Terjadi kesalahan sistem.');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold">
            Disetujui
          </span>
        );
      case 'REJECTED':
        return (
          <span className="rounded-full bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold">
            Ditolak
          </span>
        );
      case 'COUNTERED':
        return (
          <span className="rounded-full bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold">
            Ditawar Balik
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold">
            Menunggu Respon
          </span>
        );
    }
  };

  if (!user) {
    return (
      <div className="bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xs space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 shadow-xs">
            <MessageSquareQuote className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Masuk ke Pusat Tawar & Nego
            </h2>
            <p className="text-xs text-slate-500">
              Pantau tawaran masuk dari calon pembeli dan kelola penawaran harga Anda ke penjual
              secara aman.
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

  return (
    <div className="bg-slate-50 py-3 sm:py-6 px-3.5 sm:px-6 lg:px-8 pb-6 sm:pb-8">
      <div className="mx-auto max-w-4xl space-y-3.5 sm:space-y-5">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            {
              label:
                activeTab === 'received' ? 'Tawaran Masuk (Penjual)' : 'Tawaran Keluar (Pembeli)'
            }
          ]}
        />

        {/* 1. Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs shrink-0">
              <MessageSquareQuote className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate">
                Pusat Tawar & Nego Harga
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                Kunci harga 24 jam dengan rekber resmi Peygo
              </p>
            </div>
          </div>

          {/* 2 Tabs: Tawaran Masuk vs Tawaran Keluar (Segmented Controller) */}
          <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-bold border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('received')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 sm:py-2.5 text-xs transition-all cursor-pointer ${
                activeTab === 'received'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Inbox className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Tawaran Masuk ({receivedOffers.length})</span>
              {receivedOffers.filter((o) => o.status === 'PENDING').length > 0 && (
                <span className="rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[9px] font-black">
                  {receivedOffers.filter((o) => o.status === 'PENDING').length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sent')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 sm:py-2.5 text-xs transition-all cursor-pointer ${
                activeTab === 'sent'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="h-3.5 w-3.5 text-brand-600 shrink-0" />
              <span>Tawaran Keluar ({sentOffers.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Tawaran Masuk (Sebagai Penjual) */}
        {activeTab === 'received' && (
          <div className="space-y-3 sm:space-y-4">
            {receivedOffers.length === 0 ? (
              <div className="text-center py-10 sm:py-14 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 px-4">
                <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 border border-slate-200">
                  <Inbox className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800">Belum Ada Tawaran Masuk</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                    Penawaran harga dari calon pembeli yang menawar iklan barang bekas Anda akan
                    otomatis tampil di sini.
                  </p>
                </div>
              </div>
            ) : (
              receivedOffers.map((offer) => {
                const listing = offer.listing;
                const originalPrice = listing?.price || offer.offeredPrice;
                const discountAmount = originalPrice - offer.offeredPrice;
                const discountPercent =
                  originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;
                const primaryImg =
                  listing?.images?.find((i: { url?: string; isPrimary?: boolean }) => i.isPrimary)
                    ?.url ||
                  listing?.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=250&auto=format&fit=crop&q=80';

                const isCountering = selectedOfferForCounter === offer.id;

                return (
                  <div
                    key={offer.id}
                    className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                  >
                    {/* Top Status & Expiry Bar */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 text-xs">
                          {offer.buyer?.avatarUrl ? (
                            <img
                              src={offer.buyer.avatarUrl}
                              alt={offer.buyer.name}
                              className="h-4 w-4 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-3 w-3 text-slate-400" />
                          )}
                          <span className="font-bold text-slate-900 text-[11px] truncate max-w-28 sm:max-w-none">
                            {offer.buyer?.name || 'Calon Pembeli'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {formatTimeAgo(offer.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {offer.status === 'PENDING' && offer.expiresAt && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                            <Clock className="h-2.5 w-2.5 text-amber-600" />
                            <span>{getRemainingTime(offer.expiresAt)}</span>
                          </span>
                        )}
                        {getStatusBadge(offer.status)}
                      </div>
                    </div>

                    {/* Middle Row: Product Card Info & Price */}
                    <div className="flex items-start gap-3">
                      <img
                        src={primaryImg}
                        alt={listing?.title || 'Produk'}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {listing?.condition && (
                            <ConditionBadge condition={listing.condition} size="sm" />
                          )}
                          {listing?.isCodAvailable && (
                            <span className="rounded-full bg-amber-50 text-amber-950 text-[9px] font-bold px-2 py-0.5 border border-amber-300 flex items-center gap-0.5">
                              <Zap className="h-2.5 w-2.5 text-amber-600 fill-amber-400" />
                              <span>COD</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                          {listing?.title || 'Barang Bekas'}
                        </h3>

                        {/* Price Row: Original vs Offered */}
                        <div className="flex items-baseline gap-2 flex-wrap pt-0.5">
                          <span className="text-xs sm:text-sm font-black text-brand-700">
                            {formatIDR(offer.offeredPrice)}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatIDR(originalPrice)}
                          </span>
                          {discountAmount > 0 && (
                            <span className="rounded bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 text-[9px] font-extrabold">
                              -{discountPercent}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Chat Bubble for Buyer Note */}
                    {offer.message && (
                      <div className="rounded-2xl bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80 flex items-start gap-2 text-xs">
                        <MessageSquareQuote className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-slate-700 italic text-[11px] leading-relaxed">
                          "{offer.message}"
                        </p>
                      </div>
                    )}

                    {/* Inline Counter Offer Form */}
                    {isCountering && (
                      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-3.5 space-y-2.5 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                            <Send className="h-3 w-3 text-blue-600" />
                            <span>Ajukan Harga Tawar Balik</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setSelectedOfferForCounter(null)}
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                          >
                            Batal
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Nominal Counter (Rp):
                              </label>
                              <input
                                type="number"
                                value={counterPriceInput}
                                onChange={(e) => setCounterPriceInput(Number(e.target.value))}
                                className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Pesan (Opsional):
                              </label>
                              <input
                                type="text"
                                value={counterMessageInput}
                                onChange={(e) => setCounterMessageInput(e.target.value)}
                                placeholder="Contoh: Pasnya segini gan..."
                                className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Quick Percent Presets */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-500 font-medium">Preset:</span>
                            {[
                              {
                                label: 'Tengah',
                                price: Math.round((originalPrice + offer.offeredPrice) / 2)
                              },
                              { label: '-5%', price: Math.round(originalPrice * 0.95) },
                              { label: '-10%', price: Math.round(originalPrice * 0.9) }
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => setCounterPriceInput(preset.price)}
                                className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                              >
                                {preset.label} ({formatIDR(preset.price)})
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleRespond(
                                offer.id,
                                'COUNTER',
                                counterPriceInput,
                                counterMessageInput
                              )
                            }
                            className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer text-center"
                          >
                            Kirim Tawar Balik
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons Toolbar on Mobile/Desktop */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        {listing?.slug && (
                          <Link
                            href={`/listing/${listing.slug}`}
                            className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-brand-600"
                          >
                            <span>Lihat Iklan</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>

                      {offer.status === 'PENDING' && (
                        <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOfferForCounter(isCountering ? null : offer.id);
                              setCounterPriceInput(
                                Math.round((originalPrice + offer.offeredPrice) / 2)
                              );
                            }}
                            className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2 px-2.5 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs text-center"
                          >
                            <span>Tawar Balik</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRespond(offer.id, 'REJECT')}
                            className="flex items-center justify-center gap-1 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 py-2 px-2.5 text-[11px] font-bold text-rose-700 transition-colors cursor-pointer text-center"
                          >
                            <X className="h-3 w-3" />
                            <span>Tolak</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRespond(offer.id, 'ACCEPT')}
                            className="flex items-center justify-center gap-1 rounded-xl bg-brand-600 hover:bg-brand-700 py-2 px-3 text-[11px] font-bold text-white shadow-xs transition-all cursor-pointer text-center"
                          >
                            <Check className="h-3.5 w-3.5 stroke-3" />
                            <span>Terima</span>
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
          <div className="space-y-3 sm:space-y-4">
            {sentOffers.length === 0 ? (
              <div className="text-center py-10 sm:py-14 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 px-4">
                <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 border border-slate-200">
                  <Send className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800">Belum Ada Tawaran Terkirim</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                    Tawaran harga yang Anda ajukan untuk barang bekas idaman akan terpantau
                    statusnya di sini.
                  </p>
                </div>
                <div className="pt-1">
                  <Link
                    href="/cari?isNego=true"
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all"
                  >
                    <span>Cari Barang Bisa Nego</span>
                  </Link>
                </div>
              </div>
            ) : (
              sentOffers.map((offer) => {
                const listing = offer.listing;
                const originalPrice = listing?.price || offer.offeredPrice;
                const discountAmount = originalPrice - offer.offeredPrice;
                const discountPercent =
                  originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;
                const primaryImg =
                  listing?.images?.find((i: { url?: string; isPrimary?: boolean }) => i.isPrimary)
                    ?.url ||
                  listing?.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=250&auto=format&fit=crop&q=80';

                return (
                  <div
                    key={offer.id}
                    className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                  >
                    {/* Top Status & Time */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[11px] font-bold text-slate-700 truncate">
                          Penjual: <strong>{offer.seller?.name || 'Penjual'}</strong>
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {formatTimeAgo(offer.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {offer.status === 'PENDING' && offer.expiresAt && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                            <Clock className="h-2.5 w-2.5 text-amber-600" />
                            <span>{getRemainingTime(offer.expiresAt)}</span>
                          </span>
                        )}
                        {getStatusBadge(offer.status)}
                      </div>
                    </div>

                    {/* Middle Row: Product Info & Price */}
                    <div className="flex items-start gap-3">
                      <img
                        src={primaryImg}
                        alt={listing?.title || 'Produk'}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        {listing?.condition && (
                          <ConditionBadge condition={listing.condition} size="sm" />
                        )}
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                          {listing?.title || 'Barang Bekas'}
                        </h3>

                        <div className="flex items-baseline gap-2 flex-wrap pt-0.5">
                          <span className="text-xs sm:text-sm font-black text-brand-700">
                            {formatIDR(offer.offeredPrice)}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatIDR(originalPrice)}
                          </span>
                          {discountAmount > 0 && (
                            <span className="rounded bg-emerald-50 text-emerald-900 border border-emerald-200 px-1.5 py-0.2 text-[9px] font-extrabold">
                              Hemat {formatIDR(discountAmount)} (-{discountPercent}%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Chat Bubble for Buyer Note */}
                    {offer.message && (
                      <div className="rounded-2xl bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80 flex items-start gap-2 text-xs">
                        <MessageSquareQuote className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-slate-700 italic text-[11px]">"{offer.message}"</p>
                      </div>
                    )}

                    {/* Accepted State: CTA to Checkout */}
                    {offer.status === 'ACCEPTED' && (
                      <div className="rounded-2xl bg-emerald-50/90 p-3.5 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                        <div className="space-y-0.5 text-left w-full sm:w-auto">
                          <div className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Tawaran Disetujui ({formatIDR(offer.offeredPrice)})</span>
                          </div>
                          <p className="text-[10px] text-emerald-800">
                            Harga terkunci 24 jam. Segera selesaikan transaksi Rekber.
                          </p>
                        </div>

                        <Link
                          href={`/checkout?listingId=${offer.listing?.slug || offer.listingId}&offerId=${offer.id}`}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all shrink-0 cursor-pointer"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>Beli Sekarang</span>
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
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-400">Memuat dashboard nego...</div>
      }
    >
      <NegoDashboardContent />
    </Suspense>
  );
}
