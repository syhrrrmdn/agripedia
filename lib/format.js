/** Utilitas format angka/mata uang dan pembentuk tautan. */

/** Format Rupiah, contoh: 92000 -> "Rp 92.000". */
export function formatRupiah(value) {
  const angka = Number(value);
  const aman = Number.isFinite(angka) ? angka : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(aman);
}

/** Format angka ribuan, contoh: 1200 -> "1.200". */
export function formatNumber(value) {
  const angka = Number(value);
  return Number.isFinite(angka) ? angka.toLocaleString('id-ID') : '0';
}

/** Tautan WhatsApp berisi pesan pesanan siap kirim. */
export function buildWhatsAppLink(waNumber, product) {
  const satuan = product.satuan ? ` (${product.satuan})` : '';
  const pesan = `Halo Kak, saya mau pesan ${product.nama}${satuan} dari Agripedia, `
    + `harga ${formatRupiah(product.harga)}. Apakah masih tersedia?`;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(pesan)}`;
}

/** Teks status nomor WhatsApp pada panel pengaturan. */
export function waStatusText(waNumber) {
  return waNumber
    ? `Nomor aktif: +${waNumber}. Tombol pesan akan diarahkan ke nomor ini.`
    : 'Belum ada nomor khusus. Tombol pesan memakai tautan WhatsApp umum.';
}
