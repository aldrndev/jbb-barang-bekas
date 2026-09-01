import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, desc, asc, and, gte, lte, or, sql } from 'drizzle-orm';
import { createListingSchema, updateListingSchema, listingQuerySchema } from '@jbb/validators';
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

  .get('/my', authMiddleware, async (c) => {
    const user = c.get('user')!;
    const db = getDb(c.env.DB);

    if (db) {
      const myListings = await db.query.listings.findMany({
        where: eq(schema.listings.sellerId, user.id),
        with: { images: true, category: true },
        orderBy: [desc(schema.listings.createdAt)]
      });

      const formatted: Listing[] = myListings.map((l: any) => ({
        ...l,
        isNegotiable: Boolean(l.isNegotiable),
        hasOriginalReceipt: Boolean(l.hasOriginalReceipt),
        isCodAvailable: Boolean(l.isCodAvailable),
        completeness: typeof l.completeness === 'string' ? JSON.parse(l.completeness) : l.completeness,
        specs: l.specs ? (typeof l.specs === 'string' ? JSON.parse(l.specs) : l.specs) : null,
        images: l.images || [],
        seller: user,
        category: l.category
      }));

      return c.json({ success: true, data: formatted });
    }

    const myListings = memoryStore.listings.filter((item) => item.sellerId === user.id || item.seller?.id === user.id);
    return c.json({ success: true, data: myListings });
  })

  .put('/:id/status', authMiddleware, async (c) => {
    const user = c.get('user')!;
    const id = c.req.param('id');
    const { status } = await c.req.json<{ status: string }>();
    const db = getDb(c.env.DB);

    if (db) {
      await db.update(schema.listings).set({
        status: status as any,
        updatedAt: new Date().toISOString()
      }).where(and(eq(schema.listings.id, id), eq(schema.listings.sellerId, user.id)));

      return c.json({ success: true, message: 'Status iklan berhasil diperbarui' });
    }

    const listing = memoryStore.listings.find((l) => l.id === id);
    if (listing) {
      listing.status = status as any;
      listing.updatedAt = new Date().toISOString();
    }
    return c.json({ success: true, message: 'Status iklan berhasil diperbarui' });
  })

  .put('/:id', authMiddleware, zValidator('json', updateListingSchema), async (c) => {
    const user = c.get('user')!;
    const id = c.req.param('id');
    const payload = c.req.valid('json');
    const db = getDb(c.env.DB);

    if (db) {
      const existing = await db.query.listings.findFirst({
        where: and(eq(schema.listings.id, id), eq(schema.listings.sellerId, user.id))
      });

      if (!existing) {
        return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Iklan tidak ditemukan atau Anda bukan pemilik iklan ini' } }, 404);
      }

      await db.update(schema.listings)
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
          ...(payload.hasOriginalReceipt !== undefined ? { hasOriginalReceipt: payload.hasOriginalReceipt } : {}),
          ...(payload.province ? { province: payload.province } : {}),
          ...(payload.city ? { city: payload.city } : {}),
          ...(payload.district ? { district: payload.district } : {}),
          ...(payload.isCodAvailable !== undefined ? { isCodAvailable: payload.isCodAvailable } : {}),
          ...(payload.codMeetingPoint !== undefined ? { codMeetingPoint: payload.codMeetingPoint } : {}),
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

    // Memory store fallback
    const listing = memoryStore.listings.find((l) => l.id === id);
    if (!listing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Iklan tidak ditemukan' } }, 404);
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
    if (payload.hasOriginalReceipt !== undefined) listing.hasOriginalReceipt = payload.hasOriginalReceipt;
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
  })

  .delete('/:id', authMiddleware, async (c) => {
    const user = c.get('user')!;
    const id = c.req.param('id');
    const db = getDb(c.env.DB);

    if (db) {
      await db.delete(schema.listings).where(
        and(eq(schema.listings.id, id), eq(schema.listings.sellerId, user.id))
      );
      return c.json({ success: true, message: 'Iklan berhasil dihapus' });
    }

    const idx = memoryStore.listings.findIndex((l) => l.id === id);
    if (idx !== -1) {
      memoryStore.listings.splice(idx, 1);
    }
    return c.json({ success: true, message: 'Iklan berhasil dihapus' });
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
