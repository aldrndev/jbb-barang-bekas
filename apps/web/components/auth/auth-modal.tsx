'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, User, Mail, Lock, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { api } from '../../lib/api-client';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, loginAsDemoBuyer, loginAsDemoSeller } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    if (mode === 'login') {
      const res = await api.login(email, password);
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
      } else {
        setErrorMsg(res.error?.message || 'Login gagal. Periksa email & password.');
      }
    } else {
      const res = await api.register(name, email, password, phone);
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
      } else {
        setErrorMsg(res.error?.message || 'Pendaftaran gagal.');
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 shadow-inner">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            {mode === 'login' ? 'Selamat Datang di JBB' : 'Mulai Jual & Beli Bekas'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Masuk untuk mengajukan tawaran dan transaksi aman'
              : 'Daftar gratis dan nikmati perlindungan rekening bersama'}
          </p>
        </div>

        {/* Quick Demo Switcher Card */}
        <div className="mb-5 rounded-2xl bg-emerald-50/80 p-3.5 border border-emerald-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Mode Demo Cepat (1-Klik):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={loginAsDemoBuyer}
              className="flex items-center justify-center gap-1 rounded-xl bg-white px-2.5 py-2 text-[11px] font-bold text-slate-800 shadow-sm hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
            >
              <span>👤 Pembeli (Dimas)</span>
            </button>
            <button
              type="button"
              onClick={loginAsDemoSeller}
              className="flex items-center justify-center gap-1 rounded-xl bg-white px-2.5 py-2 text-[11px] font-bold text-slate-800 shadow-sm hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
            >
              <span>⭐ Penjual (Budi)</span>
            </button>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-lg py-2 transition-all cursor-pointer ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-lg py-2 transition-all cursor-pointer ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 border border-rose-200">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="text-[11px] font-bold text-slate-700">Nama Lengkap</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 pl-9 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-700">Alamat Email</label>
            <div className="relative mt-1">
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 pl-9 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700">Kata Sandi</label>
            <div className="relative mt-1">
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 pl-9 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-[11px] font-bold text-slate-700">Nomor WhatsApp (Opsional)</label>
              <div className="relative mt-1">
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 pl-9 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer mt-4"
          >
            <span>{isLoading ? 'Memproses...' : mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
