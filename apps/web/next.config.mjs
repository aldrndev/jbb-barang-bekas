import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

if (process.env.NODE_ENV !== 'production') {
  initOpenNextCloudflareForDev();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@jbb/types', '@jbb/validators'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'r2.jbb.market'
      }
    ]
  }
};

export default nextConfig;
