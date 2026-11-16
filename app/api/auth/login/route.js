import { NextResponse } from 'next/server';
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from '@/lib/auth';
import { getUserByUsername } from '@/lib/db';
import { verifyPassword } from '@/lib/password';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const username = String(body.username ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  if (!username || !password) {
    return NextResponse.json({ error: 'Nama pengguna dan password wajib diisi.' }, { status: 400 });
  }

  const user = await getUserByUsername(username);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Nama pengguna atau password salah.' }, { status: 401 });
  }

  const session = { id: user.id, username: user.username, nama: user.nama, role: user.role };
  const response = NextResponse.json({ user: session });
  response.cookies.set(SESSION_COOKIE, createSessionToken(session), sessionCookieOptions);
  return response;
}
