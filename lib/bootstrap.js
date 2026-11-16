/**
 * AgriPedia — bootstrap database (idempoten, aman dijalankan berulang).
 *   1) Membuat tabel yang belum ada (users, products, guides, settings).
 *   2) Mengisi data contoh bila tabel masih kosong: 3 user, 25 produk, 22 edukasi.
 *
 * Dipakai oleh skrip `npm run db:seed` dan dipanggil otomatis sekali per instance
 * server saat data pertama kali dimuat, sehingga aplikasi yang baru di-deploy
 * tetap terisi data contoh tanpa perlu menjalankan perintah manual.
 *
 * HANYA boleh diimpor dari kode sisi server (route handler / skrip Node).
 */

import prisma from './prisma.js';
import { hashPassword } from './password.js';
import { createSampleGuides, createSampleProducts } from './data.js';

/** Definisi tabel — disamakan dengan prisma/schema.prisma. */
const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`,
  `CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'Pertanian',
    "harga" INTEGER NOT NULL DEFAULT 0,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "asal" TEXT NOT NULL DEFAULT '',
    "satuan" TEXT NOT NULL DEFAULT '',
    "deskripsi" TEXT NOT NULL DEFAULT '',
    "image_url" TEXT NOT NULL DEFAULT '',
    "unggulan" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "guides" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'Pertanian',
    "tingkat" TEXT NOT NULL DEFAULT 'Pemula',
    "topik" TEXT NOT NULL DEFAULT '',
    "ringkasan" TEXT NOT NULL DEFAULT '',
    "langkah" TEXT[] NOT NULL,
    "tips" TEXT NOT NULL DEFAULT '',
    "image_url" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "guides_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
  )`,
];

const SEED_USERS = [
  { email: 'admin@gmail.com', nama: 'Admin Agripedia', role: 'admin', password: 'asdfghjkl' },
  { email: 'penjual@gmail.com', nama: 'Pak Tani Penjual', role: 'penjual', password: 'asdfghjkl' },
  { email: 'buyer@gmail.com', nama: 'Bu Sari Pembeli', role: 'buyer', password: 'asdfghjkl' },
];

async function createTables() {
  for (const sql of CREATE_TABLES) {
    await prisma.$executeRawUnsafe(sql);
  }
}

async function seedData() {
  if ((await prisma.user.count()) === 0) {
    await prisma.user.createMany({
      data: SEED_USERS.map((user) => ({
        email: user.email,
        nama: user.nama,
        role: user.role,
        passwordHash: hashPassword(user.password),
      })),
      skipDuplicates: true,
    });
    console.log(`✔ ${SEED_USERS.length} user ditambahkan.`);
  }

  if ((await prisma.product.count()) === 0) {
    const products = createSampleProducts();
    await prisma.product.createMany({
      data: products.map((product) => ({
        id: product.id,
        nama: product.nama,
        kategori: product.kategori,
        harga: product.harga,
        stok: product.stok,
        asal: product.asal,
        satuan: product.satuan,
        deskripsi: product.deskripsi,
        imageUrl: product.imageUrl,
        unggulan: product.unggulan,
      })),
      skipDuplicates: true,
    });
    console.log(`✔ ${products.length} produk ditambahkan.`);
  }

  if ((await prisma.guide.count()) === 0) {
    const guides = createSampleGuides();
    await prisma.guide.createMany({
      data: guides.map((guide) => ({
        id: guide.id,
        judul: guide.judul,
        kategori: guide.kategori,
        tingkat: guide.tingkat,
        topik: guide.topik,
        ringkasan: guide.ringkasan,
        langkah: guide.langkah,
        tips: guide.tips,
        imageUrl: guide.imageUrl,
      })),
      skipDuplicates: true,
    });
    console.log(`✔ ${guides.length} edukasi ditambahkan.`);
  }

  await prisma.setting.upsert({
    where: { key: 'wa_number' },
    update: {},
    create: { key: 'wa_number', value: '' },
  });
}

async function run() {
  await createTables();
  await seedData();
}

let bootstrap = null;

/**
 * Memastikan tabel dan data contoh siap dipakai.
 * Hasil pemanggilan pertama disimpan, jadi hanya dijalankan sekali per instance.
 * @returns {Promise<void>}
 */
export function ensureDatabase() {
  if (!bootstrap) {
    bootstrap = run().catch((error) => {
      // Gagal: izinkan percobaan ulang pada permintaan berikutnya.
      bootstrap = null;
      throw error;
    });
  }
  return bootstrap;
}

export default ensureDatabase;
