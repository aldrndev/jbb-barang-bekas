import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { errorHandler } from './middlewares/error';
import { adminRoutes } from './routes/admin';
import { authRoutes } from './routes/auth';
import { categoryRoutes } from './routes/categories';
import { invoiceRoutes } from './routes/invoices';
import { listingRoutes } from './routes/listings';
import { offerRoutes } from './routes/offers';
import { orderRoutes } from './routes/orders';
import { reviewRoutes } from './routes/reviews';
import { uploadRoutes } from './routes/uploads';
import { webhookRoutes } from './routes/webhooks';
import { wishlistRoutes } from './routes/wishlists';
import type { AppEnv } from './types/env';

const app = new Hono<AppEnv>();

// 1. CORS Configuration (MUST BE VERY FIRST)
app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return '*';
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.endsWith('.workers.dev') ||
        origin.endsWith('.pages.dev') ||
        origin.endsWith('.peygo.id') ||
        origin === 'https://peygo.id' ||
        origin === 'https://www.peygo.id'
      ) {
        return origin;
      }
      return '*';
    },
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    maxAge: 86400
  })
);

// 2. Logging & Pretty JSON
app.use('*', logger());
app.use('*', prettyJSON());

// 3. Security Headers Middleware
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
});

// 4. Global Error Handler
app.onError(errorHandler);

// 5. Healthcheck
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Peygo Rekber Marketplace API (Cloudflare Worker)',
    version: '1.0.0'
  });
});

// 6. Mounted Routes
const routes = app
  .route('/api/auth', authRoutes)
  .route('/api/categories', categoryRoutes)
  .route('/api/listings', listingRoutes)
  .route('/api/offers', offerRoutes)
  .route('/api/orders', orderRoutes)
  .route('/api/invoices', invoiceRoutes)
  .route('/api/webhooks', webhookRoutes)
  .route('/api/reviews', reviewRoutes)
  .route('/api/uploads', uploadRoutes)
  .route('/api/admin', adminRoutes)
  .route('/api/wishlist', wishlistRoutes);

export default app;
export type AppType = typeof routes;
