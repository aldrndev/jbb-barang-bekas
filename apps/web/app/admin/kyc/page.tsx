'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { formatTimeAgo } from '@/lib/utils';
import {
  UserCheck,
  CheckCircle2,
  Check,
  X,
  Shield,
  Eye
} from 'lucide-react';

const DEFAULT_KYC_QUEUE = [
  {
    id: 'usr-kyc-pending-1',
    name: 'Rian Hidayat (Pendaftar Baru)',
    email: 'rian.hidayat@example.com',
    phone: '081288991122',
    nik: '3273081903980002',
    ktpImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    selfieImageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    isKycVerified: false,
    trustScore: 82,
    role: 'BUYER',
    createdAt: '2026-08-31T14:20:00Z',
    kycSubmittedAt: '2026-08-31T15:00:00Z'
  },
  {
    id: 'usr-kyc-pending-2',
    name: 'Siti Nurhaliza (Calon Penjual)',
    email: 'siti.nurhaliza@example.com',
    phone: '081377889900',
    nik: '3175026708990004',
    ktpImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    selfieImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    isKycVerified: false,
    trustScore: 85,
    role: 'BUYER',
    createdAt: '2026-08-31T10:15:00Z',
    kycSubmittedAt: '2026-08-31T11:45:00Z'
  },
  {
    id: 'usr-kyc-pending-3',
    name: 'Ahmad Zaki Gunawan',
    email: 'ahmad.zaki@example.com',
    phone: '081900112233',
    nik: '3578011204940003',
    ktpImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    selfieImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    isKycVerified: false,
    trustScore: 80,
    role: 'BUYER',
    createdAt: '2026-08-30T09:00:00Z',
    kycSubmittedAt: '2026-08-30T09:30:00Z'
  },
  {
    id: 'usr-seller-1',
    name: 'Budi Santoso (Penjual Terverifikasi)',
    email: 'budi@example.com',
    phone: '081987654321',
    nik: '3174092801950001',
    ktpImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    selfieImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    isKycVerified: true,
    trustScore: 98,
    role: 'SELLER',
    createdAt: '2026-08-01T08:00:00Z',
    kycSubmittedAt: '2026-08-02T10:00:00Z'
  }
];

export default function AdminKycPage() {
  const queryClient = useQueryClient();
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const { data: kycData } = useQuery({
    queryKey: ['admin-kyc'],
    queryFn: () => api.getAdminKycQueue()
  });

  const kycQueue = (kycData?.data && kycData.data.length > 0) ? kycData.data : DEFAULT_KYC_QUEUE;

  const handleApprove = async (userId: string) => {
    setIsProcessingAction(true);
    const res = await api.approveKyc(userId);
    if (res.success) {
      alert(res.message || 'KYC berhasil disetujui!');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-kyc'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      ]);
    } else {
      alert(res.error?.message || 'Gagal menyetujui KYC');
    }
    setIsProcessingAction(false);
  };

  const handleReject = async (userId: string) => {
    setIsProcessingAction(true);
    const res = await api.rejectKyc(userId);
    if (res.success) {
      alert(res.message || 'KYC ditolak.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-kyc'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      ]);
    } else {
      alert(res.error?.message || 'Gagal menolak KYC');
    }
    setIsProcessingAction(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <UserCheck className="h-6 w-6 text-amber-600" />
            <span>Antrean Verifikasi KYC KTP Pengguna</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Tinjau kecocokan nomor NIK, foto KTP asli, dan foto selfie pengguna sebelum mengesahkan akun penjual resmi.
          </p>
        </div>
        <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-3.5 py-1 text-xs font-black w-fit">
          {kycQueue.filter((u: any) => !u.isKycVerified).length} Menunggu Validasi
        </span>
      </div>

      <div className="space-y-3.5">
        {kycQueue.map((u: any) => (
          <div
            key={u.id}
            className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <img
                src={u.selfieImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={u.name}
                className="h-12 w-12 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm text-slate-900">{u.name}</h4>
                  {u.isKycVerified ? (
                    <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.2 text-[10px] font-black flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Terverifikasi Resmi</span>
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.2 text-[10px] font-bold">
                      Menunggu Review
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  <span>NIK: <strong className="font-mono text-slate-700">{u.nik || '3174092801950001'}</strong></span>
                  <span>&bull;</span>
                  <span>HP: <strong>{u.phone || '-'}</strong></span>
                  <span>&bull;</span>
                  <span>Diajukan: {formatTimeAgo(u.kycSubmittedAt || u.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Actions & KTP Zoom Preview */}
            <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewImageUrl(u.ktpImageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80')}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5 text-slate-500" />
                <span>Lihat Foto KTP</span>
              </button>

              {!u.isKycVerified ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isProcessingAction}
                    onClick={() => handleReject(u.id)}
                    className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3.5 py-1.5 text-xs font-bold text-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Tolak</span>
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingAction}
                    onClick={() => handleApprove(u.id)}
                    className="flex items-center gap-1 rounded-full bg-brand-600 hover:bg-brand-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Setujui (Approve)</span>
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-bold px-2">
                  ✓ Selesai Diverifikasi
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Full Photo Zoom Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">Pratinjau Dokumen KYC KTP</span>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2">
              <img
                src={previewImageUrl}
                alt="KYC Preview"
                className="w-full h-auto max-h-[70vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
