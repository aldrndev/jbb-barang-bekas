'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useAuth } from '../../context/auth-context';
import { formatIDR } from '../../lib/utils';
import { ConditionBadge } from '../../components/marketplace/condition-badge';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';
import {
  ShieldCheck,
  Truck,
  Zap,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
  Lock,
  Tag,
  ChevronRight,
  User,
  Phone,
  HelpCircle
} from 'lucide-react';

function CheckoutContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, openAuthModal, loginAsDemoBuyer } = useAuth();
  const searchParams = useSearchParams();
  const listingIdOrSlug = searchParams.get('listingId');
  const queryOfferId = searchParams.get('offerId');

  const [deliveryMethod, setDeliveryMethod] = useState<'COD_KETEMUAN' | 'KURIR_REGULER'>('KURIR_REGULER');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [buyerNotes, setBuyerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  // Fetch Listing Details
  const { data: listingData, isLoading: isListingLoading } = useQuery({
    queryKey: ['listing', listingIdOrSlug],
    queryFn: () => api.getListingDetail(listingIdOrSlug!),
    enabled: !!listingIdOrSlug
  });

  // Fetch Sent Offers for current buyer
  const { data: sentOffersData } = useQuery({
    queryKey: ['offers', 'sent'],
    queryFn: () => api.getSentOffers(),
    enabled: !!user
  });

  const listing = listingData?.data;
  const sentOffers = sentOffersData?.data || [];

  // Detect agreed offer
  const acceptedOffer = sentOffers.find(
    (o) =>
      (o.id === queryOfferId || (listing && o.listingId === listing.id)) &&
      (o.status === 'ACCEPTED' || o.id === queryOfferId)
  );

  const effectivePrice = acceptedOffer
    ? acceptedOffer.counterPrice || acceptedOffer.offeredPrice
    : listing?.price || 0;

  const shippingFee = deliveryMethod === 'COD_KETEMUAN' ? 0 : 25000;
  const serviceFee = Math.round(effectivePrice * 0.01); // 1% escrow fee
  const totalPayment = effectivePrice + shippingFee + serviceFee;

  // Auto-fill user profile info
  useEffect(() => {
    if (user) {
      if (!recipientName) setRecipientName(user.name);
      if (!recipientPhone && user.phone) setRecipientPhone(user.phone);
    }
  }, [user]);

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      openAuthModal();
      return;
    }

    if (!listing) {
      setErrorMessage('Data barang tidak ditemukan.');
      return;
    }

    const trimmedName = recipientName.trim();
    const trimmedPhone = recipientPhone.trim();
    const trimmedAddress = shippingAddress.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Nama penerima minimal 2 karakter');
      return;
    }

    if (!trimmedPhone) {
      setErrorMessage('Nomor WhatsApp penerima wajib diisi');
      return;
    }

    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setErrorMessage('Format nomor WhatsApp tidak valid (contoh: 081234567890)');
      return;
    }

    if (deliveryMethod === 'KURIR_REGULER' && trimmedAddress.length < 10) {
      setErrorMessage('Alamat pengiriman lengkap wajib minimal 10 karakter (sertakan jalan, nomor rumah, atau patokan)');
      return;
    }

    if (deliveryMethod === 'COD_KETEMUAN' && trimmedAddress.length < 5) {
      setErrorMessage('Titik temu COD minimal 5 karakter (contoh: Starbucks Gandaria City jam 3 sore)');
      return;
    }

    setIsSubmitting(true);
    const res = await api.createOrder({
      listingId: listing.id,
      offerId: acceptedOffer?.id,
      deliveryMethod,
      recipientName: trimmedName,
      recipientPhone: trimmedPhone,
      shippingAddress: trimmedAddress || (deliveryMethod === 'COD_KETEMUAN' ? (listing.codMeetingPoint || listing.city) : 'Alamat Pengiriman'),
      courierName: deliveryMethod === 'COD_KETEMUAN' ? 'COD Langsung' : 'JNE Reguler'
    });

    if (res.success && res.data) {
      setSuccessOrder(res.data);
      setErrorMessage(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['offers'] }),
        queryClient.invalidateQueries({ queryKey: ['listing'] }),
        queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      ]);
    } else {
      setErrorMessage(res.error?.message || 'Gagal memproses pesanan Rekber. Silakan periksa kembali formulir Anda.');
    }
    setIsSubmitting(false);
  };

  // Not logged in view
  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-200/50">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 shadow-xs">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Masuk untuk Melanjutkan Checkout
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
            Demi keamanan rekening bersama dan perlindungan dana Anda, silakan masuk ke akun pembeli terlebih dahulu.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={loginAsDemoBuyer}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Masuk Cepat Demo (Dimas Pembeli)</span>
            </button>
            <button
              onClick={openAuthModal}
              className="w-full rounded-full border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Masuk / Daftar Akun Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading view
  if (isListingLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-96 bg-slate-200 rounded-3xl" />
          <div className="lg:col-span-5 h-96 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Not found view
  if (!listing) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Barang Tidak Ditemukan</h2>
          <p className="mt-1.5 text-xs text-slate-500">
            Barang yang ingin Anda beli mungkin telah dihapus oleh penjual atau sudah terjual.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-700 shadow-md shadow-brand-600/20"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  // Success Receipt Screen
  if (successOrder) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-lg w-full rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xl animate-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-4 shadow-xs border border-brand-200">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Pembayaran Rekber Sukses!</h2>
          <p className="text-xs text-slate-500 mt-1">
            Nomor Pesanan: <strong className="text-slate-900 font-mono">{successOrder.orderNumber}</strong>
          </p>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Barang:</span>
              <span className="font-bold text-slate-900 truncate max-w-[200px]">{listing.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Metode Transaksi:</span>
              <span className="font-bold text-slate-900">
                {successOrder.deliveryMethod === 'COD_KETEMUAN' ? 'COD Ketemuan' : 'Kurir Kilat'}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
              <span className="text-slate-700">Total Dana Diamankan:</span>
              <span className="text-brand-700 font-black text-sm">{formatIDR(successOrder.totalAmount)}</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-brand-50 p-3.5 border border-brand-200 text-[11px] text-brand-900 text-left flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
            <p>
              Dana Anda telah <strong>terkunci aman di rekening bersama Rekber JBB</strong>. Penjual telah kami beri notifikasi untuk menyiapkan pengiriman / jadwal COD.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/orders"
              className="w-full rounded-full bg-brand-600 py-3.5 text-xs font-bold text-white hover:bg-brand-700 transition-colors text-center shadow-md shadow-brand-600/20 cursor-pointer"
            >
              Pantau Status di Riwayat Pesanan
            </Link>
            <Link
              href="/"
              className="w-full rounded-full border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors text-center"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const primaryImage = listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="mx-auto max-w-6xl">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80">
          <Breadcrumbs
            items={[
              { label: 'Katalog Barang', href: '/cari' },
              { label: listing.title, href: `/listing/${listing.slug || listing.id}` },
              { label: 'Checkout Rekber' }
            ]}
          />

          <div className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800 border border-brand-200 shrink-0 self-start sm:self-auto">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            <span>Garansi Rekber 100%</span>
          </div>
        </div>

        {/* Main 2-Column Checkout Layout */}
        <form onSubmit={handleSubmitCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Details (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Error Banner */}
            {errorMessage && (
              <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-xs text-rose-800 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Gagal Melanjutkan Transaksi</strong>
                  <span className="font-medium">{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Agreed Offer Notice */}
            {acceptedOffer && (
              <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-300 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-950">
                    TAWARAN NEGO ANDA DISETUJUI PENJUAL!
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5 font-medium">
                    Harga khusus sebesar <strong>{formatIDR(effectivePrice)}</strong> (Hemat {formatIDR(listing.price - effectivePrice)}) telah diterapkan secara otomatis pada transaksi ini.
                  </p>
                </div>
              </div>
            )}

            {/* 1. Transaction & Delivery Method */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white font-black text-xs">
                  1
                </div>
                <h2 className="text-base font-black text-slate-900">Pilih Metode Transaksi</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryMethod('KURIR_REGULER');
                    setErrorMessage(null);
                  }}
                  className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    deliveryMethod === 'KURIR_REGULER'
                      ? 'border-brand-600 bg-brand-50/70 text-brand-950 ring-2 ring-brand-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Truck className="h-5 w-5 text-brand-600" />
                    <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800">
                      Asuransi Penuh
                    </span>
                  </div>
                  <div className="text-xs font-black">Kirim via Kurir Kilat</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    JNE / J&T / SiCepat &bull; Ongkir Rp 25.000
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeliveryMethod('COD_KETEMUAN');
                    setErrorMessage(null);
                  }}
                  className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    deliveryMethod === 'COD_KETEMUAN'
                      ? 'border-brand-600 bg-brand-50/70 text-brand-950 ring-2 ring-brand-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="h-5 w-5 text-brand-600" />
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Gratis Ongkir
                    </span>
                  </div>
                  <div className="text-xs font-black">COD Ketemuan Langsung</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {listing.codMeetingPoint || listing.city} &bull; Cek barang langsung
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Recipient & Contact Information */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white font-black text-xs">
                  2
                </div>
                <h2 className="text-base font-black text-slate-900">Informasi Penerima & Kontak</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Nama Lengkap Penerima</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap"
                    value={recipientName}
                    onChange={(e) => {
                      setRecipientName(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>Nomor WhatsApp Aktif</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Contoh: 081234567890</span>
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={recipientPhone}
                    onChange={(e) => {
                      setRecipientPhone(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Address / COD Location Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {deliveryMethod === 'COD_KETEMUAN'
                        ? 'Titik Temu COD yang Disepakati'
                        : 'Alamat Pengiriman Lengkap'}
                    </span>
                  </label>
                  <span
                    className={`text-[10px] font-bold ${
                      shippingAddress.trim().length >= (deliveryMethod === 'COD_KETEMUAN' ? 5 : 10)
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {shippingAddress.trim().length} / {deliveryMethod === 'COD_KETEMUAN' ? '5 min' : '10 min karakter'}
                  </span>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder={
                    deliveryMethod === 'COD_KETEMUAN'
                      ? 'Contoh: Starbucks Gandaria City jam 3 sore / Area Lobby Utama'
                      : 'Jl. Nama Jalan No. XX, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos (Sertakan patokan rumah bila perlu)'
                  }
                  value={shippingAddress}
                  onChange={(e) => {
                    setShippingAddress(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className={`w-full rounded-2xl border p-3.5 text-xs text-slate-800 focus:outline-none ${
                    errorMessage && shippingAddress.trim().length < (deliveryMethod === 'COD_KETEMUAN' ? 5 : 10)
                      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                      : 'border-slate-200 focus:border-brand-500'
                  }`}
                />
              </div>

              {/* Buyer Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Catatan untuk Penjual (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tolong packing bubble wrap tebal ya gan"
                  value={buyerNotes}
                  onChange={(e) => setBuyerNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 3. Escrow Security & Guarantee Assurance */}
            <div className="rounded-3xl border border-brand-200 bg-brand-50/60 p-5 space-y-3">
              <div className="flex items-center gap-2 text-brand-950 font-black text-sm">
                <ShieldCheck className="h-5 w-5 text-brand-600" />
                <span>Jaminan Transaksi Rekber JBB Indonesia</span>
              </div>
              <ul className="space-y-1.5 text-xs text-brand-900 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">✓</span>
                  <span><strong>Uang Ditahan Aman:</strong> Penjual tidak menerima dana sebelum Anda konfirmasi terima barang.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">✓</span>
                  <span><strong>Garansi Cek Fisik 48 Jam:</strong> Anda berhak memeriksa kelengkapan & fungsi unit selama 2x24 jam.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">✓</span>
                  <span><strong>Hak Komplain & Retur Penuh:</strong> Jika barang ada minus yang tidak sesuai deskripsi, dana dikembalikan 100%.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Sticky Summary & Pay CTA (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            {/* Product Summary Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/60 space-y-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                Ringkasan Pesanan
              </h3>

              {/* Product Info Block */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200">
                <img
                  src={primaryImage}
                  alt={listing.title}
                  className="h-20 w-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <ConditionBadge condition={listing.condition} size="sm" />
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 line-clamp-2 leading-snug">
                    {listing.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>{listing.city} &bull; Penjual: {listing.seller?.name}</span>
                  </div>
                </div>
              </div>

              {/* Price Calculation Table */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Harga Barang {acceptedOffer && '(Nego Disetujui)'}</span>
                  <span className="font-bold text-slate-900">{formatIDR(effectivePrice)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Biaya Pengiriman</span>
                  <span className="font-semibold text-slate-900">
                    {deliveryMethod === 'COD_KETEMUAN' ? 'Rp 0 (COD Gratis)' : 'Rp 25.000'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <div className="flex items-center gap-1">
                    <span>Biaya Perlindungan Rekber (1%)</span>
                    <span title="Biaya keamanan penjaminan rekening bersama 48 jam" className="cursor-help">
                      <HelpCircle className="h-3 w-3 text-slate-400" />
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900">{formatIDR(serviceFee)}</span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline font-black text-slate-900">
                  <span className="text-sm">Total Pembayaran</span>
                  <span className="text-xl font-black text-brand-700 tracking-tight">
                    {formatIDR(totalPayment)}
                  </span>
                </div>
              </div>

              {/* Action CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 hover:scale-101 transition-all disabled:opacity-50 cursor-pointer"
              >
                <ShieldCheck className="h-5 w-5" />
                <span>{isSubmitting ? 'Memproses Transaksi...' : `Bayar Aman ke Rekber (${formatIDR(totalPayment)})`}</span>
              </button>

              <p className="text-[10px] text-center text-slate-400 leading-relaxed font-medium">
                Dengan melanjutkan, Anda menyetujui Ketentuan Rekening Bersama & Jaminan Perlindungan Pembeli JBB.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-12 text-center text-xs text-slate-400">Memuat halaman checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
