import { NextResponse } from 'next/server';
import { verifyNotificationSignature, mapTransactionStatus } from '@/lib/midtrans';

/**
 * Webhook endpoint untuk menerima notifikasi dari Midtrans.
 * URL ini harus didaftarkan di Dashboard Midtrans → Settings → Payment Notification URL
 * Contoh: https://yourdomain.com/api/payments/notification
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      transaction_id: transactionId,
    } = body;

    // Verifikasi signature dari Midtrans
    const isValid = verifyNotificationSignature({
      orderId,
      statusCode,
      grossAmount,
      signatureKey,
    });

    if (!isValid) {
      console.error('Midtrans notification: invalid signature for order', orderId);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Map ke status internal
    const paymentStatus = mapTransactionStatus(transactionStatus, fraudStatus);

    // Update order di database
    const { updateOrder, getOrderById } = await import('@/lib/db');
    const order = await getOrderById(orderId);

    if (!order) {
      console.error('Midtrans notification: order not found', orderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData = {
      paymentStatus,
      paymentId: transactionId || order.paymentId,
    };

    // Update status pesanan berdasarkan pembayaran
    if (paymentStatus === 'paid') {
      updateData.status = 'dikerjakan';
    } else if (paymentStatus === 'failed') {
      updateData.status = 'dibatalkan';
    }

    await updateOrder(orderId, updateData);

    console.log(`Midtrans notification: order ${orderId} → ${paymentStatus} (${transactionStatus})`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Midtrans notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
