import { useEffect, useRef, useState } from 'react';
import { computeStats, productPhoto } from '@/lib/data';
import { buildOrderWhatsAppLink, buildDirectWhatsAppLink, formatNumber, formatRupiah, waStatusText } from '@/lib/format';
import { roleLabel } from '@/lib/roles';

const JUDUL = {
  admin: 'Dashboard Admin & Manajemen',
  penjual: 'Dashboard Toko & Penjualan',
  buyer: 'Dashboard Pembeli',
};

const KETERANGAN = {
  admin: 'Kelola seluruh katalog produk, edukasi, daftar mitra penjual, dan nomor WhatsApp toko.',
  penjual: 'Kelola katalog produk, pantau stok, dan perbarui nomor WhatsApp jualanmu.',
  buyer: 'Jelajahi produk segar petani & nelayan, simpan pesanan, dan hubungi penjual lewat WhatsApp.',
};

function namaPenjual(product) {
  if (!product.penjual) return 'Belum ada penjual';
  return product.penjual.waNumber
    ? `${product.penjual.nama} · +${product.penjual.waNumber}`
    : `${product.penjual.nama} · nomor WA belum diisi`;
}

const STAT_ICONS = {
  store: (
    <>
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M4 9v11h16V9" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 11a3 3 0 1 0 0-6" />
      <path d="M21 20c0-2.5-1.8-4.5-4-5" />
    </>
  ),
  tag: (
    <>
      <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7.5" cy="7.5" r="1.3" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2 3h2l2.5 12.5a2 2 0 0 0 2 1.5h8.5a2 2 0 0 0 2-1.6L21 7H6" />
    </>
  ),
  box: (
    <>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </>
  ),
  layers: (
    <>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </>
  ),
  archive: (
    <>
      <path d="M21 8v13H3V8" />
      <path d="M1 3h22v5H1z" />
      <path d="M10 12h4" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
};

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
  onPayOrder,
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
  const [filterSearch, setFilterSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');

  const waPanelRef = useRef(null);
  const waInputRef = useRef(null);

  useEffect(() => setWaInput(waNumber), [waNumber]);
  useEffect(() => setMyWaInput(user?.waNumber ?? ''), [user?.waNumber]);

  // Penjual hanya melihat produk miliknya sendiri.
  const daftarProduk = isPenjual ? products.filter((p) => p.penjualId === user?.id) : products;
  const daftarPenjual = (users ?? []).filter((u) => u.role === 'penjual');
  const stats = computeStats(daftarProduk);

  // Filter untuk tabel admin / penjual
  const produkTampil = daftarProduk.filter((product) => {
    if (filterKategori !== 'Semua' && product.kategori !== filterKategori) return false;
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      const matchNama = (product.nama ?? '').toLowerCase().includes(q);
      const matchAsal = (product.asal ?? '').toLowerCase().includes(q);
      const matchPenjual = (product.penjual?.nama ?? '').toLowerCase().includes(q);
      if (!matchNama && !matchAsal && !matchPenjual) return false;
    }
    return true;
  });

  const fokusNomorToko = () => {
    setTab(isAdmin ? 'penjual' : 'produk');
    window.setTimeout(() => {
      waPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      waInputRef.current?.focus();
    }, 50);
  };

  const submitWaToko = (event) => {
    event.preventDefault();
    if (!onSaveWa(waInput)) waInputRef.current?.focus();
  };

  const submitWaSaya = (event) => {
    event.preventDefault();
    onSaveMyWa(myWaInput);
  };

  const jumlahPenjual = new Set(products.map((p) => p.penjualId).filter(Boolean)).size;

  const kartuBuyer = [
    { label: 'Produk tersedia', value: formatNumber(products.length), sub: 'Dari berbagai daerah', icon: 'store', tone: 'green' },
    { label: 'Penjual aktif', value: formatNumber(jumlahPenjual), sub: 'Mitra tani & nelayan', icon: 'people', tone: 'orange' },
    { label: 'Kategori', value: formatNumber(stats.kategori), sub: 'Pertanian & Perikanan', icon: 'tag', tone: 'blue' },
    { label: 'Pesanan saya', value: formatNumber(orders.length), sub: 'Tersimpan di akun', icon: 'cart', tone: 'lime' },
  ];

  const kartuAdmin = [
    { label: 'Total Produk', value: formatNumber(stats.total), sub: 'Katalog terdaftar', icon: 'box', tone: 'green' },
    { label: 'Total Stok', value: formatNumber(stats.totalStok), sub: 'Unit barang siap jual', icon: 'archive', tone: 'orange' },
    { label: 'Mitra Penjual', value: formatNumber(daftarPenjual.length || jumlahPenjual), sub: 'Petani & Nelayan', icon: 'people', tone: 'purple' },
    { label: 'Kategori Aktif', value: formatNumber(stats.kategori), sub: 'Pertanian & Perikanan', icon: 'layers', tone: 'blue' },
    { label: 'Panduan Edukasi', value: formatNumber(guides.length), sub: 'Artikel & tutorial', icon: 'book', tone: 'lime' },
  ];

  const kartuPenjual = [
    { label: 'Produk Saya', value: formatNumber(daftarProduk.length), sub: 'Aktif di katalog', icon: 'box', tone: 'green' },
    { label: 'Total Stok Saya', value: formatNumber(stats.totalStok), sub: 'Sedia dikirim', icon: 'archive', tone: 'orange' },
    { label: 'Kategori Produk', value: formatNumber(stats.kategori), sub: 'Variasi jenis', icon: 'layers', tone: 'blue' },
  ];

  const kartu = isBuyer ? kartuBuyer : isAdmin ? kartuAdmin : kartuPenjual;

  const tabOptions = isBuyer
    ? [
        { key: 'katalog', label: 'Katalog & Penjual', count: products.length },
        { key: 'pesanan', label: 'Pesanan Saya', count: orders.length },
      ]
    : isAdmin
    ? [
        { key: 'produk', label: 'Kelola Produk', count: daftarProduk.length },
        { key: 'penjual', label: 'Daftar Penjual & WhatsApp', count: daftarPenjual.length },
        { key: 'edukasi', label: 'Kelola Edukasi', count: guides.length },
      ]
    : [
        { key: 'produk', label: 'Produk Saya', count: daftarProduk.length },
        { key: 'wa', label: 'Nomor WhatsApp Saya' },
      ];

  return (
    <section id="dashboardView" className="dashboard">
      {/* Modern Dashboard Header Banner */}
      <div className={`dash-banner ${role}`}>
        <div className="dash-banner-inner">
          <div className="dash-banner-user">
            <div className="dash-avatar-badge">
              {(user?.nama ?? '?').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="dash-role-badge">
                {isAdmin ? '🛡️ Administrator Sistem' : isPenjual ? '🏪 Mitra Penjual' : '🛒 Akun Pembeli'}
              </div>
              <h1 className="dash-title">{JUDUL[role] ?? 'Dashboard'}</h1>
              <p className="dash-desc">
                Halo, <strong>{user?.nama}</strong>! {KETERANGAN[role] ?? ''}
              </p>
            </div>
          </div>

          <div className="dash-banner-actions">
            {isAdmin ? (
              <>
                <button type="button" className="btn dash-action-btn primary" onClick={onAddGuide}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Tambah Edukasi
                </button>
                <button type="button" className="btn dash-action-btn ghost" onClick={fokusNomorToko}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Pengaturan WA
                </button>
              </>
            ) : isPenjual ? (
              <button type="button" className="btn dash-action-btn primary" onClick={onAddProduct}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Tambah Produk Saya
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className={`stats buyer-stats ${isAdmin ? 'admin-kpi-grid' : ''}`}>
        {kartu.map((item) => (
          <div className={`buyer-stat tone-${item.tone}`} key={item.label}>
            <div className="buyer-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {STAT_ICONS[item.icon]}
              </svg>
            </div>
            <div className="buyer-stat-text">
              <div className="buyer-stat-value">{item.value}</div>
              <div className="buyer-stat-label">{item.label}</div>
              {item.sub ? <div className="buyer-stat-sub">{item.sub}</div> : null}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="chips dash-tabs" role="tablist" aria-label="Bagian dashboard">
        {tabOptions.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`chip dash-tab-btn${tab === item.key ? ' active' : ''}`}
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
          >
            {item.label}
            {item.count !== undefined ? <span className="tab-badge">{item.count}</span> : null}
          </button>
        ))}
      </div>

      {/* TAB BUYER: KATALOG */}
      {tab === 'katalog' ? (
        <div className="panel buyer-panel">
          <div className="panel-head">
            <div>
              <h2>Katalog Produk &amp; Mitra Penjual</h2>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                Setiap produk punya penjual lokal sendiri. Pesanan Anda langsung terhubung ke nomor WhatsApp penjual.
              </div>
            </div>
          </div>
          {products.length === 0 ? (
            <div className="empty-block">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l1.5-5h15L21 9" />
                  <path d="M4 9v11h16V9" />
                  <path d="M9 20v-6h6v6" />
                </svg>
              </div>
              <p>Belum ada produk yang bisa dipesan.</p>
            </div>
          ) : (
            <div className="buyer-product-grid">
              {products.map((product) => {
                const photo = productPhoto(product);
                const visualClass = product.kategori === 'Perikanan' ? 'sea' : Number(product.harga) > 60000 ? 'orange' : '';
                return (
                  <div className="buyer-product" key={product.id}>
                    <div className={`buyer-product-visual ${visualClass}`}>
                      <img
                        src={photo.url}
                        alt={product.nama}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                          event.currentTarget.parentElement.classList.add('nophoto');
                        }}
                      />
                      <div className="product-fallback-icon" aria-hidden="true">
                        {product.kategori === 'Perikanan' ? '🐟' : '🌾'}
                      </div>
                      {photo.ilustrasi ? <span className="credit">Foto ilustrasi</span> : null}
                      {product.unggulan ? <span className="tag featured">⭐ Unggulan</span> : null}
                    </div>
                    <div className="buyer-product-top">
                      <div className={`buyer-product-cat ${product.kategori === 'Perikanan' ? 'sea' : ''}`}>
                        {product.kategori}
                      </div>
                      <div className={`buyer-product-stock${product.stok > 0 ? ' ok' : ' out'}`}>
                        {product.stok > 0 ? `${formatNumber(product.stok)} ${product.satuan || 'unit'}` : 'Habis'}
                      </div>
                    </div>
                    <div className="buyer-product-name">{product.nama}</div>
                    <div className="buyer-product-origin">
                      {product.asal ? `📍 ${product.asal}` : ''}
                    </div>
                    <div className="buyer-product-price">
                      {formatRupiah(product.harga)}
                      {product.satuan ? <small className="price-unit"> / {product.satuan}</small> : null}
                    </div>
                    <div className="buyer-product-seller">
                      <div className="seller-avatar">
                        {(product.penjual?.nama ?? '?').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="seller-info">
                        <strong>{product.penjual?.nama ?? 'Penjual AgriPedia'}</strong>
                        <span>
                          {product.penjual?.waNumber
                            ? `+${product.penjual.waNumber}`
                            : 'nomor WA belum diisi'}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn small buyer-order-btn"
                      type="button"
                      onClick={() => onOrder(product)}
                      disabled={product.stok <= 0}
                    >
                      Pesan Sekarang
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* TAB BUYER: PESANAN */}
      {tab === 'pesanan' ? (
        <div className="panel buyer-panel">
          <div className="panel-head">
            <div>
              <h2>Pesanan Saya</h2>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                Pesanan tersimpan di akun Anda. Bayar online atau hubungi penjual via WhatsApp.
              </div>
            </div>
            <button type="button" className="btn" onClick={() => onOrder(null)} disabled={products.length === 0}>
              Buat Pesanan Baru
            </button>
          </div>
          {orders.length === 0 ? (
            <div className="empty-block">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="20" r="1.4" />
                  <circle cx="18" cy="20" r="1.4" />
                  <path d="M2 3h2l2.5 12.5a2 2 0 0 0 2 1.5h8.5a2 2 0 0 0 2-1.6L21 7H6" />
                </svg>
              </div>
              <p>Belum ada pesanan tersimpan. Pilih produk pada tab Katalog &amp; Penjual.</p>
            </div>
          ) : (
            <div className="order-list">
              {orders.map((order) => {
                const total = order.total ?? (order.product?.harga ?? 0) * order.jumlah;
                const orderPhoto = order.product ? productPhoto(order.product) : null;
                const isWhatsapp = order.metode === 'whatsapp';
                const isOnline = order.metode === 'online';
                const payStatus = order.paymentStatus ?? 'unpaid';
                return (
                  <div className="order-card" key={order.id}>
                    <div className="order-card-main">
                      {orderPhoto ? (
                        <div className="order-photo">
                          <img
                            src={orderPhoto.url}
                            alt={order.product?.nama ?? 'produk'}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                              event.currentTarget.parentElement.classList.add('nophoto');
                            }}
                          />
                          <div className="order-photo-fallback" aria-hidden="true">
                            {order.product?.kategori === 'Perikanan' ? '🐟' : '🌾'}
                          </div>
                        </div>
                      ) : null}
                      <div className="order-product">
                        <div className="order-product-name">{order.product?.nama ?? 'Produk dihapus'}</div>
                        {order.product?.asal ? <div className="order-product-origin">📍 {order.product.asal}</div> : null}
                        {order.alamat ? <div className="order-note">🏠 {order.alamat}</div> : null}
                        {order.catatan ? <div className="order-note">📝 {order.catatan}</div> : null}
                      </div>
                      <div className="order-qty">
                        <span className="order-qty-num">{formatNumber(order.jumlah)}</span>
                        <span className="order-qty-unit">{order.product?.satuan ?? 'item'}</span>
                      </div>
                    </div>
                    <div className="order-card-meta">
                      <div className="order-seller">
                        <div className="seller-avatar sm">
                          {(order.product?.penjual?.nama ?? '?').slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <strong>{order.product?.penjual?.nama ?? 'Penjual'}</strong>
                          <span>
                            {order.product?.penjual?.waNumber
                              ? `+${order.product.penjual.waNumber}`
                              : 'nomor WA belum diisi'}
                          </span>
                        </div>
                      </div>
                      <div className="order-badges">
                        {/* Method Badge */}
                        <span className={`method-badge ${isWhatsapp ? 'wa' : isOnline ? 'online' : ''}`}>
                          {isWhatsapp ? '💬 WhatsApp' : isOnline ? '💳 Online' : '📋 Standar'}
                        </span>
                        {/* Payment Status Badge */}
                        <span className={`payment-badge status-${payStatus}`}>
                          {payStatus === 'paid'
                            ? '✅ Sudah Dibayar'
                            : payStatus === 'pending'
                            ? '⏳ Menunggu Bayar'
                            : payStatus === 'failed'
                            ? '❌ Gagal'
                            : payStatus === 'manual'
                            ? '📱 Bayar Manual (COD)'
                            : '🔔 Belum Bayar'}
                        </span>
                      </div>
                      <div className="order-total">
                        <span className="order-total-label">Total Pembelian</span>
                        <span className="order-total-value">{formatRupiah(total)}</span>
                      </div>
                    </div>
                    <div className="order-card-actions">
                      <span className={`order-status status-${order.status}`}>{order.status}</span>
                      <div className="order-actions">
                        {/* WhatsApp: Chat Penjual */}
                        {isWhatsapp && order.product ? (
                          <a
                            className="btn secondary small chat-wa-btn"
                            href={buildDirectWhatsAppLink(
                              order.product.penjual?.waNumber || waNumber,
                              order.product,
                              order.jumlah,
                              order.catatan,
                              order.alamat,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                              <path d="M21 11.5a8 8 0 0 1-11.7 7.2L4 20.5l1.8-5.2A8 8 0 1 1 21 11.5z" />
                            </svg>
                            Chat Penjual di WhatsApp
                          </a>
                        ) : null}

                        {/* Online: Bayar Sekarang (if pending/unpaid) */}
                        {isOnline && (payStatus === 'pending' || payStatus === 'unpaid') && order.snapToken && onPayOrder ? (
                          <button
                            className="btn small pay-now-btn"
                            type="button"
                            onClick={() => onPayOrder(order)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                              <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                            Bayar Sekarang
                          </button>
                        ) : null}

                        {/* Old WA fallback for orders without metode */}
                        {!isWhatsapp && !isOnline && order.product ? (
                          <a
                            className="btn secondary small chat-wa-btn"
                            href={buildOrderWhatsAppLink(
                              order.product.penjual?.waNumber || waNumber,
                              order.product,
                              order.jumlah,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                              <path d="M21 11.5a8 8 0 0 1-11.7 7.2L4 20.5l1.8-5.2A8 8 0 1 1 21 11.5z" />
                            </svg>
                            Chat Penjual di WhatsApp
                          </a>
                        ) : null}

                        {/* Cancel button only if not already paid */}
                        {payStatus !== 'paid' ? (
                          <button className="btn danger small" type="button" onClick={() => onDeleteOrder(order)}>
                            Batalkan
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* TAB ADMIN/PENJUAL: KELOLA PRODUK */}
      {tab === 'produk' ? (
        <div className="panel admin-panel">
          <div className="panel-head">
            <div>
              <h2>{isPenjual ? 'Daftar Produk Saya' : 'Katalog Seluruh Produk'}</h2>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                {isAdmin
                  ? 'Pantau stok, kategori, harga, dan penjual tiap produk. Foto dan asal daerah terhubung otomatis.'
                  : 'Kelola produk jualan Anda, perbarui ketersediaan stok dan harga.'}
              </div>
            </div>
            {isPenjual ? (
              <button type="button" className="btn primary" onClick={onAddProduct}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Tambah Produk
              </button>
            ) : null}
          </div>

          {/* Search & Category Filter for Admin Table */}
          <div className="admin-table-filter">
            <div className="admin-filter-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                placeholder="Cari nama produk, asal daerah, atau penjual..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
              />
            </div>
            <div className="admin-filter-kategori">
              {['Semua', 'Pertanian', 'Perikanan'].map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`admin-filter-pill${filterKategori === k ? ' active' : ''}`}
                  onClick={() => setFilterKategori(k)}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Foto</th>
                  <th>Nama &amp; Asal Produk</th>
                  {isAdmin ? <th>Mitra Penjual</th> : null}
                  <th>Kategori</th>
                  <th>Harga Satuan</th>
                  <th>Stok Tersedia</th>
                  <th>Status</th>
                  {canManageProducts ? <th style={{ textAlign: 'right' }}>Aksi</th> : null}
                </tr>
              </thead>
              <tbody>
                {produkTampil.length === 0 ? (
                  <tr>
                    <td colSpan={canManageProducts ? (isAdmin ? 8 : 7) : isAdmin ? 7 : 6} className="empty">
                      {isPenjual
                        ? 'Kamu belum memiliki produk yang cocok. Tambahkan produk pertama.'
                        : 'Belum ada produk yang sesuai dengan filter pencarian.'}
                    </td>
                  </tr>
                ) : (
                  produkTampil.map((product) => {
                    const pPhoto = productPhoto(product);
                    const isLowStock = product.stok > 0 && product.stok <= 15;
                    const isOutOfStock = product.stok <= 0;

                    return (
                      <tr key={product.id} className="admin-table-row">
                        <td>
                          <div className={`admin-product-thumb ${product.kategori === 'Perikanan' ? 'sea' : ''}`}>
                            <img
                              src={pPhoto.url}
                              alt={product.nama}
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display = 'none';
                                event.currentTarget.parentElement.classList.add('nophoto');
                              }}
                            />
                            <div className="thumb-fallback" aria-hidden="true">
                              {product.kategori === 'Perikanan' ? '🐟' : '🌾'}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="admin-product-title">
                            <strong>{product.nama}</strong>
                            {product.asal ? (
                              <span className="admin-product-origin">📍 {product.asal}</span>
                            ) : null}
                          </div>
                        </td>
                        {isAdmin ? (
                          <td>
                            <div className="admin-seller-cell">
                              <span className="admin-seller-avatar">
                                {(product.penjual?.nama ?? '?').slice(0, 1).toUpperCase()}
                              </span>
                              <div>
                                <span className="admin-seller-name">{product.penjual?.nama ?? 'Belum ada'}</span>
                                {product.penjual?.waNumber ? (
                                  <span className="admin-seller-wa">+{product.penjual.waNumber}</span>
                                ) : (
                                  <span className="admin-seller-no-wa">WA belum ada</span>
                                )}
                              </div>
                            </div>
                          </td>
                        ) : null}
                        <td>
                          <span className={`badge-kategori ${product.kategori === 'Perikanan' ? 'perikanan' : 'pertanian'}`}>
                            {product.kategori === 'Perikanan' ? '🐟 Perikanan' : '🌾 Pertanian'}
                          </span>
                        </td>
                        <td>
                          <span className="admin-price">{formatRupiah(product.harga)}</span>
                          {product.satuan ? <span className="admin-unit">/{product.satuan}</span> : null}
                        </td>
                        <td>
                          <span
                            className={`badge-stok ${isOutOfStock ? 'empty' : isLowStock ? 'low' : 'ok'}`}
                          >
                            {isOutOfStock ? 'Habis (0)' : `${formatNumber(product.stok)} ${product.satuan || 'unit'}`}
                          </span>
                        </td>
                        <td>
                          {product.unggulan ? (
                            <span className="badge-featured">⭐ Unggulan</span>
                          ) : (
                            <span className="muted" style={{ fontSize: 12 }}>Standar</span>
                          )}
                        </td>
                        {canManageProducts ? (
                          <td>
                            <div className="actions table-actions-end">
                              <button
                                className="btn secondary small action-edit-btn"
                                type="button"
                                onClick={() => onEditProduct(product)}
                                title="Edit produk"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                className="btn danger small action-del-btn"
                                type="button"
                                onClick={() => onDeleteProduct(product)}
                                title="Hapus produk"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                Hapus
                              </button>
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="notice admin-notice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>
              {isAdmin
                ? 'Sebagai administrator, Anda dapat mengedit semua produk dan menentukan penjual pemilik produk agar tombol pesan terarah ke WhatsApp yang sesuai.'
                : 'Produk yang tampil adalah produk toko Anda. Calon pembeli yang memesan akan langsung diarahkan ke nomor WhatsApp Anda.'}
            </span>
          </div>
        </div>
      ) : null}

      {/* TAB ADMIN: DAFTAR PENJUAL & PENGATURAN WHATSAPP */}
      {isAdmin && tab === 'penjual' ? (
        <>
          {/* Card Pengaturan WhatsApp Toko */}
          <div className="panel admin-panel" ref={waPanelRef} style={{ marginBottom: 24 }}>
            <div className="panel-head">
              <div>
                <h2>Nomor WhatsApp Toko (Nomor Pusat / Cadangan)</h2>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                  Nomor ini digunakan jika suatu produk belum memiliki penjual atau nomor penjualnya belum tercantum.
                </div>
              </div>
              <span className="wa-brand-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                WhatsApp Gateway
              </span>
            </div>
            <form onSubmit={submitWaToko} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="field" style={{ flex: 1, minWidth: 260 }}>
                <label htmlFor="waNumber">Nomor WhatsApp Toko (Awali 62 tanpa spasi/tanda +)</label>
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
              <button className="btn primary" type="submit" style={{ height: 46 }}>
                Simpan Nomor WhatsApp
              </button>
            </form>
            <div className="notice admin-notice" aria-live="polite" style={{ marginTop: 14 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>{waStatusText(waNumber)}</span>
            </div>
          </div>

          {/* Tabel Mitra Penjual */}
          <div className="panel admin-panel">
            <div className="panel-head">
              <div>
                <h2>Daftar Mitra Penjual Terdaftar</h2>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                  Masing-masing penjual menerima pesanan pembeli langsung ke nomor WhatsApp mereka.
                </div>
              </div>
            </div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mitra Penjual</th>
                    <th>Email Akun</th>
                    <th>Nomor WhatsApp</th>
                    <th>Produk Dikelola</th>
                    <th style={{ textAlign: 'right' }}>Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody>
                  {daftarPenjual.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty">
                        Belum ada akun mitra penjual terdaftar.
                      </td>
                    </tr>
                  ) : (
                    daftarPenjual.map((penjual) => {
                      const jumlah = products.filter((p) => p.penjualId === penjual.id).length;
                      return (
                        <tr key={penjual.id} className="admin-table-row">
                          <td>
                            <div className="admin-seller-profile-cell">
                              <div className="seller-avatar">
                                {(penjual.nama ?? '?').slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <strong>{penjual.nama}</strong>
                                <span className="seller-sub-badge">Penjual Terverifikasi</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="admin-email-text">{penjual.email}</span>
                          </td>
                          <td>
                            {penjual.waNumber ? (
                              <span className="admin-wa-active">+{penjual.waNumber}</span>
                            ) : (
                              <span className="admin-wa-empty">Belum diisi</span>
                            )}
                          </td>
                          <td>
                            <span className="admin-product-count-badge">
                              {formatNumber(jumlah)} produk
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {penjual.waNumber ? (
                              <a
                                href={`https://wa.me/${penjual.waNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn secondary small chat-wa-link"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                                  <path d="M21 11.5a8 8 0 0 1-11.7 7.2L4 20.5l1.8-5.2A8 8 0 1 1 21 11.5z" />
                                </svg>
                                Hubungi WA
                              </a>
                            ) : (
                              <span className="muted" style={{ fontSize: 12 }}>Tidak ada kontak</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      {/* TAB PENJUAL: NOMOR WA SAYA */}
      {isPenjual && tab === 'wa' ? (
        <div className="panel admin-panel">
          <div className="panel-head">
            <div>
              <h2>Nomor WhatsApp Penjualan Saya</h2>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                Nomor ini digunakan calon pembeli saat menekan tombol Pesan pada produk milik Anda.
              </div>
            </div>
          </div>
          <form onSubmit={submitWaSaya} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="field" style={{ flex: 1, minWidth: 260 }}>
              <label htmlFor="myWaNumber">Nomor WhatsApp Anda (Awali 62, contoh: 6281234567890)</label>
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
            <button className="btn primary" type="submit" style={{ height: 46 }}>
              Simpan Nomor Saya
            </button>
          </form>
          <div className="notice admin-notice" aria-live="polite" style={{ marginTop: 14 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>{waStatusText(user?.waNumber)}</span>
          </div>
        </div>
      ) : null}

      {/* TAB ADMIN: KELOLA EDUKASI */}
      {tab === 'edukasi' ? (
        <div className="panel admin-panel">
          <div className="panel-head">
            <div>
              <h2>Daftar Panduan &amp; Edukasi Budidaya</h2>
              {canManageGuides ? (
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                  Kelola tutorial pertanian, budidaya perikanan, dan kearifan lokal nusantara.
                </div>
              ) : null}
            </div>
            {canManageGuides ? (
              <button type="button" className="btn primary" onClick={onAddGuide}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Tambah Edukasi
              </button>
            ) : null}
          </div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Judul Panduan</th>
                  <th>Kategori</th>
                  <th>Tingkat Kesulitan</th>
                  <th>Jumlah Langkah</th>
                  {canManageGuides ? <th style={{ textAlign: 'right' }}>Aksi</th> : null}
                </tr>
              </thead>
              <tbody>
                {guides.length === 0 ? (
                  <tr>
                    <td colSpan={canManageGuides ? 5 : 4} className="empty">
                      Belum ada panduan edukasi. Tambahkan artikel edukasi pertama.
                    </td>
                  </tr>
                ) : (
                  guides.map((guide) => (
                    <tr key={guide.id} className="admin-table-row">
                      <td>
                        <div className="admin-guide-title">
                          <strong>{guide.judul}</strong>
                          {guide.topik ? <span className="muted">🏷️ {guide.topik}</span> : null}
                        </div>
                      </td>
                      <td>
                        <span className={`badge-kategori ${guide.kategori === 'Perikanan' ? 'perikanan' : guide.kategori === 'Kearifan Lokal' ? 'kearifan' : 'pertanian'}`}>
                          {guide.kategori}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-level ${guide.tingkat.toLowerCase()}`}>
                          {guide.tingkat}
                        </span>
                      </td>
                      <td>
                        <span className="admin-step-pill">
                          {formatNumber(guide.langkah.length)} langkah
                        </span>
                      </td>
                      {canManageGuides ? (
                        <td>
                          <div className="actions table-actions-end">
                            <button className="btn secondary small action-edit-btn" type="button" onClick={() => onEditGuide(guide)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Edit
                            </button>
                            <button className="btn danger small action-del-btn" type="button" onClick={() => onDeleteGuide(guide)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
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
          <div className="notice admin-notice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>
              {canManageGuides
                ? 'Seluruh tutorial yang diterbitkan dapat dibaca langsung oleh pembeli dan pengunjung pada halaman Edukasi.'
                : 'Hanya administrator yang dapat menambah atau mengubah panduan edukasi.'}
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
