import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  role: text('role', { enum: ['BUYER', 'SELLER', 'MODERATOR', 'ADMIN'] }).default('BUYER').notNull(),
  isKycVerified: integer('is_kyc_verified', { mode: 'boolean' }).default(false).notNull(),
  isPhoneVerified: integer('is_phone_verified', { mode: 'boolean' }).default(false).notNull(),
  trustScore: integer('trust_score').default(80).notNull(), // 0 - 100
  totalTransactions: integer('total_transactions').default(0).notNull(),
  ratingAverage: real('rating_average').default(5.0).notNull(),
  ratingCount: integer('rating_count').default(0).notNull(),
  city: text('city'),
  province: text('province'),
  bio: text('bio'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString())
});

export type UserDb = typeof users.$inferSelect;
export type NewUserDb = typeof users.$inferInsert;
