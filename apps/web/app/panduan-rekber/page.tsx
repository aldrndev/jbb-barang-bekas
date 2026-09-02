'use client';

import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Coins,
  CreditCard,
  Lock,
  PackageCheck,
  PlusCircle,
  Search,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';
import { formatIDR } from '../../lib/utils';

const STEPS = [
  {
    step: '01',
    title: 'Pembeli Melakukan Checkout & Bayar ke Rekber',
    desc: 'Pembeli memilih barang dan membayar via Virtual Account / QRIS / Transfer Bank. Dana 100% aman ditahan di rekening penampung resmi Peygo, bukan ke rekening penjual.',
    icon: CreditCard,
    color: 'from-blue-500 to-indigo-600',
    badge: 'Dana Ditahan Aman'
  },
  {
    step: '02',
    title: 'Penjual Menerima Notifikasi & Mengirimkan Barang',
    desc: 'Penjual mendapatkan notifikasi instan bahwa dana sudah terjamin. Penjual mengemas barang dengan aman dan menginput nomor resi kurir atau janjian titik temu COD.',
    icon: PackageCheck,
    color: 'from-amber-500 to-orange-600',
    badge: 'Pasti Dibayar'
  },
  {
    step: '03',
    title: 'Barang Tiba & Masa Inspeksi Fisik 48 Jam Dimulai',
    desc: 'Setelah kurir mengonfirmasi barang tiba di tangan pembeli, jam countdown garansi 48 jam aktif. Pembeli leluasa mengecek fisik, kelengkapan, fungsi tombol, dan baterai.',
    icon: Clock,
    color: 'from-purple-500 to-pink-600',
    badge: 'Garansi 48 Jam'
  },
  {
    step: '04',
    title: 'Konfirmasi Selesai atau Ajukan Sengketa',
    desc: 'Jika barang sesuai deskripsi, pembeli klik "Pesanan Selesai". Jika ada kerusakan / barang tidak sesuai, pembeli klik "Ajukan Sengketa" dengan bukti foto & video unboxing.',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Hak Perlindungan'
  },
  {
    step: '05',
    title: 'Pencairan Dana Otomatis ke Dompet Penjual',
    desc: 'Setelah pesanan disetujui, dana langsung cair ke saldo dompet penjual dan dapat ditarik ke seluruh rekening bank nasional tanpa potongan tersembunyi.',
    icon: Coins,
    color: 'from-teal-500 to-emerald-600',
    badge: 'Pencairan Instan'
  }
];

const COMPARISONS = [
  {
    feature: 'Risiko Pembeli Tertipu / Barang Palsu',
    direct: 'Sangat Tinggi (Uang hilang jika penjual kabur)',
    rekber: '0% (Dana ditahan sampai barang dicek)',
    isGood: true
  },
  {
    feature: 'Waktu Uji Coba Fisik & Cek Fungsi',
    direct: 'Tidak ada (Penjual lepas tangan setelah transfer)',
    rekber: 'Garansi 48 Jam Penuh setelah barang tiba',
    isGood: true
  },
  {
    feature: 'Jaminan Penjual Terhadap Pembeli PHP',
    direct: 'Rentan di-PHP / pembeli batalkan sepihak',
    rekber: 'Pasti lunas (Dana sudah masuk ke rekening escrow)',
    isGood: true
  },
  {
    feature: 'Resolusi Jika Barang Rusak di Ekspedisi',
    direct: 'Saling menyalahkan tanpa penengah',
    rekber: 'Mediasi resmi & asuransi tim sengketa Peygo',
    isGood: true
  }
];

const FAQS = [
  {
    q: 'Apakah dana saya aman jika penjual tidak kunjung mengirimkan barang?',
    a: 'Sangat aman. Jika penjual tidak memproses pesanan dan tidak menginput nomor resi dalam 2x24 jam kerja, pesanan akan dibatalkan otomatis dan dana Anda akan dikembalikan 100% ke saldo akun Anda tanpa potongan.'
  },
  {
    q: 'Bagaimana jika pembeli lupa mengonfirmasi setelah barang tiba?',
    a: 'Jika pembeli tidak mengonfirmasi "Pesanan Selesai" dan tidak mengajukan komplain dalam batas waktu Masa Proteksi 48 jam sejak resi dinyatakan delivered, sistem Peygo akan merilis dana secara otomatis ke dompet penjual.'
  },
  {
    q: 'Berapa biaya layanan rekber di Peygo?',
    a: 'Biaya proteksi Rekber Peygo sangat terjangkau, yaitu hanya 1.5% dari nominal harga barang (maksimal Rp 50.000). Biaya ini digunakan untuk operasional asuransi escrow dan perlindungan transaksi.'
  },
  {
    q: 'Apakah COD bisa tetap menggunakan Rekber Peygo?',
    a: 'Bisa! Anda dapat melakukan pembayaran via Rekber di aplikasi terlebih dahulu, lalu saat bertemu di titik COD dan selesai memeriksa barang di tempat, Anda cukup menekan tombol "Konfirmasi Terima COD" agar dana langsung diteruskan ke penjual.'
  }
];

