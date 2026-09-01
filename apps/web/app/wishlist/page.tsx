'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '../../context/wishlist-context';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { ListingCard } from '../../components/marketplace/listing-card';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';
import { formatIDR } from '../../lib/utils';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Lock
} from 'lucide-react';

export default function WishlistPage() {
  const { user, openAuthModal } = useAuth();
  const { wishlistItems, wishlistCount, clearWishlist } = useWishlist();
  const toast = useToast();
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const totalValue = wishlistItems.reduce((acc, item) => acc + item.price, 0);

  const confirmClear = () => {
    clearWishlist();
    setIsConfirmClearOpen(false);
    toast.info('Wishlist Dikosongkan', 'Semua barang dari daftar wishlist favorit Anda telah dihapus.');
  };

  if (!user) {
    return (
      <div className="bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xs space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-xs">
            <Heart className="h-7 w-7 fill-current" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900">Masuk untuk Melihat Wishlist</h2>
            <p className="text-xs text-slate-500">
              Simpan dan pantau barang bekas favorit Anda yang tersimpan di akun Rekber Peygo.
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
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-5">
        {/* Top Header Row: Breadcrumbs */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <Breadcrumbs
            items={[
              { label: 'Wishlist & Favorit' }
            ]}
          />

          {wishlistCount > 0 && (
            <button
              type="button"
              onClick={() => setIsConfirmClearOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3.5 py-1.5 text-xs font-bold text-rose-700 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-600" />
              <span>Hapus Semua Wishlist</span>
            </button>
          )}
        </div>

        {/* 1. Main Wishlist Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-xs shrink-0">
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate">
                  Wishlist Saya ({wishlistCount})
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                  Daftar barang bekas incaran yang tersimpan di akun Anda
                </p>
              </div>
            </div>

            {wishlistCount > 0 && (
              <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConfirmClearOpen(true)}
                  className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/50 hover:bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Kosongkan</span>
                </button>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Total Estimasi:</span>
                  <span className="text-sm sm:text-base font-black text-brand-700">{formatIDR(totalValue)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Wishlist Items Grid (Mobile 2-Cols with Direct Remove per Card) */}
        {wishlistCount === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs space-y-4">
            <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-400 border border-rose-100">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 fill-rose-100 text-rose-500" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Wishlist Anda Masih Kosong
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Simpan barang bekas yang Anda incar dengan menekan ikon hati pada foto produk untuk memantau penurunan harga.
              </p>
            </div>
            <div className="pt-1">
              <Link
                href="/cari"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Mulai Cari Barang Bekas</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {wishlistItems.map((listing) => (
              <ListingCard key={listing.id} listing={listing} showRemoveFromWishlist={true} />
            ))}
          </div>
        )}

        {/* 3. Value Callout Ribbon (Rekber Buyer Protection) */}
        <div className="rounded-3xl border border-brand-200 bg-brand-50/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-brand-950">
                Garansi Rekber & Perlindungan Pembeli Peygo
              </h3>
              <p className="text-[11px] text-brand-800 font-medium">
                Setiap transaksi dari wishlist Anda dilindungi garansi inspeksi fisik 48 jam dan dana aman di perantara.
              </p>
            </div>
          </div>

          <Link
            href="/cari"
            className="flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-brand-700 border border-brand-200 hover:bg-brand-50 transition-colors shadow-2xs shrink-0 self-end sm:self-auto"
          >
            <span>Cari Lainnya</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Custom Confirmation Modal for Clearing Wishlist */}
        {isConfirmClearOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900">Kosongkan Wishlist?</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Apakah Anda yakin ingin menghapus semua barang dari daftar wishlist favorit Anda?
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmClearOpen(false)}
                  className="flex-1 rounded-full border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmClear}
                  className="flex-1 rounded-full bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/25 transition-colors cursor-pointer"
                >
                  Ya, Kosongkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
