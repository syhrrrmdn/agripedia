import { useEffect, useRef, useState } from 'react';
import { computeStats } from '@/lib/data';
import { formatNumber, formatRupiah, waStatusText } from '@/lib/format';
import { roleLabel } from '@/lib/roles';

export default function DashboardView({
  user,
  canManageProducts,
  canManageGuides,
  canManageWa,
  canReset,
  products,
  guides,
  waNumber,
  onSaveWa,
  onReset,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAddGuide,
  onEditGuide,
  onDeleteGuide,
}) {
  const [tab, setTab] = useState('produk');
  const [waInput, setWaInput] = useState(waNumber);
  const panelRef = useRef(null);
  const waInputRef = useRef(null);

  useEffect(() => setWaInput(waNumber), [waNumber]);

  const stats = computeStats(products);
  const readOnly = !canManageProducts && !canManageGuides;

  const focusWaPanel = () => {
    setTab('produk');
    window.setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      waInputRef.current?.focus();
    }, 0);
  };

  const submitWa = (event) => {
    event.preventDefault();
    if (!onSaveWa(waInput)) waInputRef.current?.focus();
  };

  return (
    <section id="dashboardView" className="dashboard">
      <div className="dash-head">
        <div>
          <div className="eyebrow">Ruang pengelola</div>
          <h1>Dashboard toko</h1>
          <div className="muted">
            Masuk sebagai {user?.nama} · {roleLabel(user?.role)}.{' '}
            {readOnly ? 'Peran ini hanya dapat melihat data.' : 'Kelola katalog dan pantau stok produkmu.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {canManageWa ? (
            <button type="button" className="btn secondary" onClick={focusWaPanel}>
              Pengaturan WhatsApp
            </button>
          ) : null}
          {canReset ? (
            <button type="button" className="btn secondary" onClick={onReset}>
              Reset demo
            </button>
          ) : null}
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-label">TOTAL PRODUK</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat">
          <div className="stat-label">TOTAL STOK</div>
          <div className="stat-value">{formatNumber(stats.totalStok)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">KATEGORI AKTIF</div>
          <div className="stat-value">{stats.kategori}</div>
        </div>
        <div className="stat">
          <div className="stat-label">TOTAL EDUKASI</div>
          <div className="stat-value">{guides.length}</div>
        </div>
      </div>

      {readOnly ? (
        <div className="permission-note">
          Anda masuk sebagai {roleLabel(user?.role)}. Seluruh isi dapat dilihat, tetapi penambahan, perubahan, dan
          penghapusan data hanya bisa dilakukan oleh Admin atau Penjual.
        </div>
      ) : null}

      <div className="chips" role="tablist" aria-label="Bagian dashboard">
        <button
          type="button"
          className={`chip${tab === 'produk' ? ' active' : ''}`}
          role="tab"
          aria-selected={tab === 'produk'}
          onClick={() => setTab('produk')}
        >
          Kelola produk
        </button>
        <button
          type="button"
          className={`chip${tab === 'edukasi' ? ' active' : ''}`}
          role="tab"
          aria-selected={tab === 'edukasi'}
          onClick={() => setTab('edukasi')}
        >
          Kelola edukasi
        </button>
      </div>

      {tab === 'produk' ? (
        <>
          {canManageWa ? (
            <div className="panel" ref={panelRef} style={{ marginBottom: 18 }}>
              <div className="panel-head">
                <div>
                  <h2>Nomor WhatsApp toko</h2>
                  <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                    Nomor ini digunakan sebagai tujuan tombol pesan pada semua produk.
                  </div>
                </div>
              </div>
              <form onSubmit={submitWa} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end' }}>
                <div className="field" style={{ flex: 1, minWidth: 220 }}>
                  <label htmlFor="waNumber">Nomor WhatsApp (kode negara + nomor)</label>
                  <input
                    id="waNumber"
                    ref={waInputRef}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Contoh: 6281234567890"
                    value={waInput}
                    onChange={(event) => setWaInput(event.target.value)}
                  />
                </div>
                <button className="btn" type="submit">
                  Simpan nomor
                </button>
              </form>
              <div className="notice">
                Boleh masukkan format 08..., 62..., atau +62.... Spasi dan tanda hubung akan diabaikan. Kosongkan untuk
                memakai tautan WhatsApp umum.
              </div>
              <div className="notice" aria-live="polite">
                {waStatusText(waNumber)}
              </div>
            </div>
          ) : null}

          <div className="panel">
            <div className="panel-head">
              <h2>Daftar produk</h2>
              {canManageProducts ? (
                <button type="button" className="btn" onClick={onAddProduct}>
                  Tambah produk
                </button>
              ) : null}
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Stok</th>
                    <th>Unggulan</th>
                    {canManageProducts ? <th>Aksi</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={canManageProducts ? 6 : 5} className="empty">
                        Belum ada produk. Tambahkan produk terlebih dahulu.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <strong>{product.nama}</strong>
                          {product.asal ? (
                            <>
                              <br />
                              <span className="muted">{product.asal}</span>
                            </>
                          ) : null}
                        </td>
                        <td>{product.kategori}</td>
                        <td>{formatRupiah(product.harga)}</td>
                        <td>{formatNumber(product.stok)}</td>
                        <td>{product.unggulan ? 'Ya' : '—'}</td>
                        {canManageProducts ? (
                          <td>
                            <div className="actions">
                              <button
                                className="btn secondary small"
                                type="button"
                                onClick={() => onEditProduct(product)}
                              >
                                Edit
                              </button>
                              <button className="btn danger small" type="button" onClick={() => onDeleteProduct(product)}>
                                Hapus
                              </button>
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="notice">
              {canManageProducts
                ? 'Perubahan disimpan pada browser ini melalui localStorage. Tidak ada backend untuk data produk.'
                : 'Anda hanya dapat melihat data. Hubungi Admin atau Penjual untuk mengubah katalog.'}
            </div>
          </div>
        </>
      ) : (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Daftar edukasi</h2>
              {canManageGuides ? (
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                  Tambah tutorial budidaya atau bertani baru. Isi langkah satu per baris.
                </div>
              ) : null}
            </div>
            {canManageGuides ? (
              <button type="button" className="btn" onClick={onAddGuide}>
                Tambah edukasi
              </button>
            ) : null}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Tingkat</th>
                  <th>Langkah</th>
                  {canManageGuides ? <th>Aksi</th> : null}
                </tr>
              </thead>
              <tbody>
                {guides.length === 0 ? (
                  <tr>
                    <td colSpan={canManageGuides ? 5 : 4} className="empty">
                      Belum ada edukasi. Tambahkan tutorial terlebih dahulu.
                    </td>
                  </tr>
                ) : (
                  guides.map((guide) => (
                    <tr key={guide.id}>
                      <td>
                        <strong>{guide.judul}</strong>
                        {guide.topik ? (
                          <>
                            <br />
                            <span className="muted">{guide.topik}</span>
                          </>
                        ) : null}
                      </td>
                      <td>{guide.kategori}</td>
                      <td>{guide.tingkat}</td>
                      <td>{formatNumber(guide.langkah.length)}</td>
                      {canManageGuides ? (
                        <td>
                          <div className="actions">
                            <button className="btn secondary small" type="button" onClick={() => onEditGuide(guide)}>
                              Edit
                            </button>
                            <button className="btn danger small" type="button" onClick={() => onDeleteGuide(guide)}>
                              Hapus
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="notice">
            {canManageGuides
              ? 'Perubahan disimpan pada browser ini melalui localStorage. Tidak ada backend untuk data edukasi.'
              : 'Hanya Admin yang dapat menambah atau mengubah edukasi.'}
          </div>
        </div>
      )}
    </section>
  );
}
