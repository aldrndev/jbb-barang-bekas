import { Hono } from 'hono';
import type { AppEnv } from '../types/env';
import { authMiddleware } from '../middlewares/auth';

export const uploadRoutes = new Hono<AppEnv>()
  .use('*', authMiddleware)

  .post('/', async (c) => {
    try {
      const body = await c.req.parseBody();
      const file = body['file'];

      if (!file || !(file instanceof File)) {
        return c.json(
          {
            success: false,
            error: {
              code: 'INVALID_FILE',
              message: 'File gambar wajib di-upload'
            }
          },
          400
        );
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
      if (!allowedTypes.includes(file.type)) {
        return c.json(
          {
            success: false,
            error: {
              code: 'UNSUPPORTED_TYPE',
              message: 'Hanya format JPG, PNG, WEBP yang didukung'
            }
          },
          400
        );
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return c.json(
          {
            success: false,
            error: {
              code: 'FILE_TOO_LARGE',
              message: 'Ukuran foto maksimal 5 MB'
            }
          },
          400
        );
      }

      const fileExt = file.name.split('.').pop() || 'jpg';
      const key = `listings/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      // Upload to Cloudflare R2 bucket if available
      if (c.env.STORAGE) {
        const arrayBuffer = await file.arrayBuffer();
        await c.env.STORAGE.put(key, arrayBuffer, {
          httpMetadata: { contentType: file.type }
        });
        const publicUrl = `https://r2.jbb.market/${key}`;
        return c.json({
          success: true,
          message: 'Upload berhasil ke Cloudflare R2',
          data: { url: publicUrl, key }
        });
      }

      // Fallback preview URL / mock for local dev
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      const dataUri = `data:${file.type};base64,${base64}`;

      return c.json({
        success: true,
        message: 'Upload berhasil',
        data: { url: dataUri, key }
      });
    } catch (err: any) {
      return c.json(
        {
          success: false,
          error: {
            code: 'UPLOAD_FAILED',
            message: err.message || 'Gagal mengupload file'
          }
        },
        500
      );
    }
  });
