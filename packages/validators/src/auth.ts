import { z } from 'zod';

export const googleAuthSchema = z
  .object({
    credential: z.string().min(10, 'Credential Google ID token wajib disertakan')
  })
  .strict();

export const updateProfileSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(70).optional(),
    phone: z
      .string()
      .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Format nomor WhatsApp tidak valid')
      .optional(),
    avatarUrl: z.string().url('Format URL avatar tidak valid').optional(),
    city: z.string().max(100).optional(),
    province: z.string().max(100).optional(),
    bio: z.string().max(500).optional()
  })
  .strict();

export const submitKycSchema = z
  .object({
    nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
    ktpImageUrl: z.string().url('Foto KTP harus berupa URL valid'),
    selfieImageUrl: z.string().url('Foto selfie bersama KTP harus berupa URL valid')
  })
  .strict();

export const updateBankPayoutSchema = z
  .object({
    bankName: z.string().min(2, 'Nama bank wajib diisi').max(50),
    bankAccountNumber: z
      .string()
      .regex(/^\d{5,30}$/, 'Nomor rekening harus berupa 5-30 digit angka'),
    bankAccountHolder: z.string().min(2, 'Nama pemilik rekening minimal 2 karakter').max(100)
  })
  .strict();

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SubmitKycInput = z.infer<typeof submitKycSchema>;
export type UpdateBankPayoutInput = z.infer<typeof updateBankPayoutSchema>;
