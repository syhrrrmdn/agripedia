import { NextResponse } from 'next/server';
import { authorize, deleteGuide, updateGuide } from '@/lib/db';
import { validateGuide } from '@/lib/data';

export async function PUT(request, { params }) {
  const { response } = await authorize(['admin']);
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const hasil = validateGuide(body);
  if (!hasil.ok) {
    return NextResponse.json({ error: hasil.message, field: hasil.field }, { status: 400 });
  }

  try {
    return NextResponse.json({ guide: await updateGuide(id, hasil.value) });
  } catch (error) {
    console.error('PUT /api/guides/%s gagal:', id, error);
    return NextResponse.json({ error: 'Edukasi tidak ditemukan atau gagal diperbarui.' }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  const { response } = await authorize(['admin']);
  if (response) return response;

  const { id } = await params;
  try {
    await deleteGuide(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/guides/%s gagal:', id, error);
    return NextResponse.json({ error: 'Edukasi tidak ditemukan atau gagal dihapus.' }, { status: 404 });
  }
}
