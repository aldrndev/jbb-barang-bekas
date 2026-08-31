'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  ShieldCheck,
  MessageSquareText,
  User,
  LogOut,
  ChevronDown,
  Heart,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { useWishlist } from '../../context/wishlist-context';

export function Navbar() {
  const router = useRouter();
  const { user, openAuthModal, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cari?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/30 group-hover:scale-105 transition-all">
            <ShieldCheck className="h-6 w-6 stroke-2.5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 leading-none block">
              JBB<span className="text-brand-600">.</span>
            </span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block -mt-0.5">
              Barang Bekas
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative hidden md:flex flex-1 max-w-lg items-center"
        >
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari iPhone, MacBook, Sony A6400, PS5..."
            className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-16 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="submit"
              className="absolute right-2 px-3 py-1 bg-brand-600 text-white rounded-full text-xs font-bold hover:bg-brand-700 transition-colors cursor-pointer"
            >
              Cari
            </button>
          )}
        </form>

        {/* Right Actions - Clean, uncluttered, airy */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Wishlist Button */}
          <Link
            href="/wishlist"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50/60 transition-all relative"
            title="Wishlist & Favorit"
          >
            <div className="relative">
              <Heart className={`h-5 w-5 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="hidden lg:inline text-xs font-bold">Wishlist</span>
          </Link>

          {/* Nego & Pesanan */}
          <Link
            href="/nego"
            className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all"
            title="Nego & Tawaran"
          >
            <div className="relative">
              <MessageSquareText className="h-5 w-5 text-slate-600" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white animate-pulse"></span>
            </div>
            <span className="hidden lg:inline text-xs font-bold">Nego</span>
          </Link>

          {/* Jual Barang Primary Button - Protected by Auth */}
          {user ? (
            <Link
              href="/jual"
              className="flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-brand-600/25 transition-all hover:scale-102 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-3" />
              <span>Jual</span>
            </Link>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-brand-600/25 transition-all hover:scale-102 cursor-pointer"
              title="Masuk untuk Jual Barang"
            >
              <Plus className="h-4 w-4 stroke-3" />
              <span>Jual</span>
            </button>
          )}

          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 rounded-full p-1 pr-2.5 hover:bg-slate-100/80 transition-colors cursor-pointer"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-100"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/50 z-50 animate-in fade-in">
                  <div className="border-b border-slate-200 px-3 py-2.5">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold bg-emerald-50 text-brand-800 border border-brand-200 px-2 py-0.5 rounded-md">
                        Trust Score {user.trustScore}%
                      </span>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      Profil Saya
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ShoppingBag className="h-4 w-4 text-slate-400" />
                      Riwayat Pesanan
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Heart className="h-4 w-4 text-rose-500" />
                      Wishlist Saya ({wishlistCount})
                    </Link>
                    <Link
                      href="/nego"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <MessageSquareText className="h-4 w-4 text-amber-500" />
                      Tawaran Nego
                    </Link>
                    <Link
                      href="/jual"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Plus className="h-4 w-4 text-brand-600" />
                      Pasang Iklan Baru
                    </Link>
                  </div>
                  <div className="border-t border-slate-200 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-slate-100/70 transition-all cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Bar Row */}
      <div className="px-4 pb-3 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari iPhone, MacBook, PS5..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 font-medium focus:bg-white focus:border-brand-500 focus:outline-none transition-all"
          />
        </form>
      </div>
    </header>
  );
}
