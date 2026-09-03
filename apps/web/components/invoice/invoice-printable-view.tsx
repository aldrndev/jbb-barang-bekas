'use client';

import { PeygoLogoIcon } from '@/components/common/peygo-logo';
import { useToast } from '@/context/toast-context';
import { api } from '@/lib/api-client';
import { formatIDR } from '@/lib/utils';
import type { Invoice } from '@jbb/types';
import { AlertCircle, CheckCircle2, Clock, Copy, Printer, Share2, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface InvoicePrintableViewProps {
  invoice: Invoice;
  roleMode?: 'BUYER' | 'SELLER' | 'ADMIN';
  onStatusUpdated?: (updated: Invoice) => void;
  showBackToDashboard?: boolean;
}

function formatPaymentMethod(channel?: string | null) {
  if (!channel) return 'Payment Gateway';
  const c = channel.toUpperCase();
  if (c.includes('BCA')) return 'BCA Virtual Account';
  if (c.includes('BNI')) return 'BNI Virtual Account';
  if (c.includes('BRI')) return 'BRI Virtual Account';
  if (c.includes('MANDIRI')) return 'Mandiri Virtual Account';
  if (c.includes('PERMATA')) return 'Permata Virtual Account';
  if (c.includes('QRIS')) return 'QRIS';
  if (c.includes('GOPAY')) return 'GoPay';
  if (c.includes('OVO')) return 'OVO';
  if (c.includes('SHOPEEPAY')) return 'ShopeePay';
  return channel.replace(/_/g, ' ');
}

export function InvoicePrintableView({
  invoice,
  roleMode = 'BUYER',
  onStatusUpdated,
  showBackToDashboard = true
}: InvoicePrintableViewProps) {
  const toast = useToast();
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isPaid = invoice.status === 'PAID';
  const isCancelled = invoice.status === 'CANCELLED';
  const isUnpaid = invoice.status === 'UNPAID';

  const copyToClipboard = (text: string, label: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      toast.success('Tersalin', `${label} berhasil disalin ke clipboard.`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleSimulatePayment = async () => {
    setIsSimulatingPayment(true);
    try {
      const res = await api.simulatePaymentSuccess(
        invoice.id,
        invoice.paymentMeta?.channel || 'BCA_VA'
      );
      if (res.success) {
        toast.success(
          'Pembayaran Sukses!',
          'Simulasi webhook Payment Gateway berhasil mengonfirmasi pembayaran.'
        );
        if (onStatusUpdated) {
          onStatusUpdated({
            ...invoice,
            status: 'PAID',
            paidAt: new Date().toISOString(),
            paymentMeta: {
              ...invoice.paymentMeta,
              paidAt: new Date().toISOString()
            }
          });
        }
      } else {
        toast.error('Gagal', res.error?.message || 'Gagal memproses simulasi pembayaran.');
      }
    } catch {
      toast.error('Gagal', 'Terjadi kesalahan saat memproses pembayaran.');
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. TOP ACTION CONTROLS (Hidden during printing) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 sm:p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          {showBackToDashboard && (
            <Link
              href={roleMode === 'ADMIN' ? '/admin/invoices' : '/orders'}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <span>← Kembali</span>
            </Link>
          )}
          <span className="text-xs text-slate-500 font-medium">
            Faktur #{invoice.invoiceNumber}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isUnpaid && (
            <button
              type="button"
              disabled={isSimulatingPayment}
              onClick={handleSimulatePayment}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{isSimulatingPayment ? 'Memproses...' : '⚡ Simulasi Lunas'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              copyToClipboard(
                typeof window !== 'undefined' ? window.location.href : '',
                'Link Faktur'
              )
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            {copiedField === 'Link Faktur' ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Share2 className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span>{copiedField === 'Link Faktur' ? 'Tersalin!' : 'Bagikan'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* 2. PRINTABLE INVOICE CARD (Clean, Professional A4 Format) */}
      <div
        id="invoice-document"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs text-slate-800 space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none max-w-3xl mx-auto"
      >
        {/* Header: Logo (left) + Invoice Title & Key Meta (right) */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <PeygoLogoIcon size="md" />
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                  PEYGO<span className="text-brand-600">.ID</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 block">
                  Peygo &bull; Part of Digitesia Edge Digital
                </span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <h1 className="text-lg font-black tracking-wide text-slate-900 uppercase">INVOICE</h1>
            <div className="text-xs font-mono font-bold text-slate-700">
              {invoice.invoiceNumber}
            </div>
            <div className="pt-0.5">
              {isPaid && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Lunas</span>
                </span>
              )}
              {isUnpaid && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                  <Clock className="h-3 w-3 text-amber-600" />
                  <span>Menunggu Pembayaran</span>
                </span>
              )}
              {isCancelled && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                  <AlertCircle className="h-3 w-3 text-rose-600" />
                  <span>Dibatalkan</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Meta & Parties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* Left: Penjual & Info Transaksi */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Diterbitkan Atas Nama
              </span>
              <div className="font-bold text-slate-900">{invoice.sellerName}</div>
              {invoice.sellerCity && (
                <div className="text-slate-500 text-[11px]">Kota Asal: {invoice.sellerCity}</div>
              )}
              {invoice.sellerPhone && (
                <div className="text-slate-500 text-[11px]">Kontak: {invoice.sellerPhone}</div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Tanggal Transaksi
                </span>
                <span className="font-semibold text-slate-700">
                  {new Date(invoice.issuedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              {invoice.orderNumber && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    No. Pesanan
                  </span>
                  <span className="font-mono font-semibold text-slate-700">
                    {invoice.orderNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Tujuan Pengiriman */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Tujuan Pengiriman
              </span>
              <div className="font-bold text-slate-900">{invoice.buyerName}</div>
              {invoice.buyerPhone && (
                <div className="text-slate-500 text-[11px]">{invoice.buyerPhone}</div>
              )}
              <div className="text-slate-600 text-[11px] leading-relaxed mt-0.5">
                {invoice.buyerAddress}
                {invoice.buyerCity && `, ${invoice.buyerCity}`}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Metode Pengiriman
                </span>
                <span className="font-semibold text-slate-700">
                  {invoice.deliveryMethod === 'COD_KETEMUAN'
                    ? 'COD (Ketemuan Langsung)'
                    : invoice.courierName || 'Kurir Reguler'}
                </span>
              </div>
              {invoice.trackingNumber && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    No. Resi
                  </span>
                  <span className="font-mono font-bold text-brand-700">
                    {invoice.trackingNumber}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-8 text-center">No</th>
                <th className="py-2.5 px-3">Info Produk</th>
                <th className="py-2.5 px-3 text-center w-14">Qty</th>
                <th className="py-2.5 px-3 text-right w-28">Harga Satuan</th>
                <th className="py-2.5 px-3 text-right w-32">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {invoice.items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900 block">{item.title}</span>
                    {item.description && (
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {item.description}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold text-slate-700">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {formatIDR(item.price)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatIDR(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment & Financial Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2 text-xs">
          {/* Left: Metode Pembayaran */}
          <div className="text-slate-500 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5">
              <span>Metode Pembayaran:</span>
              <span className="font-semibold text-slate-800">
                {formatPaymentMethod(invoice.paymentMeta?.channel)}
              </span>
            </div>
            {isUnpaid && invoice.paymentMeta?.vaNumber && (
              <div className="flex items-center gap-1.5 pt-0.5">
                <span>No. Virtual Account:</span>
                <span className="font-mono font-bold text-slate-900">
                  {invoice.paymentMeta.vaNumber}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(invoice.paymentMeta?.vaNumber || '', 'No VA')}
                  className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  title="Salin No VA"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Rincian Biaya */}
          <div className="w-full sm:w-72 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal Produk</span>
              <span className="font-mono font-medium text-slate-800">
                {formatIDR(invoice.amount)}
              </span>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>Total Ongkos Kirim</span>
              <span className="font-mono font-medium text-slate-800">
                {invoice.shippingFee > 0 ? formatIDR(invoice.shippingFee) : 'Rp 0'}
              </span>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>Biaya Layanan & Perlindungan</span>
              <span className="font-mono font-medium text-slate-800">
                {formatIDR(invoice.serviceFee)}
              </span>
            </div>

            {Boolean(invoice.discountAmount && invoice.discountAmount > 0) && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Diskon Promo</span>
                <span className="font-mono">-{formatIDR(invoice.discountAmount || 0)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-900 text-sm">Total Tagihan</span>
              <span className="font-black font-mono text-base text-brand-700">
                {formatIDR(invoice.totalAmount)}
              </span>
            </div>

            {(roleMode === 'SELLER' || roleMode === 'ADMIN') && (
              <div className="mt-2 pt-2 border-t border-dashed border-slate-200 text-[11px] text-slate-500 flex justify-between">
                <span>Pencairan Bersih Penjual:</span>
                <span className="font-bold font-mono text-emerald-700">
                  {formatIDR(invoice.netSellerAmount || invoice.amount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
          <p>
            {invoice.terms ||
              'Faktur ini merupakan bukti transaksi yang sah dan diproses secara otomatis oleh sistem komputer Peygo.'}
          </p>
          <p>
            Butuh bantuan? Kunjungi Pusat Bantuan di{' '}
            <span className="text-slate-600 font-medium">peygo.id/pusat-bantuan</span>
          </p>
        </div>
      </div>
    </div>
  );
}
