export default function RegionBand({ regions, onPick }) {
  return (
    <div className="band">
      <h2>Asal produk kami</h2>
      <p>Pilih provinsi untuk melihat produk dari daerah tersebut.</p>
      <div className="reg-grid">
        {regions.length === 0 ? (
          <div className="notice" style={{ color: '#cfe3d2' }}>
            Belum ada data daerah asal produk.
          </div>
        ) : (
          regions.map(([nama, jumlah]) => (
            <button type="button" className="reg" key={nama} onClick={() => onPick(nama)}>
              <strong>{jumlah}</strong>
              <span>{nama}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
