import { useEffect, useRef, useState } from 'react';
import { computeStats } from '@/lib/data';
import { buildOrderWhatsAppLink, formatNumber, formatRupiah, waStatusText } from '@/lib/format';
import { roleLabel } from '@/lib/roles';

const JUDUL = {
  admin: 'Dashboard admin',
  penjual: 'Dashboard toko',
  buyer: 'Dashboard pembeli',
};

const KETERANGAN = {
  admin: 'Pantau seluruh produk, lihat siapa penjualnya, dan atur nomor WhatsApp setiap penjual.',
  penjual: 'Kelola katalog, stok, dan nomor WhatsApp milikmu sendiri.',
  buyer: 'Jelajahi produk dari para penjual, simpan pesanan, lalu hubungi penjual lewat WhatsApp.',
};

function namaPenjual(product) {
  if (!product.penjual) return 'Belum ada penjual';
  return product.penjual.waNumber
    ? `${product.penjual.nama} · +${product.penjual.waNumber}`
    : `${product.penjual.nama} · nomor WA belum diisi`;
}

export default function DashboardView({
  user,
  users,
  products,
  guides,
  orders,
  waNumber,
  onSaveWa,
  onSaveMyWa,
  onReset,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAddGuide,
  onEditGuide,
  onDeleteGuide,
  onOrder,
  onDeleteOrder,
}) {
  const role = user?.role ?? 'buyer';
  const isAdmin = role === 'admin';
  const isPenjual = role === 'penjual';
  const isBuyer = role === 'buyer';
  const canManageGuides = isAdmin;
  const canManageProducts = isAdmin || isPenjual;

  const [tab, setTab] = useState(isBuyer ? 'katalog' : 'produk');
  const [waInput, setWaInput] = useState(waNumber);
  const [myWaInput, setMyWaInput] = useState(user?.waNumber ?? '');
  const waPanelRef = useRef(null);
  const waInputRef = useRef(null);

  useEffect(() => setWaInput(waNumber), [waNumber]);
  useEffect(() => setMyWaInput(user?.waNumber ?? ''), [user?.waNumber]);

  // Penjual hanya melihat produk miliknya sendiri.
  const daftarProduk = isPenjual ? products.filter((p) => p.penjualId === user?.id) : products;
  const daftarPenjual = (users ?? []).filter((u) => u.role === 'penjual');
  const stats = computeStats(daftarProduk);

  const fokusNomorToko = () => {
    setTab('produk');
    window.setTimeout(() => {
      waPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      waInputRef.current?.focus();
    }, 0);
  };

  const submitWaToko = (event) => {
    event.preventDefault();
    if (!onSaveWa(waInput)) waInputRef.current?.focus();
  };

  const submitWaSaya = (event) => {
    event.preventDefault();
    onSaveMyWa(myWaInput);
  };

  const kartu = isBuyer
    ? [
        ['TOTAL PRODUK', formatNumber(products.length)],
        ['JUMLAH PENJUAL', formatNumber(new Set(products.map((p) => p.penjualId).filter(Boolean)).size)],
        ['KATEGORI', formatNumber(stats.kategori)],
        ['PESANAN SAYA', formatNumber(orders.length)],
      ]
    : [
        ['TOTAL PRODUK', formatNumber(stats.total)],
        ['TOTAL STOK', formatNumber(stats.totalStok)],
        ['KATEGORI AKTIF', formatNumber(stats.kategori)],
        ['TOTAL EDUKASI', formatNumber(guides.length)],
      ];

  const tabKatalog = {
    katalog: 'Katalog & penjual',
    pesanan: 'Pesanan saya',
    produk: isPenjual ? 'Produk saya' : 'Kelola produk',
    edukasi: 'Kelola edukasi',
  };

  return (
    <section id="dashboardView" className="dashboard">
      <div className="dash-head">
        <div>
          <div className="eyebrow">Ruang pengguna</div>
          <h1>{JUDUL[role] ?? 'Dashboard'}</h1>
          <div className="muted">
            Masuk sebagai {user?.nama} · {roleLabel(role)}. {KETERANGAN[role] ?? ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {isAdmin ? (
            <button type="button" className="btn secondary" onClick={fokusNomorToko}>
              Pengaturan WhatsApp
            </button>
          ) : null}
          {isAdmin ? (
            <button type="button" className="btn secondary" onClick={onReset}>
              Reset demo
            </button>
          ) : null}
        </div>
      </div>

      <div className="stats">
        {kartu.map(([label, value]) => (
          <div className="stat" key={label}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      <div className="chips" role="tablist" aria-label="Bagian dashboard">
        {(isBuyer ? ['katalog', 'pesanan'] : ['produk', 'edukasi']).map((key) => (
          <button
            key={key}
            type="button"
            className={`chip${tab === key ? ' active' : ''}`}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
          >
            {tabKatalog[key]}
          </button>
        ))}
      </div>

      {tab === 'katalog' ? (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Katalog dan penjual</h2>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                Setiap produk punya penjual sendiri, jadi tombol pesan diarahkan ke nomor WhatsApp penjualnya.
              </div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Penjual</th>
                  <th>Harga</th>
                  <th>Stok</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty">
                      Belum ada produk yang bisa dipesan.
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
                      <td>{namaPenjual(product)}</td>
                      <td>{formatRupiah(product.harga)}</td>
                      <td>{formatNumber(product.stok)}</td>
                      <td>
                        <button className="btn small" type="button" onClick={() => onOrder(product)}>
                          Pesan
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === 'pesanan' ? (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Pesanan saya</h2>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                Pesanan tersimpan di akunmu. Lanjutkan pemesanan dengan menghubungi penjual lewat WhatsApp.
              </div>
            </div>
            <button type="button" className="btn" onClick={() => onOrder(null)} disabled={products.length === 0}>
              Buat pesanan
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Penjual</th>
                  <th>Jumlah</th>
                  <th>Perkiraan total</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty">
                      Belum ada pesanan. Pilih produk pada tab Katalog &amp; penjual.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.product?.nama ?? 'Produk dihapus'}</strong>
                        {order.catatan ? (
                          <>
                            <br />
                            <span className="muted">{order.catatan}</span>
                          </>
                        ) : null}
                      </td>
                      <td>{order.product ? namaPenjual(order.product) : '—'}</td>
                      <td>
                        {formatNumber(order.jumlah)}
                        {order.product?.satuan ? ` ${order.product.satuan}` : ''}
                      </td>
                      <td>{formatRupiah((order.product?.harga ?? 0) * order.jumlah)}</td>
                      <td>{order.status}</td>
                      <td>
                        <div className="actions">
                          {order.product ? (
                            <a
                              className="btn secondary small"
                              href={buildOrderWhatsAppLink(
                                order.product.penjual?.waNumber || waNumber,
                                order.product,
                                order.jumlah,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Chat penjual
                            </a>
                          ) : null}
                          <button className="btn danger small" type="button" onClick={() => onDeleteOrder(order)}>
                            Batalkan
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === 'produk' ? (
        <>
          {isAdmin ? (
            <div className="panel" ref={waPanelRef} style={{ marginBottom: 18 }}>
              <div className="panel-head">
                <div>
                  <h2>Nomor WhatsApp toko (cadangan)</h2>
                  <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                    Dipakai hanya untuk produk yang belum punya penjual atau penjualnya belum mengisi nomor.
                  </div>
                </div>
              </div>
              <form onSubmit={submitWaToko} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end' }}>
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
              <div className="notice" aria-live="polite">
                {waStatusText(waNumber)}
              </div>
            </div>
          ) : null}

          {isPenjual ? (
            <div className="panel" style={{ marginBottom: 18 }}>
              <div className="panel-head">
                <div>
                  <h2>Nomor WhatsApp saya</h2>
                  <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                    Nomor ini yang dipakai pembeli saat memesan produkmu.
                  </div>
                </div>
              </div>
              <form onSubmit={submitWaSaya} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end' }}>
                <div className="field" style={{ flex: 1, minWidth: 220 }}>
                  <label htmlFor="myWaNumber">Nomor WhatsApp (kode negara + nomor)</label>
                  <input
                    id="myWaNumber"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Contoh: 6281234567890"
                    value={myWaInput}
                    onChange={(event) => setMyWaInput(event.target.value)}
                  />
                </div>
                <button className="btn" type="submit">
                  Simpan nomor
                </button>
              </form>
              <div className="notice" aria-live="polite">
                {waStatusText(user?.waNumber)}
              </div>
            </div>
          ) : null}

          {isAdmin ? (
            <div className="panel" style={{ marginBottom: 18 }}>
              <div className="panel-head">
                <div>
                  <h2>Daftar penjual</h2>
                  <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                    Setiap penjual punya nomor WhatsApp sendiri.
                  </div>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Email</th>
                      <th>Nomor WhatsApp</th>
                      <th>Jumlah produk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daftarPenjual.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="empty">
                          Belum ada akun penjual.
                        </td>
                      </tr>
                    ) : (
                      daftarPenjual.map((penjual) => (
                        <tr key={penjual.id}>
                          <td>
                            <strong>{penjual.nama}</strong>
                          </td>
                          <td>{penjual.email}</td>
                          <td>{penjual.waNumber ? `+${penjual.waNumber}` : 'Belum diisi'}</td>
                          <td>{formatNumber(products.filter((p) => p.penjualId === penjual.id).length)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className="panel">
            <div className="panel-head">
              <h2>{isPenjual ? 'Produk saya' : 'Semua produk'}</h2>
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
                    {isAdmin ? <th>Penjual</th> : null}
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Stok</th>
                    <th>Unggulan</th>
                    {canManageProducts ? <th>Aksi</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {daftarProduk.length === 0 ? (
                    <tr>
                      <td colSpan={canManageProducts ? (isAdmin ? 7 : 6) : isAdmin ? 6 : 5} className="empty">
                        {isPenjual
                          ? 'Kamu belum punya produk. Tambahkan produk pertama.'
                          : 'Belum ada produk. Tambahkan produk terlebih dahulu.'}
                      </td>
                    </tr>
                  ) : (
                    daftarProduk.map((product) => (
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
                        {isAdmin ? <td>{namaPenjual(product)}</td> : null}
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
              {isAdmin
                ? 'Sebagai admin, semua produk bisa diubah. Pilih pemilik produk pada formulir agar tombol pesan mengarah ke penjual yang tepat.'
                : 'Produk yang tampil hanya milikmu. Produk penjual lain tidak dapat kamu ubah.'}
            </div>
          </div>
        </>
      ) : null}

      {tab === 'edukasi' ? (
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
              ? 'Perubahan edukasi tersimpan di server dan tampil untuk semua pengunjung.'
              : 'Hanya Admin yang dapat menambah atau mengubah edukasi.'}
          </div>
        </div>
      ) : null}
    </section>
  );
}
