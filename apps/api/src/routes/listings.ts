import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createListingSchema, listingQuerySchema, updateListingSchema } from '@jbb/validators';
import type { AppEnv } from '../types/env';
import { memoryStore } from '../services/store';
import { authMiddleware } from '../middlewares/auth';
import type { Listing } from '@jbb/types';

export const listingRoutes = new Hono<AppEnv>()
  .get('/', zValidator('query', listingQuerySchema), async (c) => {
    const query = c.req.valid('query');
    let items = [...memoryStore.listings];

    // Filter by keyword
    if (query.q) {
      const qLower = query.q.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(qLower) ||
          item.description.toLowerCase().includes(qLower) ||
          item.city.toLowerCase().includes(qLower)
      );
    }

    // Filter by category slug or ID
    if (query.category && query.category !== 'all') {
      const cat = memoryStore.categories.find(
        (cat) => cat.slug === query.category || cat.id === query.category
      );
      if (cat) {
        items = items.filter((item) => item.categoryId === cat.id);
      }
    }

    // Filter by condition
    if (query.condition) {
      const conditions = Array.isArray(query.condition) ? query.condition : [query.condition];
      items = items.filter((item) => conditions.includes(item.condition));
    }

    // Filter by price range
    if (query.minPrice !== undefined) {
      items = items.filter((item) => item.price >= query.minPrice!);
    }
    if (query.maxPrice !== undefined) {
      items = items.filter((item) => item.price <= query.maxPrice!);
    }

    // Filter by city
    if (query.city) {
      items = items.filter((item) =>
        item.city.toLowerCase().includes(query.city!.toLowerCase())
      );
    }

    // Filter by COD availability
    if (query.isCod !== undefined) {
      items = items.filter((item) => item.isCodAvailable === query.isCod);
    }

    // Filter by Nego availability
    if (query.isNego !== undefined) {
      items = items.filter((item) => item.isNegotiable === query.isNego);
    }

    // Sorting
    if (query.sortBy === 'price_asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (query.sortBy === 'price_desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (query.sortBy === 'popular') {
      items.sort((a, b) => (b.viewCount + b.offerCount * 5) - (a.viewCount + a.offerCount * 5));
    } else {
      // Newest
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
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages
        }
      }
    });
  })

  .get('/featured', async (c) => {
    const featured = memoryStore.listings
      .filter((item) => item.status === 'ACTIVE')
      .slice(0, 6);

    return c.json({
      success: true,
      data: featured
    });
  })

  .get('/:idOrSlug', async (c) => {
    const idOrSlug = c.req.param('idOrSlug');
    const listing = memoryStore.getListingDetail(idOrSlug);

    if (!listing) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Barang bekas tidak ditemukan atau sudah terjual'
          }
        },
        404
      );
    }

    return c.json({
      success: true,
      data: listing
    });
  })

  .post('/:idOrSlug/view', async (c) => {
    const idOrSlug = c.req.param('idOrSlug');
    const listing = memoryStore.listings.find((l) => l.id === idOrSlug || l.slug === idOrSlug);
    if (listing) {
      listing.viewCount += 1;
    }
    return c.json({ success: true, data: { viewCount: listing?.viewCount ?? 0 } });
  })

  .post('/', authMiddleware, zValidator('json', createListingSchema), async (c) => {
    const user = c.get('user')!;
    const input = c.req.valid('json');

    const id = `item-${Date.now()}`;
    const slug = `${input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')}-${Date.now().toString().slice(-4)}`;

    const newListing: Listing = {
      id,
      sellerId: user.id,
      categoryId: input.categoryId,
      title: input.title,
      slug,
      description: input.description,
      price: input.price,
      originalPrice: input.originalPrice || null,
      isNegotiable: input.isNegotiable,
      minOfferPrice: input.minOfferPrice || null,
      condition: input.condition,
      completeness: input.completeness,
      purchaseYear: input.purchaseYear || null,
      warrantyUntil: input.warrantyUntil || null,
      hasOriginalReceipt: input.hasOriginalReceipt,
      status: 'ACTIVE',
      viewCount: 0,
      offerCount: 0,
      favoriteCount: 0,
      province: input.province,
      city: input.city,
      district: input.district,
      postalCode: input.postalCode || null,
      isCodAvailable: input.isCodAvailable,
      codMeetingPoint: input.codMeetingPoint || null,
      specs: input.specs || null,
      images: input.imageUrls.map((url, idx) => ({
        id: `img-${id}-${idx + 1}`,
        listingId: id,
        url,
        isPrimary: idx === 0,
        sortOrder: idx + 1
      })),
      seller: user,
      category: memoryStore.categories.find((cat) => cat.id === input.categoryId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memoryStore.addListing(newListing);

    return c.json(
      {
        success: true,
        message: 'Barang bekas berhasil di-listing!',
        data: newListing
      },
      201
    );
  })

  .put('/:id', authMiddleware, zValidator('json', updateListingSchema), async (c) => {
    const user = c.get('user')!;
    const id = c.req.param('id');
    const listing = memoryStore.listings.find((l) => l.id === id);

    if (!listing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing tidak ditemukan' } }, 404);
    }

    if (listing.sellerId !== user.id && user.role !== 'ADMIN') {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Bukan pemilik listing' } }, 403);
    }

    const updates = c.req.valid('json');
    Object.assign(listing, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return c.json({
      success: true,
      message: 'Listing berhasil diperbarui',
      data: listing
    });
  });
