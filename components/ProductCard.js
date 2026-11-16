import { useState } from 'react';
import { productPhoto } from '@/lib/data';
import { formatRupiah } from '@/lib/format';

export default function ProductCard({ product, onOrder }) {
  const [broken, setBroken] = useState(false);
  const photo = productPhoto(product);
  const variant = product.kategori === 'Perikanan' ? 'sea' : Number(product.harga) > 60000 ? 'orange' : '';

  return (
    <article className="product">
      <div className={`product-visual ${variant}${broken ? ' nophoto' : ''}`}>
        {broken ? null : (
          <img src={photo.url} alt={product.nama} loading="lazy" onError={() => setBroken(true)} />
        )}
        {photo.ilustrasi ? <span className="credit">Foto ilustrasi</span> : null}
        <span className="tag">{product.kategori}</span>
        {product.unggulan ? <span className="tag featured">Unggulan</span> : null}
      </div>
      <div className="product-body">
        <div className="category">{product.kategori}</div>
        <h3>{product.nama}</h3>
        {product.asal ? <div className="origin">{product.asal}</div> : null}
        {product.penjual ? <div className="origin">Penjual: {product.penjual.nama}</div> : null}
        <p className="desc">{product.deskripsi || 'Produk UMKM lokal pilihan.'}</p>
        <div className="price">
          {formatRupiah(product.harga)}
          {product.satuan ? <small> / {product.satuan}</small> : null}
        </div>
        <div className="stock">Stok tersedia: {product.stok}</div>
        <button type="button" className="btn" onClick={() => onOrder(product)}>
          Pesan produk
        </button>
      </div>
    </article>
  );
}
