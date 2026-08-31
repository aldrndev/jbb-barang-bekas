import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, desc, asc, and, gte, lte, or, sql } from 'drizzle-orm';
import { createListingSchema, listingQuerySchema } from '@jbb/validators';
import type { AppEnv } from '../types/env';
import { getDb, schema } from '../db';
import { memoryStore } from '../services/store';
import { authMiddleware } from '../middlewares/auth';
import type { Listing } from '@jbb/types';

export const listingRoutes = new Hono<AppEnv>()
  .get('/', zValidator('query', listingQuerySchema), async (c) => {
    const query = c.req.valid('query');
    const db = getDb(c.env.DB);

    if (db) {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const offset = (page - 1) * limit;

      // Fetch all listings with images, seller, category
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

      let items: Listing[] = dbListings.map((l: any) => ({
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

      // Apply in-memory filters for flexibility
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
      const totalPages = Math.ceil(total / limit);
      const paginated = items.slice(offset, offset + limit);

      return c.json({
        success: true,
        data: {
          items: paginated,
          pagination: { page, limit, total, totalPages, hasMore: page < totalPages }
        }
      });
    }

    // Memory Store fallback
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
        (cat) => cat.slug === query.category || cat.id === query.category
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

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedItems = items.slice((page - 1) * limit, page * limit);

    return c.json({
      success: true,
      data: {
        items: paginatedItems,
        pagination: { page, limit, total, totalPages, hasMore: page < totalPages }
      }
    });
  })

  .get('/featured', async (c) => {
    const db = getDb(c.env.DB);
    if (db) {
      const featured = await db.query.listings.findMany({
        with: { images: true, seller: true, category: true },
        limit: 8,
        orderBy: [desc(schema.listings.viewCount)]
      });

      const formatted = featured.map((l: any) => ({
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

      return c.json({ success: true, data: formatted });
    }

    const featured = memoryStore.listings.slice(0, 8);
    return c.json({ success: true, data: featured });
  })

  .get('/:idOrSlug', async (c) => {
    const idOrSlug = c.req.param('idOrSlug');
    const db = getDb(c.env.DB);

    if (db) {
      const listingDb = await db.query.listings.findFirst({
        where: or(eq(schema.listings.id, idOrSlug), eq(schema.listings.slug, idOrSlug)),
        with: { images: true, seller: true, category: true }
      });

      if (!listingDb) {
        return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Barang tidak ditemukan' } }, 404);
      }

      const listing: Listing = {
        ...(listingDb as any),
        isNegotiable: Boolean(listingDb.isNegotiable),
        hasOriginalReceipt: Boolean(listingDb.hasOriginalReceipt),
        isCodAvailable: Boolean(listingDb.isCodAvailable),
        completeness: typeof listingDb.completeness === 'string' ? JSON.parse(listingDb.completeness) : listingDb.completeness,
        specs: listingDb.specs ? (typeof listingDb.specs === 'string' ? JSON.parse(listingDb.specs) : listingDb.specs) : null,
        images: listingDb.images || [],
        seller: listingDb.seller
          ? {
              ...listingDb.seller,
              isKycVerified: Boolean(listingDb.seller.isKycVerified),
              isPhoneVerified: Boolean(listingDb.seller.isPhoneVerified)
            } as any
          : undefined,
        category: listingDb.category as any
      };

      return c.json({ success: true, data: listing });
    }

    const listing = memoryStore.listings.find((item) => item.slug === idOrSlug || item.id === idOrSlug);
    if (!listing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Barang tidak ditemukan' } }, 404);
    }

    return c.json({ success: true, data: listing });
  })

  .post('/', authMiddleware, zValidator('json', createListingSchema), async (c) => {
    const user = c.get('user')!;
    const payload = c.req.valid('json');
    const db = getDb(c.env.DB);

    const slug = `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString().slice(-4)}`;
    const listingId = `item-${Date.now()}`;

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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      if (payload.imageUrls && payload.imageUrls.length > 0) {
        await db.insert(schema.listingImages).values(
          payload.imageUrls.map((url: string, idx: number) => ({
            id: `img-${Date.now()}-${idx}`,
            listingId,
            url,
            isPrimary: idx === 0,
            sortOrder: idx + 1,
            createdAt: new Date().toISOString()
          }))
        );
      }

      const created = await db.query.listings.findFirst({
        where: eq(schema.listings.id, listingId),
        with: { images: true, seller: true, category: true }
      });

      return c.json({
        success: true,
        message: 'Barang berhasil dipasang untuk dijual!',
        data: created
      }, 201);
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
      images: payload.imageUrls?.map((url: string, idx: number) => ({
        id: `img-${Date.now()}-${idx}`,
        listingId,
        url,
        isPrimary: idx === 0,
        sortOrder: idx + 1
      })) || [],
      seller: user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memoryStore.listings.unshift(newListing);

    return c.json({
      success: true,
      message: 'Barang berhasil dipasang untuk dijual!',
      data: newListing
    }, 201);
  });
