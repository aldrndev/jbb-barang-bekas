import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panduan Rekber Escrow & Transaksi Aman',
  description: 'Cara kerja Rekening Bersama (Rekber) Peygo. Beli barang bekas tanpa takut tertipu dengan garansi proteksi dana 100% dan masa inspeksi 48 jam.',
  openGraph: {
    title: 'Panduan Rekber Escrow & Transaksi Aman | Peygo',
    description: 'Cara kerja Rekening Bersama (Rekber) Peygo. Beli barang bekas tanpa takut tertipu dengan garansi proteksi dana 100% dan masa inspeksi 48 jam.'
  }
};

export default function PanduanRekberLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
