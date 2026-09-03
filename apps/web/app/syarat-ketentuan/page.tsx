'use client';

import { ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';

const SECTIONS = [
  { id: 'definisi', title: '1. Definisi & Ruang Lingkup' },
  { id: 'akun', title: '2. Pendaftaran Akun & KYC' },
  { id: 'iklan', title: '3. Aturan Pemasangan Iklan' },
  { id: 'barang-larangan', title: '4. Barang yang Dilarang' },
  { id: 'garansi', title: '5. Ketentuan Garansi Perlindungan Pembeli' },
  { id: 'cod', title: '6. Panduan Transaksi Siap COD' },
  { id: 'sengketa', title: '7. Resolusi Sengketa & Pengembalian' },
  { id: 'biaya', title: '8. Biaya Layanan & Pembayaran' },
  { id: 'tanggung-jawab', title: '9. Batasan Tanggung Jawab' },
  { id: 'perubahan', title: '10. Perubahan Ketentuan' }
];

export default function SyaratKetentuanPage() {
  const [activeSection, setActiveSection] = useState('definisi');

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
        <Breadcrumbs items={[{ label: 'Syarat & Ketentuan' }]} className="mb-6" />

        {/* Hero Header */}
        <div className="rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/30 mb-4">
              <FileText className="h-4 w-4" />
              <span>Dokumen Resmi & Ketentuan Hukum</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
              Syarat & Ketentuan Layanan Peygo
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Terakhir diperbarui: 1 September 2026. Harap membaca seluruh syarat dan ketentuan
              berikut dengan teliti sebelum menggunakan marketplace Peygo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sticky Desktop */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                Daftar Isi
              </h3>
              <nav className="space-y-1">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSection === sec.id
                        ? 'bg-emerald-50 text-emerald-700 font-black'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/pusat-bantuan"
                  className="flex items-center justify-between text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  <span>Butuh Bantuan?</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Legal Content */}
          <main className="lg:col-span-3 space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs text-slate-700 leading-relaxed text-sm">
            {/* 1. Definisi */}
            <section id="definisi" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black">
                  1
                </span>
                Definisi & Ruang Lingkup
              </h2>
              <p className="mb-3 text-xs sm:text-sm">
                Selamat datang di <strong>Peygo</strong> (Peygo part of Digitesia Edge Digital).
                Platform ini menyediakan ekosistem marketplace jual beli barang bekas (pre-loved /
                second-hand) dengan Garansi Perlindungan Pembeli terintegrasi di seluruh Indonesia.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li>
                  <strong>"Pengguna"</strong> mengacu pada pembeli, penjual, ataupun pengunjung
                  terdaftar.
                </li>
                <li>
                  <strong>"Garansi Perlindungan Peygo"</strong> adalah sistem perlindungan transaksi
                  yang menjamin pembayaran aman hingga barang diterima dan disetujui oleh Pembeli.
                </li>
                <li>
                  <strong>"Masa Proteksi / Inspeksi"</strong> adalah batas waktu 48 jam bagi Pembeli
                  untuk mengecek keaslian dan kondisi fisik barang setelah status terkirim.
                </li>
              </ul>
            </section>

            {/* 2. Akun & KYC */}
            <section id="akun" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black">
                  2
                </span>
                Pendaftaran Akun & Verifikasi Identitas (KYC)
              </h2>
              <p className="mb-3 text-xs sm:text-sm">
                Untuk menjaga keamanan ekosistem dan mencegah penipuan barang bekas, pengguna wajib
                mematuhi ketentuan pendaftaran:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li>
                  Pengguna minimal berusia 18 tahun atau memiliki KTP/kartu identitas yang sah di
                  Republik Indonesia.
                </li>
                <li>
                  Penjual yang ingin mencairkan saldo hasil penjualan di atas batas nominal tertentu
                  wajib melengkapi verifikasi identitas (KYC) berupa foto KTP dan selfie.
                </li>
                <li>
                  Satu pengguna hanya diperbolehkan memiliki satu akun utama. Penyalahgunaan akun
                  ganda untuk manipulasi rating atau harga akan dikenakan sanksi pemblokiran
                  permanen.
                </li>
              </ul>
            </section>

            {/* 3. Iklan */}
            <section id="iklan" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black">
                  3
                </span>
                Aturan Pemasangan Iklan & Kejujuran Kondisi
              </h2>
              <p className="mb-3 text-xs sm:text-sm">
                Nilai utama Peygo adalah transparansi kondisi barang bekas:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li>
                  Foto barang wajib merupakan <strong>foto asli (real picture)</strong> barang yang
                  dijual saat ini, bukan foto katalog internet pihak ketiga tanpa izin.
                </li>
                <li>
                  Penjual wajib mencantumkan segala bentuk minus, lecet fisik, penurunan performa
                  baterai, atau kelengkapan secara jujur di kolom deskripsi.
                </li>
                <li>
                  Barang dengan indikasi penipuan kondisi dapat menjadi dasar mutlak bagi pembeli
                  untuk mengajukan klaim pengembalian dana 100%.
                </li>
              </ul>
            </section>

            {/* 4. Larangan */}
            <section id="barang-larangan" className="scroll-mt-24">
              <h2 className="text-lg font-black text-rose-600 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 text-xs font-black">
                  4
                </span>
                Barang yang Dilarang Diperjualbelikan
              </h2>
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-3 text-xs text-rose-800">
                <strong>Perhatian:</strong> Peygo melarang keras penjualan barang-barang ilegal dan
                melanggar hukum hukum Republik Indonesia.
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li>
                  Barang curian, barang hasil tindak kejahatan, atau barang curian (stolen
                  property).
                </li>
                <li>
                  Barang tiruan/KW/palsu yang diiklankan sebagai barang original
                  (Replica/Counterfeit).
                </li>
                <li>Senjata api, senjata tajam tanpa izin, bahan peledak, dan zat berbahaya.</li>
                <li>Obat-obatan terlarang, narkotika, dan obat keras tanpa resep dokter.</li>
                <li>Akun digital bajakan, software bajakan, data pribadi, atau dokumen ilegal.</li>
              </ul>
            </section>

            {/* 5. Garansi Perlindungan Pembeli */}
            <section id="garansi" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black">
                  5
                </span>
                Ketentuan Garansi Perlindungan Pembeli 48 Jam
              </h2>
              <p className="mb-3 text-xs sm:text-sm">
                Mekanisme pembayaran di Peygo diatur melalui alur perlindungan bergaransi:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li>
                  Pembayaran pembeli diamankan oleh sistem perlindungan Peygo dan tidak akan
                  diteruskan ke penjual sebelum pembeli mengonfirmasi pesanan.
                </li>
                <li>
                  Pembeli memiliki waktu <strong>48 jam (Masa Proteksi)</strong> sejak barang
                  diterima untuk memeriksa fisik dan fungsi barang.
                </li>
                <li>
                  Jika dalam 48 jam pembeli tidak melakukan konfirmasi maupun komplain sengketa,
                  sistem secara otomatis akan merilis dana ke dompet penjual.
                </li>
              </ul>
            </section>

            {/* 6. COD */}
            <section id="cod" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black">
                  6
                </span>
                Panduan Transaksi Siap COD (Cash On Delivery)
              </h2>
              <p className="mb-3 text-xs sm:text-sm">
                Peygo memfasilitasi janji temu COD yang aman:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li>
                  Janjian COD wajib dilakukan di tempat umum yang ramai dan terang (seperti mall,
                  cafe, atau pos keamanan).
                </li>
                <li>
                  Pembeli berhak memeriksa kondisi fisik barang secara teliti sebelum menyelesaikan
                  pembayaran.
                </li>
                <li>
                  Dilarang mentransfer uang muka (DP) di luar aplikasi sebelum bertemu secara fisik
                  untuk menghindari risiko penipuan luar sistem.
                </li>
              </ul>
            </section>

            {/* 7. Sengketa */}
            <section id="sengketa" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black">
                  7
                </span>
                Resolusi Sengketa & Kebijakan Pengembalian Dana (Refund)
              </h2>
              <p className="mb-3 text-xs sm:text-sm">
                Jika barang tidak sesuai deskripsi, cacat tersembunyi yang tidak diinformasikan,
                atau hilang saat pengiriman:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li>
                  Pembeli wajib mengunggah bukti video unboxing tanpa jeda dan foto detail kendala
                  saat mengajukan tombol <strong>"Ajukan Komplain / Sengketa"</strong>.
                </li>
                <li>
                  Tim Moderasi & Sengketa Peygo akan meninjau bukti kedua belah pihak dalam waktu
                  maksimal 2x24 jam kerja secara netral dan adil.
                </li>
                <li>
                  Jika klaim disetujui, pembeli wajib mengirimkan kembali barang ke alamat penjual,
                  dan dana pembayaran akan dikembalikan 100% ke pembeli.
                </li>
              </ul>
            </section>

            {/* 8. Biaya */}
            <section id="biaya" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black">
                  8
                </span>
                Biaya Layanan & Penarikan Dana (Withdrawal)
              </h2>
              <p className="mb-3 text-xs sm:text-sm">
                Peygo menerapkan transparansi biaya tanpa potongan tersembunyi:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li>
                  Pemasangan iklan barang bekas adalah <strong>100% Gratis</strong> tanpa batas
                  kuota iklan aktif.
                </li>
                <li>
                  Biaya layanan & perlindungan pembeli dikenakan sebesar 1.5% - 2.5% per transaksi
                  sukses untuk mendanai sistem keamanan dan perlindungan transaksi.
                </li>
                <li>
                  Penarikan saldo penjualan ke rekening bank nasional diproses otomatis dalam 1x24
                  jam kerja tanpa biaya admin tambahan (khusus BCA, Mandiri, BRI, BNI).
                </li>
              </ul>
            </section>

            {/* 9. Tanggung Jawab */}
            <section id="tanggung-jawab" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black">
                  9
                </span>
                Batasan Tanggung Jawab
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Peygo bertindak sebagai penyedia platform marketplace dan sistem pembayaran aman.
                Transaksi yang dilakukan langsung di luar sistem resmi Peygo (transaksi transfer
                langsung antar pengguna) berada di luar tanggung jawab dan perlindungan garansi
                Peygo.
              </p>
            </section>

            {/* 10. Perubahan */}
            <section id="perubahan" className="scroll-mt-24">
              <h2 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black">
                  10
                </span>
                Perubahan Syarat & Ketentuan
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Peygo berhak memperbarui dokumen syarat dan ketentuan ini sewaktu-waktu guna
                mematuhi regulasi perundang-undangan Republik Indonesia dan meningkatkan keamanan
                layanan. Pengguna akan mendapatkan notifikasi berkala apabila terdapat perubahan
                signifikan.
              </p>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
