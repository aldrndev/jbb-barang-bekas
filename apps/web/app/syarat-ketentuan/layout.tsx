import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan Layanan',
  description:
    'Ketentuan dan aturan penggunaan marketplace jual beli barang bekas terpercaya Belanjanya.',
  openGraph: {
    title: 'Syarat & Ketentuan Layanan | Belanjanya',
    description:
      'Ketentuan dan aturan penggunaan marketplace jual beli barang bekas terpercaya Belanjanya.'
  }
};

export default function SyaratKetentuanLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
