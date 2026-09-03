'use client';

import { PeygoLogoIcon } from '@/components/common/peygo-logo';
import { useToast } from '@/context/toast-context';
import { api } from '@/lib/api-client';
import { formatIDR } from '@/lib/utils';
import type { Invoice } from '@jbb/types';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  MapPin,
  Phone,
  Printer,
  Share2,
  ShieldCheck,
  User,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface InvoicePrintableViewProps {
  invoice: Invoice;
  roleMode?: 'BUYER' | 'SELLER' | 'ADMIN';
  onStatusUpdated?: (updated: Invoice) => void;
  showBackToDashboard?: boolean;
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
    <div className="space-y-6">
      {/* 1. TOP ACTION CONTROLS (Hidden during printing) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-3xl shadow-xs">
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
            Faktur Transaksi #{invoice.invoiceNumber}
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
              <span>{isSimulatingPayment ? 'Memproses...' : '⚡ Simulasi Lunas (Gateway)'}</span>
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
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-md shadow-slate-900/20 transition-all cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* 2. PRINTABLE INVOICE CARD (A4 Standard Format) */}
      <div
        id="invoice-document"
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg text-slate-900 space-y-8 print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none max-w-4xl mx-auto relative overflow-hidden"
      >
        {/* Background Watermark Stamp for Paid Invoices */}
        {isPaid && (
          <div className="absolute right-12 top-48 pointer-events-none select-none opacity-8 print:opacity-10 rotate-[-18deg] z-0">
            <div className="border-8 border-emerald-700 rounded-3xl p-6 text-center font-black tracking-widest text-emerald-800 uppercase">
              <div className="text-4xl leading-tight">LUNAS • VERIFIED</div>
              <div className="text-sm mt-1">GARANSI PEMBELI 100% • PEYGO INDONESIA</div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <PeygoLogoIcon size="md" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900">
                    PEYGO<span className="text-brand-600">.ID</span>
                  </span>
                  <span className="rounded-md bg-brand-100 text-brand-800 text-[10px] font-black px-1.5 py-0.5">
                    OFFICIAL
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Peygo &bull; Part of Digitesia Edge Digital
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed">
              Marketplace Jual Beli Barang Bekas Terverifikasi dengan Garansi Perlindungan Pembeli
              #1 Indonesia.
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1.5 sm:min-w-50">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              FAKTUR TRANSAKSI RESMI
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-slate-900 tracking-tight">
              {invoice.invoiceNumber}
            </div>
            <div>
              {isPaid && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>LUNAS (TERVERIFIKASI)</span>
                </span>
              )}
              {isUnpaid && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black animate-pulse">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>MENUNGGU PEMBAYARAN</span>
                </span>
              )}
              {isCancelled && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-black">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                  <span>DIBATALKAN</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Metadata Dates Row */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Tanggal Terbit:
            </span>
            <strong className="text-slate-800 block mt-0.5">
              {new Date(invoice.issuedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Batas Waktu:
            </span>
            <strong className="text-slate-800 block mt-0.5">
              {invoice.dueDate
                ? new Date(invoice.dueDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : '24 Jam sejak terbit'}
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Metode Transaksi:
            </span>
            <strong className="text-slate-800 block mt-0.5">
              {invoice.deliveryMethod === 'COD_KETEMUAN' ? 'COD Ketemuan Resmi' : 'Kurir Kilat'}
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              No. Pesanan Ref:
            </span>
            <strong className="text-brand-700 font-mono block mt-0.5">
              {invoice.orderNumber || '-'}
            </strong>
          </div>
        </div>

        {/* Billed To & Provided By Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buyer Info Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-brand-600" />
                <span>Ditagihkan Kepada (Pembeli)</span>
              </span>
              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                Buyer Verified
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">{invoice.buyerName}</h4>
              <div className="space-y-1 text-xs text-slate-600 mt-1.5">
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-slate-400" />
                  <span>{invoice.buyerPhone}</span>
                </p>
                {invoice.buyerEmail && <p className="text-slate-500">{invoice.buyerEmail}</p>}
                <p className="flex items-start gap-1.5 text-slate-600 pt-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {invoice.buyerAddress} {invoice.buyerCity && `• ${invoice.buyerCity}`}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Seller Info Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-emerald-600" />
                <span>Penyedia Barang / Penjual</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                Seller Verified
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">{invoice.sellerName}</h4>
              <div className="space-y-1 text-xs text-slate-600 mt-1.5">
                {invoice.sellerPhone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{invoice.sellerPhone}</span>
                  </p>
                )}
                {invoice.sellerEmail && <p className="text-slate-500">{invoice.sellerEmail}</p>}
                <p className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Kota Asal: {invoice.sellerCity || 'Indonesia'}</span>
                </p>
                {invoice.trackingNumber && (
                  <p className="text-[11px] font-bold text-brand-700 pt-1">
                    No. Resi: <span className="font-mono">{invoice.trackingNumber}</span> (
                    {invoice.courierName || 'Ekspedisi'})
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="relative z-10 rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-4 w-10">No</th>
                <th className="p-3.5">Deskripsi Barang / Jasa</th>
                <th className="p-3.5 text-center w-16">Qty</th>
                <th className="p-3.5 text-right w-32">Harga Satuan</th>
                <th className="p-3.5 pr-4 text-right w-36">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {invoice.items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/50">
                  <td className="p-3.5 pl-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{item.title}</div>
                    {item.description && (
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.description}</div>
                    )}
                  </td>
                  <td className="p-3.5 text-center font-bold text-slate-800">{item.quantity}</td>
                  <td className="p-3.5 text-right font-mono font-medium text-slate-700">
                    {formatIDR(item.price)}
                  </td>
                  <td className="p-3.5 pr-4 text-right font-mono font-bold text-slate-900">
                    {formatIDR(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary & Payment Gateway Status */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Column: Payment Gateway / Virtual Account / QRIS */}
          <div className="space-y-3">
            {isUnpaid ? (
              <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-amber-700" />
                    <span>Pembayaran Otomatis via Payment Gateway</span>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                    {invoice.paymentMeta?.channel || 'BCA VA'}
                  </span>
                </div>

                <div className="space-y-2 pt-1 border-t border-amber-200/70">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-800">Nomor Virtual Account:</span>
                    <div className="flex items-center gap-1">
                      <strong className="font-mono text-sm text-slate-900">
                        {invoice.paymentMeta?.vaNumber || '88001928374655'}
                      </strong>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            invoice.paymentMeta?.vaNumber || '88001928374655',
                            'No VA'
                          )
                        }
                        className="p-1 text-amber-800 hover:text-slate-900 rounded cursor-pointer"
                        title="Salin Nomor VA"
                      >
                        {copiedField === 'No VA' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-900/80 leading-relaxed">
                    Transfer sesuai nominal tepat hingga digit terakhir. Status pembayaran dan
                    rekening bersama akan otomatis terverifikasi dalam hitungan detik.
                  </p>
                </div>
              </div>
            ) : isPaid ? (
              <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" />
                    <span>Pembayaran Aman Terverifikasi</span>
                  </span>
                  <span className="text-[10px] font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                    SETTLED
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-emerald-800 pt-1 border-t border-emerald-200/70">
                  <p>
                    Ref Gateway:{' '}
                    <strong className="font-mono text-emerald-950">
                      {invoice.paymentMeta?.gatewayRef || `PG-REF-${invoice.invoiceNumber}`}
                    </strong>
                  </p>
                  <p>
                    Waktu Bayar:{' '}
                    <strong>
                      {invoice.paidAt
                        ? new Date(invoice.paidAt).toLocaleString('id-ID')
                        : 'Terverifikasi'}
                    </strong>
                  </p>
                  <p className="text-emerald-700 text-[10px] mt-1">
                    Pembayaran aman dilindungi Garansi Perlindungan Pembeli sampai barang diterima
                    dan masa inspeksi fisik 48 jam selesai.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Notes Section */}
            {invoice.notes && (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block text-[11px]">
                  Catatan Transaksi:
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column: Financial Calculation Box */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Barang / Jasa</span>
              <span className="font-mono font-bold text-slate-900">
                {formatIDR(invoice.amount)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Ongkos Kirim & Asuransi</span>
              <span className="font-mono font-medium text-slate-900">
                {invoice.shippingFee > 0 ? formatIDR(invoice.shippingFee) : 'Rp 0 (COD)'}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Biaya Layanan & Perlindungan</span>
              <span className="font-mono font-medium text-slate-900">
                {formatIDR(invoice.serviceFee)}
              </span>
            </div>

            {Boolean(invoice.discountAmount && invoice.discountAmount > 0) && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Diskon / Potongan Promo</span>
                <span className="font-mono">-{formatIDR(invoice.discountAmount || 0)}</span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm">
              <span className="font-black text-slate-900">Total Pembayaran</span>
              <span className="font-black font-mono text-base sm:text-lg text-brand-700">
                {formatIDR(invoice.totalAmount)}
              </span>
            </div>

            {/* Seller & Admin Specific Settlement View */}
            {(roleMode === 'SELLER' || roleMode === 'ADMIN') && (
              <div className="mt-3 pt-2.5 border-t border-dashed border-slate-300 text-[11px] text-slate-500 flex justify-between items-center bg-white/70 p-2.5 rounded-xl">
                <span>Estimasi Pencairan Bersih Penjual:</span>
                <span className="font-black font-mono text-emerald-700 text-xs">
                  {formatIDR(invoice.netSellerAmount || invoice.amount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Guarantee & Terms */}
        <div className="relative z-10 pt-6 border-t border-slate-200 text-center space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <span>Garansi Fisik 48 Jam</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <span>Payment Gateway Terenkripsi 256-Bit</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Building className="h-4 w-4 text-slate-600" />
              <span>Pusat Resolusi Komplain</span>
            </span>
          </div>

          <p className="text-[10px] text-slate-400 max-w-xl mx-auto leading-relaxed">
            {invoice.terms ||
              'Faktur ini merupakan dokumen elektronik resmi yang sah dan mengikat. Harap simpan nomor invoice ini untuk keperluan klaim garansi atau penyelesaian kendala pesanan.'}
          </p>

          <div className="text-[9px] text-slate-300 font-mono pt-1">
            Dicetak otomatis oleh Sistem Peygo Cloud • ID: {invoice.id} • {new Date().toISOString()}
          </div>
        </div>
      </div>
    </div>
  );
}
