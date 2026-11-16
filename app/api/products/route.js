import { NextResponse } from 'next/server';
import { authorize, createProduct, getUserById, listProducts } from '@/lib/db';
import { validateProduct } from '@/lib/data';

export async function GET() {
  try {
    return NextResponse.json({ products: await listProducts() });
  } catch (error) {
    console.error('GET /api/products gagal:', error);
    return NextResponse.json({ error: 'Gagal memuat produk.' }, { status: 500 });
  }
}

/** Menentukan pemilik produk: penjual selalu dirinya sendiri, admin memilih dari daftar. */
async function resolveOwner(user, body) {
  if (user.role === 'penjual') return { penjualId: user.id };
  if (body.penjualId === null || body.penjualId === undefined || body.penjualId === '') {
    return { penjualId: null };
  }
  const owner = await getUserById(body.penjualId);
  if (!owner || owner.role !== 'penjual') {
    return { error: 'Penjual yang dipilih tidak ditemukan.' };
  }
  return { penjualId: owner.id };
}

export async function POST(request) {
  const { user, response } = await authorize(['admin', 'penjual']);
  if (response) return response;

  const body = await request.json().catch(() => ({}));
  const hasil = validateProduct(body);
  if (!hasil.ok) {
    return NextResponse.json({ error: hasil.message, field: hasil.field }, { status: 400 });
  }

  const owner = await resolveOwner(user, body);
  if (owner.error) {
    return NextResponse.json({ error: owner.error, field: 'penjualId' }, { status: 400 });
  }

  try {
    const product = await createProduct({ ...hasil.value, penjualId: owner.penjualId });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('POST /api/products gagal:', error);
    return NextResponse.json({ error: 'Gagal menyimpan produk.' }, { status: 500 });
  }
}
