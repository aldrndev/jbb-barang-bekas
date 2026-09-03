import { zValidator } from '@hono/zod-validator';
import type { Order } from '@jbb/types';
import { createOrderSchema, disputeOrderSchema, updateShippingSchema } from '@jbb/validators';
import { desc, eq, or } from 'drizzle-orm';
import { Hono } from 'hono';
import { getDb, schema } from '../db';
import { authMiddleware } from '../middlewares/auth';
import { memoryStore } from '../services/store';
import type { AppEnv } from '../types/env';

export const orderRoutes = new Hono<AppEnv>()
  .use('*', authMiddleware)

  .post('/', zValidator('json', createOrderSchema), async (c) => {
    const user = c.get('user')!;
    const {
      listingId,
      offerId,
      deliveryMethod,
      recipientName,
      recipientPhone,
      shippingAddress,
      courierName
    } = c.req.valid('json');
    const db = getDb(c.env.DB);
    const now = new Date().toISOString();

    if (db) {
      const listingDb = await db.query.listings.findFirst({
        where: eq(schema.listings.id, listingId)
      });

      if (!listingDb) {
        return c.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Barang tidak ditemukan' } },
          404
        );
      }

      if (listingDb.status !== 'ACTIVE') {
        return c.json(
          {
            success: false,
            error: {
              code: 'LISTING_NOT_ACTIVE',
              message: 'Barang sudah terjual atau tidak lagi aktif'
            }
          },
          400
        );
      }

      if (listingDb.sellerId === user.id) {
        return c.json(
          {
            success: false,
            error: { code: 'INVALID_ACTION', message: 'Tidak bisa membeli barang sendiri' }
          },
          400
        );
      }

      if (deliveryMethod === 'COD_KETEMUAN' && !listingDb.isCodAvailable) {
        return c.json(
          {
            success: false,
            error: {
              code: 'COD_UNAVAILABLE',
              message: 'Penjual tidak melayani metode transaksi COD'
            }
          },
          400
        );
      }

      let finalPrice = listingDb.price;
      let appliedOfferId = offerId || null;

      if (offerId) {
        const offer = await db.query.offers.findFirst({
          where: eq(schema.offers.id, offerId)
        });
        if (offer && offer.buyerId === user.id && offer.status === 'ACCEPTED') {
          finalPrice = offer.counterPrice || offer.offeredPrice;
          await db
            .update(schema.offers)
            .set({ status: 'COMPLETED' })
            .where(eq(schema.offers.id, offerId));
        }
      } else {
        const activeAcceptedOffer = await db.query.offers.findFirst({
          where: eq(schema.offers.listingId, listingId)
        });
        if (
          activeAcceptedOffer &&
          activeAcceptedOffer.buyerId === user.id &&
          activeAcceptedOffer.status === 'ACCEPTED'
        ) {
          finalPrice = activeAcceptedOffer.counterPrice || activeAcceptedOffer.offeredPrice;
          appliedOfferId = activeAcceptedOffer.id;
          await db
            .update(schema.offers)
            .set({ status: 'COMPLETED' })
            .where(eq(schema.offers.id, activeAcceptedOffer.id));
        }
      }

      const shippingFee = deliveryMethod === 'COD_KETEMUAN' ? 0 : 25000;
      const serviceFee = Math.round(finalPrice * 0.01);
      const totalAmount = finalPrice + shippingFee + serviceFee;

      const orderId = `ord-${Date.now()}`;
      const orderNumber = `JBB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;

      await db.insert(schema.orders).values({
        id: orderId,
        orderNumber,
        listingId,
        buyerId: user.id,
        sellerId: listingDb.sellerId,
        offerId: appliedOfferId,
        amount: finalPrice,
        shippingFee,
        serviceFee,
        totalAmount,
        deliveryMethod,
        escrowStatus: 'PAYMENT_CONFIRMED',
        recipientName,
        recipientPhone,
        shippingAddress,
        courierName:
          courierName || (deliveryMethod === 'COD_KETEMUAN' ? 'COD Langsung' : 'JNE Reguler'),
        createdAt: now,
        updatedAt: now
      });

      await db
        .update(schema.listings)
        .set({ status: 'RESERVED' })
        .where(eq(schema.listings.id, listingId));

      const createdOrder = await db.query.orders.findFirst({
        where: eq(schema.orders.id, orderId),
        with: {
          listing: { with: { images: true } },
          buyer: true,
          seller: true
        }
      });

      return c.json(
        {
          success: true,
          message: 'Pesanan berhasil dibuat! Pembayaran Anda aman terlindungi garansi 48 jam.',
          data: createdOrder
        },
        201
      );
    }

    // Memory Store Fallback
    const listing = memoryStore.listings.find((l) => l.id === listingId);
    if (!listing) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Barang tidak ditemukan' } },
        404
      );
    }

    if (listing.status !== 'ACTIVE') {
      return c.json(
        {
          success: false,
          error: {
            code: 'LISTING_NOT_ACTIVE',
            message: 'Barang sudah terjual atau tidak lagi aktif'
          }
        },
        400
      );
    }

    if (listing.sellerId === user.id) {
      return c.json(
        {
          success: false,
          error: { code: 'INVALID_ACTION', message: 'Tidak bisa membeli barang sendiri' }
        },
        400
      );
    }

    if (deliveryMethod === 'COD_KETEMUAN' && !listing.isCodAvailable) {
      return c.json(
        {
          success: false,
          error: { code: 'COD_UNAVAILABLE', message: 'Penjual tidak melayani metode transaksi COD' }
        },
        400
      );
    }

    let finalPrice = listing.price;
    let appliedOfferId = offerId || null;

    if (offerId) {
      const offer = memoryStore.offers.find((o) => o.id === offerId && o.buyerId === user.id);
      if (offer && offer.status === 'ACCEPTED') {
        finalPrice = offer.counterPrice || offer.offeredPrice;
        offer.status = 'COMPLETED';
      }
    } else {
      const activeAcceptedOffer = memoryStore.offers.find(
        (o) => o.listingId === listingId && o.buyerId === user.id && o.status === 'ACCEPTED'
      );
      if (activeAcceptedOffer) {
        finalPrice = activeAcceptedOffer.counterPrice || activeAcceptedOffer.offeredPrice;
        appliedOfferId = activeAcceptedOffer.id;
        activeAcceptedOffer.status = 'COMPLETED';
      }
    }

    const shippingFee = deliveryMethod === 'COD_KETEMUAN' ? 0 : 25000;
    const serviceFee = Math.round(finalPrice * 0.01);
    const totalAmount = finalPrice + shippingFee + serviceFee;

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `JBB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      listingId,
      buyerId: user.id,
      sellerId: listing.sellerId,
      offerId: appliedOfferId,
      amount: finalPrice,
      shippingFee,
      serviceFee,
      totalAmount,
      deliveryMethod,
      escrowStatus: 'PAYMENT_CONFIRMED',
      recipientName,
      recipientPhone,
      shippingAddress,
      courierName:
        courierName || (deliveryMethod === 'COD_KETEMUAN' ? 'COD Langsung' : 'Kurir Rekomendasi'),
      createdAt: now,
      updatedAt: now,
      listing,
      buyer: user,
      seller: memoryStore.findUserById(listing.sellerId)
    };

    memoryStore.orders.unshift(newOrder);
    listing.status = 'RESERVED';

    return c.json(
      {
        success: true,
        message: 'Pesanan berhasil dibuat! Pembayaran Anda aman terlindungi garansi 48 jam.',
        data: newOrder
      },
      201
    );
  })

  .get('/', async (c) => {
    const user = c.get('user')!;
    const db = getDb(c.env.DB);

    if (db) {
      const orders = await db.query.orders.findMany({
        where: or(eq(schema.orders.buyerId, user.id), eq(schema.orders.sellerId, user.id)),
        with: {
          listing: { with: { images: true } },
          buyer: true,
          seller: true
        },
        orderBy: [desc(schema.orders.createdAt)]
      });

      return c.json({ success: true, data: orders });
    }

    const userOrders = memoryStore.orders
      .filter((o) => o.buyerId === user.id || o.sellerId === user.id)
      .map((o) => ({
        ...o,
        listing: memoryStore.listings.find((l) => l.id === o.listingId),
        buyer: memoryStore.findUserById(o.buyerId),
        seller: memoryStore.findUserById(o.sellerId)
      }));

    return c.json({ success: true, data: userOrders });
  })

  .get('/:id', async (c) => {
    const user = c.get('user')!;
    const orderId = c.req.param('id');
    const db = getDb(c.env.DB);

    if (db) {
      const order = await db.query.orders.findFirst({
        where: or(eq(schema.orders.id, orderId), eq(schema.orders.orderNumber, orderId)),
        with: {
          listing: { with: { images: true } },
          buyer: true,
          seller: true
        }
      });

      if (!order) {
        return c.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Pesanan tidak ditemukan' } },
          404
        );
      }

      if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'ADMIN') {
        return c.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Akses ditolak' } },
          403
        );
      }

      return c.json({ success: true, data: order });
    }

    const order = memoryStore.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Pesanan tidak ditemukan' } },
        404
      );
    }

    if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'ADMIN') {
      return c.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Akses ditolak' } },
        403
      );
    }

    return c.json({
      success: true,
      data: {
        ...order,
        listing: memoryStore.listings.find((l) => l.id === order.listingId),
        buyer: memoryStore.findUserById(order.buyerId),
        seller: memoryStore.findUserById(order.sellerId)
      }
    });
  })

  .put('/:id/ship', zValidator('json', updateShippingSchema), async (c) => {
    const user = c.get('user')!;
    const orderId = c.req.param('id');
    const { courierName, trackingNumber } = c.req.valid('json');
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

      if (order.sellerId !== user.id) {
        return c.json(
          {
            success: false,
            error: { code: 'FORBIDDEN', message: 'Hanya penjual yang bisa input resi' }
          },
          403
        );
      }

      await db
        .update(schema.orders)
        .set({
          courierName,
          trackingNumber,
          escrowStatus: 'IN_TRANSIT',
          shippedAt: now,
          updatedAt: now
        })
        .where(eq(schema.orders.id, orderId));

      const updated = await db.query.orders.findFirst({
        where: eq(schema.orders.id, orderId),
        with: { listing: true, buyer: true, seller: true }
      });

      return c.json({
        success: true,
        message: 'Status resi berhasil diperbarui. Barang sedang dalam perjalanan!',
        data: updated
      });
    }

    // Memory Store Fallback
    const order = memoryStore.orders.find((o) => o.id === orderId);
    if (!order) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Pesanan tidak ditemukan' } },
        404
      );
    }

    if (order.sellerId !== user.id) {
      return c.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Hanya penjual yang bisa input resi' }
        },
        403
      );
    }

    order.courierName = courierName;
    order.trackingNumber = trackingNumber;
    order.escrowStatus = 'IN_TRANSIT';
    order.shippedAt = now;
    order.updatedAt = now;

    return c.json({
      success: true,
      message: 'Status resi berhasil diperbarui. Barang sedang dalam perjalanan!',
      data: order
    });
  })

  .put('/:id/deliver', async (c) => {
    const user = c.get('user')!;
    const orderId = c.req.param('id');
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

      if (order.buyerId !== user.id && user.role !== 'ADMIN') {
        return c.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Hanya pembeli yang bisa konfirmasi penerimaan paket'
            }
          },
          403
        );
      }

      await db
        .update(schema.orders)
        .set({
          escrowStatus: 'DELIVERED_INSPECTION',
          deliveredAt: now,
          inspectionDeadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
          updatedAt: now
        })
        .where(eq(schema.orders.id, orderId));

      const updated = await db.query.orders.findFirst({
        where: eq(schema.orders.id, orderId),
        with: { listing: true, buyer: true, seller: true }
      });

      return c.json({
        success: true,
        message: 'Paket berhasil dikonfirmasi sampai. Periode inspeksi fisik 48 jam dimulai!',
        data: updated
      });
    }

    // Memory Store Fallback
    const order = memoryStore.orders.find((o) => o.id === orderId);
    if (!order) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Pesanan tidak ditemukan' } },
        404
      );
    }

    if (order.buyerId !== user.id && user.role !== 'ADMIN') {
      return c.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Hanya pembeli yang bisa konfirmasi penerimaan paket'
          }
        },
        403
      );
    }

    order.escrowStatus = 'DELIVERED_INSPECTION';
    order.deliveredAt = now;
    order.inspectionDeadline = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    order.updatedAt = now;

    return c.json({
      success: true,
      message: 'Paket berhasil dikonfirmasi sampai. Periode inspeksi fisik 48 jam dimulai!',
      data: order
    });
  })

  .put('/:id/complete', async (c) => {
    const user = c.get('user')!;
    const orderId = c.req.param('id');
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

      if (order.buyerId !== user.id && user.role !== 'ADMIN') {
        return c.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Hanya pembeli yang bisa konfirmasi terima barang'
            }
          },
          403
        );
      }

      await db
        .update(schema.orders)
        .set({
          escrowStatus: 'COMPLETED',
          deliveredAt: now,
          updatedAt: now
        })
        .where(eq(schema.orders.id, orderId));

      await db
        .update(schema.listings)
        .set({ status: 'SOLD' })
        .where(eq(schema.listings.id, order.listingId));

      const updated = await db.query.orders.findFirst({
        where: eq(schema.orders.id, orderId),
        with: { listing: true, buyer: true, seller: true }
      });

      return c.json({
        success: true,
        message: 'Transaksi selesai! Dana aman telah dicairkan ke saldo penjual.',
        data: updated
      });
    }

    // Memory Store Fallback
    const order = memoryStore.orders.find((o) => o.id === orderId);
    if (!order) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Pesanan tidak ditemukan' } },
        404
      );
    }

    if (order.buyerId !== user.id && user.role !== 'ADMIN') {
      return c.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Hanya pembeli yang bisa konfirmasi terima barang' }
        },
        403
      );
    }

    order.escrowStatus = 'COMPLETED';
    order.deliveredAt = now;
    order.updatedAt = now;

    const listing = memoryStore.listings.find((l) => l.id === order.listingId);
    if (listing) {
      listing.status = 'SOLD';
    }

    return c.json({
      success: true,
      message: 'Transaksi selesai! Dana aman telah dicairkan ke saldo penjual.',
      data: order
    });
  })

  .post('/:id/dispute', zValidator('json', disputeOrderSchema), async (c) => {
    const user = c.get('user')!;
    const orderId = c.req.param('id');
    const { reason, evidenceUrls } = c.req.valid('json');
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
            error: { code: 'FORBIDDEN', message: 'Hanya pembeli yang bisa mengajukan komplain' }
          },
          403
        );
      }

      if (order.escrowStatus === 'COMPLETED' || order.escrowStatus === 'CANCELLED') {
        return c.json(
          {
            success: false,
            error: {
              code: 'INVALID_ACTION',
              message: 'Pesanan yang telah selesai tidak dapat diajukan sengketa'
            }
          },
          400
        );
      }

      await db
        .update(schema.orders)
        .set({
          escrowStatus: 'DISPUTED',
          disputeReason: reason,
          disputeEvidenceUrls: JSON.stringify(evidenceUrls),
          updatedAt: now
        })
        .where(eq(schema.orders.id, orderId));

      const updated = await db.query.orders.findFirst({
        where: eq(schema.orders.id, orderId),
        with: { listing: true, buyer: true, seller: true }
      });

      return c.json({
        success: true,
        message:
          'Komplain berhasil diajukan. Pembayaran ditahan sementara dan sedang ditinjau tim bantuan.',
        data: updated
      });
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
          error: { code: 'FORBIDDEN', message: 'Hanya pembeli yang bisa mengajukan komplain' }
        },
        403
      );
    }

    if (order.escrowStatus === 'COMPLETED' || order.escrowStatus === 'CANCELLED') {
      return c.json(
        {
          success: false,
          error: {
            code: 'INVALID_ACTION',
            message: 'Pesanan yang telah selesai tidak dapat diajukan sengketa'
          }
        },
        400
      );
    }

    order.escrowStatus = 'DISPUTED';
    order.disputeReason = reason;
    order.disputeEvidenceUrls = evidenceUrls;
    order.updatedAt = now;

    return c.json({
      success: true,
      message:
        'Komplain berhasil diajukan. Pembayaran ditahan sementara dan sedang ditinjau tim bantuan.',
      data: order
    });
  });
