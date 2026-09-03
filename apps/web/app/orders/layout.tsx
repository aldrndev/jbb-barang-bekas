import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pesanan Saya & Riwayat Transaksi',
  description:
    'Pantau status transaksi, nomor resi pengiriman, garansi inspeksi fisik 48 jam, dan riwayat pesanan Anda di Peygo.',
  robots: {
    index: false,
    follow: false
  }
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
