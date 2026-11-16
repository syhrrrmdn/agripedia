/**
 * Klien Prisma tunggal untuk aplikasi (hindari koneksi ganda saat hot reload).
 * Memakai driver adapter @prisma/adapter-pg -> Supabase PostgreSQL.
 * HANYA boleh diimpor dari kode sisi server (route handler / server component).
 */

import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.__agripediaPrisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__agripediaPrisma = prisma;
}

export default prisma;
