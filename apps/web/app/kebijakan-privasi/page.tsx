'use client';

import { ArrowRight, Lock, Shield } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';

const PRIVACY_SECTIONS = [
  { id: 'pengantar', title: '1. Pengantar & Komitmen' },
  { id: 'data-dikumpulkan', title: '2. Data yang Kami Kumpulkan' },
  { id: 'penggunaan-data', title: '3. Bagaimana Data Digunakan' },
  { id: 'penyimpanan-keamanan', title: '4. Keamanan & Enkripsi Data' },
  { id: 'pembagian-pihak-ketiga', title: '5. Pembagian Data Pihak Ketiga' },
  { id: 'hak-pengguna', title: '6. Hak Akses & Penghapusan Data' },
  { id: 'cookie', title: '7. Penggunaan Cookie' },
  { id: 'kontak-dpo', title: '8. Kontak Perlindungan Data' }
];

export default function KebijakanPrivasiPage() {
  const [activeSection, setActiveSection] = useState('pengantar');

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs items={[{ label: 'Kebijakan Privasi' }]} className="mb-6" />

        {/* Hero Header */}
        <div className="rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-xl bg-teal-500/20 px-3 py-1.5 text-xs font-bold text-teal-300 border border-teal-500/30 mb-4">
              <Shield className="h-4 w-4" />
              <span>Kepatuhan UU Perlindungan Data Pribadi (UU PDP No. 27/2022)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
              Kebijakan Privasi Peygo
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Privasi dan keamanan identitas Anda adalah prioritas mutlak kami. Pelajari bagaimana
              kami menjaga dan mengamankan informasi pribadi Anda saat bertransaksi di Peygo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar TOC */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                Daftar Isi Privasi
              </h3>
              <nav className="space-y-1">
                {PRIVACY_SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSection === sec.id
                        ? 'bg-teal-50 text-teal-700 font-black'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/panduan-rekber"
                  className="flex items-center justify-between text-xs font-bold text-teal-600 hover:text-teal-700"
                >
                  <span>Pelajari Belanja Aman</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs text-slate-700 leading-relaxed text-sm">
            {/* 1 */}
            <section id="pengantar" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-700 text-xs font-black">
                  1
                </span>
                Pengantar & Komitmen Privasi
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Peygo part of Digitesia Edge Digital ("Peygo", "kami") menghargai dan melindungi hak
                privasi setiap pengguna. Kebijakan Privasi ini menjelaskan jenis informasi yang kami
                kumpulkan, cara kami memprosesnya, langkah pengamanan yang diterapkan, serta hak
                Anda atas data pribadi sesuai Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27
                Tahun 2022).
              </p>
            </section>

            {/* 2 */}
            <section id="data-dikumpulkan" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-700 text-xs font-black">
                  2
                </span>
                Data yang Kami Kumpulkan
              </h2>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">A. Informasi Profil & Akun</h4>
                  <p className="text-slate-600">
                    Nama lengkap, alamat email, nomor telepon/WhatsApp, foto profil, dan kata sandi
                    yang terenkripsi.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">
                    B. Dokumen Verifikasi Identitas (KYC)
                  </h4>
                  <p className="text-slate-600">
                    Foto KTP/SIM dan foto verifikasi wajah (selfie) yang diunggah khusus untuk
                    proses verifikasi penjual berlisensi dan pencairan saldo.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">
                    C. Informasi Transaksi & Finansial
                  </h4>
                  <p className="text-slate-600">
                    Nama bank, nomor rekening tujuan pencairan, riwayat penawaran (nego), riwayat
                    pesanan, dan alamat pengiriman.
                  </p>
                </div>
              </div>
            </section>

            {/* 3 */}
            <section id="penggunaan-data" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-700 text-xs font-black">
                  3
                </span>
                Bagaimana Kami Menggunakan Data Anda
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li>
                  Memvalidasi keaslian akun dan memproses pembayaran transaksi bergaransi
                  perlindungan pembeli.
                </li>
                <li>
                  Mencegah aktivitas penipuan, pencucian uang, dan transaksi barang curian di dalam
                  ekosistem.
                </li>
                <li>
                  Mengirimkan notifikasi status penawaran nego, penerimaan dana, dan resi pengiriman
                  kurir.
                </li>
                <li>
                  Menangani mediasi sengketa antara pembeli dan penjual secara adil dan transparan.
                </li>
              </ul>
            </section>

            {/* 4 */}
            <section id="penyimpanan-keamanan" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-700 text-xs font-black">
                  4
                </span>
                Keamanan & Standar Enkripsi
              </h2>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-3 text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  <span>Enkripsi Standar Industri End-to-End</span>
                </div>
                Seluruh data transaksi dan komunikasi kami lindungi dengan protokol HTTPS / TLS 1.3
                dan enkripsi database AES-256 tingkat perbankan.
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Foto KTP KYC disimpan di media penyimpanan privat (Cloudflare R2 Encrypted Bucket)
                dengan akses terbatas yang hanya dapat dibuka oleh staf verifikasi resmi yang
                terotorisasi.
              </p>
            </section>

            {/* 5 */}
            <section id="pembagian-pihak-ketiga" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-700 text-xs font-black">
                  5
                </span>
                Pembagian Data dengan Pihak Ketiga
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mb-2">
                <strong>Kami TIDAK PERNAH menjual data pribadi Anda kepada pihak ketiga.</strong>{' '}
                Data hanya dibagikan kepada mitra operasional esensial:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li>
                  <strong>Payment Gateway & Bank Mitra</strong> (untuk otorisasi pembayaran Virtual
                  Account / QRIS).
                </li>
                <li>
                  <strong>Mitra Ekspedisi & Logistik</strong> (alamat dan nama penerima untuk
                  pengiriman fisik barang).
                </li>
                <li>
                  <strong>Pihak Penegak Hukum RI</strong> (hanya apabila terdapat surat perintah
                  resmi terkait tindak pidana kejahatan/penipuan).
                </li>
              </ul>
            </section>

            {/* 6 */}
            <section id="hak-pengguna" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-700 text-xs font-black">
                  6
                </span>
                Hak Akses & Penghapusan Akun
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Sesuai hak subjek data UU PDP, Anda memiliki hak penuh untuk meninjau data profil
                Anda, memperbarui nomor rekening, atau mengajukan penutupan dan penghapusan data
                akun (Right to be Forgotten) melalui menu Pengaturan Profil atau menghubungi
                Customer Care kami.
              </p>
            </section>

            {/* 7 */}
            <section id="cookie" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-700 text-xs font-black">
                  7
                </span>
                Penggunaan Cookie & Teknologi Serupa
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Peygo menggunakan cookie sesi esensial untuk menjaga status login Anda, menyimpan
                preferensi tampilan tema (dark/light), dan mengamankan token autentikasi sesi
                browsing Anda.
              </p>
            </section>

            {/* 8 */}
            <section id="kontak-dpo" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-700 text-xs font-black">
                  8
                </span>
                Kontak Petugas Perlindungan Data (DPO)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mb-3">
                Jika Anda memiliki pertanyaan, keberatan, atau ingin mengajukan klaim hak privasi:
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <p>
                  <strong>Email Tim Privasi:</strong> privasi@peygo.id
                </p>
                <p>
                  <strong>Alamat Kantor:</strong> Peygo • Digitesia Edge Digital, SCBD Lot 11,
                  Jakarta Selatan 12190
                </p>
                <p>
                  <strong>Jam Operasional:</strong> Senin – Jumat (09:00 – 18:00 WIB)
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
