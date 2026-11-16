import { NextResponse } from 'next/server';
import { authorize, getSetting, setSetting } from '@/lib/db';
import { normalizeWaNumber } from '@/lib/data';

export async function GET() {
  try {
    return NextResponse.json({ waNumber: await getSetting('wa_number') });
  } catch (error) {
    console.error('GET /api/settings gagal:', error);
    return NextResponse.json({ error: 'Gagal memuat pengaturan.' }, { status: 500 });
  }
}

export async function PUT(request) {
  const { response } = await authorize(['admin']);
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
    await setSetting('wa_number', waNumber);
    return NextResponse.json({ waNumber });
  } catch (error) {
    console.error('PUT /api/settings gagal:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan.' }, { status: 500 });
  }
}
