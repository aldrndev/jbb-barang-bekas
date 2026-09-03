'use client';

import {
  ArrowRight,
  ChevronDown,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Scale,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserCheck,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';

interface HelpArticle {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const CATEGORIES = [
  { id: 'all', name: 'Semua Topik', icon: HelpCircle },
  { id: 'akun', name: 'Akun & KYC', icon: UserCheck },
  { id: 'beli', name: 'Pembelian & Transaksi', icon: ShoppingBag },
  { id: 'jual', name: 'Penjualan & Saldo', icon: Store },
  { id: 'sengketa', name: 'Sengketa & Refund', icon: Scale },
  { id: 'cod', name: 'COD & Ekspedisi', icon: MapPin }
];

const ARTICLES: HelpArticle[] = [
  // Akun & KYC
  {
    id: 'k-1',
    category: 'akun',
    question: 'Mengapa saya perlu melakukan verifikasi identitas (KYC)?',
    answer:
      'Verifikasi identitas bertujuan menjaga rasa aman di ekosistem Peygo. Akun terverifikasi mendapatkan lencana "Terverifikasi" yang meningkatkan kepercayaan calon pembeli hingga 3x lipat serta membuka limit penarikan saldo tanpa batas.'
  },
  {
    id: 'k-2',
    category: 'akun',
    question: 'Berapa lama proses persetujuan verifikasi KYC?',
    answer:
      'Tim Moderasi Peygo memverifikasi dokumen identitas maksimal dalam 1x24 jam kerja. Pastikan foto KTP terbaca jelas tanpa pantulan cahaya dan selfie wajah sesuai dengan identitas KTP.'
  },
  {
    id: 'k-3',
    category: 'akun',
    question: 'Bagaimana cara mengubah nomor rekening bank pencairan?',
    answer:
      'Buka menu Profil > Pengaturan Akun > Rekening Bank. Anda dapat menambahkan rekening bank atas nama yang sama dengan nama KTP Anda untuk keamanan.'
  },

  // Pembelian & Transaksi
  {
    id: 'b-1',
    category: 'beli',
    question: 'Bagaimana cara kerja fitur Nego (Tawar Menawar)?',
    answer:
      'Di halaman produk yang bertanda "Bisa Nego", klik tombol "Ajukan Nego" dan masukkan harga tawaran Anda. Jika penjual menyetujui, harga promo tersebut akan terkunci untuk Anda selama 24 jam untuk segera di-checkout.'
  },
  {
    id: 'b-2',
    category: 'beli',
    question: 'Metode pembayaran apa saja yang didukung oleh Peygo?',
    answer:
      'Kami mendukung QRIS (Semua e-Wallet & M-Banking), Virtual Account BCA, Mandiri, BRI, BNI, Permata, serta transfer bank konfirmasi instan 24/7.'
  },
  {
    id: 'b-3',
    category: 'beli',
    question: 'Kapan dana saya diteruskan ke penjual?',
    answer:
      'Dana Anda HANYA akan diteruskan ke penjual setelah Anda mengklik tombol "Konfirmasi Pesanan Selesai" atau setelah batas Masa Proteksi 48 jam berakhir tanpa adanya komplain sengketa.'
  },

  // Penjualan & Saldo
  {
    id: 'j-1',
    category: 'jual',
    question: 'Berapa lama dana penjualan masuk ke saldo setelah pesanan selesai?',
    answer:
      'Dana langsung masuk secara realtime detik itu juga ke Saldo Dompet Peygo Anda begitu pembeli mengonfirmasi penerimaan barang.'
  },
  {
    id: 'j-2',
    category: 'jual',
    question: 'Kapan saldo bisa dicairkan ke rekening bank pribadi?',
    answer:
      'Pencairan saldo dapat dilakukan kapan saja melalui menu Profil > Dompet Saldo > Tarik Dana. Proses transfer ke rekening bank diproses dalam waktu 15 menit hingga maksimal 1x24 jam kerja.'
  },
  {
    id: 'j-3',
    category: 'jual',
    question: 'Apakah ada biaya untuk memasang iklan barang bekas?',
    answer:
      '100% GRATIS! Anda dapat memasang iklan sebanyak-banyaknya di semua kategori barang bekas tanpa dipungut biaya pemasangan iklan.'
  },

  // Sengketa & Refund
  {
    id: 's-1',
    category: 'sengketa',
    question: 'Apa yang harus dilakukan jika barang yang diterima rusak / tidak sesuai deskripsi?',
    answer:
      'Jangan klik "Pesanan Selesai". Buka detail Pesanan Anda, lalu klik tombol "Ajukan Sengketa / Komplain". Unggah bukti foto detail dan video unboxing saat membuka paket.'
  },
  {
    id: 's-2',
    category: 'sengketa',
    question: 'Berapa lama proses mediasi sengketa oleh tim Peygo?',
    answer:
      'Tim Investigasi Sengketa Peygo akan menengahi dan memutuskan perkara dalam waktu 2x24 jam kerja berdasarkan bukti fisik, kesesuaian deskripsi iklan, dan histori chat.'
  },
  {
    id: 's-3',
    category: 'sengketa',
    question: 'Bagaimana mekanisme pengembalian dana (refund) pembeli?',
    answer:
      'Jika klaim pengembalian disetujui, pembeli mengirimkan kembali barang ke penjual dengan resi terlacak. Setelah barang diterima kembali oleh penjual, dana escrow 100% langsung dikembalikan ke rekening/dompet pembeli.'
  },

  // COD & Ekspedisi
  {
    id: 'c-1',
    category: 'cod',
    question: 'Bagaimana tips COD (Cash on Delivery) yang aman?',
    answer:
      'Selalu gunakan titik temu di tempat umum yang ramai dan terang (seperti lobby mall, minimarket, atau kedai kopi). Cek fungsi barang di depan penjual sebelum mengonfirmasi pelepasan dana.'
  },
  {
    id: 'c-2',
    category: 'cod',
    question: 'Ekspedisi apa saja yang didukung untuk pengiriman paket?',
    answer:
      'Penjual dapat menggunakan JNE, J&T, SiCepat, Anteraja, Paxel, maupun kurir instan GoSend / GrabExpress. Nomor resi valid wajib diinput di aplikasi untuk melacak status pengiriman.'
  }
];

export default function PusatBantuanPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openArticleId, setOpenArticleId] = useState<string | null>('b-1');

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((article) => {
      const matchCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        article.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs items={[{ label: 'Pusat Bantuan' }]} className="mb-6" />

        {/* Hero Search Section */}
        <div className="rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 sm:p-12 text-white shadow-xl mb-10 text-center relative overflow-hidden">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-teal-500/15 blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/30 mb-4">
              <HelpCircle className="h-4 w-4" />
              <span>Pusat Bantuan & Panduan Pengguna</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
              Ada yang Bisa Kami Bantu?
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mb-6">
              Cari panduan transaksi, verifikasi akun, garansi perlindungan, atau tips belanja aman
              di Peygo.
            </p>

            {/* Live Search Bar */}
            <div className="relative max-w-xl mx-auto flex items-center">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Ketik pertanyaan (misal: garansi, KYC KTP, refund, nego)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-white/95 text-slate-900 pl-12 pr-10 py-3.5 text-xs sm:text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 hide-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Articles List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Daftar Pertanyaan Terpopuler ({filteredArticles.length})
              </h2>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Reset Pencarian
                </button>
              )}
            </div>

            {filteredArticles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
                <Search className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                <h3 className="text-sm font-bold text-slate-800">Tidak ada jawaban yang cocok</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Coba gunakan kata kunci yang lebih umum atau hubungi Customer Support kami di
                  samping.
                </p>
              </div>
            ) : (
              filteredArticles.map((article) => {
                const isOpen = openArticleId === article.id;
                return (
                  <div
                    key={article.id}
                    className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenArticleId(isOpen ? null : article.id)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      <span className="leading-snug">{article.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-emerald-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                        {article.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right Sidebar: Direct Support Channels */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-black text-slate-900 mb-1">Butuh Bantuan Langsung?</h3>
              <p className="text-xs text-slate-500 mb-5">
                Tim Support Peygo siap mendampingi proses transaksi Anda setiap hari.
              </p>

              <div className="space-y-3">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Admin%20Peygo%2C%20saya%20butuh%20bantuan%20transaksi"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Chat WhatsApp Resmi</h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Respon cepat &lt; 5 menit</p>
                  </div>
                </a>

                <a
                  href="mailto:support@peygo.id"
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Email Helpdesk</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">support@peygo.id</p>
                  </div>
                </a>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Layanan Aktif: 08:00 – 22:00 WIB (Setiap Hari)</span>
              </div>
            </div>

            {/* Quick Link Card */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Proteksi Transaksi</span>
              </div>
              <h4 className="text-sm font-black mb-1">Pelajari Garansi Perlindungan Pembeli</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                Pahami hak inspeksi 48 jam dan garansi uang kembali 100% untuk pembeli dan penjual.
              </p>
              <Link
                href="/panduan-rekber"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                <span>Baca Panduan Belanja Aman</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
