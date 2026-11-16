import { NextResponse } from 'next/server';
import { authorize, deleteProduct, getProductById, getUserById, updateProduct } from '@/lib/db';
import { validateProduct } from '@/lib/data';

/** Penjual hanya boleh menyentuh produk miliknya; admin bebas. */
function isOwner(user, product) {
  return user.role === 'admin' || product.penjualId === user.id;
}

export async function PUT(request, { params }) {
  const { user, response } = await authorize(['admin', 'penjual']);
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const hasil = validateProduct(body);
  if (!hasil.ok) {
    return NextResponse.json({ error: hasil.message, field: hasil.field }, { status: 400 });
  }

  const existing = await getProductById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
  }
  if (!isOwner(user, existing)) {
    return NextResponse.json({ error: 'Produk ini milik penjual lain.' }, { status: 403 });
  }

  // Admin boleh memindahkan kepemilikan produk ke penjual lain.
  let penjualId = existing.penjualId;
  if (user.role === 'admin' && 'penjualId' in body) {
    if (body.penjualId === null || body.penjualId === '' || body.penjualId === undefined) {
      penjualId = null;
    } else {
      const owner = await getUserById(body.penjualId);
      if (!owner || owner.role !== 'penjual') {
        return NextResponse.json({ error: 'Penjual yang dipilih tidak ditemukan.', field: 'penjualId' }, { status: 400 });
      }
      penjualId = owner.id;
    }
  }

  try {
    const product = await updateProduct(id, { ...hasil.value, penjualId });
    return NextResponse.json({ product });
  } catch (error) {
    console.error('PUT /api/products/%s gagal:', id, error);
    return NextResponse.json({ error: 'Produk tidak ditemukan atau gagal diperbarui.' }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  const { user, response } = await authorize(['admin', 'penjual']);
  if (response) return response;

  const { id } = await params;
  const existing = await getProductById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
  }
  if (!isOwner(user, existing)) {
    return NextResponse.json({ error: 'Produk ini milik penjual lain.' }, { status: 403 });
  }

  try {
    await deleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/products/%s gagal:', id, error);
    return NextResponse.json({ error: 'Produk tidak ditemukan atau gagal dihapus.' }, { status: 404 });
  }
}
