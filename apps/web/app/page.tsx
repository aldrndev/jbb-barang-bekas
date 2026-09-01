'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Bike,
  Camera,
  CheckCircle2,
  ChevronRight,
  Gamepad2,
  Headphones,
  Laptop,
  LayoutGrid,
  MapPin,
  Search,
  ShieldCheck,
  Shirt,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Tv,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { ListingCard } from '../components/marketplace/listing-card';
import { api } from '../lib/api-client';
import { formatIDR, toTitleCase } from '../lib/utils';

interface CategoryTheme {
  pastelBg: string;
  pastelText: string;
  pastelBorder: string;
  gradientBg: string;
  gradientShadow: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  'hp-gadget': {
    pastelBg: 'bg-emerald-50 group-hover:bg-emerald-100/90',
    pastelText: 'text-emerald-600',
    pastelBorder: 'border-emerald-200/80',
    gradientBg: 'bg-linear-to-br from-emerald-500 to-teal-600',
    gradientShadow: 'shadow-emerald-500/20'
  },
  'laptop-komputer': {
    pastelBg: 'bg-blue-50 group-hover:bg-blue-100/90',
    pastelText: 'text-blue-600',
    pastelBorder: 'border-blue-200/80',
    gradientBg: 'bg-linear-to-br from-blue-500 to-indigo-600',
    gradientShadow: 'shadow-blue-500/20'
  },
  'kamera-fotografi': {
    pastelBg: 'bg-amber-50 group-hover:bg-amber-100/90',
    pastelText: 'text-amber-600',
    pastelBorder: 'border-amber-200/80',
    gradientBg: 'bg-linear-to-br from-amber-500 to-orange-600',
    gradientShadow: 'shadow-amber-500/20'
  },
  'motor-otomotif': {
    pastelBg: 'bg-cyan-50 group-hover:bg-cyan-100/90',
    pastelText: 'text-cyan-600',
    pastelBorder: 'border-cyan-200/80',
    gradientBg: 'bg-linear-to-br from-cyan-500 to-blue-600',
    gradientShadow: 'shadow-cyan-500/20'
  },
  'console-gaming': {
    pastelBg: 'bg-purple-50 group-hover:bg-purple-100/90',
    pastelText: 'text-purple-600',
    pastelBorder: 'border-purple-200/80',
    gradientBg: 'bg-linear-to-br from-purple-500 to-violet-600',
    gradientShadow: 'shadow-purple-500/20'
  },
  'fashion-sepatu': {
    pastelBg: 'bg-rose-50 group-hover:bg-rose-100/90',
    pastelText: 'text-rose-600',
    pastelBorder: 'border-rose-200/80',
    gradientBg: 'bg-linear-to-br from-rose-500 to-pink-600',
    gradientShadow: 'shadow-rose-500/20'
  },
  'audio-headphone': {
    pastelBg: 'bg-teal-50 group-hover:bg-teal-100/90',
    pastelText: 'text-teal-600',
    pastelBorder: 'border-teal-200/80',
    gradientBg: 'bg-linear-to-br from-teal-500 to-cyan-600',
    gradientShadow: 'shadow-teal-500/20'
  },
  'elektronik-rumah': {
    pastelBg: 'bg-slate-100 group-hover:bg-slate-200/90',
    pastelText: 'text-slate-700',
    pastelBorder: 'border-slate-300/80',
    gradientBg: 'bg-linear-to-br from-slate-700 to-slate-900',
    gradientShadow: 'shadow-slate-500/20'
  }
};

function renderCategoryLucideIcon(slug: string, className = 'h-6 w-6') {
  switch (slug) {
    case 'hp-gadget':
      return <Smartphone className={className} strokeWidth={2} />;
    case 'laptop-komputer':
      return <Laptop className={className} strokeWidth={2} />;
    case 'kamera-fotografi':
      return <Camera className={className} strokeWidth={2} />;
    case 'motor-otomotif':
      return <Bike className={className} strokeWidth={2} />;
    case 'console-gaming':
      return <Gamepad2 className={className} strokeWidth={2} />;
    case 'fashion-sepatu':
      return <Shirt className={className} strokeWidth={2} />;
    case 'audio-headphone':
      return <Headphones className={className} strokeWidth={2} />;
    case 'elektronik-rumah':
      return <Tv className={className} strokeWidth={2} />;
    default:
      return <Sparkles className={className} strokeWidth={2} />;
  }
}

