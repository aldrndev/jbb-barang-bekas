'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Listing } from '@jbb/types';
import { formatIDR } from '../../lib/utils';
import {
  X,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  MessageSquareQuote,
  CheckCircle2,
  Lock,
  User,
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api-client';
import { useAuth } from '../../context/auth-context';

interface MakeOfferModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  onOfferSuccess?: () => void;
}

export function MakeOfferModal({ listing, isOpen, onClose, onOfferSuccess }: MakeOfferModalProps) {
  const { user, openAuthModal, loginAsDemoBuyer } = useAuth();
  const minAllowed = listing.minOfferPrice || Math.round(listing.price * 0.7);
  const defaultSuggestion = Math.max(minAllowed, Math.round(listing.price * 0.9));

  const [offerAmount, setOfferAmount] = useState<number>(defaultSuggestion);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const isSellerOfThisItem = user && user.id === listing.sellerId;

  const handleQuickPercent = (percentOff: number) => {
    const calculated = Math.round(listing.price * (1 - percentOff / 100));
    setOfferAmount(calculated);
    setErrorMsg(null);
  };

  const discountAmount = listing.price - offerAmount;
  const discountPercent = Math.round((discountAmount / listing.price) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    if (offerAmount >= listing.price) {
      setErrorMsg('Harga tawaran harus lebih rendah dari harga asli barang.');
      return;
    }

    if (listing.minOfferPrice && offerAmount < listing.minOfferPrice) {
      setErrorMsg(`Tawaran minimal dari penjual adalah ${formatIDR(listing.minOfferPrice)}.`);
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    const res = await api.makeOffer(listing.id, offerAmount, message);

    if (res.success) {
      setIsSuccess(true);
      if (onOfferSuccess) onOfferSuccess();
    } else {
      setErrorMsg(res.error?.message || 'Gagal mengajukan tawaran. Silakan coba lagi.');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-4 shadow-xs border border-brand-100">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Tawaran Berhasil Dikirim!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Penjual (<strong className="text-slate-800">{listing.seller?.name}</strong>) telah menerima notifikasi tawaran Anda sebesar{' '}
              <strong className="text-brand-700">{formatIDR(offerAmount)}</strong>.
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Jika penjual menyetujui, harga ini akan terkunci 24 jam khusus untuk akun Anda checkout.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/nego?tab=sent"
                onClick={onClose}
                className="w-full rounded-full bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all text-center"
              >
                Pantau Tawaran di Menu Nego & Pesanan
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Selesai & Tetap di Halaman Ini
              </button>
            </div>
          </div>
        ) : isSellerOfThisItem ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Anda Pemilik Barang Ini</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Anda saat ini login sebagai <strong>{user.name}</strong> (penjual listing ini). Anda tidak dapat menawar barang milik sendiri.
              </p>
            </div>
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={async () => {
                  await loginAsDemoBuyer();
                  setErrorMsg(null);
                }}
                className="w-full rounded-full bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 cursor-pointer"
              >
                Ganti Akun ke Pembeli (Dimas)
              </button>
              <Link
                href="/nego"
                onClick={onClose}
                className="block w-full rounded-full border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 text-center"
              >
                Buka Menu Nego & Pesanan Masuk
              </Link>
            </div>
          </div>
        ) : !user ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
              <Lock className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Masuk untuk Menawar</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Ajukan tawaran resmi agar harga terkunci 24 jam dengan perlindungan Rekber JBB.
              </p>
            </div>
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={async () => {
                  await loginAsDemoBuyer();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Masuk Cepat Demo (Pembeli: Dimas)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal();
                }}
                className="w-full rounded-full border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Masuk / Daftar Akun Sendiri
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-700 mb-1">
                <MessageSquareQuote className="h-4 w-4" />
                <span>AJUKAN TAWARAN NEGO</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 line-clamp-1">{listing.title}</h3>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>Harga Pasang: <strong className="text-slate-900">{formatIDR(listing.price)}</strong></span>
                {listing.minOfferPrice && (
                  <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Batas Min: {formatIDR(listing.minOfferPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Discount Percent Chips */}
            <div className="mt-4">
              <label className="text-[11px] font-bold text-slate-600">Pilih Cepat Persentase Nego:</label>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                {[5, 10, 15, 20].map((percent) => (
                  <button
                    key={percent}
                    type="button"
                    onClick={() => handleQuickPercent(percent)}
                    className={`rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer ${
                      discountPercent === percent
                        ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    -{percent}%
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-3 rounded-xl bg-rose-50 p-2.5 text-xs font-medium text-rose-600 border border-rose-200">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Harga Tawaran Anda (Rp)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="1000"
                    step="any"
                    required
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm font-extrabold text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                {discountAmount > 0 && (
                  <div className="mt-1 flex items-center justify-between text-[11px] text-brand-700 font-bold">
                    <span>Hemat {formatIDR(discountAmount)} ({discountPercent}% lebih murah)</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Catatan untuk Penjual (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Bisa COD Gandaria City besok siang gan? Siap langsung checkout rekber."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none mt-1"
                />
              </div>

              {/* Escrow Guarantee Notice */}
              <div className="rounded-2xl bg-slate-50 p-3 text-[11px] text-slate-600 flex items-start gap-2 border border-slate-200">
                <ShieldCheck className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                <p>
                  Jika penjual menyetujui, harga ini akan <strong>terkunci 24 jam</strong> khusus untuk Anda melakukan checkout via Rekber JBB.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-full border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-2 flex items-center justify-center gap-2 rounded-full bg-brand-600 py-2.5 text-xs font-bold text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <span>{isLoading ? 'Mengirim...' : 'Kirim Tawaran'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
