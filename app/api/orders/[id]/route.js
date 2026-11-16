import { NextResponse } from 'next/server';
import { authorize, deleteOrder, getOrderById, updateOrder } from '@/lib/db';

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

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  // Untuk webhook atau update status internal
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
  }

  const updateData = {};
  if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus;
  if (body.status) updateData.status = body.status;
  if (body.paymentId) updateData.paymentId = body.paymentId;

  try {
    const updated = await updateOrder(id, updateData);
    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error('PATCH /api/orders/%s gagal:', id, error);
    return NextResponse.json({ error: 'Gagal memperbarui pesanan.' }, { status: 500 });
  }
}
