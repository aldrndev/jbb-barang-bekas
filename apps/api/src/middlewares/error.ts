import type { ErrorHandler } from 'hono';
import type { AppEnv } from '../types/env';

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  console.error('Unhandled API Error:', err);
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: err.message || 'Terjadi kesalahan pada server',
        details: c.env?.APP_ENV === 'development' ? err.stack : undefined
      }
    },
    500
  );
};
