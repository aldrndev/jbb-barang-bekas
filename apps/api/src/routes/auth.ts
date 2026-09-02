import { zValidator } from '@hono/zod-validator';
import type { UserProfile } from '@jbb/types';
import {
  googleAuthSchema,
  submitKycSchema,
  updateBankPayoutSchema,
  updateProfileSchema
} from '@jbb/validators';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { getDb, schema } from '../db';
import { authMiddleware } from '../middlewares/auth';
import { memoryStore } from '../services/store';
import type { AppEnv } from '../types/env';
import { signJwt } from '../utils/auth';

// Designated platform super administrator accounts
const SUPER_ADMIN_EMAILS = ['aldrn.dev@gmail.com', 'admin.rekber@peygo.id'];

interface GoogleTokenInfo {
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  sub?: string;
  aud?: string;
  error_description?: string;
}

async function verifyGoogleCredential(
  credential: string
): Promise<{ email: string; name: string; avatarUrl: string | null } | null> {
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!res.ok) {
      return null;
    }

    const payload = (await res.json()) as GoogleTokenInfo;
    const isVerified = payload.email_verified === 'true' || payload.email_verified === true;

    if (!payload.email || !isVerified) {
      return null;
    }

    return {
      email: payload.email.toLowerCase().trim(),
      name: payload.name || payload.email.split('@')[0] || 'Pengguna Google',
      avatarUrl: payload.picture || null
    };
  } catch {
    return null;
  }
}

