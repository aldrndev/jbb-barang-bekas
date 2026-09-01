import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katalog & Cari Barang Bekas Berkualitas',
  description:
    'Cari dan temukan ribuan produk barang bekas berkualitas mulai dari HP, smartphone, laptop, kamera, otomotif hingga fashion vintage bergaransi rekber di Bekasin.',
  openGraph: {
    title: 'Katalog & Cari Barang Bekas Berkualitas | Bekasin',
    description:
      'Temukan barang bekas idaman Anda dengan filter harga, lokasi COD terdekat, dan jaminan keamanan rekening bersama 100% di Bekasin.',
    url: 'https://peygo.id/cari'
  },
  twitter: {
    title: 'Katalog & Cari Barang Bekas Berkualitas | Bekasin',
    description:
      'Temukan barang bekas idaman Anda dengan filter harga, lokasi COD terdekat, dan jaminan keamanan rekening bersama 100% di Bekasin.'
  }
};

export default function CariLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
