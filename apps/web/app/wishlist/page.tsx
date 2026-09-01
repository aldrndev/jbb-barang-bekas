'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '../../context/wishlist-context';
import { ListingCard } from '../../components/marketplace/listing-card';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';
import { formatIDR } from '../../lib/utils';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems, wishlistCount, clearWishlist } = useWishlist();

  const totalValue = wishlistItems.reduce((acc, item) => acc + item.price, 0);

  const handleClearWishlist = () => {
    if (confirm('Kosongkan semua barang dari wishlist favorit Anda?')) {
      clearWishlist();
    }
  };

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
              onClick={handleClearWishlist}
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
              <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Total Estimasi:</span>
                <span className="text-sm sm:text-base font-black text-brand-700">{formatIDR(totalValue)}</span>
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
                Garansi Rekber & Perlindungan Pembeli JBB
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
      </div>
    </div>
  );
}
