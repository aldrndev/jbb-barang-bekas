import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan Layanan',
  description:
    'Ketentuan dan aturan penggunaan marketplace jual beli barang bekas terpercaya Peygo.',
  openGraph: {
    title: 'Syarat & Ketentuan Layanan | Peygo',
    description:
      'Ketentuan dan aturan penggunaan marketplace jual beli barang bekas terpercaya Peygo.'
  }
};

export default function SyaratKetentuanLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
