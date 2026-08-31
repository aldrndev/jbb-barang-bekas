'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { formatIDR, formatTimeAgo } from '../../../lib/utils';
import { ConditionBadge } from '../../../components/marketplace/condition-badge';
import { MakeOfferModal } from '../../../components/marketplace/make-offer-modal';
import {
  ShieldCheck,
  MapPin,
  Star,
  Zap,
  CheckCircle2,
  Calendar,
  Sparkles,
  MessageSquareQuote,
  ShoppingBag,
  Share2,
  AlertCircle,
  Truck,
  ArrowLeft,
  Heart,
  Maximize2,
  X,
  Lock,
  MessageCircle,
  Clock,
  Eye,
  Flame,
  BadgeCheck,
  ChevronRight,
  ChevronLeft,
  Tag
} from 'lucide-react';
import { useAuth } from '../../../context/auth-context';

function ListingDetailContent({ idOrSlug }: { idOrSlug: string }) {
  const { user, openAuthModal } = useAuth();
  const searchParams = useSearchParams();
  const queryOfferId = searchParams.get('offerId');
  const queryCheckout = searchParams.get('checkout');

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isNegoModalOpen, setIsNegoModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCountOffset, setFavoriteCountOffset] = useState(0);
  const [shareToast, setShareToast] = useState(false);

  const { data: listingData, isLoading, refetch } = useQuery({
    queryKey: ['listing', idOrSlug],
    queryFn: () => api.getListingDetail(idOrSlug)
  });

  const { data: sentOffersData } = useQuery({
    queryKey: ['offers', 'sent'],
    queryFn: () => api.getSentOffers(),
    enabled: !!user
  });

  const listing = listingData?.data;
  const sentOffers = sentOffersData?.data || [];

  // Detect if current buyer has an accepted offer for this listing
  const acceptedOffer = sentOffers.find(
    (o) =>
      (o.id === queryOfferId || (listing && o.listingId === listing.id)) &&
      (o.status === 'ACCEPTED' || o.id === queryOfferId)
  );

  const effectivePrice = acceptedOffer
    ? acceptedOffer.counterPrice || acceptedOffer.offeredPrice
    : listing?.price || 0;

  const checkoutUrl = listing
    ? `/checkout?listingId=${listing.slug || listing.id}${acceptedOffer ? `&offerId=${acceptedOffer.id}` : ''}`
    : '#';

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-110 bg-slate-200/80 rounded-3xl border border-slate-200" />
          <div className="lg:col-span-5 h-110 bg-slate-200/80 rounded-3xl border border-slate-200" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 shadow-sm border border-rose-200">
          <AlertCircle className="h-9 w-9" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Barang Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mt-1">
          Barang bekas ini mungkin telah dihapus oleh pemiliknya atau sudah terjual.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-6 rounded-full bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const images = listing.images || [];
  const primaryImageUrl = images[activeImageIdx]?.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
  const completenessList = Array.isArray(listing.completeness) ? listing.completeness : [];
  const specs = listing.specs || {};

  const savingsPercent = listing.originalPrice
    ? Math.round(((listing.originalPrice - effectivePrice) / listing.originalPrice) * 100)
    : 0;

  const toggleFavorite = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsFavorited(!isFavorited);
    setFavoriteCountOffset(isFavorited ? 0 : 1);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: listing.title,
          text: `Cek barang bekas berkualitas: ${listing.title} seharga ${formatIDR(effectivePrice)} di Rekber JBB`,
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8 pb-28 md:pb-12">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb & Quick Actions */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-brand-600 transition-colors font-medium">Beranda</Link>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <Link href={`/cari?category=${listing.category?.slug}`} className="hover:text-brand-600 transition-colors font-medium">
              {listing.category?.name || 'Katalog'}
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="text-slate-800 font-bold truncate max-w-xs sm:max-w-md">{listing.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Bagikan</span>
            </button>
            <button
              onClick={toggleFavorite}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                isFavorited
                  ? 'border-rose-300 bg-rose-50 text-rose-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="font-bold">{listing.favoriteCount + favoriteCountOffset}</span>
            </button>
          </div>
        </div>

        {/* Share Toast Notification */}
        {shareToast && (
          <div className="fixed top-20 right-6 z-50 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-top-3">
            ✅ Link produk berhasil disalin ke clipboard!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Gallery, Condition Matrix, Description */}
          <div className="lg:col-span-7 space-y-6">
            {/* Unified Product Image Gallery Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-3">
              {/* Top Header Bar: Badges & Fullscreen Button */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <ConditionBadge condition={listing.condition} size="md" />
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                    📷 {activeImageIdx + 1} / {images.length || 1}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Perbesar Layar Penuh"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>Perbesar</span>
                </button>
              </div>

              {/* Main Stage Image Frame (Clean Canvas, No Gray Background) */}
              <div
                className="relative aspect-4/3 sm:aspect-16/11 w-full overflow-hidden rounded-2xl flex items-center justify-center p-2 group cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
              >
                <img
                  src={primaryImageUrl}
                  alt={listing.title}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-102"
                />
              </div>

              {/* Integrated Bottom Thumbnails Strip with Divider */}
              {images.length > 1 && (
                <>
                  <div className="border-t border-slate-100 my-1" />
                  <div className="flex items-center gap-3 overflow-x-auto py-2 px-1 hide-scrollbar">
                    {images.map((img, idx) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setActiveImageIdx(idx)}
                        className={`relative h-16 w-16 sm:h-18 sm:w-18 shrink-0 overflow-hidden rounded-2xl transition-all cursor-pointer ${
                          activeImageIdx === idx
                            ? 'ring-2 ring-brand-600 ring-offset-2 scale-102 shadow-xs'
                            : 'border border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover rounded-xl"
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Transparent Condition & Inspection Matrix Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Inspeksi & Transparansi Fisik</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Kondisi riil unit terverifikasi penjual</p>
                  </div>
                </div>
                <ConditionBadge condition={listing.condition} size="sm" />
              </div>

              {/* Structured Inspection Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2.5 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
                  <CheckCircle2 className="h-4.5 w-4.5 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {completenessList.includes('FULLSET')
                        ? 'Fullset Dus & Aksesoris Asli'
                        : 'Unit Saja (Batangan)'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {completenessList.includes('BOX_UNIT') ? 'Lengkap dus, kabel, buku' : 'Sesuai foto produk'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
                  <CheckCircle2
                    className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${
                      listing.hasOriginalReceipt ? 'text-brand-600' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {listing.hasOriginalReceipt ? 'Ada Nota / Struk Pembelian' : 'Tanpa Nota Pembelian'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {listing.hasOriginalReceipt ? 'Bukti asli toko resmi terlampir' : 'Garansi toko habis'}
                    </span>
                  </div>
                </div>

                {listing.purchaseYear && (
                  <div className="flex items-start gap-2.5 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
                    <Calendar className="h-4.5 w-4.5 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Tahun Pembelian: {listing.purchaseYear}
                      </span>
                      <span className="text-[11px] text-slate-500">Pemakaian tangan pertama</span>
                    </div>
                  </div>
                )}

                {listing.isCodAvailable && (
                  <div className="flex items-start gap-2.5 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
                    <Zap className="h-4.5 w-4.5 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Siap COD di Tempat Publik
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {listing.codMeetingPoint || listing.city}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Description & Technical Specs */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 mb-3">Deskripsi Lengkap Penjual</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                  {listing.description}
                </p>
              </div>

              {/* Dynamic Specs Table */}
              {Object.keys(specs).length > 0 && (
                <div className="border-t border-slate-100 pt-5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                    Spesifikasi Teknis
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    {Object.entries(specs).map(([key, val]) => (
                      <div key={key} className="rounded-2xl bg-slate-50 p-3 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          {key}
                        </span>
                        <span className="font-bold text-slate-900">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Escrow Guarantee Terms Callout */}
              <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-brand-950">Jaminan Uang Kembali 100%</h4>
                  <p className="text-[11px] text-brand-800 mt-0.5 leading-relaxed font-medium">
                    Jika barang yang diterima memiliki minus fisik atau fungsi yang tidak dijelaskan pada deskripsi, Anda berhak mengajukan komplain & retur dana penuh dalam 48 jam.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Transaction Sidebar Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Action & Pricing Card */}
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/60 space-y-5">
              {/* Special Banner if Accepted Offer exists */}
              {acceptedOffer && (
                <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-300 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span>TAWARAN NEGO ANDA DISETUJUI PENJUAL!</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-medium leading-snug">
                    Harga khusus sebesar <strong>{formatIDR(effectivePrice)}</strong> telah terkunci selama 24 jam untuk akun Anda melakukan pembayaran Rekber.
                  </p>
                </div>
              )}

              {/* Title & Live Status Badges */}
              <div>
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-800 border border-brand-200">
                    <Clock className="h-3 w-3" />
                    <span>Aktif</span>
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                    <Eye className="h-3 w-3" />
                    <span>{listing.viewCount}x dilihat</span>
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                    <Flame className="h-3 w-3" />
                    <span>{listing.offerCount} penawaran</span>
                  </span>
                </div>

                <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {listing.title}
                </h1>
              </div>

              {/* Price Display */}
              <div className="border-y border-slate-100 py-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">
                      {formatIDR(effectivePrice)}
                    </div>
                    {acceptedOffer ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400 line-through">
                          {formatIDR(listing.price)}
                        </span>
                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-300">
                          Hemat {formatIDR(listing.price - effectivePrice)} via Nego
                        </span>
                      </div>
                    ) : (
                      listing.originalPrice && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400 line-through">
                            {formatIDR(listing.originalPrice)}
                          </span>
                          {savingsPercent > 0 && (
                            <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-black text-rose-600 border border-rose-200">
                              Hemat {savingsPercent}%
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {listing.isNegotiable && !acceptedOffer && (
                    <div className="text-right">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-900 border border-amber-300 shadow-2xs">
                        Bisa Nego
                      </span>
                      {listing.minOfferPrice && (
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">
                          Min: {formatIDR(listing.minOfferPrice)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Verified Location Box */}
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
                <MapPin className="h-4.5 w-4.5 text-brand-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-xs text-slate-900 block truncate">
                    {listing.district}, {listing.city}
                  </span>
                  <p className="text-[10px] text-slate-500 truncate">
                    {listing.isCodAvailable ? 'Mendukung COD di tempat umum & Kirim Kurir' : 'Pengiriman via Kurir Rekber'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-1">
                <Link
                  href={checkoutUrl}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-600 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 hover:scale-101 transition-all cursor-pointer"
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  <span>
                    {acceptedOffer
                      ? `Beli Sekarang via Rekber (${formatIDR(effectivePrice)})`
                      : 'Beli Langsung via Rekber'}
                  </span>
                </Link>

                {listing.isNegotiable && !acceptedOffer && (
                  <button
                    type="button"
                    onClick={() => setIsNegoModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-full border border-brand-300 bg-brand-50/70 py-3 text-xs sm:text-sm font-bold text-brand-900 hover:bg-brand-100 hover:border-brand-400 transition-all cursor-pointer shadow-2xs"
                  >
                    <MessageSquareQuote className="h-4 w-4 text-brand-600" />
                    <span>Ajukan Tawaran Nego Harga</span>
                  </button>
                )}
              </div>

              {/* Escrow Timeline Visual 4-Step */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-brand-600" />
                  <span>Alur Transaksi Rekber JBB</span>
                </h4>
                <div className="grid grid-cols-4 gap-1 text-center">
                  <div className="space-y-1">
                    <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[10px] font-black text-white">
                      1
                    </div>
                    <p className="text-[9px] font-bold text-slate-700">Bayar Rekber</p>
                  </div>
                  <div className="space-y-1">
                    <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-black text-brand-800">
                      2
                    </div>
                    <p className="text-[9px] font-bold text-slate-700">Kirim / COD</p>
                  </div>
                  <div className="space-y-1">
                    <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-black text-brand-800">
                      3
                    </div>
                    <p className="text-[9px] font-bold text-slate-700">Cek 48 Jam</p>
                  </div>
                  <div className="space-y-1">
                    <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-black text-brand-800">
                      4
                    </div>
                    <p className="text-[9px] font-bold text-slate-700">Dana Cair</p>
                  </div>
                </div>
              </div>

              {/* Seller Trust Profile Card */}
              {listing.seller && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Reputasi Penjual
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Bergabung {formatTimeAgo(listing.seller.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {listing.seller.avatarUrl ? (
                      <img
                        src={listing.seller.avatarUrl}
                        alt={listing.seller.name}
                        className="h-12 w-12 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-sm font-black text-brand-700 shrink-0">
                        {listing.seller.name.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                        <span className="truncate">{listing.seller.name}</span>
                        {listing.seller.isKycVerified && (
                          <span title="KTP Terverifikasi" className="shrink-0">
                            <BadgeCheck className="h-4 w-4 text-brand-600 fill-brand-100" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-0.5 flex-wrap">
                        <div className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{listing.seller.ratingAverage}</span>
                          <span className="text-slate-400 font-normal">
                            ({listing.seller.ratingCount})
                          </span>
                        </div>
                        <span>&bull;</span>
                        <span className="font-semibold text-slate-700">{listing.seller.totalTransactions} transaksi</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs border border-slate-200/80">
                    <span className="text-slate-500 font-medium">Trust Score:</span>
                    <span className="font-black text-brand-700 bg-brand-100 px-2 py-0.5 rounded-md">
                      {listing.seller.trustScore}% Sangat Terpercaya
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        openAuthModal();
                      } else {
                        setIsNegoModalOpen(true);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-brand-600" />
                    <span>Diskusi / Chat Penjual</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Sticky Action Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-lg p-3 md:hidden shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold leading-none">
              {acceptedOffer ? 'Harga Nego Disetujui' : 'Harga Total'}
            </p>
            <p className="text-base font-black text-slate-900 mt-0.5">{formatIDR(effectivePrice)}</p>
          </div>

          <div className="flex items-center gap-2">
            {listing.isNegotiable && !acceptedOffer && (
              <button
                type="button"
                onClick={() => setIsNegoModalOpen(true)}
                className="rounded-full border border-brand-300 bg-brand-50 px-3.5 py-2 text-xs font-bold text-brand-900 cursor-pointer shadow-xs"
              >
                Nego
              </button>
            )}
            <Link
              href={checkoutUrl}
              className="rounded-full bg-brand-600 px-4.5 py-2 text-xs font-bold text-white shadow-md shadow-brand-600/30 cursor-pointer"
            >
              {acceptedOffer ? 'Beli Nego' : 'Beli Rekber'}
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox / Fullscreen Image Viewer Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-in fade-in duration-200">
          {/* Top Bar: Counter & Close Button */}
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
            <div className="rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white border border-white/10">
              Foto {activeImageIdx + 1} dari {images.length || 1}
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors cursor-pointer"
              title="Tutup Layar Penuh"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Prev Navigation Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 hover:bg-white/35 p-3 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-105"
              title="Foto Sebelumnya"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next Navigation Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => setActiveImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 hover:bg-white/35 p-3 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-105"
              title="Foto Berikutnya"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Main Fullscreen Image */}
          <div className="max-w-5xl max-h-[80vh] overflow-hidden flex items-center justify-center p-2">
            <img
              src={primaryImageUrl}
              alt={listing.title}
              className="w-full h-full object-contain max-h-[78vh] rounded-2xl select-none"
            />
          </div>

          {/* Bottom Thumbnails Strip in Lightbox */}
          {images.length > 1 && (
            <div className="absolute bottom-6 flex items-center gap-2.5 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    activeImageIdx === idx ? 'w-8 bg-brand-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                  title={`Ke Foto ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Make Offer Modal */}
      <MakeOfferModal
        listing={listing}
        isOpen={isNegoModalOpen}
        onClose={() => setIsNegoModalOpen(false)}
        onOfferSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const idOrSlug = resolvedParams.id;

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-12 text-center text-xs text-slate-400">Memuat detail barang...</div>}>
      <ListingDetailContent idOrSlug={idOrSlug} />
    </Suspense>
  );
}
