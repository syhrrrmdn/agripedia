import { NextResponse } from 'next/server';
import { authorize, createGuide, listGuides } from '@/lib/db';
import { validateGuide } from '@/lib/data';

export async function GET() {
  try {
    return NextResponse.json({ guides: await listGuides() });
  } catch (error) {
    console.error('GET /api/guides gagal:', error);
    return NextResponse.json({ error: 'Gagal memuat edukasi.' }, { status: 500 });
  }
}

export async function POST(request) {
  const { response } = await authorize(['admin']);
  if (response) return response;

  const body = await request.json().catch(() => ({}));
  const hasil = validateGuide(body);
  if (!hasil.ok) {
    return NextResponse.json({ error: hasil.message, field: hasil.field }, { status: 400 });
  }

  try {
    return NextResponse.json({ guide: await createGuide(hasil.value) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/guides gagal:', error);
    return NextResponse.json({ error: 'Gagal menyimpan edukasi.' }, { status: 500 });
  }
}
