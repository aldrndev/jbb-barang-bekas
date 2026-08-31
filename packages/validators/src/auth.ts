import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(70, 'Nama maksimal 70 karakter'),
  email: z.email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').max(100),
  phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Nomor WhatsApp Indonesia tidak valid (contoh: 08123456789)').optional()
});

export const loginSchema = z.object({
  email: z.email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi')
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(70).optional(),
  phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/).optional(),
  avatarUrl: z.url().optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  bio: z.string().max(300).optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
