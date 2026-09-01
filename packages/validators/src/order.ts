import { z } from 'zod';

export const deliveryMethodSchema = z.enum(['COD_KETEMUAN', 'KURIR_REGULER', 'KURIR_INSTANT']);

export const createOrderSchema = z.object({
  listingId: z.string().min(1, 'ID listing wajib diisi'),
  offerId: z.string().optional(),
  deliveryMethod: deliveryMethodSchema,
  recipientName: z.string().min(2, 'Nama penerima minimal 2 karakter'),
  recipientPhone: z
    .string()
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Nomor WhatsApp penerima tidak valid'),
  shippingAddress: z.string().min(10, 'Alamat pengiriman / titik temu COD minimal 10 karakter'),
  courierName: z.string().optional()
});

export const updateShippingSchema = z.object({
  orderId: z.string().min(1),
  courierName: z.string().min(2, 'Nama kurir/ekspedisi wajib diisi'),
  trackingNumber: z.string().min(4, 'Nomor resi pengiriman wajib diisi')
});

export const disputeOrderSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(20, 'Jelaskan alasan komplain secara detail minimal 20 karakter'),
  evidenceUrls: z.array(z.url()).min(1, 'Sertakan minimal 1 foto/video unboxing sebagai bukti')
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateShippingInput = z.infer<typeof updateShippingSchema>;
export type DisputeOrderInput = z.infer<typeof disputeOrderSchema>;
