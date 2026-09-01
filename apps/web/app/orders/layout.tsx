import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pesanan Saya & Status Rekber',
  description:
    'Pantau alur transaksi, nomor resi pengiriman, masa inspeksi fisik 48 jam, dan riwayat pesanan rekening bersama Anda di Bekasin.',
  robots: {
    index: false,
    follow: false
  }
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
