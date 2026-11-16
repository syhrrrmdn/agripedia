import { CATEGORY_OPTIONS, SORT_OPTIONS } from '@/lib/data';
import ProductCard from './ProductCard';
import RegionBand from './RegionBand';

const CATEGORY_CHIPS = ['Semua', ...CATEGORY_OPTIONS];

export default function CatalogView({
  stats,
  regions,
  products,
  search,
  onSearch,
  sort,
  onSort,
  kategori,
  onKategori,
  onOrder,
  onPickRegion,
}) {
  return (
    <section id="catalogView" className="catalog-page">
      <div className="catalog-head">
        <div>
          <div className="eyebrow">Katalog</div>
          <h1>Produk dari petani dan pembudidaya</h1>
          <p className="muted">
            {stats.total} produk dari {stats.provinsi} provinsi. Cari, filter, lalu pesan langsung ke penjual.
          </p>
        </div>
        <div className="catalog-count">
          <strong>{products.length}</strong>
          <span>produk tampil</span>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <input
            type="search"
            value={search}
            placeholder="Cari beras, kopi, bandeng, atau daerah..."
            aria-label="Cari produk"
            autoComplete="off"
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>
        <select aria-label="Urutkan produk" value={sort} onChange={(event) => onSort(event.target.value)}>
          {SORT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="chips" role="group" aria-label="Filter kategori">
        {CATEGORY_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            className={`chip${kategori === chip ? ' active' : ''}`}
            aria-pressed={kategori === chip}
            onClick={() => onKategori(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="product-grid" aria-live="polite">
        {products.length === 0 ? (
          <div className="empty">Belum ada produk yang cocok. Coba kata kunci atau kategori lain.</div>
        ) : (
          products.map((product) => <ProductCard key={product.id} product={product} onOrder={onOrder} />)
        )}
      </div>

      <RegionBand regions={regions} onPick={onPickRegion} />
    </section>
  );
}
