import { NextResponse } from 'next/server';
import { authorize, deleteProduct, updateProduct } from '@/lib/db';
import { validateProduct } from '@/lib/data';

export async function PUT(request, { params }) {
  const { response } = await authorize(['admin', 'penjual']);
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const hasil = validateProduct(body);
  if (!hasil.ok) {
    return NextResponse.json({ error: hasil.message, field: hasil.field }, { status: 400 });
  }

  try {
    return NextResponse.json({ product: await updateProduct(id, hasil.value) });
  } catch (error) {
    console.error('PUT /api/products/%s gagal:', id, error);
    return NextResponse.json({ error: 'Produk tidak ditemukan atau gagal diperbarui.' }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  const { response } = await authorize(['admin', 'penjual']);
  if (response) return response;

  const { id } = await params;
  try {
    await deleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/products/%s gagal:', id, error);
    return NextResponse.json({ error: 'Produk tidak ditemukan atau gagal dihapus.' }, { status: 404 });
  }
}