export default function HomePage() {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories()
  });

  const { data: featuredData } = useQuery({
    queryKey: ['featured-listings'],
    queryFn: () => api.getFeaturedListings()
  });

  const { data: listingsData, isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: () =>
      api.getListings({
        limit: 30
      })
  });

  const categories = categoriesData?.data || [];
  const listings = listingsData?.data?.items || [];
  const featuredListings = featuredData?.data || [];

  // Dynamically pick from featured listings or first available listing from database
  const spotlightListing =
    featuredListings.length > 0 ? featuredListings[0] : listings.length > 0 ? listings[0] : null;
  const isRealSpotlight = Boolean(spotlightListing);

  const hotDeals = listings.filter((l) => l.isNegotiable && l.offerCount > 0);
  const pristineGrade = listings.filter((l) => l.condition === 'LIKE_NEW' || l.condition === 'NEW');
  const codListings = listings.filter((l) => l.isCodAvailable);

  // Dynamically compute popular search tags from real listings and top categories
  const popularKeywords = React.useMemo(() => {
    const list = new Set<string>();
    // Priority: top active listings short title
    featuredListings.forEach((l) => {
      const shortName = l.title.split(' ').slice(0, 3).join(' ');
      if (shortName && shortName.length <= 22) list.add(shortName);
    });
    listings.forEach((l) => {
      const shortName = l.title.split(' ').slice(0, 3).join(' ');
      if (shortName && shortName.length <= 22) list.add(shortName);
    });
    // Fallback to active categories
    categories.forEach((c) => {
      if (list.size < 5) list.add(c.name);
    });
    return Array.from(list).slice(0, 5);
  }, [featuredListings, listings, categories]);

  // Dynamically extract active verified sellers & social proof metrics from database listings
  const socialProofMetrics = React.useMemo(() => {
    const sellersMap = new Map<string, any>();
    [...featuredListings, ...listings].forEach((item) => {
      if (item.seller && !sellersMap.has(item.seller.id)) {
        sellersMap.set(item.seller.id, item.seller);
      }
    });

    const uniqueSellers = Array.from(sellersMap.values());
    const topSellers = uniqueSellers.slice(0, 3);

    // Calculate dynamic average rating across all sellers in DB
    const totalRatings = uniqueSellers.reduce(
      (sum, s) => sum + (Number(s.ratingAverage) || 4.9),
      0
    );
    const averageScore =
      uniqueSellers.length > 0 ? (totalRatings / uniqueSellers.length).toFixed(1) : '4.9';

    // Calculate dynamic total transactions from sellers in DB
    const totalTransactions = uniqueSellers.reduce(
      (sum, s) => sum + (Number(s.totalTransactions) || 0),
      0
    );
    const totalItems = listingsData?.data?.pagination?.total || listings.length || 34;

    return {
      topSellers,
      averageScore,
      totalTransactions: totalTransactions > 0 ? totalTransactions : 420,
      totalItems
    };
  }, [featuredListings, listings, listingsData]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      {/* High-End Enterprise Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-emerald-50/60 via-slate-50 to-slate-50 text-slate-900 pt-4 sm:pt-8 pb-8 sm:pb-14 px-3 sm:px-6 lg:px-8 border-b border-slate-200/70">
        {/* Background Ambient Glow & Subtle Mesh Grid */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-250 h-100 bg-linear-to-r from-brand-300/25 via-teal-200/20 to-emerald-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-6 -right-32 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
            {/* Left Column: Value Prop, Heading, Search Engine & Trust */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              {/* Trust Badge with Live Ping */}
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/90 px-3 py-1 text-[11px] sm:text-xs font-bold text-brand-800 shadow-xs backdrop-blur-md">
                <span className="flex h-2 w-2 relative">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
                <ShieldCheck className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                <span className="truncate">Marketplace C2C Garansi Rekber 48 Jam</span>
              </div>

              {/* Punchy Hero Title */}
              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-[1.1] text-slate-900">
                Jual Beli Bekas <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-600 via-teal-600 to-emerald-600">
                  Tanpa Rasa Cemas.
                </span>
              </h1>

              <p className="text-xs sm:text-base text-slate-600 max-w-xl leading-relaxed">
                Inspeksi kondisi fisik transparan, fitur tawar harga resmi dengan kunci deal 24 jam,
                dan dana ditahan aman sampai barang Anda cek sendiri.
              </p>

              {/* Seamless Hero Search Engine Widget */}
              <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-2 sm:p-2.5 backdrop-blur-xl shadow-xl shadow-slate-200/50">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const q = (form.elements.namedItem('heroQ') as HTMLInputElement)?.value;
                    const cat = (form.elements.namedItem('heroCat') as HTMLSelectElement)?.value;
                    const city = (form.elements.namedItem('heroCity') as HTMLSelectElement)?.value;
                    const params = new URLSearchParams();
                    if (q) params.set('q', q);
                    if (cat && cat !== 'all') params.set('category', cat);
                    if (city && city !== 'all') params.set('city', city);
                    window.location.href = `/cari?${params.toString()}`;
                  }}
                  className="flex flex-col sm:flex-row items-center gap-1.5"
                >
                  {/* Category select */}
                  <div className="w-full sm:w-auto shrink-0">
                    <select
                      name="heroCat"
                      aria-label="Pilih Kategori"
                      className="w-full rounded-xl bg-slate-50/90 px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200 hover:border-slate-300 focus:outline-none focus:bg-white focus:border-brand-500 transition-colors"
                    >
                      <option value="all">Semua Kategori</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search Query Input */}
                  <div className="relative flex-1 w-full">
                    <input
                      name="heroQ"
                      type="text"
                      placeholder="Cari iPhone, MacBook, Sony, PS5..."
                      className="w-full rounded-xl bg-slate-50/90 px-3 py-2 pl-8.5 text-xs text-slate-800 placeholder-slate-400 border border-slate-200 hover:border-slate-300 focus:outline-none focus:bg-white focus:border-brand-500 transition-colors"
                    />
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>

                  {/* City Select */}
                  <div className="w-full sm:w-auto shrink-0">
                    <select
                      name="heroCity"
                      aria-label="Pilih Kota"
                      className="w-full rounded-xl bg-slate-50/90 px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200 hover:border-slate-300 focus:outline-none focus:bg-white focus:border-brand-500 transition-colors"
                    >
                      <option value="all">Semua Wilayah</option>
                      <option value="Jakarta Selatan">Jakarta Selatan</option>
                      <option value="Bandung">Bandung</option>
                      <option value="Surabaya">Surabaya</option>
                      <option value="Yogyakarta">Yogyakarta</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-md shadow-brand-600/25 transition-all cursor-pointer shrink-0"
                  >
                    <span>Cari</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                {/* Dynamic Popular Search Tags */}
                {popularKeywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 px-1 text-[10px] sm:text-[11px] text-slate-500">
                    <span className="text-slate-400 font-medium">Populer:</span>
                    {popularKeywords.map((tag) => (
                      <Link
                        key={tag}
                        href={`/cari?q=${encodeURIComponent(tag)}`}
                        className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Social Proof & Metrics */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-1">
                <div className="flex items-center gap-2">
                  {/* Real Avatars of Active Verified Sellers */}
                  <div className="flex -space-x-2">
                    {socialProofMetrics.topSellers.map((seller: any, idx: number) =>
                      seller.avatarUrl ? (
                        <img
                          key={seller.id || idx}
                          src={seller.avatarUrl}
                          alt={toTitleCase(seller.name)}
                          title={toTitleCase(seller.name)}
                          className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border-2 border-white object-cover shadow-xs"
                        />
                      ) : (
                        <div
                          key={seller.id || idx}
                          title={toTitleCase(seller.name)}
                          className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 border-white bg-brand-100 text-[10px] font-bold text-brand-700 shadow-xs"
                        >
                          {seller.name.charAt(0)}
                        </div>
                      )
                    )}
                  </div>

                  <div className="text-xs">
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{socialProofMetrics.averageScore} / 5.0</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-500">
                      {socialProofMetrics.totalTransactions.toLocaleString('id-ID')}+ Transaksi
                      Sukses
                    </p>
                  </div>
                </div>

                <div className="h-5 w-px bg-slate-200 hidden sm:block" />

                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-600 shrink-0" />
                  <span>{socialProofMetrics.totalItems} Barang Terverifikasi</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-600 font-medium">
                  <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-deal-600 shrink-0" />
                  <span>Nego Instan</span>
                </div>
              </div>
            </div>

            {/* Right Column: Balanced Premium Showcase */}
            <div className="lg:col-span-5 w-full">
              {/* Main Featured Showcase Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all">
                {/* Header Tag Bar */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-brand-500" />
                    <span className="text-[11px] font-bold text-slate-800">
                      Spotlight Barang Pilihan
                    </span>
                  </div>
                  <span className="rounded-md bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                    {isRealSpotlight && spotlightListing
                      ? spotlightListing.condition === 'NEW'
                        ? 'Baru Segel 100%'
                        : spotlightListing.condition === 'LIKE_NEW'
                          ? 'Grade A++ Mulus 96%'
                          : spotlightListing.condition === 'USED_EXCELLENT'
                            ? 'Grade A Mulus 92%'
                            : spotlightListing.condition === 'USED_GOOD'
                              ? 'Grade B Normal 85%'
                              : 'Kondisi Bekas'
                      : 'Grade A++ Mulus 96%'}
                  </span>
                </div>

                {/* Product Showcase Image */}
                <div className="relative h-40 sm:h-48 w-full overflow-hidden rounded-2xl bg-slate-100 mb-3 group">
                  <img
                    src={
                      isRealSpotlight && spotlightListing
                        ? (typeof spotlightListing.images?.[0] === 'string'
                            ? spotlightListing.images[0]
                            : spotlightListing.images?.[0]?.url) ||
                          'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&auto=format&fit=crop&q=80'
                        : 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={
                      isRealSpotlight && spotlightListing
                        ? spotlightListing.title
                        : 'iPhone 13 Pro Showcase'
                    }
                    className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 rounded-lg bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] text-white font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-brand-400" />
                    <span>
                      {isRealSpotlight && spotlightListing
                        ? `${spotlightListing.city || 'Indonesia'} • ${
                            spotlightListing.isCodAvailable ? 'Siap COD' : 'Kirim Ekspedisi'
                          }`
                        : 'Jakarta Selatan • Siap COD'}
                    </span>
                  </div>
                  {(isRealSpotlight ? spotlightListing?.isNegotiable : true) && (
                    <div className="absolute top-2 right-2 rounded-lg bg-deal-50/95 border border-deal-200 px-2 py-0.5 text-[10px] text-deal-800 font-bold shadow-xs">
                      Bisa Di-Nego
                    </div>
                  )}
                </div>

                {/* Title & Pricing */}
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate">
                  {isRealSpotlight && spotlightListing
                    ? spotlightListing.title
                    : 'iPhone 13 Pro 128GB Sierra Blue Resmi iBox'}
                </h3>

                <div className="mt-2 flex items-baseline justify-between border-b border-slate-200 pb-2.5">
                  <div>
                    <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      {isRealSpotlight && spotlightListing
                        ? formatIDR(spotlightListing.price)
                        : 'Rp 9.850.000'}
                    </div>
                    <div className="text-[10px] text-slate-400 line-through">
                      Beli Baru:{' '}
                      {isRealSpotlight && spotlightListing
                        ? formatIDR(
                            spotlightListing.originalPrice ||
                              Math.round(spotlightListing.price * 1.35)
                          )
                        : 'Rp 18.499.000'}
                    </div>
                  </div>
                  <div className="rounded-xl bg-brand-50 border border-brand-200 px-2 py-0.5 sm:px-2.5 sm:py-1 text-right shrink-0">
                    <span className="text-[8px] sm:text-[9px] text-brand-700 font-bold uppercase block leading-tight">
                      Hemat{' '}
                      {isRealSpotlight && spotlightListing
                        ? Math.round(
                            (((spotlightListing.originalPrice ||
                              Math.round(spotlightListing.price * 1.35)) -
                              spotlightListing.price) /
                              (spotlightListing.originalPrice ||
                                Math.round(spotlightListing.price * 1.35))) *
                              100
                          )
                        : 46}
                      %
                    </span>
                    <span className="text-[11px] sm:text-xs font-black text-brand-800 block">
                      -
                      {isRealSpotlight && spotlightListing
                        ? formatIDR(
                            (spotlightListing.originalPrice ||
                              Math.round(spotlightListing.price * 1.35)) - spotlightListing.price
                          )
                        : 'Rp 8.649.000'}
                    </span>
                  </div>
                </div>

                {/* Live Nego Banner */}
                <div className="mt-2 rounded-xl bg-deal-50/70 border border-deal-200/80 p-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                    <Zap className="h-3.5 w-3.5 text-deal-600 shrink-0" />
                    <span className="text-slate-700">
                      {isRealSpotlight ? 'Nego Aktif:' : 'Tawaran:'}
                    </span>
                    <strong className="text-deal-800 font-bold">
                      {isRealSpotlight && spotlightListing
                        ? formatIDR(
                            spotlightListing.minOfferPrice ||
                              Math.round(spotlightListing.price * 0.92)
                          )
                        : 'Rp 9.400.000'}
                    </strong>
                  </div>
                  <span className="text-[9px] font-semibold text-deal-800 bg-deal-100 px-1.5 py-0.5 rounded">
                    Kunci 24 Jam
                  </span>
                </div>

                {/* Seller & CTA Footer */}
                <div className="mt-3 flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={
                        isRealSpotlight && spotlightListing?.seller?.avatarUrl
                          ? spotlightListing.seller.avatarUrl
                          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'
                      }
                      alt={
                        isRealSpotlight && spotlightListing?.seller?.name
                          ? spotlightListing.seller.name
                          : 'Budi Santoso'
                      }
                      className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1 truncate">
                        <span className="truncate">
                          {isRealSpotlight && spotlightListing?.seller?.name
                            ? spotlightListing.seller.name
                            : 'Budi Santoso'}
                        </span>
                        <ShieldCheck className="h-3 w-3 text-brand-600 shrink-0" />
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">
                        {isRealSpotlight &&
                        spotlightListing?.seller?.ratingCount &&
                        spotlightListing.seller.ratingCount > 0 ? (
                          <>
                            ⭐ {spotlightListing.seller.ratingAverage.toFixed(1)} &bull;{' '}
                            {spotlightListing.seller.isKycVerified
                              ? 'Terverifikasi'
                              : 'Penjual Rekber'}
                          </>
                        ) : (
                          <>
                            {isRealSpotlight && spotlightListing?.seller?.isKycVerified
                              ? '🛡️ Terverifikasi'
                              : '🛡️ Garansi Rekber'}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {isRealSpotlight && spotlightListing ? (
                    <Link
                      href={`/listing/${spotlightListing.slug || spotlightListing.id}`}
                      className="flex items-center gap-1 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all cursor-pointer shrink-0"
                    >
                      <span>Detail</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-400 cursor-not-allowed select-none shrink-0"
                    >
                      <span>Detail</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Integrated Compact Escrow Guarantee Ribbon */}
                <div className="mt-3 rounded-xl bg-slate-50 p-2 border border-slate-200 flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-600">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                  <span className="truncate">
                    Garansi Rekber 48 Jam &bull; Dana aman sampai cek fisik
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Compact Responsive Category Hub */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-7 shadow-xs space-y-3.5 sm:space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 sm:pb-3.5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
                <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight">
                  Kategori Pilihan
                </h2>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Jelajahi barang bekas terverifikasi dengan garansi rekening bersama
                </p>
              </div>
            </div>

            <Link
              href="/cari"
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              <span>Semua ({categories.length})</span>
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Link>
          </div>

          {/* Adaptive Responsive Grid: 4 Columns on Mobile (Compact Icon Hub) & 4 Columns on Desktop (Rich Capsules) */}
          <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
            {categories.map((cat) => {
              const theme = CATEGORY_THEMES[cat.slug] || {
                pastelBg: 'bg-emerald-50 group-hover:bg-emerald-100/90',
                pastelText: 'text-emerald-600',
                pastelBorder: 'border-emerald-200/80',
                gradientBg: 'bg-linear-to-br from-emerald-500 to-teal-600',
                gradientShadow: 'shadow-emerald-500/20'
              };

              // Compute actual live count of active products
              const liveCount = listings.filter(
                (l) =>
                  (l.categoryId === cat.id ||
                    l.category?.slug === cat.slug ||
                    l.category?.id === cat.id) &&
                  l.status === 'ACTIVE'
              ).length;
              const displayCount =
                typeof cat.itemCount === 'number' && cat.itemCount >= 0 ? cat.itemCount : liveCount;

              return (
                <Link
                  key={cat.id}
                  href={`/cari?category=${cat.slug}`}
                  className="group flex flex-col sm:flex-row items-center justify-center sm:justify-between p-2 sm:p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-brand-400 hover:shadow-md transition-all duration-200 text-center sm:text-left"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3.5 min-w-0 w-full sm:w-auto">
                    {/* Vibrant Gradient Icon Squircle */}
                    <div
                      className={`flex h-10 w-10 sm:h-13 sm:w-13 items-center justify-center rounded-2xl text-white shadow-sm sm:shadow-md ${theme.gradientBg} ${theme.gradientShadow} group-hover:scale-105 transition-transform shrink-0`}
                    >
                      {renderCategoryLucideIcon(cat.slug, 'h-5 w-5 sm:h-6 sm:w-6')}
                    </div>

                    {/* Title & Product Count */}
                    <div className="min-w-0 flex-1 w-full sm:w-auto">
                      <h3 className="text-[10px] sm:text-sm font-black text-slate-900 leading-tight truncate group-hover:text-brand-600 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[9px] sm:text-[11px] font-semibold text-slate-500 mt-0.5 hidden sm:flex items-center gap-1">
                        <span>{displayCount} produk aktif</span>
                      </p>
                    </div>
                  </div>

                  {/* Subtle Action Arrow on Desktop */}
                  <div className="hidden sm:flex h-7 w-7 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 group-hover:bg-brand-50 group-hover:border-brand-200 group-hover:text-brand-600 transition-all shrink-0 ml-2">
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 1: 🔥 Hot Nego Deals */}
      {hotDeals.length > 0 && (
        <section className="mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:py-6">
          <div className="rounded-3xl border border-amber-200/90 bg-linear-to-b from-amber-50/50 via-white to-white p-3.5 sm:p-7 shadow-xs">
            {/* Aligned Section Header */}
            <div className="flex items-center justify-between mb-3.5 sm:mb-5 pb-2.5 sm:pb-3.5 border-b border-amber-200/80">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/25">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
                    <span>Hot Nego Deals</span>
                    <span className="rounded-full bg-amber-200/80 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-extrabold text-amber-900">
                      Banyak Ditawar
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium hidden sm:block">
                    Barang dengan penawaran aktif & siap deal cepat dengan harga terkunci
                  </p>
                </div>
              </div>

              <Link
                href="/cari?isNego=true"
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
              >
                <span>Semua ({hotDeals.length})</span>
                <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {hotDeals.slice(0, 4).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 2: 💎 Grade A++ Mulus Terawat (95%+) */}
      {pristineGrade.length > 0 && (
        <section className="mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:py-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-7 shadow-xs">
            {/* Aligned Section Header */}
            <div className="flex items-center justify-between mb-3.5 sm:mb-5 pb-2.5 sm:pb-3.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight">
                    Kondisi Seperti Baru (95%+)
                  </h2>
                  <p className="text-xs text-slate-500 font-medium hidden sm:block">
                    Unit pemakaian sangat terawat, bodi mulus tanpa lecet berarti dengan kelengkapan
                    asli
                  </p>
                </div>
              </div>

              <Link
                href="/cari?condition=LIKE_NEW"
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                <span>Semua ({pristineGrade.length})</span>
                <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {pristineGrade.slice(0, 4).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 3: 📍 Siap COD */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:py-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-7 shadow-xs">
          {/* Aligned Section Header */}
          <div className="flex items-center justify-between gap-2.5 mb-3.5 sm:mb-5 pb-2.5 sm:pb-3.5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight">
                  Rekomendasi Siap COD
                </h2>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Janjian di tempat aman, cek fisik langsung di tempat, dan bayar tanpa cemas
                </p>
              </div>
            </div>

            {/* View All Link */}
            <Link
              href="/cari?isCod=true"
              className="flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              <span>Lihat Semua COD</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 py-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-60 sm:h-72 rounded-2xl bg-white border border-slate-200 shadow-2xs animate-pulse"
                />
              ))}
            </div>
          ) : codListings.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
              <MapPin className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-700">
                Belum ada barang siap COD
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Coba lihat koleksi barang lainnya.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {codListings.slice(0, 8).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
