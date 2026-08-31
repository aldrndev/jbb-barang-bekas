import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../types/env';
import { verifyJwt } from '../utils/auth';
import { seedUsers } from '@jbb/database';

export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Akses ditolak: Silakan login terlebih dahulu'
        }
      },
      401
    );
  }

  const token = authHeader.substring(7);
  const secret = c.env.JWT_SECRET || 'jbb_marketplace_super_secret_jwt_key_2026';
  const payload = await verifyJwt(token, secret);

  if (!payload) {
    return c.json(
      {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Sesi login telah kadaluarsa atau tidak valid'
        }
      },
      401
    );
  }

  // Get user from seed / memory or DB
  const user = seedUsers.find((u) => u.id === payload.sub) || {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role as any,
    isKycVerified: false,
    isPhoneVerified: false,
    trustScore: 80,
    totalTransactions: 0,
    ratingAverage: 5.0,
    ratingCount: 0,
    createdAt: new Date().toISOString()
  };

  c.set('user', user);
  await next();
};

export const optionalAuthMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const secret = c.env.JWT_SECRET || 'jbb_marketplace_super_secret_jwt_key_2026';
    const payload = await verifyJwt(token, secret);
    if (payload) {
      const user = seedUsers.find((u) => u.id === payload.sub) || {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        role: payload.role as any,
        isKycVerified: false,
        isPhoneVerified: false,
        trustScore: 80,
        totalTransactions: 0,
        ratingAverage: 5.0,
        ratingCount: 0,
        createdAt: new Date().toISOString()
      };
      c.set('user', user);
    }
  }
  await next();
};
