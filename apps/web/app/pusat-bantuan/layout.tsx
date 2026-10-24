import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pusat Bantuan & Customer Care',
  description:
    'Temukan jawaban lengkap dan panduan bantuan transaksi jual beli barang bekas di Belanjanya.',
  openGraph: {
    title: 'Pusat Bantuan & Customer Care | Belanjanya',
    description:
      'Temukan jawaban lengkap dan panduan bantuan transaksi jual beli barang bekas di Belanjanya.'
  }
};

export default function PusatBantuanLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
