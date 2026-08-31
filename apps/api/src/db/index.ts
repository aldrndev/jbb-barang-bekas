import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@jbb/database';
import type { AppEnv } from '../types/env';
import type { Context } from 'hono';

export function getDb(c: Context<AppEnv>) {
  if (c.env.DB) {
    return drizzle(c.env.DB, { schema });
  }
  // Fallback helper for local mock / memory state if D1 not yet bound
  return null;
}
