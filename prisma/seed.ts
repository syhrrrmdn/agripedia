/**
 * AgriPedia — isi awal database (3 user, produk contoh, edukasi contoh, pengaturan).
 * Dijalankan dengan: npm run db:seed  (atau prisma db seed)
 * Bersifat idempoten: hanya mengisi tabel yang masih kosong.
 */

import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from '../lib/password.js';
import { createSampleGuides, createSampleProducts } from '../lib/data.js';

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_USERS = [
  { email: 'admin@gmail.com', nama: 'Admin Agripedia', role: 'admin', password: 'asdfghjkl' },
  { email: 'penjual@gmail.com', nama: 'Pak Tani Penjual', role: 'penjual', password: 'asdfghjkl' },
  { email: 'buyer@gmail.com', nama: 'Bu Sari Pembeli', role: 'buyer', password: 'asdfghjkl' },
];

async function main() {
  if ((await prisma.user.count()) === 0) {
    for (const user of SEED_USERS) {
      await prisma.user.create({
        data: {
          email: user.email,
          nama: user.nama,
          role: user.role,
          passwordHash: hashPassword(user.password),
        },
      });
    }
    console.log(`✔ ${SEED_USERS.length} user ditambahkan.`);
  } else {
    console.log('• Tabel users sudah berisi data, dilewati.');
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
    });
    console.log(`✔ ${products.length} produk ditambahkan.`);
  } else {
    console.log('• Tabel products sudah berisi data, dilewati.');
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
    });
    console.log(`✔ ${guides.length} edukasi ditambahkan.`);
  } else {
    console.log('• Tabel guides sudah berisi data, dilewati.');
  }

  await prisma.setting.upsert({
    where: { key: 'wa_number' },
    update: {},
    create: { key: 'wa_number', value: '' },
  });
  console.log('✔ Pengaturan awal siap.');
}

main()
  .catch((error) => {
    console.error('Gagal mengisi data awal:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
