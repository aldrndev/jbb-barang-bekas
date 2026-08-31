import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createOrderSchema, disputeOrderSchema, updateShippingSchema } from '@jbb/validators';
import type { AppEnv } from '../types/env';
import { memoryStore } from '../services/store';
import { authMiddleware } from '../middlewares/auth';
import type { Order } from '@jbb/types';

export const orderRoutes = new Hono<AppEnv>()
  .use('*', authMiddleware)

  .post('/', zValidator('json', createOrderSchema), async (c) => {
    const user = c.get('user')!;
    const { listingId, offerId, deliveryMethod, recipientName, recipientPhone, shippingAddress, courierName } =
      c.req.valid('json');

    const listing = memoryStore.listings.find((l) => l.id === listingId);
    if (!listing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Barang tidak ditemukan' } }, 404);
    }

    if (listing.sellerId === user.id) {
      return c.json({ success: false, error: { code: 'INVALID_ACTION', message: 'Tidak bisa membeli barang sendiri' } }, 400);
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
    const serviceFee = Math.round(finalPrice * 0.01); // 1% escrow protection fee
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
      escrowStatus: 'PAYMENT_CONFIRMED', // Simulated instant escrow payment confirmation
      recipientName,
      recipientPhone,
      shippingAddress,
      courierName: courierName || (deliveryMethod === 'COD_KETEMUAN' ? 'COD Langsung' : 'Kurir Rekomendasi'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      listing,
      buyer: user,
      seller: memoryStore.findUserById(listing.sellerId)
    };

    memoryStore.orders.unshift(newOrder);
    listing.status = 'RESERVED';

    return c.json(
      {
        success: true,
        message: 'Pesanan Rekber berhasil dibuat! Dana Anda aman tersimpan di Rekber JBB.',
        data: newOrder
      },
      201
    );
  })

  .get('/', async (c) => {
    const user = c.get('user')!;
    const userOrders = memoryStore.orders
      .filter((o) => o.buyerId === user.id || o.sellerId === user.id)
      .map((o) => ({
        ...o,
        listing: memoryStore.listings.find((l) => l.id === o.listingId),
        buyer: memoryStore.findUserById(o.buyerId),
        seller: memoryStore.findUserById(o.sellerId)
      }));

    return c.json({
      success: true,
      data: userOrders
    });
  })

  .get('/:id', async (c) => {
    const user = c.get('user')!;
    const orderId = c.req.param('id');
    const order = memoryStore.orders.find((o) => o.id === orderId || o.orderNumber === orderId);

    if (!order) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Pesanan tidak ditemukan' } }, 404);
    }

    if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'ADMIN') {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Akses ditolak' } }, 403);
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

    const order = memoryStore.orders.find((o) => o.id === orderId);
    if (!order) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Pesanan tidak ditemukan' } }, 404);
    }

    if (order.sellerId !== user.id) {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Hanya penjual yang bisa input resi' } }, 403);
    }

    order.courierName = courierName;
    order.trackingNumber = trackingNumber;
    order.escrowStatus = 'IN_TRANSIT';
    order.shippedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    return c.json({
      success: true,
      message: 'Status resi berhasil diperbarui. Barang sedang dalam perjalanan!',
      data: order
    });
  })

  .put('/:id/complete', async (c) => {
    const user = c.get('user')!;
    const orderId = c.req.param('id');

    const order = memoryStore.orders.find((o) => o.id === orderId);
    if (!order) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Pesanan tidak ditemukan' } }, 404);
    }

    if (order.buyerId !== user.id && user.role !== 'ADMIN') {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Hanya pembeli yang bisa konfirmasi terima barang' } }, 403);
    }

    order.escrowStatus = 'COMPLETED';
    order.deliveredAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    // Mark listing as SOLD
    const listing = memoryStore.listings.find((l) => l.id === order.listingId);
    if (listing) {
      listing.status = 'SOLD';
    }

    return c.json({
      success: true,
      message: 'Transaksi selesai! Dana hasil penjualan telah diteruskan ke saldo penjual.',
      data: order
    });
  })

  .post('/:id/dispute', zValidator('json', disputeOrderSchema), async (c) => {
    const user = c.get('user')!;
    const orderId = c.req.param('id');
    const { reason, evidenceUrls } = c.req.valid('json');

    const order = memoryStore.orders.find((o) => o.id === orderId);
    if (!order) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Pesanan tidak ditemukan' } }, 404);
    }

    if (order.buyerId !== user.id) {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Akses ditolak' } }, 403);
    }

    order.escrowStatus = 'DISPUTED';
    order.disputeReason = reason;
    order.disputeEvidenceUrls = evidenceUrls;
    order.disputeStatus = 'UNDER_REVIEW';
    order.updatedAt = new Date().toISOString();

    return c.json({
      success: true,
      message: 'Komplain berhasil diajukan. Tim rekber JBB akan meninjau bukti unboxing dalam 1x24 jam.',
      data: order
    });
  });
