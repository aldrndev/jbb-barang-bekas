import type { UserProfile, UserRole } from '@jbb/types';
import { eq } from 'drizzle-orm';
import type { MiddlewareHandler } from 'hono';
import { getDb, schema } from '../db';
import { memoryStore } from '../services/store';
import type { AppEnv } from '../types/env';
import { verifyJwt } from '../utils/auth';

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

  const token = authHeader.substring(7).trim();
  if (!token) {
    return c.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token otentikasi tidak valid'
        }
      },
      401
    );
  }

  const secret = c.env.JWT_SECRET;
  if (!secret) {
    return c.json(
      {
        success: false,
        error: {
          code: 'SERVER_CONFIGURATION_ERROR',
          message: 'Konfigurasi secret token server belum terpasang'
        }
      },
      500
    );
  }

  const payload = await verifyJwt(token, secret);
  if (!payload || !payload.sub) {
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

  const db = getDb(c.env.DB);
  let user: UserProfile | undefined;

  if (db) {
    const [userDb] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, payload.sub))
      .limit(1);

    if (userDb) {
      user = {
        id: userDb.id,
        name: userDb.name,
        email: userDb.email,
        phone: userDb.phone,
        avatarUrl: userDb.avatarUrl,
        role: userDb.role,
        isKycVerified: Boolean(userDb.isKycVerified),
        isPhoneVerified: Boolean(userDb.isPhoneVerified),
        trustScore: userDb.trustScore,
        totalTransactions: userDb.totalTransactions,
        ratingAverage: userDb.ratingAverage,
        ratingCount: userDb.ratingCount,
        city: userDb.city,
        province: userDb.province,
        bio: userDb.bio,
        nik: userDb.nik,
        ktpImageUrl: userDb.ktpImageUrl,
        selfieImageUrl: userDb.selfieImageUrl,
        kycSubmittedAt: userDb.kycSubmittedAt,
        bankName: userDb.bankName,
        bankAccountNumber: userDb.bankAccountNumber,
        bankAccountHolder: userDb.bankAccountHolder,
        createdAt: userDb.createdAt
      };
    }
  } else {
    user = memoryStore.findUserById(payload.sub);
  }

  if (!user) {
    return c.json(
      {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Akun pengguna tidak ditemukan'
        }
      },
      401
    );
  }

  c.set('user', user);
  await next();
  return;
};

export const optionalAuthMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const secret = c.env.JWT_SECRET;
    if (token && secret) {
      const payload = await verifyJwt(token, secret);
      if (payload?.sub) {
        const db = getDb(c.env.DB);
        let user: UserProfile | undefined;

        if (db) {
          const [userDb] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, payload.sub))
            .limit(1);

          if (userDb) {
            user = {
              id: userDb.id,
              name: userDb.name,
              email: userDb.email,
              phone: userDb.phone,
              avatarUrl: userDb.avatarUrl,
              role: userDb.role,
              isKycVerified: Boolean(userDb.isKycVerified),
              isPhoneVerified: Boolean(userDb.isPhoneVerified),
              trustScore: userDb.trustScore,
              totalTransactions: userDb.totalTransactions,
              ratingAverage: userDb.ratingAverage,
              ratingCount: userDb.ratingCount,
              city: userDb.city,
              province: userDb.province,
              bio: userDb.bio,
              createdAt: userDb.createdAt
            };
          }
        } else {
          user = memoryStore.findUserById(payload.sub);
        }

        if (user) {
          c.set('user', user);
        }
      }
    }
  }
  await next();
  return;
};

export const requireRole = (allowedRoles: UserRole[]): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const user = c.get('user');
    if (!user) {
      return c.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Silakan login terlebih dahulu'
          }
        },
        401
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Akses ditolak: Anda tidak memiliki izin untuk melakukan tindakan ini'
          }
        },
        403
      );
    }

    await next();
    return;
  };
};
