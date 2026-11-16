import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });

  try {
    // Ambil data terbaru (termasuk nomor WhatsApp) dari database.
    return NextResponse.json({ user: (await getUserById(user.id)) ?? user });
  } catch {
    return NextResponse.json({ user });
  }
}
