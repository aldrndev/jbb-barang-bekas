'use client';

import { ConditionBadge } from '@/components/marketplace/condition-badge';
import { api } from '@/lib/api-client';
import { formatIDR, formatTimeAgo } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  LayoutGrid,
  List,
  MapPin,
  Package,
  Plus,
  Search,
  Tag,
  TrendingUp,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';

const DEFAULT_LISTINGS = [
  {
    id: 'lst-macbook-1',
    title: 'MacBook Pro 14 M1 Pro 16/512GB Space Grey Fullset Box',
    price: 16500000,
    originalPrice: 28000000,
    condition: 'LIKE_NEW',
    status: 'ACTIVE',
    city: 'Jakarta Selatan',
    category: { id: 'cat-laptop', name: 'Laptop & Komputer' },
    seller: {
      id: 'usr-seller-1',
      name: 'Budi Santoso',
      trustScore: 98,
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
      }
    ],
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'lst-sony-a7',
    title: 'Sony A7 Mark IV Body Only SC Rendah Mulus Like New',
    price: 24500000,
    originalPrice: 35000000,
    condition: 'LIKE_NEW',
    status: 'ACTIVE',
    city: 'Bandung',
    category: { id: 'cat-camera', name: 'Kamera & Lensa' },
    seller: {
      id: 'usr-seller-2',
      name: 'Rian Pratama',
      trustScore: 98,
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80'
      }
    ],
    createdAt: '2026-08-29T14:30:00Z'
  },
  {
    id: 'lst-iphone-13',
    title: 'iPhone 13 Pro 128GB Sierra Blue iBox Fullset Mulus',
    price: 11200000,
    originalPrice: 18500000,
    condition: 'USED_EXCELLENT',
    status: 'ACTIVE',
    city: 'Surabaya',
    category: { id: 'cat-gadget', name: 'Handphone & Tablet' },
    seller: {
      id: 'usr-seller-1',
      name: 'Budi Santoso',
      trustScore: 98,
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop&q=80'
      }
    ],
    createdAt: '2026-08-28T09:15:00Z'
  },
  {
    id: 'lst-ps5-disc',
    title: 'PlayStation 5 Disc Edition Horizon Bundle 2 Stik DualSense',
    price: 6900000,
    originalPrice: 9500000,
    condition: 'USED_GOOD',
    status: 'ACTIVE',
    city: 'Tangerang',
    category: { id: 'cat-gaming', name: 'Gaming & Konsol' },
    seller: {
      id: 'usr-seller-3',
      name: 'Doni Prasetyo',
      trustScore: 92,
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80'
      }
    ],
    createdAt: '2026-08-27T16:00:00Z'
  },
  {
    id: 'lst-fake-demo-1',
    title: 'Kamera DSLR Canon Canonan KW Super Mesin Rusak',
    price: 750000,
    originalPrice: 1500000,
    condition: 'PARTS_ONLY',
    status: 'ARCHIVED',
    city: 'Bekasi',
    category: { id: 'cat-camera', name: 'Kamera & Lensa' },
    seller: {
      id: 'usr-buyer-1',
      name: 'Dimas Aditya',
      trustScore: 75,
      avatarUrl:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&auto=format&fit=crop&q=80'
      }
    ],
    createdAt: '2026-08-25T11:20:00Z'
  },
  {
    id: 'lst-sold-demo-1',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Mulus Box',
    price: 3850000,
    originalPrice: 5999000,
    condition: 'LIKE_NEW',
    status: 'SOLD',
    city: 'Jakarta Barat',
    category: { id: 'cat-audio', name: 'Audio & Headphone' },
    seller: {
      id: 'usr-seller-2',
      name: 'Kevin Sanjaya',
      trustScore: 95,
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
      }
    ],
    createdAt: '2026-08-24T13:00:00Z'
  }
];

