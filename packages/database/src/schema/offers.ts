import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { listings } from './listings';
import { users } from './users';

export const offers = sqliteTable('offers', {
  id: text('id').primaryKey(),
  listingId: text('listing_id')
    .notNull()
    .references(() => listings.id, { onDelete: 'cascade' }),
  buyerId: text('buyer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  sellerId: text('seller_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  offeredPrice: real('offered_price').notNull(),
  message: text('message'),
  status: text('status', {
    enum: ['PENDING', 'ACCEPTED', 'COUNTERED', 'REJECTED', 'EXPIRED', 'COMPLETED']
  })
    .default('PENDING')
    .notNull(),
  counterPrice: real('counter_price'),
  counterMessage: text('counter_message'),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
});

export type OfferDb = typeof offers.$inferSelect;
export type NewOfferDb = typeof offers.$inferInsert;
