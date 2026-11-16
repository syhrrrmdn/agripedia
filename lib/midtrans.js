/**
 * AgriPedia — Midtrans Snap API helper.
 * Menggunakan Midtrans Snap untuk halaman pembayaran.
 * HANYA boleh diimpor dari kode sisi server.
 */

import { createHash } from 'node:crypto';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? '';
const IS_PRODUCTION = process.env.MIDTRANS_PRODUCTION === 'true';

const SNAP_URL = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

/**
 * Membuat Snap token untuk popup pembayaran.
 * @param {object} params
 * @param {string} params.orderId - ID pesanan unik
 * @param {number} params.grossAmount - Total pembayaran (Rupiah)
 * @param {string} params.productName - Nama produk
 * @param {number} params.qty - Jumlah item
 * @param {number} params.price - Harga satuan
 * @param {object} params.customer - { nama, email }
 * @returns {Promise<{ token: string, redirect_url: string }>}
 */
export async function createSnapToken({
  orderId,
  grossAmount,
  productName,
  qty,
  price,
  customer,
}) {
  if (!MIDTRANS_SERVER_KEY) {
    throw new Error('MIDTRANS_SERVER_KEY belum dikonfigurasi di .env');
  }

  const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');

  const body = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    item_details: [
      {
        id: orderId,
        name: productName.slice(0, 50),
        price,
        quantity: qty,
      },
    ],
    customer_details: {
      first_name: customer.nama,
      email: customer.email,
    },
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/`,
    },
  };

  const response = await fetch(SNAP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Midtrans Snap error:', errorData);
    throw new Error(errorData.error_messages?.[0] ?? 'Gagal membuat transaksi pembayaran.');
  }

  return response.json();
}

/**
 * Verifikasi signature notifikasi dari Midtrans.
 * signature_key = SHA512(order_id + status_code + gross_amount + server_key)
 */
export function verifyNotificationSignature({ orderId, statusCode, grossAmount, signatureKey }) {
  const raw = `${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`;
  const expected = createHash('sha512').update(raw).digest('hex');
  return expected === signatureKey;
}

/**
 * Map status transaksi Midtrans ke status pembayaran internal.
 */
export function mapTransactionStatus(transactionStatus, fraudStatus) {
  if (transactionStatus === 'capture') {
    return fraudStatus === 'accept' ? 'paid' : 'pending';
  }
  if (transactionStatus === 'settlement') return 'paid';
  if (transactionStatus === 'pending') return 'pending';
  if (['deny', 'cancel', 'expire'].includes(transactionStatus)) return 'failed';
  return 'pending';
}
