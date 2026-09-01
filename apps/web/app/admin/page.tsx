'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useAuth } from '../../context/auth-context';
import { formatIDR, formatTimeAgo } from '../../lib/utils';
import { ConditionBadge } from '../../components/marketplace/condition-badge';
import {
  ShieldAlert,
  ShieldCheck,
  Building,
  CreditCard,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  ArrowRight,
  RefreshCw,
  Eye,
  Trash2,
  Lock,
  Sparkles,
  Search,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  BadgeCheck,
  TrendingUp,
  DollarSign,
  Activity,
  Layers,
  FileText,
  User,
  Menu,
  Home,
  LogOut,
  SlidersHorizontal,
  Clock
} from 'lucide-react';

const DEFAULT_KYC_QUEUE = [
  {
    id: 'usr-kyc-pending-1',
    name: 'Rian Hidayat (Pendaftar Baru)',
    email: 'rian.hidayat@example.com',
    phone: '081288991122',
    nik: '3273081903980002',
    ktpImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    selfieImageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    isKycVerified: false,
    trustScore: 82,
    role: 'BUYER',
    createdAt: '2026-08-31T14:20:00Z',
    kycSubmittedAt: '2026-08-31T15:00:00Z'
  },
  {
    id: 'usr-kyc-pending-2',
    name: 'Siti Nurhaliza (Calon Penjual)',
    email: 'siti.nurhaliza@example.com',
    phone: '081377889900',
    nik: '3175026708990004',
    ktpImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    selfieImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    isKycVerified: false,
    trustScore: 85,
    role: 'BUYER',
    createdAt: '2026-08-31T10:15:00Z',
    kycSubmittedAt: '2026-08-31T11:45:00Z'
  },
  {
    id: 'usr-kyc-pending-3',
    name: 'Ahmad Zaki Gunawan',
    email: 'ahmad.zaki@example.com',
    phone: '081900112233',
    nik: '3578011204940003',
    ktpImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    selfieImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    isKycVerified: false,
    trustScore: 80,
    role: 'BUYER',
    createdAt: '2026-08-30T09:00:00Z',
    kycSubmittedAt: '2026-08-30T09:30:00Z'
  },
  {
    id: 'usr-seller-1',
    name: 'Budi Santoso (Penjual Terverifikasi)',
    email: 'budi@example.com',
    phone: '081987654321',
    nik: '3174092801950001',
    ktpImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    selfieImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    isKycVerified: true,
    trustScore: 98,
    role: 'SELLER',
    createdAt: '2026-08-01T08:00:00Z',
    kycSubmittedAt: '2026-08-02T10:00:00Z'
  }
];

