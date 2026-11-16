import { NextResponse } from 'next/server';
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from '@/lib/auth';
import { getUserByEmail } from '@/lib/db';
import { verifyPassword } from '@/lib/password';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });
  }

  const session = { id: user.id, email: user.email, nama: user.nama, role: user.role };
  const response = NextResponse.json({ user: session });
  response.cookies.set(SESSION_COOKIE, createSessionToken(session), sessionCookieOptions);
  return response;
}
