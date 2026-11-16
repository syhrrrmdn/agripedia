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

/** Tautan WhatsApp berisi rincian pesanan yang sudah tersimpan. */
export function buildOrderWhatsAppLink(waNumber, product, jumlah = 1) {
  const total = formatRupiah(Number(product.harga) * Number(jumlah));
  const pesan = `Halo Kak, saya mau pesan ${product.nama} sebanyak ${jumlah}`
    + `${product.satuan ? ` ${product.satuan}` : ''} dari Agripedia. `
    + `Total perkiraan ${total}. Apakah masih tersedia?`;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(pesan)}`;
}

/** Tautan WhatsApp untuk pesan langsung dengan detail lengkap (alamat + catatan). */
export function buildDirectWhatsAppLink(waNumber, product, jumlah, catatan, alamat) {
  const total = formatRupiah(Number(product.harga) * Number(jumlah));
  let pesan = `Halo Kak, saya mau pesan dari *Agripedia*:\n\n`
    + `📦 *Produk:* ${product.nama}\n`
    + `📊 *Jumlah:* ${jumlah}${product.satuan ? ` ${product.satuan}` : ''}\n`
    + `💰 *Total:* ${total}\n`;
  if (alamat) pesan += `📍 *Alamat:* ${alamat}\n`;
  if (catatan) pesan += `📝 *Catatan:* ${catatan}\n`;
  pesan += `\nApakah produknya masih tersedia? Terima kasih 🙏`;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(pesan)}`;
}

/** Teks status nomor WhatsApp pada panel pengaturan. */
export function waStatusText(waNumber) {
  return waNumber
    ? `Nomor aktif: +${waNumber}. Tombol pesan akan diarahkan ke nomor ini.`
    : 'Belum ada nomor khusus. Tombol pesan memakai tautan WhatsApp umum.';
}
