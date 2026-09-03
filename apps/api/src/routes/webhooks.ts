import { zValidator } from '@hono/zod-validator';
import { simulatePaymentWebhookSchema } from '@jbb/validators';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { getDb, schema } from '../db';
import { memoryStore } from '../services/store';
import type { AppEnv } from '../types/env';

export const webhookRoutes = new Hono<AppEnv>()
  // Payment Gateway Callback / Simulation Endpoint
  .post('/payment', zValidator('json', simulatePaymentWebhookSchema), async (c) => {
    const { invoiceId, channel } = c.req.valid('json');
    const now = new Date().toISOString();
    const db = getDb(c.env.DB);

    // 1. Check in Memory Store
    const updatedMemoryInvoice = memoryStore.updateInvoiceStatus(invoiceId, 'PAID');
    if (updatedMemoryInvoice) {
      if (updatedMemoryInvoice.paymentMeta) {
        updatedMemoryInvoice.paymentMeta.channel =
          channel || updatedMemoryInvoice.paymentMeta.channel;
        updatedMemoryInvoice.paymentMeta.paidAt = now;
      }

      return c.json({
        success: true,
        message: 'Status pembayaran berhasil diverifikasi otomatis oleh Payment Gateway.',
        data: {
          invoiceId: updatedMemoryInvoice.id,
          invoiceNumber: updatedMemoryInvoice.invoiceNumber,
          status: 'PAID',
          paidAt: now
        }
      });
    }

    // 2. Check in D1 Database
    if (db) {
      const cleanOrderId = invoiceId.startsWith('inv-') ? invoiceId.slice(4) : invoiceId;
      const [order] = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.id, cleanOrderId))
        .limit(1);

      if (order) {
        await db
          .update(schema.orders)
          .set({
            escrowStatus: 'PAYMENT_CONFIRMED',
            updatedAt: now
          })
          .where(eq(schema.orders.id, order.id));

        return c.json({
          success: true,
          message: 'Status pembayaran berhasil diverifikasi otomatis oleh Payment Gateway.',
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            escrowStatus: 'PAYMENT_CONFIRMED',
            paidAt: now
          }
        });
      }
    }

    return c.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Invoice / Pesanan tidak ditemukan.' }
      },
      404
    );
  });
