'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useAuth } from '../../context/auth-context';
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
  ShoppingBag
} from 'lucide-react';

export default function MyListingsPage() {
  const { user, openAuthModal } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusUpdatingId, setSelectedStatusUpdatingId] = useState<string | null>(null);

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
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 border border-brand-100">
            <Package className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">Masuk untuk Mengelola Barang Dijual</h2>
            <p className="text-xs text-slate-500">
              Pantau status iklan barang bekas Anda, tawaran nego masuk, dan statistik pengunjung.
            </p>
          </div>
          <button
            type="button"
            onClick={openAuthModal}
            className="w-full rounded-full bg-brand-600 hover:bg-brand-700 py-3 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
          >
            Masuk / Daftar Akun
          </button>
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

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const res = await api.updateListingStatus(id, newStatus);
    if (res.success) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['listings'] }),
        queryClient.invalidateQueries({ queryKey: ['featured-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['listing'] })
      ]);
      refetch();
      setSelectedStatusUpdatingId(null);
    } else {
      alert(res.error?.message || 'Gagal mengubah status iklan');
    }
  };

  const handleDeleteListing = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus iklan "${title}"?`)) {
      const res = await api.deleteListing(id);
      if (res.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['my-listings'] }),
          queryClient.invalidateQueries({ queryKey: ['listings'] }),
          queryClient.invalidateQueries({ queryKey: ['featured-listings'] })
        ]);
        refetch();
      } else {
        alert(res.error?.message || 'Gagal menghapus iklan');
      }
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
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="mx-auto max-w-6xl space-y-4">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Penjualan Saya', href: '/orders?role=seller' },
            { label: 'Barang yang Dijual' }
          ]}
        />

        {/* Main Dashboard Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 shadow-xs">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Daftar Barang yang Dijual
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Kelola inventaris iklan barang bekas Anda, pantau jumlah tawaran, dan tandai barang yang telah terjual
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/orders"
                className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors"
              >
                <ShoppingBag className="h-4 w-4 text-slate-500" />
                <span>Riwayat Penjualan</span>
              </Link>
              <Link
                href="/jual"
                className="flex items-center gap-1.5 rounded-2xl bg-brand-600 hover:bg-brand-700 px-4.5 py-2 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-3" />
                <span>Pasang Iklan Baru</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 block">Iklan Aktif</span>
              <span className="text-xl font-black text-slate-900 mt-1 block">{totalActive} Barang</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 block">Total Dilihat Calon Pembeli</span>
              <span className="text-xl font-black text-brand-700 mt-1 block">{totalViews.toLocaleString('id-ID')}x</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 block">Tawaran Masuk</span>
              <span className="text-xl font-black text-amber-600 mt-1 block">{totalOffers} Tawaran</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 block">Nilai Total Barang Aktif</span>
              <span className="text-base sm:text-lg font-black text-slate-900 mt-1 block truncate">
                {formatIDR(totalAssetValue)}
              </span>
            </div>
          </div>

          {/* Search bar & Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul barang yang dijual..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-9 pr-3.5 py-2 text-xs text-slate-800 focus:border-brand-500 focus:outline-none focus:bg-white"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto hide-scrollbar">
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
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && <span className="ml-1 opacity-70">({tab.count})</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Listings List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-3xl bg-white border border-slate-200 p-6 animate-pulse" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 border border-slate-200">
              <Package className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Belum Ada Iklan di Kategori Ini
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Pasang barang bekas Anda yang sudah tidak terpakai dengan proteksi rekber aman dan cepat laku.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/jual"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-3" />
                <span>Pasang Iklan Sekarang</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((item) => {
              const primaryImg =
                item.images?.find((img) => img.isPrimary)?.url ||
                item.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80';

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Item Image & Title */}
                    <div className="flex items-start gap-4">
                      <img
                        src={primaryImg}
                        alt={item.title}
                        className="h-22 w-22 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ConditionBadge condition={item.condition} size="sm" />
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
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
                              ? '🟢 Aktif Dijual'
                              : item.status === 'IN_NEGO'
                              ? '💬 Sedang Nego'
                              : item.status === 'RESERVED'
                              ? '🔒 Dibooking'
                              : item.status === 'SOLD'
                              ? '✓ Terjual'
                              : 'Arsip / Draf'}
                          </span>
                          {item.isCodAvailable && (
                            <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                              <Zap className="h-2.5 w-2.5 text-brand-600" />
                              <span>Siap COD</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                          {item.title}
                        </h3>

                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-brand-700">
                            {formatIDR(item.price)}
                          </span>
                          {item.originalPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatIDR(item.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics Badges */}
                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-200 text-xs text-slate-600 shrink-0">
                      <div className="text-center px-2">
                        <span className="flex items-center justify-center gap-1 font-bold text-slate-900">
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          {item.viewCount || 0}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Dilihat</span>
                      </div>
                      <div className="h-6 w-px bg-slate-200" />
                      <div className="text-center px-2">
                        <span className="flex items-center justify-center gap-1 font-bold text-amber-700">
                          <MessageSquareQuote className="h-3.5 w-3.5 text-amber-500" />
                          {item.offerCount || 0}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Tawaran</span>
                      </div>
                      <div className="h-6 w-px bg-slate-200" />
                      <div className="text-center px-2">
                        <span className="flex items-center justify-center gap-1 font-bold text-rose-600">
                          <Heart className="h-3.5 w-3.5 text-rose-500" />
                          {item.favoriteCount || 0}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Favorit</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Changer Toolbar */}
                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Ubah Status:</span>
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-bold text-slate-800 focus:border-brand-500 focus:outline-none cursor-pointer"
                      >
                        <option value="ACTIVE">🟢 Aktif Dijual</option>
                        <option value="IN_NEGO">💬 Sedang Nego</option>
                        <option value="RESERVED">🔒 Dibooking</option>
                        <option value="SOLD">✓ Terjual</option>
                        <option value="ARCHIVED">⚪ Arsipkan</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/nego?tab=received`}
                        className="flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 font-bold text-amber-900 transition-colors"
                      >
                        <MessageSquareQuote className="h-3.5 w-3.5 text-amber-600" />
                        <span>Cek Tawaran ({item.offerCount || 0})</span>
                      </Link>

                      <Link
                        href={`/listing/${item.slug || item.id}`}
                        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 font-bold text-slate-700 transition-colors"
                      >
                        <span>Lihat Iklan</span>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteListing(item.id, item.title)}
                        className="flex items-center gap-1 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 px-2.5 py-1.5 font-bold text-rose-600 transition-colors cursor-pointer"
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
      </div>
    </div>
  );
}
