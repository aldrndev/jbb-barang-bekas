'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { formatIDR, formatTimeAgo } from '@/lib/utils';
import { CreditCard, CheckCircle2 } from 'lucide-react';

const DEFAULT_PAYOUTS = [
  {
    id: 'pay-demo-1',
    orderNumber: 'JBB-2026-8812',
    listingTitle: 'Sony A6400 Body Only SC 4.200 Fullset Mulus',
    amount: 8900000,
    payoutBank: 'Bank Central Asia (BCA)',
    payoutAccountNumber: '8271029384',
    payoutAccountHolder: 'Budi Santoso',
    sellerName: 'Budi Santoso',
    completedAt: '2026-08-31T09:30:00Z',
    status: 'TRANSFERRED_SUCCESS'
  },
  {
    id: 'pay-demo-2',
    orderNumber: 'JBB-2026-7731',
    listingTitle: 'iPhone 13 Pro 128GB Sierra Blue iBox Fullset',
    amount: 11200000,
    payoutBank: 'Bank Mandiri',
    payoutAccountNumber: '1370019283741',
    payoutAccountHolder: 'Rian Pratama',
    sellerName: 'Rian Pratama',
    completedAt: '2026-08-30T16:15:00Z',
    status: 'TRANSFERRED_SUCCESS'
  },
  {
    id: 'pay-demo-3',
    orderNumber: 'JBB-2026-6649',
    listingTitle: 'Sony WH-1000XM5 Wireless Noise Cancelling Mulus',
    amount: 3850000,
    payoutBank: 'Bank Jago',
    payoutAccountNumber: '109283746192',
    payoutAccountHolder: 'Kevin Sanjaya',
    sellerName: 'Kevin Sanjaya',
    completedAt: '2026-08-29T11:20:00Z',
    status: 'TRANSFERRED_SUCCESS'
  },
  {
    id: 'pay-demo-4',
    orderNumber: 'JBB-2026-5520',
    listingTitle: 'PlayStation 5 Disc Edition Horizon Bundle 2 Stik',
    amount: 6900000,
    payoutBank: 'SeaBank Indonesia',
    payoutAccountNumber: '901238475619',
    payoutAccountHolder: 'Doni Prasetyo',
    sellerName: 'Doni Prasetyo',
    completedAt: '2026-08-28T14:45:00Z',
    status: 'TRANSFERRED_SUCCESS'
  }
];

export default function AdminPayoutsPage() {
  const { data: payoutsData } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: () => api.getAdminPayouts()
  });

  const payouts = (payoutsData?.data && payoutsData.data.length > 0) ? payoutsData.data : DEFAULT_PAYOUTS;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-brand-600" />
            <span>Riwayat Pencairan Bank Penjual (Payouts)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Log instruksi transfer otomatis dan settlement rekening bank penjual setelah masa garansi inspeksi 48 jam berakhir.
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-1 text-xs font-black w-fit">
          {payouts.length} Transaksi Ditransfer
        </span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">No. Pesanan</th>
                <th className="p-4">Barang</th>
                <th className="p-4">Penjual & Rekening Tujuan</th>
                <th className="p-4">Nominal Bersih</th>
                <th className="p-4">Waktu Cair</th>
                <th className="p-4 text-right">Status Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900">{p.orderNumber}</td>
                  <td className="p-4 font-medium text-slate-800 max-w-xs truncate">{p.listingTitle}</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{p.sellerName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {p.payoutBank} - {p.payoutAccountNumber} (a.n {p.payoutAccountHolder})
                    </span>
                  </td>
                  <td className="p-4 font-black text-brand-700">{formatIDR(p.amount)}</td>
                  <td className="p-4 text-slate-500 font-medium">{formatTimeAgo(p.completedAt)}</td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Berhasil Ditransfer</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
