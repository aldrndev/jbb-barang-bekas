import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, registerSchema, updateProfileSchema } from '@jbb/validators';
import type { AppEnv } from '../types/env';
import { memoryStore } from '../services/store';
import { signJwt } from '../utils/auth';
import { authMiddleware } from '../middlewares/auth';
import type { UserProfile } from '@jbb/types';

export const authRoutes = new Hono<AppEnv>()
  .post('/register', zValidator('json', registerSchema), async (c) => {
    const { name, email, phone } = c.req.valid('json');
    const existing = memoryStore.findUserByEmail(email);

    if (existing) {
      return c.json(
        {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email sudah terdaftar. Silakan login.'
          }
        },
        400
      );
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone: phone || null,
      role: 'BUYER',
      isKycVerified: false,
      isPhoneVerified: !!phone,
      trustScore: 85,
      totalTransactions: 0,
      ratingAverage: 5.0,
      ratingCount: 0,
      createdAt: new Date().toISOString()
    };

    memoryStore.addUser(newUser);

    const secret = c.env.JWT_SECRET || 'jbb_marketplace_super_secret_jwt_key_2026';
    const token = await signJwt(newUser, secret);

    return c.json({
      success: true,
      message: 'Registrasi berhasil!',
      data: {
        token,
        user: newUser
      }
    });
  })

  .post('/login', zValidator('json', loginSchema), async (c) => {
    const { email } = c.req.valid('json');
    const user = memoryStore.findUserByEmail(email);

    if (!user) {
      return c.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email atau password salah'
          }
        },
        401
      );
    }

    const secret = c.env.JWT_SECRET || 'jbb_marketplace_super_secret_jwt_key_2026';
    const token = await signJwt(user, secret);

    return c.json({
      success: true,
      message: 'Login berhasil!',
      data: {
        token,
        user
      }
    });
  })

  .get('/me', authMiddleware, async (c) => {
    const user = c.get('user');
    return c.json({
      success: true,
      data: user
    });
  })

  .put('/profile', authMiddleware, zValidator('json', updateProfileSchema), async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, 401);
    }

    const updates = c.req.valid('json');
    Object.assign(user, updates);

    return c.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: user
    });
  });
