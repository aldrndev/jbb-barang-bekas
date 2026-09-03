import type { Order } from '@jbb/types';
import { eq, or } from 'drizzle-orm';
import { Hono } from 'hono';
import { getDb, schema } from '../db';
import { optionalAuthMiddleware } from '../middlewares/auth';
import { memoryStore } from '../services/store';
import type { AppEnv } from '../types/env';

export const invoiceRoutes = new Hono<AppEnv>()
  .use('*', optionalAuthMiddleware)

  // Get single invoice by ID, InvoiceNumber, or OrderNumber
  .get('/:id', async (c) => {
    const id = c.req.param('id');
    const user = c.get('user');
    const db = getDb(c.env.DB);

    // 1. Try Memory Store first (includes custom admin invoices & simulated orders)
    const memoryInvoice = memoryStore.getInvoiceById(id);
    if (memoryInvoice) {
      // Permission check if logged in: buyer, seller, admin, or public invoice link
      if (
        user &&
        user.role !== 'ADMIN' &&
        memoryInvoice.buyerId &&
        memoryInvoice.sellerId &&
        memoryInvoice.buyerId !== user.id &&
        memoryInvoice.sellerId !== user.id
      ) {
        return c.json(
          {
            success: false,
            error: { code: 'FORBIDDEN', message: 'Anda tidak memiliki akses ke faktur ini.' }
          },
          403
        );
      }

      return c.json({
        success: true,
        data: memoryInvoice
      });
    }

    // 2. Query from D1 Database
    if (db) {
      const cleanOrderId = id.startsWith('inv-') ? id.slice(4) : id;
      const orderDb = await db.query.orders.findFirst({
        where: or(
          eq(schema.orders.id, cleanOrderId),
          eq(schema.orders.id, id),
          eq(schema.orders.orderNumber, id)
        ),
        with: {
          listing: { with: { images: true, category: true } },
          buyer: true,
          seller: true
        }
      });

      if (orderDb) {
        if (
          user &&
          user.role !== 'ADMIN' &&
          orderDb.buyerId !== user.id &&
          orderDb.sellerId !== user.id
        ) {
          return c.json(
            {
              success: false,
              error: { code: 'FORBIDDEN', message: 'Anda tidak memiliki akses ke faktur ini.' }
            },
            403
          );
        }

        const invoice = memoryStore.createInvoiceFromOrder(orderDb as unknown as Order);
        return c.json({
          success: true,
          data: invoice
        });
      }
    }

    return c.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Faktur tagihan / invoice tidak ditemukan.' }
      },
      404
    );
  });
