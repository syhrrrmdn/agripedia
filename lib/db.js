/**
 * AgriPedia — lapisan akses data berbasis Prisma (Supabase PostgreSQL).
 * HANYA boleh diimpor dari kode sisi server (route handler / server component).
 */

import { NextResponse } from 'next/server';
import prisma from './prisma.js';
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

export function getUserByEmail(email) {
  return prisma.user.findUnique({ where: { email: String(email ?? '').trim().toLowerCase() } });
}

export function listUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, nama: true, role: true, createdAt: true },
    orderBy: { id: 'asc' },
  });
}

export function createUser(data) {
  return prisma.user.create({ data });
}

/* ---------- Products ---------- */

const PRODUCT_ORDER = [{ unggulan: 'desc' }, { createdAt: 'asc' }];

export function listProducts() {
  return prisma.product.findMany({ orderBy: PRODUCT_ORDER });
}

export function createProduct(data) {
  return prisma.product.create({ data });
}

export function updateProduct(id, data) {
  return prisma.product.update({ where: { id }, data });
}

export function deleteProduct(id) {
  return prisma.product.delete({ where: { id } });
}

/* ---------- Guides ---------- */

const GUIDE_ORDER = [{ createdAt: 'asc' }];

export function listGuides() {
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

  const [nextProducts, nextGuides] = await Promise.all([listProducts(), listGuides()]);
  return { products: nextProducts, guides: nextGuides };
}
