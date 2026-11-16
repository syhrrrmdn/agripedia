import { NextResponse } from 'next/server';
import { authorize, updateUserWa } from '@/lib/db';
import { normalizeWaNumber } from '@/lib/data';

/** Nomor WhatsApp milik sendiri (admin punya nomor default toko di menu pengaturan). */
export async function PUT(request) {
  const { user, response } = await authorize(['admin', 'penjual']);
  if (response) return response;

  const body = await request.json().catch(() => ({}));
  const raw = String(body.waNumber ?? '').trim();
  const waNumber = normalizeWaNumber(raw);

  if (raw && (waNumber.length < 10 || waNumber.length > 15)) {
    return NextResponse.json(
      { error: 'Nomor tidak valid. Masukkan 10–15 digit termasuk kode negara.' },
      { status: 400 },
    );
  }

  try {
    const updated = await updateUserWa(user.id, waNumber);
    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('PUT /api/profile gagal:', error);
    return NextResponse.json({ error: 'Gagal menyimpan nomor WhatsApp.' }, { status: 500 });
  }
}
