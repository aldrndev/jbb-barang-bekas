import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/auth';
import type { AppEnv } from '../types/env';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic'
};

export const uploadRoutes = new Hono<AppEnv>()
  .use('*', authMiddleware)

  .post('/', async (c) => {
    try {
      const body = await c.req.parseBody();
      const file = body.file;

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

      const ext = ALLOWED_MIME_TYPES[file.type.toLowerCase()];
      if (!ext) {
        return c.json(
          {
            success: false,
            error: {
              code: 'UNSUPPORTED_TYPE',
              message: 'Hanya format JPG, PNG, WEBP, dan HEIC yang didukung'
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

      const randomHash = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
      const key = `listings/${Date.now()}-${randomHash}.${ext}`;

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

      // Fallback preview data URI for local dev
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        const b = bytes[i];
        if (b !== undefined) {
          binary += String.fromCharCode(b);
        }
      }
      const base64 = btoa(binary);
      const dataUri = `data:${file.type};base64,${base64}`;

      return c.json({
        success: true,
        message: 'Upload berhasil',
        data: { url: dataUri, key }
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupload file';
      return c.json(
        {
          success: false,
          error: {
            code: 'UPLOAD_FAILED',
            message: errorMessage
          }
        },
        500
      );
    }
  });
