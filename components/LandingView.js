'use client';

import { useEffect, useRef } from 'react';
import { formatNumber } from '@/lib/format';
import ProductCard from './ProductCard';

const HERO_IMAGE =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Muncan_Bali_Indonesia_Rice-paddy-along-Jalan-Raya-Muncan-01.jpg?width=1800';

const KATEGORI_KARTU = [
  {
    nama: 'Pertanian',
    teks: 'Beras, kopi, madu, rempah, dan hasil kebun dari petani berbagai daerah.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Panen.jpg?width=900',
  },
  {
    nama: 'Perikanan',
    teks: 'Ikan segar, udang, bandeng, dan olahan laut dari pembudidaya dan nelayan.',
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Madura_Fisherman's_Traditional_Boat.jpg?width=900",
  },
];

const FITUR = [
  {
    judul: 'Katalog terkurasi',
    teks: 'Setiap produk mencantumkan asal daerah dan penjualnya, jadi Anda tahu persis dari mana asalnya.',
    icon: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.6" />
        <rect x="13" y="4" width="7" height="7" rx="1.6" />
        <rect x="4" y="13" width="7" height="7" rx="1.6" />
        <rect x="13" y="13" width="7" height="7" rx="1.6" />
      </>
    ),
  },
  {
    judul: 'Pesan lewat WhatsApp',
    teks: 'Nomor WhatsApp tersimpan di profil tiap penjual, jadi pesanan langsung sampai ke orang yang tepat.',
    icon: (
      <>
        <path d="M21 11.5a8 8 0 0 1-11.7 7.2L4 20.5l1.8-5.2A8 8 0 1 1 21 11.5z" />
        <path d="M9 10.5h6M9 13.5h4" />
      </>
    ),
  },
  {
    judul: 'Pesanan tersimpan',
    teks: 'Susun pesanan, atur jumlah dan catatan, lalu pantau riwayatnya dari dashboard pembeli.',
    icon: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2.5" />
        <path d="M9 3.5h6v3H9z" />
        <path d="M9 13l2 2 4-4" />
      </>
    ),
  },
  {
    judul: 'Panduan budidaya',
    teks: 'Panduan bertani dan budidaya ikan, ditulis ringkas dengan kearifan lokal Indonesia.',
    icon: (
      <>
        <path d="M4 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H4z" />
        <path d="M20 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H20z" />
      </>
    ),
  },
];

const LANGKAH = [
  { judul: 'Pilih produk', teks: 'Telusuri katalog, cek asal daerah, stok, dan penjualnya.' },
  { judul: 'Buat pesanan', teks: 'Tentukan jumlah dan catatan, lalu simpan di akun Anda.' },
  { judul: 'Chat penjual', teks: 'Lanjutkan lewat WhatsApp ke nomor penjual produk tersebut.' },
];

