import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { loginSchema, registerSchema, updateProfileSchema, submitKycSchema, updateBankPayoutSchema } from '@jbb/validators';
import type { AppEnv } from '../types/env';
import { getDb, schema } from '../db';
import { memoryStore } from '../services/store';
import { signJwt } from '../utils/auth';
import { authMiddleware } from '../middlewares/auth';
import type { UserProfile } from '@jbb/types';

export const authRoutes = new Hono<AppEnv>()
  .post('/register', zValidator('json', registerSchema), async (c) => {
    const { name, email, phone } = c.req.valid('json');
    const db = getDb(c.env.DB);

    if (db) {
      const [existing] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

      if (existing) {
        return c.json(
          { success: false, error: { code: 'EMAIL_EXISTS', message: 'Email sudah terdaftar. Silakan login.' } },
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
        trustScore: 0,
        totalTransactions: 0,
        ratingAverage: 0,
        ratingCount: 0,
        createdAt: new Date().toISOString()
      };

      await db.insert(schema.users).values({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        passwordHash: 'mock_hashed_password',
        phone: newUser.phone,
        role: newUser.role,
        isKycVerified: newUser.isKycVerified,
        isPhoneVerified: newUser.isPhoneVerified,
        trustScore: newUser.trustScore,
        totalTransactions: newUser.totalTransactions,
        ratingAverage: newUser.ratingAverage,
        ratingCount: newUser.ratingCount,
        createdAt: newUser.createdAt,
        updatedAt: newUser.createdAt
      });

      const secret = c.env.JWT_SECRET || 'jbb_marketplace_super_secret_jwt_key_2026';
      const token = await signJwt(newUser, secret);

      return c.json({
        success: true,
        message: 'Registrasi berhasil!',
        data: { token, user: newUser }
      });
    }

    // Fallback to MemoryStore
    const existing = memoryStore.findUserByEmail(email);
    if (existing) {
      return c.json(
        { success: false, error: { code: 'EMAIL_EXISTS', message: 'Email sudah terdaftar. Silakan login.' } },
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
      trustScore: 0,
      totalTransactions: 0,
      ratingAverage: 0,
      ratingCount: 0,
      createdAt: new Date().toISOString()
    };

    memoryStore.addUser(newUser);
    const secret = c.env.JWT_SECRET || 'jbb_marketplace_super_secret_jwt_key_2026';
    const token = await signJwt(newUser, secret);

    return c.json({
      success: true,
      message: 'Registrasi berhasil!',
      data: { token, user: newUser }
    });
  })

  .post('/login', zValidator('json', loginSchema), async (c) => {
    const { email } = c.req.valid('json');
    const db = getDb(c.env.DB);

    if (db) {
      const [userDb] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

      if (!userDb) {
        return c.json(
          { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email atau password salah' } },
          401
        );
      }

      const user: UserProfile = {
        id: userDb.id,
        name: userDb.name,
        email: userDb.email,
        phone: userDb.phone,
        avatarUrl: userDb.avatarUrl,
        role: userDb.role as any,
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

      const secret = c.env.JWT_SECRET || 'jbb_marketplace_super_secret_jwt_key_2026';
      const token = await signJwt(user, secret);

      return c.json({
        success: true,
        message: 'Login berhasil!',
        data: { token, user }
      });
    }

    // Memory Store fallback
    const user = memoryStore.findUserByEmail(email);
    if (!user) {
      return c.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email atau password salah' } },
        401
      );
    }

    const secret = c.env.JWT_SECRET || 'jbb_marketplace_super_secret_jwt_key_2026';
    const token = await signJwt(user, secret);

    return c.json({
      success: true,
      message: 'Login berhasil!',
      data: { token, user }
    });
  })

  .post('/google', async (c) => {
    try {
      const body = await c.req.json();
      const { credential, email, name, avatarUrl } = body;

      // Extract user info from credential or direct payload
      let userEmail = email;
      let userName = name;
      let userAvatar = avatarUrl;

      // If Google JWT credential is provided, decode payload safely
      if (credential && typeof credential === 'string') {
        try {
          const parts = credential.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            userEmail = payload.email || userEmail;
            userName = payload.name || userName;
            userAvatar = payload.picture || userAvatar;
          }
        } catch {
          // ignore parsing error and use fallback fields
        }
      }

      if (!userEmail) {
        return c.json(
          { success: false, error: { code: 'INVALID_GOOGLE_AUTH', message: 'Email akun Google tidak ditemukan' } },
          400
        );
      }

      const db = getDb(c.env.DB);
      const secret = c.env.JWT_SECRET || 'jbb_marketplace_super_secret_jwt_key_2026';
      const isSuperAdmin = userEmail.toLowerCase() === 'aldrn.dev@gmail.com';

      if (db) {
        let [existingUser] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, userEmail.toLowerCase()))
          .limit(1);

        if (!existingUser) {
          const newUserId = `usr-g-${Date.now()}`;
          const created = {
            id: newUserId,
            name: userName || userEmail.split('@')[0],
            email: userEmail.toLowerCase(),
            passwordHash: 'google_oauth_authenticated',
            phone: null,
            role: isSuperAdmin ? ('ADMIN' as const) : ('BUYER' as const),
            avatarUrl: userAvatar || null,
            isKycVerified: false,
            isPhoneVerified: false,
            trustScore: 0,
            totalTransactions: 0,
            ratingAverage: 0,
            ratingCount: 0,
            city: null,
            province: null,
            bio: null,
            bankName: null,
            bankAccountNumber: null,
            bankAccountHolder: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await db.insert(schema.users).values(created);
          existingUser = created as any;
        } else {
          // If existing user needs admin upgrade or avatar update
          const updates: Record<string, any> = {};
          if (isSuperAdmin && existingUser.role !== 'ADMIN') {
            updates.role = 'ADMIN';
            existingUser.role = 'ADMIN';
          }
          if (userAvatar && existingUser.avatarUrl !== userAvatar) {
            updates.avatarUrl = userAvatar;
            existingUser.avatarUrl = userAvatar;
          }
          if (Object.keys(updates).length > 0) {
            updates.updatedAt = new Date().toISOString();
            await db.update(schema.users).set(updates).where(eq(schema.users.id, existingUser.id));
          }
        }

        const userProfile: UserProfile = {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          avatarUrl: existingUser.avatarUrl || userAvatar,
          role: (isSuperAdmin ? 'ADMIN' : existingUser.role) as any,
          isKycVerified: Boolean(existingUser.isKycVerified),
          isPhoneVerified: Boolean(existingUser.isPhoneVerified),
          trustScore: existingUser.trustScore,
          totalTransactions: existingUser.totalTransactions,
          ratingAverage: existingUser.ratingAverage,
          ratingCount: existingUser.ratingCount,
          city: existingUser.city,
          province: existingUser.province,
          bio: existingUser.bio,
          nik: (existingUser as any).nik,
          ktpImageUrl: (existingUser as any).ktpImageUrl,
          selfieImageUrl: (existingUser as any).selfieImageUrl,
          kycSubmittedAt: (existingUser as any).kycSubmittedAt,
          bankName: (existingUser as any).bankName,
          bankAccountNumber: (existingUser as any).bankAccountNumber,
          bankAccountHolder: (existingUser as any).bankAccountHolder,
          createdAt: existingUser.createdAt
        };

        const token = await signJwt(userProfile, secret);

        return c.json({
          success: true,
          message: 'Berhasil login dengan Google!',
          data: { token, user: userProfile }
        });
      }

      // Memory Store fallback
      let user = memoryStore.findUserByEmail(userEmail.toLowerCase());
      if (!user) {
        user = {
          id: `usr-g-${Date.now()}`,
          name: userName || userEmail.split('@')[0],
          email: userEmail.toLowerCase(),
          phone: null,
          role: isSuperAdmin ? 'ADMIN' : 'BUYER',
          avatarUrl: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName || 'GoogleUser')}`,
          isKycVerified: false,
          isPhoneVerified: false,
          trustScore: 0,
          totalTransactions: 0,
          ratingAverage: 0,
          ratingCount: 0,
          createdAt: new Date().toISOString()
        };
        memoryStore.addUser(user);
      } else if (isSuperAdmin) {
        user.role = 'ADMIN';
        if (userAvatar) user.avatarUrl = userAvatar;
      }

      const token = await signJwt(user, secret);

      return c.json({
        success: true,
        message: 'Berhasil login dengan Google!',
        data: { token, user }
      });
    } catch (err: any) {
      return c.json(
        {
          success: false,
          error: { code: 'GOOGLE_AUTH_FAILED', message: err.message || 'Gagal autentikasi Google' }
        },
        500
      );
    }
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
    const db = getDb(c.env.DB);

    if (db) {
      await db
        .update(schema.users)
        .set({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.users.id, user.id));
    }

    Object.assign(user, updates);

    return c.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: user
    });
  })

  .post('/kyc', authMiddleware, zValidator('json', submitKycSchema), async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, 401);
    }

    const { nik, ktpImageUrl, selfieImageUrl } = c.req.valid('json');
    const db = getDb(c.env.DB);
    const now = new Date().toISOString();

    if (db) {
      await db
        .update(schema.users)
        .set({
          nik,
          ktpImageUrl,
          selfieImageUrl: selfieImageUrl || null,
          kycSubmittedAt: now,
          isKycVerified: false,
          updatedAt: now
        })
        .where(eq(schema.users.id, user.id));
    }

    const memUser = memoryStore.findUserById(user.id);
    if (memUser) {
      memUser.nik = nik;
      memUser.ktpImageUrl = ktpImageUrl;
      memUser.selfieImageUrl = selfieImageUrl || null;
      memUser.kycSubmittedAt = now;
      memUser.isKycVerified = false;
    } else {
      user.nik = nik;
      user.ktpImageUrl = ktpImageUrl;
      user.selfieImageUrl = selfieImageUrl || null;
      user.kycSubmittedAt = now;
      user.isKycVerified = false;
      memoryStore.addUser(user);
    }

    return c.json({
      success: true,
      message: 'Pengajuan KYC berhasil dikirim! Menunggu persetujuan Admin Mediasi Rekber Peygo.',
      data: {
        ...user,
        nik,
        ktpImageUrl,
        selfieImageUrl,
        kycSubmittedAt: now,
        isKycVerified: false
      }
    });
  })

  .put('/bank-payout', authMiddleware, zValidator('json', updateBankPayoutSchema), async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, 401);
    }

    const { bankName, bankAccountNumber, bankAccountHolder } = c.req.valid('json');
    const db = getDb(c.env.DB);
    const now = new Date().toISOString();

    if (db) {
      await db
        .update(schema.users)
        .set({
          bankName,
          bankAccountNumber,
          bankAccountHolder,
          updatedAt: now
        })
        .where(eq(schema.users.id, user.id));
    }

    user.bankName = bankName;
    user.bankAccountNumber = bankAccountNumber;
    user.bankAccountHolder = bankAccountHolder;

    return c.json({
      success: true,
      message: 'Rekening pencairan dana berhasil disimpan!',
      data: user
    });
  });

