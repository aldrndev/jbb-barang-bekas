import type { UserProfile } from '@jbb/types';

export interface Bindings {
  DB?: D1Database;
  STORAGE?: R2Bucket;
  CACHE?: KVNamespace;
  JWT_SECRET: string;
  APP_ENV?: string;
}

export interface Variables {
  user?: UserProfile;
}

export interface AppEnv {
  Bindings: Bindings;
  Variables: Variables;
}
