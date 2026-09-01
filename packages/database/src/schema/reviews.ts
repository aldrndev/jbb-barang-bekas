import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { listings } from './listings';
import { orders } from './orders';
import { users } from './users';

export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id),
  listingId: text('listing_id')
    .notNull()
    .references(() => listings.id),
  reviewerId: text('reviewer_id')
    .notNull()
    .references(() => users.id),
  sellerId: text('seller_id')
    .notNull()
    .references(() => users.id),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  itemConditionMatch: integer('item_condition_match', { mode: 'boolean' }).default(true).notNull(),
  fastResponse: integer('fast_response', { mode: 'boolean' }).default(true).notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
});

export type ReviewDb = typeof reviews.$inferSelect;
export type NewReviewDb = typeof reviews.$inferInsert;
