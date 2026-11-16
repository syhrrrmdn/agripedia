import { useState, useMemo } from 'react';
import { formatRupiah } from '@/lib/format';
import { productPhoto } from '@/lib/data';

export default function OrderModal({ product, products, onSave, onClose, notify }) {
  const [productId, setProductId] = useState(product?.id ?? products[0]?.id ?? '');
  const [jumlah, setJumlah] = useState('1');
  const [catatan, setCatatan] = useState('');
  const [alamat, setAlamat] = useState('');
  const [metode, setMetode] = useState(null); // 'whatsapp' | 'online'
  const [loading, setLoading] = useState(false);

  const dipilih = useMemo(() => products.find((item) => item.id === productId) ?? null, [products, productId]);
  const angka = Number(jumlah) || 0;
  const total = dipilih ? dipilih.harga * angka : 0;
  const photo = dipilih ? productPhoto(dipilih) : null;

  const submit = async (event) => {
    event.preventDefault();

    if (!productId) {
      notify('Pilih produk yang ingin dipesan.');
      return;
    }

    if (!Number.isInteger(angka) || angka < 1) {
      notify('Jumlah harus bilangan bulat minimal 1.');
      document.getElementById('jumlah')?.focus();
      return;
    }

    if (!alamat.trim()) {
      notify('Alamat pengiriman wajib diisi.');
      document.getElementById('alamat')?.focus();
      return;
    }

    if (!metode) {
      notify('Pilih metode pemesanan terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        productId,
        jumlah: angka,
        catatan: catatan.trim(),
        alamat: alamat.trim(),
        metode,
        // pass product info for WhatsApp link builder
        _product: dipilih,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop show" role="dialog" aria-modal="true" onClick={onClose}>
      <form
        className="modal order-modal"
        onSubmit={submit}
        noValidate
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h2>🛒 Buat Pesanan</h2>
          <button className="close" type="button" aria-label="Tutup" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Product Summary */}
        {dipilih ? (
          <div className="order-product-summary">
            {photo ? (
              <div className="order-summary-photo">
                <img
                  src={photo.url}
                  alt={dipilih.nama}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : null}
            <div className="order-summary-info">
              <div className="order-summary-name">{dipilih.nama}</div>
              <div className="order-summary-detail">
                {dipilih.asal ? <span>📍 {dipilih.asal}</span> : null}
                <span className="order-summary-price">
                  {formatRupiah(dipilih.harga)}
                  {dipilih.satuan ? <small> / {dipilih.satuan}</small> : null}
                </span>
              </div>
              {dipilih.penjual ? (
                <div className="order-summary-seller">
                  <span className="seller-avatar xs">
                    {(dipilih.penjual.nama ?? '?').slice(0, 1).toUpperCase()}
                  </span>
                  <span>{dipilih.penjual.nama}</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="form-grid">
          {/* Product selector (only if no specific product was passed) */}
          {!product ? (
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
          ) : null}

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
            <label>Perkiraan Total</label>
            <div className="order-total-display">{formatRupiah(total)}</div>
          </div>

          <div className="field full">
            <label htmlFor="alamat">Alamat Pengiriman *</label>
            <textarea
              id="alamat"
              maxLength={300}
              placeholder="Masukkan alamat lengkap pengiriman..."
              required
              value={alamat}
              onChange={(event) => setAlamat(event.target.value)}
              rows={2}
            />
          </div>

          <div className="field full">
            <label htmlFor="catatan">Catatan (Opsional)</label>
            <textarea
              id="catatan"
              maxLength={200}
              placeholder="Contoh: minta dikirim pekan depan"
              value={catatan}
              onChange={(event) => setCatatan(event.target.value)}
              rows={2}
            />
          </div>

          {/* Method Selector */}
          <div className="field full">
            <label>Metode Pemesanan *</label>
            <div className="order-method-selector">
              <button
                type="button"
                className={`order-method-card${metode === 'whatsapp' ? ' active' : ''}`}
                onClick={() => setMetode('whatsapp')}
              >
                <div className="method-icon wa">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8 8 0 0 1-11.7 7.2L4 20.5l1.8-5.2A8 8 0 1 1 21 11.5z" />
                  </svg>
                </div>
                <div className="method-text">
                  <strong>💬 Pesan via WhatsApp</strong>
                  <span>Langsung chat dengan penjual. Bayar saat barang diterima (COD).</span>
                </div>
                {metode === 'whatsapp' ? <span className="method-check">✓</span> : null}
              </button>

              <button
                type="button"
                className={`order-method-card${metode === 'online' ? ' active' : ''}`}
                onClick={() => setMetode('online')}
              >
                <div className="method-icon online">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div className="method-text">
                  <strong>💳 Bayar Online</strong>
                  <span>QRIS, Transfer Bank, E-Wallet, Kartu Kredit via Midtrans.</span>
                </div>
                {metode === 'online' ? <span className="method-check">✓</span> : null}
              </button>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn secondary" type="button" onClick={onClose} disabled={loading}>
            Batal
          </button>
          <button
            className={`btn${metode === 'whatsapp' ? ' wa-btn' : metode === 'online' ? ' pay-btn' : ''}`}
            type="submit"
            disabled={loading || !metode}
          >
            {loading
              ? '⏳ Memproses...'
              : metode === 'whatsapp'
              ? '💬 Pesan via WhatsApp'
              : metode === 'online'
              ? '💳 Bayar Sekarang'
              : 'Pilih Metode'}
          </button>
        </div>
      </form>
    </div>
  );
}
