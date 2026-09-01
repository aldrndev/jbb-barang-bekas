import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../types/env';
import { verifyJwt } from '../utils/auth';
import { seedUsers } from '@jbb/database';
import { memoryStore } from '../services/store';

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
      name: 'Administrator Rekber Peygo',
      email: 'admin.rekber@peygo.id',
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
    const buyer = memoryStore.findUserById('usr-buyer-1') || memoryStore.users[0] || seedUsers[0];
    c.set('user', buyer);
    await next();
    return;
  }

  if (token === 'seller_token') {
    const seller = memoryStore.findUserById('usr-seller-1') || memoryStore.users[1] || seedUsers[1];
    c.set('user', seller);
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

  // Get user from memory store with live KYC verification status
  const user = memoryStore.findUserById(payload.sub) || {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    phone: (payload as any).phone || '081234567890',
    avatarUrl: (payload as any).avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: payload.role as any,
    isKycVerified: memoryStore.approvedUserIds.has(payload.sub),
    isPhoneVerified: true,
    trustScore: memoryStore.approvedUserIds.has(payload.sub) ? 98 : 80,
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
      const user = memoryStore.findUserById(payload.sub) || {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        phone: (payload as any).phone || '081234567890',
        avatarUrl: (payload as any).avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        role: payload.role as any,
        isKycVerified: memoryStore.approvedUserIds.has(payload.sub),
        isPhoneVerified: true,
        trustScore: memoryStore.approvedUserIds.has(payload.sub) ? 98 : 80,
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