/** Animasi muncul saat elemen masuk ke layar (scroll reveal). */
function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const items = root.querySelectorAll('[data-reveal]');
    if (!items.length) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      items.forEach((item) => item.classList.add('reveal-in'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('reveal-in');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -60px' },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function LandingView({
  stats,
  user,
  products,
  onExplore,
  onEducation,
  onOrder,
  onLogin,
  onDashboard,
}) {
  const rootRef = useReveal();
  const unggulan = products.filter((product) => product.unggulan).slice(0, 4);
  const tampil = unggulan.length > 0 ? unggulan : products.slice(0, 4);

  return (
    <section className="landing" ref={rootRef}>
      <div className="land-hero" style={{ backgroundImage: `url('${HERO_IMAGE}')` }}>
        <div
          className="land-blob"
          style={{ width: 320, height: 320, background: '#7fd18b33', top: -80, right: '8%' }}
        />
        <div
          className="land-blob"
          style={{ width: 220, height: 220, background: '#f08a2433', bottom: -70, left: '4%', animationDelay: '3s' }}
        />
        <div className="land-hero-in">
          <div className="land-hero-copy">
            <div className="eyebrow">Pasar digital tani &amp; laut nusantara</div>
            <h1>
              Dari lahan dan pesisir Nusantara, <span className="hl">langsung ke meja Anda.</span>
            </h1>
            <p className="lead">
              Agripedia menghubungkan Anda dengan petani, pembudidaya, dan nelayan lokal. Telusuri produk,
              susun pesanan, lalu lanjutkan lewat WhatsApp penjualnya.
            </p>
            <div className="land-cta">
              <button type="button" className="btn orange" onClick={() => onExplore('Semua')}>
                Jelajahi katalog
              </button>
              <button type="button" className="btn line" onClick={onEducation}>
                Lihat panduan budidaya
              </button>
              {user ? (
                <button type="button" className="btn ghost-light" onClick={onDashboard}>
                  Buka dashboard
                </button>
              ) : (
                <button type="button" className="btn ghost-light" onClick={onLogin}>
                  Masuk
                </button>
              )}
            </div>
            <div className="land-trust">
              <span className="land-dot" />
              {formatNumber(stats.total)} produk dari {formatNumber(stats.provinsi)} provinsi
            </div>
          </div>

          <div className="land-visual">
            <div className="land-float land-float-a">
              <div className="land-float-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 18c0-7 5-11 12-11 2.5 0 4 .3 4 .3s-.3 1.7-.3 4c0 7-4 11-11 11H4z" />
                  <path d="M4 18c4-1 7-4 9-9" />
                </svg>
              </div>
              <div>
                <strong>{formatNumber(stats.tani)}</strong>
                <span>hasil pertanian</span>
              </div>
            </div>
            <div className="land-float land-float-b">
              <div className="land-float-icon sea">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12c3 0 3 2 6 2s3-2 6-2 3 2 6 2M3 17c3 0 3 2 6 2s3-2 6-2 3 2 6 2" />
                  <path d="M12 11V6M8 8l4-4 4 4" />
                </svg>
              </div>
              <div>
                <strong>{formatNumber(stats.laut)}</strong>
                <span>hasil perikanan</span>
              </div>
            </div>
            <div className="land-float land-float-c">
              <div className="land-float-icon orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8 8 0 0 1-11.7 7.2L4 20.5l1.8-5.2A8 8 0 1 1 21 11.5z" />
                </svg>
              </div>
              <div>
                <strong>WhatsApp</strong>
                <span>ke penjual langsung</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="land-stats" data-reveal>
        {[
          ['Produk tersedia', formatNumber(stats.total)],
          ['Provinsi asal', formatNumber(stats.provinsi)],
          ['Hasil pertanian', formatNumber(stats.tani)],
          ['Hasil perikanan', formatNumber(stats.laut)],
        ].map(([label, value]) => (
          <div className="land-stat" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="land-section">
        <div className="center" data-reveal>
          <div className="eyebrow">Kenapa Agripedia</div>
          <h2>Semua yang Anda butuhkan untuk berbelanja hasil lokal</h2>
          <p>Dari menemukan penjual sampai menyimpan riwayat pesanan, semuanya dalam satu tempat.</p>
        </div>
        <div className="land-fiturs">
          {FITUR.map((fitur, index) => (
            <article className="land-card" data-reveal data-delay={index + 1} key={fitur.judul}>
              <div className="land-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {fitur.icon}
                </svg>
              </div>
              <h3>{fitur.judul}</h3>
              <p>{fitur.teks}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="land-section">
        <div className="center" data-reveal>
          <div className="eyebrow">Cara pesan</div>
          <h2>Tiga langkah, tanpa ribet</h2>
        </div>
        <div className="land-langkah">
          {LANGKAH.map((langkah, index) => (
            <div className="land-step" data-reveal data-delay={index + 1} key={langkah.judul}>
              <span className="land-step-no">{index + 1}</span>
              <h3>{langkah.judul}</h3>
              <p>{langkah.teks}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="land-section">
        <div className="land-kategori">
          {KATEGORI_KARTU.map((kategori, index) => (
            <article className="land-kategori-card" data-reveal data-delay={index + 1} key={kategori.nama}>
              <img src={kategori.image} alt={kategori.nama} loading="lazy" />
              <div className="land-kategori-body">
                <h3>{kategori.nama}</h3>
                <p>{kategori.teks}</p>
                <button type="button" className="btn secondary small" onClick={() => onExplore(kategori.nama)}>
                  Lihat produk {kategori.nama.toLowerCase()}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {tampil.length > 0 ? (
        <div className="land-section" id="land-unggulan">
          <div className="center" data-reveal>
            <div className="eyebrow">Pilihan terbaik</div>
            <h2>Produk unggulan minggu ini</h2>
          </div>
          <div className="product-grid g3">
            {tampil.map((product, index) => (
              <div className="land-product" data-reveal data-delay={index + 1} key={product.id}>
                <ProductCard product={product} onOrder={onOrder} />
              </div>
            ))}
          </div>
          <div className="land-center-cta">
            <button type="button" className="btn" onClick={() => onExplore('Semua')}>
              Lihat semua produk
            </button>
          </div>
        </div>
      ) : null}

      <div className="land-band" data-reveal>
        <div>
          <h2>Siap mulai berbelanja hasil lokal?</h2>
          <p>Masuk ke akun Anda untuk menyusun pesanan dan menghubungi penjual langsung dari dashboard.</p>
        </div>
        <div className="land-band-actions">
          {user ? (
            <button type="button" className="btn orange" onClick={onDashboard}>
              Buka dashboard
            </button>
          ) : (
            <button type="button" className="btn orange" onClick={onLogin}>
              Masuk sekarang
            </button>
          )}
          <button type="button" className="btn line" onClick={() => onExplore('Semua')}>
            Jelajahi katalog
          </button>
        </div>
      </div>
    </section>
  );
}
