const CARDS = [
  {
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Panen.jpg?width=800',
    alt: 'Pertanian',
    title: 'Pertanian',
    text: 'Beras, kopi, madu, rempah, dan hasil kebun dari petani di berbagai daerah.',
    action: { label: 'Lihat produk', target: 'Pertanian' },
  },
  {
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Madura_Fisherman's_Traditional_Boat.jpg?width=800",
    alt: 'Perikanan',
    title: 'Perikanan',
    text: 'Ikan segar, udang, bandeng, dan olahan laut dari pembudidaya dan nelayan.',
    action: { label: 'Lihat produk', target: 'Perikanan' },
  },
  {
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tabanan-Regency_Indonesia_Rice-paddies-07.jpg?width=800',
    alt: 'Panduan budidaya',
    title: 'Panduan budidaya',
    text: 'Langkah bertani dan budidaya ikan, lengkap dengan kearifan lokal.',
    action: { label: 'Buka panduan', target: 'edu' },
  },
];

export default function SolutionCards({ onQuickFilter, onOpenEducation }) {
  const handle = (target) => {
    if (target === 'edu') onOpenEducation();
    else onQuickFilter(target);
  };

  return (
    <div className="sol-grid">
      {CARDS.map((card) => (
        <article className="sol" key={card.title}>
          <img src={card.image} alt={card.alt} loading="lazy" />
          <div className="sol-body">
            <h3>{card.title}</h3>
            <p>{card.text}</p>
            <button type="button" className="btn secondary small" onClick={() => handle(card.action.target)}>
              {card.action.label}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
