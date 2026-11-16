'use client';

import { useRef, useState } from 'react';
import { uploadImage } from '@/lib/api';

/**
 * Kolom gambar dengan unggah berkas ke Cloudinary (via /api/upload)
 * dan opsi menempel URL gambar secara langsung.
 */
export default function ImageField({ id, value, onChange, notify }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      onChange(await uploadImage(file));
      notify('Gambar berhasil diunggah.');
    } catch (error) {
      notify(error.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="field full">
        <label htmlFor={`${id}-file`}>Unggah gambar (opsional)</label>
        <input
          id={`${id}-file`}
          ref={inputRef}
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={handleFile}
        />
        {uploading ? <span className="field-hint">Mengunggah gambar…</span> : null}
      </div>
      <div className="field full">
        <label htmlFor={id}>Atau tempel URL gambar</label>
        <input
          id={id}
          type="text"
          placeholder="https://..."
          value={value}
          disabled={uploading}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {value ? (
        <div className="field full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Pratinjau gambar" style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8 }} />
        </div>
      ) : null}
    </>
  );
}
