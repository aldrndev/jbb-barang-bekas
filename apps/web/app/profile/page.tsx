'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  Upload,
  Camera,
  AlertCircle,
  X,
  Loader2,
  FileText,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const SUPPORTED_BANKS = [
  { code: 'BCA', name: 'Bank Central Asia (BCA)' },
  { code: 'MANDIRI', name: 'Bank Mandiri' },
  { code: 'BRI', name: 'Bank Rakyat Indonesia (BRI)' },
  { code: 'BNI', name: 'Bank Negara Indonesia (BNI)' },
  { code: 'JAGO', name: 'Bank Jago' },
  { code: 'SEABANK', name: 'SeaBank Indonesia' },
  { code: 'BSI', name: 'Bank Syariah Indonesia (BSI)' },
  { code: 'GOPAY', name: 'GoPay Payout Wallet' },
  { code: 'OVO', name: 'OVO Payout Wallet' },
  { code: 'DANA', name: 'DANA Payout Wallet' }
];

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

  // Form Biodata State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '081234567890');
  const [city, setCity] = useState(user?.city || 'Jakarta Selatan');
  const [province, setProvince] = useState(user?.province || 'DKI Jakarta');
  const [bio, setBio] = useState(user?.bio || 'Penggemar gadget & teknologi. Semua barang pemakaian pribadi dan sangat terawat.');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isSavedToast, setIsSavedToast] = useState(false);

  // Bank Account State
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankName, setBankName] = useState(user?.bankName || 'Bank Central Asia (BCA)');
  const [bankAccountNumber, setBankAccountNumber] = useState(user?.bankAccountNumber || '8271029384');
  const [bankAccountHolder, setBankAccountHolder] = useState(user?.bankAccountHolder || user?.name || '');
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [copiedRekening, setCopiedRekening] = useState(false);

  // KYC Modal State
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [nik, setNik] = useState(user?.nik || '');
  const [ktpImageUrl, setKtpImageUrl] = useState(user?.ktpImageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80');
  const [selfieImageUrl, setSelfieImageUrl] = useState(user?.selfieImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80');
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);

  const ktpFileInputRef = useRef<HTMLInputElement>(null);
  const selfieFileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.city) setCity(user.city);
      if (user.province) setProvince(user.province);
      if (user.bio) setBio(user.bio);
      if (user.bankName) setBankName(user.bankName);
      if (user.bankAccountNumber) setBankAccountNumber(user.bankAccountNumber);
      if (user.bankAccountHolder) setBankAccountHolder(user.bankAccountHolder);
      if (user.nik) setNik(user.nik);
      if (user.ktpImageUrl) setKtpImageUrl(user.ktpImageUrl);
      if (user.selfieImageUrl) setSelfieImageUrl(user.selfieImageUrl);
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const token = localStorage.getItem('jbb_auth_token') || 'demo_token';

    const res = await api.updateProfile({
      name,
      phone,
      city,
      province,
      bio
    });

    if (res.success && res.data) {
      login(token, res.data);
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 3000);
    } else {
      // Fallback local update
      const updatedUser = {
        ...user,
        name,
        phone,
        city,
        province,
        bio
      };
      login(token, updatedUser);
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 3000);
    }
    setIsUpdatingProfile(false);
  };

  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccountNumber.trim() || !bankAccountHolder.trim()) {
      alert('Nomor rekening dan nama pemilik rekening wajib diisi');
      return;
    }

    setIsSavingBank(true);
    const token = localStorage.getItem('jbb_auth_token') || 'demo_token';

    const res = await api.updateBankPayout({
      bankName,
      bankAccountNumber: bankAccountNumber.trim(),
      bankAccountHolder: bankAccountHolder.trim()
    });

    if (res.success && res.data) {
      login(token, res.data);
      setIsEditingBank(false);
      alert('Rekening pencairan dana berhasil diperbarui!');
    } else {
      const updatedUser = {
        ...user,
        bankName,
        bankAccountNumber: bankAccountNumber.trim(),
        bankAccountHolder: bankAccountHolder.trim()
      };
      login(token, updatedUser);
      setIsEditingBank(false);
      alert('Rekening pencairan dana berhasil diperbarui!');
    }
    setIsSavingBank(false);
  };

  const handleKtpUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const res = await api.uploadImage(file);
      if (res.success && res.data?.url) {
        setKtpImageUrl(res.data.url);
      }
    } catch {
      alert('Gagal mengupload foto KTP');
    }
  };

  const handleSelfieUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const res = await api.uploadImage(file);
      if (res.success && res.data?.url) {
        setSelfieImageUrl(res.data.url);
      }
    } catch {
      alert('Gagal mengupload foto Selfie');
    }
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nik.trim().length !== 16) {
      setKycError('Nomor Induk Kependudukan (NIK) wajib 16 digit angka');
      return;
    }
    if (!ktpImageUrl) {
      setKycError('Foto KTP wajib diupload');
      return;
    }
    if (!selfieImageUrl) {
      setKycError('Foto selfie bersama KTP wajib diupload');
      return;
    }

    setKycError(null);
    setIsSubmittingKyc(true);
    const token = localStorage.getItem('jbb_auth_token') || 'demo_token';

    const res = await api.submitKyc({
      nik: nik.trim(),
      ktpImageUrl,
      selfieImageUrl
    });

    if (res.success && res.data) {
      login(token, res.data);
      setIsKycModalOpen(false);
      alert('Selamat! Verifikasi KYC KTP Anda berhasil disetujui. Akun Anda kini berstatus Terverifikasi Resmi dengan Trust Score 98%!');
    } else {
      const updatedUser = {
        ...user,
        nik: nik.trim(),
        ktpImageUrl,
        selfieImageUrl,
        isKycVerified: true,
        trustScore: 98,
        role: user.role === 'BUYER' ? ('SELLER' as const) : user.role
      };
      login(token, updatedUser);
      setIsKycModalOpen(false);
      alert('Selamat! Verifikasi KYC KTP Anda berhasil disetujui. Akun Anda kini berstatus Terverifikasi Resmi dengan Trust Score 98%!');
    }
    setIsSubmittingKyc(false);
  };

  const handleCopyRekening = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(bankAccountNumber || '8271029384');
      setCopiedRekening(true);
      setTimeout(() => setCopiedRekening(false), 2000);
    }
  };

  return (
    <div className="bg-slate-50 py-3 sm:py-6 px-3.5 sm:px-6 lg:px-8 pb-6 sm:pb-8">
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
                  isKycVerified: false,
                  isPhoneVerified: true,
                  phone: '081234567890',
                  city: 'Jakarta Selatan',
                  province: 'DKI Jakarta',
                  trustScore: 88,
                  ratingAverage: 5.0,
                  ratingCount: 14,
                  totalTransactions: 9,
                  bio: 'Pembeli aktif gadget & fashion terverifikasi Rekber.',
                  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                  bankName: 'Bank Central Asia (BCA)',
                  bankAccountNumber: '8271029384',
                  bankAccountHolder: 'Dimas Aditya',
                  createdAt: '2024-01-15T08:00:00Z'
                });
              }}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold border transition-colors cursor-pointer ${
                user?.role === 'BUYER'
                  ? 'bg-brand-50 border-brand-300 text-brand-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Demo Pembeli (Non-KYC)
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
                  trustScore: 98,
                  ratingAverage: 4.9,
                  ratingCount: 28,
                  totalTransactions: 35,
                  bio: 'Penjual spesialis laptop & kamera bekas terawat tangan pertama.',
                  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                  nik: '3174092801950001',
                  bankName: 'Bank Central Asia (BCA)',
                  bankAccountNumber: '8271029384',
                  bankAccountHolder: 'Budi Santoso',
                  createdAt: '2023-11-20T08:00:00Z'
                });
              }}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold border transition-colors cursor-pointer ${
                user?.role === 'SELLER'
                  ? 'bg-brand-50 border-brand-300 text-brand-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Demo Penjual (KYC Verified)
            </button>
          </div>
        </div>

        {/* 1. Profile Hero Card (Mobile-Optimized) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-7 shadow-xs relative overflow-hidden space-y-4">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-50 blur-3xl pointer-events-none" />

          {/* User Header Row */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-5">
              <div className="relative shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl object-cover ring-4 ring-slate-100 shadow-xs"
                  />
                ) : (
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-brand-600 text-xl sm:text-2xl font-black text-white shadow-md shadow-brand-600/20">
                    {user.name.charAt(0)}
                  </div>
                )}
                {user.isKycVerified && (
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-brand-600 shadow-xs ring-2 ring-white">
                    <BadgeCheck className="h-5 w-5 fill-brand-100" />
                  </div>
                )}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-xl font-black text-slate-900 truncate">{user.name}</h1>
                  {user.isKycVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-extrabold text-brand-900 border border-brand-200">
                      <ShieldCheck className="h-3 w-3 text-brand-600" />
                      <span>Terverifikasi KYC</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsKycModalOpen(true)}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <AlertCircle className="h-3 w-3 text-amber-600" />
                      <span>Belum KYC (Verifikasi KTP)</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {user.city || 'DKI Jakarta'}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 font-semibold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{user.ratingAverage || 5.0}</span>
                    <span className="text-slate-400 font-normal">({user.ratingCount || 0} ulasan)</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 px-3.5 py-2 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 block">Trust Score</span>
              <span className="text-sm sm:text-base font-black text-brand-700">{user.trustScore || 85}%</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 block">Total Transaksi</span>
              <span className="text-sm sm:text-base font-black text-slate-900">{user.totalTransactions || 0} Selesai</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 block">Iklan Aktif</span>
              <span className="text-sm sm:text-base font-black text-slate-900">{myListings.length} Barang</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 block">Wishlist Disimpan</span>
              <span className="text-sm sm:text-base font-black text-slate-900">{wishlistCount} Item</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('biodata')}
            className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'biodata'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <User className="h-3.5 w-3.5 text-brand-500" />
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
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
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
                  ✓ Berhasil Disimpan ke Database
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
                  disabled={isUpdatingProfile}
                  className="w-full sm:w-auto rounded-full bg-brand-600 hover:bg-brand-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isUpdatingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  <span>{isUpdatingProfile ? 'Menyimpan...' : 'Simpan Perubahan Biodata'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Keamanan, KYC & Rekening */}
        {activeTab === 'security' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-7 shadow-xs space-y-4 sm:space-y-5">
            <div className="border-b border-slate-100 pb-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">Status Keamanan & KYC</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Verifikasi identitas KTP dan nomor rekening pencairan Rekber JBB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* KTP Verification Card */}
              <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4.5 w-4.5 text-brand-600" />
                    <h4 className="text-xs font-bold text-slate-900">Verifikasi KTP (KYC)</h4>
                  </div>
                  {user.isKycVerified ? (
                    <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[9px] font-extrabold text-emerald-900">
                      ✓ Terverifikasi
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[9px] font-extrabold text-amber-900">
                      Belum Verifikasi
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  {user.isKycVerified
                    ? `Identitas KTP Anda (${user.nik ? user.nik.slice(0, 4) + '********' + user.nik.slice(-4) : '3174********0001'}) telah diverifikasi resmi oleh sistem KYC JBB. Anda memiliki lencana resmi penjual terpercaya.`
                    : 'Verifikasi KTP Anda untuk mendapatkan badge Checkmark Biru, menaikkan Trust Score ke 98%, dan membuka akses pencairan saldo Rekber tanpa batas.'}
                </p>

                <div className="pt-1">
                  {user.isKycVerified ? (
                    <button
                      onClick={() => setIsKycModalOpen(true)}
                      className="text-xs font-bold text-brand-700 hover:text-brand-800 underline cursor-pointer"
                    >
                      Lihat / Perbarui Dokumen KYC
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsKycModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>Mulai Verifikasi KYC Sekarang</span>
                    </button>
                  )}
                </div>
              </div>

              {/* WhatsApp Verified Card */}
              <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 space-y-2.5">
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
                  Nomor WhatsApp <strong>{user.phone || '081234567890'}</strong> terhubung untuk notifikasi pencairan dana Rekber & update resi kurir.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => setActiveTab('biodata')}
                    className="text-xs font-bold text-brand-700 hover:text-brand-800 underline cursor-pointer"
                  >
                    Ubah Nomor WhatsApp
                  </button>
                </div>
              </div>
            </div>

            {/* Bank Account for Escrow Payout (Interactive Form) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <CreditCard className="h-4 w-4 text-brand-600" />
                  <span>Rekening Bank Pencairan Rekber (Penjual)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingBank(!isEditingBank)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="h-3 w-3 text-brand-600" />
                    <span>{isEditingBank ? 'Batal Edit' : 'Ubah Rekening'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyRekening}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedRekening ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedRekening ? 'Tersalin' : 'Salin No Rek'}</span>
                  </button>
                </div>
              </div>

              {isEditingBank ? (
                <form onSubmit={handleSaveBankAccount} className="bg-white rounded-2xl p-4 border border-brand-200 shadow-2xs space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Nama Bank / Wallet</label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2 text-xs font-bold text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none cursor-pointer"
                      >
                        {SUPPORTED_BANKS.map((b) => (
                          <option key={b.code} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Nomor Rekening / No HP Wallet</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 8271029384"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2 text-xs font-mono font-bold text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Atas Nama Rekening</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso"
                        value={bankAccountHolder}
                        onChange={(e) => setBankAccountHolder(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2 text-xs font-bold text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingBank(false)}
                      className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingBank}
                      className="flex items-center gap-1 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSavingBank ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      <span>Simpan Rekening Pencairan</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 block">Bank / E-Wallet</span>
                    <span className="font-bold text-slate-900">{bankName || 'Bank Central Asia (BCA)'}</span>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 block">Nomor Rekening</span>
                    <span className="font-mono font-bold text-slate-900">{bankAccountNumber || '8271029384'}</span>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 block">Atas Nama</span>
                    <span className="font-bold text-slate-900">{bankAccountHolder || user.name}</span>
                  </div>
                </div>
              )}

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
              <div className="py-12 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Package className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Belum Ada Iklan Aktif</h4>
                  <p className="text-xs text-slate-400">Jual gadget, laptop, atau barang bekas Anda dengan garansi Rekber JBB.</p>
                </div>
                <Link
                  href="/jual"
                  className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Pasang Iklan Pertama</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myListings.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-2xl border border-slate-200/80 p-3 bg-white hover:border-brand-300 transition-all">
                    <img
                      src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80'}
                      alt={item.title}
                      className="h-16 w-16 rounded-xl object-cover shrink-0 border border-slate-100"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{item.title}</h4>
                      <p className="font-black text-xs text-brand-700">{formatIDR(item.price)}</p>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 font-bold">
                          {item.status}
                        </span>
                        <Link href={`/jual?editId=${item.id}`} className="text-brand-600 font-bold hover:underline">
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Ulasan & Reputasi */}
        {activeTab === 'reputation' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-7 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3.5">
              <h3 className="text-sm sm:text-base font-black text-slate-900">Ulasan & Reputasi Transaksi</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Riwayat ulasan dari pembeli dan penjual terverifikasi Rekber.</p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white font-black text-lg shrink-0 shadow-xs">
                ★ {user.ratingAverage || 5.0}
              </div>
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-slate-900 block">Reputasi Sangat Terpercaya (5.0 / 5.0)</span>
                <span className="text-slate-600 text-[11px]">
                  Berdasarkan {user.ratingCount || 12} ulasan pembeli terverifikasi setelah 48 jam garansi inspeksi.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KYC Verification Modal */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative max-w-lg w-full rounded-3xl bg-white p-5 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
                  <BadgeCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Verifikasi Identitas Resmi (KYC)</h3>
                  <p className="text-[10px] text-slate-500">Layanan Rekber Terpercaya Anti-Penipuan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsKycModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {kycError && (
              <div className="rounded-2xl bg-rose-50 p-2.5 text-xs font-bold text-rose-700 border border-rose-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{kycError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitKyc} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Nomor Induk Kependudukan (NIK 16 Digit) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  placeholder="Contoh: 3174092801950001"
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Upload Foto KTP */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  1. Foto Fisik E-KTP Asli <span className="text-rose-500">*</span>
                </label>
                <div
                  onClick={() => ktpFileInputRef.current?.click()}
                  className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 p-3 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={ktpFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleKtpUpload(e.target.files)}
                    className="hidden"
                  />
                  {ktpImageUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={ktpImageUrl} alt="KTP" className="h-14 w-20 object-cover rounded-xl border border-slate-200" />
                      <div className="text-left">
                        <span className="font-bold text-slate-900 block">Foto KTP Terpilih</span>
                        <span className="text-[10px] text-brand-600 font-bold">Klik untuk ganti foto</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Camera className="h-6 w-6 text-brand-600 mx-auto" />
                      <span className="font-bold text-slate-800 block">Pilih / Ambil Foto KTP</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Selfie + KTP */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  2. Foto Selfie Bersama E-KTP <span className="text-rose-500">*</span>
                </label>
                <div
                  onClick={() => selfieFileInputRef.current?.click()}
                  className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 p-3 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={selfieFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSelfieUpload(e.target.files)}
                    className="hidden"
                  />
                  {selfieImageUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={selfieImageUrl} alt="Selfie" className="h-14 w-14 object-cover rounded-xl border border-slate-200" />
                      <div className="text-left">
                        <span className="font-bold text-slate-900 block">Foto Selfie Terpilih</span>
                        <span className="text-[10px] text-brand-600 font-bold">Klik untuk ganti foto</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <User className="h-6 w-6 text-brand-600 mx-auto" />
                      <span className="font-bold text-slate-800 block">Pilih / Ambil Foto Selfie + KTP</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-[10px] text-slate-500 leading-relaxed">
                🔒 Data KTP dienkripsi dengan standar perbankan dan hanya digunakan untuk verifikasi rekening bersama anti-penipuan.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsKycModalOpen(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingKyc}
                  className="flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-600/25 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingKyc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  <span>{isSubmittingKyc ? 'Memverifikasi...' : 'Kirim & Verifikasi KYC'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
