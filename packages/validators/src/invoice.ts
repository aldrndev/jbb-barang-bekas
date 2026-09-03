import { z } from 'zod';

export const createCustomInvoiceSchema = z.object({
  type: z
    .enum(['ESCROW_ORDER', 'CUSTOM_ADMIN', 'MEDIATION_FEE', 'VIP_ESCROW'])
    .default('CUSTOM_ADMIN'),
  buyerName: z.string().min(2, 'Nama pembeli wajib diisi'),
  buyerPhone: z.string().min(8, 'Nomor HP pembeli tidak valid'),
  buyerEmail: z.string().email('Email pembeli tidak valid').optional().nullable(),
  buyerAddress: z.string().min(5, 'Alamat pembeli wajib diisi'),
  buyerCity: z.string().optional().nullable(),
  sellerName: z.string().min(2, 'Nama penjual / penyedia wajib diisi'),
  sellerPhone: z.string().optional().nullable(),
  sellerCity: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        title: z.string().min(2, 'Nama item wajib diisi'),
        description: z.string().optional().nullable(),
        quantity: z.number().int().positive().default(1),
        price: z.number().nonnegative('Harga tidak boleh negatif'),
        condition: z.string().optional().nullable()
      })
    )
    .min(1, 'Minimal harus ada 1 item barang/jasa'),
  shippingFee: z.number().nonnegative().default(0),
  serviceFee: z.number().nonnegative().default(0),
  discountAmount: z.number().nonnegative().default(0),
  paymentChannel: z.string().optional().default('BCA_VA'),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  status: z.enum(['PAID', 'UNPAID', 'CANCELLED', 'REFUNDED']).default('UNPAID')
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['PAID', 'UNPAID', 'CANCELLED', 'REFUNDED']),
  paidAt: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const simulatePaymentWebhookSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID wajib disertakan'),
  channel: z.string().optional().default('BCA_VA'),
  paidAmount: z.number().optional()
});
