'use client';

import React, { useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../context/auth-context';
import { useWishlist } from '../../../context/wishlist-context';
import { formatIDR, formatTimeAgo } from '../../../lib/utils';
import { ConditionBadge } from '../../../components/marketplace/condition-badge';
import { ListingCard } from '../../../components/marketplace/listing-card';
import { MakeOfferModal } from '../../../components/marketplace/make-offer-modal';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import {
  ShieldCheck,
  Zap,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Eye,
  ShoppingBag,
  MessageSquareQuote,
  Star,
  ChevronRight,
  ChevronLeft,
  Share2,
  Heart,
  Lock,
  ArrowLeft,
  AlertCircle,
  BadgeCheck,
  Maximize2,
  X,
  Sparkles,
  MessageCircle,
  Package,
  FileText,
  Truck
} from 'lucide-react';

function ListingDetailContent({ idOrSlug }: { idOrSlug: string }) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isNegoModalOpen, setIsNegoModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Fetch listing detail
  const { data: listingData, isLoading, refetch } = useQuery({
    queryKey: ['listing', idOrSlug],
    queryFn: () => api.getListingDetail(idOrSlug),
    enabled: !!idOrSlug
  });

  const listing = listingData?.data;

  // Fetch related / featured listings for bottom section
  const { data: featuredData } = useQuery({
    queryKey: ['featured-listings'],
    queryFn: () => api.getFeaturedListings()
  });

  const relatedListings = (featuredData?.data || []).filter(
    (item) => item.id !== listing?.id
  ).slice(0, 4);

  // Check if current user has an accepted offer for this listing
  const { data: sentOffersData } = useQuery({
    queryKey: ['offers', 'sent'],
    queryFn: () => api.getSentOffers(),
    enabled: !!user
  });

  const acceptedOffer = sentOffersData?.data?.find(
    (o) => (o.listingId === listing?.id || o.listing?.slug === idOrSlug) && o.status === 'ACCEPTED'
  );

  const effectivePrice = acceptedOffer
    ? acceptedOffer.counterPrice || acceptedOffer.offeredPrice
    : listing?.price || 0;

  const checkoutUrl = listing
    ? `/checkout?listingId=${listing.slug || listing.id}${acceptedOffer ? `&offerId=${acceptedOffer.id}` : ''}`
    : '#';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-[420px] bg-slate-200 rounded-3xl animate-pulse" />
            <div className="lg:col-span-5 h-[420px] bg-slate-200 rounded-3xl animate-pulse" />
          </div>
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

  const wishlisted = listing ? isWishlisted(listing.id) : false;

  const handleToggleWishlist = () => {
    if (listing) {
      toggleWishlist(listing);
    }
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
    <div className="bg-slate-50 py-3 sm:py-6 px-3.5 sm:px-6 lg:px-8 pb-6 sm:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center justify-between text-xs text-slate-500 gap-3 min-w-0">
          <Breadcrumbs
            items={[
              { label: 'Katalog', href: '/cari' },
              ...(listing.category ? [{ label: listing.category.name, href: `/cari?category=${listing.category.slug}` }] : []),
              { label: listing.title }
            ]}
          />

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Bagikan</span>
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                wishlisted
                  ? 'border-rose-300 bg-rose-50 text-rose-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-rose-600'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="font-bold">{wishlisted ? 'Tersimpan' : 'Wishlist'}</span>
            </button>
          </div>
        </div>

        {/* Share Toast Notification */}
        {shareToast && (
          <div className="fixed top-20 right-6 z-50 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-top-3">
            ✅ Link produk berhasil disalin ke clipboard!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          {/* Left Column (Photos, Mobile Quick Header, Seller Snippet, Condition, Specs, Description, Escrow Timeline) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* 1. Unified Product Image Gallery Card */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              {/* Top Section: Header & Main Stage Canvas */}
              <div className="p-3.5 sm:p-6 pb-3 sm:pb-4 space-y-3">
                {/* Top Header Bar */}
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ConditionBadge condition={listing.condition} size="md" />
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
                      📷 {activeImageIdx + 1}/{images.length || 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Mobile Wishlist & Share Shortcuts */}
                    <button
                      type="button"
                      onClick={handleShare}
                      className="sm:hidden flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      title="Bagikan"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleWishlist}
                      className={`sm:hidden flex items-center justify-center h-8 w-8 rounded-full border transition-all ${
                        wishlisted
                          ? 'border-rose-300 bg-rose-50 text-rose-600'
                          : 'border-slate-200 bg-slate-100 text-slate-700'
                      }`}
                      title="Wishlist"
                    >
                      <Heart className={`h-4 w-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <Maximize2 className="h-3.5 w-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Perbesar</span>
                    </button>
                  </div>
                </div>

                {/* Main Stage Image Frame */}
                <div
                  className="relative aspect-4/3 sm:aspect-16/11 w-full overflow-hidden rounded-2xl flex items-center justify-center p-2 group cursor-pointer bg-slate-50/60"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img
                    src={primaryImageUrl}
                    alt={listing.title}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-102"
                  />
                </div>
              </div>

              {/* Bottom Section: Docked Thumbnail Tray */}
              {images.length > 1 && (
                <div className="border-t border-slate-200/90 bg-slate-50/80 px-3.5 sm:px-6 py-2.5 sm:py-3">
                  <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 px-1 hide-scrollbar">
                    {images.map((img, idx) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setActiveImageIdx(idx)}
                        className={`relative h-14 w-14 sm:h-18 sm:w-18 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl transition-all cursor-pointer bg-white ${
                          activeImageIdx === idx
                            ? 'ring-2 ring-brand-600 ring-offset-2 ring-offset-slate-50 scale-103 shadow-sm'
                            : 'border border-slate-200/90 opacity-60 hover:opacity-100 hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Mobile-Only Main Product Title & Price Card */}
            <div className="block lg:hidden rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
              {/* Special Banner if Accepted Offer exists */}
              {acceptedOffer && (
                <div className="rounded-2xl bg-emerald-50 p-3 border border-emerald-300 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span>TAWARAN NEGO ANDA DISETUJUI!</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-medium leading-snug">
                    Harga khusus sebesar <strong>{formatIDR(effectivePrice)}</strong> terkunci 24 jam untuk akun Anda.
                  </p>
                </div>
              )}

              {/* Title & Status Badges */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-brand-800 border border-brand-200">
                    <Clock className="h-3 w-3" />
                    <span>Aktif</span>
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                    <Eye className="h-3 w-3" />
                    <span>{listing.viewCount}x dilihat</span>
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                    <Flame className="h-3 w-3" />
                    <span>{listing.offerCount} penawaran</span>
                  </span>
                </div>

                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {listing.title}
                </h1>
              </div>

              {/* Price Display */}
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-brand-700">
                      {formatIDR(effectivePrice)}
                    </span>
                    {acceptedOffer ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400 line-through">
                          {formatIDR(listing.price)}
                        </span>
                        <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-[10px] font-black text-brand-900 border border-brand-200">
                          Hemat {formatIDR(listing.price - effectivePrice)}
                        </span>
                      </div>
                    ) : (
                      listing.originalPrice && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400 line-through">
                            {formatIDR(listing.originalPrice)}
                          </span>
                          {savingsPercent > 0 && (
                            <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[10px] font-black text-amber-900 border border-amber-200">
                              Hemat {savingsPercent}%
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {listing.isNegotiable && !acceptedOffer && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-900 border border-amber-300">
                      Bisa Nego
                    </span>
                  )}
                </div>
              </div>

              {/* Verified Location */}
              <div className="flex items-center gap-2 text-xs text-slate-600 pt-0.5">
                <MapPin className="h-4 w-4 text-brand-600 shrink-0" />
                <span>Lokasi: <strong className="text-slate-900">{listing.district}, {listing.city}</strong></span>
              </div>
            </div>

            {/* 3. Mobile-Only Seller Profile Snippet (Placed right under price on mobile) */}
            {listing.seller && (
              <div className="block lg:hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Profil Penjual
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
                      className="h-11 w-11 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-sm font-black text-brand-700 shrink-0">
                      {listing.seller.name.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900">
                      <span className="truncate">{listing.seller.name}</span>
                      {listing.seller.isKycVerified && (
                        <BadgeCheck className="h-4 w-4 text-brand-600 fill-brand-100 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <div className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{listing.seller.ratingAverage}</span>
                        <span className="text-slate-400">({listing.seller.ratingCount})</span>
                      </div>
                      <span>&bull;</span>
                      <span className="font-semibold text-slate-700">{listing.seller.totalTransactions} transaksi</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-brand-800 bg-brand-50 border border-brand-200 px-2 py-1 rounded-xl shrink-0">
                    Trust {listing.seller.trustScore}%
                  </span>
                </div>
              </div>
            )}

            {/* 4. Certified Inspection Matrix Card (Enhanced 2x2 grid for mobile) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">Inspeksi & Transparansi Fisik</h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Kondisi riil unit terverifikasi penjual</p>
                  </div>
                </div>
                <ConditionBadge condition={listing.condition} size="sm" />
              </div>

              {/* Structured 2-Column Inspection Badges */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-2.5 sm:p-3.5 border border-slate-200/80">
                  <Package className="h-4 w-4 text-brand-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 block truncate">
                      {completenessList.includes('FULLSET') ? 'Fullset Dus & Box' : 'Unit Saja (Batangan)'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {completenessList.includes('FULLSET') ? 'Lengkap aksesoris' : 'Tanpa dus'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-2.5 sm:p-3.5 border border-slate-200/80">
                  <FileText className={`h-4 w-4 shrink-0 ${listing.hasOriginalReceipt ? 'text-brand-600' : 'text-slate-400'}`} />
                  <div className="min-w-0">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 block truncate">
                      {listing.hasOriginalReceipt ? 'Ada Nota Pembelian' : 'Tanpa Nota Toko'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {listing.hasOriginalReceipt ? 'Struk asli resmi' : 'Garansi habis'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-2.5 sm:p-3.5 border border-slate-200/80">
                  <Calendar className="h-4 w-4 text-brand-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 block truncate">
                      Tahun {listing.purchaseYear || '2023'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      Tangan pertama
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-2.5 sm:p-3.5 border border-slate-200/80">
                  <Zap className="h-4 w-4 text-brand-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 block truncate">
                      {listing.isCodAvailable ? 'Siap COD Langsung' : 'Kirim Kurir Kilat'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {listing.isCodAvailable ? 'Area publik aman' : 'Packing aman'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Product Description & Technical Specs */}
            <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 mb-2">Deskripsi Lengkap Penjual</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                  {listing.description}
                </p>
              </div>

              {/* Dynamic Specs Table */}
              {Object.keys(specs).length > 0 && (
                <div className="border-t border-slate-100 pt-3.5">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5">
                    Spesifikasi Teknis
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(specs).map(([key, val]) => (
                      <div key={key} className="rounded-2xl bg-slate-50 p-2.5 border border-slate-200/80">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 truncate">
                          {key}
                        </span>
                        <span className="font-bold text-slate-900 text-xs truncate block">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 6. Escrow Timeline & 100% Protection Guarantee Card (Visible on both Mobile & Desktop) */}
            <div className="rounded-3xl border border-brand-200/80 bg-brand-50/60 p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand-700 shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-brand-950">
                    Alur Transaksi & Garansi Rekber JBB 100%
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-brand-800 font-medium">
                    Dana Anda ditahan aman di rekening perantara dan baru cair ke penjual setelah 48 jam inspeksi fisik.
                  </p>
                </div>
              </div>

              {/* 4-Step Flow */}
              <div className="grid grid-cols-4 gap-1.5 text-center bg-white/80 p-3 rounded-2xl border border-brand-200">
                <div className="space-y-1">
                  <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[10px] font-black text-white">
                    1
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-800 leading-tight">Bayar Rekber</p>
                </div>
                <div className="space-y-1">
                  <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-black text-brand-800">
                    2
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-800 leading-tight">Kirim / COD</p>
                </div>
                <div className="space-y-1">
                  <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-black text-brand-800">
                    3
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-800 leading-tight">Cek 48 Jam</p>
                </div>
                <div className="space-y-1">
                  <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-black text-brand-800">
                    4
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-800 leading-tight">Dana Cair</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Desktop Transaction Sidebar Card (Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-5 space-y-6">
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
              <div className="border-y border-slate-200 py-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-3xl font-black text-brand-700 tracking-tight">
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Related / Recommended Listings */}
        {relatedListings.length > 0 && (
          <div className="mt-8 sm:mt-12 pt-8 sm:pt-10 border-t border-slate-200">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100 shadow-2xs shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    Rekomendasi Lainnya
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                    Barang sejenis bergaransi Rekber
                  </p>
                </div>
              </div>

              <Link
                href="/cari"
                className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {relatedListings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Sticky Action Bar (Mobile & Tablet View) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 lg:hidden shadow-2xl">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          {/* Price Preview & Chat Button */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  openAuthModal();
                } else {
                  setIsNegoModalOpen(true);
                }
              }}
              className="flex flex-col items-center justify-center h-10 w-10 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 shrink-0 cursor-pointer shadow-2xs"
              title="Chat Penjual"
            >
              <MessageCircle className="h-4.5 w-4.5 text-brand-600" />
              <span className="text-[9px] font-bold text-slate-500">Chat</span>
            </button>

            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider leading-none">
                {acceptedOffer ? 'Harga Nego Deal' : 'Harga Barang'}
              </span>
              <span className="text-base sm:text-lg font-black text-brand-700 truncate block mt-0.5">
                {formatIDR(effectivePrice)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {listing.isNegotiable && !acceptedOffer && (
              <button
                type="button"
                onClick={() => setIsNegoModalOpen(true)}
                className="flex items-center gap-1 rounded-2xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3.5 py-2.5 text-xs font-extrabold text-amber-900 cursor-pointer shadow-2xs transition-colors"
              >
                <MessageSquareQuote className="h-3.5 w-3.5 text-amber-700" />
                <span>Nego</span>
              </button>
            )}

            <Link
              href={checkoutUrl}
              className="flex items-center gap-1.5 rounded-2xl bg-brand-600 hover:bg-brand-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-brand-600/30 transition-all cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>{acceptedOffer ? 'Bayar Deal' : 'Beli Rekber'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox / Fullscreen Image Viewer Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-in fade-in duration-200">
          {/* Top Bar */}
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
