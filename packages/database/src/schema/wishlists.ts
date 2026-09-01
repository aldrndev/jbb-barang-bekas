import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { listings } from './listings';
import { users } from './users';

export const wishlists = sqliteTable('wishlists', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  listingId: text('listing_id')
    .notNull()
    .references(() => listings.id, { onDelete: 'cascade' }),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
});

export type WishlistDb = typeof wishlists.$inferSelect;
export type NewWishlistDb = typeof wishlists.$inferInsert;
