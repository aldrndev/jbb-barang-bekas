import { z } from 'zod';

export const createReviewSchema = z.object({
  orderId: z.string().min(1),
  rating: z.number().int().min(1, 'Rating minimal bintang 1').max(5, 'Rating maksimal bintang 5'),
  comment: z.string().min(5, 'Ulasan minimal 5 karakter').max(500),
  itemConditionMatch: z.boolean().default(true),
  fastResponse: z.boolean().default(true)
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
