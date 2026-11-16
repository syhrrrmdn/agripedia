import { GUIDE_CATEGORY_OPTIONS, LEVEL_OPTIONS } from '@/lib/data';
import GuideCard from './GuideCard';

const CATEGORY_CHIPS = ['Semua', ...GUIDE_CATEGORY_OPTIONS];
const LEVEL_SELECT = [['Semua', 'Semua tingkat'], ...LEVEL_OPTIONS.map((level) => [level, level])];

export default function EducationView({
  guides,
  search,
  onSearch,
  level,
  onLevel,
  kategori,
  onKategori,
  onRead,
}) {
  return (
    <section id="educationView" className="dashboard">
      <div className="education-intro">
        <div>
          <h2>Belajar bertani dan budidaya ikan</h2>
          <p>
            Kumpulan tutorial dari persiapan lahan hingga panen, lengkap dengan kearifan lokal Nusantara. Cari
            berdasarkan komoditas, kategori, atau tingkat kemampuan.
          </p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <input
            type="search"
            value={search}
            placeholder="Cari tutorial, misalnya padi, kolam, atau subak..."
            aria-label="Cari tutorial"
            autoComplete="off"
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>
        <select aria-label="Filter tingkat" value={level} onChange={(event) => onLevel(event.target.value)}>
          {LEVEL_SELECT.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="chips" role="group" aria-label="Filter kategori panduan">
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

      <div className="section-head">
        <div>
          <h2>Daftar panduan</h2>
        </div>
        <span className="muted">{guides.length} panduan</span>
      </div>

      <div className="product-grid g3" aria-live="polite">
        {guides.length === 0 ? (
          <div className="empty">Belum ada panduan yang cocok. Coba kata kunci atau kategori lain.</div>
        ) : (
          guides.map((guide) => <GuideCard key={guide.id} guide={guide} onRead={onRead} />)
        )}
      </div>

      <div className="learning-note">
        <strong>Catatan penting:</strong> Panduan ini hanya pengantar umum. Untuk dosis pupuk, jadwal tanam, dan
        penyakit ikan, tanyakan ke penyuluh pertanian atau perikanan di Balai Penyuluhan Pertanian (BPP) atau dinas
        setempat.
      </div>
    </section>
  );
}
