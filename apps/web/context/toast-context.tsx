'use client';

import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import type React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (type: ToastType, title: string, description?: string, duration?: number) => void;
  success: (title: string, description?: string, duration?: number) => void;
  error: (title: string, description?: string, duration?: number) => void;
  info: (title: string, description?: string, duration?: number) => void;
  warning: (title: string, description?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, description?: string, duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, type, title, description, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, description?: string, duration?: number) => {
      showToast('success', title, description, duration);
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, description?: string, duration?: number) => {
      showToast('error', title, description, duration);
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, description?: string, duration?: number) => {
      showToast('info', title, description, duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, description?: string, duration?: number) => {
      showToast('warning', title, description, duration);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        success,
        error,
        info,
        warning,
        removeToast
      }}
    >
      {children}
      {/* Floating Stacked Toast Container */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-9999 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const typeStyles = {
            success: {
              border: 'border-emerald-200/80 bg-white/95 text-emerald-950 shadow-emerald-500/10',
              iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
              Icon: CheckCircle2
            },
            error: {
              border: 'border-rose-200/80 bg-white/95 text-rose-950 shadow-rose-500/10',
              iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
              Icon: AlertCircle
            },
            warning: {
              border: 'border-amber-200/80 bg-white/95 text-amber-950 shadow-amber-500/10',
              iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
              Icon: AlertTriangle
            },
            info: {
              border: 'border-cyan-200/80 bg-white/95 text-cyan-950 shadow-cyan-500/10',
              iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-200',
              Icon: Info
            }
          }[toast.type];

          const ToastIcon = typeStyles.Icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border ${typeStyles.border} p-3.5 sm:p-4 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-top-4 duration-300`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${typeStyles.iconBg}`}
              >
                <ToastIcon className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h4 className="text-xs font-bold leading-snug">{toast.title}</h4>
                {toast.description && (
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-medium">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
