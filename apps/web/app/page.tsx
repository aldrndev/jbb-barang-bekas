'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import { ListingCard } from '../components/marketplace/listing-card';
import {
  ShieldCheck,
  Sparkles,
  Zap,
  TrendingUp,
  Smartphone,
  Laptop,
  Camera,
  Bike,
  Gamepad2,
  Shirt,
  Headphones,
  Tv,
  ArrowRight,
  MapPin,
  CheckCircle2,
  MessageSquareQuote,
  Search,
  Star
} from 'lucide-react';

const categoryIconMap: Record<string, React.ReactNode> = {
  'hp-gadget': <Smartphone className="h-5 w-5" />,
  'laptop-komputer': <Laptop className="h-5 w-5" />,
  'kamera-fotografi': <Camera className="h-5 w-5" />,
  'motor-otomotif': <Bike className="h-5 w-5" />,
  'console-gaming': <Gamepad2 className="h-5 w-5" />,
  'fashion-sepatu': <Shirt className="h-5 w-5" />,
  'audio-headphone': <Headphones className="h-5 w-5" />,
  'elektronik-rumah': <Tv className="h-5 w-5" />
};

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState('Semua');

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories()
  });

  const { data: listingsData, isLoading } = useQuery({
    queryKey: ['listings', selectedCity],
    queryFn: () =>
      api.getListings({
        city: selectedCity === 'Semua' ? undefined : selectedCity,
        limit: 12
      })
  });

  const categories = categoriesData?.data || [];
  const listings = listingsData?.data?.items || [];

  const hotDeals = listings.filter((l) => l.isNegotiable && l.offerCount > 0);
  const pristineGrade = listings.filter((l) => l.condition === 'LIKE_NEW' || l.condition === 'NEW');
  const codListings = listings.filter((l) => l.isCodAvailable);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* High-End Enterprise Hero Section (Clean Light Canvas) */}
      <section className="relative overflow-hidden bg-linear-to-b from-emerald-50/60 via-slate-50 to-slate-50 text-slate-900 pt-8 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-200/70">
        {/* Background Ambient Glow & Subtle Mesh Grid */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-250 h-100 bg-linear-to-r from-brand-300/25 via-teal-200/20 to-emerald-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-6 -right-32 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Value Prop, Heading, Search Engine & Trust */}
            <div className="lg:col-span-7 space-y-6">
              {/* Trust Badge with Live Ping */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-brand-200 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-brand-800 shadow-xs backdrop-blur-md">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                <span>Marketplace C2C dengan Garansi Rekber 48 Jam</span>
              </div>

              {/* Punchy Hero Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900">
                Jual Beli Bekas <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-600 via-teal-600 to-emerald-600">
                  Tanpa Rasa Cemas.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                Inspeksi kondisi fisik transparan, fitur tawar harga resmi dengan kunci deal 24 jam, dan dana ditahan aman sampai barang Anda cek sendiri.
              </p>

              {/* Seamless Hero Search Engine Widget */}
              <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-2.5 backdrop-blur-xl shadow-xl shadow-slate-200/50">
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
                      className="w-full rounded-xl bg-slate-50/90 px-3 py-2.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:border-slate-300 focus:outline-none focus:bg-white focus:border-brand-500 transition-colors"
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
                      placeholder="Cari iPhone, MacBook M1, Sony A6400, PS5..."
                      className="w-full rounded-xl bg-slate-50/90 px-3 py-2.5 pl-9 text-xs text-slate-800 placeholder-slate-400 border border-slate-200 hover:border-slate-300 focus:outline-none focus:bg-white focus:border-brand-500 transition-colors"
                    />
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  </div>

                  {/* City Select */}
                  <div className="w-full sm:w-auto shrink-0">
                    <select
                      name="heroCity"
                      aria-label="Pilih Kota"
                      className="w-full rounded-xl bg-slate-50/90 px-3 py-2.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:border-slate-300 focus:outline-none focus:bg-white focus:border-brand-500 transition-colors"
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
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-700 shadow-md shadow-brand-600/25 transition-all cursor-pointer shrink-0"
                  >
                    <span>Cari</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                {/* Popular Search Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2.5 px-2 text-[11px] text-slate-500">
                  <span className="text-slate-400 font-medium">Populer:</span>
                  {['iPhone 13 Pro', 'MacBook M1', 'Sony A6400', 'PS5 Digital', 'Nike Dunk Panda'].map((tag) => (
                    <Link
                      key={tag}
                      href={`/cari?q=${encodeURIComponent(tag)}`}
                      className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Social Proof & Metrics */}
              <div className="flex flex-wrap items-center gap-6 pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                      alt="User 1"
                      className="h-7 w-7 rounded-full border-2 border-white object-cover shadow-xs"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                      alt="User 2"
                      className="h-7 w-7 rounded-full border-2 border-white object-cover shadow-xs"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80"
                      alt="User 3"
                      className="h-7 w-7 rounded-full border-2 border-white object-cover shadow-xs"
                    />
                  </div>
                  <div className="text-xs">
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>4.9 / 5.0</span>
                    </div>
                    <p className="text-[10px] text-slate-500">12.000+ Transaksi Sukses</p>
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-brand-600" />
                  <span>0% Penipuan dengan Rekber</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <Zap className="h-4 w-4 text-deal-600" />
                  <span>Nego Instan Terkunci 24 Jam</span>
                </div>
              </div>
            </div>

            {/* Right Column: Balanced Premium Showcase & Live Trust Metrics */}
            <div className="lg:col-span-5 space-y-3.5 mt-6 lg:mt-0 w-full">
              {/* Main Featured Showcase Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all">
                {/* Header Tag Bar */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-800">Spotlight Barang Pilihan</span>
                  </div>
                  <span className="rounded-md bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                    Grade A++ Mulus 96%
                  </span>
                </div>

                {/* Product Showcase Image */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 mb-3 group">
                  <img
                    src="https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&auto=format&fit=crop&q=80"
                    alt="iPhone 13 Pro Showcase"
                    className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 rounded-lg bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] text-white font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-brand-400" />
                    <span>Jakarta Selatan &bull; Siap COD</span>
                  </div>
                  <div className="absolute top-2 right-2 rounded-lg bg-deal-50/95 border border-deal-200 px-2 py-0.5 text-[10px] text-deal-800 font-bold shadow-xs">
                    Bisa Di-Nego
                  </div>
                </div>

                {/* Title & Pricing */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  iPhone 13 Pro 128GB Sierra Blue Resmi iBox
                </h3>

                <div className="mt-2 flex items-baseline justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="text-lg font-black text-slate-900 tracking-tight">
                      Rp 9.850.000
                    </div>
                    <div className="text-[10px] text-slate-400 line-through">
                      Beli Baru: Rp 18.499.000
                    </div>
                  </div>
                  <div className="rounded-lg bg-brand-50 border border-brand-200 px-2 py-0.5 text-right">
                    <span className="text-[9px] text-brand-700 font-bold uppercase block leading-tight">
                      Hemat 46%
                    </span>
                    <span className="text-xs font-extrabold text-brand-800">
                      -Rp 8.649.000
                    </span>
                  </div>
                </div>

                {/* Live Nego Banner */}
                <div className="mt-2.5 rounded-xl bg-deal-50/70 border border-deal-200/80 p-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Zap className="h-3.5 w-3.5 text-deal-600 shrink-0" />
                    <span className="text-slate-700">Tawaran Disetujui:</span>
                    <strong className="text-deal-800 font-bold">Rp 9.400.000</strong>
                  </div>
                  <span className="text-[9px] font-semibold text-deal-800 bg-deal-100 px-2 py-0.5 rounded">
                    Kunci 24 Jam
                  </span>
                </div>

                {/* Seller & CTA Footer */}
                <div className="mt-3 flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                      alt="Budi Santoso"
                      className="h-7 w-7 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <span>Budi Santoso</span>
                        <ShieldCheck className="h-3 w-3 text-brand-600" />
                      </div>
                      <div className="text-[10px] text-slate-500">⭐ 4.9 &bull; Trust: 98%</div>
                    </div>
                  </div>

                  <Link
                    href="/listing/iphone-13-pro-128gb-sierra-blue-resmi-ibox-mulus-96"
                    className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all cursor-pointer"
                  >
                    <span>Lihat Detail</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Supporting Live Escrow Security Pill */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900">Garansi Rekber 48 Jam Bebas Cemas</div>
                    <div className="text-[10px] text-slate-500">Dana ditahan aman sampai Anda selesai cek fisik & fungsi barang.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Compact Category Icon Hub Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Kategori Pilihan
                </h2>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Jelajahi barang bekas terverifikasi dengan garansi rekening bersama
                </p>
              </div>
            </div>

            <Link
              href="/cari"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              <span>Lihat Semua ({categories.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Compact Icon + Label Grid (4 cols on mobile, 8 cols on desktop) */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
            {categories.map((cat) => {
              const themeConfig: Record<
                string,
                {
                  iconBg: string;
                }
              > = {
                'hp-gadget': {
                  iconBg: 'bg-linear-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25'
                },
                'laptop-komputer': {
                  iconBg: 'bg-linear-to-br from-blue-500 to-indigo-600 shadow-blue-500/25'
                },
                'kamera-fotografi': {
                  iconBg: 'bg-linear-to-br from-amber-500 to-orange-600 shadow-amber-500/25'
                },
                'motor-otomotif': {
                  iconBg: 'bg-linear-to-br from-cyan-500 to-blue-600 shadow-cyan-500/25'
                },
                'console-gaming': {
                  iconBg: 'bg-linear-to-br from-purple-500 to-violet-600 shadow-purple-500/25'
                },
                'fashion-sepatu': {
                  iconBg: 'bg-linear-to-br from-rose-500 to-pink-600 shadow-rose-500/25'
                },
                'audio-headphone': {
                  iconBg: 'bg-linear-to-br from-teal-500 to-cyan-600 shadow-teal-500/25'
                },
                'elektronik-rumah': {
                  iconBg: 'bg-linear-to-br from-slate-600 to-slate-800 shadow-slate-500/25'
                }
              };

              const conf = themeConfig[cat.slug] || {
                iconBg: 'bg-linear-to-br from-emerald-600 to-teal-700 shadow-emerald-500/25'
              };

              return (
                <Link
                  key={cat.id}
                  href={`/cari?category=${cat.slug}`}
                  className="group flex flex-col items-center text-center p-2 sm:p-2.5 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-2xl text-white shadow-md ${conf.iconBg} group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300`}
                  >
                    {categoryIconMap[cat.slug] || <Sparkles className="h-6 w-6" />}
                  </div>

                  <span className="mt-2.5 text-xs font-bold text-slate-800 text-center line-clamp-1 group-hover:text-brand-600 transition-colors">
                    {cat.name}
                  </span>

                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    {cat.itemCount}+ unit
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 1: 🔥 Hot Nego Deals */}
      {hotDeals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <div className="rounded-3xl bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 p-6 border border-amber-200/60">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>Hot Nego Deals</span>
                    <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                      Banyak Ditawar
                    </span>
                  </h2>
                  <p className="text-xs text-slate-600">Barang dengan penawaran aktif & siap deal cepat</p>
                </div>
              </div>
              <Link href="/cari?isNego=true" className="text-xs font-bold text-amber-700 hover:underline hidden sm:block">
                Lihat Semua Nego &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {hotDeals.slice(0, 4).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 2: 💎 Grade A++ Mulus Terawat (95%+) */}
      {pristineGrade.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Kondisi Seperti Baru (95%+)
                </h2>
                <p className="text-xs text-slate-500">
                  Unit pemakaian sangat terawat, bodi mulus tanpa lecet berarti
                </p>
              </div>
            </div>
            <Link href="/cari?condition=LIKE_NEW" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              Lihat Kategori Mulus &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pristineGrade.slice(0, 4).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Section 3: 📍 Siap COD Terdekat */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Rekomendasi Siap COD (Ketemuan Langsung)
              </h2>
              <p className="text-xs text-slate-500">
                Janjian di tempat aman, cek fisik di tempat, bayar tanpa cemas
              </p>
            </div>
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {['Semua', 'Jakarta Selatan', 'Bandung', 'Surabaya', 'Yogyakarta'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`rounded-xl px-3 py-1 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCity === city
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-slate-200/60 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <MapPin className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Belum ada barang di wilayah {selectedCity}</h3>
            <p className="text-xs text-slate-400 mt-1">Coba ganti filter wilayah ke Semua Wilayah.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.slice(0, 8).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
