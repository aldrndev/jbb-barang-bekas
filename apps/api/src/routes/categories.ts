import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import type { AppEnv } from '../types/env';
import { getDb, schema } from '../db';
import { memoryStore } from '../services/store';

export const categoryRoutes = new Hono<AppEnv>()
  .get('/', async (c) => {
    const db = getDb(c.env.DB);
    if (db) {
      const dbCategories = await db
        .select()
        .from(schema.categories)
        .orderBy(schema.categories.sortOrder);

      const dbListings = await db
        .select({ categoryId: schema.listings.categoryId })
        .from(schema.listings)
        .where(eq(schema.listings.status, 'ACTIVE'));

      const counts: Record<string, number> = {};
      dbListings.forEach((l) => {
        counts[l.categoryId] = (counts[l.categoryId] || 0) + 1;
      });

      const categoriesWithCount = dbCategories.map((cat) => ({
        ...cat,
        itemCount: counts[cat.id] || 0
      }));

      return c.json({
        success: true,
        data: categoriesWithCount
      });
    }

    return c.json({
      success: true,
      data: memoryStore.getCategories()
    });
  })

  .get('/:slug', async (c) => {
    const slug = c.req.param('slug');
    const db = getDb(c.env.DB);

    if (db) {
      const [category] = await db
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.slug, slug))
        .limit(1);

      if (!category) {
        return c.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Kategori tidak ditemukan' } },
          404
        );
      }

      const [countResult] = await db
        .select()
        .from(schema.listings)
        .where(eq(schema.listings.categoryId, category.id));

      return c.json({
        success: true,
        data: {
          ...category,
          itemCount: countResult ? 1 : 0
        }
      });
    }

    const categories = memoryStore.getCategories();
    const category = categories.find((cat) => cat.slug === slug || cat.id === slug);

    if (!category) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Kategori tidak ditemukan' } },
        404
      );
    }

    return c.json({
      success: true,
      data: category
    });
  });
