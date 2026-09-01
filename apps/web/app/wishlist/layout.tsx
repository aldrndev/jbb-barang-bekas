import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wishlist Barang Bekas Pilihan Anda',
  description:
    'Simpan dan pantau barang bekas incaran Anda. Dapatkan update harga dan penawaran terbaik bergaransi rekening bersama di Peygo.',
  openGraph: {
    title: 'Wishlist Barang Bekas Pilihan Anda | Peygo',
    description:
      'Koleksi barang bekas favorit Anda tersimpan aman dengan pantauan status unit aktif di Peygo.',
    url: 'https://peygo.id/wishlist'
  }
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
