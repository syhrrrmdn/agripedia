import { useState } from 'react';
import { guidePhoto } from '@/lib/data';

export default function ReadModal({ guide, onClose }) {
  const [broken, setBroken] = useState(false);

  if (!guide) return null;

  const kategori = `${guide.kategori}${guide.topik ? ` · ${guide.topik}` : ''} · ${guide.tingkat}`;

  return (
    <div className="modal-backdrop show" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal read" onClick={(event) => event.stopPropagation()}>
        <button className="close" type="button" aria-label="Tutup" onClick={onClose}>
          ×
        </button>
        {broken ? null : <img src={guidePhoto(guide)} alt="" onError={() => setBroken(true)} />}
        <div className="rb">
          <div className="category">{kategori}</div>
          <h2>{guide.judul}</h2>
          {guide.ringkasan && guide.langkah.length ? <p className="muted">{guide.ringkasan}</p> : null}
          {guide.langkah.length ? (
            <ol>
              {guide.langkah.map((step, i) => (
                <li key={`${i}-${step}`}>{step}</li>
              ))}
            </ol>
          ) : (
            <p>{guide.ringkasan || ''}</p>
          )}
          {guide.tips ? (
            <div className="tip">
              <strong>Tips:</strong> {guide.tips}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
