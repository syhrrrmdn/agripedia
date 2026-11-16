import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * AgriPedia — reset password (mode demo).
 * Karena belum ada layanan email, password baru dibuat acak dan
 * dikembalikan ke layar untuk dicatat pengguna.
 * Di produksi, ganti bagian ini dengan kirim email berisi link reset.
 */
function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const email = String(body.email ?? '').trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: 'Email wajib diisi.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  // Jangan bocorkan apakah email terdaftar atau tidak.
  if (!user) {
    return NextResponse.json({ ok: true, message: 'Jika email terdaftar, password baru telah dibuat.' });
  }

  const newPassword = generatePassword();
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(newPassword) },
  });

  return NextResponse.json({ ok: true, message: 'Password berhasil direset.', newPassword });
}
