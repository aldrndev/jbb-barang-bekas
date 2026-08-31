'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useAuth } from '../../context/auth-context';
import { formatIDR } from '../../lib/utils';
import type { ItemCondition, Completeness } from '@jbb/types';
import {
  Upload,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  HelpCircle,
  ArrowRight,
  Lock,
  User
} from 'lucide-react';

export default function JualBarangPage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

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

  // Images
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories()
  });

  const categories = categoriesData?.data || [];

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== idx));
  };

  const toggleCompleteness = (val: Completeness) => {
    if (completeness.includes(val)) {
      setCompleteness(completeness.filter((c) => c !== val));
    } else {
      setCompleteness([...completeness, val]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    if (imageUrls.length === 0) {
      setErrorMsg('Harap masukkan minimal 1 URL foto barang');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    const payload = {
      title,
      categoryId: categoryId || categories[0]?.id || 'cat-gadget',
      condition,
      completeness,
      description,
      price,
      originalPrice: originalPrice || undefined,
      isNegotiable,
      minOfferPrice: minOfferPrice || undefined,
      purchaseYear: purchaseYear || undefined,
      hasOriginalReceipt,
      province,
      city,
      district,
      isCodAvailable,
      codMeetingPoint: codMeetingPoint || undefined,
      imageUrls
    };

    const res = await api.createListing(payload);

    if (res.success && res.data) {
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

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Pasang Iklan Jual Barang Bekas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Isi detail barang secara jujur dan transparan untuk meningkatkan kepercayaan calon pembeli.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Photos */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h2 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
              <Upload className="h-4 w-4 text-emerald-600" />
              <span>1. Foto Barang Bekas (Maks. 10 Foto)</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Foto bagian depan, belakang, sudut lecet/minus (jika ada), dan nota/kelengkapan dus.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl border border-slate-200 overflow-hidden group">
                  <img src={url} alt={`Upload ${idx + 1}`} className="h-full w-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      Foto Utama
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 rounded-full bg-slate-900/80 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="url"
                placeholder="Tempel URL foto (misal dari Unsplash / CDN)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Foto</span>
              </button>
            </div>
          </div>

          {/* Section 2: Info & Condition */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>2. Informasi & Kondisi Fisik</span>
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-700">Judul Barang</label>
              <input
                type="text"
                required
                placeholder="Contoh: iPhone 13 Pro 128GB Sierra Blue Resmi iBox Fullset"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 mt-1 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Kategori</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 mt-1 bg-white focus:border-emerald-500 focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 mt-1 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Condition selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Tingkat Kondisi Fisik</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'LIKE_NEW', label: 'Seperti Baru (95%+)', desc: 'Mulus total, pemakaian minim' },
                  { id: 'USED_EXCELLENT', label: 'Bekas Bagus (85%+)', desc: 'Lecet halus wajar harian' },
                  { id: 'USED_GOOD', label: 'Bekas Wajar (70%+)', desc: 'Ada baret wajar, fungsi 100%' },
                  { id: 'USED_FAIR', label: 'Ada Minus Minor', desc: 'Ada lecet jelas / minus kecil' },
                  { id: 'PARTS_ONLY', label: 'Kanibalan / Rusak', desc: 'Hanya untuk sparepart teknisi' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCondition(item.id as ItemCondition)}
                    className={`rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                      condition === item.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Completeness options */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Kelengkapan Barang</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'FULLSET', label: 'Fullset Dus & Aksesoris' },
                  { id: 'UNIT_ONLY', label: 'Batangan / Unit Saja' },
                  { id: 'BOX_UNIT', label: 'Unit + Dus' },
                  { id: 'WITH_RECEIPT', label: 'Ada Nota Pembelian' },
                  { id: 'ACTIVE_WARRANTY', label: 'Garansi Masih Aktif' }
                ].map((comp) => {
                  const isChecked = completeness.includes(comp.id as Completeness);
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => toggleCompleteness(comp.id as Completeness)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '} {comp.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Deskripsi Kondisi & Catatan</label>
              <textarea
                rows={4}
                required
                placeholder="Jelaskan riwayat pemakaian, kelengkapan, minus yang ada, dan alasan dijual secara transparan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 mt-1 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Price & Location */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>3. Harga & Lokasi COD</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Harga Jual (Rp)</label>
                <input
                  type="number"
                  min={10000}
                  step={50000}
                  required
                  placeholder="Contoh: 9850000"
                  value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 mt-1 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Harga Beli Baru Dulu (Opsional)</label>
                <input
                  type="number"
                  min={10000}
                  placeholder="Contoh: 18499000"
                  value={originalPrice || ''}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 mt-1 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Nego Toggle */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Izinkan Calon Pembeli Menawar (Nego)?</div>
                <div className="text-[10px] text-slate-500">
                  Pembeli dapat mengajukan tawaran dan Anda bisa menerima atau menawar balik.
                </div>
              </div>
              <input
                type="checkbox"
                checked={isNegotiable}
                onChange={(e) => setIsNegotiable(e.target.checked)}
                className="h-5 w-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Location fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Provinsi</label>
                <input
                  type="text"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Kota / Kabupaten</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Kecamatan</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Titik Temu COD (Tempat Umum Aman)</label>
              <input
                type="text"
                placeholder="Contoh: Gandaria City / Starbucks Dago Bandung"
                value={codMeetingPoint}
                onChange={(e) => setCodMeetingPoint(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 mt-1 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>{isSubmitting ? 'Menerbitkan Listing...' : 'Pasang Iklan Sekarang'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
