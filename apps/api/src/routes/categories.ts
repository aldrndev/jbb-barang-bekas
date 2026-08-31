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

      return c.json({
        success: true,
        data: dbCategories
      });
    }

    return c.json({
      success: true,
      data: memoryStore.categories
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

      return c.json({
        success: true,
        data: category
      });
    }

    const category = memoryStore.categories.find((cat) => cat.slug === slug || cat.id === slug);

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
