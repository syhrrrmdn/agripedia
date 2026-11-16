/**
 * AgriPedia — isi awal database (3 user, 25 produk, 22 edukasi, pengaturan).
 * Dijalankan dengan: npm run db:seed  (atau prisma db seed)
 * Idempoten: tabel dibuat bila belum ada, data hanya diisi saat tabel masih kosong.
 *
 * Logika sebenarnya ada di lib/bootstrap.js agar sama dengan bootstrap otomatis
 * yang dijalankan aplikasi saat data pertama kali dimuat.
 */

import 'dotenv/config';
import { ensureDatabase } from '../lib/bootstrap.js';
import prisma from '../lib/prisma.js';

ensureDatabase()
  .then(() => console.log('✔ Database siap.'))
  .catch((error) => {
    console.error('Gagal mengisi data awal:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
