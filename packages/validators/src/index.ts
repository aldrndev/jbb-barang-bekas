import type { z } from 'zod';
import type {
  batchDisbursePayoutSchema,
  resolveDisputeSchema,
  updateListingStatusAdminSchema
} from './admin';
import type {
  googleAuthSchema,
  submitKycSchema,
  updateBankPayoutSchema,
  updateProfileSchema
} from './auth';
import type {
  createCustomInvoiceSchema,
  simulatePaymentWebhookSchema,
  updateInvoiceStatusSchema
} from './invoice';
import type { createListingSchema, updateListingSchema } from './listing';
import type { makeOfferSchema, respondOfferSchema } from './offer';
import type { createOrderSchema, disputeOrderSchema, updateShippingSchema } from './order';
import type { createReviewSchema } from './review';

export * from './auth';
export * from './admin';
export * from './listing';
export * from './offer';
export * from './order';
export * from './review';
export * from './invoice';

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SubmitKycInput = z.infer<typeof submitKycSchema>;
export type UpdateBankPayoutInput = z.infer<typeof updateBankPayoutSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type MakeOfferInput = z.infer<typeof makeOfferSchema>;
export type RespondOfferInput = z.infer<typeof respondOfferSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type DisputeOrderInput = z.infer<typeof disputeOrderSchema>;
export type UpdateShippingInput = z.infer<typeof updateShippingSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
export type BatchDisbursePayoutInput = z.infer<typeof batchDisbursePayoutSchema>;
export type UpdateListingStatusAdminInput = z.infer<typeof updateListingStatusAdminSchema>;
export type CreateCustomInvoiceInput = z.infer<typeof createCustomInvoiceSchema>;
export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema>;
export type SimulatePaymentWebhookInput = z.infer<typeof simulatePaymentWebhookSchema>;
