'use client';
import { api } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { formatIDR, formatTimeAgo } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

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
    disputeReason:
      'Layar MacBook terdapat staingate baret tebal memanjang di area tengah yang tidak dicantumkan di deskripsi penjual. Mohon refund penuh ke rekening.',
    disputeEvidenceUrls: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
    ],
    listing: {
      id: 'lst-macbook-1',
      title: 'MacBook Pro 14 M1 Pro 16/512GB Space Grey Fullset Box',
      price: 16500000,
      condition: 'LIKE_NEW',
      imageUrl:
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
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
    disputeReason:
      'Sensor kamera terdapat jamur/fungus tipis saat diuji pada aperture f/16, padahal di chat penjual menyatakan optik sensor 100% bening cling.',
    disputeEvidenceUrls: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80'
    ],
    listing: {
      id: 'lst-sony-a7',
      title: 'Sony Alpha A7 III Body Only SC Rendah 3.200 Fullset',
      price: 19800000,
      condition: 'LIGHTLY_USED',
      imageUrl:
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80'
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

export default function AdminDisputesListPage() {
  const { user } = useAuth();
  const { data: disputesData } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => api.getAdminDisputes(),
    enabled: user?.role === 'ADMIN'
  });

  const disputes =
    disputesData?.data && disputesData.data.length > 0 ? disputesData.data : DEFAULT_DISPUTES;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <AlertTriangle className="h-6 w-6 text-rose-600" />
            <span>Pusat Mediasi Sengketa Transaksi</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Daftar pesanan dengan komplain aktif yang menunggu investigasi dan putusan mediasi
            Rekber.
          </p>
        </div>
        <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-3.5 py-1 text-xs font-black w-fit">
          {disputes.length} Kasus Aktif
        </span>
      </div>

      {disputes.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-2">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">Tidak Ada Sengketa Aktif</h4>
          <p className="text-xs text-slate-400">
            Semua transaksi berjalan lancar tanpa perselisihan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {disputes.map((d) => {
            const coverPhoto =
              (d.listing && 'imageUrl' in d.listing && typeof d.listing.imageUrl === 'string' ? d.listing.imageUrl : undefined) ||
              (d.listing && 'images' in d.listing && Array.isArray(d.listing.images) ? d.listing.images[0]?.url : undefined) ||
              d.disputeEvidenceUrls?.[0] ||
              'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80';

            return (
              <div
                key={d.id}
                className="rounded-3xl border border-slate-200 bg-white hover:border-rose-300 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3.5">
                  {/* Card Top: Case Tag & Time */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        {d.orderNumber}
                      </span>
                      <span className="rounded-full bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                        Butuh Mediasi
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {d.updatedAt ? formatTimeAgo(d.updatedAt) : 'Baru saja'}
                    </span>
                  </div>

                  {/* Product Cover Photo + Title & Price Row */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={coverPhoto}
                      alt={d.listing?.title || 'Cover Barang'}
                      className="h-20 w-20 sm:h-22 sm:w-22 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-2xs group-hover:scale-102 transition-transform"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
                        {d.listing?.title || 'Barang Sengketa'}
                      </h4>
                      <p className="text-xs sm:text-sm font-black text-brand-700">
                        {formatIDR(d.totalAmount || d.amount || 16560000)}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                        <span className="truncate">
                          👤 <strong>{d.buyer?.name}</strong>
                        </span>
                        <span>vs</span>
                        <span className="truncate">
                          🏪 <strong>{d.seller?.name}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dispute Reason Snippet */}
                  <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-200 space-y-1">
                    <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">
                      Keluhan Pembeli:
                    </span>
                    <p className="text-[11px] text-slate-700 font-medium line-clamp-2 leading-relaxed">
                      "
                      {d.disputeReason ||
                        'Barang tidak sesuai dengan foto dan deskripsi yang dicantumkan penjual.'}
                      "
                    </p>
                  </div>
                </div>

                {/* Card Bottom: Evidence Previews + Action Button to Case Detail Route */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {d.disputeEvidenceUrls?.slice(0, 3).map((imgUrl: string, idx: number) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt="Bukti"
                        className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    ))}
                    {d.disputeEvidenceUrls && d.disputeEvidenceUrls.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        +{d.disputeEvidenceUrls.length - 3}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/admin/sengketa/${d.id}`}
                    className="flex items-center gap-1.5 rounded-full bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <span>Investigasi Kasus</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
