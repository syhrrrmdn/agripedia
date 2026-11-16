import { NextResponse } from 'next/server';
import { authorize, deleteOrder, getOrderById } from '@/lib/db';

export async function DELETE(request, { params }) {
  const { user, response } = await authorize(['buyer']);
  if (response) return response;

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
  }
  if (order.buyerId !== user.id) {
    return NextResponse.json({ error: 'Pesanan ini milik pembeli lain.' }, { status: 403 });
  }

  try {
    await deleteOrder(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/orders/%s gagal:', id, error);
    return NextResponse.json({ error: 'Pesanan gagal dihapus.' }, { status: 404 });
  }
}
