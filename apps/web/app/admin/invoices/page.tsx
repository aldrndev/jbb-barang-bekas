'use client';

import { InvoicePrintableView } from '@/components/invoice/invoice-printable-view';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { api } from '@/lib/api-client';
import { formatIDR, formatTimeAgo } from '@/lib/utils';
import type { CreateCustomInvoiceInput, Invoice, InvoiceStatus, InvoiceType } from '@jbb/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  PlusCircle,
  Receipt,
  RefreshCw,
  Search,
  Trash2,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function AdminInvoicesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'all' | 'PAID' | 'UNPAID' | 'CANCELLED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Create Invoice Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<
    CreateCustomInvoiceInput & {
      items: Array<CreateCustomInvoiceInput['items'][number] & { keyId?: string }>;
    }
  >({
    type: 'CUSTOM_ADMIN',
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    buyerAddress: '',
    buyerCity: 'Jakarta',
    sellerName: 'Peygo Rekber Escrow Official',
    sellerPhone: '081122334455',
    sellerCity: 'Jakarta Pusat',
    items: [
      {
        keyId: 'item-1',
        title: '',
        description: '',
        quantity: 1,
        price: 0,
        condition: 'NEW'
      }
    ],
    shippingFee: 0,
    serviceFee: 15000,
    discountAmount: 0,
    paymentChannel: 'BCA_VA',
    notes: 'Faktur resmi diterbitkan oleh Tim Administrator Rekber Peygo.',
    status: 'UNPAID'
  });

  const {
    data: invoicesData,
    isLoading,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: () => api.getAdminInvoices(),
    enabled: user?.role === 'ADMIN'
  });

  const invoices = useMemo(() => invoicesData?.data || [], [invoicesData]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchTab = activeTab === 'all' || inv.status === activeTab;
      const matchType = selectedTypeFilter === 'all' || inv.type === selectedTypeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.buyerName.toLowerCase().includes(q) ||
        inv.sellerName.toLowerCase().includes(q) ||
        Boolean(inv.orderNumber?.toLowerCase().includes(q));

      return matchTab && matchType && matchSearch;
    });
  }, [invoices, activeTab, selectedTypeFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const totalVolume = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const paidInvoices = invoices.filter((inv) => inv.status === 'PAID');
    const paidVolume = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const unpaidInvoices = invoices.filter((inv) => inv.status === 'UNPAID');

    return {
      totalCount: invoices.length,
      totalVolume,
      paidCount: paidInvoices.length,
      paidVolume,
      unpaidCount: unpaidInvoices.length
    };
  }, [invoices]);

  const handleAddItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          keyId: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: '',
          description: '',
          quantity: 1,
          price: 0,
          condition: 'NEW'
        }
      ]
    }));
  };

  const handleRemoveItemRow = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return { ...prev, items: updated };
    });
  };

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.buyerName.trim() ||
      !formData.buyerPhone.trim() ||
      !formData.buyerAddress.trim()
    ) {
      toast.error('Gagal', 'Lengkapi data identitas pembeli terlebih dahulu.');
      return;
    }

    if (formData.items.some((it) => !it.title.trim() || it.price <= 0)) {
      toast.error('Gagal', 'Pastikan semua item memiliki judul dan nominal harga lebih dari 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createAdminInvoice(formData);
      if (res.success && res.data) {
        toast.success('Sukses', `Faktur #${res.data.invoiceNumber} berhasil dibuat!`);
        setIsCreateModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
        setPreviewInvoice(res.data);
      } else {
        toast.error('Gagal', res.error?.message || 'Gagal membuat faktur tagihan.');
      }
    } catch {
      toast.error('Gagal', 'Terjadi kesalahan saat memproses data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (invoiceId: string, status: InvoiceStatus) => {
    try {
      const res = await api.updateAdminInvoiceStatus(invoiceId, status);
      if (res.success) {
        toast.success('Status Diperbarui', `Faktur telah diubah menjadi ${status}`);
        queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
        if (previewInvoice && previewInvoice.id === invoiceId) {
          setPreviewInvoice({ ...previewInvoice, status });
        }
      }
    } catch {
      toast.error('Gagal', 'Gagal memperbarui status faktur.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER & EXECUTIVE METRICS */}
      <div className="rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-black text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5" />
                <span>Financial & Escrow Billing</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Manajemen Faktur & Tagihan
            </h1>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Pantau seluruh invoice transaksi escrow, cetak faktur resmi A4, dan buat tagihan
              kustom manual dengan integrasi Payment Gateway.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 text-xs font-bold border border-white/15 backdrop-blur-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 text-xs font-black shadow-lg shadow-emerald-500/25 transition-all cursor-pointer hover:scale-102"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ Buat Invoice Manual</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STAT METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Faktur Diterbitkan
          </span>
          <div className="text-2xl font-black text-slate-900">{metrics.totalCount}</div>
          <span className="text-[11px] text-slate-500">Seluruh transaksi sistem</span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            Volume Terbayar (Lunas)
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {formatIDR(metrics.paidVolume)}
          </div>
          <span className="text-[11px] text-slate-500">{metrics.paidCount} Faktur Lunas</span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
            Menunggu Pembayaran
          </span>
          <div className="text-2xl font-black text-amber-700">{metrics.unpaidCount}</div>
          <span className="text-[11px] text-slate-500">Virtual Account / QRIS Aktif</span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
            Total Nilai Akumulasi
          </span>
          <div className="text-2xl font-black text-brand-700">{formatIDR(metrics.totalVolume)}</div>
          <span className="text-[11px] text-slate-500">Gross Invoicing Value</span>
        </div>
      </div>

      {/* 3. FILTER & SEARCH CONTROLS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs Status */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
            {(
              [
                { id: 'all', label: 'Semua Status' },
                { id: 'PAID', label: 'Lunas (Paid)' },
                { id: 'UNPAID', label: 'Belum Bayar' },
                { id: 'CANCELLED', label: 'Dibatalkan' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No. Faktur / Pembeli / Penjual..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Tipe Tagihan</option>
              <option value="ESCROW_ORDER">Transaksi Marketplace</option>
              <option value="CUSTOM_ADMIN">Tagihan Manual Admin</option>
              <option value="MEDIATION_FEE">Jasa Mediasi Sengketa</option>
              <option value="VIP_ESCROW">Layanan VIP Rekber</option>
            </select>
          </div>
        </div>

        {/* Invoices Data Table */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-4">No. Faktur</th>
                  <th className="p-3.5">Tipe & Tanggal</th>
                  <th className="p-3.5">Pihak Transaksi (Pembeli / Penjual)</th>
                  <th className="p-3.5">Nominal Total</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 pr-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Memuat daftar faktur...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Tidak ada faktur yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isPaid = inv.status === 'PAID';
                    const isUnpaid = inv.status === 'UNPAID';

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 pl-4">
                          <strong className="font-mono text-slate-900 block text-xs">
                            {inv.invoiceNumber}
                          </strong>
                          {inv.orderNumber && (
                            <span className="text-[10px] text-brand-700 font-mono">
                              Ref: {inv.orderNumber}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 mb-1">
                            {inv.type === 'ESCROW_ORDER'
                              ? 'Transaksi Marketplace'
                              : inv.type === 'MEDIATION_FEE'
                                ? 'Jasa Mediasi Sengketa'
                                : 'Tagihan Manual Admin'}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {formatTimeAgo(inv.issuedAt)}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="text-slate-400 text-[10px]">B:</span>
                            <span>{inv.buyerName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="text-slate-400 text-[10px]">S:</span>
                            <span>{inv.sellerName}</span>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono">
                          <span className="font-black text-slate-900 text-xs block">
                            {formatIDR(inv.totalAmount)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Fee: {formatIDR(inv.serviceFee)}
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>LUNAS</span>
                            </span>
                          ) : isUnpaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200">
                              <Clock className="h-3 w-3" />
                              <span>BELUM BAYAR</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-200">
                              <AlertCircle className="h-3 w-3" />
                              <span>BATAL</span>
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 pr-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {isUnpaid && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(inv.id, 'PAID')}
                                className="rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 text-[10px] font-bold transition-colors cursor-pointer"
                                title="Tandai Sudah Lunas"
                              >
                                Set Lunas
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setPreviewInvoice(inv)}
                              className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Lihat & Cetak
                            </button>

                            <Link
                              href={`/invoice/${inv.id}?role=ADMIN`}
                              target="_blank"
                              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Buka Halaman Standalone"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. MODAL: BUAT INVOICE MANUAL */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsCreateModalOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsCreateModalOpen(false);
          }}
        >
          <div
            role="document"
            className="relative max-w-2xl w-full rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Buat Faktur Tagihan Baru (Custom Invoice)
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Diterbitkan resmi oleh Sistem Escrow Peygo Rekber
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs">
              {/* Jenis Tagihan & Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="custom-inv-type" className="font-bold text-slate-700 block mb-1">
                    Jenis Layanan / Faktur:
                  </label>
                  <select
                    id="custom-inv-type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as InvoiceType })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 bg-slate-50 font-bold text-slate-800 focus:bg-white"
                  >
                    <option value="CUSTOM_ADMIN">Tagihan Transaksi Manual</option>
                    <option value="MEDIATION_FEE">Biaya Mediasi & Penanganan Sengketa</option>
                    <option value="VIP_ESCROW">Layanan Escrow VIP Prioritas</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="custom-inv-channel"
                    className="font-bold text-slate-700 block mb-1"
                  >
                    Metode / Saluran Pembayaran:
                  </label>
                  <select
                    id="custom-inv-channel"
                    value={formData.paymentChannel}
                    onChange={(e) => setFormData({ ...formData, paymentChannel: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 bg-slate-50 font-bold text-slate-800 focus:bg-white"
                  >
                    <option value="BCA_VA">BCA Virtual Account (Otomatis)</option>
                    <option value="MANDIRI_VA">Mandiri Virtual Account</option>
                    <option value="BRI_VA">BRI Virtual Account</option>
                    <option value="BNI_VA">BNI Virtual Account</option>
                    <option value="QRIS">QRIS Dinamis</option>
                    <option value="COD_CASH">COD Serah Terima Tunai</option>
                  </select>
                </div>
              </div>

              {/* Data Pembeli */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] font-black text-slate-900 block border-b border-slate-200 pb-1">
                  1. Informasi Pembeli (Ditagihkan Kepada)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="custom-inv-buyer-name"
                      className="text-[11px] font-bold text-slate-600 block mb-1"
                    >
                      Nama Lengkap Pembeli *
                    </label>
                    <input
                      id="custom-inv-buyer-name"
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={formData.buyerName}
                      onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="custom-inv-buyer-phone"
                      className="text-[11px] font-bold text-slate-600 block mb-1"
                    >
                      Nomor WhatsApp / HP *
                    </label>
                    <input
                      id="custom-inv-buyer-phone"
                      type="text"
                      required
                      placeholder="08123456789"
                      value={formData.buyerPhone}
                      onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="custom-inv-buyer-address"
                    className="text-[11px] font-bold text-slate-600 block mb-1"
                  >
                    Alamat Lengkap Pembeli *
                  </label>
                  <input
                    id="custom-inv-buyer-address"
                    type="text"
                    required
                    placeholder="Jl. Thamrin No. 10, RT 01/RW 02"
                    value={formData.buyerAddress}
                    onChange={(e) => setFormData({ ...formData, buyerAddress: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                  />
                </div>
              </div>

              {/* Data Penjual */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] font-black text-slate-900 block border-b border-slate-200 pb-1">
                  2. Informasi Penjual / Penyedia Barang
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="custom-inv-seller-name"
                      className="text-[11px] font-bold text-slate-600 block mb-1"
                    >
                      Nama Penjual / Toko *
                    </label>
                    <input
                      id="custom-inv-seller-name"
                      type="text"
                      required
                      value={formData.sellerName}
                      onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="custom-inv-seller-city"
                      className="text-[11px] font-bold text-slate-600 block mb-1"
                    >
                      Kota Penjual
                    </label>
                    <input
                      id="custom-inv-seller-city"
                      type="text"
                      value={formData.sellerCity || ''}
                      onChange={(e) => setFormData({ ...formData, sellerCity: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Item Rows */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-[11px] font-black text-slate-900">
                    3. Rincian Barang / Jasa Tagihan
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah Baris</span>
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {formData.items.map((item, idx) => (
                    <div
                      key={item.keyId || `row-${idx}`}
                      className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-xl border border-slate-200"
                    >
                      <div className="col-span-6">
                        <input
                          type="text"
                          required
                          aria-label="Nama barang atau jasa tagihan"
                          placeholder="Nama Barang / Layanan"
                          value={item.title}
                          onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={1}
                          required
                          aria-label="Jumlah kuantitas item"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, 'quantity', Number(e.target.value))
                          }
                          className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          min={1000}
                          step={1000}
                          required
                          aria-label="Harga satuan barang atau jasa"
                          placeholder="Harga (Rp)"
                          value={item.price || ''}
                          onChange={(e) => handleItemChange(idx, 'price', Number(e.target.value))}
                          className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            aria-label="Hapus baris item ini"
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Fees & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label
                    htmlFor="custom-inv-shipping-fee"
                    className="text-[11px] font-bold text-slate-600 block mb-1"
                  >
                    Ongkos Kirim (Rp)
                  </label>
                  <input
                    id="custom-inv-shipping-fee"
                    type="number"
                    min={0}
                    value={formData.shippingFee}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingFee: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label
                    htmlFor="custom-inv-service-fee"
                    className="text-[11px] font-bold text-slate-600 block mb-1"
                  >
                    Biaya Layanan Rekber (Rp)
                  </label>
                  <input
                    id="custom-inv-service-fee"
                    type="number"
                    min={0}
                    value={formData.serviceFee}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceFee: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label
                    htmlFor="custom-inv-initial-status"
                    className="text-[11px] font-bold text-slate-600 block mb-1"
                  >
                    Status Awal Faktur
                  </label>
                  <select
                    id="custom-inv-initial-status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as InvoiceStatus })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold"
                  >
                    <option value="UNPAID">Belum Dibayar (Unpaid)</option>
                    <option value="PAID">Lunas (Paid / Settled)</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-full bg-slate-100 hover:bg-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Membuat Faktur...' : 'Terbitkan Faktur Resmi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: PREVIEW & PRINT INVOICE */}
      {previewInvoice && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto"
          onClick={() => setPreviewInvoice(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setPreviewInvoice(null);
          }}
        >
          <div
            role="document"
            className="relative max-w-4xl w-full rounded-3xl bg-slate-50 p-4 sm:p-6 shadow-2xl max-h-[95vh] overflow-y-auto my-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <span className="text-xs font-black text-slate-800 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-600" />
                <span>Pratinjau Faktur Resmi #{previewInvoice.invoiceNumber}</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewInvoice(null)}
                className="rounded-full bg-white p-1.5 text-slate-500 hover:bg-slate-200 cursor-pointer shadow-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <InvoicePrintableView
              invoice={previewInvoice}
              roleMode="ADMIN"
              showBackToDashboard={false}
              onStatusUpdated={(updated) => {
                setPreviewInvoice(updated);
                queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
