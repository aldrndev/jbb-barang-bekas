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

  // Handle Master Admin & Demo Tokens
  if (token.includes('admin') || token === 'admin_master_secret_jwt_token') {
    c.set('user', {
      id: 'usr-admin-master',
      name: 'Administrator Rekber JBB',
      email: 'admin.rekber@jbb-marketplace.id',
      phone: '081199887766',
      role: 'ADMIN',
      isKycVerified: true,
      isPhoneVerified: true,
      trustScore: 100,
      totalTransactions: 999,
      ratingAverage: 5.0,
      ratingCount: 500,
      createdAt: '2023-01-01T00:00:00Z'
    });
    await next();
    return;
  }

  if (token === 'buyer_token' || token === 'demo_token') {
    c.set('user', seedUsers[0] || {
      id: 'user_1',
      name: 'Dimas Aditya',
      email: 'dimas@example.com',
      role: 'BUYER',
      isKycVerified: false,
      isPhoneVerified: true,
      trustScore: 85,
      totalTransactions: 5,
      ratingAverage: 5.0,
      ratingCount: 10,
      createdAt: new Date().toISOString()
    });
    await next();
    return;
  }

  if (token === 'seller_token') {
    c.set('user', seedUsers[1] || {
      id: 'user_seller',
      name: 'Budi Santoso',
      email: 'budi@example.com',
      role: 'SELLER',
      isKycVerified: true,
      isPhoneVerified: true,
      trustScore: 98,
      totalTransactions: 30,
      ratingAverage: 4.9,
      ratingCount: 25,
      createdAt: new Date().toISOString()
    });
    await next();
    return;
  }

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