const DEFAULT_DISPUTES = [
  {
    id: 'ord-dispute-demo-1',
    orderNumber: 'JBB-2026-9901',
    listingId: 'lst-macbook-1',
    buyerId: 'usr-buyer-1',
    sellerId: 'usr-seller-1',
    amount: 16500000,
    shippingFee: 35000,
    serviceFee: 25000,
    totalAmount: 16560000,
    escrowStatus: 'DISPUTED',
    deliveryMethod: 'KURIR_REGULER',
    courierName: 'JNE Express YES',
    trackingNumber: 'JNE-882910293',
    disputeReason: 'Layar MacBook terdapat staingate baret tebal memanjang di area tengah yang tidak dicantumkan di deskripsi penjual. Mohon refund penuh ke rekening.',
    disputeEvidenceUrls: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
    ],
    listing: {
      id: 'lst-macbook-1',
      title: 'MacBook Pro 14 M1 Pro 16/512GB Space Grey Fullset Box',
      price: 16500000,
      condition: 'LIKE_NEW'
    },
    buyer: {
      id: 'usr-buyer-1',
      name: 'Dimas Aditya (Pembeli)',
      email: 'dimas@example.com',
      phone: '081234567890'
    },
    seller: {
      id: 'usr-seller-1',
      name: 'Budi Santoso (Penjual)',
      email: 'budi@example.com',
      phone: '081987654321',
      bankName: 'Bank Central Asia (BCA)',
      bankAccountNumber: '8271029384'
    },
    createdAt: '2026-08-30T10:00:00Z',
    updatedAt: '2026-08-31T14:00:00Z'
  },
  {
    id: 'ord-dispute-demo-2',
    orderNumber: 'JBB-2026-9904',
    listingId: 'lst-sony-a7',
    buyerId: 'usr-buyer-2',
    sellerId: 'usr-seller-2',
    amount: 19800000,
    shippingFee: 40000,
    serviceFee: 30000,
    totalAmount: 19870000,
    escrowStatus: 'DISPUTED',
    deliveryMethod: 'KURIR_REGULER',
    courierName: 'SiCepat BEST',
    trackingNumber: '002938491028',
    disputeReason: 'Sensor kamera terdapat jamur/fungus tipis saat diuji pada aperture f/16, padahal di chat penjual menyatakan optik sensor 100% bening cling.',
    disputeEvidenceUrls: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80'
    ],
    listing: {
      id: 'lst-sony-a7',
      title: 'Sony Alpha A7 III Body Only SC Rendah 3.200 Fullset',
      price: 19800000,
      condition: 'LIGHTLY_USED'
    },
    buyer: {
      id: 'usr-buyer-2',
      name: 'Hendra Gunawan (Pembeli)',
      email: 'hendra.gunawan@example.com',
      phone: '081377889900'
    },
    seller: {
      id: 'usr-seller-2',
      name: 'Andi Wijaya (Penjual)',
      email: 'andi.wijaya@example.com',
      phone: '081299001122',
      bankName: 'Bank Mandiri',
      bankAccountNumber: '1370019283741'
    },
    createdAt: '2026-08-31T08:00:00Z',
    updatedAt: '2026-08-31T16:20:00Z'
  }
];

const DEFAULT_PAYOUTS = [
  {
    id: 'pay-demo-1',
    orderNumber: 'JBB-2026-8812',
    listingTitle: 'Sony A6400 Body Only SC 4.200 Fullset Mulus',
    amount: 8900000,
    payoutBank: 'Bank Central Asia (BCA)',
    payoutAccountNumber: '8271029384',
    payoutAccountHolder: 'Budi Santoso',
    sellerName: 'Budi Santoso',
    completedAt: '2026-08-31T09:30:00Z',
    status: 'TRANSFERRED_SUCCESS'
  },
  {
    id: 'pay-demo-2',
    orderNumber: 'JBB-2026-7731',
    listingTitle: 'iPhone 13 Pro 128GB Sierra Blue iBox Fullset',
    amount: 11200000,
    payoutBank: 'Bank Mandiri',
    payoutAccountNumber: '1370019283741',
    payoutAccountHolder: 'Rian Pratama',
    sellerName: 'Rian Pratama',
    completedAt: '2026-08-30T16:15:00Z',
    status: 'TRANSFERRED_SUCCESS'
  },
  {
    id: 'pay-demo-3',
    orderNumber: 'JBB-2026-6649',
    listingTitle: 'Sony WH-1000XM5 Wireless Noise Cancelling Mulus',
    amount: 3850000,
    payoutBank: 'Bank Jago',
    payoutAccountNumber: '109283746192',
    payoutAccountHolder: 'Kevin Sanjaya',
    sellerName: 'Kevin Sanjaya',
    completedAt: '2026-08-29T11:20:00Z',
    status: 'TRANSFERRED_SUCCESS'
  },
  {
    id: 'pay-demo-4',
    orderNumber: 'JBB-2026-5520',
    listingTitle: 'PlayStation 5 Disc Edition Horizon Bundle 2 Stik',
    amount: 6900000,
    payoutBank: 'SeaBank Indonesia',
    payoutAccountNumber: '901238475619',
    payoutAccountHolder: 'Doni Prasetyo',
    sellerName: 'Doni Prasetyo',
    completedAt: '2026-08-28T14:45:00Z',
    status: 'TRANSFERRED_SUCCESS'
  }
];

