import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pasang Iklan & Jual Barang Bekas Cepat Laku',
  description:
    'Jual HP, smartphone, laptop, kamera, gadget, dan barang bekas Anda dengan aman dan terpercaya tanpa takut penipuan. Dana otomatis cair setelah 48 jam di Peygo.',
  openGraph: {
    title: 'Pasang Iklan & Jual Barang Bekas Cepat Laku | Peygo',
    description:
      'Pasang iklan barang bekas Anda secara gratis dan dapatkan pembeli terverifikasi dengan jaminan pembayaran rekening bersama di Peygo.',
    url: 'https://peygo.id/jual'
  },
  twitter: {
    title: 'Pasang Iklan & Jual Barang Bekas Cepat Laku | Peygo',
    description:
      'Pasang iklan barang bekas Anda secara gratis dan dapatkan pembeli terverifikasi dengan jaminan pembayaran rekening bersama di Peygo.'
  }
};

export default function JualLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
