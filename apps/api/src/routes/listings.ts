import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, desc, asc, or, sql } from 'drizzle-orm';
import { createListingSchema, updateListingSchema, listingQuerySchema } from '@jbb/validators';
import type { AppEnv } from '../types/env';
import { getDb, schema } from '../db';
import { memoryStore } from '../services/store';
import { authMiddleware } from '../middlewares/auth';
import type { Completeness, Listing, ListingCondition, ListingStatus } from '@jbb/types';

function safeJsonParse<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'object') return val as T;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export const listingRoutes = new Hono<AppEnv>()
  .get('/', zValidator('query', listingQuerySchema), async (c) => {
    try {
      const query = c.req.valid('query');
      const db = getDb(c.env.DB);

      if (db) {
        const dbListings = await db.query.listings.findMany({
          with: {
            images: true,
            seller: true,
            category: true
          },
          orderBy:
            query.sortBy === 'price_asc'
              ? [asc(schema.listings.price)]
              : query.sortBy === 'price_desc'
                ? [desc(schema.listings.price)]
                : [desc(schema.listings.createdAt)]
        });

        let items: Listing[] = dbListings.map((l) => ({
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
          completeness: safeJsonParse<Completeness[]>(l.completeness, ['UNIT_ONLY']),
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
          specs: safeJsonParse<Record<string, string | number | boolean> | null>(l.specs, null),
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

        if (query.q) {
          const qLower = query.q.toLowerCase();
          items = items.filter(
            (i) =>
              i.title.toLowerCase().includes(qLower) ||
              i.description.toLowerCase().includes(qLower) ||
              i.city.toLowerCase().includes(qLower)
          );
        }
        if (query.category && query.category !== 'all') {
          items = items.filter(
            (i) => i.category?.slug === query.category || i.categoryId === query.category
          );
        }
        if (query.condition) {
          const conditions = Array.isArray(query.condition) ? query.condition : [query.condition];
          items = items.filter((i) => conditions.includes(i.condition));
        }
        if (query.minPrice !== undefined) {
          items = items.filter((i) => i.price >= query.minPrice!);
        }
        if (query.maxPrice !== undefined) {
          items = items.filter((i) => i.price <= query.maxPrice!);
        }
        if (query.city) {
          items = items.filter((i) => i.city.toLowerCase().includes(query.city!.toLowerCase()));
        }
        if (query.isCod !== undefined) {
          items = items.filter((i) => i.isCodAvailable === query.isCod);
        }
        if (query.isNego !== undefined) {
          items = items.filter((i) => i.isNegotiable === query.isNego);
        }

        const total = items.length;
        const limit = query.limit || 20;

        let paginated: Listing[] = [];
        let nextCursor: string | null = null;
        let hasMore = false;
        const page = query.page || 1;

        if (query.cursor) {
          const cursorIndex = items.findIndex((i) => i.id === query.cursor);
          const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
          paginated = items.slice(startIndex, startIndex + limit);
          const lastItem = paginated[paginated.length - 1];
          nextCursor = startIndex + limit < total && lastItem ? lastItem.id : null;
          hasMore = startIndex + limit < total;
        } else {
          const offset = (page - 1) * limit;
          paginated = items.slice(offset, offset + limit);
          const lastItem = paginated[paginated.length - 1];
          nextCursor = offset + limit < total && lastItem ? lastItem.id : null;
          hasMore = offset + limit < total;
        }

        const totalPages = Math.ceil(total / limit);

        return c.json({
          success: true,
          data: {
            items: paginated,
            pagination: { page, limit, total, totalPages, hasMore, nextCursor }
          }
        });
      }

      // Memory Store Fallback
      let items = [...memoryStore.listings];

      if (query.q) {
        const qLower = query.q.toLowerCase();
        items = items.filter(
          (item) =>
            item.title.toLowerCase().includes(qLower) ||
            item.description.toLowerCase().includes(qLower) ||
            item.city.toLowerCase().includes(qLower)
        );
      }
      if (query.category && query.category !== 'all') {
        const cat = memoryStore.categories.find(
          (catItem) => catItem.slug === query.category || catItem.id === query.category
        );
        if (cat) {
          items = items.filter((item) => item.categoryId === cat.id);
        }
      }
      if (query.condition) {
        const conditions = Array.isArray(query.condition) ? query.condition : [query.condition];
        items = items.filter((item) => conditions.includes(item.condition));
      }
      if (query.minPrice !== undefined) {
        items = items.filter((item) => item.price >= query.minPrice!);
      }
      if (query.maxPrice !== undefined) {
        items = items.filter((item) => item.price <= query.maxPrice!);
      }
      if (query.city) {
        items = items.filter((item) => item.city.toLowerCase().includes(query.city!.toLowerCase()));
      }
      if (query.isCod !== undefined) {
        items = items.filter((item) => item.isCodAvailable === query.isCod);
      }
      if (query.isNego !== undefined) {
        items = items.filter((item) => item.isNegotiable === query.isNego);
      }

      if (query.sortBy === 'price_asc') {
        items.sort((a, b) => a.price - b.price);
      } else if (query.sortBy === 'price_desc') {
        items.sort((a, b) => b.price - a.price);
      } else {
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const total = items.length;
      const limit = query.limit || 20;
      let paginatedItems: Listing[] = [];
      let nextCursor: string | null = null;
      let hasMore = false;
      const page = query.page || 1;

      if (query.cursor) {
        const cursorIndex = items.findIndex((i) => i.id === query.cursor);
        const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
        paginatedItems = items.slice(startIndex, startIndex + limit);
        const lastItem = paginatedItems[paginatedItems.length - 1];
        nextCursor = startIndex + limit < total && lastItem ? lastItem.id : null;
        hasMore = startIndex + limit < total;
      } else {
        const offset = (page - 1) * limit;
        paginatedItems = items.slice(offset, offset + limit);
        const lastItem = paginatedItems[paginatedItems.length - 1];
        nextCursor = offset + limit < total && lastItem ? lastItem.id : null;
        hasMore = offset + limit < total;
      }

      const totalPages = Math.ceil(total / limit);

      return c.json({
        success: true,
        data: {
          items: paginatedItems,
          pagination: { page, limit, total, totalPages, hasMore, nextCursor }
        }
      });
    } catch (err: unknown) {
      console.error('Listings GET Route Error:', err);
      return c.json({ success: true, data: { items: memoryStore.listings.slice(0, 20), pagination: { page: 1, limit: 20, total: memoryStore.listings.length, totalPages: 1, hasMore: false, nextCursor: null } } });
    }
  })

  .get('/featured', async (c) => {
    try {
      const db = getDb(c.env.DB);
      if (db) {
        const featured = await db.query.listings.findMany({
          with: { images: true, seller: true, category: true },
          limit: 8,
          orderBy: [desc(schema.listings.viewCount)]
        });

        const formatted: Listing[] = featured.map((l) => ({
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
          completeness: safeJsonParse<Completeness[]>(l.completeness, ['UNIT_ONLY']),
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
          specs: safeJsonParse<Record<string, string | number | boolean> | null>(l.specs, null),
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

        return c.json({ success: true, data: formatted });
      }

      const featured = memoryStore.listings.slice(0, 8);
      return c.json({ success: true, data: featured });
    } catch (err: unknown) {
      console.error('Listings /featured Error:', err);
      return c.json({ success: true, data: memoryStore.listings.slice(0, 8) });
    }
  })

  .get('/my', authMiddleware, async (c) => {
    try {
      const user = c.get('user')!;
      const db = getDb(c.env.DB);

      if (db) {
        const myListings = await db.query.listings.findMany({
          where: eq(schema.listings.sellerId, user.id),
          with: { images: true, category: true },
          orderBy: [desc(schema.listings.createdAt)]
        });

        const formatted: Listing[] = myListings.map((l) => ({
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
          completeness: safeJsonParse<Completeness[]>(l.completeness, ['UNIT_ONLY']),
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
          specs: safeJsonParse<Record<string, string | number | boolean> | null>(l.specs, null),
          images: (l.images || []).map((img) => ({
            id: img.id,
            listingId: img.listingId,
            url: img.url,
            isPrimary: Boolean(img.isPrimary),
            sortOrder: img.sortOrder
          })),
          seller: user,
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

        return c.json({ success: true, data: formatted });
      }

      const myListings = memoryStore.listings.filter(
        (item) => item.sellerId === user.id || item.seller?.id === user.id
      );
      return c.json({ success: true, data: myListings });
    } catch (err: unknown) {
      console.error('Listings /my Error:', err);
      const user = c.get('user');
      const myListings = user ? memoryStore.listings.filter((item) => item.sellerId === user.id) : [];
      return c.json({ success: true, data: myListings });
    }
  })

  .put('/:id/status', authMiddleware, async (c) => {
    const user = c.get('user')!;
    const id = c.req.param('id');
    const body = (await c.req.json().catch(() => ({}))) as { status?: string };
    const status = body.status;

    if (!status || !['DRAFT', 'ACTIVE', 'IN_NEGO', 'RESERVED', 'SOLD', 'ARCHIVED'].includes(status)) {
      return c.json(
        { success: false, error: { code: 'INVALID_STATUS', message: 'Status iklan tidak valid' } },
        400
      );
    }

    const db = getDb(c.env.DB);

    if (db) {
      const existing = await db.query.listings.findFirst({
        where: eq(schema.listings.id, id)
      });

      if (!existing) {
        return c.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Iklan tidak ditemukan' } },
          404
        );
      }

      if (existing.sellerId !== user.id && user.role !== 'ADMIN') {
        return c.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Anda bukan pemilik iklan ini' } },
          403
        );
      }

      await db
        .update(schema.listings)
        .set({
          status: status as ListingStatus,
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.listings.id, id));

      return c.json({ success: true, message: 'Status iklan berhasil diperbarui' });
    }

    // Memory store fallback with ownership check
    const listing = memoryStore.listings.find((l) => l.id === id);
    if (!listing) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Iklan tidak ditemukan' } },
        404
      );
    }

    if (listing.sellerId !== user.id && user.role !== 'ADMIN') {
      return c.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Anda bukan pemilik iklan ini' } },
        403
      );
    }

    listing.status = status as ListingStatus;
    listing.updatedAt = new Date().toISOString();

    return c.json({ success: true, message: 'Status iklan berhasil diperbarui' });
  })

  .put(
    '/:id',
    authMiddleware,
    zValidator('json', updateListingSchema),
    async (c) => {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const payload = c.req.valid('json');
      const db = getDb(c.env.DB);

      if (db) {
        const existing = await db.query.listings.findFirst({
          where: eq(schema.listings.id, id)
        });

        if (!existing) {
          return c.json(
            { success: false, error: { code: 'NOT_FOUND', message: 'Iklan tidak ditemukan' } },
            404
          );
        }

        if (existing.sellerId !== user.id && user.role !== 'ADMIN') {
          return c.json(
            {
              success: false,
              error: { code: 'FORBIDDEN', message: 'Anda bukan pemilik iklan ini' }
            },
            403
          );
        }

        await db
          .update(schema.listings)
          .set({
            ...(payload.title ? { title: payload.title } : {}),
            ...(payload.description ? { description: payload.description } : {}),
            ...(payload.categoryId ? { categoryId: payload.categoryId } : {}),
            ...(payload.price !== undefined ? { price: payload.price } : {}),
            ...(payload.originalPrice !== undefined ? { originalPrice: payload.originalPrice } : {}),
            ...(payload.isNegotiable !== undefined ? { isNegotiable: payload.isNegotiable } : {}),
            ...(payload.minOfferPrice !== undefined ? { minOfferPrice: payload.minOfferPrice } : {}),
            ...(payload.condition ? { condition: payload.condition } : {}),
            ...(payload.completeness ? { completeness: JSON.stringify(payload.completeness) } : {}),
            ...(payload.purchaseYear !== undefined ? { purchaseYear: payload.purchaseYear } : {}),
            ...(payload.warrantyUntil !== undefined ? { warrantyUntil: payload.warrantyUntil } : {}),
            ...(payload.hasOriginalReceipt !== undefined
              ? { hasOriginalReceipt: payload.hasOriginalReceipt }
              : {}),
            ...(payload.province ? { province: payload.province } : {}),
            ...(payload.city ? { city: payload.city } : {}),
            ...(payload.district ? { district: payload.district } : {}),
            ...(payload.isCodAvailable !== undefined
              ? { isCodAvailable: payload.isCodAvailable }
              : {}),
            ...(payload.codMeetingPoint !== undefined
              ? { codMeetingPoint: payload.codMeetingPoint }
              : {}),
            ...(payload.specs ? { specs: JSON.stringify(payload.specs) } : {}),
            updatedAt: new Date().toISOString()
          })
          .where(eq(schema.listings.id, id));

        if (payload.imageUrls && payload.imageUrls.length > 0) {
          await db.delete(schema.listingImages).where(eq(schema.listingImages.listingId, id));
          await db.insert(schema.listingImages).values(
            payload.imageUrls.map((url: string, idx: number) => ({
              id: `img-${Date.now()}-${idx}`,
              listingId: id,
              url,
              isPrimary: idx === 0,
              sortOrder: idx + 1,
              createdAt: new Date().toISOString()
            }))
          );
        }

        const updated = await db.query.listings.findFirst({
          where: eq(schema.listings.id, id),
          with: { images: true, seller: true, category: true }
        });

        return c.json({ success: true, message: 'Iklan berhasil diperbarui!', data: updated });
      }

      // Memory store fallback with ownership check
      const listing = memoryStore.listings.find((l) => l.id === id);
      if (!listing) {
        return c.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Iklan tidak ditemukan' } },
          404
        );
      }

      if (listing.sellerId !== user.id && user.role !== 'ADMIN') {
        return c.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Anda bukan pemilik iklan ini' } },
          403
        );
      }

      if (payload.title) listing.title = payload.title;
      if (payload.description) listing.description = payload.description;
      if (payload.categoryId) listing.categoryId = payload.categoryId;
      if (payload.price !== undefined) listing.price = payload.price;
      if (payload.originalPrice !== undefined) listing.originalPrice = payload.originalPrice;
      if (payload.isNegotiable !== undefined) listing.isNegotiable = payload.isNegotiable;
      if (payload.minOfferPrice !== undefined) listing.minOfferPrice = payload.minOfferPrice;
      if (payload.condition) listing.condition = payload.condition;
      if (payload.completeness) listing.completeness = payload.completeness;
      if (payload.purchaseYear !== undefined) listing.purchaseYear = payload.purchaseYear;
      if (payload.hasOriginalReceipt !== undefined)
        listing.hasOriginalReceipt = payload.hasOriginalReceipt;
      if (payload.province) listing.province = payload.province;
      if (payload.city) listing.city = payload.city;
      if (payload.district) listing.district = payload.district;
      if (payload.isCodAvailable !== undefined) listing.isCodAvailable = payload.isCodAvailable;
      if (payload.codMeetingPoint !== undefined) listing.codMeetingPoint = payload.codMeetingPoint;
      if (payload.specs) listing.specs = payload.specs;
      if (payload.imageUrls && payload.imageUrls.length > 0) {
        listing.images = payload.imageUrls.map((url, idx) => ({
          id: `img-${Date.now()}-${idx}`,
          listingId: id,
          url,
          isPrimary: idx === 0,
          sortOrder: idx + 1
        }));
      }
      listing.updatedAt = new Date().toISOString();

      return c.json({ success: true, message: 'Iklan berhasil diperbarui!', data: listing });
    }
  )

  .delete('/:id', authMiddleware, async (c) => {
    const user = c.get('user')!;
    const id = c.req.param('id');
    const db = getDb(c.env.DB);

    if (db) {
      const existing = await db.query.listings.findFirst({
        where: eq(schema.listings.id, id)
      });

      if (!existing) {
        return c.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Iklan tidak ditemukan' } },
          404
        );
      }

      if (existing.sellerId !== user.id && user.role !== 'ADMIN') {
        return c.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Anda bukan pemilik iklan ini' } },
          403
        );
      }

      await db.delete(schema.listings).where(eq(schema.listings.id, id));
      return c.json({ success: true, message: 'Iklan berhasil dihapus' });
    }

    // Memory store fallback with ownership check
    const idx = memoryStore.listings.findIndex((l) => l.id === id);
    if (idx === -1) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Iklan tidak ditemukan' } },
        404
      );
    }

    const listing = memoryStore.listings[idx];
    if (listing && listing.sellerId !== user.id && user.role !== 'ADMIN') {
      return c.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Anda bukan pemilik iklan ini' } },
        403
      );
    }

    memoryStore.listings.splice(idx, 1);
    return c.json({ success: true, message: 'Iklan berhasil dihapus' });
  })

  .get('/:idOrSlug', async (c) => {
    try {
      const idOrSlug = c.req.param('idOrSlug');
      const db = getDb(c.env.DB);

      if (db) {
        const listingDb = await db.query.listings.findFirst({
          where: or(eq(schema.listings.id, idOrSlug), eq(schema.listings.slug, idOrSlug)),
          with: { images: true, seller: true, category: true }
        });

        if (!listingDb) {
          return c.json(
            { success: false, error: { code: 'NOT_FOUND', message: 'Barang tidak ditemukan' } },
            404
          );
        }

        const listing: Listing = {
          id: listingDb.id,
          sellerId: listingDb.sellerId,
          categoryId: listingDb.categoryId,
          title: listingDb.title,
          slug: listingDb.slug,
          description: listingDb.description,
          price: listingDb.price,
          originalPrice: listingDb.originalPrice,
          isNegotiable: Boolean(listingDb.isNegotiable),
          minOfferPrice: listingDb.minOfferPrice,
          condition: listingDb.condition as ListingCondition,
          completeness: safeJsonParse<Completeness[]>(listingDb.completeness, ['UNIT_ONLY']),
          purchaseYear: listingDb.purchaseYear,
          warrantyUntil: listingDb.warrantyUntil,
          hasOriginalReceipt: Boolean(listingDb.hasOriginalReceipt),
          status: listingDb.status,
          viewCount: listingDb.viewCount,
          offerCount: listingDb.offerCount,
          favoriteCount: listingDb.favoriteCount,
          province: listingDb.province,
          city: listingDb.city,
          district: listingDb.district,
          postalCode: listingDb.postalCode,
          isCodAvailable: Boolean(listingDb.isCodAvailable),
          codMeetingPoint: listingDb.codMeetingPoint,
          specs: safeJsonParse<Record<string, string | number | boolean> | null>(listingDb.specs, null),
          images: (listingDb.images || []).map((img) => ({
            id: img.id,
            listingId: img.listingId,
            url: img.url,
            isPrimary: Boolean(img.isPrimary),
            sortOrder: img.sortOrder
          })),
          seller: listingDb.seller
            ? {
                id: listingDb.seller.id,
                name: listingDb.seller.name,
                email: listingDb.seller.email,
                phone: listingDb.seller.phone,
                avatarUrl: listingDb.seller.avatarUrl,
                role: listingDb.seller.role,
                isKycVerified: Boolean(listingDb.seller.isKycVerified),
                isPhoneVerified: Boolean(listingDb.seller.isPhoneVerified),
                trustScore: listingDb.seller.trustScore,
                totalTransactions: listingDb.seller.totalTransactions,
                ratingAverage: listingDb.seller.ratingAverage,
                ratingCount: listingDb.seller.ratingCount,
                city: listingDb.seller.city,
                province: listingDb.seller.province,
                bio: listingDb.seller.bio,
                createdAt: listingDb.seller.createdAt
              }
            : undefined,
          category: listingDb.category
            ? {
                id: listingDb.category.id,
                name: listingDb.category.name,
                slug: listingDb.category.slug,
                icon: listingDb.category.icon,
                sortOrder: listingDb.category.sortOrder
              }
            : undefined,
          createdAt: listingDb.createdAt,
          updatedAt: listingDb.updatedAt
        };

        return c.json({ success: true, data: listing });
      }

      const listing = memoryStore.listings.find(
        (item) => item.slug === idOrSlug || item.id === idOrSlug
      );
      if (!listing) {
        return c.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Barang tidak ditemukan' } },
          404
        );
      }

      return c.json({ success: true, data: listing });
    } catch (err: unknown) {
      console.error('Listings /:idOrSlug Error:', err);
      const idOrSlug = c.req.param('idOrSlug');
      const listing = memoryStore.listings.find((item) => item.slug === idOrSlug || item.id === idOrSlug);
      if (listing) {
        return c.json({ success: true, data: listing });
      }
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Barang tidak ditemukan' } }, 404);
    }
  })

  .post('/:idOrSlug/view', async (c) => {
    const idOrSlug = c.req.param('idOrSlug');
    const db = getDb(c.env.DB);

    if (db) {
      try {
        await db
          .update(schema.listings)
          .set({ viewCount: sql`${schema.listings.viewCount} + 1` })
          .where(or(eq(schema.listings.id, idOrSlug), eq(schema.listings.slug, idOrSlug)));
      } catch (err: unknown) {
        console.error('Failed to increment viewCount:', err);
      }
      return c.json({ success: true });
    }

    const listing = memoryStore.listings.find(
      (item) => item.slug === idOrSlug || item.id === idOrSlug
    );
    if (listing) {
      listing.viewCount = (listing.viewCount || 0) + 1;
    }
    return c.json({ success: true });
  })

  .post(
    '/',
    authMiddleware,
    zValidator('json', createListingSchema),
    async (c) => {
      const user = c.get('user')!;
      const payload = c.req.valid('json');
      const db = getDb(c.env.DB);

      const slug = `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString().slice(-4)}`;
      const listingId = `item-${Date.now()}`;
      const now = new Date().toISOString();

      if (db) {
        await db.insert(schema.listings).values({
          id: listingId,
          sellerId: user.id,
          categoryId: payload.categoryId,
          title: payload.title,
          slug,
          description: payload.description,
          price: payload.price,
          originalPrice: payload.originalPrice || null,
          isNegotiable: payload.isNegotiable,
          minOfferPrice: payload.minOfferPrice || null,
          condition: payload.condition,
          completeness: JSON.stringify(payload.completeness),
          purchaseYear: payload.purchaseYear || null,
          warrantyUntil: payload.warrantyUntil || null,
          hasOriginalReceipt: payload.hasOriginalReceipt,
          status: 'ACTIVE',
          viewCount: 0,
          offerCount: 0,
          favoriteCount: 0,
          province: payload.province,
          city: payload.city,
          district: payload.district,
          postalCode: payload.postalCode || null,
          isCodAvailable: payload.isCodAvailable,
          codMeetingPoint: payload.codMeetingPoint || null,
          specs: payload.specs ? JSON.stringify(payload.specs) : null,
          createdAt: now,
          updatedAt: now
        });

        if (payload.imageUrls && payload.imageUrls.length > 0) {
          await db.insert(schema.listingImages).values(
            payload.imageUrls.map((url: string, idx: number) => ({
              id: `img-${Date.now()}-${idx}`,
              listingId,
              url,
              isPrimary: idx === 0,
              sortOrder: idx + 1,
              createdAt: now
            }))
          );
        }

        const created = await db.query.listings.findFirst({
          where: eq(schema.listings.id, listingId),
          with: { images: true, seller: true, category: true }
        });

        return c.json(
          {
            success: true,
            message: 'Barang berhasil dipasang untuk dijual!',
            data: created
          },
          201
        );
      }

      // Memory Store Fallback
      const newListing: Listing = {
        id: listingId,
        sellerId: user.id,
        categoryId: payload.categoryId,
        title: payload.title,
        slug,
        description: payload.description,
        price: payload.price,
        originalPrice: payload.originalPrice || null,
        isNegotiable: payload.isNegotiable,
        minOfferPrice: payload.minOfferPrice || null,
        condition: payload.condition,
        completeness: payload.completeness,
        purchaseYear: payload.purchaseYear || null,
        warrantyUntil: payload.warrantyUntil || null,
        hasOriginalReceipt: payload.hasOriginalReceipt,
        status: 'ACTIVE',
        viewCount: 0,
        offerCount: 0,
        favoriteCount: 0,
        province: payload.province,
        city: payload.city,
        district: payload.district,
        postalCode: payload.postalCode || null,
        isCodAvailable: payload.isCodAvailable,
        codMeetingPoint: payload.codMeetingPoint || null,
        specs: payload.specs || null,
        images:
          payload.imageUrls?.map((url: string, idx: number) => ({
            id: `img-${Date.now()}-${idx}`,
            listingId,
            url,
            isPrimary: idx === 0,
            sortOrder: idx + 1
          })) || [],
        seller: user,
        createdAt: now,
        updatedAt: now
      };

      memoryStore.listings.unshift(newListing);

      return c.json(
        {
          success: true,
          message: 'Barang berhasil dipasang untuk dijual!',
          data: newListing
        },
        201
      );
    }
  );
