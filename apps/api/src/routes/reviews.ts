import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, desc } from 'drizzle-orm';
import { createReviewSchema } from '@jbb/validators';
import type { AppEnv } from '../types/env';
import { getDb, schema } from '../db';
import { memoryStore } from '../services/store';
import { authMiddleware } from '../middlewares/auth';
import type { Review } from '@jbb/types';

export const reviewRoutes = new Hono<AppEnv>()
  .get('/seller/:sellerId', async (c) => {
    const sellerId = c.req.param('sellerId');
    const db = getDb(c.env.DB);

    if (db) {
      const reviews = await db.query.reviews.findMany({
        where: eq(schema.reviews.sellerId, sellerId),
        with: { reviewer: true },
        orderBy: [desc(schema.reviews.createdAt)]
      });

      return c.json({ success: true, data: reviews });
    }

    const reviews = memoryStore.reviews
      .filter((r) => r.sellerId === sellerId)
      .map((r) => ({
        ...r,
        reviewer: memoryStore.findUserById(r.reviewerId)
      }));

    return c.json({ success: true, data: reviews });
  })

  .post('/', authMiddleware, zValidator('json', createReviewSchema), async (c) => {
    const user = c.get('user')!;
    const { orderId, rating, comment, itemConditionMatch, fastResponse } = c.req.valid('json');
    const db = getDb(c.env.DB);

    if (db) {
      const order = await db.query.orders.findFirst({
        where: eq(schema.orders.id, orderId)
      });

      if (!order) {
        return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Pesanan tidak ditemukan' } }, 404);
      }

      if (order.buyerId !== user.id) {
        return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Hanya pembeli yang bisa memberi review' } }, 403);
      }

      const reviewId = `rev-${Date.now()}`;
      const now = new Date().toISOString();

      await db.insert(schema.reviews).values({
        id: reviewId,
        orderId,
        listingId: order.listingId,
        reviewerId: user.id,
        sellerId: order.sellerId,
        rating,
        comment,
        itemConditionMatch,
        fastResponse,
        createdAt: now
      });

      const createdReview = await db.query.reviews.findFirst({
        where: eq(schema.reviews.id, reviewId),
        with: { reviewer: true }
      });

      return c.json(
        {
          success: true,
          message: 'Ulasan berhasil dikirim! Terima kasih atas feedback Anda.',
          data: createdReview
        },
        201
      );
    }

    // Memory Store Fallback
    const order = memoryStore.orders.find((o) => o.id === orderId);
    if (!order) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Pesanan tidak ditemukan' } }, 404);
    }

    if (order.buyerId !== user.id) {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Hanya pembeli yang bisa memberi review' } }, 403);
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      orderId,
      listingId: order.listingId,
      reviewerId: user.id,
      sellerId: order.sellerId,
      rating,
      comment,
      itemConditionMatch,
      fastResponse,
      createdAt: new Date().toISOString(),
      reviewer: user
    };

    memoryStore.reviews.unshift(newReview);

    return c.json(
      {
        success: true,
        message: 'Ulasan berhasil dikirim! Terima kasih atas feedback Anda.',
        data: newReview
      },
      201
    );
  });
