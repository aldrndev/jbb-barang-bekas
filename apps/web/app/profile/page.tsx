'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useAuth } from '../../context/auth-context';
import { useWishlist } from '../../context/wishlist-context';
import { formatIDR } from '../../lib/utils';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';
import {
  User,
  ShieldCheck,
  BadgeCheck,
  Star,
  ShoppingBag,
  Heart,
  MessageSquareText,
  Plus,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Edit3,
  CheckCircle2,
  Lock,
  Building,
  CreditCard,
  Package,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

export default function ProfilePage() {
  const { user, openAuthModal, logout, login } = useAuth();
  const { wishlistCount } = useWishlist();

  const { data: myListings = [] } = useQuery({
    queryKey: ['my-listings'],
    queryFn: async () => {
      const res = await api.getMyListings();
      if (res.success && res.data) return res.data;
      return [];
    },
    enabled: !!user
  });

  const [activeTab, setActiveTab] = useState<'biodata' | 'security' | 'listings' | 'reputation'>('biodata');

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '081234567890');
  const [city, setCity] = useState(user?.city || 'Jakarta Selatan');
  const [province, setProvince] = useState(user?.province || 'DKI Jakarta');
  const [bio, setBio] = useState(user?.bio || 'Penggemar gadget & teknologi. Semua barang pemakaian pribadi dan sangat terawat.');
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [copiedRekening, setCopiedRekening] = useState(false);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.city) setCity(user.city);
      if (user.province) setProvince(user.province);
      if (user.bio) setBio(user.bio);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xs space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 border border-brand-100">
            <User className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">Masuk ke Akun Anda</h2>
            <p className="text-xs text-slate-500">
              Silakan masuk atau daftar untuk mengelola profil, melihat riwayat pesanan, dan iklan Anda.
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updatedUser = {
        ...user,
        name,
        phone,
        city,
        province,
        bio
      };
      const token = localStorage.getItem('jbb_auth_token') || 'demo_token';
      login(token, updatedUser);
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 3000);
    }
  };

  const handleCopyRekening = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText('8271029384');
      setCopiedRekening(true);
      setTimeout(() => setCopiedRekening(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-3 sm:py-6 px-3.5 sm:px-6 lg:px-8 pb-16">
      <div className="mx-auto max-w-5xl space-y-4 sm:space-y-5">
        {/* Top Breadcrumb & Demo Switcher */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <Breadcrumbs items={[{ label: 'Profil Saya' }]} />

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                login('buyer_token', {
                  id: 'user_1',
                  name: 'Dimas Aditya (Pembeli)',
                  email: 'dimas@example.com',
                  role: 'BUYER',
                  isKycVerified: true,
                  isPhoneVerified: true,
                  phone: '081234567890',
                  city: 'Jakarta Selatan',
                  province: 'DKI Jakarta',
                  trustScore: 94,
                  ratingAverage: 5.0,
                  ratingCount: 14,
                  totalTransactions: 9,
                  bio: 'Pembeli aktif gadget & fashion terverifikasi Rekber.',
                  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                  createdAt: '2024-01-15T08:00:00Z'
                });
              }}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold border transition-colors cursor-pointer ${
                user?.role === 'BUYER'
                  ? 'bg-brand-50 border-brand-300 text-brand-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Demo Pembeli
            </button>
            <button
              onClick={() => {
                login('seller_token', {
                  id: 'user_seller',
                  name: 'Budi Santoso (Penjual)',
                  email: 'budi@example.com',
                  role: 'SELLER',
                  isKycVerified: true,
                  isPhoneVerified: true,
                  phone: '081987654321',
                  city: 'Jakarta Barat',
                  province: 'DKI Jakarta',
                  trustScore: 92,
                  ratingAverage: 4.9,
                  ratingCount: 28,
                  totalTransactions: 35,
                  bio: 'Penjual spesialis laptop & kamera bekas terawat tangan pertama.',
                  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                  createdAt: '2023-11-20T08:00:00Z'
                });
              }}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold border transition-colors cursor-pointer ${
                user?.role === 'SELLER'
                  ? 'bg-brand-50 border-brand-300 text-brand-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Demo Penjual
            </button>
          </div>
        </div>

        {/* 1. Profile Hero Card (Mobile-Optimized) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-7 shadow-xs relative overflow-hidden space-y-4">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-50 blur-3xl pointer-events-none" />

          {/* User Header Row */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-5">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl object-cover ring-2 ring-slate-100 shrink-0 shadow-sm"
                />
              ) : (
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-brand-100 text-xl sm:text-2xl font-black text-brand-700 ring-2 ring-brand-50 shrink-0 shadow-sm">
                  {user.name.charAt(0)}
                </div>
              )}

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-base sm:text-xl font-black text-slate-900 truncate">{user.name}</h1>
                  {user.isKycVerified && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-50 border border-brand-200 px-2 py-0.2 text-[9px] sm:text-[10px] font-extrabold text-brand-800">
                      <BadgeCheck className="h-3 w-3 text-brand-600" />
                      <span>KTP Terverifikasi</span>
                    </span>
                  )}
                </div>

                <p className="text-[11px] sm:text-xs text-slate-500 font-medium flex items-center gap-1.5 truncate">
                  <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                  <span>&bull;</span>
                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="truncate">{user.city || 'Indonesia'}</span>
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-0.5 flex-wrap">
                  <div className="flex items-center gap-0.5 font-bold text-amber-600">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{user.ratingAverage || 5.0}</span>
                    <span className="text-slate-400 font-normal">({user.ratingCount || 12})</span>
                  </div>
                  <span>&bull;</span>
                  <span className="font-semibold">{user.totalTransactions || 8} Transaksi</span>
                  <span>&bull;</span>
                  <span className="font-black text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.2 rounded-md text-[10px]">
                    Trust {user.trustScore || 92}%
                  </span>
                </div>
              </div>
            </div>

            {/* Logout button on header */}
            <button
              type="button"
              onClick={logout}
              className="self-end sm:self-auto flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>

          {/* 2. Quick Action Grid (4-Item E-Commerce Style) */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <Link
              href="/orders"
              className="flex items-center gap-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 p-3 border border-slate-200/80 transition-all group cursor-pointer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingBag className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">Pesanan Saya</span>
                <span className="text-[10px] text-slate-500 block truncate">Status Rekber</span>
              </div>
            </Link>

            <Link
              href="/wishlist"
              className="flex items-center gap-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 p-3 border border-slate-200/80 transition-all group cursor-pointer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0 group-hover:scale-105 transition-transform">
                <Heart className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">Wishlist</span>
                <span className="text-[10px] text-slate-500 block truncate">{wishlistCount} Tersimpan</span>
              </div>
            </Link>

            <Link
              href="/nego"
              className="flex items-center gap-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 p-3 border border-slate-200/80 transition-all group cursor-pointer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquareText className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">Tawaran Nego</span>
                <span className="text-[10px] text-slate-500 block truncate">Cek Penawaran</span>
              </div>
            </Link>

            <Link
              href="/jual"
              className="flex items-center gap-2.5 rounded-2xl bg-brand-50 hover:bg-brand-100 p-3 border border-brand-200 transition-all group cursor-pointer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Plus className="h-4.5 w-4.5 stroke-3" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-brand-950 block truncate">Jual Barang</span>
                <span className="text-[10px] text-brand-700 block truncate">Pasang Iklan</span>
              </div>
            </Link>
          </div>
        </div>

        {/* 3. Tab Navigation Controls (Mobile Scrollable Pills) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('biodata')}
            className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'biodata'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Biodata & Kontak</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-brand-500" />
            <span>KYC & Rekening</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'listings'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Package className="h-3.5 w-3.5 text-blue-500" />
            <span>Iklan Saya ({myListings.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reputation')}
            className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'reputation'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Star className="h-3.5 w-3.5 text-amber-500" />
            <span>Ulasan & Reputasi</span>
          </button>
        </div>

        {/* Tab 1: Biodata & Kontak Form */}
        {activeTab === 'biodata' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">Biodata Pengguna</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Kelola identitas publik dan kontak WhatsApp Anda.</p>
              </div>
              {isSavedToast && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 animate-in fade-in">
                  ✓ Tersimpan
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-brand-500 focus:outline-none bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Terdaftar</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-500 bg-slate-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp Aktif</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    required
                    className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-brand-500 focus:outline-none bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Domisili</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Jakarta Selatan"
                    className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-brand-500 focus:outline-none bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio Singkat</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ceritakan sedikit tentang Anda dan kebiasaan pemakaian barang..."
                  className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-full bg-brand-600 hover:bg-brand-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Keamanan & Verifikasi Rekber */}
        {activeTab === 'security' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-7 shadow-xs space-y-4 sm:space-y-5">
            <div className="border-b border-slate-100 pb-3.5">
              <h3 className="text-sm sm:text-base font-black text-slate-900">Status Keamanan & KYC</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Verifikasi identitas resmi Rekber JBB.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* KTP Verification Card */}
              <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4.5 w-4.5 text-brand-600" />
                    <h4 className="text-xs font-bold text-slate-900">Verifikasi KTP</h4>
                  </div>
                  <span className="rounded-full bg-brand-200/80 px-2 py-0.5 text-[9px] font-extrabold text-brand-900">
                    Terverifikasi
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Identitas KTP Anda telah diverifikasi oleh sistem KYC JBB. Anda memiliki lencana resmi penjual & pembeli terpercaya.
                </p>
              </div>

              {/* WhatsApp Verified Card */}
              <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-brand-600" />
                    <h4 className="text-xs font-bold text-slate-900">WhatsApp Notifikasi</h4>
                  </div>
                  <span className="rounded-full bg-brand-200/80 px-2 py-0.5 text-[9px] font-extrabold text-brand-900">
                    Aktif
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Nomor WhatsApp {user.phone || '081234567890'} terhubung untuk notifikasi pencairan dana Rekber.
                </p>
              </div>
            </div>

            {/* Bank Account for Escrow Payout */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <CreditCard className="h-4 w-4 text-brand-600" />
                  <span>Rekening Pencairan Rekber (Penjual)</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyRekening}
                  className="flex items-center gap-1 text-[10px] font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
                >
                  {copiedRekening ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedRekening ? 'Tersalin' : 'Salin No Rek'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 block">Bank</span>
                  <span className="font-bold text-slate-900">Bank Central Asia (BCA)</span>
                </div>
                <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 block">Nomor Rekening</span>
                  <span className="font-mono font-bold text-slate-900">8271029384</span>
                </div>
                <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 block">Atas Nama</span>
                  <span className="font-bold text-slate-900">{user.name}</span>
                </div>
              </div>

              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed font-medium">
                Dana penjualan otomatis dicairkan ke rekening ini setelah masa garansi fisik 48 jam berakhir tanpa sengketa.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Iklan Saya */}
        {activeTab === 'listings' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">Iklan Barang Bekas Anda ({myListings.length})</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Kelola status barang yang sedang Anda tawarkan.</p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/my-listings"
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors"
                >
                  Kelola Iklan
                </Link>
                <Link
                  href="/jual"
                  className="flex items-center gap-1 rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 stroke-3" />
                  <span>Pasang Iklan</span>
                </Link>
              </div>
            </div>

            {myListings.length === 0 ? (
              <div className="text-center py-10 border border-slate-200 rounded-2xl bg-slate-50">
                <Package className="mx-auto h-9 w-9 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">Belum Ada Iklan Aktif</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Barang bekas yang Anda pasang akan muncul di sini.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myListings.map((item: any) => {
                  const img = item.images?.[0]?.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200';
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200/80 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={img}
                          alt={item.title}
                          className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <span
                            className={`inline-block rounded-full px-2 py-0.2 text-[9px] font-extrabold border ${
                              item.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : item.status === 'IN_NEGO'
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : item.status === 'SOLD'
                                ? 'bg-purple-50 text-purple-900 border-purple-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {item.status === 'ACTIVE'
                              ? 'Aktif'
                              : item.status === 'IN_NEGO'
                              ? 'Sedang Nego'
                              : item.status === 'SOLD'
                              ? 'Terjual'
                              : item.status}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {item.title}
                          </h4>
                          <span className="text-xs font-black text-brand-700 block">{formatIDR(item.price)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <Link
                          href={`/listing/${item.slug || item.id}`}
                          className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors"
                        >
                          Lihat
                        </Link>
                        <Link
                          href="/nego?tab=received"
                          className="rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                        >
                          Nego ({item.offerCount || 0})
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Ulasan & Reputasi */}
        {activeTab === 'reputation' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-7 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3.5">
              <h3 className="text-sm sm:text-base font-black text-slate-900">Ulasan Pembeli Terverifikasi</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Reputasi transaksi riil selesai melalui sistem Rekber.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Rian Pratama</span>
                  <div className="flex items-center text-amber-500 text-xs">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "Barang sesuai banget sama foto & deskripsi! Packing tebal, respon penjual cepat. Sangat terpercaya."
                </p>
                <span className="text-[10px] text-slate-400 block font-medium">Transaksi: MacBook Air M1</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Siti Nurhaliza</span>
                  <div className="flex items-center text-amber-500 text-xs">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "Proses rekber lancar jaya, unit mulus kayak baru. Terima kasih mas!"
                </p>
                <span className="text-[10px] text-slate-400 block font-medium">Transaksi: Sony A6400 Body Only</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
