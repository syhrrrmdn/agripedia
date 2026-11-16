export default function Footer({ onNavigate }) {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="foot-grid">
          <div>
            <div className="brand">
              agri<b>pedia</b>
            </div>
            <p style={{ marginTop: 10 }}>
              Katalog hasil tani dan perikanan Nusantara, ditambah panduan budidaya untuk pemula.
            </p>
          </div>
          <div>
            <h4>Menu</h4>
            <a onClick={() => onNavigate('catalog')}>Katalog</a>
            <a onClick={() => onNavigate('education')}>Edukasi</a>
            <a onClick={() => onNavigate('dashboard')}>Dashboard</a>
          </div>
          <div>
            <h4>Pemesanan</h4>
            <p>Pesan langsung ke penjual lewat tombol WhatsApp pada setiap produk.</p>
          </div>
        </div>
        <div className="foot-note">
          © 2026 Agripedia. Foto dari Wikimedia Commons berlisensi Creative Commons; kredit tiap foto ada di halaman
          berkasnya. Foto bertanda &quot;ilustrasi&quot; belum menampilkan produk yang sebenarnya.
        </div>
      </div>
    </footer>
  );
}
