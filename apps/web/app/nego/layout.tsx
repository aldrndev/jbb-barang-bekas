import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pusat Tawar & Nego Harga Resmi',
  description:
    'Ajukan penawaran harga resmi langsung ke penjual dengan garansi kunci harga 24 jam dan jaminan transaksi aman di Belanjanya.',
  openGraph: {
    title: 'Pusat Tawar & Nego Harga Resmi | Belanjanya',
    description:
      'Tawar menawar barang bekas lebih transparan dan terlindungi. Kunci harga deal terbaik Anda dalam 24 jam di Belanjanya.',
    url: 'https://belanjanya.id/nego'
  },
  twitter: {
    title: 'Pusat Tawar & Nego Harga Resmi | Belanjanya',
    description:
      'Tawar menawar barang bekas lebih transparan dan terlindungi. Kunci harga deal terbaik Anda dalam 24 jam di Belanjanya.'
  }
};

export default function NegoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
