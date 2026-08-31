import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, desc, sql } from 'drizzle-orm';
import { makeOfferSchema, respondOfferSchema } from '@jbb/validators';
import type { AppEnv } from '../types/env';
import { getDb, schema } from '../db';
import { memoryStore } from '../services/store';
import { authMiddleware } from '../middlewares/auth';
import type { Offer } from '@jbb/types';

export const offerRoutes = new Hono<AppEnv>()
  .use('*', authMiddleware)

  .post('/', zValidator('json', makeOfferSchema), async (c) => {
    const user = c.get('user')!;
    const { listingId, offeredPrice, message } = c.req.valid('json');
    const db = getDb(c.env.DB);

    if (db) {
      const listingDb = await db.query.listings.findFirst({
        where: eq(schema.listings.id, listingId),
        with: { seller: true }
      });

      if (!listingDb) {
        return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Barang tidak ditemukan' } }, 404);
      }

      if (listingDb.sellerId === user.id) {
        return c.json(
          { success: false, error: { code: 'INVALID_ACTION', message: 'Tidak bisa menawar barang milik sendiri' } },
          400
        );
      }

      if (!listingDb.isNegotiable) {
        return c.json(
          { success: false, error: { code: 'NOT_NEGOTIABLE', message: 'Penjual memasang harga pas (tidak nego)' } },
          400
        );
      }

      if (offeredPrice >= listingDb.price) {
        return c.json(
          {
            success: false,
            error: { code: 'INVALID_PRICE', message: 'Harga tawaran harus lebih rendah dari harga asli (atau gunakan Beli Langsung)' }
          },
          400
        );
      }

      if (listingDb.minOfferPrice && offeredPrice < listingDb.minOfferPrice) {
        return c.json(
          {
            success: false,
            error: {
              code: 'PRICE_TOO_LOW',
              message: `Tawaran terlalu rendah. Batas minimal penawaran penjual adalah Rp ${listingDb.minOfferPrice.toLocaleString('id-ID')}`
            }
          },
          400
        );
      }

      const offerId = `offer-${Date.now()}`;
      const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      const now = new Date().toISOString();

      await db.insert(schema.offers).values({
        id: offerId,
        listingId,
        buyerId: user.id,
        sellerId: listingDb.sellerId,
        offeredPrice,
        message: message || null,
        status: 'PENDING',
        expiresAt,
        createdAt: now,
        updatedAt: now
      });

      // Increment offerCount on listing
      await db
        .update(schema.listings)
        .set({ offerCount: sql`${schema.listings.offerCount} + 1` })
        .where(eq(schema.listings.id, listingId));

      const createdOffer = await db.query.offers.findFirst({
        where: eq(schema.offers.id, offerId),
        with: {
          listing: { with: { images: true } },
          buyer: true,
          seller: true
        }
      });

      return c.json(
        {
          success: true,
          message: 'Tawaran nego berhasil dikirim ke penjual!',
          data: createdOffer
        },
        201
      );
    }

    // Memory Store Fallback
    const listing = memoryStore.listings.find((l) => l.id === listingId);
    if (!listing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Barang tidak ditemukan' } }, 404);
    }

    if (listing.sellerId === user.id) {
      return c.json(
        { success: false, error: { code: 'INVALID_ACTION', message: 'Tidak bisa menawar barang milik sendiri' } },
        400
      );
    }

    if (!listing.isNegotiable) {
      return c.json(
        { success: false, error: { code: 'NOT_NEGOTIABLE', message: 'Penjual memasang harga pas (tidak nego)' } },
        400
      );
    }

    if (offeredPrice >= listing.price) {
      return c.json(
        {
          success: false,
          error: { code: 'INVALID_PRICE', message: 'Harga tawaran harus lebih rendah dari harga asli (atau gunakan Beli Langsung)' }
        },
        400
      );
    }

    if (listing.minOfferPrice && offeredPrice < listing.minOfferPrice) {
      return c.json(
        {
          success: false,
          error: {
            code: 'PRICE_TOO_LOW',
            message: `Tawaran terlalu rendah. Batas minimal penawaran penjual adalah Rp ${listing.minOfferPrice.toLocaleString('id-ID')}`
          }
        },
        400
      );
    }

    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      listingId,
      buyerId: user.id,
      sellerId: listing.sellerId,
      offeredPrice,
      message: message || null,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      listing,
      buyer: user,
      seller: memoryStore.findUserById(listing.sellerId)
    };

    memoryStore.offers.unshift(newOffer);
    listing.offerCount += 1;

    return c.json(
      {
        success: true,
        message: 'Tawaran nego berhasil dikirim ke penjual!',
        data: newOffer
      },
      201
    );
  })

  .get('/received', async (c) => {
    const user = c.get('user')!;
    const db = getDb(c.env.DB);

    if (db) {
      const offers = await db.query.offers.findMany({
        where: eq(schema.offers.sellerId, user.id),
        with: {
          listing: { with: { images: true } },
          buyer: true,
          seller: true
        },
        orderBy: [desc(schema.offers.createdAt)]
      });

      return c.json({ success: true, data: offers });
    }

    const offers = memoryStore.offers
      .filter((o) => o.sellerId === user.id)
      .map((o) => ({
        ...o,
        listing: memoryStore.listings.find((l) => l.id === o.listingId),
        buyer: memoryStore.findUserById(o.buyerId)
      }));

    return c.json({ success: true, data: offers });
  })

  .get('/sent', async (c) => {
    const user = c.get('user')!;
    const db = getDb(c.env.DB);

    if (db) {
      const offers = await db.query.offers.findMany({
        where: eq(schema.offers.buyerId, user.id),
        with: {
          listing: { with: { images: true } },
          buyer: true,
          seller: true
        },
        orderBy: [desc(schema.offers.createdAt)]
      });

      return c.json({ success: true, data: offers });
    }

    const offers = memoryStore.offers
      .filter((o) => o.buyerId === user.id)
      .map((o) => ({
        ...o,
        listing: memoryStore.listings.find((l) => l.id === o.listingId),
        seller: memoryStore.findUserById(o.sellerId)
      }));

    return c.json({ success: true, data: offers });
  })

  .post('/:id/respond', zValidator('json', respondOfferSchema), async (c) => {
    const user = c.get('user')!;
    const offerId = c.req.param('id');
    const { action, counterPrice, counterMessage } = c.req.valid('json');
    const db = getDb(c.env.DB);

    if (db) {
      const offer = await db.query.offers.findFirst({
        where: eq(schema.offers.id, offerId)
      });

      if (!offer) {
        return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Tawaran tidak ditemukan' } }, 404);
      }

      if (offer.sellerId !== user.id) {
        return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Hanya penjual yang bisa merespon tawaran' } }, 403);
      }

      let newStatus: any = 'PENDING';
      if (action === 'ACCEPT') newStatus = 'ACCEPTED';
      if (action === 'REJECT') newStatus = 'REJECTED';
      if (action === 'COUNTER') newStatus = 'COUNTERED';

      await db
        .update(schema.offers)
        .set({
          status: newStatus,
          counterPrice: counterPrice || null,
          counterMessage: counterMessage || null,
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.offers.id, offerId));

      const updated = await db.query.offers.findFirst({
        where: eq(schema.offers.id, offerId),
        with: { listing: true, buyer: true, seller: true }
      });

      return c.json({
        success: true,
        message: `Tawaran berhasil di-${action.toLowerCase()}`,
        data: updated
      });
    }

    // Memory Store Fallback
    const offer = memoryStore.offers.find((o) => o.id === offerId);
    if (!offer) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Tawaran tidak ditemukan' } }, 404);
    }

    if (offer.sellerId !== user.id) {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Hanya penjual yang bisa merespon tawaran' } }, 403);
    }

    if (action === 'ACCEPT') offer.status = 'ACCEPTED';
    if (action === 'REJECT') offer.status = 'REJECTED';
    if (action === 'COUNTER') {
      offer.status = 'COUNTERED';
      offer.counterPrice = counterPrice;
      offer.counterMessage = counterMessage;
    }
    offer.updatedAt = new Date().toISOString();

    return c.json({
      success: true,
      message: `Tawaran berhasil di-${action.toLowerCase()}`,
      data: offer
    });
  });
