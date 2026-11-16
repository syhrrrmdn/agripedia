import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

/**
 * Konfigurasi Prisma CLI (Prisma 7).
 * CLI (db push / migrate / studio) memakai koneksi LANGSUNG (DIRECT_URL),
 * sedangkan aplikasi (runtime) memakai pooler lewat driver adapter di lib/prisma.js.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DIRECT_URL'),
  },
});
