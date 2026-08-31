'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  UploadCloud
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

export default function JualBarangPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, openAuthModal } = useAuth();
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories()
  });

  const categories = categoriesData?.data || [];

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > 10) {
      alert('Maksimal total 10 foto per barang');
      return;
    }

    setIsUploadingImage(true);
    setErrorMsg(null);

    const uploadPromises = Array.from(files).map(async (file) => {
      // Validate file size
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

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
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
  };

  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-md w-full rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-lg shadow-slate-200/50">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 shadow-xs">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Masuk untuk Jual Barang
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
            Demi keamanan bersama dan perlindungan anti-penipuan di ekosistem Rekber JBB, Anda harus masuk atau mendaftarkan akun terlebih dahulu sebelum memasang iklan.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={openAuthModal}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 hover:scale-101 transition-all cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span>Masuk / Daftar Sekarang</span>
            </button>
            <Link
              href="/"
              className="block w-full text-xs font-semibold text-slate-500 hover:text-slate-800 py-1.5 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name || categories[0]?.name || 'HP & Gadget';
  const primaryImagePreview = imageUrls[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Penjualan Saya', href: '/orders?role=seller' },
            { label: 'Pasang Iklan Baru' }
          ]}
        />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Pasang Iklan Jual Barang Bekas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Isi detail barang secara jujur dan transparan untuk meningkatkan kepercayaan calon pembeli.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-800 border border-brand-200 shrink-0">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            <span>Garansi Rekber Otomatis Aktif</span>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-700 border border-rose-200 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Inputs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Photos Upload */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UploadCloud className="h-4 w-4 text-brand-600" />
                  <h2 className="text-sm font-black text-slate-900">
                    1. Foto Barang Bekas (Maks. 10 Foto)
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  {imageUrls.length}/10 Foto
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Unggah foto bagian depan, belakang, sudut lecet/minus (jika ada), dan nota/dus bawaan.
              </p>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />

              {/* Drag & Drop Upload Dropzone Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-3xl border-2 border-dashed p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                  isDragging
                    ? 'border-brand-500 bg-brand-50/80 scale-[1.01]'
                    : isUploadingImage
                    ? 'border-slate-300 bg-slate-50 opacity-70 pointer-events-none'
                    : 'border-slate-300 bg-slate-50/60 hover:bg-slate-50 hover:border-brand-400'
                }`}
              >
                {isUploadingImage ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
                    <span className="text-xs font-bold text-slate-800">
                      Sedang Mengunggah Foto...
                    </span>
                    <span className="text-[10px] text-slate-400">Mohon tunggu sebentar</span>
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-brand-600 shadow-xs">
                      <Camera className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-slate-900">
                        Klik untuk Pilih Foto dari Galeri / Kamera HP
                      </p>
                      <p className="text-[11px] text-slate-500">
                        atau seret foto langsung ke sini (JPG, PNG, WEBP, HEIC &bull; Maks. 5 MB)
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800 transition-colors pointer-events-none mt-1 shadow-2xs"
                    >
                      + Pilih Foto dari Perangkat
                    </button>
                  </>
                )}
              </div>

              {/* Preset Sample Photos for Fast Demo Testing */}
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Pilihan Cepat Contoh Foto Demo:</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_DEMO_PHOTOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSetPreset(preset.urls)}
                      className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 hover:border-brand-300 px-2.5 py-1 text-[10px] font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
                    >
                      + {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Uploaded Grid Preview */}
              {imageUrls.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold">Foto yang Diunggah ({imageUrls.length}/10):</span>
                    <span className="text-[10px] text-slate-400">Foto pertama adalah foto sampul (Cover)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl border border-slate-200 overflow-hidden group shadow-2xs bg-slate-100">
                        <img src={url} alt={`Upload ${idx + 1}`} className="h-full w-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-2 left-2 rounded-md bg-brand-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs">
                            ★ Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 cursor-pointer"
                          title="Hapus foto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Manual URL input */}
              <div className="pt-1">
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Atau masukkan URL gambar online langsung..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="flex items-center gap-1 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah URL</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Info & Condition */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-600" />
                <span>2. Informasi & Kondisi Fisik</span>
              </h2>

              <div>
                <label className="text-xs font-bold text-slate-700">Judul Iklan Barang</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: iPhone 13 Pro 128GB Sierra Blue Resmi iBox Fullset Mulus"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-900 font-bold mt-1 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">Kategori</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-800 font-bold mt-1 focus:border-brand-500 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Tahun Pembelian</label>
                  <input
                    type="number"
                    min={2010}
                    max={2026}
                    value={purchaseYear}
                    onChange={(e) => setPurchaseYear(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-800 font-bold mt-1 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Condition Cards */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Tingkat Kondisi Fisik</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'LIKE_NEW', label: '🟢 Seperti Baru (95%+)', desc: 'Mulus total, pemakaian sangat minim' },
                    { id: 'USED_EXCELLENT', label: '🔵 Bekas Bagus (85%+)', desc: 'Lecet halus wajar pemakaian harian' },
                    { id: 'USED_GOOD', label: '🟡 Bekas Wajar (70%+)', desc: 'Ada baret terlihat, semua fungsi 100%' },
                    { id: 'USED_FAIR', label: '🟠 Ada Minus Minor', desc: 'Ada dent / minus kecil dijelaskan di deskripsi' },
                    { id: 'FOR_PARTS', label: '⚪ Kanibalan / Rusak', desc: 'Hanya untuk suku cadang / teknisi' }
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCondition(c.id as ItemCondition)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        condition === c.id
                          ? 'border-brand-600 bg-brand-50/70 text-slate-900 ring-2 ring-brand-500/20 shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-xs font-black block">{c.label}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Completeness checklist */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Kelengkapan Barang</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'FULLSET', label: 'Fullset Dus & Aksesoris' },
                    { id: 'UNIT_ONLY', label: 'Batangan / Unit Saja' },
                    { id: 'BOX_UNIT', label: 'Unit + Dus Bawaan' },
                    { id: 'WITH_RECEIPT', label: 'Ada Nota Pembelian Asli' }
                  ].map((comp) => {
                    const isChecked = completeness.includes(comp.id as Completeness);
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => toggleCompleteness(comp.id as Completeness)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3" />}
                        <span>{comp.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Deskripsi Kondisi & Catatan Penjual</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Jelaskan riwayat pemakaian, kelengkapan yang disertakan, minus lecet jika ada, dan alasan dijual secara transparan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-800 mt-1 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Section 3: Pricing & Nego Limits */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand-600" />
                <span>3. Harga & Proteksi Nego</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">Harga Jual Bekas (Rp)</label>
                  <input
                    type="number"
                    required
                    min={10000}
                    placeholder="Contoh: 9850000"
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 text-sm font-black text-brand-700 mt-1 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                  {price > 0 && (
                    <span className="text-[11px] font-bold text-slate-500 block mt-1">
                      = {formatIDR(price)}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Harga Beli Baru Dulu (Opsional)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 18499000"
                    value={originalPrice || ''}
                    onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-800 font-bold mt-1 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                  {savings && (
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-block mt-1">
                      🔥 Hemat {formatIDR(savings.discount)} (-{savings.percent}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Nego Checkbox & Anti-Lowballing Limit */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Izinkan Calon Pembeli Menawar (Nego Resmi 24 Jam)</span>
                    <span className="text-[11px] text-slate-500 block">Pembeli dapat mengajukan tawaran dan Anda bisa menerima atau menawar balik.</span>
                  </div>
                </label>

                {isNegotiable && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-2 animate-in fade-in">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Batas Minimal Tawaran yang Diterima (Opsional Anti-Sadis):
                    </label>
                    <input
                      type="number"
                      placeholder="Contoh: 9200000 (Tawaran di bawah ini otomatis ditolak)"
                      value={minOfferPrice || ''}
                      onChange={(e) => setMinOfferPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-bold text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                    {price > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400">Preset Cepat:</span>
                        {[
                          { label: '-5%', val: Math.round(price * 0.95) },
                          { label: '-10%', val: Math.round(price * 0.9) },
                          { label: '-15%', val: Math.round(price * 0.85) }
                        ].map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setMinOfferPrice(p.val)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            {p.label} ({formatIDR(p.val)})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Location & COD */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-600" />
                <span>4. Lokasi & Titik Temu COD</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Provinsi</label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-xs text-slate-800 font-bold mt-1 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Kota / Kabupaten</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-xs text-slate-800 font-bold mt-1 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Kecamatan</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-xs text-slate-800 font-bold mt-1 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCodAvailable}
                    onChange={(e) => setIsCodAvailable(e.target.checked)}
                    className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs font-bold text-slate-900">Sedia COD Ketemuan Langsung (Rekomendasi Area Publik)</span>
                </label>

                {isCodAvailable && (
                  <div className="pt-2 border-t border-slate-200/80 animate-in fade-in">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Titik Temu COD yang Direkomendasikan:</label>
                    <input
                      type="text"
                      placeholder="Contoh: Gandaria City / Starbucks Blok M Plaza (Area Terang & Publik)"
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
              className="w-full rounded-2xl bg-brand-600 hover:bg-brand-700 py-3.5 text-sm font-black text-white shadow-lg shadow-brand-600/25 transition-all hover:scale-101 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Mempublikasikan Iklan...</span>
              ) : isUploadingImage ? (
                <span>Sedang Mengupload Gambar...</span>
              ) : (
                <>
                  <span>Publikasikan Iklan Sekarang</span>
                  <ArrowRight className="h-4 w-4 stroke-3" />
                </>
              )}
            </button>
          </div>

          {/* Right Column: Sticky Live Preview & Seller Tips (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Live Preview Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
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
                  <div className="absolute top-2.5 left-2.5">
                    <ConditionBadge condition={condition} size="sm" />
                  </div>
                  {isCodAvailable && (
                    <div className="absolute top-2.5 right-2.5 rounded-full bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1">
                      <Zap className="h-2.5 w-2.5 text-brand-400" />
                      <span>COD Ready</span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {selectedCategoryName}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                    {title || 'Judul Barang Bekas Anda...'}
                  </h3>

                  <div className="pt-1 flex items-baseline justify-between">
                    <div>
                      <span className="text-base font-black text-brand-700">
                        {price > 0 ? formatIDR(price) : 'Rp 0'}
                      </span>
                      {originalPrice && originalPrice > price && (
                        <span className="text-xs text-slate-400 line-through block -mt-0.5">
                          {formatIDR(originalPrice)}
                        </span>
                      )}
                    </div>
                    {isNegotiable && (
                      <span className="rounded-md bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                        Bisa Nego
                      </span>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px] text-slate-500">
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
            <div className="rounded-3xl border border-brand-200/80 bg-brand-50/50 p-5 space-y-3 text-xs">
              <h4 className="font-black text-brand-950 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-700" />
                <span>Tips Cepat Laku di Rekber JBB</span>
              </h4>
              <ul className="space-y-2 text-brand-900 leading-relaxed text-[11px]">
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">✓</span>
                  <span><strong>Foto Asli & Jelas:</strong> Upload foto langsung dari kamera HP atau galeri Anda agar calon pembeli yakin barang real & original.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">✓</span>
                  <span><strong>Deskripsi Jujur:</strong> Tulis minus lecet secara transparan untuk menjaga reputasi Trust Score 5.0.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">✓</span>
                  <span><strong>Keamanan Rekber:</strong> Pembeli langsung membayar dana ke Rekber JBB, dana Anda dijamin cair setelah barang tiba & dicek.</span>
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
