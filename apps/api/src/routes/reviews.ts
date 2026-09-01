import { zValidator } from '@hono/zod-validator';
import type { Review } from '@jbb/types';
import { createReviewSchema } from '@jbb/validators';
import { desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { getDb, schema } from '../db';
import { authMiddleware } from '../middlewares/auth';
import { memoryStore } from '../services/store';
import type { AppEnv } from '../types/env';

export const reviewRoutes = new Hono<AppEnv>()
  .get('/seller/:sellerId', async (c) => {
    const sellerId = c.req.param('sellerId');
    const db = getDb(c.env.DB);

    if (db) {
      const dbReviews = await db.query.reviews.findMany({
        where: eq(schema.reviews.sellerId, sellerId),
        with: { reviewer: true },
        orderBy: [desc(schema.reviews.createdAt)]
      });

      const formatted: Review[] = dbReviews.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        listingId: r.listingId,
        reviewerId: r.reviewerId,
        sellerId: r.sellerId,
        rating: r.rating,
        comment: r.comment,
        itemConditionMatch: Boolean(r.itemConditionMatch),
        fastResponse: Boolean(r.fastResponse),
        createdAt: r.createdAt,
        reviewer: r.reviewer
          ? {
              id: r.reviewer.id,
              name: r.reviewer.name,
              email: r.reviewer.email,
              phone: r.reviewer.phone,
              avatarUrl: r.reviewer.avatarUrl,
              role: r.reviewer.role,
              isKycVerified: Boolean(r.reviewer.isKycVerified),
              isPhoneVerified: Boolean(r.reviewer.isPhoneVerified),
              trustScore: r.reviewer.trustScore,
              totalTransactions: r.reviewer.totalTransactions,
              ratingAverage: r.reviewer.ratingAverage,
              ratingCount: r.reviewer.ratingCount,
              city: r.reviewer.city,
              province: r.reviewer.province,
              bio: r.reviewer.bio,
              createdAt: r.reviewer.createdAt
            }
          : undefined
      }));

      return c.json({ success: true, data: formatted });
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
    const now = new Date().toISOString();

    if (db) {
      const order = await db.query.orders.findFirst({
        where: eq(schema.orders.id, orderId)
      });

      if (!order) {
        return c.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Pesanan tidak ditemukan' } },
          404
        );
      }

      if (order.buyerId !== user.id) {
        return c.json(
          {
            success: false,
            error: { code: 'FORBIDDEN', message: 'Hanya pembeli yang bisa memberi review' }
          },
          403
        );
      }

      if (order.escrowStatus !== 'COMPLETED') {
        return c.json(
          {
            success: false,
            error: {
              code: 'INVALID_STATUS',
              message: 'Ulasan hanya dapat diberikan setelah transaksi selesai dikonfirmasi'
            }
          },
          400
        );
      }

      const existingReview = await db.query.reviews.findFirst({
        where: eq(schema.reviews.orderId, orderId)
      });

      if (existingReview) {
        return c.json(
          {
            success: false,
            error: {
              code: 'ALREADY_REVIEWED',
              message: 'Anda sudah memberikan ulasan untuk pesanan ini'
            }
          },
          400
        );
      }

      const reviewId = `rev-${Date.now()}`;

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
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Pesanan tidak ditemukan' } },
        404
      );
    }

    if (order.buyerId !== user.id) {
      return c.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Hanya pembeli yang bisa memberi review' }
        },
        403
      );
    }

    if (order.escrowStatus !== 'COMPLETED') {
      return c.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Ulasan hanya dapat diberikan setelah transaksi selesai dikonfirmasi'
          }
        },
        400
      );
    }

    const existingMemReview = memoryStore.reviews.find((r) => r.orderId === orderId);
    if (existingMemReview) {
      return c.json(
        {
          success: false,
          error: {
            code: 'ALREADY_REVIEWED',
            message: 'Anda sudah memberikan ulasan untuk pesanan ini'
          }
        },
        400
      );
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
      createdAt: now,
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
