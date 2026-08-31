'use client';

import React, { useState } from 'react';
import type { Listing } from '@jbb/types';
import { formatIDR } from '../../lib/utils';
import { X, Sparkles, ShieldCheck, ArrowRight, MessageSquareQuote, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api-client';
import { useAuth } from '../../context/auth-context';

interface MakeOfferModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  onOfferSuccess?: () => void;
}

export function MakeOfferModal({ listing, isOpen, onClose, onOfferSuccess }: MakeOfferModalProps) {
  const { user, openAuthModal } = useAuth();
  const [offerAmount, setOfferAmount] = useState<number>(
    Math.round(listing.price * 0.9) // Default 10% discount suggestion
  );
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 shadow-inner">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Tawaran Berhasil Dikirim!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Penjual ({listing.seller?.name}) telah menerima notifikasi tawaran Anda sebesar{' '}
              <strong className="text-slate-900">{formatIDR(offerAmount)}</strong>.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Selesai & Kembali ke Barang
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mb-1">
                <MessageSquareQuote className="h-4 w-4" />
                <span>AJUKAN TAWARAN NEGO</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 line-clamp-1">{listing.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Harga Pasang: <strong className="text-slate-900">{formatIDR(listing.price)}</strong>
              </p>
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
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
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
                    min="10000"
                    step="50000"
                    required
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-3 text-sm font-extrabold text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                {discountAmount > 0 && (
                  <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-600 font-bold">
                    <span>Hemat {formatIDR(discountAmount)} ({discountPercent}% lebih murah)</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Catatan untuk Penjual (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Bisa COD Gandaria City besok siang gan? Siap langsung bungkus."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none mt-1"
                />
              </div>

              {/* Escrow Guarantee Notice */}
              <div className="rounded-2xl bg-slate-50 p-3 text-[11px] text-slate-600 flex items-start gap-2 border border-slate-100">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Jika penjual menyetujui, harga ini akan <strong>terkunci 24 jam</strong> khusus untuk Anda melakukan checkout via Rekber JBB.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
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
