import { NextResponse } from 'next/server';
import { authorize, listUsers } from '@/lib/db';

/** Daftar pengguna beserta nomor WhatsApp-nya (khusus admin). */
export async function GET() {
  const { response } = await authorize(['admin']);
  if (response) return response;

  try {
    return NextResponse.json({ users: await listUsers() });
  } catch (error) {
    console.error('GET /api/users gagal:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar pengguna.' }, { status: 500 });
  }
}
