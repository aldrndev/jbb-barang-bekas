'use client';

import React from 'react';
import { EscrowStatus, EscrowStatusLabel } from '@jbb/types';
import {
  Clock,
  ShieldCheck,
  Package,
  Truck,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface EscrowStatusBadgeProps {
  status: EscrowStatus;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export function EscrowStatusBadge({
  status,
  size = 'md',
  showDescription = false
}: EscrowStatusBadgeProps) {
  const meta = EscrowStatusLabel[status] || {
    label: status,
    badge: status,
    description: ''
  };

  const getStyleAndIcon = () => {
    switch (status) {
      case 'WAITING_PAYMENT':
        return {
          containerClass: 'bg-amber-50 text-amber-900 border-amber-200/90',
          icon: <Clock className={size === 'sm' ? 'h-3 w-3 text-amber-600' : 'h-3.5 w-3.5 text-amber-600'} />
        };
      case 'PAYMENT_CONFIRMED':
        return {
          containerClass: 'bg-brand-50 text-brand-900 border-brand-200/90',
          icon: <ShieldCheck className={size === 'sm' ? 'h-3 w-3 text-brand-600' : 'h-3.5 w-3.5 text-brand-600'} />
        };
      case 'SELLER_PACKING':
        return {
          containerClass: 'bg-orange-50 text-orange-900 border-orange-200/90',
          icon: <Package className={size === 'sm' ? 'h-3 w-3 text-orange-600' : 'h-3.5 w-3.5 text-orange-600'} />
        };
      case 'IN_TRANSIT':
        return {
          containerClass: 'bg-blue-50 text-blue-900 border-blue-200/90',
          icon: <Truck className={size === 'sm' ? 'h-3 w-3 text-blue-600' : 'h-3.5 w-3.5 text-blue-600'} />
        };
      case 'DELIVERED_INSPECTION':
        return {
          containerClass: 'bg-purple-50 text-purple-900 border-purple-200/90',
          icon: <Eye className={size === 'sm' ? 'h-3 w-3 text-purple-600' : 'h-3.5 w-3.5 text-purple-600'} />
        };
      case 'COMPLETED':
        return {
          containerClass: 'bg-emerald-50 text-emerald-900 border-emerald-200/90',
          icon: <CheckCircle2 className={size === 'sm' ? 'h-3 w-3 text-emerald-600' : 'h-3.5 w-3.5 text-emerald-600'} />
        };
      case 'DISPUTED':
        return {
          containerClass: 'bg-rose-50 text-rose-900 border-rose-200/90',
          icon: <AlertTriangle className={size === 'sm' ? 'h-3 w-3 text-rose-600' : 'h-3.5 w-3.5 text-rose-600'} />
        };
      case 'CANCELLED':
        return {
          containerClass: 'bg-slate-100 text-slate-700 border-slate-200/90',
          icon: <XCircle className={size === 'sm' ? 'h-3 w-3 text-slate-500' : 'h-3.5 w-3.5 text-slate-500'} />
        };
      default:
        return {
          containerClass: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
        };
    }
  };

  const { containerClass, icon } = getStyleAndIcon();

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[11px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-4 py-1.5 text-sm gap-2'
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex items-center rounded-full font-extrabold border shadow-2xs ${containerClass} ${sizeClasses[size]}`}
      >
        {icon}
        <span>{meta.label}</span>
      </span>
      {showDescription && meta.description && (
        <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed">
          {meta.description}
        </p>
      )}
    </div>
  );
}
