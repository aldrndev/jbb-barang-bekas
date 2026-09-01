import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { categories } from './categories';
import { users } from './users';

export const listings = sqliteTable('listings', {
  id: text('id').primaryKey(),
  sellerId: text('seller_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  originalPrice: real('original_price'),
  isNegotiable: integer('is_negotiable', { mode: 'boolean' }).default(true).notNull(),
  minOfferPrice: real('min_offer_price'),
  condition: text('condition', {
    enum: ['NEW', 'LIKE_NEW', 'USED_EXCELLENT', 'USED_GOOD', 'USED_FAIR', 'PARTS_ONLY']
  }).notNull(),
  completeness: text('completeness').notNull(), // JSON array string
  purchaseYear: integer('purchase_year'),
  warrantyUntil: text('warranty_until'),
  hasOriginalReceipt: integer('has_original_receipt', { mode: 'boolean' }).default(false).notNull(),
  status: text('status', {
    enum: ['DRAFT', 'ACTIVE', 'IN_NEGO', 'RESERVED', 'SOLD', 'ARCHIVED']
  })
    .default('ACTIVE')
    .notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  offerCount: integer('offer_count').default(0).notNull(),
  favoriteCount: integer('favorite_count').default(0).notNull(),

  // Location
  province: text('province').notNull(),
  city: text('city').notNull(),
  district: text('district').notNull(),
  postalCode: text('postal_code'),
  isCodAvailable: integer('is_cod_available', { mode: 'boolean' }).default(true).notNull(),
  codMeetingPoint: text('cod_meeting_point'),

  // Dynamic specs JSON string
  specs: text('specs'),

  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
});

export const listingImages = sqliteTable('listing_images', {
  id: text('id').primaryKey(),
  listingId: text('listing_id')
    .notNull()
    .references(() => listings.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
});

export type ListingDb = typeof listings.$inferSelect;
export type NewListingDb = typeof listings.$inferInsert;
export type ListingImageDb = typeof listingImages.$inferSelect;
export type NewListingImageDb = typeof listingImages.$inferInsert;
