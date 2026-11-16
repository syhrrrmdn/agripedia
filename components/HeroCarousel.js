import { useEffect, useState } from 'react';

const SLIDES = [
  {
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Muncan_Bali_Indonesia_Rice-paddy-along-Jalan-Raya-Muncan-01.jpg?width=1600',
    position: 'center',
    title: 'Beras, kopi, dan rempah langsung dari petani Nusantara.',
    text: 'Beli hasil panen dari sawah dan kebun Indonesia, dengan asal daerah yang jelas.',
    actions: [
      { label: 'Lihat produk pertanian', variant: 'btn orange', target: 'Pertanian' },
      { label: 'Semua produk', variant: 'btn line', target: 'Semua' },
    ],
  },
  {
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sunrise_behind_the_Fisherman_Boat.jpg?width=1600',
    position: 'center 60%',
    title: 'Ikan, udang, dan rumput laut dari pesisir kita.',
    text: 'Hasil tambak, keramba, dan nelayan lokal, dipesan langsung lewat WhatsApp.',
    actions: [{ label: 'Lihat produk perikanan', variant: 'btn orange', target: 'Perikanan' }],
  },
  {
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Gianyar-Regency_Bali_Indonesia_A-rice-farmer-working-in-his-paddy-01.jpg?width=1600',
    position: 'center 30%',
    title: 'Belajar bertani dan budidaya ikan dari nol sampai panen.',
    text: 'Panduan ringkas dengan istilah dan kearifan lokal Indonesia.',
    actions: [{ label: 'Buka panduan', variant: 'btn orange', target: 'edu' }],
  },
];

export default function HeroCarousel({ onQuickFilter, onOpenEducation }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setInterval(() => setIndex((current) => (current + 1) % SLIDES.length), 6500);
    return () => clearInterval(timer);
  }, [paused]);

  const handleAction = (target) => {
    if (target === 'edu') onOpenEducation();
    else onQuickFilter(target);
  };

  return (
    <div
      className="hero"
      aria-label="Sorotan Agripedia"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.title}
          className={`slide${i === index ? ' on' : ''}`}
          style={{ backgroundImage: `url('${slide.image}')`, backgroundPosition: slide.position }}
        >
          <div className="in">
            <h1>{slide.title}</h1>
            <p>{slide.text}</p>
            <div className="row">
              {slide.actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className={action.variant}
                  onClick={() => handleAction(action.target)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
      <div className="dots">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            className={i === index ? 'on' : ''}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
