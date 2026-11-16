import { useState } from 'react';
import { GUIDE_CATEGORY_OPTIONS, LEVEL_OPTIONS, validateGuide } from '@/lib/data';
import ImageField from '@/components/ImageField';

const EMPTY_FORM = {
  judul: '',
  kategori: 'Pertanian',
  tingkat: 'Pemula',
  topik: '',
  imageUrl: '',
  ringkasan: '',
  langkah: '',
  tips: '',
};

function initialForm(guide) {
  if (!guide) return EMPTY_FORM;
  return {
    judul: guide.judul,
    kategori: guide.kategori,
    tingkat: guide.tingkat,
    topik: guide.topik || '',
    imageUrl: guide.imageUrl || '',
    ringkasan: guide.ringkasan || '',
    langkah: guide.langkah.join('\n'),
    tips: guide.tips || '',
  };
}

export default function GuideModal({ guide, onSave, onClose, notify }) {
  const [form, setForm] = useState(() => initialForm(guide));

  const setField = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();

    const hasil = validateGuide({
      judul: form.judul,
      kategori: form.kategori,
      tingkat: form.tingkat,
      topik: form.topik,
      imageUrl: form.imageUrl,
      ringkasan: form.ringkasan,
      langkah: form.langkah.split('\n'),
      tips: form.tips,
    });

    if (!hasil.ok) {
      notify(hasil.message);
      document.getElementById(hasil.field)?.focus();
      return;
    }

    onSave(hasil.value);
  };

  return (
    <div className="modal-backdrop show" role="dialog" aria-modal="true" onClick={onClose}>
      <form className="modal" onSubmit={submit} noValidate onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>{guide ? 'Edit edukasi' : 'Tambah edukasi'}</h2>
          <button className="close" type="button" aria-label="Tutup" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="form-grid">
          <div className="field full">
            <label htmlFor="gJudul">Judul tutorial *</label>
            <input
              id="gJudul"
              required
              maxLength={100}
              placeholder="Contoh: Cara budidaya lele di kolam terpal"
              value={form.judul}
              onChange={setField('judul')}
            />
          </div>
          <div className="field">
            <label htmlFor="gKategori">Kategori *</label>
            <select id="gKategori" value={form.kategori} onChange={setField('kategori')}>
              {GUIDE_CATEGORY_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="gTingkat">Tingkat *</label>
            <select id="gTingkat" value={form.tingkat} onChange={setField('tingkat')}>
              {LEVEL_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="gTopik">Topik / komoditas</label>
            <input
              id="gTopik"
              maxLength={40}
              placeholder="Contoh: Lele, Padi, Kopi"
              value={form.topik}
              onChange={setField('topik')}
            />
          </div>
          <ImageField
            id="gImage"
            value={form.imageUrl}
            notify={notify}
            onChange={(imageUrl) => setForm((prev) => ({ ...prev, imageUrl }))}
          />
          <div className="field full">
            <label htmlFor="gRingkasan">Ringkasan</label>
            <textarea
              id="gRingkasan"
              maxLength={300}
              placeholder="Satu atau dua kalimat tentang isi tutorial..."
              value={form.ringkasan}
              onChange={setField('ringkasan')}
            />
          </div>
          <div className="field full">
            <label htmlFor="gLangkah">Langkah-langkah (satu langkah per baris)</label>
            <textarea
              id="gLangkah"
              style={{ minHeight: 150 }}
              placeholder={'Siapkan kolam terpal dan isi air\nTebar benih lele ukuran seragam\n...'}
              value={form.langkah}
              onChange={setField('langkah')}
            />
          </div>
          <div className="field full">
            <label htmlFor="gTips">Tips</label>
            <input
              id="gTips"
              maxLength={200}
              placeholder="Saran singkat untuk pembaca"
              value={form.tips}
              onChange={setField('tips')}
            />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn secondary" type="button" onClick={onClose}>
            Batal
          </button>
          <button className="btn" type="submit">
            Simpan edukasi
          </button>
        </div>
      </form>
    </div>
  );
}
