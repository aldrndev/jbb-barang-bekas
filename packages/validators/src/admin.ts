import { z } from 'zod';

export const resolveDisputeSchema = z
  .object({
    action: z.enum(['REFUND_BUYER', 'RELEASE_TO_SELLER']),
    adminNotes: z.string().max(1000).optional()
  })
  .strict();

export const batchDisbursePayoutSchema = z
  .object({
    payoutIds: z.array(z.string().min(1)).optional().default([])
  })
  .strict();

export const updateListingStatusAdminSchema = z
  .object({
    status: z.enum(['ACTIVE', 'ARCHIVED', 'SOLD'])
  })
  .strict();

export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
export type BatchDisbursePayoutInput = z.infer<typeof batchDisbursePayoutSchema>;
export type UpdateListingStatusAdminInput = z.infer<typeof updateListingStatusAdminSchema>;
