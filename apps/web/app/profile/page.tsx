'use client';

import React, { useState } from 'react';
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
  ArrowRight
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

  // Sync state if user changes
  React.useEffect(() => {
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
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs space-y-4">
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

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-4">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Profil Saya' }
          ]}
        />

        {/* Profile Hero Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
          {/* Subtle Ambient Accent */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-50 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* User Avatar & Info */}
            <div className="flex items-center gap-4 sm:gap-5">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl object-cover ring-4 ring-slate-100 shrink-0 shadow-sm"
                />
              ) : (
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-brand-100 text-2xl font-black text-brand-700 ring-4 ring-brand-50 shrink-0 shadow-sm">
                  {user.name.charAt(0)}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.name}</h1>
                  {user.isKycVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-[10px] font-extrabold text-brand-800">
                      <BadgeCheck className="h-3.5 w-3.5 text-brand-600" />
                      <span>KTP Terverifikasi</span>
                    </span>
                  )}
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                    {user.role === 'SELLER' ? 'Penjual Terpercaya' : 'Member JBB'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{user.email}</span>
                  <span>&bull;</span>
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{user.city || 'Indonesia'}</span>
                </p>

                <div className="flex items-center gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-1 font-bold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{user.ratingAverage || 5.0}</span>
                    <span className="text-slate-400 font-normal">({user.ratingCount || 12} ulasan)</span>
                  </div>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-slate-600 font-semibold">{user.totalTransactions || 8} Transaksi Sukses</span>
                </div>
              </div>
            </div>

            {/* Trust Score Meter Badge */}
            <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 shrink-0">
              <div className="text-left md:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Trust Score
                </span>
                <span className="text-lg sm:text-xl font-black text-brand-700">
                  {user.trustScore}% Sangat Aman
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-brand-800 bg-brand-100/70 px-2.5 py-1 rounded-lg">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                <span>Garansi Rekber 100%</span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/orders"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors"
              >
                <ShoppingBag className="h-4 w-4 text-slate-500" />
                <span>Riwayat Pesanan</span>
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors"
              >
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Wishlist ({wishlistCount})</span>
              </Link>
              <Link
                href="/nego"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors"
              >
                <MessageSquareText className="h-4 w-4 text-amber-500" />
                <span>Tawaran Nego</span>
              </Link>
              <Link
                href="/jual"
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors"
              >
                <Plus className="h-4 w-4 stroke-3" />
                <span>Pasang Iklan Baru</span>
              </Link>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 px-3.5 py-2 text-xs font-bold text-rose-700 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto hide-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('biodata')}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'biodata'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Data Profil & Kontak</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-brand-500" />
            <span>Verifikasi & Rekening Rekber</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'listings'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Package className="h-4 w-4 text-blue-500" />
            <span>Iklan Saya</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reputation')}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reputation'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Star className="h-4 w-4 text-amber-500" />
            <span>Ulasan & Reputasi</span>
          </button>
        </div>

        {/* Tab 1: Biodata & Kontak Form */}
        {activeTab === 'biodata' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Biodata Pengguna</h3>
                <p className="text-xs text-slate-500">Kelola identitas publik dan kontak WhatsApp pengiriman Anda.</p>
              </div>
              {isSavedToast && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 animate-in fade-in">
                  ✓ Berhasil Disimpan
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio Singkat Penjual / Pembeli</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ceritakan sedikit tentang Anda dan kebiasaan pemakaian barang..."
                  className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-full bg-brand-600 hover:bg-brand-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Keamanan & Verifikasi Rekber */}
        {activeTab === 'security' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-base font-black text-slate-900">Status Keamanan & KYC</h3>
              <p className="text-xs text-slate-500">Verifikasi identitas untuk menaikkan Trust Score hingga 100%.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* KTP Verification Card */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-brand-600" />
                    <h4 className="text-xs font-bold text-slate-900">Verifikasi KTP / Identitas</h4>
                  </div>
                  <span className="rounded-full bg-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-brand-900">
                    Terverifikasi
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Data KTP Anda telah diverifikasi oleh sistem KYC JBB. Anda memiliki lencana resmi penjual terpercaya.
                </p>
              </div>

              {/* WhatsApp Verified Card */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-brand-600" />
                    <h4 className="text-xs font-bold text-slate-900">Nomor WhatsApp</h4>
                  </div>
                  <span className="rounded-full bg-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-brand-900">
                    Aktif
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Nomor WhatsApp {user.phone || '081234567890'} terhubung untuk notifikasi pencairan dana Rekber.
                </p>
              </div>
            </div>

            {/* Bank Account for Escrow Payout */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CreditCard className="h-4 w-4 text-brand-600" />
                <span>Rekening Pencairan Dana Rekber (Penjual)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl bg-white p-3 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block">Bank</span>
                  <span className="font-bold text-slate-900">Bank Central Asia (BCA)</span>
                </div>
                <div className="rounded-xl bg-white p-3 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block">Nomor Rekening</span>
                  <span className="font-bold text-slate-900">8271029384</span>
                </div>
                <div className="rounded-xl bg-white p-3 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block">Atas Nama</span>
                  <span className="font-bold text-slate-900">{user.name}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Dana hasil penjualan akan otomatis diteruskan ke rekening di atas setelah pembeli menyelesaikan masa inspeksi fisik 48 jam.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Iklan Saya */}
        {activeTab === 'listings' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Iklan Barang Bekas Anda ({myListings.length})</h3>
                <p className="text-xs text-slate-500">Kelola status barang yang sedang Anda tawarkan di marketplace.</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/my-listings"
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors"
                >
                  Kelola Detail Iklan
                </Link>
                <Link
                  href="/jual"
                  className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors"
                >
                  <Plus className="h-4 w-4 stroke-3" />
                  <span>Pasang Iklan Baru</span>
                </Link>
              </div>
            </div>

            {myListings.length === 0 ? (
              <div className="text-center py-10 border border-slate-200 rounded-2xl bg-slate-50">
                <Package className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">Belum Ada Iklan Aktif</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Barang bekas yang Anda pasang akan muncul di sini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myListings.map((item: any) => {
                  const img = item.images?.[0]?.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200';
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={img}
                          alt={item.title}
                          className="h-16 w-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="space-y-0.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold border ${
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
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                            {item.title}
                          </h4>
                          <span className="text-xs font-black text-brand-700 block">{formatIDR(item.price)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/listing/${item.slug || item.id}`}
                          className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors"
                        >
                          Lihat Iklan
                        </Link>
                        <Link
                          href="/nego?tab=received"
                          className="rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                        >
                          Cek Nego ({item.offerCount || 0})
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-base font-black text-slate-900">Ulasan dari Pembeli Terverifikasi</h3>
              <p className="text-xs text-slate-500">Reputasi transaksi riil yang telah selesai melalui sistem Rekber.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <p className="text-xs text-slate-600 italic">
                  "Barang sesuai banget sama foto & deskripsi! Packing tebal, respon penjual cepat. Sangat terpercaya."
                </p>
                <span className="text-[10px] text-slate-400 block">Transaksi: MacBook Air M1</span>
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
                <p className="text-xs text-slate-600 italic">
                  "Proses rekber lancar jaya, unit mulus kayak baru. Terima kasih mas!"
                </p>
                <span className="text-[10px] text-slate-400 block">Transaksi: Sony A6400 Body Only</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
