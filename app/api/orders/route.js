import { NextResponse } from 'next/server';
import { authorize, createOrder, getProductById } from '@/lib/db';
import { createSnapToken } from '@/lib/midtrans';

export async function GET() {
  const { user, response } = await authorize(['buyer']);
  if (response) return response;

  try {
    const { listOrdersByBuyer } = await import('@/lib/db');
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
  const metode = body.metode === 'online' ? 'online' : 'whatsapp';
  const alamat = String(body.alamat ?? '').trim();

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

  const total = Number(product.harga) * jumlah;

  try {
    // Buat pesanan di database
    const order = await createOrder({
      buyerId: user.id,
      productId,
      jumlah,
      catatan,
      metode,
      alamat,
      total,
      status: metode === 'online' ? 'menunggu_bayar' : 'menunggu',
      paymentStatus: metode === 'online' ? 'pending' : 'manual',
    });

    // Jika online, buat Snap token Midtrans
    if (metode === 'online') {
      try {
        const snap = await createSnapToken({
          orderId: order.id,
          grossAmount: total,
          productName: product.nama,
          qty: jumlah,
          price: Number(product.harga),
          customer: { nama: user.nama, email: user.email },
        });

        // Simpan snap token ke order
        const { updateOrder } = await import('@/lib/db');
        const updated = await updateOrder(order.id, {
          snapToken: snap.token,
          paymentId: snap.token,
        });

        return NextResponse.json({
          order: updated,
          snapToken: snap.token,
        }, { status: 201 });
      } catch (snapError) {
        console.error('Midtrans Snap error:', snapError);
        // Hapus order yang gagal dibayar
        const { deleteOrder } = await import('@/lib/db');
        await deleteOrder(order.id).catch(() => {});
        return NextResponse.json({
          error: snapError.message || 'Gagal membuat transaksi pembayaran. Pastikan kunci Midtrans sudah dikonfigurasi.',
        }, { status: 500 });
      }
    }

    // WhatsApp flow — langsung kembalikan order
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('POST /api/orders gagal:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pesanan.' }, { status: 500 });
  }
}
