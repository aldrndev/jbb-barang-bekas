'use client';

import { InvoicePrintableView } from '@/components/invoice/invoice-printable-view';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

export default function InvoiceDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const invoiceId = params.id as string;
  const roleParam = searchParams.get('role') as 'BUYER' | 'SELLER' | 'ADMIN' | null;
  const { user } = useAuth();

  const {
    data: invoiceData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => api.getInvoice(invoiceId),
    enabled: !!invoiceId
  });

  const invoice = invoiceData?.data;

  // Determine user role mode
  let activeRole: 'BUYER' | 'SELLER' | 'ADMIN' = 'BUYER';
  if (roleParam) {
    activeRole = roleParam;
  } else if (user?.role === 'ADMIN') {
    activeRole = 'ADMIN';
  } else if (invoice && user && invoice.sellerId === user.id) {
    activeRole = 'SELLER';
  }

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
          <span className="text-xs font-bold text-slate-500">Memuat Faktur Tagihan...</span>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xs space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">Faktur Tidak Ditemukan</h2>
            <p className="text-xs text-slate-500">
              Faktur dengan nomor <strong className="font-mono">{invoiceId}</strong> tidak ditemukan
              atau Anda tidak memiliki hak akses.
            </p>
          </div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Riwayat Pesanan</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="print:hidden">
          <Breadcrumbs
            items={[
              { label: 'Pesanan', href: '/orders' },
              { label: `Faktur #${invoice.invoiceNumber}` }
            ]}
          />
        </div>

        <InvoicePrintableView
          invoice={invoice}
          roleMode={activeRole}
          onStatusUpdated={() => refetch()}
        />
      </div>
    </div>
  );
}
