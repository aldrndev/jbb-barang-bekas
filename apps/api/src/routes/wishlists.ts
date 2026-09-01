import type { Listing, ListingCondition } from '@jbb/types';
import { and, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { getDb, schema } from '../db';
import { authMiddleware } from '../middlewares/auth';
import { memoryStore } from '../services/store';
import type { AppEnv } from '../types/env';

export const wishlistRoutes = new Hono<AppEnv>()
  .use('*', authMiddleware)

  // 1. GET all wishlist listings for logged-in user
  .get('/', async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu' }
        },
        401
      );
    }
    const db = getDb(c.env.DB);

    if (db) {
      try {
        const userWishlistEntries = await db
          .select({ listingId: schema.wishlists.listingId })
          .from(schema.wishlists)
          .where(eq(schema.wishlists.userId, user.id));

        if (userWishlistEntries.length === 0) {
          return c.json({ success: true, data: [] });
        }

        const listingIds = userWishlistEntries.map((w) => w.listingId);
        const dbListings = await db.query.listings.findMany({
          where: and(eq(schema.listings.status, 'ACTIVE'), inArray(schema.listings.id, listingIds)),
          with: {
            images: true,
            seller: true,
            category: true
          }
        });

        const items: Listing[] = dbListings.map((l) => ({
          id: l.id,
          sellerId: l.sellerId,
          categoryId: l.categoryId,
          title: l.title,
          slug: l.slug,
          description: l.description,
          price: l.price,
          originalPrice: l.originalPrice,
          isNegotiable: Boolean(l.isNegotiable),
          minOfferPrice: l.minOfferPrice,
          condition: l.condition as ListingCondition,
          completeness:
            typeof l.completeness === 'string' ? JSON.parse(l.completeness) : l.completeness,
          purchaseYear: l.purchaseYear,
          warrantyUntil: l.warrantyUntil,
          hasOriginalReceipt: Boolean(l.hasOriginalReceipt),
          status: l.status,
          viewCount: l.viewCount,
          offerCount: l.offerCount,
          favoriteCount: l.favoriteCount,
          province: l.province,
          city: l.city,
          district: l.district,
          postalCode: l.postalCode,
          isCodAvailable: Boolean(l.isCodAvailable),
          codMeetingPoint: l.codMeetingPoint,
          specs: l.specs ? (typeof l.specs === 'string' ? JSON.parse(l.specs) : l.specs) : null,
          images: (l.images || []).map((img) => ({
            id: img.id,
            listingId: img.listingId,
            url: img.url,
            isPrimary: Boolean(img.isPrimary),
            sortOrder: img.sortOrder
          })),
          seller: l.seller
            ? {
                id: l.seller.id,
                name: l.seller.name,
                email: l.seller.email,
                phone: l.seller.phone,
                avatarUrl: l.seller.avatarUrl,
                role: l.seller.role,
                isKycVerified: Boolean(l.seller.isKycVerified),
                isPhoneVerified: Boolean(l.seller.isPhoneVerified),
                trustScore: l.seller.trustScore,
                totalTransactions: l.seller.totalTransactions,
                ratingAverage: l.seller.ratingAverage,
                ratingCount: l.seller.ratingCount,
                city: l.seller.city,
                province: l.seller.province,
                bio: l.seller.bio,
                createdAt: l.seller.createdAt
              }
            : undefined,
          category: l.category
            ? {
                id: l.category.id,
                name: l.category.name,
                slug: l.category.slug,
                icon: l.category.icon,
                sortOrder: l.category.sortOrder
              }
            : undefined,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt
        }));

        return c.json({
          success: true,
          data: items
        });
      } catch (err: unknown) {
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
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu' }
        },
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
            and(eq(schema.wishlists.userId, user.id), eq(schema.wishlists.listingId, listingId))
          )
          .limit(1);

        if (existing) {
          await db.delete(schema.wishlists).where(eq(schema.wishlists.id, existing.id));

          return c.json({
            success: true,
            data: { isWishlisted: false }
          });
        }

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
      } catch (err: unknown) {
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
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu' }
        },
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
            and(eq(schema.wishlists.userId, user.id), eq(schema.wishlists.listingId, listingId))
          );

        return c.json({ success: true, data: { success: true } });
      } catch (err: unknown) {
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
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu' }
        },
        401
      );
    }
    const db = getDb(c.env.DB);

    if (db) {
      try {
        await db.delete(schema.wishlists).where(eq(schema.wishlists.userId, user.id));

        return c.json({ success: true, data: { success: true } });
      } catch (err: unknown) {
        console.error('Wishlist Clear DB Error:', err);
      }
    }

    memoryStore.clearWishlist(user.id);
    return c.json({ success: true, data: { success: true } });
  });
