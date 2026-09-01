import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pusat Bantuan & Customer Care',
  description: 'Temukan jawaban lengkap dan panduan bantuan transaksi jual beli barang bekas di Peygo Rekber Indonesia.',
  openGraph: {
    title: 'Pusat Bantuan & Customer Care | Peygo',
    description: 'Temukan jawaban lengkap dan panduan bantuan transaksi jual beli barang bekas di Peygo Rekber Indonesia.'
  }
};

export default function PusatBantuanLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
