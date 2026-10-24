import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://belanjanya.id';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/orders', '/profile', '/checkout', '/my-listings']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
