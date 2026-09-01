import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout & Pembayaran Rekber Aman',
  description:
    'Selesaikan pembayaran pesanan barang bekas dengan perlindungan escrow rekening bersama 100% di Bekasin.',
  robots: {
    index: false,
    follow: false
  }
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
