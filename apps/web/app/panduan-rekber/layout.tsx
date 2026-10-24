import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panduan Belanja Aman & Garansi Perlindungan Pembeli',
  description:
    'Cara kerja transaksi aman di Belanjanya. Beli barang bekas tanpa cemas dengan garansi uang kembali 100% dan masa inspeksi fisik 48 jam.',
  openGraph: {
    title: 'Panduan Belanja Aman & Garansi Perlindungan Pembeli | Belanjanya',
    description:
      'Cara kerja transaksi aman di Belanjanya. Beli barang bekas tanpa cemas dengan garansi uang kembali 100% dan masa inspeksi fisik 48 jam.'
  }
};

export default function PanduanRekberLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
