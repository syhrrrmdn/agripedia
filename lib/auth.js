/**
 * Sesi login berbasis cookie bertanda tangan (HMAC-SHA256).
 * Hanya boleh diimpor dari kode sisi server.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'agripedia_session';
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 jam

function secret() {
  return process.env.AUTH_SECRET ?? 'agripedia-dev-secret-ganti-di-produksi';
}

/** Opsi cookie sesi: tidak bisa dibaca JavaScript klien. */
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_MAX_AGE,
  secure: process.env.NODE_ENV === 'production',
};

function sign(payload) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

/** Membuat token sesi berisi identitas user dan waktu kedaluwarsa. */
export function createSessionToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      nama: user.nama,
      role: user.role,
      exp: Date.now() + SESSION_MAX_AGE * 1000,
    }),
  ).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

/** Memeriksa tanda tangan dan masa berlaku token; mengembalikan user atau null. */
export function verifySessionToken(token) {
  if (typeof token !== 'string') return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || data.exp < Date.now()) return null;
    return { id: data.sub, email: data.email, nama: data.nama, role: data.role };
  } catch {
    return null;
  }
}

/** User yang sedang login berdasarkan cookie permintaan, atau null. */
export async function getCurrentUser() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
