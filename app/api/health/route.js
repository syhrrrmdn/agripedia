import { NextResponse } from 'next/server';
import { ensureDatabase } from '@/lib/bootstrap';
import prisma from '@/lib/prisma';

// Endpoint diagnostik: memastikan tabel + data contoh siap dan melaporkan jumlah barisnya.
// Berguna untuk memeriksa koneksi database pada deployment tanpa membuka log server.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDatabase();
    const [products, guides, users] = await Promise.all([
      prisma.product.count(),
      prisma.guide.count(),
      prisma.user.count(),
    ]);
    return NextResponse.json({ ok: true, products, guides, users });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        code: error?.code ?? null,
        message: String(error?.message ?? error).slice(0, 400),
      },
      { status: 500 },
    );
  }
}
