import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { makeOfferSchema, respondOfferSchema } from '@jbb/validators';
import type { AppEnv } from '../types/env';
import { memoryStore } from '../services/store';
import { authMiddleware } from '../middlewares/auth';
import type { Offer } from '@jbb/types';

export const offerRoutes = new Hono<AppEnv>()
  .use('*', authMiddleware)

  .post('/', zValidator('json', makeOfferSchema), async (c) => {
    const user = c.get('user')!;
    const { listingId, offeredPrice, message } = c.req.valid('json');

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
    const offers = memoryStore.offers
      .filter((o) => o.sellerId === user.id)
      .map((o) => ({
        ...o,
        listing: memoryStore.listings.find((l) => l.id === o.listingId),
        buyer: memoryStore.findUserById(o.buyerId)
      }));

    return c.json({
      success: true,
      data: offers
    });
  })

  .get('/sent', async (c) => {
    const user = c.get('user')!;
    const offers = memoryStore.offers
      .filter((o) => o.buyerId === user.id)
      .map((o) => ({
        ...o,
        listing: memoryStore.listings.find((l) => l.id === o.listingId),
        seller: memoryStore.findUserById(o.sellerId)
      }));

    return c.json({
      success: true,
      data: offers
    });
  })

  .post('/:id/respond', zValidator('json', respondOfferSchema), async (c) => {
    const user = c.get('user')!;
    const offerId = c.req.param('id');
    const { action, counterPrice, counterMessage } = c.req.valid('json');

    const offer = memoryStore.offers.find((o) => o.id === offerId);
    if (!offer) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Tawaran tidak ditemukan' } }, 404);
    }

    if (offer.sellerId !== user.id && offer.buyerId !== user.id) {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Akses ditolak' } }, 403);
    }

    if (action === 'ACCEPT') {
      offer.status = 'ACCEPTED';
    } else if (action === 'REJECT') {
      offer.status = 'REJECTED';
    } else if (action === 'COUNTER') {
      if (!counterPrice) {
        return c.json({ success: false, error: { code: 'INVALID_INPUT', message: 'Harga counter wajib diisi' } }, 400);
      }
      offer.status = 'COUNTERED';
      offer.counterPrice = counterPrice;
      offer.counterMessage = counterMessage || null;
    }

    offer.updatedAt = new Date().toISOString();

    return c.json({
      success: true,
      message: `Tawaran berhasil di-${action.toLowerCase()}`,
      data: offer
    });
  });