export default function PanduanRekberPage() {
  const [calcPrice, setCalcPrice] = useState<number>(2500000);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const fee = Math.min(Math.round(calcPrice * 0.015), 50000);
  const buyerPays = calcPrice + fee;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs items={[{ label: 'Panduan Rekber' }]} className="mb-6" />

        {/* Hero Banner */}
        <div className="rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 sm:p-12 text-white shadow-2xl mb-12 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/30 mb-5">
              <ShieldCheck className="h-4 w-4" />
              <span>Sistem Proteksi Escrow Terstandarisasi</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              Beli Barang Bekas Bebas Was-Was dengan Rekber Peygo
            </h1>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed mb-6">
              Platform rekening bersama nomor #1 di Indonesia untuk jual beli pre-loved. Dana
              pembayaran Anda aman 100% di penampungan bergaransi sampai barang Anda pegang dan uji
              selama 48 jam.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
              <Link
                href="/cari"
                className="rounded-2xl bg-emerald-500 px-6 py-3 text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                <span>Mulai Belanja Aman</span>
              </Link>
              <Link
                href="/jual"
                className="rounded-2xl bg-white/10 border border-white/20 px-6 py-3 text-white hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Pasang Iklan Gratis</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 5-Step Visual Flowchart */}
        <section className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Alur Transaksi
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              5 Langkah Mudah & Aman Transaksi Rekber
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Setiap tahapan dirancang untuk melindungi hak pembeli sekaligus menjamin kepastian
              pembayaran bagi penjual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between relative group hover:border-emerald-500 hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-slate-300 group-hover:text-emerald-600 transition-colors">
                        {step.step}
                      </span>
                      <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                        {step.badge}
                      </span>
                    </div>
                    <div
                      className={`h-11 w-11 rounded-2xl bg-linear-to-tr ${step.color} text-white flex items-center justify-center mb-4 shadow-xs`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-2 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Comparison: Direct Transfer vs Peygo Rekber */}
        <section className="mb-14">
          <div className="rounded-3xl bg-white p-6 sm:p-10 border border-slate-200 shadow-xs">
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Perbandingan Keamanan
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                Transfer Langsung vs Rekber Peygo
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Jangan ambil risiko transfer uang muka (DP) langsung ke rekening asing tanpa
                perlindungan pihak ketiga.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 font-black text-slate-900 bg-slate-50 rounded-tl-2xl">
                      Fitur Perlindungan
                    </th>
                    <th className="py-3 px-4 font-black text-rose-700 bg-rose-50/70">
                      Transfer Langsung (Direct TF)
                    </th>
                    <th className="py-3 px-4 font-black text-emerald-700 bg-emerald-50 rounded-tr-2xl">
                      Rekber Resmi Peygo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMPARISONS.map((row) => (
                    <tr key={row.feature} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.feature}</td>
                      <td className="py-3.5 px-4 text-rose-600 font-medium flex items-center gap-2">
                        <XCircle className="h-4 w-4 shrink-0" />
                        <span>{row.direct}</span>
                      </td>
                      <td className="py-3.5 px-4 text-emerald-700 font-bold bg-emerald-50/30">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>{row.rekber}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Interactive Fee Simulator */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Kalkulator Transparan
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 mb-2">
              Simulasi Biaya Proteksi Escrow
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Hanya 1.5% (maksimal Rp 50.000) untuk jaminan ketenangan belanja barang bekas tanpa
              rasa takut tertipu.
            </p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="calcPriceRange"
                  className="text-xs font-bold text-slate-700 block mb-2"
                >
                  Masukkan Harga Barang: <strong>{formatIDR(calcPrice)}</strong>
                </label>
                <input
                  id="calcPriceRange"
                  type="range"
                  min={100000}
                  max={25000000}
                  step={50000}
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold">
                  <span>Rp 100 rb</span>
                  <span>Rp 10 Jt</span>
                  <span>Rp 25 Jt</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">Harga Barang</span>
                  <span className="text-slate-900 font-bold text-sm">{formatIDR(calcPrice)}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-600 block text-[10px] font-bold">
                    Biaya Proteksi (1.5%)
                  </span>
                  <span className="text-emerald-700 font-bold text-sm">{formatIDR(fee)}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white">
                  <span className="text-slate-400 block text-[10px] font-bold">
                    Total Pembeli Bayar
                  </span>
                  <span className="text-emerald-400 font-bold text-sm">{formatIDR(buyerPays)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-emerald-900 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-3">
                <Lock className="h-4 w-4" />
                <span>Garansi Uang Kembali 100%</span>
              </div>
              <h3 className="text-lg font-black mb-3">Uji Fisik & Fungsi 48 Jam</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Uang Anda tetap di rekening bersama sampai Anda puas dengan kondisi fisik barang.
                Jika ada kendala tersembunyi, ajukan klaim pengembalian dana dalam 1 klik.
              </p>
            </div>

            <div className="pt-6 border-t border-emerald-800/60 mt-6">
              <Link
                href="/cari"
                className="w-full rounded-2xl bg-emerald-400 py-3 text-center text-xs font-black text-slate-900 hover:bg-emerald-300 transition-colors block"
              >
                Cari Barang Sekarang
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="mb-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-black text-slate-900">Pertanyaan Seputar Rekber Peygo</h2>
            <p className="text-xs text-slate-500 mt-1">
              Jawaban lengkap seputar mekanisme transaksi, pencairan dana, dan penanganan sengketa.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={faq.q}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
