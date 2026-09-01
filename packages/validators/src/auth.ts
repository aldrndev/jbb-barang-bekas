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
  name: z.string().min(2, 'Nama minimal 2 karakter').max(70).optional(),
  phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Format nomor WhatsApp tidak valid').optional(),
  avatarUrl: z.string().optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  bio: z.string().max(500).optional()
});

export const submitKycSchema = z.object({
  nik: z.string().min(16, 'NIK harus 16 digit').max(16, 'NIK harus 16 digit'),
  ktpImageUrl: z.string().min(1, 'Foto KTP wajib diupload'),
  selfieImageUrl: z.string().min(1, 'Foto selfie bersama KTP wajib diupload')
});

export const updateBankPayoutSchema = z.object({
  bankName: z.string().min(2, 'Nama bank wajib diisi'),
  bankAccountNumber: z.string().min(5, 'Nomor rekening minimal 5 digit').max(30),
  bankAccountHolder: z.string().min(2, 'Nama pemilik rekening minimal 2 karakter')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SubmitKycInput = z.infer<typeof submitKycSchema>;
export type UpdateBankPayoutInput = z.infer<typeof updateBankPayoutSchema>;

