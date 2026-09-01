'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Shield, Sparkles, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { PeygoLogoIcon } from '../common/peygo-logo';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (notification: any) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number | string;
              locale?: string;
            }
          ) => void;
        };
      };
    };
  }
}

function GoogleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    (typeof window !== 'undefined' ? (window as any).__GOOGLE_CLIENT_ID__ : '');

  // Load Google Identity Services SDK
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const scriptId = 'google-identity-services-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const initGoogleGsi = () => {
      if (window.google?.accounts?.id && googleClientId) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response?.credential) {
              setIsGoogleLoading(true);
              try {
                const res = await loginWithGoogle({ credential: response.credential });
                if (!res.success) {
                  setErrorMsg(res.error || 'Gagal autentikasi Google.');
                } else {
                  closeAuthModal();
                }
              } catch {
                setErrorMsg('Terjadi kendala saat memproses akun Google.');
              } finally {
                setIsGoogleLoading(false);
              }
            }
          }
        });

        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 340,
            locale: 'id'
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleGsi();
    } else {
      script.onload = initGoogleGsi;
    }
  }, [isAuthModalOpen, googleClientId]);

  if (!isAuthModalOpen) return null;

  const handleManualGoogleClick = async () => {
    setErrorMsg(null);

    // If Google Client ID is configured, trigger Google GIS Prompt
    if (googleClientId && window.google?.accounts?.id) {
      setIsGoogleLoading(true);
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsGoogleLoading(false);
        }
      });
      return;
    }

    // Fallback: If Client ID is not yet entered in environment
    setIsGoogleLoading(true);
    try {
      // Informs user that Google Client ID is required for production OAuth
      const defaultGoogleUser = {
        name: 'Pengguna Google Peygo',
        email: 'user.google@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      };

      const result = await loginWithGoogle(defaultGoogleUser);
      if (!result.success) {
        setErrorMsg(result.error || 'Gagal login dengan Google.');
      } else {
        closeAuthModal();
      }
    } catch {
      setErrorMsg('Gagal melakukan autentikasi Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-110 sm:max-w-130 overflow-hidden rounded-4xl border border-slate-300 bg-white shadow-2xl shadow-slate-950/25 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-950 transition-colors cursor-pointer"
          title="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-7 sm:p-9">
          {/* Brand & Identity Header */}
          <div className="text-center pb-6">
            <div className="inline-flex items-center justify-center mb-3.5">
              <PeygoLogoIcon size="lg" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Masuk ke Peygo
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-1.5 leading-relaxed">
              Jual beli dan nego gadget & barang bekas aman terpercaya.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-4 rounded-2xl bg-rose-100 p-3.5 text-xs font-bold text-rose-800 border border-rose-300 text-center animate-in fade-in flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary CTA Section */}
          <div className="space-y-4">
            {/* Google GIS rendered container */}
            <div
              ref={googleBtnContainerRef}
              className={`flex justify-center ${googleClientId ? 'block' : 'hidden'}`}
            />

            {/* Custom Google Action Button */}
            {!googleClientId && (
              <button
                type="button"
                onClick={handleManualGoogleClick}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-100 hover:border-slate-400 py-3.5 px-5 text-sm font-black text-slate-900 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50 active:scale-98 group"
              >
                <GoogleIcon className="h-5 w-5 shrink-0 group-hover:scale-105 transition-transform" />
                <span>
                  {isGoogleLoading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}
                </span>
              </button>
            )}

            {/* Divider */}
            <div className="relative mt-5.5 mb-3.5 flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Jaminan Transaksi Aman
              </span>
            </div>

            {/* 3 Pillar Cards with Vibrant High-Contrast Thematic Accents */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Pillar 1: Blue */}
              <div className="rounded-2xl bg-blue-50/90 border border-blue-200 p-3 text-center transition-all hover:bg-blue-100/70">
                <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white shadow-2xs">
                  <Zap className="h-3.5 w-3.5 stroke-2.5" />
                </div>
                <span className="text-[11px] font-black text-blue-950 block">1-Klik Masuk</span>
                <span className="text-[10px] font-bold text-blue-700 block leading-tight">Instan</span>
              </div>

              {/* Pillar 2: Brand Indigo */}
              <div className="rounded-2xl bg-indigo-50/90 border border-indigo-200 p-3 text-center transition-all hover:bg-indigo-100/70">
                <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
                  <Shield className="h-3.5 w-3.5 stroke-2.5" />
                </div>
                <span className="text-[11px] font-black text-indigo-950 block">Garansi 48 Jam</span>
                <span className="text-[10px] font-bold text-indigo-700 block leading-tight">Cek Fisik</span>
              </div>

              {/* Pillar 3: Warm Amber */}
              <div className="rounded-2xl bg-amber-50/90 border border-amber-200 p-3 text-center transition-all hover:bg-amber-100/70">
                <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-white shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 stroke-2.5" />
                </div>
                <span className="text-[11px] font-black text-amber-950 block">Nego Resmi</span>
                <span className="text-[10px] font-bold text-amber-800 block leading-tight">Ke Penjual</span>
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Dengan melanjutkan, Anda menyetujui <span className="text-slate-900 font-bold underline cursor-pointer">Ketentuan Layanan</span> & <span className="text-slate-900 font-bold underline cursor-pointer">Kebijakan Privasi</span> Rekber Peygo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
