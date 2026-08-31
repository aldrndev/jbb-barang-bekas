import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import type { AppEnv } from './types/env';
import { errorHandler } from './middlewares/error';
import { authRoutes } from './routes/auth';
import { categoryRoutes } from './routes/categories';
import { listingRoutes } from './routes/listings';
import { offerRoutes } from './routes/offers';
import { orderRoutes } from './routes/orders';
import { reviewRoutes } from './routes/reviews';
import { uploadRoutes } from './routes/uploads';

const app = new Hono<AppEnv>();

// Global Middlewares
app.use('*', logger());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: '*',
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
    service: 'JBB Marketplace API (Cloudflare Worker)',
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
  .route('/api/uploads', uploadRoutes);

export default app;
export type AppType = typeof routes;