export const authRoutes = new Hono<AppEnv>()
  .post('/google', zValidator('json', googleAuthSchema), async (c) => {
    try {
      const { credential } = c.req.valid('json');
      const googleUser = await verifyGoogleCredential(credential);

      if (!googleUser) {
        return c.json(
          {
            success: false,
            error: {
              code: 'INVALID_GOOGLE_AUTH',
              message: 'Otentikasi Google gagal atau token tidak valid. Silakan coba login kembali.'
            }
          },
          401
        );
      }

      const secret = c.env.JWT_SECRET;
      if (!secret) {
        console.error('Server Error: JWT_SECRET is not configured in environment variables.');
        return c.json(
          {
            success: false,
            error: {
              code: 'SERVER_CONFIGURATION_ERROR',
              message: 'Konfigurasi secret token server belum terpasang. Silakan hubungi admin.'
            }
          },
          500
        );
      }

      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(googleUser.email.toLowerCase().trim());
      const db = getDb(c.env.DB);
      const now = new Date().toISOString();

      if (db) {
        let [existingUser] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, googleUser.email))
          .limit(1);

        if (!existingUser) {
          const newUserId = `usr-g-${Date.now()}`;
          const newUserRecord = {
            id: newUserId,
            name: googleUser.name,
            email: googleUser.email,
            passwordHash: null,
            phone: null,
            role: isSuperAdmin ? ('ADMIN' as const) : ('BUYER' as const),
            avatarUrl: googleUser.avatarUrl,
            isKycVerified: isSuperAdmin,
            isPhoneVerified: isSuperAdmin,
            trustScore: isSuperAdmin ? 100 : 0,
            totalTransactions: 0,
            ratingAverage: isSuperAdmin ? 5.0 : 0,
            ratingCount: 0,
            city: null,
            province: null,
            bio: isSuperAdmin ? 'Master Administrator Platform Rekber Peygo' : null,
            nik: null,
            ktpImageUrl: null,
            selfieImageUrl: null,
            kycSubmittedAt: null,
            bankName: null,
            bankAccountNumber: null,
            bankAccountHolder: null,
            createdAt: now,
            updatedAt: now
          };

          try {
            await db.insert(schema.users).values(newUserRecord);
          } catch (dbErr: unknown) {
            const errStr = String(dbErr);
            // Backward-compatibility: if existing SQLite database has NOT NULL on password_hash
            if (errStr.includes('password_hash')) {
              await db.insert(schema.users).values({
                ...newUserRecord,
                passwordHash: ''
              });
            } else {
              throw dbErr;
            }
          }
          existingUser = newUserRecord;
        } else {
          const updates: Record<string, unknown> = {};

          if (isSuperAdmin && existingUser.role !== 'ADMIN') {
            updates.role = 'ADMIN';
            updates.isKycVerified = true;
            updates.trustScore = 100;
            existingUser.role = 'ADMIN';
            existingUser.isKycVerified = true;
            existingUser.trustScore = 100;
          }

          if (googleUser.avatarUrl && existingUser.avatarUrl !== googleUser.avatarUrl) {
            updates.avatarUrl = googleUser.avatarUrl;
            existingUser.avatarUrl = googleUser.avatarUrl;
          }

          if (Object.keys(updates).length > 0) {
            updates.updatedAt = now;
            await db.update(schema.users).set(updates).where(eq(schema.users.id, existingUser.id));
          }
        }

        const userProfile: UserProfile = {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          avatarUrl: existingUser.avatarUrl,
          role: existingUser.role,
          isKycVerified: Boolean(existingUser.isKycVerified),
          isPhoneVerified: Boolean(existingUser.isPhoneVerified),
          trustScore: existingUser.trustScore,
          totalTransactions: existingUser.totalTransactions,
          ratingAverage: existingUser.ratingAverage,
          ratingCount: existingUser.ratingCount,
          city: existingUser.city,
          province: existingUser.province,
          bio: existingUser.bio,
          nik: existingUser.nik,
          ktpImageUrl: existingUser.ktpImageUrl,
          selfieImageUrl: existingUser.selfieImageUrl,
          kycSubmittedAt: existingUser.kycSubmittedAt,
          bankName: existingUser.bankName,
          bankAccountNumber: existingUser.bankAccountNumber,
          bankAccountHolder: existingUser.bankAccountHolder,
          createdAt: existingUser.createdAt
        };

        const token = await signJwt(userProfile, secret);

        return c.json({
          success: true,
          message: 'Berhasil login dengan Google!',
          data: { token, user: userProfile }
        });
      }

      // Memory Store Fallback
      let user = memoryStore.findUserByEmail(googleUser.email);
      if (!user) {
        user = {
          id: `usr-g-${Date.now()}`,
          name: googleUser.name,
          email: googleUser.email,
          phone: null,
          role: isSuperAdmin ? 'ADMIN' : 'BUYER',
          avatarUrl:
            googleUser.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googleUser.name)}`,
          isKycVerified: isSuperAdmin,
          isPhoneVerified: isSuperAdmin,
          trustScore: isSuperAdmin ? 100 : 0,
          totalTransactions: 0,
          ratingAverage: isSuperAdmin ? 5.0 : 0,
          ratingCount: 0,
          createdAt: now
        };
        memoryStore.addUser(user);
      } else if (isSuperAdmin && user.role !== 'ADMIN') {
        user.role = 'ADMIN';
        user.isKycVerified = true;
        user.trustScore = 100;
      }

      const token = await signJwt(user, secret);

      return c.json({
        success: true,
        message: 'Berhasil login dengan Google!',
        data: { token, user }
      });
    } catch (err: unknown) {
      console.error('Google Auth Route Error:', err);
      return c.json(
        {
          success: false,
          error: {
            code: 'GOOGLE_AUTH_FAILED',
            message:
              'Terjadi kendala saat memproses login Google Anda. Silakan coba kembali beberapa saat lagi.'
          }
        },
        500
      );
    }
  })

  .get('/me', authMiddleware, async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu' }
        },
        401
      );
    }

    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
    const db = getDb(c.env.DB);

    if (db) {
      const [dbUser] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, user.id))
        .limit(1);

      if (dbUser) {
        const userProfile: UserProfile = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone,
          avatarUrl: dbUser.avatarUrl,
          role: isSuperAdmin ? 'ADMIN' : dbUser.role,
          isKycVerified: isSuperAdmin ? true : Boolean(dbUser.isKycVerified),
          isPhoneVerified: isSuperAdmin ? true : Boolean(dbUser.isPhoneVerified),
          trustScore: isSuperAdmin ? 100 : dbUser.trustScore,
          totalTransactions: dbUser.totalTransactions,
          ratingAverage: dbUser.ratingAverage,
          ratingCount: dbUser.ratingCount,
          city: dbUser.city,
          province: dbUser.province,
          bio: dbUser.bio,
          nik: dbUser.nik,
          ktpImageUrl: dbUser.ktpImageUrl,
          selfieImageUrl: dbUser.selfieImageUrl,
          kycSubmittedAt: dbUser.kycSubmittedAt,
          bankName: dbUser.bankName,
          bankAccountNumber: dbUser.bankAccountNumber,
          bankAccountHolder: dbUser.bankAccountHolder,
          createdAt: dbUser.createdAt
        };
        return c.json({
          success: true,
          data: userProfile
        });
      }
    }

    if (isSuperAdmin) {
      user.role = 'ADMIN';
      user.isKycVerified = true;
      user.trustScore = 100;
    }

    return c.json({
      success: true,
      data: user
    });
  })

  .put('/profile', authMiddleware, zValidator('json', updateProfileSchema), async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu' }
        },
        401
      );
    }

    const updates = c.req.valid('json');
    const db = getDb(c.env.DB);
    const now = new Date().toISOString();

    if (db) {
      await db
        .update(schema.users)
        .set({
          ...updates,
          updatedAt: now
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
      return c.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu' }
        },
        401
      );
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
      return c.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu' }
        },
        401
      );
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
