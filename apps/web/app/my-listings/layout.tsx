import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kelola Iklan & Penjualan Saya',
  description:
    'Pantau status tayang iklan, jumlah penawaran masuk (nego), dan statistik tayangan barang bekas Anda di Bekasin.',
  robots: {
    index: false,
    follow: false
  }
};

export default function MyListingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
