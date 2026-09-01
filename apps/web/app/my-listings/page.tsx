'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { formatIDR, formatTimeAgo } from '../../lib/utils';
import { ConditionBadge } from '../../components/marketplace/condition-badge';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';
import type { Listing, ListingStatus } from '@jbb/types';
import {
  Package,
  Plus,
  Search,
  Eye,
  MessageSquareQuote,
  Heart,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  MoreVertical,
  Zap,
  Tag,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Filter,
  Edit3,
  Lock
} from 'lucide-react';

export default function MyListingsPage() {
  const { user, openAuthModal } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: myListings = [], isLoading, refetch } = useQuery({
    queryKey: ['my-listings'],
    queryFn: async () => {
      const res = await api.getMyListings();
      if (res.success && res.data) {
        return res.data;
      }
      return [];
    },
    enabled: !!user
  });

  if (!user) {
    return (
      <div className="bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xs space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 shadow-xs">
            <Package className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900">Masuk untuk Mengelola Barang Dijual</h2>
            <p className="text-xs text-slate-500">
              Pantau status iklan barang bekas Anda, tawaran nego masuk, dan statistik pengunjung.
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

  // Filter listings by tab and search
  const filteredListings = myListings.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCity = item.city?.toLowerCase().includes(q);
      if (!matchTitle && !matchCity) return false;
    }

    if (activeTab === 'all') return true;
    if (activeTab === 'active') return item.status === 'ACTIVE';
    if (activeTab === 'in_nego') return item.status === 'IN_NEGO';
    if (activeTab === 'reserved') return item.status === 'RESERVED';
    if (activeTab === 'sold') return item.status === 'SOLD';
    if (activeTab === 'archived') return item.status === 'ARCHIVED' || item.status === 'DRAFT';
    return true;
  });

  const toast = useToast();
  const [listingToDelete, setListingToDelete] = useState<{ id: string; title: string } | null>(null);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const res = await api.updateListingStatus(id, newStatus);
    if (res.success) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['listings'] }),
        queryClient.invalidateQueries({ queryKey: ['featured-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['listing'] })
      ]);
      toast.success('Status Diperbarui', `Status iklan berhasil diubah ke ${newStatus}.`);
      refetch();
    } else {
      toast.error('Gagal Mengubah Status', res.error?.message || 'Terjadi kesalahan sistem.');
    }
  };

  const confirmDeleteListing = async () => {
    if (!listingToDelete) return;
    const res = await api.deleteListing(listingToDelete.id);
    if (res.success) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['listings'] }),
        queryClient.invalidateQueries({ queryKey: ['featured-listings'] })
      ]);
      toast.success('Iklan Dihapus', `Iklan "${listingToDelete.title}" telah dihapus.`);
      setListingToDelete(null);
      refetch();
    } else {
      toast.error('Gagal Menghapus Iklan', res.error?.message || 'Terjadi kesalahan.');
      setListingToDelete(null);
    }
  };

  // Stats calculation
  const totalActive = myListings.filter((i) => i.status === 'ACTIVE').length;
  const totalViews = myListings.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);
  const totalOffers = myListings.reduce((acc, curr) => acc + (curr.offerCount || 0), 0);
  const totalAssetValue = myListings
    .filter((i) => i.status === 'ACTIVE')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  return (
    <div className="bg-slate-50 py-3 sm:py-6 px-3.5 sm:px-6 lg:px-8 pb-6 sm:pb-8">
      <div className="mx-auto max-w-5xl space-y-4 sm:space-y-5">
        {/* Top Header Row: Breadcrumbs */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <Breadcrumbs
            items={[
              { label: 'Penjualan Saya', href: '/orders?role=seller' },
              { label: 'Barang yang Dijual' }
            ]}
          />
        </div>

        {/* 1. Main Dashboard Header & Metrics Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-4">
          {/* Header Title & CTA Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 shadow-xs shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate">
                  Barang yang Dijual ({myListings.length})
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                  Kelola status barang dan pantau tawaran nego dari calon pembeli
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/orders?role=seller"
                className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition-colors"
              >
                <ShoppingBag className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Riwayat Penjualan</span>
                <span className="sm:hidden">Pesanan</span>
              </Link>
              <Link
                href="/jual"
                className="flex items-center gap-1 rounded-2xl bg-brand-600 hover:bg-brand-700 px-3.5 sm:px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-3" />
                <span>Pasang Iklan</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar (Mobile-Friendly 4 Grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3 border-t border-slate-100">
            <div className="rounded-2xl bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Iklan Aktif</span>
              <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block">{totalActive} Barang</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Dilihat Pembeli</span>
              <span className="text-base sm:text-lg font-black text-brand-700 mt-0.5 block">{totalViews.toLocaleString('id-ID')}x</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Tawaran Nego</span>
              <span className="text-base sm:text-lg font-black text-amber-600 mt-0.5 block">{totalOffers} Tawaran</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Nilai Aset Aktif</span>
              <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block truncate">
                {formatIDR(totalAssetValue)}
              </span>
            </div>
          </div>

          {/* Search bar & Status Filter Tabs */}
          <div className="space-y-2.5 pt-1">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul barang yang sedang Anda jual..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-9 pr-3.5 py-2 text-xs text-slate-800 focus:border-brand-500 focus:outline-none focus:bg-white transition-colors"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Status Filter Horizontal Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
              {[
                { id: 'all', label: 'Semua Iklan', count: myListings.length },
                { id: 'active', label: 'Aktif Dijual', count: myListings.filter((i) => i.status === 'ACTIVE').length },
                { id: 'in_nego', label: 'Sedang Nego', count: myListings.filter((i) => i.status === 'IN_NEGO').length },
                { id: 'reserved', label: 'Dibooking', count: myListings.filter((i) => i.status === 'RESERVED').length },
                { id: 'sold', label: 'Terjual', count: myListings.filter((i) => i.status === 'SOLD').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-2xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && <span className="ml-1 opacity-70">({tab.count})</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Listings List Cards (Mobile-Optimized) */}
        {isLoading ? (
          <div className="space-y-3.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-3xl bg-white border border-slate-200 p-5 shadow-2xs" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs space-y-4">
            <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 border border-slate-200">
              <Package className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Belum Ada Iklan di Kategori Ini
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Pasang barang bekas Anda yang sudah tidak terpakai dengan proteksi rekber aman dan cepat laku.
              </p>
            </div>
            <div className="pt-1">
              <Link
                href="/jual"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-3" />
                <span>Pasang Iklan Sekarang</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 sm:space-y-4">
            {filteredListings.map((item) => {
              const primaryImg =
                item.images?.find((img) => img.isPrimary)?.url ||
                item.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80';

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-3.5 hover:border-slate-300 transition-colors"
                >
                  {/* Top Status & Quick Stats Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold border ${
                          item.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : item.status === 'IN_NEGO'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : item.status === 'RESERVED'
                            ? 'bg-blue-50 text-blue-900 border-blue-200'
                            : item.status === 'SOLD'
                            ? 'bg-purple-50 text-purple-900 border-purple-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.status === 'ACTIVE'
                          ? 'Aktif'
                          : item.status === 'IN_NEGO'
                          ? 'Sedang Nego'
                          : item.status === 'RESERVED'
                          ? 'Dibooking'
                          : item.status === 'SOLD'
                          ? 'Terjual'
                          : 'Draf'}
                      </span>

                      {item.isCodAvailable && (
                        <span className="rounded-full bg-amber-50 text-amber-950 text-[9px] font-bold px-2 py-0.5 border border-amber-300">
                          COD
                        </span>
                      )}
                    </div>

                    {/* Stats Strip */}
                    <div className="flex items-center gap-2.5 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-slate-400" />
                        <span>{item.viewCount || 0}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <MessageSquareQuote className="h-3 w-3" />
                        <span>{item.offerCount || 0}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-rose-500 font-bold">
                        <Heart className="h-3 w-3 fill-rose-500" />
                        <span>{item.favoriteCount || 0}</span>
                      </span>
                    </div>
                  </div>

                  {/* Product Body */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <img
                      src={primaryImg}
                      alt={item.title}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />

                    <div className="min-w-0 flex-1 space-y-1">
                      <ConditionBadge condition={item.condition} size="sm" />

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-sm sm:text-base font-black text-brand-700">
                          {formatIDR(item.price)}
                        </span>
                        {item.originalPrice && (
                          <span className="text-[11px] text-slate-400 line-through">
                            {formatIDR(item.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Changer Toolbar */}
                  <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 focus:border-brand-500 focus:outline-none cursor-pointer"
                      >
                        <option value="ACTIVE">Aktif Dijual</option>
                        <option value="IN_NEGO">Sedang Nego</option>
                        <option value="RESERVED">Dibooking</option>
                        <option value="SOLD">Terjual</option>
                        <option value="ARCHIVED">Arsipkan</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        href={`/jual?editId=${item.id}`}
                        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-2.5 sm:px-3 py-1 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
                      >
                        <Edit3 className="h-3 w-3 text-slate-500" />
                        <span>Edit</span>
                      </Link>

                      <Link
                        href={`/nego?tab=received`}
                        className="flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2.5 sm:px-3 py-1 text-xs font-bold text-amber-900 transition-colors shadow-2xs"
                      >
                        <MessageSquareQuote className="h-3.5 w-3.5 text-amber-700" />
                        <span>Nego ({item.offerCount || 0})</span>
                      </Link>

                      <Link
                        href={`/listing/${item.slug || item.id}`}
                        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-2.5 sm:px-3 py-1 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
                      >
                        <span>Lihat</span>
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setListingToDelete({ id: item.id, title: item.title })}
                        className="flex items-center justify-center h-7 w-7 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        title="Hapus Iklan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Confirmation Modal for Deleting Listing */}
        {listingToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900">Hapus Iklan Ini?</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Apakah Anda yakin ingin menghapus iklan <strong>&ldquo;{listingToDelete.title}&rdquo;</strong>? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setListingToDelete(null)}
                  className="flex-1 rounded-full border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteListing}
                  className="flex-1 rounded-full bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/25 transition-colors cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
