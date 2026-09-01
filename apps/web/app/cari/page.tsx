'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Filter, Loader2, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, Suspense } from 'react';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';
import { ListingCard } from '../../components/marketplace/listing-card';
import { api } from '../../lib/api-client';

function CariContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryQ = searchParams.get('q') || '';
  const queryCategory = searchParams.get('category') || '';
  const queryCity = searchParams.get('city') || '';
  const queryIsCod = searchParams.get('isCod') === 'true';
  const queryIsNego = searchParams.get('isNego') === 'true';
  const querySort =
    (searchParams.get('sortBy') as 'newest' | 'price_asc' | 'price_desc' | 'popular') || 'newest';

  const [q, setQ] = useState(queryQ);
  const [category, setCategory] = useState(queryCategory);
  const [condition, setCondition] = useState<string>(searchParams.get('condition') || 'all');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [city, setCity] = useState(queryCity);
  const [isCod, setIsCod] = useState(queryIsCod);
  const [isNego, setIsNego] = useState(queryIsNego);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>(
    querySort
  );
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories()
  });

  const categories = categoriesData?.data || [];

  const {
    data: listingsData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage
  } = useInfiniteQuery({
    queryKey: [
      'listings',
      'infinite',
      { q, category, condition, minPrice, maxPrice, city, isCod, isNego, sortBy }
    ],
    queryFn: ({ pageParam }) =>
      api.getListings({
        q: q.trim() || undefined,
        category: category === 'all' || !category ? undefined : category,
        condition: condition === 'all' ? undefined : condition,
        minPrice,
        maxPrice,
        city: city === 'all' || !city ? undefined : city,
        isCod: isCod ? true : undefined,
        isNego: isNego ? true : undefined,
        sortBy,
        limit: 12,
        cursor: (pageParam as string) || undefined
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      return pagination?.hasMore && pagination?.nextCursor ? pagination.nextCursor : undefined;
    }
  });

  const allPages = listingsData?.pages || [];
  const listings = allPages.flatMap((page) => page?.data?.items || []);
  const total = allPages[0]?.data?.pagination?.total ?? 0;

  // Automatic Infinite Scroll Sentinel
  const loadMoreRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: '250px' }
    );

    const currentEl = loadMoreRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) observer.unobserve(currentEl);
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const activeCategory = categories.find((c) => c.slug === category || c.id === category);
  const activeCategoryName =
    activeCategory?.name ||
    (category && category !== 'all'
      ? category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      : null);

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            {
              label: 'Katalog Barang',
              href: (category && category !== 'all') || q ? '/cari' : undefined
            },
            ...(activeCategoryName && category !== 'all'
              ? [{ label: activeCategoryName, href: q ? `/cari?category=${category}` : undefined }]
              : []),
            ...(q ? [{ label: `Hasil: "${q}"` }] : [])
          ]}
          className="mb-4"
        />

        {/* Search header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {activeCategoryName && category !== 'all'
                ? activeCategoryName
                : 'Eksplor Barang Bekas'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Menampilkan {total} barang bekas{' '}
              {activeCategoryName && category !== 'all'
                ? `kategori ${activeCategoryName}`
                : 'terverifikasi siap transaksi'}
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Cari kata kunci..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 pl-9 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            {q && (
              <button
                onClick={() => setQ('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sticky Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs max-h-[calc(100vh-6rem)] overflow-y-auto hide-scrollbar">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Filter className="h-4 w-4 text-emerald-600" />
                  <span>Filter Pencarian</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQ('');
                    setCategory('all');
                    setCondition('all');
                    setMinPrice(undefined);
                    setMaxPrice(undefined);
                    setCity('all');
                    setIsCod(false);
                    setIsNego(false);
                  }}
                  className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* Sort by */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Urutkan Berdasarkan
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800 focus:border-brand-500 focus:outline-none"
                >
                  <option value="newest">Barang Paling Baru</option>
                  <option value="popular">Paling Populer & Banyak Nego</option>
                  <option value="price_asc">Harga Terendah</option>
                  <option value="price_desc">Harga Tertinggi</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800 focus:border-brand-500 focus:outline-none"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Kondisi Fisik
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800 focus:border-brand-500 focus:outline-none"
                >
                  <option value="all">Semua Kondisi</option>
                  <option value="NEW">Baru (Segel / BNOB)</option>
                  <option value="LIKE_NEW">Seperti Baru (95%+)</option>
                  <option value="USED_EXCELLENT">Bekas Mulus (85%+)</option>
                  <option value="USED_GOOD">Bekas Wajar (70%+)</option>
                  <option value="USED_FAIR">Ada Minus</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Rentang Harga (Rp)
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Harga Minimum"
                    value={minPrice || ''}
                    onChange={(e) =>
                      setMinPrice(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Harga Maksimum"
                    value={maxPrice || ''}
                    onChange={(e) =>
                      setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Wilayah Kota
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800 focus:border-brand-500 focus:outline-none"
                >
                  <option value="all">Semua Wilayah</option>
                  <option value="Jakarta Selatan">Jakarta Selatan</option>
                  <option value="Jakarta Pusat">Jakarta Pusat</option>
                  <option value="Jakarta Barat">Jakarta Barat</option>
                  <option value="Jakarta Timur">Jakarta Timur</option>
                  <option value="Jakarta Utara">Jakarta Utara</option>
                  <option value="Kota Bandung">Kota Bandung</option>
                  <option value="Kota Surabaya">Kota Surabaya</option>
                  <option value="Kota Tangerang Selatan">Kota Tangerang Selatan</option>
                  <option value="Kota Bekasi">Kota Bekasi</option>
                  <option value="Kota Depok">Kota Depok</option>
                  <option value="Kota Medan">Kota Medan</option>
                  <option value="Kota Semarang">Kota Semarang</option>
                  <option value="Kota Yogyakarta">Kota Yogyakarta</option>
                  <option value="Kota Denpasar">Kota Denpasar</option>
                  <option value="Kota Makassar">Kota Makassar</option>
                  <option value="Malang">Malang</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCod}
                    onChange={(e) => setIsCod(e.target.checked)}
                    className="h-4 w-4 accent-emerald-600 rounded"
                  />
                  <span>Hanya yang Siap COD</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNego}
                    onChange={(e) => setIsNego(e.target.checked)}
                    className="h-4 w-4 accent-emerald-600 rounded"
                  />
                  <span>Hanya yang Bisa Di-Nego</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Right Results Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-72 rounded-3xl bg-white border border-slate-200 shadow-2xs"
                  />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                <Search className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                <h3 className="text-base font-bold text-slate-800">Tidak ada barang yang cocok</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Coba ubah kata kunci atau longgarkan filter pencarian Anda.
                </p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Automatic Infinite Scroll Sentinel & Status */}
                <div
                  ref={loadMoreRef}
                  className="mt-8 pt-6 border-t border-slate-200 text-center min-h-15 flex items-center justify-center"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat barang berikutnya secara otomatis...</span>
                    </div>
                  ) : hasNextPage ? (
                    <div className="text-[11px] font-medium text-slate-400">
                      Scroll ke bawah untuk memuat barang lainnya ({listings.length} dari {total}{' '}
                      barang)
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-slate-400">
                      🎉 Anda telah melihat seluruh {total} barang dalam katalog ini
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CariPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 py-12 text-center text-xs text-slate-400">
          Memuat pencarian...
        </div>
      }
    >
      <CariContent />
    </Suspense>
  );
}
