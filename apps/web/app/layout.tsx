import type { Metadata } from 'next';
import '../styles/globals.css';
import { AuthModal } from '../components/auth/auth-modal';
import { ScrollToTop } from '../components/common/scroll-to-top';
import { Footer } from '../components/layout/footer';
import { MobileBottomBar } from '../components/layout/mobile-bottom-bar';
import { Navbar } from '../components/layout/navbar';
import { AuthProvider } from '../context/auth-context';
import { ToastProvider } from '../context/toast-context';
import { WishlistProvider } from '../context/wishlist-context';
import { QueryProvider } from '../providers/query-provider';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://peygo.id';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Peygo - Jual Beli Barang Bekas Terpercaya Indonesia',
    template: '%s | Peygo'
  },
  description:
    'Marketplace jual beli barang bekas modern & terpercaya dengan garansi perlindungan pembeli 100%, inspeksi fisik 48 jam, negosiasi harga resmi, dan verifikasi kondisi transparan.',
  keywords: [
    'jual beli barang bekas',
    'peygo',
    'barang bekas murah',
    'belanja barang bekas aman',
    'jual hp bekas',
    'laptop bekas terpercaya',
    'marketplace second hand indonesia',
    'cod aman',
    'garansi perlindungan pembeli'
  ],
  authors: [{ name: 'Peygo Indonesia', url: siteUrl }],
  creator: 'Peygo Indonesia',
  publisher: 'Peygo • Part of Digitesia Edge Digital',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  alternates: {
    canonical: '/'
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }]
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: siteUrl,
    siteName: 'Peygo',
    title: 'Peygo - Jual Beli Barang Bekas Terpercaya Indonesia',
    description:
      'Pasar jual beli barang bekas terpercaya dengan proteksi rekening bersama 100% dan garansi inspeksi fisik 48 jam.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Peygo - Jual Beli Barang Bekas Terpercaya'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peygo - Jual Beli Barang Bekas Terpercaya Indonesia',
    description:
      'Pasar jual beli barang bekas terpercaya dengan proteksi rekening bersama 100% dan garansi inspeksi fisik 48 jam.',
    creator: '@peygo_id',
    images: ['/og-image.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

// JSON-LD Structured Data Schema for Organization & WebSite
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Peygo',
      url: siteUrl,
      logo: `${siteUrl}/favicon.svg`,
      description:
        'Platform jual beli barang bekas aman dan terpercaya dengan rekening bersama di Indonesia.',
      sameAs: [
        'https://instagram.com/peygo.id',
        'https://twitter.com/peygo_id',
        'https://facebook.com/peygo.id'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Peygo',
      description: 'Jual Beli Barang Bekas Terpercaya Indonesia',
      publisher: {
        '@id': `${siteUrl}/#organization`
      },
      inLanguage: 'id-ID',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/cari?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    }
  ]
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <WishlistProvider>
                <ScrollToTop />
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                <MobileBottomBar />
                <AuthModal />
              </WishlistProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
