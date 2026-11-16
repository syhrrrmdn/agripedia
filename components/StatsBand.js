export default function StatsBand({ stats }) {
  const items = [
    [stats.total, 'Produk tersedia'],
    [stats.provinsi, 'Provinsi asal'],
    [stats.tani, 'Produk pertanian'],
    [stats.laut, 'Produk perikanan'],
  ];

  return (
    <div className="stats-band">
      {items.map(([value, label]) => (
        <div className="sb" key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
