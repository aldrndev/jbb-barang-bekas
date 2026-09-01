'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { formatIDR, formatTimeAgo } from '@/lib/utils';
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  User,
  Building,
  ShieldCheck,
  RefreshCw,
  Check,
  CheckCircle2,
  X,
  CreditCard,
  Truck
} from 'lucide-react';

const DEFAULT_DISPUTES = [
  {
    id: 'ord-dispute-demo-1',
    orderNumber: 'JBB-2026-9901',
    listingId: 'lst-macbook-1',
    buyerId: 'usr-buyer-1',
    sellerId: 'usr-seller-1',
    amount: 16500000,
    shippingFee: 35000,
    serviceFee: 25000,
    totalAmount: 16560000,
    escrowStatus: 'DISPUTED',
    deliveryMethod: 'KURIR_REGULER',
    courierName: 'JNE Express YES',
    trackingNumber: 'JNE-882910293',
    disputeReason: 'Layar MacBook terdapat staingate baret tebal memanjang di area tengah yang tidak dicantumkan di deskripsi penjual. Mohon refund penuh ke rekening.',
    disputeEvidenceUrls: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
    ],
    listing: {
      id: 'lst-macbook-1',
      title: 'MacBook Pro 14 M1 Pro 16/512GB Space Grey Fullset Box',
      price: 16500000,
      condition: 'LIKE_NEW',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
    },
    buyer: {
      id: 'usr-buyer-1',
      name: 'Dimas Aditya (Pembeli)',
      email: 'dimas@example.com',
      phone: '081234567890'
    },
    seller: {
      id: 'usr-seller-1',
      name: 'Budi Santoso (Penjual)',
      email: 'budi@example.com',
      phone: '081987654321',
      bankName: 'Bank Central Asia (BCA)',
      bankAccountNumber: '8271029384'
    },
    createdAt: '2026-08-30T10:00:00Z',
    updatedAt: '2026-08-31T14:00:00Z'
  },
  {
    id: 'ord-dispute-demo-2',
    orderNumber: 'JBB-2026-9904',
    listingId: 'lst-sony-a7',
    buyerId: 'usr-buyer-2',
    sellerId: 'usr-seller-2',
    amount: 19800000,
    shippingFee: 40000,
    serviceFee: 30000,
    totalAmount: 19870000,
    escrowStatus: 'DISPUTED',
    deliveryMethod: 'KURIR_REGULER',
    courierName: 'SiCepat BEST',
    trackingNumber: '002938491028',
    disputeReason: 'Sensor kamera terdapat jamur/fungus tipis saat diuji pada aperture f/16, padahal di chat penjual menyatakan optik sensor 100% bening cling.',
    disputeEvidenceUrls: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80'
    ],
    listing: {
      id: 'lst-sony-a7',
      title: 'Sony Alpha A7 III Body Only SC Rendah 3.200 Fullset',
      price: 19800000,
      condition: 'LIGHTLY_USED',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80'
    },
    buyer: {
      id: 'usr-buyer-2',
      name: 'Hendra Gunawan (Pembeli)',
      email: 'hendra.gunawan@example.com',
      phone: '081377889900'
    },
    seller: {
      id: 'usr-seller-2',
      name: 'Andi Wijaya (Penjual)',
      email: 'andi.wijaya@example.com',
      phone: '081299001122',
      bankName: 'Bank Mandiri',
      bankAccountNumber: '1370019283741'
    },
    createdAt: '2026-08-31T08:00:00Z',
    updatedAt: '2026-08-31T16:20:00Z'
  }
];

