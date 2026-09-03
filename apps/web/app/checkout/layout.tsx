import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout & Pembayaran Aman',
  description:
    'Selesaikan pembayaran pesanan barang bekas dengan garansi perlindungan pembeli 100% di Peygo.',
  robots: {
    index: false,
    follow: false
  }
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