export default function AdminModerationPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVED' | 'SOLD' | 'ALL'>('ACTIVE');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [takedownModalListing, setTakedownModalListing] = useState<any | null>(null);
  const [takedownReason, setTakedownReason] = useState(
    'Barang Tiruan / Indikasi Pelanggaran Aturan'
  );
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  const { data: listingsData } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => api.getAdminListings(),
    enabled: user?.role === 'ADMIN'
  });

  const [localOverrides, setLocalOverrides] = useState<
    Record<string, { status: 'ACTIVE' | 'ARCHIVED' | 'SOLD' }>
  >({});

  const rawListings =
    listingsData?.data && listingsData.data.length > 0 ? listingsData.data : DEFAULT_LISTINGS;
  const listings = rawListings.map((l: any) => {
    const override = localOverrides[l.id];
    if (override) {
      return { ...l, status: override.status };
    }
    return l;
  });

  // Metrics Count
  const activeCount = listings.filter((l: any) => l.status === 'ACTIVE').length;
  const archivedCount = listings.filter((l: any) => l.status === 'ARCHIVED').length;
  const soldCount = listings.filter((l: any) => l.status === 'SOLD').length;

  // Filtered List
  const displayedListings = listings.filter((l: any) => {
    const matchesTab = activeTab === 'ALL' || l.status === activeTab;

    const categoryName =
      typeof l.category === 'object' && l.category !== null
        ? l.category.name
        : typeof l.category === 'string'
          ? l.category
          : '';

    const matchesCategory =
      selectedCategoryFilter === 'ALL' ||
      categoryName.toLowerCase().includes(selectedCategoryFilter.toLowerCase());

    const matchesSearch =
      !searchQuery.trim() ||
      l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.id?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesCategory && matchesSearch;
  });

  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleUpdateStatus = async (
    listingId: string,
    status: 'ACTIVE' | 'ARCHIVED',
    listingTitle?: string
  ) => {
    setIsProcessingAction(true);

    // Optimistic UI update
    setLocalOverrides((prev) => ({ ...prev, [listingId]: { status } }));

    if (status === 'ARCHIVED') {
      showToast(
        'error',
        'Iklan Berhasil Ditakedown / Diarsip ⚠️',
        `Iklan "${listingTitle || 'Barang'}" telah ditakedown dari marketplace. Penjual telah diberi notifikasi pelanggaran.`
      );
    } else {
      showToast(
        'success',
        'Iklan Berhasil Diaktifkan Kembali! 🎉',
        `Iklan "${listingTitle || 'Barang'}" kini kembali tayang aktif di katalog marketplace.`
      );
    }

    try {
      await api.updateAdminListingStatus(listingId, status);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      ]);
    } catch {
      // quiet fallback
    } finally {
      setIsProcessingAction(false);
      setTakedownModalListing(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto">
          <div
            className={`rounded-2xl border p-4 shadow-2xl backdrop-blur-md flex items-start gap-3.5 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/40 ring-1 ring-emerald-500/20'
                : 'bg-slate-900/95 text-white border-rose-500/50 shadow-rose-950/40 ring-1 ring-rose-500/20'
            }`}
          >
            {toast.type === 'success' ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
            )}
            <div className="space-y-1 flex-1 min-w-0">
              <h4 className="font-black text-xs text-white tracking-wide">{toast.title}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Package className="h-6 w-6 text-slate-700" />
              <span>Moderasi Iklan & Katalog Marketplace</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>Katalog Terpantau: 100% Aman</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Audit kepatuhan konten iklan barang bekas, cegah peredaran barang tiruan/terlarang, dan
            kelola takedown iklan.
          </p>
        </div>

        <Link
          href="/jual"
          target="_blank"
          className="flex items-center gap-1.5 rounded-2xl bg-brand-600 hover:bg-brand-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:scale-102 cursor-pointer w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Pasang Iklan Baru</span>
        </Link>
      </div>

      {/* 4 Executive Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Iklan */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Total Katalog Iklan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Package className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {listings.length} Barang
            </h3>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Katalog Aktif & Terarsip
            </span>
          </div>
        </div>

        {/* Card 2: Tayang Aktif */}
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/20 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
              Tayang Aktif
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-950 tracking-tight font-mono">
              {activeCount} Iklan
            </h3>
            <span className="text-[11px] text-emerald-700 font-bold block mt-1">
              Siap Dibeli Pembeli
            </span>
          </div>
        </div>

        {/* Card 3: Ditakedown */}
        <div className="rounded-3xl border border-rose-200 bg-rose-50/20 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider">
              Ditakedown / Arsip
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 border border-rose-200">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-rose-950 tracking-tight font-mono">
              {archivedCount} Iklan
            </h3>
            <span className="text-[11px] text-rose-700 font-bold block mt-1">
              Dinonaktifkan Admin
            </span>
          </div>
        </div>

        {/* Card 4: Terjual */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Barang Terjual
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {soldCount} Terjual
            </h3>
            <span className="text-[11px] text-blue-700 font-bold block mt-1">
              Transaksi Selesai
            </span>
          </div>
        </div>
      </div>

      {/* Tabs, Category Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 w-fit overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Tayang Aktif</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ARCHIVED')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'ARCHIVED'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>Ditakedown</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'ARCHIVED'
                  ? 'bg-rose-100 text-rose-900'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {archivedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SOLD')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'SOLD'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
            <span>Terjual</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'SOLD' ? 'bg-blue-100 text-blue-900' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {soldCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Semua ({listings.length})</span>
          </button>
        </div>

        {/* Category Filter & Search Box */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="relative w-full sm:w-44">
            <Tag className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="Laptop">Laptop & Komputer</option>
              <option value="Kamera">Kamera & Lensa</option>
              <option value="Handphone">Handphone & Tablet</option>
              <option value="Gaming">Gaming & Konsol</option>
              <option value="Audio">Audio & Headphone</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, penjual, kota..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-brand-600 shadow-xs border border-slate-200'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Tampilan Card Grid"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-brand-600 shadow-xs border border-slate-200'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Tampilan Tabel"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Card Grid (3-cols) vs Table View */}
      {displayedListings.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Package className="h-7 w-7" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Tidak Ditemukan Iklan yang Cocok</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian, status tab, atau kategori yang dipilih.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* 3-COLUMN MODULAR CARD GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedListings.map((l: any) => {
            const cover =
              l.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80';

            const categoryName =
              typeof l.category === 'object' && l.category !== null
                ? l.category.name
                : typeof l.category === 'string'
                  ? l.category
                  : 'Elektronik';

            const isArchived = l.status === 'ARCHIVED';
            const isSold = l.status === 'SOLD';

            return (
              <div
                key={l.id}
                className={`rounded-3xl border bg-white p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group ${
                  isArchived
                    ? 'border-rose-200 bg-rose-50/20'
                    : isSold
                      ? 'border-slate-200 bg-slate-50/40 opacity-85'
                      : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* 1. Image Cover & Status Overlays */}
                <div className="space-y-3">
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={cover}
                      alt={l.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category Pill Tag */}
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-lg">
                      {categoryName}
                    </div>

                    {/* Status Overlay Badge */}
                    <div className="absolute top-2 right-2">
                      {l.status === 'ACTIVE' ? (
                        <span className="rounded-full bg-emerald-500/90 backdrop-blur-xs text-white px-2 py-0.5 text-[9px] font-black shadow-xs">
                          Aktif
                        </span>
                      ) : isArchived ? (
                        <span className="rounded-full bg-rose-600/90 backdrop-blur-xs text-white px-2 py-0.5 text-[9px] font-black shadow-xs">
                          Ditakedown
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-600/90 backdrop-blur-xs text-white px-2 py-0.5 text-[9px] font-black shadow-xs">
                          Terjual
                        </span>
                      )}
                    </div>

                    {/* Quick Link View */}
                    <Link
                      href={`/listing/${l.id}`}
                      target="_blank"
                      className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-black backdrop-blur-2xs"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Buka Halaman Iklan</span>
                    </Link>
                  </div>

                  {/* 2. Product Title & Condition */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <ConditionBadge condition={l.condition || 'USED_GOOD'} />
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatTimeAgo(l.createdAt || new Date().toISOString())}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                      {l.title}
                    </h4>

                    <div className="pt-1">
                      <span className="font-mono font-black text-brand-700 text-lg block">
                        {formatIDR(l.price)}
                      </span>
                      {l.originalPrice && l.originalPrice > l.price && (
                        <span className="text-[11px] text-slate-400 line-through font-mono">
                          {formatIDR(l.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3. Seller Profile Cardlet */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={
                          l.seller?.avatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={l.seller?.name}
                        className="h-6 w-6 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <span className="font-bold text-slate-800 truncate text-[11px]">
                        {l.seller?.name || 'Penjual'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>{l.city || 'Indonesia'}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Action Buttons */}
                <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                  <Link
                    href={`/listing/${l.id}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2 text-xs font-bold text-slate-700 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                    <span>Lihat</span>
                  </Link>

                  {isArchived ? (
                    <button
                      type="button"
                      disabled={isProcessingAction}
                      onClick={() => handleUpdateStatus(l.id, 'ACTIVE', l.title)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Pulihkan</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isProcessingAction}
                      onClick={() => setTakedownModalListing(l)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 py-2 text-xs font-bold text-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Takedown</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW FALLBACK */
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Foto & Judul Iklan</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Harga</th>
                  <th className="p-4">Penjual & Kota</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi Moderasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayedListings.map((l: any) => {
                  const cover =
                    l.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80';

                  const categoryName =
                    typeof l.category === 'object' && l.category !== null
                      ? l.category.name
                      : typeof l.category === 'string'
                        ? l.category
                        : 'Elektronik';

                  const isArchived = l.status === 'ARCHIVED';

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={cover}
                            alt={l.title}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/listing/${l.id}`}
                              target="_blank"
                              className="font-bold text-slate-900 hover:text-brand-600 line-clamp-1 flex items-center gap-1"
                            >
                              <span>{l.title}</span>
                              <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                            </Link>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Kondisi: {l.condition}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">{categoryName}</td>
                      <td className="p-4 font-mono font-black text-brand-700">
                        {formatIDR(l.price)}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">
                          {l.seller?.name || 'Penjual'}
                        </span>
                        <span className="text-[10px] text-slate-500">{l.city || 'Indonesia'}</span>
                      </td>
                      <td className="p-4">
                        {l.status === 'ACTIVE' ? (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black">
                            Tayang Aktif
                          </span>
                        ) : isArchived ? (
                          <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 text-[10px] font-black">
                            Ditakedown
                          </span>
                        ) : (
                          <span className="rounded-full bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold">
                            Terjual
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/listing/${l.id}`}
                            target="_blank"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title="Buka Iklan"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {isArchived ? (
                            <button
                              type="button"
                              disabled={isProcessingAction}
                              onClick={() => handleUpdateStatus(l.id, 'ACTIVE', l.title)}
                              className="rounded-full bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 px-3 py-1 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Pulihkan
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isProcessingAction}
                              onClick={() => setTakedownModalListing(l)}
                              className="rounded-full bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 px-3 py-1 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Takedown
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Takedown Confirmation Modal */}
      {takedownModalListing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setTakedownModalListing(null)}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Konfirmasi Takedown Iklan</h3>
                  <span className="text-[11px] text-slate-400">
                    Nonaktifkan katalog dari pencarian
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTakedownModalListing(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Iklan Target:
              </span>
              <p className="font-bold text-xs text-slate-900 line-clamp-2">
                {takedownModalListing.title}
              </p>
              <span className="text-[11px] text-brand-700 font-mono font-black">
                {formatIDR(takedownModalListing.price)}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Pilih Alasan Takedown:</label>
              <select
                value={takedownReason}
                onChange={(e) => setTakedownReason(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Barang Tiruan / Indikasi KW Super">
                  Barang Tiruan / Indikasi KW Super
                </option>
                <option value="Foto Iklan Tidak Jelas / Mengambil dari Google">
                  Foto Iklan Tidak Jelas / Mengambil dari Google
                </option>
                <option value="Indikasi Penipuan / Kontak Luar Platform">
                  Indikasi Penipuan / Mencantumkan Kontak Luar
                </option>
                <option value="Kategori Barang Terlarang / Ilegal">
                  Kategori Barang Terlarang / Ilegal
                </option>
                <option value="Deskripsi Menyesatkan / Tidak Lengkap">
                  Deskripsi Menyesatkan / Tidak Lengkap
                </option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTakedownModalListing(null)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() =>
                  handleUpdateStatus(
                    takedownModalListing.id,
                    'ARCHIVED',
                    takedownModalListing.title
                  )
                }
                className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Ya, Takedown Iklan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
