import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { errorHandler } from './middlewares/error';
import { adminRoutes } from './routes/admin';
import { authRoutes } from './routes/auth';
import { categoryRoutes } from './routes/categories';
import { listingRoutes } from './routes/listings';
import { offerRoutes } from './routes/offers';
import { orderRoutes } from './routes/orders';
import { reviewRoutes } from './routes/reviews';
import { uploadRoutes } from './routes/uploads';
import { wishlistRoutes } from './routes/wishlists';
import type { AppEnv } from './types/env';

const app = new Hono<AppEnv>();

// Global Middlewares
app.use('*', logger());
app.use('*', prettyJSON());

// Security Headers Middleware
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
});

// CORS Configuration
app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return '*';
      const allowedOrigins = [
        'https://peygo.id',
        'https://www.peygo.id',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
      ];
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.peygo.id') ||
        origin.endsWith('.pages.dev') ||
        origin.endsWith('.workers.dev')
      ) {
        return origin;
      }
      return allowedOrigins[0];
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
);

// Global Error Handler
app.onError(errorHandler);

// Healthcheck & Welcome
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Peygo Rekber Marketplace API (Cloudflare Worker)',
    version: '1.0.0'
  });
});

// Mounted Routes
const routes = app
  .route('/api/auth', authRoutes)
  .route('/api/categories', categoryRoutes)
  .route('/api/listings', listingRoutes)
  .route('/api/offers', offerRoutes)
  .route('/api/orders', orderRoutes)
  .route('/api/reviews', reviewRoutes)
  .route('/api/uploads', uploadRoutes)
  .route('/api/admin', adminRoutes)
  .route('/api/wishlist', wishlistRoutes);

export default app;
export type AppType = typeof routes;
