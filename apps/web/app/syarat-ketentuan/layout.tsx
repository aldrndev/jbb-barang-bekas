import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan Layanan',
  description: 'Ketentuan dan aturan penggunaan platform jual beli barang bekas terpercaya Peygo Rekber Indonesia.',
  openGraph: {
    title: 'Syarat & Ketentuan Layanan | Peygo',
    description: 'Ketentuan dan aturan penggunaan platform jual beli barang bekas terpercaya Peygo Rekber Indonesia.'
  }
};

export default function SyaratKetentuanLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
