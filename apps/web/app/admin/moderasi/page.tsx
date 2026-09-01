'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { formatIDR, formatTimeAgo } from '@/lib/utils';
import { Package, Eye, Shield, Check, X } from 'lucide-react';

export default function AdminModerationPage() {
  const queryClient = useQueryClient();
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const { data: listingsData } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => api.getAdminListings()
  });

  const listings = listingsData?.data || [];

  const handleUpdateStatus = async (listingId: string, status: 'ACTIVE' | 'ARCHIVED') => {
    setIsProcessingAction(true);
    const res = await api.updateListingStatus(listingId, status);
    if (res.success) {
      alert(res.message || 'Status iklan berhasil diperbarui');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      ]);
    } else {
      alert(res.error?.message || 'Gagal mengubah status iklan');
    }
    setIsProcessingAction(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Package className="h-6 w-6 text-slate-700" />
            <span>Moderasi Iklan & Katalog Barang Marketplace</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Pantau kepatuhan konten iklan barang bekas dan lakukan takedown/arsip untuk barang terlarang atau mencurigakan.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 text-slate-800 border border-slate-200 px-3.5 py-1 text-xs font-black w-fit">
          {listings.length} Total Iklan
        </span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Foto & Judul Iklan</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Harga</th>
                <th className="p-4">Penjual & Lokasi</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi Moderasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings.map((l: any) => {
                const cover = l.images?.[0]?.url || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80';

                return (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={cover}
                          alt={l.title}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/listing/${l.id}`}
                            target="_blank"
                            className="font-bold text-slate-900 hover:text-brand-600 line-clamp-1 flex items-center gap-1"
                          >
                            <span>{l.title}</span>
                            <Eye className="h-3 w-3 text-slate-400 shrink-0" />
                          </Link>
                          <span className="text-[10px] text-slate-400 font-medium">Kondisi: {l.condition}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-600">{l.category}</td>
                    <td className="p-4 font-black text-brand-700">{formatIDR(l.price)}</td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{l.seller?.name || 'Penjual'}</span>
                      <span className="text-[10px] text-slate-500">{l.city || 'Indonesia'}</span>
                    </td>
                    <td className="p-4">
                      {l.status === 'ACTIVE' ? (
                        <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-black">
                          Tayang Aktif
                        </span>
                      ) : l.status === 'ARCHIVED' ? (
                        <span className="rounded-full bg-slate-200 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                          Ditakedown (Arsip)
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">
                          {l.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {l.status === 'ACTIVE' ? (
                        <button
                          type="button"
                          disabled={isProcessingAction}
                          onClick={() => handleUpdateStatus(l.id, 'ARCHIVED')}
                          className="rounded-full bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 px-3 py-1 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Takedown / Arsipkan
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isProcessingAction}
                          onClick={() => handleUpdateStatus(l.id, 'ACTIVE')}
                          className="rounded-full bg-brand-50 border border-brand-200 hover:bg-brand-100 text-brand-700 px-3 py-1 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Aktifkan Kembali
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
