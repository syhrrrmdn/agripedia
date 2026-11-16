import { NextResponse } from 'next/server';
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from '@/lib/auth';
import { createUser, getUserByEmail } from '@/lib/db';
import { hashPassword } from '@/lib/password';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = ['buyer', 'penjual'];

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const nama = String(body.nama ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const confirm = String(body.confirm ?? '');
  const role = ALLOWED_ROLES.includes(body.role) ? body.role : 'buyer';

  if (!nama || !email || !password) {
    return NextResponse.json({ error: 'Nama, email, dan password wajib diisi.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password minimal 6 karakter.' }, { status: 400 });
  }
  if (password !== confirm) {
    return NextResponse.json({ error: 'Konfirmasi password tidak cocok.' }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
  }

  const user = await createUser({
    nama,
    email,
    role,
    passwordHash: hashPassword(password),
  });

  const session = { id: user.id, email: user.email, nama: user.nama, role: user.role };
  const response = NextResponse.json(
    { user: { ...session, waNumber: user.waNumber ?? '' } },
    { status: 201 },
  );
  response.cookies.set(SESSION_COOKIE, createSessionToken(session), sessionCookieOptions);
  return response;
}
