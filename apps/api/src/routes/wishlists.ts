import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { AppEnv } from '../types/env';
import { getDb, schema } from '../db';
import { authMiddleware } from '../middlewares/auth';
import { memoryStore } from '../services/store';
import type { Listing } from '@jbb/types';

export const wishlistRoutes = new Hono<AppEnv>()
  .use('*', authMiddleware)

  // 1. GET all wishlist listings for logged-in user
  .get('/', async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu' } },
        401
      );
    }
    const db = getDb(c.env.DB);

    if (db) {
      try {
        const userWishlistEntries = await db
          .select()
          .from(schema.wishlists)
          .where(eq(schema.wishlists.userId, user.id));

        if (userWishlistEntries.length === 0) {
          return c.json({ success: true, data: [] });
        }

        const listingIds = new Set(userWishlistEntries.map((w) => w.listingId));
        const dbListings = await db.query.listings.findMany({
          where: eq(schema.listings.status, 'ACTIVE'),
          with: {
            images: true,
            seller: true,
            category: true
          }
        });

        const items: Listing[] = dbListings
          .filter((l) => listingIds.has(l.id))
          .map((l: any) => ({
            ...l,
            isNegotiable: Boolean(l.isNegotiable),
            hasOriginalReceipt: Boolean(l.hasOriginalReceipt),
            isCodAvailable: Boolean(l.isCodAvailable),
            completeness: typeof l.completeness === 'string' ? JSON.parse(l.completeness) : l.completeness,
            specs: l.specs ? (typeof l.specs === 'string' ? JSON.parse(l.specs) : l.specs) : null,
            images: l.images || [],
            seller: l.seller
              ? {
                  ...l.seller,
                  isKycVerified: Boolean(l.seller.isKycVerified),
                  isPhoneVerified: Boolean(l.seller.isPhoneVerified)
                }
              : undefined,
            category: l.category
          }));

        return c.json({
          success: true,
          data: items
        });
      } catch (err: any) {
        console.error('Wishlist DB Query Error:', err);
      }
    }

    const items = memoryStore.getUserWishlist(user.id);
    return c.json({
      success: true,
      data: items
    });
  })

  // 2. POST /:listingId/toggle - toggle wishlist
  .post('/:listingId/toggle', async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu' } },
        401
      );
    }
    const listingId = c.req.param('listingId');
    const db = getDb(c.env.DB);

    if (db) {
      try {
        const [existing] = await db
          .select()
          .from(schema.wishlists)
          .where(
            and(
              eq(schema.wishlists.userId, user.id),
              eq(schema.wishlists.listingId, listingId)
            )
          )
          .limit(1);

        if (existing) {
          await db
            .delete(schema.wishlists)
            .where(eq(schema.wishlists.id, existing.id));

          return c.json({
            success: true,
            data: { isWishlisted: false }
          });
        } else {
          await db.insert(schema.wishlists).values({
            id: `wsh-${Date.now()}`,
            userId: user.id,
            listingId,
            createdAt: new Date().toISOString()
          });

          return c.json({
            success: true,
            data: { isWishlisted: true }
          });
        }
      } catch (err: any) {
        console.error('Wishlist Toggle DB Error:', err);
      }
    }

    const isWishlisted = memoryStore.toggleWishlist(user.id, listingId);
    return c.json({
      success: true,
      data: { isWishlisted }
    });
  })

  // 3. DELETE /:listingId - remove single listing from wishlist
  .delete('/:listingId', async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu' } },
        401
      );
    }
    const listingId = c.req.param('listingId');
    const db = getDb(c.env.DB);

    if (db) {
      try {
        await db
          .delete(schema.wishlists)
          .where(
            and(
              eq(schema.wishlists.userId, user.id),
              eq(schema.wishlists.listingId, listingId)
            )
          );

        return c.json({ success: true, data: { success: true } });
      } catch (err: any) {
        console.error('Wishlist Delete DB Error:', err);
      }
    }

    memoryStore.removeFromWishlist(user.id, listingId);
    return c.json({ success: true, data: { success: true } });
  })

  // 4. DELETE / - clear entire wishlist for user
  .delete('/', async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu' } },
        401
      );
    }
    const db = getDb(c.env.DB);

    if (db) {
      try {
        await db
          .delete(schema.wishlists)
          .where(eq(schema.wishlists.userId, user.id));

        return c.json({ success: true, data: { success: true } });
      } catch (err: any) {
        console.error('Wishlist Clear DB Error:', err);
      }
    }

    memoryStore.clearWishlist(user.id);
    return c.json({ success: true, data: { success: true } });
  });
