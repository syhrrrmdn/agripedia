/**
 * AgriPedia — menghapus seluruh tabel di skema "public" (jika ada).
 * Dijalankan SEBELUM `prisma db push` agar skema dibuat dari nol:
 *   npm run db:drop    (atau langsung: npm run db:reset)
 */

import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const tables = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
  );

  if (tables.length === 0) {
    console.log('• Tidak ada tabel di skema "public", tidak ada yang dihapus.');
    return;
  }

  for (const { tablename } of tables) {
    const ident = `public."${String(tablename).replace(/"/g, '""')}"`;
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS ${ident} CASCADE`);
  }

  console.log(`✔ ${tables.length} tabel dihapus: ${tables.map((t) => t.tablename).join(', ')}`);
}

main()
  .catch((error) => {
    console.error('Gagal menghapus tabel:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
