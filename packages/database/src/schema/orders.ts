import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { listings } from './listings';
import { offers } from './offers';

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  listingId: text('listing_id').notNull().references(() => listings.id),
  buyerId: text('buyer_id').notNull().references(() => users.id),
  sellerId: text('seller_id').notNull().references(() => users.id),
  offerId: text('offer_id').references(() => offers.id),
  amount: real('amount').notNull(),
  shippingFee: real('shipping_fee').default(0).notNull(),
  serviceFee: real('service_fee').default(0).notNull(),
  totalAmount: real('total_amount').notNull(),
  deliveryMethod: text('delivery_method', {
    enum: ['COD_KETEMUAN', 'KURIR_REGULER', 'KURIR_INSTANT']
  }).notNull(),
  escrowStatus: text('escrow_status', {
    enum: [
      'WAITING_PAYMENT',
      'PAYMENT_CONFIRMED',
      'SELLER_PACKING',
      'IN_TRANSIT',
      'DELIVERED_INSPECTION',
      'COMPLETED',
      'DISPUTED',
      'CANCELLED'
    ]
  }).default('WAITING_PAYMENT').notNull(),
  
  recipientName: text('recipient_name').notNull(),
  recipientPhone: text('recipient_phone').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  courierName: text('courier_name'),
  trackingNumber: text('tracking_number'),
  shippedAt: text('shipped_at'),
  deliveredAt: text('delivered_at'),
  inspectionDeadline: text('inspection_deadline'),
  
  disputeReason: text('dispute_reason'),
  disputeEvidenceUrls: text('dispute_evidence_urls'), // JSON array string
  disputeStatus: text('dispute_status'),
  
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString())
});

export type OrderDb = typeof orders.$inferSelect;
export type NewOrderDb = typeof orders.$inferInsert;
