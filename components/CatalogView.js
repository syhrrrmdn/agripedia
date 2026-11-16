import { CATEGORY_OPTIONS, SORT_OPTIONS } from '@/lib/data';
import HeroCarousel from './HeroCarousel';
import StatsBand from './StatsBand';
import SolutionCards from './SolutionCards';
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
  onQuickFilter,
  onOpenEducation,
  onPickRegion,
}) {
  return (
    <section id="catalogView">
      <HeroCarousel onQuickFilter={onQuickFilter} onOpenEducation={onOpenEducation} />
      <StatsBand stats={stats} />

      <div className="center">
        <div className="eyebrow">Jelajahi Agripedia</div>
        <h2>Dari lahan dan pesisir ke meja Anda</h2>
        <p>Pilih kategori, atau pelajari dulu cara budidayanya.</p>
      </div>
      <SolutionCards onQuickFilter={onQuickFilter} onOpenEducation={onOpenEducation} />

      <div className="center" id="produk">
        <div className="eyebrow">Katalog</div>
        <h2>Produk dari petani dan pembudidaya</h2>
        <p>
          <span>{products.length} produk</span> ditampilkan
        </p>
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
