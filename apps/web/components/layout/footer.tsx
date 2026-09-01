import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, RefreshCw, Zap, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-6 sm:pt-10 pb-20 md:pb-12 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Value Proposition Bar */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 pb-6 sm:pb-10 border-b border-slate-200">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Garansi Rekber 100%</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Dana ditahan aman sampai barang Anda terima dan cek 48 jam.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Nego Harga Fleksibel</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Fitur tawar menawar resmi dengan kepastian harga terkunci 24 jam.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">COD & Kurir Lengkap</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Bisa janjian ketemuan aman di public place atau kirim kilat instan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Penjual Terverifikasi</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Verifikasi identitas KTP & riwayat transaksi transparan tanpa manipulasi.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="font-bold text-slate-800">JBB Marketplace Indonesia</span>
            <span>&copy; {new Date().getFullYear()} Dilindungi Hak Cipta.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-emerald-600 transition-colors">Syarat & Ketentuan</Link>
            <Link href="#" className="hover:text-emerald-600 transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-emerald-600 transition-colors">Panduan Rekber</Link>
            <Link href="#" className="hover:text-emerald-600 transition-colors">Pusat Bantuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
