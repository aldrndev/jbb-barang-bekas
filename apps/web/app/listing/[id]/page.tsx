import type { Metadata } from 'next';
import { ListingDetailView } from '../../../components/marketplace/listing-detail-view';
import { api } from '../../../lib/api-client';
import { formatIDR } from '../../../lib/utils';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://peygo.id';

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await api.getListingDetail(id);
    if (res.success && res.data) {
      const listing = res.data;
      const formattedPrice = formatIDR(listing.price);
      const title = `${listing.title} - ${formattedPrice} (${listing.city})`;
      const description = `Beli ${listing.title} kondisi ${listing.condition}. Dijual seharga ${formattedPrice} di ${listing.city}. Transaksi aman dengan garansi rekening bersama 100% dan inspeksi 48 jam di Peygo.`;
      const firstImg =
        Array.isArray(listing.images) && listing.images.length > 0 ? listing.images[0] : null;
      const primaryImageUrl =
        typeof firstImg === 'string' ? firstImg : firstImg?.url || `${siteUrl}/og-image.jpg`;

      return {
        title,
        description,
        alternates: {
          canonical: `/listing/${listing.slug || listing.id}`
        },
        openGraph: {
          type: 'article',
          locale: 'id_ID',
          url: `${siteUrl}/listing/${listing.slug || listing.id}`,
          siteName: 'Peygo',
          title: `${title} | Peygo`,
          description,
          images: [
            {
              url: primaryImageUrl,
              width: 800,
              height: 600,
              alt: listing.title
            }
          ]
        },
        twitter: {
          card: 'summary_large_image',
          title: `${title} | Peygo`,
          description,
          images: [primaryImageUrl]
        }
      };
    }
  } catch {
    // Fallback if fetch fails during pre-render
  }

  return {
    title: 'Detail Barang Bekas',
    description:
      'Beli barang bekas berkualitas dengan garansi rekening bersama 100% dan inspeksi fisik 48 jam di Peygo.'
  };
}

export default async function ListingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ListingDetailView idOrSlug={id} />;
}
