/**
 * AgriPedia — lapisan akses data berbasis Prisma (Supabase PostgreSQL).
 * HANYA boleh diimpor dari kode sisi server (route handler / server component).
 */

import { NextResponse } from 'next/server';
import prisma from './prisma.js';
import { assignProductOwners, ensureDatabase } from './bootstrap.js';
import { getCurrentUser } from './auth.js';

/* ---------- Otorisasi ---------- */

/**
 * Memeriksa sesi dan peran.
 * @returns {Promise<{ user?: object, response?: NextResponse }>}
 */
export async function authorize(roles) {
  const user = await getCurrentUser();
  if (!user) {
    return { response: NextResponse.json({ error: 'Anda harus masuk terlebih dahulu.' }, { status: 401 }) };
  }
  if (roles && !roles.includes(user.role)) {
    return { response: NextResponse.json({ error: 'Anda tidak memiliki izin untuk aksi ini.' }, { status: 403 }) };
  }
  return { user };
}

/* ---------- Users ---------- */

const USER_PUBLIC = { id: true, email: true, nama: true, role: true, waNumber: true, createdAt: true };

export async function getUserByEmail(email) {
  await ensureDatabase();
  return prisma.user.findUnique({ where: { email: String(email ?? '').trim().toLowerCase() } });
}

export async function getUserById(id) {
  await ensureDatabase();
  return prisma.user.findUnique({ where: { id: Number(id) }, select: USER_PUBLIC });
}

export async function listUsers() {
  await ensureDatabase();
  return prisma.user.findMany({ select: USER_PUBLIC, orderBy: { id: 'asc' } });
}

/** Memperbarui nomor WhatsApp milik satu pengguna. */
export async function updateUserWa(id, waNumber) {
  return prisma.user.update({ where: { id: Number(id) }, data: { waNumber }, select: USER_PUBLIC });
}

export function createUser(data) {
  return prisma.user.create({ data });
}

/* ---------- Products ---------- */

const PRODUCT_ORDER = [{ unggulan: 'desc' }, { createdAt: 'asc' }];

/** Data pemilik yang ikut dikirim bersama produk (untuk tombol WhatsApp & dashboard admin). */
const PRODUCT_INCLUDE = {
  penjual: { select: { id: true, nama: true, email: true, waNumber: true } },
};

export async function listProducts() {
  await ensureDatabase();
  return prisma.product.findMany({ orderBy: PRODUCT_ORDER, include: PRODUCT_INCLUDE });
}

export function getProductById(id) {
  return prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
}

export function createProduct(data) {
  return prisma.product.create({ data, include: PRODUCT_INCLUDE });
}

export function updateProduct(id, data) {
  return prisma.product.update({ where: { id }, data, include: PRODUCT_INCLUDE });
}

export function deleteProduct(id) {
  return prisma.product.delete({ where: { id } });
}

/* ---------- Orders (pesanan pembeli) ---------- */

const ORDER_INCLUDE = {
  product: {
    select: {
      id: true,
      nama: true,
      harga: true,
      satuan: true,
      imageUrl: true,
      penjual: { select: { id: true, nama: true, waNumber: true } },
    },
  },
};

const ORDER_ORDER = [{ createdAt: 'desc' }];

/** Seluruh pesanan milik satu pembeli. */
export async function listOrdersByBuyer(buyerId) {
  await ensureDatabase();
  return prisma.order.findMany({
    where: { buyerId: Number(buyerId) },
    orderBy: ORDER_ORDER,
    include: ORDER_INCLUDE,
  });
}

export function createOrder(data) {
  return prisma.order.create({ data, include: ORDER_INCLUDE });
}

export function getOrderById(id) {
  return prisma.order.findUnique({ where: { id } });
}

export function deleteOrder(id) {
  return prisma.order.delete({ where: { id } });
}

/* ---------- Guides ---------- */

const GUIDE_ORDER = [{ createdAt: 'asc' }];

export async function listGuides() {
  await ensureDatabase();
  return prisma.guide.findMany({ orderBy: GUIDE_ORDER });
}

export function createGuide(data) {
  return prisma.guide.create({ data });
}

export function updateGuide(id, data) {
  return prisma.guide.update({ where: { id }, data });
}

export function deleteGuide(id) {
  return prisma.guide.delete({ where: { id } });
}

/* ---------- Settings ---------- */

export async function getSetting(key) {
  await ensureDatabase();
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? '';
}

export function setSetting(key, value) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/* ---------- Reset data contoh ---------- */

/** Mengganti seluruh produk dan edukasi dengan data contoh. */
export async function resetCatalog(products, guides) {
  await prisma.$transaction([
    prisma.product.deleteMany(),
    prisma.guide.deleteMany(),
    prisma.product.createMany({ data: products }),
    prisma.guide.createMany({ data: guides }),
  ]);

  await assignProductOwners();

  const [nextProducts, nextGuides] = await Promise.all([listProducts(), listGuides()]);
  return { products: nextProducts, guides: nextGuides };
}