export default function AdminDisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const disputeId = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<'REFUND_BUYER' | 'RELEASE_TO_SELLER' | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  const { data: disputesData } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => api.getAdminDisputes()
  });

  const disputes = (disputesData?.data && disputesData.data.length > 0) ? disputesData.data : DEFAULT_DISPUTES;
  const dispute = disputes.find((d: any) => d.id === disputeId) || disputes[0];

  const executeResolve = async (action: 'REFUND_BUYER' | 'RELEASE_TO_SELLER') => {
    setIsProcessingAction(true);
    setConfirmModal(null);
    const res = await api.resolveDispute(dispute.id, action, adminNotes);
    if (res.success) {
      setToast({
        type: 'success',
        title: 'Putusan Mediasi Berhasil! 🎉',
        message: res.message || 'Putusan sengketa berhasil dieksekusi dan dana telah diproses.'
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-disputes'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-payouts'] })
      ]);
      setTimeout(() => {
        router.push('/admin/sengketa');
      }, 1500);
    } else {
      setToast({
        type: 'error',
        title: 'Eksekusi Gagal ⚠️',
        message: res.error?.message || 'Gagal mengeksekusi putusan sengketa'
      });
    }
    setIsProcessingAction(false);
  };

  if (!dispute) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Kasus Sengketa Tidak Ditemukan</h3>
        <Link
          href="/admin/sengketa"
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-bold"
        >
          <span>← Kembali ke Daftar Sengketa</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-md animate-in slide-in-from-top-4">
          <div
            className={`rounded-2xl border p-4 shadow-2xl backdrop-blur-md flex items-start gap-3.5 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/40 ring-1 ring-emerald-500/20'
                : 'bg-slate-900/95 text-white border-rose-500/50 shadow-rose-950/40 ring-1 ring-rose-500/20'
            }`}
          >
            {toast.type === 'success' ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
            )}
            <div className="space-y-1 flex-1 min-w-0">
              <h4 className="font-black text-xs text-white tracking-wide">{toast.title}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Back Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
        <Link
          href="/admin/sengketa"
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors group w-fit"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-brand-50 text-slate-600 group-hover:text-brand-600 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span>Kembali ke Daftar Kasus Sengketa</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1 text-xs font-black">
            {dispute.orderNumber}
          </span>
          <span className="rounded-full bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 text-xs font-extrabold flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Menunggu Putusan Mediasi</span>
          </span>
        </div>
      </div>

      {/* Main Dispute Case Card */}
      <div className="rounded-3xl border-2 border-rose-200 bg-white p-5 sm:p-7 shadow-xs space-y-6">
        {/* Header Case Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3.5">
            <img
              src={dispute.listing?.imageUrl || dispute.disputeEvidenceUrls?.[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80'}
              alt={dispute.listing?.title || 'Barang'}
              className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
            />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Barang yang Disengketakan:
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                {dispute.listing?.title || 'Barang Sengketa'}
              </h3>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Dana Tertahan di Rekber:
            </span>
            <span className="text-lg sm:text-2xl font-black text-brand-700 block">
              {formatIDR(dispute.totalAmount || dispute.amount || 16560000)}
            </span>
          </div>
        </div>

        {/* Two Columns: Buyer Evidence vs Seller & Escrow Logistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
          {/* Column 1: Buyer Claim & Evidence */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 sm:p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-rose-200 pb-2.5">
              <span className="font-black text-rose-900 text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-rose-600" />
                <span>Pihak Penggugat (Pembeli)</span>
              </span>
              <span className="font-bold text-[11px] text-rose-800">
                {dispute.buyer?.name}
              </span>
            </div>

            <div className="space-y-1 text-slate-700">
              <p>Email: <strong>{dispute.buyer?.email || '-'}</strong></p>
              <p>WhatsApp: <strong>{dispute.buyer?.phone || '-'}</strong></p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold text-rose-900 block">
                Pernyataan & Alasan Komplain:
              </span>
              <p className="text-slate-800 leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs">
                "{dispute.disputeReason || 'Barang tidak sesuai dengan deskripsi penjual.'}"
              </p>
            </div>

            {/* Evidence Photo Gallery */}
            {dispute.disputeEvidenceUrls && dispute.disputeEvidenceUrls.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-extrabold text-slate-700 block">
                  Foto & Video Bukti Fisik / Unboxing (Klik untuk perbesar):
                </span>
                <div className="flex gap-2.5 flex-wrap">
                  {dispute.disputeEvidenceUrls.map((imgUrl: string, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => setPreviewImageUrl(imgUrl)}
                      className="relative group cursor-pointer"
                    >
                      <img
                        src={imgUrl}
                        alt={`Evidence ${idx + 1}`}
                        className="h-20 w-20 rounded-xl object-cover border-2 border-slate-300 group-hover:border-brand-500 group-hover:scale-105 transition-all shadow-2xs"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                        Perbesar
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Seller & Logistics Details */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Building className="h-4 w-4 text-brand-600" />
                <span>Pihak Tergugat (Penjual)</span>
              </span>
              <span className="font-bold text-[11px] text-slate-800">
                {dispute.seller?.name}
              </span>
            </div>

            <div className="space-y-1 text-slate-700">
              <p>WhatsApp: <strong>{dispute.seller?.phone || '-'}</strong></p>
              <p>Email: <strong>{dispute.seller?.email || '-'}</strong></p>
            </div>

            {/* Bank Details */}
            <div className="rounded-xl bg-white p-3 border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Rekening Bank Pencairan Tujuan:
              </span>
              <p className="font-bold text-slate-900 text-xs">
                {dispute.seller?.bankName || 'Bank Central Asia (BCA)'}
              </p>
              <p className="font-mono text-slate-700 text-xs">
                {dispute.seller?.bankAccountNumber || '8271029384'} (a.n {dispute.seller?.name})
              </p>
            </div>

            {/* Logistics & Escrow Fee Breakdown */}
            <div className="rounded-xl bg-white p-3 border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Log Pengiriman & Rekber:
              </span>
              <div className="space-y-1 text-[11px] text-slate-600">
                <p>Kurir: <strong>{dispute.courierName || 'JNE Express'}</strong></p>
                <p>No. Resi: <strong className="font-mono text-slate-900">{dispute.trackingNumber || 'JNE-882910293'}</strong></p>
                <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-xs">
                  <span>Total Nilai Sengketa:</span>
                  <span className="text-brand-700">{formatIDR(dispute.totalAmount || dispute.amount || 16560000)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Decision Board */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <span>Panel Eksekusi Putusan Mediasi Petugas Rekber</span>
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Putusan ini bersifat mengikat dan akan langsung memproses arus dana escrow ke rekening tujuan.
            </p>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Catatan Investigasi / Pertimbangan Putusan Admin (Opsional):
            </label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Tuliskan ringkasan bukti verifikasi untuk catatan log mediasi..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              disabled={isProcessingAction}
              onClick={() => setConfirmModal('REFUND_BUYER')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 px-6 py-3 text-xs font-bold text-white shadow-md shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              <span>🔄 Putuskan Refund Penuh ke Pembeli</span>
            </button>

            <button
              type="button"
              disabled={isProcessingAction}
              onClick={() => setConfirmModal('RELEASE_TO_SELLER')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>💰 Putuskan Cairkan Dana ke Penjual</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setConfirmModal(null)}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    confirmModal === 'REFUND_BUYER'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    {confirmModal === 'REFUND_BUYER'
                      ? 'Konfirmasi Refund Penuh'
                      : 'Konfirmasi Pencairan ke Penjual'}
                  </h3>
                  <span className="text-[11px] text-slate-400">Putusan Resmi Mediasi Bekasin</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700 leading-relaxed">
              <p>
                {confirmModal === 'REFUND_BUYER'
                  ? `Apakah Anda yakin ingin memutuskan REFUND PENUH sebesar ${formatIDR(
                      dispute.totalAmount || dispute.amount || 16560000
                    )} ke rekening pembeli (${dispute.buyer?.name})?`
                  : `Apakah Anda yakin ingin memutuskan CAIRKAN DANA sebesar ${formatIDR(
                      dispute.totalAmount || dispute.amount || 16560000
                    )} ke rekening bank penjual (${dispute.seller?.name})?`}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Dana escrow akan otomatis disettle seketika dan status kasus sengketa ditutup.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => executeResolve(confirmModal)}
                className={`flex-1 rounded-2xl py-2.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
                  confirmModal === 'REFUND_BUYER'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmModal === 'REFUND_BUYER' ? 'Eksekusi Refund' : 'Eksekusi Pencairan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800">Bukti Fisik / Unboxing Resolusi Penuh</span>
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
                alt="Full Preview"
                className="w-full h-auto max-h-[75vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