export default function StandaloneAdminDashboard() {
  const queryClient = useQueryClient();
  const { user, loginAsDemoAdmin, loginAsDemoSeller, loginAsDemoBuyer, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'overview' | 'disputes' | 'kyc' | 'payouts' | 'listings'>('overview');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Queries
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.getAdminStats(),
    enabled: isAdmin
  });

  const { data: kycData, refetch: refetchKyc } = useQuery({
    queryKey: ['admin-kyc'],
    queryFn: () => api.getAdminKycQueue(),
    enabled: isAdmin
  });

  const { data: disputesData, refetch: refetchDisputes } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => api.getAdminDisputes(),
    enabled: isAdmin
  });

  const { data: payoutsData, refetch: refetchPayouts } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: () => api.getAdminPayouts(),
    enabled: isAdmin
  });

  const { data: listingsData, refetch: refetchListings } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => api.getAdminListings(),
    enabled: isAdmin
  });

  const stats = statsData?.data || {
    escrowHoldingTotal: 48500000,
    completedPayoutTotal: 124500000,
    totalGmv: 173000000,
    activeDisputesCount: 2,
    pendingKycCount: 3,
    totalUsersCount: 120,
    totalListingsCount: 45,
    activeListingsCount: 38
  };

  const kycQueue = (kycData?.data && kycData.data.length > 0) ? kycData.data : DEFAULT_KYC_QUEUE;
  const disputes = (disputesData?.data && disputesData.data.length > 0) ? disputesData.data : DEFAULT_DISPUTES;
  const payouts = (payoutsData?.data && payoutsData.data.length > 0) ? payoutsData.data : DEFAULT_PAYOUTS;
  const listings = listingsData?.data || [];

  const handleApproveKyc = async (userId: string) => {
    setIsProcessingAction(true);
    const res = await api.approveKyc(userId);
    if (res.success) {
      alert(res.message || 'KYC berhasil disetujui!');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-kyc'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      ]);
    } else {
      alert(res.error?.message || 'Gagal menyetujui KYC');
    }
    setIsProcessingAction(false);
  };

  const handleRejectKyc = async (userId: string) => {
    setIsProcessingAction(true);
    const res = await api.rejectKyc(userId);
    if (res.success) {
      alert(res.message || 'KYC telah ditolak.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-kyc'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      ]);
    } else {
      alert(res.error?.message || 'Gagal menolak KYC');
    }
    setIsProcessingAction(false);
  };

  const handleResolveDispute = async (orderId: string, action: 'REFUND_BUYER' | 'RELEASE_TO_SELLER') => {
    const confirmText =
      action === 'REFUND_BUYER'
        ? 'Apakah Anda yakin ingin ME-REFUND DANA PENUH ke pembeli? Status pesanan akan menjadi CANCELLED/REFUNDED.'
        : 'Apakah Anda yakin ingin MENCAIRKAN DANA KE PENJUAL? Sengketa akan ditutup dan status menjadi COMPLETED.';

    if (!confirm(confirmText)) return;

    setIsProcessingAction(true);
    const res = await api.resolveDispute(orderId, action, adminNotes);
    if (res.success) {
      alert(res.message || 'Sengketa berhasil diselesaikan!');
      setSelectedDisputeId(null);
      setAdminNotes('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-disputes'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-payouts'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      ]);
    } else {
      alert(res.error?.message || 'Gagal menyelesaikan sengketa');
    }
    setIsProcessingAction(false);
  };

  const handleToggleListingStatus = async (listingId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    const res = await api.updateAdminListingStatus(listingId, nextStatus as any);
    if (res.success) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['listings'] })
      ]);
    }
  };

  // Auth Guard for Non-Admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xs space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 shadow-2xs">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
              Akses Terbatas
            </span>
            <h1 className="text-xl font-black text-slate-900">JBB Escrow Back-Office</h1>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Portal administrasi khusus petugas kepatuhan mediasi sengketa dan keuangan Rekber JBB.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              onClick={loginAsDemoAdmin}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 px-6 py-3 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-200" />
              <span>Masuk Sebagai Master Administrator</span>
            </button>
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 px-6 py-2.5 text-xs font-bold text-slate-700 transition-colors"
            >
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              <span>Kembali ke Marketplace Publik</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      id: 'overview',
      label: 'Ringkasan & Brankas',
      icon: Activity,
      badge: null
    },
    {
      id: 'disputes',
      label: 'Pusat Mediasi Sengketa',
      icon: AlertTriangle,
      badge: disputes.length > 0 ? `${disputes.length}` : null,
      badgeColor: 'bg-rose-100 text-rose-800 border border-rose-200'
    },
    {
      id: 'kyc',
      label: 'Verifikasi KYC KTP',
      icon: UserCheck,
      badge: kycQueue.filter((u) => !u.isKycVerified).length > 0 ? `${kycQueue.filter((u) => !u.isKycVerified).length}` : null,
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-200 font-extrabold'
    },
    {
      id: 'payouts',
      label: 'Pencairan Bank Penjual',
      icon: CreditCard,
      badge: null
    },
    {
      id: 'listings',
      label: 'Moderasi Iklan & Katalog',
      icon: Package,
      badge: `${listings.length}`,
      badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row antialiased text-slate-900">
      {/* 1. STANDALONE LIGHT ADMIN SIDEBAR (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white text-slate-700 flex flex-col justify-between border-r border-slate-200/80 shadow-2xs transition-transform duration-300 lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Brand Logo & Back-Office Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 shadow-2xs">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="font-black text-sm text-slate-900 tracking-wider block">JBB.ADMIN</span>
                <span className="text-[10px] text-brand-700 font-bold uppercase tracking-wider block">
                  Escrow Control Center
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Menu Items */}
          <nav className="space-y-1.5 text-xs">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Modul Operasional
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-50 text-brand-800 border border-brand-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.badgeColor || 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom: Role Switcher & Back to Marketplace */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/60">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Role Switcher:
            </span>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
              <button
                onClick={loginAsDemoAdmin}
                className="bg-brand-600 text-white py-1.5 rounded-xl text-center cursor-pointer shadow-xs"
              >
                👑 Admin
              </button>
              <button
                onClick={loginAsDemoSeller}
                className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 py-1.5 rounded-xl text-center cursor-pointer shadow-2xs"
              >
                🛍️ Penjual
              </button>
              <button
                onClick={loginAsDemoBuyer}
                className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 py-1.5 rounded-xl text-center cursor-pointer shadow-2xs"
              >
                🛒 Pembeli
              </button>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 hover:text-brand-700 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-slate-400" />
              <span>Buka Marketplace</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Topbar Admin Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <span>{navItems.find((n) => n.id === activeTab)?.label}</span>
              </h2>
            </div>
          </div>

          {/* System Status & Admin Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-800">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Escrow Vault Engine: Active</span>
            </div>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-black text-slate-900 block">{user.name}</span>
                <span className="text-[10px] font-extrabold text-brand-600 uppercase tracking-wider block">
                  Master Admin
                </span>
              </div>
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user.name}
                className="h-9 w-9 rounded-xl object-cover ring-2 ring-brand-500/20"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* TAB CONTENT MODULES */}
          {activeTab === 'overview' && (
            <div className="space-y-5 sm:space-y-6">
              {/* Key Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                <div className="rounded-3xl border border-brand-200 bg-white p-4 sm:p-6 shadow-xs space-y-1.5 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-bold">
                    <span>Dana Ditahan Rekber</span>
                    <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                  </div>
                  <p className="text-base sm:text-2xl font-black text-brand-700">
                    {formatIDR(stats.escrowHoldingTotal)}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Dana aman dalam perlindungan Rekber JBB
                  </span>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-1.5">
                  <span className="text-slate-400 text-[10px] sm:text-xs font-bold block">
                    Total Pencairan Selesai
                  </span>
                  <p className="text-base sm:text-2xl font-black text-slate-900">
                    {formatIDR(stats.completedPayoutTotal)}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    ✓ Telah ditransfer ke rekening penjual
                  </span>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-bold">
                    <span>Sengketa / Komplain</span>
                    {stats.activeDisputesCount > 0 && (
                      <span className="rounded-full bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.2">
                        {stats.activeDisputesCount} Kasus
                      </span>
                    )}
                  </div>
                  <p className="text-base sm:text-2xl font-black text-rose-600">
                    {stats.activeDisputesCount} Pesanan
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Butuh investigasi & putusan mediasi
                  </span>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-1.5">
                  <span className="text-slate-400 text-[10px] sm:text-xs font-bold block">
                    Antrean Verifikasi KYC
                  </span>
                  <p className="text-base sm:text-2xl font-black text-amber-600">
                    {stats.pendingKycCount} Akun
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Menunggu validasi KTP & NIK
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900">Arsitektur Perlindungan Rekber JBB</h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Status operasional gerbang escrow dan sistem perlindungan 48 jam.</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Escrow Gateway 100% Online</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <Building className="h-4 w-4 text-brand-600" />
                      <span>Rekening Penampung Rekber</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      Dana pembeli dienkripsi dan ditampung di Escrow Pool Bank Central Asia (BCA) & Virtual Account Mandiri.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <ShieldCheck className="h-4 w-4 text-brand-600" />
                      <span>Garansi Inspeksi 48 Jam</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      Timer otomatis menghitung mundur setelah pembeli menerima paket. Dana terkunci rapat jika ada komplain.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <CreditCard className="h-4 w-4 text-brand-600" />
                      <span>Pencairan Otomatis (Settlement)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      Setelah 48 jam tanpa sengketa, sistem langsung mengirim instruksi transfer ke rekening bank terdaftar penjual.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'disputes' && (
            <div className="space-y-5">
              {/* If a specific dispute is selected -> SHOW CASE DETAIL VIEW */}
              {selectedDisputeId ? (
                (() => {
                  const selectedDispute = disputes.find((d: any) => d.id === selectedDisputeId) || disputes[0];
                  if (!selectedDispute) return null;

                  return (
                    <div className="space-y-5 animate-in fade-in">
                      {/* Back Navigation Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDisputeId(null);
                            setAdminNotes('');
                          }}
                          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors cursor-pointer group w-fit"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-brand-50 text-slate-600 group-hover:text-brand-600 transition-colors">
                            <ArrowRight className="h-4 w-4 rotate-180" />
                          </div>
                          <span>Kembali ke Daftar Kasus Sengketa</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1 text-xs font-black">
                            {selectedDispute.orderNumber}
                          </span>
                          <span className="rounded-full bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 text-xs font-extrabold flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                            <span>Menunggu Putusan Mediasi</span>
                          </span>
                        </div>
                      </div>

                      {/* Main Dispute Case Card */}
                      <div className="rounded-3xl border-2 border-rose-200 bg-white p-5 sm:p-7 shadow-xs space-y-6">
                        {/* Header Case Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Barang yang Disengketakan:
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                              {selectedDispute.listing?.title || 'Barang Sengketa'}
                            </h3>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Total Dana Tertahan di Rekber:
                            </span>
                            <span className="text-lg sm:text-2xl font-black text-brand-700 block">
                              {formatIDR(selectedDispute.totalAmount || selectedDispute.amount || 16560000)}
                            </span>
                          </div>
                        </div>

                        {/* Two Columns: Buyer Evidence vs Seller & Escrow Logistics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
                          {/* Column 1: Buyer Claim & Evidence */}
                          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 sm:p-5 space-y-3.5 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-rose-200/80 pb-2.5">
                              <span className="font-black text-rose-900 text-sm flex items-center gap-2">
                                <User className="h-4 w-4 text-rose-600" />
                                <span>Pihak Penggugat (Pembeli)</span>
                              </span>
                              <span className="font-bold text-[11px] text-rose-800">
                                {selectedDispute.buyer?.name}
                              </span>
                            </div>

                            <div className="space-y-1 text-slate-700">
                              <p>Email: <strong>{selectedDispute.buyer?.email || '-'}</strong></p>
                              <p>WhatsApp: <strong>{selectedDispute.buyer?.phone || '-'}</strong></p>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[11px] font-extrabold text-rose-900 block">
                                Pernyataan & Alasan Komplain:
                              </span>
                              <p className="text-slate-800 leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs">
                                "{selectedDispute.disputeReason || 'Barang tidak sesuai dengan deskripsi penjual.'}"
                              </p>
                            </div>

                            {/* Evidence Photo Gallery */}
                            {selectedDispute.disputeEvidenceUrls && selectedDispute.disputeEvidenceUrls.length > 0 && (
                              <div className="space-y-2 pt-1">
                                <span className="text-[11px] font-extrabold text-slate-700 block">
                                  Foto & Video Bukti Fisik / Unboxing (Klik untuk perbesar):
                                </span>
                                <div className="flex gap-2.5 flex-wrap">
                                  {selectedDispute.disputeEvidenceUrls.map((imgUrl: string, idx: number) => (
                                    <div
                                      key={idx}
                                      onClick={() => setPreviewImageUrl(imgUrl)}
                                      className="relative group cursor-pointer"
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Evidence ${idx + 1}`}
                                        className="h-20 w-20 rounded-xl object-cover border-2 border-slate-300 group-hover:border-brand-500 group-hover:scale-105 transition-all shadow-2xs"
                                      />
                                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                                        Perbesar
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Column 2: Seller & Logistics Details */}
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-3.5 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                              <span className="font-black text-slate-900 text-sm flex items-center gap-2">
                                <Building className="h-4 w-4 text-brand-600" />
                                <span>Pihak Tergugat (Penjual)</span>
                              </span>
                              <span className="font-bold text-[11px] text-slate-800">
                                {selectedDispute.seller?.name}
                              </span>
                            </div>

                            <div className="space-y-1 text-slate-700">
                              <p>WhatsApp: <strong>{selectedDispute.seller?.phone || '-'}</strong></p>
                              <p>Email: <strong>{selectedDispute.seller?.email || '-'}</strong></p>
                            </div>

                            {/* Bank Details */}
                            <div className="rounded-xl bg-white p-3 border border-slate-200 space-y-1 shadow-2xs">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Rekening Bank Pencairan Tujuan:
                              </span>
                              <p className="font-bold text-slate-900 text-xs">
                                {selectedDispute.seller?.bankName || 'Bank Central Asia (BCA)'}
                              </p>
                              <p className="font-mono text-slate-700 text-xs">
                                {selectedDispute.seller?.bankAccountNumber || '8271029384'} (a.n {selectedDispute.seller?.name})
                              </p>
                            </div>

                            {/* Logistics & Escrow Fee Breakdown */}
                            <div className="rounded-xl bg-white p-3 border border-slate-200 space-y-1 shadow-2xs">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Log Pengiriman & Rekber:
                              </span>
                              <div className="space-y-1 text-[11px] text-slate-600">
                                <p>Kurir: <strong>{selectedDispute.courierName || 'JNE Express'}</strong></p>
                                <p>No. Resi: <strong className="font-mono text-slate-900">{selectedDispute.trackingNumber || 'JNE-882910293'}</strong></p>
                                <div className="pt-1.5 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-xs">
                                  <span>Total Nilai Sengketa:</span>
                                  <span className="text-brand-700">{formatIDR(selectedDispute.totalAmount || selectedDispute.amount || 16560000)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Admin Decision Board */}
                        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-brand-600" />
                              <span>Panel Eksekusi Putusan Mediasi Petugas Rekber</span>
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Putusan ini bersifat mengikat dan akan langsung memproses arus dana escrow ke rekening tujuan.
                            </p>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              Catatan Investigasi / Pertimbangan Putusan Admin (Opsional):
                            </label>
                            <textarea
                              rows={2}
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Tuliskan ringkasan bukti verifikasi untuk catatan log mediasi..."
                              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-slate-200">
                            <button
                              type="button"
                              disabled={isProcessingAction}
                              onClick={() => handleResolveDispute(selectedDispute.id, 'REFUND_BUYER')}
                              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 px-6 py-3 text-xs font-bold text-white shadow-md shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <RefreshCw className="h-4 w-4" />
                              <span>🔄 Putuskan Refund Penuh ke Pembeli</span>
                            </button>

                            <button
                              type="button"
                              disabled={isProcessingAction}
                              onClick={() => handleResolveDispute(selectedDispute.id, 'RELEASE_TO_SELLER')}
                              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Check className="h-4 w-4" />
                              <span>💰 Putuskan Cairkan Dana ke Penjual</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Otherwise -> SHOW COMPACT CARD LIST */
                <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-3.5 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                        <span>Daftar Kasus Sengketa Aktif ({disputes.length} Kasus)</span>
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                        Pilih kasus sengketa di bawah ini untuk membuka halaman investigasi detail dan eksekusi putusan.
                      </p>
                    </div>
                  </div>

                  {disputes.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-800">Tidak Ada Sengketa Aktif</h4>
                      <p className="text-xs text-slate-400">Semua transaksi berjalan lancar tanpa perselisihan.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {disputes.map((d: any) => (
                        <div
                          key={d.id}
                          className="rounded-2xl border border-slate-200 bg-white hover:border-rose-300 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                        >
                          <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 text-[10px] font-black uppercase">
                                {d.orderNumber}
                              </span>
                              <span className="rounded-full bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                                Butuh Mediasi Admin
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                Diajukan {d.updatedAt ? formatTimeAgo(d.updatedAt) : 'baru saja'}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-bold text-sm text-slate-900 truncate">
                                {d.listing?.title || 'Barang Sengketa'}
                              </h4>
                              <p className="text-xs font-black text-brand-700 mt-0.5">
                                Nilai Sengketa: {formatIDR(d.totalAmount || d.amount || 16560000)}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                              <span>Pembeli: <strong>{d.buyer?.name}</strong></span>
                              <span>&bull;</span>
                              <span>Penjual: <strong>{d.seller?.name}</strong></span>
                            </div>

                            <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                              "{d.disputeReason || 'Barang tidak sesuai dengan foto dan deskripsi yang dicantumkan penjual.'}"
                            </p>
                          </div>

                          {/* Action Button to Open Detail */}
                          <div className="flex items-center justify-end lg:self-center shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                            <button
                              type="button"
                              onClick={() => setSelectedDisputeId(d.id)}
                              className="flex items-center gap-1.5 rounded-full bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
                            >
                              <span>Investigasi Kasus (Lihat Detail)</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-amber-600" />
                    <span>Daftar Pengajuan Verifikasi KYC KTP</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Validasi kesesuaian NIK, foto KTP, dan foto selfie pengguna sebelum memberikan lencana resmi.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {kycQueue.map((u: any) => (
                  <div
                    key={u.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={u.selfieImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={u.name}
                          className="h-12 w-12 rounded-2xl object-cover border border-slate-200"
                        />
                        {u.isKycVerified && (
                          <BadgeCheck className="h-4 w-4 text-brand-600 fill-brand-100 absolute -bottom-1 -right-1" />
                        )}
                      </div>

                      <div className="space-y-0.5 min-w-0 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm truncate">{u.name}</span>
                          {u.isKycVerified ? (
                            <span className="rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.2 text-[9px] font-bold">
                              ✓ Terverifikasi
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.2 text-[9px] font-bold">
                              Menunggu Persetujuan
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 font-mono text-[11px]">NIK: {u.nik || '3174092801950001'}</p>
                        <p className="text-slate-400 text-[10px]">Email: {u.email} &bull; WA: {u.phone || '-'}</p>
                      </div>
                    </div>

                    {/* KTP Image Preview & Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div
                          onClick={() => setPreviewImageUrl(u.ktpImageUrl)}
                          className="relative h-12 w-20 rounded-xl overflow-hidden border border-slate-300 bg-white cursor-pointer hover:ring-2 hover:ring-brand-500 transition-all"
                          title="Klik untuk perbesar KTP"
                        >
                          <img src={u.ktpImageUrl} alt="KTP" className="h-full w-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[8px] text-center font-bold">
                            Foto KTP
                          </span>
                        </div>

                        <div
                          onClick={() => setPreviewImageUrl(u.selfieImageUrl)}
                          className="relative h-12 w-12 rounded-xl overflow-hidden border border-slate-300 bg-white cursor-pointer hover:ring-2 hover:ring-brand-500 transition-all"
                          title="Klik untuk perbesar Selfie"
                        >
                          <img src={u.selfieImageUrl} alt="Selfie" className="h-full w-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[8px] text-center font-bold">
                            Selfie
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!u.isKycVerified ? (
                          <>
                            <button
                              type="button"
                              disabled={isProcessingAction}
                              onClick={() => handleApproveKyc(u.id)}
                              className="flex items-center gap-1 rounded-full bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Setujui (Approve)</span>
                            </button>
                            <button
                              type="button"
                              disabled={isProcessingAction}
                              onClick={() => handleRejectKyc(u.id)}
                              className="flex items-center gap-1 rounded-full bg-slate-200 hover:bg-rose-50 hover:text-rose-700 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer disabled:opacity-50"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Tolak</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={isProcessingAction}
                            onClick={() => handleRejectKyc(u.id)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 hover:text-rose-600 cursor-pointer"
                          >
                            Cabut Verifikasi
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <span>Riwayat Transfer Pencairan Dana Rekber ke Penjual</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Log transfer otomatis settlement ke rekening bank setelah 48 jam masa garansi selesai.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2.5">No Pesanan & Barang</th>
                      <th className="pb-2.5">Penjual</th>
                      <th className="pb-2.5">Rekening Bank Tujuan</th>
                      <th className="pb-2.5">Jumlah Dana</th>
                      <th className="pb-2.5">Status Transfer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {payouts.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 pr-3">
                          <span className="font-mono font-bold text-slate-900 block text-[11px]">{p.orderNumber}</span>
                          <span className="text-slate-500 text-[11px] block truncate max-w-xs">{p.listingTitle}</span>
                        </td>
                        <td className="py-3 pr-3 font-bold text-slate-900">{p.sellerName}</td>
                        <td className="py-3 pr-3">
                          <span className="font-bold text-slate-900 block">{p.payoutBank}</span>
                          <span className="font-mono text-slate-500 text-[11px] block">{p.payoutAccountNumber} (a.n {p.payoutAccountHolder})</span>
                        </td>
                        <td className="py-3 pr-3 font-black text-brand-700 text-sm">
                          {formatIDR(p.amount)}
                        </td>
                        <td className="py-3">
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold inline-flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            <span>Berhasil Ditransfer</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span>Manajemen & Moderasi Iklan Barang ({listings.length})</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Takedown iklan yang melanggar aturan atau aktifkan kembali listing.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {listings.map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200/80 p-3.5 bg-white flex gap-3 items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80'}
                        alt={item.title}
                        className="h-14 w-14 rounded-xl object-cover border border-slate-100 shrink-0"
                      />
                      <div className="space-y-0.5 min-w-0 text-xs">
                        <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                        <p className="font-black text-brand-700">{formatIDR(item.price)}</p>
                        <span className="text-[10px] text-slate-400 block">
                          Penjual: {item.seller?.name || 'User'} &bull; Status: <strong>{item.status}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/listing/${item.slug || item.id}`}
                        target="_blank"
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        title="Lihat Iklan"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleToggleListingStatus(item.id, item.status)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          item.status === 'ACTIVE'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {item.status === 'ACTIVE' ? 'Takedown' : 'Aktifkan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Fullscreen Image Preview Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs cursor-pointer animate-in fade-in"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] w-full flex flex-col items-center">
            <img
              src={previewImageUrl}
              alt="Dokumen"
              className="max-h-[80vh] w-auto object-contain rounded-2xl border-2 border-white/20 shadow-2xl"
            />
            <p className="text-white text-xs font-bold mt-2">Klik di mana saja untuk menutup pratinjau</p>
          </div>
        </div>
      )}
    </div>
  );
}
