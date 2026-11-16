import { NextResponse } from 'next/server';
import { authorize, createOrder, getProductById, listOrdersByBuyer } from '@/lib/db';

export async function GET() {
  const { user, response } = await authorize(['buyer']);
  if (response) return response;

  try {
    return NextResponse.json({ orders: await listOrdersByBuyer(user.id) });
  } catch (error) {
    console.error('GET /api/orders gagal:', error);
    return NextResponse.json({ error: 'Gagal memuat pesanan.' }, { status: 500 });
  }
}

export async function POST(request) {
  const { user, response } = await authorize(['buyer']);
  if (response) return response;

  const body = await request.json().catch(() => ({}));
  const productId = String(body.productId ?? '').trim();
  const jumlah = Number(body.jumlah ?? 1);
  const catatan = String(body.catatan ?? '').trim();

  if (!productId) {
    return NextResponse.json({ error: 'Pilih produk yang ingin dipesan.', field: 'produk' }, { status: 400 });
  }
  if (!Number.isInteger(jumlah) || jumlah < 1 || jumlah > 999) {
    return NextResponse.json({ error: 'Jumlah harus bilangan bulat 1–999.', field: 'jumlah' }, { status: 400 });
  }

  const product = await getProductById(productId);
  if (!product) {
    return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
  }

  try {
    const order = await createOrder({ buyerId: user.id, productId, jumlah, catatan });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('POST /api/orders gagal:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pesanan.' }, { status: 500 });
  }
}
