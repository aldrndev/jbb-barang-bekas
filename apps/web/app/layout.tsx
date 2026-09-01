import type { Metadata } from 'next';
import '../styles/globals.css';
import { AuthProvider } from '../context/auth-context';
import { WishlistProvider } from '../context/wishlist-context';
import { QueryProvider } from '../providers/query-provider';
import { Navbar } from '../components/layout/navbar';
import { MobileBottomBar } from '../components/layout/mobile-bottom-bar';
import { Footer } from '../components/layout/footer';
import { AuthModal } from '../components/auth/auth-modal';
import { ScrollToTop } from '../components/common/scroll-to-top';

export const metadata: Metadata = {
  title: 'JBB - Marketplace Jual Beli Barang Bekas Terpercaya Indonesia',
  description:
    'Platform jual beli barang bekas modern & aman dengan garansi rekening bersama 100%, fitur tawar menawar (nego) harga resmi, dan verifikasi kondisi fisik transparan.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        <QueryProvider>
          <AuthProvider>
            <WishlistProvider>
              <ScrollToTop />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <MobileBottomBar />
              <AuthModal />
            </WishlistProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
