import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pasang Iklan & Jual Barang Bekas Cepat Laku',
  description:
    'Jual HP, smartphone, laptop, kamera, gadget, dan barang bekas Anda dengan aman dan terpercaya tanpa takut penipuan. Dana otomatis cair setelah 48 jam di Belanjanya.',
  openGraph: {
    title: 'Pasang Iklan & Jual Barang Bekas Cepat Laku | Belanjanya',
    description:
      'Pasang iklan barang bekas Anda secara gratis dan dapatkan pembeli terverifikasi dengan jaminan pembayaran rekening bersama di Belanjanya.',
    url: 'https://belanjanya.id/jual'
  },
  twitter: {
    title: 'Pasang Iklan & Jual Barang Bekas Cepat Laku | Belanjanya',
    description:
      'Pasang iklan barang bekas Anda secara gratis dan dapatkan pembeli terverifikasi dengan jaminan pembayaran rekening bersama di Belanjanya.'
  }
};

export default function JualLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
