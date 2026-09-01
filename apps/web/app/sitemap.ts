import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://peygo.id';
  const currentDate = new Date().toISOString();

  // Static Public Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 1.0
    },
    {
      url: `${baseUrl}/cari`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9
    },
    {
      url: `${baseUrl}/jual`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8
    },
    {
      url: `${baseUrl}/nego`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5
    }
  ];

  // Category Filter Routes
  const categories = [
    'hp-gadget',
    'komputer-laptop',
    'kamera-audio',
    'gaming-console',
    'elektronik-rumah',
    'otomotif-aksesoris',
    'fashion-vintage',
    'hobi-koleksi'
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${baseUrl}/cari?kategori=${slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.8
  }));

  return [...staticRoutes, ...categoryRoutes];
}
