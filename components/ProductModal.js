import { useState } from 'react';
import { CATEGORY_OPTIONS, validateProduct } from '@/lib/data';
import ImageField from '@/components/ImageField';

const EMPTY_FORM = {
  nama: '',
  kategori: 'Pertanian',
  harga: '',
  stok: '',
  satuan: '',
  imageUrl: '',
  asal: '',
  deskripsi: '',
  unggulan: false,
  penjualId: '',
};

function initialForm(product) {
  if (!product) return EMPTY_FORM;
  return {
    nama: product.nama,
    kategori: product.kategori,
    harga: String(product.harga),
    stok: String(product.stok),
    satuan: product.satuan || '',
    imageUrl: product.imageUrl || '',
    asal: product.asal || '',
    deskripsi: product.deskripsi || '',
    unggulan: Boolean(product.unggulan),
    penjualId: product.penjualId ? String(product.penjualId) : '',
  };
}

export default function ProductModal({ product, penjualOptions = [], showPenjual = false, onSave, onClose, notify }) {
  const [form, setForm] = useState(() => initialForm(product));

  const setField = (key) => (event) =>
    setForm((prev) => ({
      ...prev,
      [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    }));

  const submit = (event) => {
    event.preventDefault();

    const hasil = validateProduct(form);
    if (!hasil.ok) {
      notify(hasil.message);
      document.getElementById(hasil.field)?.focus();
      return;
    }

    // Pemilik produk hanya dikirim admin; penjual otomatis menjadi pemiliknya di server.
    if (showPenjual) {
      hasil.value.penjualId = form.penjualId === '' ? null : Number(form.penjualId);
    }

    onSave(hasil.value);
  };

  return (
    <div className="modal-backdrop show" role="dialog" aria-modal="true" onClick={onClose}>
      <form className="modal" onSubmit={submit} noValidate onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>{product ? 'Edit produk' : 'Tambah produk'}</h2>
          <button className="close" type="button" aria-label="Tutup" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="form-grid">
          <div className="field full">
            <label htmlFor="nama">Nama produk *</label>
            <input
              id="nama"
              required
              maxLength={80}
              placeholder="Contoh: Kopi Arabika Kintamani"
              value={form.nama}
              onChange={setField('nama')}
            />
          </div>
          <div className="field">
            <label htmlFor="kategori">Kategori *</label>
            <select id="kategori" value={form.kategori} onChange={setField('kategori')}>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="harga">Harga (Rp) *</label>
            <input
              id="harga"
              type="number"
              min="0"
              step="1"
              required
              placeholder="25000"
              value={form.harga}
              onChange={setField('harga')}
            />
          </div>
          <div className="field">
            <label htmlFor="stok">Stok (unit) *</label>
            <input
              id="stok"
              type="number"
              min="0"
              step="1"
              required
              placeholder="20"
              value={form.stok}
              onChange={setField('stok')}
            />
          </div>
          {showPenjual ? (
            <div className="field">
              <label htmlFor="penjualId">Penjual pemilik produk</label>
              <select id="penjualId" value={form.penjualId} onChange={setField('penjualId')}>
                <option value="">Belum ada pemilik</option>
                {penjualOptions.map((penjual) => (
                  <option key={penjual.id} value={penjual.id}>
                    {penjual.nama}
                    {penjual.waNumber ? ` (+${penjual.waNumber})` : ' (nomor WA belum diisi)'}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="field">
            <label htmlFor="satuan">Satuan jual</label>
            <input
              id="satuan"
              maxLength={20}
              placeholder="kg, ikat, 500 ml"
              value={form.satuan}
              onChange={setField('satuan')}
            />
          </div>
          <ImageField
            id="imageUrl"
            value={form.imageUrl}
            notify={notify}
            onChange={(imageUrl) => setForm((prev) => ({ ...prev, imageUrl }))}
          />
          <div className="field full">
            <label htmlFor="asal">Daerah asal</label>
            <input
              id="asal"
              maxLength={60}
              placeholder="Contoh: Cianjur, Jawa Barat"
              value={form.asal}
              onChange={setField('asal')}
            />
          </div>
          <div className="field full">
            <label htmlFor="deskripsi">Deskripsi</label>
            <textarea
              id="deskripsi"
              maxLength={300}
              placeholder="Ceritakan keunggulan produk..."
              value={form.deskripsi}
              onChange={setField('deskripsi')}
            />
          </div>
          <div className="field full">
            <label className="checkline" htmlFor="unggulan">
              <input id="unggulan" type="checkbox" checked={form.unggulan} onChange={setField('unggulan')} /> Tandai
              sebagai produk unggulan
            </label>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn secondary" type="button" onClick={onClose}>
            Batal
          </button>
          <button className="btn" type="submit">
            Simpan produk
          </button>
        </div>
      </form>
    </div>
  );
}
