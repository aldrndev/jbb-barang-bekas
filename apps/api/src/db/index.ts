import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@jbb/database';

export function getDb(d1?: D1Database) {
  if (!d1) {
    return null;
  }
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof getDb>;
export { schema };
