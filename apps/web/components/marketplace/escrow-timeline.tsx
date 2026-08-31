import React from 'react';
import type { EscrowStatus } from '@jbb/types';
import { CheckCircle2, Circle, Clock, PackageCheck, Truck, ShieldCheck, AlertCircle } from 'lucide-react';

interface EscrowTimelineProps {
  status: EscrowStatus;
  trackingNumber?: string | null;
  courierName?: string | null;
}

export function EscrowTimeline({ status, trackingNumber, courierName }: EscrowTimelineProps) {
  const steps = [
    {
      id: 'PAYMENT_CONFIRMED',
      label: 'Dana Aman di Rekber',
      description: 'Pembayaran telah dikonfirmasi dan ditahan aman oleh sistem JBB.',
      icon: ShieldCheck
    },
    {
      id: 'SELLER_PACKING',
      label: 'Penjual Mengemas',
      description: 'Penjual sedang menyiapkan barang dan nomor resi pengiriman.',
      icon: PackageCheck
    },
    {
      id: 'IN_TRANSIT',
      label: 'Dalam Pengiriman',
      description: trackingNumber ? `${courierName || 'Kurir'}: Resi ${trackingNumber}` : 'Barang dalam perjalanan ke alamat Anda.',
      icon: Truck
    },
    {
      id: 'DELIVERED_INSPECTION',
      label: 'Periode Cek Barang (48 Jam)',
      description: 'Barang diterima. Anda memiliki waktu 2x24 jam untuk cek kondisi fisik & fungsi.',
      icon: Clock
    },
    {
      id: 'COMPLETED',
      label: 'Selesai & Dana Diteruskan',
      description: 'Transaksi tuntas dengan aman. Dana diteruskan ke dompet penjual.',
      icon: CheckCircle2
    }
  ];

  const getStepIndex = (st: EscrowStatus) => {
    switch (st) {
      case 'WAITING_PAYMENT': return 0;
      case 'PAYMENT_CONFIRMED': return 1;
      case 'SELLER_PACKING': return 2;
      case 'IN_TRANSIT': return 3;
      case 'DELIVERED_INSPECTION': return 4;
      case 'COMPLETED': return 5;
      case 'DISPUTED': return -1;
      default: return 1;
    }
  };

  const currentIndex = getStepIndex(status);

  if (status === 'DISPUTED') {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600" />
          <span>Status: Komplain / Sengketa Sedang Ditinjau Tim Rekber</span>
        </div>
        <p className="text-xs text-rose-600 mt-1">
          Dana transaksi saat ini dibekukan sementara hingga bukti unboxing selesai diverifikasi oleh tim penengah.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      {steps.map((step, idx) => {
        const isDone = currentIndex > idx;
        const isCurrent = currentIndex === idx + 1;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-start gap-3 relative">
            {/* Line Connector */}
            {idx < steps.length - 1 && (
              <div
                className={`absolute left-4 top-8 -bottom-2 w-0.5 ${
                  isDone ? 'bg-brand-500' : 'bg-slate-200'
                }`}
              />
            )}

            {/* Icon Bubble */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full z-10 ${
                isDone
                  ? 'bg-brand-600 text-white shadow-sm'
                  : isCurrent
                  ? 'bg-brand-100 text-brand-800 ring-4 ring-brand-50'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Step Content */}
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-between">
                <h4
                  className={`text-xs font-bold ${
                    isDone || isCurrent ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </h4>
                {isCurrent && (
                  <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-extrabold text-brand-800">
                    Sedang Berjalan
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
