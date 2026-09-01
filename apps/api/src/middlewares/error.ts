import type { ErrorHandler } from 'hono';
import type { AppEnv } from '../types/env';

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  console.error('Unhandled API Error:', err);

  const origin = c.req.header('Origin') || '*';
  c.header('Access-Control-Allow-Origin', origin);
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  c.header('X-Content-Type-Options', 'nosniff');

  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.'
      }
    },
    500
  );
};
