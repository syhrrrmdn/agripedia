import { NextResponse } from 'next/server';
import { authorize, createProduct, listProducts } from '@/lib/db';
import { validateProduct } from '@/lib/data';

export async function GET() {
  try {
    return NextResponse.json({ products: await listProducts() });
  } catch (error) {
    console.error('GET /api/products gagal:', error);
    return NextResponse.json({ error: 'Gagal memuat produk.' }, { status: 500 });
  }
}

export async function POST(request) {
  const { response } = await authorize(['admin', 'penjual']);
  if (response) return response;

  const body = await request.json().catch(() => ({}));
  const hasil = validateProduct(body);
  if (!hasil.ok) {
    return NextResponse.json({ error: hasil.message, field: hasil.field }, { status: 400 });
  }

  try {
    return NextResponse.json({ product: await createProduct(hasil.value) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/products gagal:', error);
    return NextResponse.json({ error: 'Gagal menyimpan produk.' }, { status: 500 });
  }
}
