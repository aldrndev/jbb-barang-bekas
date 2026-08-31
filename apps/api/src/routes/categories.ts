import { Hono } from 'hono';
import type { AppEnv } from '../types/env';
import { memoryStore } from '../services/store';

export const categoryRoutes = new Hono<AppEnv>()
  .get('/', async (c) => {
    return c.json({
      success: true,
      data: memoryStore.categories
    });
  })

  .get('/:slug', async (c) => {
    const slug = c.req.param('slug');
    const category = memoryStore.categories.find((cat) => cat.slug === slug || cat.id === slug);

    if (!category) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Kategori tidak ditemukan'
          }
        },
        404
      );
    }

    return c.json({
      success: true,
      data: category
    });
  });
