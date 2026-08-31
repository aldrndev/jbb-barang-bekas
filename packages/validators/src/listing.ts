import { z } from 'zod';

export const itemConditionSchema = z.enum([
  'NEW',
  'LIKE_NEW',
  'USED_EXCELLENT',
  'USED_GOOD',
  'USED_FAIR',
  'PARTS_ONLY'
]);

export const completenessEnum = z.enum([
  'FULLSET',
  'UNIT_ONLY',
  'BOX_UNIT',
  'WITH_RECEIPT',
  'ACTIVE_WARRANTY'
]);

export const createListingSchema = z.object({
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  title: z.string().min(5, 'Judul barang minimal 5 karakter').max(120, 'Judul barang maksimal 120 karakter'),
  description: z.string().min(20, 'Deskripsikan kondisi barang secara jujur dan jelas minimal 20 karakter'),
  price: z.number().positive('Harga harus lebih dari 0'),
  originalPrice: z.number().positive().optional(),
  isNegotiable: z.boolean().default(true),
  minOfferPrice: z.number().positive().optional(),
  condition: itemConditionSchema,
  completeness: z.array(completenessEnum).min(1, 'Pilih minimal satu kelengkapan barang'),
  purchaseYear: z.number().int().min(2000).max(2027).optional(),
  warrantyUntil: z.string().optional(),
  hasOriginalReceipt: z.boolean().default(false),
  
  // Location
  province: z.string().min(1, 'Provinsi wajib diisi'),
  city: z.string().min(1, 'Kota/Kabupaten wajib diisi'),
  district: z.string().min(1, 'Kecamatan wajib diisi'),
  postalCode: z.string().optional(),
  isCodAvailable: z.boolean().default(true),
  codMeetingPoint: z.string().max(200).optional(),
  
  // Specs and images
  specs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  imageUrls: z.array(z.url('URL gambar tidak valid')).min(1, 'Upload minimal 1 foto barang').max(10, 'Maksimal 10 foto barang')
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'IN_NEGO', 'RESERVED', 'SOLD', 'ARCHIVED']).optional()
});

export const listingQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  condition: z.union([itemConditionSchema, z.array(itemConditionSchema)]).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  isCod: z.coerce.boolean().optional(),
  isNego: z.coerce.boolean().optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'popular']).default('newest').optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20).optional()
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingQueryInput = z.infer<typeof listingQuerySchema>;
