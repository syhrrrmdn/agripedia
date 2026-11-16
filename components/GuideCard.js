import { useState } from 'react';
import { guidePhoto } from '@/lib/data';

export default function GuideCard({ guide, onRead }) {
  const [broken, setBroken] = useState(false);

  return (
    <article className="product">
      <div className={`product-visual${broken ? ' nophoto' : ''}`}>
        {broken ? null : <img src={guidePhoto(guide)} alt={guide.judul} loading="lazy" onError={() => setBroken(true)} />}
        <span className="tag">{guide.tingkat}</span>
      </div>
      <div className="product-body">
        <div className="category">
          {guide.kategori}
          {guide.topik ? ` · ${guide.topik}` : ''}
        </div>
        <h3>{guide.judul}</h3>
        <p className="desc">{guide.ringkasan || ''}</p>
        <p className="meta">{guide.langkah.length ? `${guide.langkah.length} langkah` : 'Bacaan singkat'}</p>
        <button type="button" className="btn" onClick={() => onRead(guide.id)}>
          Baca panduan
        </button>
      </div>
    </article>
  );
}
