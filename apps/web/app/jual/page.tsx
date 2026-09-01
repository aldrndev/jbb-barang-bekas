'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useAuth } from '../../context/auth-context';
import { formatIDR } from '../../lib/utils';
import { ItemCondition, Completeness } from '@jbb/types';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';
import { ConditionBadge } from '../../components/marketplace/condition-badge';
import {
  Upload,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  User,
  MapPin,
  HelpCircle,
  Tag,
  Eye,
  Check,
  Flame,
  Camera,
  Layers,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  Edit3
} from 'lucide-react';

const PRESET_DEMO_PHOTOS = [
  {
    name: 'iPhone 13 Pro',
    urls: [
      'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'MacBook Pro',
    urls: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'Kamera Sony A6400',
    urls: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'PS5 Digital',
    urls: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'Nike Dunk Panda',
    urls: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80'
    ]
  }
];

function JualBarangContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('editId');
  const isEditMode = Boolean(editId);

  const queryClient = useQueryClient();
  const { user, openAuthModal, loginAsDemoSeller } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('LIKE_NEW');
  const [completeness, setCompleteness] = useState<Completeness[]>(['FULLSET']);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [minOfferPrice, setMinOfferPrice] = useState<number | undefined>(undefined);
  const [purchaseYear, setPurchaseYear] = useState<number>(2023);
  const [hasOriginalReceipt, setHasOriginalReceipt] = useState(false);

  // Location
  const [province, setProvince] = useState('DKI Jakarta');
  const [city, setCity] = useState('Jakarta Selatan');
  const [district, setDistrict] = useState('Kebayoran Baru');
  const [isCodAvailable, setIsCodAvailable] = useState(true);
  const [codMeetingPoint, setCodMeetingPoint] = useState('');

  // Images & Cloudflare Upload
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&auto=format&fit=crop&q=80'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories()
  });

  const categories = categoriesData?.data || [];

  // Fetch listing if in edit mode
  const { data: editListingData } = useQuery({
    queryKey: ['edit-listing', editId],
    queryFn: () => api.getListingDetail(editId!),
    enabled: isEditMode
  });

  // Prepopulate form fields when in edit mode
  useEffect(() => {
    if (editListingData?.data && !isDataLoaded) {
      const item = editListingData.data;
      setTitle(item.title || '');
      setCategoryId(item.categoryId || '');
      setCondition(item.condition || 'LIKE_NEW');
      if (Array.isArray(item.completeness)) {
        setCompleteness(item.completeness);
      }
      setDescription(item.description || '');
      setPrice(item.price || 0);
      setOriginalPrice(item.originalPrice || undefined);
      setIsNegotiable(Boolean(item.isNegotiable));
      setMinOfferPrice(item.minOfferPrice || undefined);
      setPurchaseYear(item.purchaseYear || 2023);
      setHasOriginalReceipt(Boolean(item.hasOriginalReceipt));
      setProvince(item.province || 'DKI Jakarta');
      setCity(item.city || 'Jakarta Selatan');
      setDistrict(item.district || 'Kebayoran Baru');
      setIsCodAvailable(Boolean(item.isCodAvailable));
      setCodMeetingPoint(item.codMeetingPoint || '');
      if (item.images && item.images.length > 0) {
        setImageUrls(item.images.map((img) => img.url));
      }
      setIsDataLoaded(true);
    }
  }, [editListingData, isDataLoaded]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > 10) {
      alert('Maksimal total 10 foto per barang');
      return;
    }

    setIsUploadingImage(true);
    setErrorMsg(null);

    const uploadPromises = Array.from(files).map(async (file) => {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File "${file.name}" melebihi batas 5 MB`);
      }
      const res = await api.uploadImage(file);
      if (res.success && res.data?.url) {
        return res.data.url;
      } else {
        throw new Error(res.error?.message || `Gagal mengupload ${file.name}`);
      }
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      setImageUrls((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengupload foto ke Cloudflare Storage');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleRemoveImage = (idx: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== idx));
  };

  const handleSetPreset = (presetUrls: string[]) => {
    setImageUrls(presetUrls);
  };

  const toggleCompleteness = (val: Completeness) => {
    if (completeness.includes(val)) {
      setCompleteness(completeness.filter((c) => c !== val));
    } else {
      setCompleteness([...completeness, val]);
    }
  };

  const calculateDiscount = () => {
    if (originalPrice && originalPrice > price && price > 0) {
      const discount = originalPrice - price;
      const percent = Math.round((discount / originalPrice) * 100);
      return { discount, percent };
    }
    return null;
  };

  const savings = calculateDiscount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Judul barang wajib diisi');
      return;
    }

    if (price <= 0) {
      setErrorMsg('Harga jual harus lebih dari Rp 0');
      return;
    }

    if (imageUrls.length === 0) {
      setErrorMsg('Harap masukkan minimal 1 foto barang');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      categoryId: categoryId || categories[0]?.id || 'cat-gadget',
      condition,
      completeness,
      description: description.trim() || 'Barang terawat kondisi bagus sesuai foto.',
      price,
      originalPrice: originalPrice || undefined,
      isNegotiable,
      minOfferPrice: isNegotiable && minOfferPrice ? minOfferPrice : undefined,
      purchaseYear: purchaseYear || undefined,
      hasOriginalReceipt,
      province,
      city,
      district,
      isCodAvailable,
      codMeetingPoint: isCodAvailable ? codMeetingPoint || undefined : undefined,
      imageUrls
    };

    if (isEditMode && editId) {
      const res = await api.updateListing(editId, payload);
      if (res.success && res.data) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['listings'] }),
          queryClient.invalidateQueries({ queryKey: ['featured-listings'] }),
          queryClient.invalidateQueries({ queryKey: ['my-listings'] }),
          queryClient.invalidateQueries({ queryKey: ['listing', editId] }),
          queryClient.invalidateQueries({ queryKey: ['edit-listing', editId] })
        ]);
        alert('Perubahan iklan berhasil disimpan!');
        router.push(`/listing/${res.data.slug || res.data.id}`);
      } else {
        setErrorMsg(res.error?.message || 'Gagal memperbarui listing. Periksa form Anda.');
        setIsSubmitting(false);
      }
    } else {
      const res = await api.createListing(payload);
      if (res.success && res.data) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['listings'] }),
          queryClient.invalidateQueries({ queryKey: ['featured-listings'] }),
          queryClient.invalidateQueries({ queryKey: ['my-listings'] })
        ]);
        router.push(`/listing/${res.data.slug || res.data.id}`);
      } else {
        setErrorMsg(res.error?.message || 'Gagal mempublikasikan listing. Periksa form Anda.');
        setIsSubmitting(false);
      }
    }
  };

  if (!user) {
    return (
      <div className="bg-slate-50 px-4 py-12 flex items-center justify-center">
        <div className="mx-auto max-w-md w-full rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 text-center shadow-xs space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 shadow-xs">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900">
            {isEditMode ? 'Masuk untuk Mengedit Iklan' : 'Masuk untuk Jual Barang'}
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Demi keamanan bersama dan perlindungan anti-penipuan di ekosistem Rekber JBB, Anda harus masuk sebagai penjual terdaftar.
          </p>

          <div className="pt-2 space-y-2">
            <button
              onClick={loginAsDemoSeller}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Masuk Demo Penjual (Budi)</span>
            </button>
            <button
              onClick={openAuthModal}
              className="w-full flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 px-6 py-2.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <User className="h-3.5 w-3.5" />
              <span>Masuk Akun Lain</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name || categories[0]?.name || 'HP & Gadget';
  const primaryImagePreview = imageUrls[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="bg-slate-50 py-3 sm:py-6 px-3.5 sm:px-6 lg:px-8 pb-6 sm:pb-8">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-5">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Penjualan Saya', href: '/orders?role=seller' },
            { label: 'Barang yang Dijual', href: '/my-listings' },
            { label: isEditMode ? 'Edit Iklan' : 'Pasang Iklan Baru' }
          ]}
        />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="min-w-0">
            <h1 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Edit3 className="h-5 w-5 text-brand-600 shrink-0" />
                  <span>Edit Iklan Barang Bekas</span>
                </>
              ) : (
                <>
                  <Tag className="h-5 w-5 text-brand-600 shrink-0" />
                  <span>Pasang Iklan Jual Barang Bekas</span>
                </>
              )}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              {isEditMode
                ? 'Perbarui spesifikasi, foto, harga, atau lokasi titik temu COD'
                : 'Isi detail barang secara jujur untuk meningkatkan kepercayaan calon pembeli'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="lg:hidden flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5 text-brand-600" />
              <span>{showMobilePreview ? 'Tutup Pratinjau' : 'Lihat Pratinjau Iklan'}</span>
            </button>

            <div className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] sm:text-xs font-bold text-brand-800 border border-brand-200 shrink-0">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
              <span>Garansi Rekber JBB</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-700 border border-rose-200 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mobile Expandable Live Preview */}
        {showMobilePreview && (
          <div className="lg:hidden rounded-3xl border border-brand-200 bg-white p-4 shadow-xs space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-brand-600" />
                <span>Pratinjau Tampilan Iklan di Mobile</span>
              </span>
              <span className="rounded-full bg-emerald-50 text-brand-800 border border-brand-200 px-2 py-0.5 text-[9px] font-bold">
                Live
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs max-w-sm mx-auto">
              <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                <img
                  src={primaryImagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 z-10">
                  <ConditionBadge condition={condition} size="sm" />
                </div>
                {isCodAvailable && (
                  <div className="absolute bottom-2 left-2 z-10 rounded-full bg-amber-50/95 px-2.5 py-0.5 text-[9px] font-bold text-amber-950 border border-amber-300 backdrop-blur-md shadow-2xs flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5 text-amber-600 fill-amber-400" />
                    <span>Siap COD</span>
                  </div>
                )}
              </div>

              <div className="p-3 space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  {selectedCategoryName}
                </span>
                <h3 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                  {title || 'Judul Barang Bekas Anda'}
                </h3>
                <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-slate-100">
                  <span className="text-sm font-black text-brand-700">
                    {price > 0 ? formatIDR(price) : 'Rp 0'}
                  </span>
                  {isNegotiable && (
                    <span className="rounded bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 text-[9px] font-bold">
                      Bisa Nego
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column: Form Fields (7 Cols) */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-5">
            {/* Section 1: Photos */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-brand-600" />
                  <span>1. Foto Barang Bekas Asli ({imageUrls.length}/10)</span>
                </h2>
                <span className="text-[10px] text-slate-400 font-bold">Maks 10 Foto</span>
              </div>

              {/* Cloudflare Direct Drag & Drop Upload Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 sm:p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-brand-500 bg-brand-50/60 scale-101'
                    : 'border-slate-300 bg-slate-50/70 hover:border-brand-400 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />

                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white shadow-xs text-brand-600 border border-slate-200 mb-2">
                  {isUploadingImage ? (
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-brand-600" />
                  ) : (
                    <UploadCloud className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">
                    {isUploadingImage ? 'Mengupload ke Cloudflare Storage...' : 'Pilih Foto dari Galeri / Kamera'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Mendukung JPG, PNG, WEBP (Maks 5 MB per foto)
                  </p>
                </div>
              </div>

              {/* Image Previews Grid */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                  {imageUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
                    >
                      <img src={url} alt={`Upload ${idx + 1}`} className="h-full w-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 rounded-md bg-brand-600 px-1.5 py-0.2 text-[8px] font-black text-white shadow-xs">
                          Utama
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="absolute top-1 right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-900/75 text-white hover:bg-rose-600 transition-colors shadow-xs"
                      >
                        <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Demo Photos Quick Preset */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  Foto Demo Cepat:
                </span>
                <div className="flex flex-wrap gap-1">
                  {PRESET_DEMO_PHOTOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSetPreset(preset.urls)}
                      className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-slate-600 transition-colors cursor-pointer shadow-2xs"
                    >
                      + {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Info & Category */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs space-y-3.5">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand-600" />
                <span>2. Informasi & Spesifikasi Barang</span>
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-800">
                    Judul Iklan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MacBook Pro 14 M1 Pro 16/512GB Space Grey Fullset"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs sm:text-sm text-slate-900 font-bold mt-1 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800">Kategori</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs sm:text-sm text-slate-800 font-bold mt-1 focus:border-brand-500 focus:bg-white focus:outline-none cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800">Kondisi Fisik</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as ItemCondition)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs sm:text-sm text-slate-800 font-bold mt-1 focus:border-brand-500 focus:bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="LIKE_NEW">Sangat Mulus (95-99%)</option>
                      <option value="LIGHTLY_USED">Mulus Terawat (85-94%)</option>
                      <option value="WELL_USED">Pemakaian Wajar (70-84%)</option>
                      <option value="HEAVILY_USED">Kondisi Minus / Batangan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800">Kelengkapan Paket</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mt-1">
                    {[
                      { id: 'FULLSET', label: 'Fullset Dus' },
                      { id: 'UNIT_ONLY', label: 'Unit Saja' },
                      { id: 'CHARGER', label: 'Charger Asli' },
                      { id: 'BOX', label: 'Dus / Box' }
                    ].map((comp) => {
                      const isChecked = completeness.includes(comp.id as Completeness);
                      return (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => toggleCompleteness(comp.id as Completeness)}
                          className={`rounded-xl border p-2 text-center text-xs font-bold transition-all cursor-pointer ${
                            isChecked
                              ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-2xs'
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {comp.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800">
                    Deskripsi & Kejujuran Fisik <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Jelaskan kondisi barang, riwayat pemakaian, minus baret halus bila ada, battery health, dll..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 sm:p-3 text-xs text-slate-900 mt-1 focus:border-brand-500 focus:bg-white focus:outline-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Pricing & Nego */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs space-y-3.5">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand-600" />
                <span>3. Harga Jual & Pengaturan Nego</span>
              </h2>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800">
                      Harga Jual (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      placeholder="Contoh: 15500000"
                      value={price || ''}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 text-sm sm:text-base text-brand-700 font-black mt-1 focus:border-brand-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800">Harga Beli Baru (Opsional)</label>
                    <input
                      type="number"
                      placeholder="Contoh: 21000000"
                      value={originalPrice || ''}
                      onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs sm:text-sm text-slate-700 font-bold mt-1 focus:border-brand-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {savings && (
                  <div className="rounded-2xl bg-emerald-50 p-2.5 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Pembeli hemat {formatIDR(savings.discount)} ({savings.percent}% lebih murah)!</span>
                  </div>
                )}

                {/* Nego Switcher */}
                <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Izinkan Fitur Nego Rekber</span>
                      <span className="text-[10px] text-slate-500">Calon pembeli bisa mengajukan tawaran</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isNegotiable}
                        onChange={(e) => setIsNegotiable(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
                    </label>
                  </div>

                  {isNegotiable && (
                    <div className="pt-2 border-t border-slate-200 space-y-1 animate-in fade-in">
                      <label className="text-[10px] font-bold text-slate-700 block">
                        Batas Harga Nego Minimal (Opsional)
                      </label>
                      <input
                        type="number"
                        placeholder="Tawaran di bawah harga ini akan ditolak otomatis..."
                        value={minOfferPrice || ''}
                        onChange={(e) => setMinOfferPrice(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-bold text-slate-900 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Location & COD */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs space-y-3.5">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-600" />
                <span>4. Lokasi & Titik Temu COD</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-700">Provinsi</label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-xs text-slate-800 font-bold mt-0.5 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700">Kota / Kabupaten</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-xs text-slate-800 font-bold mt-0.5 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700">Kecamatan</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-xs text-slate-800 font-bold mt-0.5 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCodAvailable}
                    onChange={(e) => setIsCodAvailable(e.target.checked)}
                    className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs font-bold text-slate-900">Sedia COD Ketemuan Langsung (Area Publik Aman)</span>
                </label>

                {isCodAvailable && (
                  <div className="pt-2 border-t border-slate-200 space-y-1 animate-in fade-in">
                    <label className="text-[10px] font-bold text-slate-700 block">Titik Temu COD:</label>
                    <input
                      type="text"
                      placeholder="Contoh: Gandaria City / Starbucks Blok M Plaza"
                      value={codMeetingPoint}
                      onChange={(e) => setCodMeetingPoint(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-bold text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="w-full rounded-2xl bg-brand-600 hover:bg-brand-700 py-3.5 text-xs sm:text-sm font-black text-white shadow-md shadow-brand-600/25 transition-all hover:scale-101 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>{isEditMode ? 'Menyimpan Perubahan...' : 'Mempublikasikan Iklan...'}</span>
              ) : isUploadingImage ? (
                <span>Sedang Mengupload Gambar...</span>
              ) : isEditMode ? (
                <>
                  <Check className="h-4 w-4 stroke-3" />
                  <span>Simpan Perubahan Iklan</span>
                </>
              ) : (
                <>
                  <span>Publikasikan Iklan Sekarang</span>
                  <ArrowRight className="h-4 w-4 stroke-3" />
                </>
              )}
            </button>
          </div>

          {/* Right Column: Sticky Live Preview & Seller Tips (Desktop 5 Cols) */}
          <div className="hidden lg:block lg:col-span-5 space-y-4 sm:space-y-5 lg:sticky lg:top-24">
            {/* Live Preview Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-brand-600" />
                  <span className="text-xs font-black text-slate-900">Pratinjau Tampilan Iklan</span>
                </div>
                <span className="rounded-full bg-emerald-50 text-brand-800 border border-brand-200 px-2 py-0.5 text-[10px] font-bold animate-pulse">
                  Live Preview
                </span>
              </div>

              {/* Mock Product Card in Marketplace */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={primaryImagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <ConditionBadge condition={condition} size="sm" />
                  </div>
                  {isCodAvailable && (
                    <div className="absolute bottom-2 left-2 z-10 rounded-full bg-amber-50/95 px-2.5 py-0.5 text-[9px] font-bold text-amber-950 border border-amber-300 backdrop-blur-md shadow-2xs flex items-center gap-1">
                      <Zap className="h-2.5 w-2.5 text-amber-600 fill-amber-400" />
                      <span>Siap COD</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {selectedCategoryName}
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                    {title || 'Judul Barang Bekas Anda'}
                  </h3>

                  <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm sm:text-base font-black text-brand-700">
                        {price > 0 ? formatIDR(price) : 'Rp 0'}
                      </span>
                      {originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatIDR(originalPrice)}
                        </span>
                      )}
                    </div>
                    {isNegotiable && (
                      <span className="rounded-md bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 text-[9px] font-bold">
                        Bisa Nego
                      </span>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {city || 'Lokasi'}
                    </span>
                    <span className="font-semibold text-slate-700">
                      Penjual: {user.name.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Selling Tips */}
            <div className="rounded-3xl border border-brand-200/80 bg-brand-50/50 p-4 sm:p-5 space-y-2.5 text-xs">
              <h4 className="font-black text-brand-950 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-700" />
                <span>Tips Cepat Laku di Rekber JBB</span>
              </h4>
              <ul className="space-y-1.5 text-brand-900 leading-relaxed text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-brand-600 font-bold">✓</span>
                  <span><strong>Foto Asli & Jelas:</strong> Upload foto langsung dari kamera HP agar calon pembeli yakin barang real & original.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-brand-600 font-bold">✓</span>
                  <span><strong>Deskripsi Jujur:</strong> Tulis minus lecet secara transparan untuk menjaga reputasi Trust Score 5.0.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-brand-600 font-bold">✓</span>
                  <span><strong>Keamanan Rekber:</strong> Pembeli langsung membayar ke Rekber JBB, dana Anda dijamin cair setelah barang tiba & dicek 48 jam.</span>
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JualBarangPage() {
  return (
    <Suspense fallback={<div className="bg-slate-50 py-12 text-center text-xs text-slate-400">Memuat formulir iklan...</div>}>
      <JualBarangContent />
    </Suspense>
  );
}
