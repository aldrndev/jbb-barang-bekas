'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '../../context/wishlist-context';
import { ListingCard } from '../../components/marketplace/listing-card';
import { formatIDR } from '../../lib/utils';
import {
  Heart,
  ShoppingBag,
  Sparkles,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Filter,
  ArrowUpDown
} from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems, wishlistCount, clearWishlist } = useWishlist();
  const [filterType, setFilterType] = useState<'all' | 'cod' | 'nego'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc'>('default');

  const totalValue = wishlistItems.reduce((acc, item) => acc + item.price, 0);

  const filteredItems = wishlistItems
    .filter((item) => {
      if (filterType === 'cod') return item.isCodAvailable;
      if (filterType === 'nego') return item.isNegotiable;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Wishlist Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-xs">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Wishlist & Barang Favorit
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Daftar barang impian Anda dengan proteksi harga & rekening bersama terjamin
                </p>
              </div>
            </div>

            {wishlistCount > 0 && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-[11px] text-slate-400 block font-medium">Estimasi Total:</span>
                  <span className="text-sm font-black text-brand-700">{formatIDR(totalValue)}</span>
                </div>
                <button
                  type="button"
                  onClick={clearWishlist}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 px-3.5 py-2 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Kosongkan</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats Pills */}
          {wishlistCount > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Semua ({wishlistCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('nego')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'nego'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ⚡ Bisa Di-Nego ({wishlistItems.filter((i) => i.isNegotiable).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('cod')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'cod'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  📍 Siap COD ({wishlistItems.filter((i) => i.isCodAvailable).length})
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Urutkan Wishlist"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
                >
                  <option value="default">Urutan Terbaru</option>
                  <option value="price_asc">Harga Terendah</option>
                  <option value="price_desc">Harga Tertinggi</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Wishlist Items Grid */}
        {wishlistCount === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-400 border border-rose-100">
              <Heart className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Wishlist Anda Masih Kosong
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Simpan barang bekas yang Anda incar dengan menekan ikon hati pada foto produk untuk memantau penurunan harga.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/cari"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Mulai Eksplorasi Barang</span>
              </Link>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
            <p className="text-xs text-slate-500">Tidak ada barang yang cocok dengan filter yang dipilih.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredItems.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Value Callout Ribbon */}
        <div className="rounded-3xl border border-brand-200 bg-brand-50/70 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm shadow-brand-600/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-brand-950">
                Garansi Rekber & Perlindungan Pembeli JBB
              </h3>
              <p className="text-[11px] text-brand-800 font-medium mt-0.5">
                Setiap transaksi dari wishlist Anda dilindungi penahanan dana 100% dan hak inspeksi fisik 48 jam.
              </p>
            </div>
          </div>

          <Link
            href="/cari"
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors shadow-2xs whitespace-nowrap"
          >
            <span>Cari Barang Lainnya</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
