import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon').notNull(),
  parentId: text('parent_id'),
  itemCount: integer('item_count').default(0).notNull(),
  featured: integer('featured', { mode: 'boolean' }).default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

export type CategoryDb = typeof categories.$inferSelect;
export type NewCategoryDb = typeof categories.$inferInsert;
