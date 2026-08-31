import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createReviewSchema } from '@jbb/validators';
import type { AppEnv } from '../types/env';
import { memoryStore } from '../services/store';
import { authMiddleware } from '../middlewares/auth';
import type { Review } from '@jbb/types';

export const reviewRoutes = new Hono<AppEnv>()
  .get('/seller/:sellerId', async (c) => {
    const sellerId = c.req.param('sellerId');
    const reviews = memoryStore.reviews
      .filter((r) => r.sellerId === sellerId)
      .map((r) => ({
        ...r,
        reviewer: memoryStore.findUserById(r.reviewerId)
      }));

    return c.json({
      success: true,
      data: reviews
    });
  })

  .post('/', authMiddleware, zValidator('json', createReviewSchema), async (c) => {
    const user = c.get('user')!;
    const { orderId, rating, comment, itemConditionMatch, fastResponse } = c.req.valid('json');

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

    // Update seller stats
    const seller = memoryStore.findUserById(order.sellerId);
    if (seller) {
      seller.ratingCount += 1;
      const allSellerReviews = memoryStore.reviews.filter((r) => r.sellerId === seller.id);
      const sum = allSellerReviews.reduce((acc, r) => acc + r.rating, 0);
      seller.ratingAverage = Number((sum / allSellerReviews.length).toFixed(1));
    }

    return c.json(
      {
        success: true,
        message: 'Ulasan berhasil dikirim! Terima kasih atas feedback Anda.',
        data: newReview
      },
      201
    );
  });
