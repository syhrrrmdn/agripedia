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
    "wa_number" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
  )`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "wa_number" TEXT NOT NULL DEFAULT ''`,
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
    "penjual_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
  )`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "penjual_id" INTEGER`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_penjual_id_fkey') THEN
      ALTER TABLE "products" ADD CONSTRAINT "products_penjual_id_fkey"
        FOREIGN KEY ("penjual_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END $$`,
  `CREATE INDEX IF NOT EXISTS "products_penjual_id_idx" ON "products"("penjual_id")`,
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
  `CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT NOT NULL,
    "buyer_id" INTEGER NOT NULL,
    "product_id" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "catatan" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'menunggu',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
  )`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_buyer_id_fkey') THEN
      ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_fkey"
        FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_product_id_fkey') THEN
      ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_fkey"
        FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$`,
  `CREATE INDEX IF NOT EXISTS "orders_buyer_id_idx" ON "orders"("buyer_id")`,
];

/** Akun contoh. Setiap penjual punya nomor WhatsApp sendiri. */
const SEED_USERS = [
  { email: 'admin@gmail.com', nama: 'Admin Agripedia', role: 'admin', password: 'asdfghjkl', waNumber: '' },
  { email: 'penjual@gmail.com', nama: 'Pak Tani Penjual', role: 'penjual', password: 'asdfghjkl', waNumber: '6281200000001' },
  { email: 'penjual2@gmail.com', nama: 'Bu Rina Kebun', role: 'penjual', password: 'asdfghjkl', waNumber: '6281200000002' },
  { email: 'penjual3@gmail.com', nama: 'Pak Budi Tambak', role: 'penjual', password: 'asdfghjkl', waNumber: '6281200000003' },
  { email: 'buyer@gmail.com', nama: 'Bu Sari Pembeli', role: 'buyer', password: 'asdfghjkl', waNumber: '' },
];

async function createTables() {
  for (const sql of CREATE_TABLES) {
    await prisma.$executeRawUnsafe(sql);
  }
}

/**
 * Menugaskan pemilik (penjual) untuk produk yang belum punya pemilik.
 * Produk perikanan diarahkan ke penjual terakhir, sisanya dibagi rata.
 */
export async function assignProductOwners() {
  const sellers = await prisma.user.findMany({ where: { role: 'penjual' }, orderBy: { id: 'asc' } });
  if (sellers.length === 0) return;

  const unowned = await prisma.product.findMany({
    where: { penjualId: null },
    orderBy: { createdAt: 'asc' },
  });
  if (unowned.length === 0) return;

  const darat = sellers.length > 1 ? sellers.slice(0, -1) : sellers;
  const maritim = sellers[sellers.length - 1];
  let giliran = 0;

  for (const product of unowned) {
    const owner = product.kategori === 'Perikanan' ? maritim : darat[giliran++ % darat.length];
    await prisma.product.update({ where: { id: product.id }, data: { penjualId: owner.id } });
  }
  console.log(`✔ ${unowned.length} produk ditugaskan ke penjual.`);
}

async function seedUsers() {
  for (const user of SEED_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        nama: user.nama,
        role: user.role,
        passwordHash: hashPassword(user.password),
      },
    });
    // Isi nomor WhatsApp penjual contoh bila masih kosong.
    if (user.waNumber) {
      await prisma.user.updateMany({
        where: { email: user.email, waNumber: '' },
        data: { waNumber: user.waNumber },
      });
    }
  }
}

async function seedData() {
  await seedUsers();

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

  await assignProductOwners();

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
