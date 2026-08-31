'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
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
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../context/auth-context';

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const idOrSlug = resolvedParams.id;
  const { user, openAuthModal } = useAuth();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isNegoModalOpen, setIsNegoModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCountOffset, setFavoriteCountOffset] = useState(0);
  const [shareToast, setShareToast] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState<'COD_KETEMUAN' | 'KURIR_REGULER'>('KURIR_REGULER');
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState<any>(null);

  const { data: listingData, isLoading, refetch } = useQuery({
    queryKey: ['listing', idOrSlug],
    queryFn: () => api.getListingDetail(idOrSlug)
  });

  const listing = listingData?.data;

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
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
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
          text: `Cek barang bekas berkualitas: ${listing.title} seharga ${formatIDR(listing.price)} di Rekber JBB`,
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      }
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    setIsCheckingOut(true);
    const res = await api.createOrder({
      listingId: listing.id,
      deliveryMethod,
      recipientName: recipientName || user.name,
      recipientPhone: recipientPhone || user.phone || '081234567890',
      shippingAddress: shippingAddress || (deliveryMethod === 'COD_KETEMUAN' ? (listing.codMeetingPoint || listing.city) : 'Alamat Pengiriman')
    });

    if (res.success && res.data) {
      setCheckoutSuccessOrder(res.data);
    }
    setIsCheckingOut(false);
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
            {/* Main Stage Image Box */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs group">
              <div className="flex h-full w-full items-center justify-center p-4">
                <img
                  src={primaryImageUrl}
                  alt={listing.title}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-102 cursor-pointer"
                  onClick={() => setIsLightboxOpen(true)}
                />
              </div>

              {/* Floating Top Left Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <ConditionBadge condition={listing.condition} size="md" />
                <span className="rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-800 border border-slate-200 shadow-xs">
                  📷 {activeImageIdx + 1} / {images.length || 1}
                </span>
              </div>

              {/* Maximize Icon */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-4 right-4 rounded-full bg-white/95 backdrop-blur-md p-2.5 text-slate-700 shadow-xs border border-slate-200 hover:bg-white hover:text-brand-600 transition-all cursor-pointer"
                title="Perbesar Foto"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            {/* Thumbnails Carousel */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto p-1.5 hide-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl p-0.5 bg-white transition-all cursor-pointer ${
                      activeImageIdx === idx
                        ? 'border-2 border-brand-600 shadow-sm ring-2 ring-brand-500/20'
                        : 'border-2 border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            )}

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
                      {formatIDR(listing.price)}
                    </div>
                    {listing.originalPrice && (
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
                    )}
                  </div>

                  {listing.isNegotiable && (
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
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-600 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 hover:scale-101 transition-all cursor-pointer"
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  <span>Beli Langsung via Rekber</span>
                </button>

                {listing.isNegotiable && (
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
            <p className="text-[10px] text-slate-400 font-semibold leading-none">Harga Total</p>
            <p className="text-base font-black text-slate-900 mt-0.5">{formatIDR(listing.price)}</p>
          </div>

          <div className="flex items-center gap-2">
            {listing.isNegotiable && (
              <button
                type="button"
                onClick={() => setIsNegoModalOpen(true)}
                className="rounded-full border border-brand-300 bg-brand-50 px-3.5 py-2 text-xs font-bold text-brand-900 cursor-pointer shadow-xs"
              >
                Nego
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCheckoutModalOpen(true)}
              className="rounded-full bg-brand-600 px-4.5 py-2 text-xs font-bold text-white shadow-md shadow-brand-600/30 cursor-pointer"
            >
              Beli Rekber
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox / Fullscreen Image Viewer Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="max-w-4xl max-h-[85vh] overflow-hidden">
            <img
              src={primaryImageUrl}
              alt={listing.title}
              className="w-full h-full object-contain max-h-[80vh] rounded-2xl"
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-6 flex items-center gap-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    activeImageIdx === idx ? 'w-8 bg-brand-500' : 'w-2.5 bg-white/50'
                  }`}
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

      {/* Direct Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {checkoutSuccessOrder ? (
              <div className="text-center py-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-4 shadow-xs border border-brand-200">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Pembayaran Rekber Sukses!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Nomor Pesanan: <strong className="text-slate-900">{checkoutSuccessOrder.orderNumber}</strong>
                </p>
                <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto">
                  Dana sebesar <strong>{formatIDR(checkoutSuccessOrder.totalAmount)}</strong> telah aman ditahan oleh sistem Rekber JBB. Penjual telah diberi notifikasi untuk menyiapkan pengiriman.
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/nego"
                    className="w-full rounded-full bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-700 transition-colors text-center shadow-md shadow-brand-600/20"
                  >
                    Lihat Status Pesanan di Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutModalOpen(false);
                      setCheckoutSuccessOrder(null);
                    }}
                    className="w-full rounded-full border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit}>
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-brand-700 mb-0.5">
                      <ShieldCheck className="h-4 w-4" />
                      <span>CHECKOUT REKBER JBB</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{listing.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="rounded-full p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Delivery Options */}
                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-700">Pilih Metode Transaksi</label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('KURIR_REGULER')}
                      className={`rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                        deliveryMethod === 'KURIR_REGULER'
                          ? 'border-brand-600 bg-brand-50/60 text-brand-950 ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Truck className="h-4 w-4 text-brand-600 mb-1" />
                      <div className="text-xs font-bold">Kirim Kurir Kilat</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Ongkir Rp 25.000 (Asuransi)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('COD_KETEMUAN')}
                      className={`rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                        deliveryMethod === 'COD_KETEMUAN'
                          ? 'border-brand-600 bg-brand-50/60 text-brand-950 ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Zap className="h-4 w-4 text-brand-600 mb-1" />
                      <div className="text-xs font-bold">COD Ketemuan</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Gratis Ongkir</div>
                    </button>
                  </div>
                </div>

                {/* Address Form */}
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Nama Penerima</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 mt-1 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Nomor WhatsApp</label>
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 mt-1 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">
                      {deliveryMethod === 'COD_KETEMUAN' ? 'Titik Temu COD yang Disepakati' : 'Alamat Pengiriman Lengkap'}
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder={deliveryMethod === 'COD_KETEMUAN' ? 'Contoh: Starbucks Gandaria City jam 3 sore' : 'Jl. Nama Jalan No. XX, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos'}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 mt-1 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Harga Barang</span>
                    <span>{formatIDR(listing.price)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Biaya Pengiriman</span>
                    <span>{deliveryMethod === 'COD_KETEMUAN' ? 'Rp 0 (COD)' : 'Rp 25.000'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Biaya Jasa Perlindungan Rekber (1%)</span>
                    <span>{formatIDR(Math.round(listing.price * 0.01))}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                    <span>Total Pembayaran</span>
                    <span className="text-brand-700">
                      {formatIDR(listing.price + (deliveryMethod === 'COD_KETEMUAN' ? 0 : 25000) + Math.round(listing.price * 0.01))}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="flex-1 rounded-full border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isCheckingOut}
                    className="flex-2 flex items-center justify-center gap-2 rounded-full bg-brand-600 py-2.5 text-xs font-bold text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{isCheckingOut ? 'Memproses...' : 'Bayar Aman ke Rekber'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
