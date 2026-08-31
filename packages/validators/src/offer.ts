import { z } from 'zod';

export const makeOfferSchema = z.object({
  listingId: z.string().min(1, 'ID listing wajib diisi'),
  offeredPrice: z.number().positive('Harga tawaran harus lebih dari 0'),
  message: z.string().max(300, 'Pesan maksimal 300 karakter').optional()
});

export const respondOfferSchema = z.object({
  offerId: z.string().min(1, 'ID tawaran wajib diisi'),
  action: z.enum(['ACCEPT', 'REJECT', 'COUNTER']),
  counterPrice: z.number().positive('Harga tawar balik harus lebih dari 0').optional(),
  counterMessage: z.string().max(300).optional()
});

export type MakeOfferInput = z.infer<typeof makeOfferSchema>;
export type RespondOfferInput = z.infer<typeof respondOfferSchema>;
