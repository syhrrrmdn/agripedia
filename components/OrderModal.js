import { useState } from 'react';
import { formatRupiah } from '@/lib/format';

export default function OrderModal({ product, products, onSave, onClose, notify }) {
  const [productId, setProductId] = useState(product?.id ?? products[0]?.id ?? '');
  const [jumlah, setJumlah] = useState('1');
  const [catatan, setCatatan] = useState('');

  const dipilih = products.find((item) => item.id === productId) ?? null;

  const submit = (event) => {
    event.preventDefault();

    if (!productId) {
      notify('Pilih produk yang ingin dipesan.');
      return;
    }

    const angka = Number(jumlah);
    if (!Number.isInteger(angka) || angka < 1) {
      notify('Jumlah harus bilangan bulat minimal 1.');
      document.getElementById('jumlah')?.focus();
      return;
    }

    onSave({ productId, jumlah: angka, catatan: catatan.trim() });
  };

  return (
    <div className="modal-backdrop show" role="dialog" aria-modal="true" onClick={onClose}>
      <form className="modal" onSubmit={submit} noValidate onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>Buat pesanan</h2>
          <button className="close" type="button" aria-label="Tutup" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="form-grid">
          <div className="field full">
            <label htmlFor="produk">Produk *</label>
            <select id="produk" value={productId} onChange={(event) => setProductId(event.target.value)}>
              {products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                  {item.penjual?.nama ? ` — ${item.penjual.nama}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="jumlah">Jumlah *</label>
            <input
              id="jumlah"
              type="number"
              min="1"
              step="1"
              required
              value={jumlah}
              onChange={(event) => setJumlah(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="penjualProduk">Penjual</label>
            <input
              id="penjualProduk"
              readOnly
              value={
                dipilih?.penjual
                  ? `${dipilih.penjual.nama}${dipilih.penjual.waNumber ? ` · +${dipilih.penjual.waNumber}` : ' · nomor WA belum diisi'}`
                  : dipilih
                    ? 'Belum ada penjual'
                    : '—'
              }
            />
          </div>
          <div className="field full">
            <label htmlFor="catatan">Catatan</label>
            <textarea
              id="catatan"
              maxLength={200}
              placeholder="Contoh: minta dikirim pekan depan"
              value={catatan}
              onChange={(event) => setCatatan(event.target.value)}
            />
          </div>
          {dipilih ? (
            <div className="field full">
              <div className="notice">
                Perkiraan total: {formatRupiah(dipilih.harga * (Number(jumlah) || 0))}
              </div>
            </div>
          ) : null}
        </div>
        <div className="modal-actions">
          <button className="btn secondary" type="button" onClick={onClose}>
            Batal
          </button>
          <button className="btn" type="submit">
            Simpan pesanan
          </button>
        </div>
      </form>
    </div>
  );
}
