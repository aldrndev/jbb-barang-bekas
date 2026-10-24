import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katalog & Cari Barang Bekas Berkualitas',
  description:
    'Cari dan temukan ribuan produk barang bekas berkualitas mulai dari HP, smartphone, laptop, kamera, otomotif hingga fashion vintage bergaransi perlindungan pembeli di Belanjanya.',
  openGraph: {
    title: 'Katalog & Cari Barang Bekas Berkualitas | Belanjanya',
    description:
      'Temukan barang bekas idaman Anda dengan filter harga, lokasi COD terdekat, dan garansi perlindungan transaksi 100% di Belanjanya.',
    url: 'https://belanjanya.id/cari'
  },
  twitter: {
    title: 'Katalog & Cari Barang Bekas Berkualitas | Belanjanya',
    description:
      'Temukan barang bekas idaman Anda dengan filter harga, lokasi COD terdekat, dan garansi perlindungan transaksi 100% di Belanjanya.'
  }
};

export default function CariLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
