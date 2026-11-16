import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

/** Membuat hash password dengan garam acak. Format tersimpan: "salt:hash". */
export function hashPassword(plain) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(String(plain), salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

/** Membandingkan password dengan hash tersimpan secara waktu-tetap. */
export function verifyPassword(plain, stored) {
  const [salt, hash] = String(stored ?? '').split(':');
  if (!salt || !hash) return false;

  let expected;
  try {
    expected = Buffer.from(hash, 'hex');
  } catch {
    return false;
  }
  if (expected.length === 0) return false;

  const actual = scryptSync(String(plain), salt, expected.length);
  return timingSafeEqual(expected, actual);
}
