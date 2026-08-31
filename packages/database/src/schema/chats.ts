import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { listings } from './listings';
import { offers } from './offers';

export const chats = sqliteTable('chats', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull(),
  senderId: text('sender_id').notNull().references(() => users.id),
  receiverId: text('receiver_id').notNull().references(() => users.id),
  listingId: text('listing_id').references(() => listings.id),
  message: text('message').notNull(),
  isOfferCard: integer('is_offer_card', { mode: 'boolean' }).default(false).notNull(),
  offerId: text('offer_id').references(() => offers.id),
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

export type ChatDb = typeof chats.$inferSelect;
export type NewChatDb = typeof chats.$inferInsert;
