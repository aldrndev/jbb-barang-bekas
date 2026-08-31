'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { formatIDR, formatTimeAgo, getConditionMeta } from '../../../lib/utils';
import { ConditionBadge } from '../../../components/marketplace/condition-badge';
import { MakeOfferModal } from '../../../components/marketplace/make-offer-modal';
import {
  ShieldCheck,
  MapPin,
  Star,
  Zap,
  CheckCircle2,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  MessageSquareQuote,
  ShoppingBag,
  Share2,
  AlertCircle,
  Truck,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../../context/auth-context';

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const idOrSlug = resolvedParams.id;
  const { user, openAuthModal } = useAuth();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isNegoModalOpen, setIsNegoModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
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
          <div className="lg:col-span-7 h-96 bg-slate-200 rounded-3xl" />
          <div className="lg:col-span-5 h-96 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
          <AlertCircle className="h-9 w-9" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Barang Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mt-1">
          Barang bekas ini mungkin telah dihapus oleh pemiliknya atau sudah terjual.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-6 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
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
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-emerald-600">Beranda</Link>
          <span>/</span>
          <Link href={`/cari?category=${listing.category?.slug}`} className="hover:text-emerald-600">
            {listing.category?.name || 'Katalog'}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold truncate max-w-xs">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery & Inspector */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
              <img
                src={primaryImageUrl}
                alt={listing.title}
                className="h-full w-full object-contain p-2"
              />
              <div className="absolute top-4 left-4">
                <ConditionBadge condition={listing.condition} size="md" />
              </div>
            </div>

            {/* Thumbnails list */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition-all cursor-pointer ${
                      activeImageIdx === idx
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img.url} alt={`Angle ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Condition Inspector Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900">Inspeksi & Kelengkapan Fisik</h3>
                </div>
                <ConditionBadge condition={listing.condition} size="sm" />
              </div>

              {/* Completeness Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    {completenessList.includes('FULLSET')
                      ? 'Fullset Dus & Aksesoris Asli'
                      : 'Batangan / Unit Saja'}
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2
                    className={`h-4 w-4 shrink-0 ${
                      listing.hasOriginalReceipt ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span>
                    {listing.hasOriginalReceipt ? 'Ada Nota / Struk Asli' : 'Tanpa Nota Pembelian'}
                  </span>
                </div>

                {listing.purchaseYear && (
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 font-medium">
                    <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Tahun Pembelian: {listing.purchaseYear}</span>
                  </div>
                )}

                {listing.isCodAvailable && (
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 font-medium">
                    <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Siap COD: {listing.codMeetingPoint || listing.city}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-black text-slate-900 mb-3">Deskripsi Lengkap Penjual</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>

              {/* Dynamic Specs Table */}
              {Object.keys(specs).length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-900 mb-3">Spesifikasi Detail</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(specs).map(([key, val]) => (
                      <div key={key} className="rounded-xl bg-slate-50 p-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {key}
                        </span>
                        <span className="font-bold text-slate-800">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Price Card, Seller Reputation & Actions */}
          <div className="lg:col-span-5 space-y-4">
            {/* Primary Action Card */}
            <div className="sticky top-20 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/40">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {listing.title}
              </h1>

              <div className="mt-3 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {formatIDR(listing.price)}
                  </div>
                  {listing.originalPrice && (
                    <div className="text-xs text-slate-400 line-through mt-0.5">
                      Harga baru saat beli: {formatIDR(listing.originalPrice)}
                    </div>
                  )}
                </div>

                {listing.isNegotiable && (
                  <span className="rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200/60">
                    Bisa Di-Nego
                  </span>
                )}
              </div>

              {/* Location Badge */}
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-2xl p-3">
                <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">{listing.district}, {listing.city}</span>
                  <p className="text-[10px] text-slate-400">
                    {listing.isCodAvailable ? 'Mendukung COD di tempat umum & Pengiriman Kurir' : 'Pengiriman via Kurir Rekber'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Beli Langsung via Rekber ({formatIDR(listing.price)})</span>
                </button>

                {listing.isNegotiable && (
                  <button
                    type="button"
                    onClick={() => setIsNegoModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-600/30 bg-emerald-50/50 py-3 text-xs sm:text-sm font-bold text-emerald-800 hover:bg-emerald-100/70 transition-all cursor-pointer"
                  >
                    <MessageSquareQuote className="h-4 w-4 text-emerald-600" />
                    <span>Ajukan Tawaran Nego</span>
                  </button>
                )}
              </div>

              {/* Escrow Guarantee Notice */}
              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5 text-[11px] text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="font-bold">Dilindungi Rekber JBB:</strong>
                  <p className="text-emerald-800 mt-0.5 leading-relaxed">
                    Dana pembayaran Anda aman disimpan. Penjual baru menerima dana setelah Anda cek barang dalam batas waktu 48 jam.
                  </p>
                </div>
              </div>

              {/* Seller Trust Profile */}
              {listing.seller && (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Profil Penjual
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Bergabung {formatTimeAgo(listing.seller.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {listing.seller.avatarUrl ? (
                      <img
                        src={listing.seller.avatarUrl}
                        alt={listing.seller.name}
                        className="h-12 w-12 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-bold text-emerald-700">
                        {listing.seller.name.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                        <span>{listing.seller.name}</span>
                        {listing.seller.isKycVerified && (
                          <span title="KTP Terverifikasi">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <div className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{listing.seller.ratingAverage}</span>
                          <span className="text-slate-400 font-normal">
                            ({listing.seller.ratingCount} ulasan)
                          </span>
                        </div>
                        <span>&bull;</span>
                        <span>{listing.seller.totalTransactions} transaksi</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 shadow-inner">
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
                    className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors text-center"
                  >
                    Lihat Status Pesanan di Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutModalOpen(false);
                      setCheckoutSuccessOrder(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit}>
                <div className="pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span>CHECKOUT REKBER JBB</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{listing.title}</h3>
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
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Truck className="h-4 w-4 text-emerald-600 mb-1" />
                      <div className="text-xs font-bold">Kirim Kurir Kilat</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Ongkir Rp 25.000 (Asuransi)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('COD_KETEMUAN')}
                      className={`rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                        deliveryMethod === 'COD_KETEMUAN'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Zap className="h-4 w-4 text-emerald-600 mb-1" />
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
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 mt-1"
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
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">
                      {deliveryMethod === 'COD_KETEMUAN' ? 'Titik Temu COD yang Disepakati' : 'Alamat Pengiriman Lengkap'}
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder={deliveryMethod === 'COD_KETEMUAN' ? 'Contoh: Starbucks Dago Bandung jam 3 sore' : 'Jl. Nama Jalan No. XX, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos'}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 mt-1"
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
                    <span className="text-emerald-700">
                      {formatIDR(listing.price + (deliveryMethod === 'COD_KETEMUAN' ? 0 : 25000) + Math.round(listing.price * 0.01))}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isCheckingOut}
                    className="flex-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md disabled:opacity-50"
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
