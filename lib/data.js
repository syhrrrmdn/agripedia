/**
 * AgriPedia — model data, data contoh, aturan validasi, dan pemetaan foto.
 * Modul ini murni (tidak menyentuh DOM/localStorage) agar mudah diuji.
 */

/** Daftar pilihan untuk formulir. */
export const CATEGORY_OPTIONS = ['Pertanian', 'Perikanan'];
export const GUIDE_CATEGORY_OPTIONS = ['Pertanian', 'Perikanan', 'Kearifan Lokal'];
export const LEVEL_OPTIONS = ['Pemula', 'Menengah', 'Lanjut'];

/** Opsi pengurutan katalog: [nilai, label]. */
export const SORT_OPTIONS = [
  ['featured', 'Urutan: Rekomendasi'],
  ['name', 'Nama A–Z'],
  ['priceAsc', 'Harga termurah'],
  ['priceDesc', 'Harga termahal'],
  ['stockDesc', 'Stok terbanyak'],
];

/**
 * Menyaring URL gambar: hanya http(s) atau path relatif yang diterima.
 * Selain itu (javascript:, data:, //host, ...) dianggap tidak valid.
 */
export function sanitizeImageUrl(value) {
  const url = String(value ?? '').trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return '';
  return url;
}

/** Provinsi = bagian setelah koma terakhir pada "asal". */
export function provinceOf(asal) {
  return String(asal ?? '').split(',').pop().trim();
}

/** Normalisasi nomor WhatsApp: buang non-digit, ubah awalan 0 menjadi 62. */
export function normalizeWaNumber(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  return digits;
}

/**
 * Memvalidasi masukan formulir produk.
 * @returns {{ ok: boolean, field?: string, message?: string, value: object }}
 */
export function validateProduct(input = {}) {
  const nama = String(input.nama ?? '').trim();
  if (!nama) {
    return { ok: false, field: 'nama', message: 'Nama produk wajib diisi.', value: {} };
  }

  const harga = Number(input.harga);
  if (!Number.isFinite(harga) || harga < 0) {
    return { ok: false, field: 'harga', message: 'Harga harus angka 0 atau lebih.', value: {} };
  }

  const stok = Number(input.stok);
  if (!Number.isInteger(stok) || stok < 0) {
    return { ok: false, field: 'stok', message: 'Stok harus bilangan bulat 0 atau lebih.', value: {} };
  }

  const imageUrlText = String(input.imageUrl ?? '').trim();
  const imageUrl = sanitizeImageUrl(imageUrlText);

  return {
    ok: true,
    value: {
      nama,
      kategori: String(input.kategori ?? '').trim() || 'Pertanian',
      harga,
      stok,
      asal: String(input.asal ?? '').trim(),
      satuan: String(input.satuan ?? '').trim(),
      deskripsi: String(input.deskripsi ?? '').trim(),
      imageUrl,
      unggulan: input.unggulan === true,
    },
  };
}

/**
 * Memvalidasi masukan formulir edukasi.
 * @returns {{ ok: boolean, field?: string, message?: string, value: object }}
 */
export function validateGuide(input = {}) {
  const judul = String(input.judul ?? '').trim();
  if (!judul) {
    return { ok: false, field: 'gJudul', message: 'Judul tutorial wajib diisi.', value: {} };
  }

  const langkah = (Array.isArray(input.langkah) ? input.langkah : [])
    .map((step) => String(step).trim())
    .filter(Boolean);
  const ringkasan = String(input.ringkasan ?? '').trim();

  if (langkah.length === 0 && !ringkasan) {
    return { ok: false, field: 'gLangkah', message: 'Isi ringkasan atau minimal satu langkah.', value: {} };
  }

  return {
    ok: true,
    value: {
      judul,
      kategori: String(input.kategori ?? '').trim() || 'Pertanian',
      tingkat: String(input.tingkat ?? '').trim() || 'Pemula',
      topik: String(input.topik ?? '').trim(),
      imageUrl: sanitizeImageUrl(input.imageUrl),
      ringkasan,
      langkah,
      tips: String(input.tips ?? '').trim(),
    },
  };
}

/** Menyaring produk berdasarkan kata kunci dan kategori. */
export function filterProducts(products, { search = '', kategori = 'Semua' } = {}) {
  const term = String(search ?? '').trim().toLocaleLowerCase('id');
  return products.filter((product) => {
    if (kategori !== 'Semua' && product.kategori !== kategori) return false;
    return [product.nama, product.kategori, product.deskripsi, product.asal]
      .some((field) => String(field ?? '').toLocaleLowerCase('id').includes(term));
  });
}

/** Mengurutkan produk sesuai opsi katalog. */
export function sortProducts(products, sort = 'featured') {
  const list = [...products];
  const byName = (a, b) => a.nama.localeCompare(b.nama, 'id');

  switch (sort) {
    case 'name':
      return list.sort(byName);
    case 'priceAsc':
      return list.sort((a, b) => a.harga - b.harga);
    case 'priceDesc':
      return list.sort((a, b) => b.harga - a.harga);
    case 'stockDesc':
      return list.sort((a, b) => b.stok - a.stok);
    case 'featured':
    default:
      return list.sort((a, b) => Number(b.unggulan) - Number(a.unggulan));
  }
}

/** Menyaring tutorial berdasarkan kata kunci, kategori, dan tingkat. */
export function filterGuides(guides, { search = '', kategori = 'Semua', tingkat = 'Semua' } = {}) {
  const term = String(search ?? '').trim().toLocaleLowerCase('id');
  return guides.filter((guide) => {
    if (kategori !== 'Semua' && guide.kategori !== kategori) return false;
    if (tingkat !== 'Semua' && guide.tingkat !== tingkat) return false;
    return [guide.judul, guide.kategori, guide.topik, guide.ringkasan, ...guide.langkah]
      .some((field) => String(field ?? '').toLocaleLowerCase('id').includes(term));
  });
}

/** Ringkasan beranda: jumlah produk, provinsi, pertanian, perikanan, dan daftar provinsi. */
export function computeHomeStats(products) {
  const provinsi = new Map();
  products.forEach((product) => {
    const nama = provinceOf(product.asal);
    if (nama) provinsi.set(nama, (provinsi.get(nama) || 0) + 1);
  });

  return {
    total: products.length,
    provinsi: provinsi.size,
    tani: products.filter((product) => product.kategori === 'Pertanian').length,
    laut: products.filter((product) => product.kategori === 'Perikanan').length,
    regions: [...provinsi.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'id')),
  };
}

/** Ringkasan dashboard: total produk, total stok, dan kategori aktif. */
export function computeStats(products) {
  return {
    total: products.length,
    totalStok: products.reduce((sum, product) => sum + (Number(product.stok) || 0), 0),
    kategori: new Set(products.map((product) => product.kategori)).size,
  };
}

/** Foto Wikimedia Commons dengan lebar tertentu. */
const commons = (file, width = 720) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${width}`;

/** Pemetaan kata kunci nama produk ke foto Commons; angka 1 berarti foto ilustrasi. */
const PRODUCT_PHOTOS = [
  [/kopi/i, 'Coffee-drying-indonesia.png', 0],
  [/udang/i, 'Shrimp_pond_with_aerator.jpg', 0],
  [/rumput/i, 'Seaweed_farming_-Nusa_Lembongan,_Bali-16Aug2009.jpg', 0],
  [/beras/i, 'Tabanan-Regency_Indonesia_Rice-paddies-07.jpg', 1],
  [/madu/i, 'Panen.jpg', 1],
  [/cabai/i, 'Gianyar-Regency_Bali_Indonesia_A-rice-farmer-working-in-his-paddy-01.jpg', 1],
  [/gula/i, 'Muncan_Bali_Indonesia_Rice-paddy-along-Jalan-Raya-Muncan-01.jpg', 1],
  [/pala/i, 'Rice_terraces,_Bali.jpg', 1],
  [/nila/i, 'Jukung_Pasar_Terapung.jpg', 1],
  [/bandeng/i, 'Menjaring_Senja.jpg', 1],
  [/terasi/i, 'Sunrise_behind_the_Fisherman_Boat.jpg', 1],
];

/**
 * Foto produk: prioritas imageUrl, lalu kata kunci nama, lalu foto bawaan kategori.
 * @returns {{ url: string, ilustrasi: boolean }}
 */
export function productPhoto(product) {
  if (product.imageUrl) return { url: product.imageUrl, ilustrasi: false };
  const match = PRODUCT_PHOTOS.find(([pattern]) => pattern.test(product.nama));
  if (match) return { url: commons(match[1]), ilustrasi: match[2] === 1 };
  const fallback = product.kategori === 'Perikanan'
    ? 'Madura_Fisherman\'s_Traditional_Boat.jpg'
    : 'Panen.jpg';
  return { url: commons(fallback), ilustrasi: true };
}

/** Foto tutorial: prioritas imageUrl, lalu kata kunci judul, lalu foto bawaan kategori. */
export function guidePhoto(guide) {
  if (guide.imageUrl) return guide.imageUrl;
  const judul = guide.judul;
  const khusus = [
    [/subak/i, 'Rice_terraces,_Bali.jpg'],
    [/pranata/i, 'Muncan_Bali_Indonesia_Rice-paddy-along-Jalan-Raya-Muncan-01.jpg'],
    [/mina padi/i, 'Tabanan-Regency_Indonesia_Rice-paddies-07.jpg'],
    [/sasi/i, 'Sunrise_behind_the_Fisherman_Boat.jpg'],
  ].find(([pattern]) => pattern.test(judul));
  if (khusus) return commons(khusus[1]);

  if (guide.kategori === 'Perikanan') {
    const file = /kolam|tambak/i.test(judul)
      ? 'Shrimp_pond_with_aerator.jpg'
      : /panen/i.test(judul)
        ? 'Menjaring_Senja.jpg'
        : /pakan/i.test(judul)
          ? 'Seaweed_farming_-Nusa_Lembongan,_Bali-16Aug2009.jpg'
          : 'Madura_Fisherman\'s_Traditional_Boat.jpg';
    return commons(file);
  }

  const file = /lahan/i.test(judul)
    ? 'Muncan_Bali_Indonesia_Rice-paddy-along-Jalan-Raya-Muncan-01.jpg'
    : /benih|tanam/i.test(judul)
      ? 'Tabanan-Regency_Indonesia_Rice-paddies-07.jpg'
      : /panen/i.test(judul)
        ? 'Panen.jpg'
        : 'Gianyar-Regency_Bali_Indonesia_A-rice-farmer-working-in-his-paddy-01.jpg';
  return commons(file);
}

/** Dua puluh lima produk contoh. */
export function createSampleProducts() {
  return [
    { id: 'p1', nama: 'Beras Pandan Wangi', kategori: 'Pertanian', harga: 92000, stok: 42, asal: 'Cianjur, Jawa Barat', satuan: '5 kg', deskripsi: 'Beras pulen dan harum, digiling dari padi sawah petani lokal.', imageUrl: '', unggulan: true },
    { id: 'p2', nama: 'Kopi Arabika Gayo', kategori: 'Pertanian', harga: 62000, stok: 30, asal: 'Aceh Tengah, Aceh', satuan: '250 g', deskripsi: 'Biji kopi dataran tinggi Gayo yang dipetik merah oleh kelompok tani.', imageUrl: '', unggulan: true },
    { id: 'p3', nama: 'Madu Hutan Sumbawa', kategori: 'Pertanian', harga: 95000, stok: 18, asal: 'Sumbawa, Nusa Tenggara Barat', satuan: 'botol 500 ml', deskripsi: 'Madu hutan alami yang dipanen oleh kelompok petani madu.', imageUrl: '', unggulan: true },
    { id: 'p4', nama: 'Cabai Rawit Merah', kategori: 'Pertanian', harga: 55000, stok: 25, asal: 'Kediri, Jawa Timur', satuan: 'kg', deskripsi: 'Cabai rawit segar, pedas, dan siap untuk sambal.', imageUrl: '', unggulan: false },
    { id: 'p5', nama: 'Gula Aren Cetak', kategori: 'Pertanian', harga: 28000, stok: 40, asal: 'Minahasa, Sulawesi Utara', satuan: '500 g', deskripsi: 'Gula aren dari nira pohon enau, cocok untuk kolak dan kopi.', imageUrl: '', unggulan: false },
    { id: 'p6', nama: 'Pala Biji Banda', kategori: 'Pertanian', harga: 45000, stok: 22, asal: 'Kepulauan Banda, Maluku', satuan: '100 g', deskripsi: 'Pala kering beraroma tajam dari Kepulauan Rempah.', imageUrl: '', unggulan: false },
    { id: 'p7', nama: 'Ikan Nila Segar', kategori: 'Perikanan', harga: 38000, stok: 34, asal: 'Danau Toba, Sumatra Utara', satuan: 'kg', deskripsi: 'Nila segar dari keramba jaring apung, cocok untuk digoreng atau dibakar.', imageUrl: '', unggulan: true },
    { id: 'p8', nama: 'Udang Vaname', kategori: 'Perikanan', harga: 95000, stok: 16, asal: 'Indramayu, Jawa Barat', satuan: 'kg', deskripsi: 'Udang tambak segar, cocok untuk aneka masakan.', imageUrl: '', unggulan: true },
    { id: 'p9', nama: 'Bandeng Presto', kategori: 'Perikanan', harga: 46000, stok: 21, asal: 'Gresik, Jawa Timur', satuan: '500 g', deskripsi: 'Bandeng berduri lunak, praktis untuk hidangan keluarga.', imageUrl: '', unggulan: false },
    { id: 'p10', nama: 'Rumput Laut Kering', kategori: 'Perikanan', harga: 30000, stok: 50, asal: 'Rote Ndao, Nusa Tenggara Timur', satuan: 'kg', deskripsi: 'Rumput laut hasil budidaya pesisir, siap diolah.', imageUrl: '', unggulan: false },
    { id: 'p11', nama: 'Terasi Udang Rebon', kategori: 'Perikanan', harga: 24000, stok: 35, asal: 'Cirebon, Jawa Barat', satuan: '250 g', deskripsi: 'Terasi tradisional untuk sambal dan bumbu masakan.', imageUrl: '', unggulan: false },
    { id: 'p12', nama: 'Jahe Emas Segar', kategori: 'Pertanian', harga: 18000, stok: 55, asal: 'Kuningan, Jawa Barat', satuan: 'kg', deskripsi: 'Jahe segar untuk bumbu dapur dan minuman hangat.', imageUrl: '', unggulan: false },
    { id: 'p13', nama: 'Kunyit Kuning', kategori: 'Pertanian', harga: 16000, stok: 48, asal: 'Lampung Tengah, Lampung', satuan: 'kg', deskripsi: 'Kunyit segar untuk bumbu kuning dan jamu.', imageUrl: '', unggulan: false },
    { id: 'p14', nama: 'Bawang Merah Brebes', kategori: 'Pertanian', harga: 32000, stok: 60, asal: 'Brebes, Jawa Tengah', satuan: 'kg', deskripsi: 'Bawang merah berkualitas dari sentra produksi Brebes.', imageUrl: '', unggulan: true },
    { id: 'p15', nama: 'Bawang Putih Katingan', kategori: 'Pertanian', harga: 36000, stok: 33, asal: 'Katingan, Kalimantan Tengah', satuan: 'kg', deskripsi: 'Bawang putih lokal dengan aroma kuat.', imageUrl: '', unggulan: false },
    { id: 'p16', nama: 'Tomat Merah Sari', kategori: 'Pertanian', harga: 12000, stok: 70, asal: 'Berastagi, Sumatera Utara', satuan: 'kg', deskripsi: 'Tomat merah segar dari dataran tinggi Karo.', imageUrl: '', unggulan: false },
    { id: 'p17', nama: 'Kentang Dieng', kategori: 'Pertanian', harga: 22000, stok: 45, asal: 'Wonosobo, Jawa Tengah', satuan: 'kg', deskripsi: 'Kentang berkualitas dari dataran tinggi Dieng.', imageUrl: '', unggulan: true },
    { id: 'p18', nama: 'Wortel Berastagi', kategori: 'Pertanian', harga: 14000, stok: 40, asal: 'Berastagi, Sumatera Utara', satuan: 'kg', deskripsi: 'Wortel segar, manis, dan renyah.', imageUrl: '', unggulan: false },
    { id: 'p19', nama: 'Ikan Lele Segar', kategori: 'Perikanan', harga: 30000, stok: 28, asal: 'Sukabumi, Jawa Barat', satuan: 'kg', deskripsi: 'Lele segar dari kolam terpal, cocok digoreng atau dibakar.', imageUrl: '', unggulan: false },
    { id: 'p20', nama: 'Ikan Patin', kategori: 'Perikanan', harga: 35000, stok: 22, asal: 'Jambi, Jambi', satuan: 'kg', deskripsi: 'Ikan patin daging lembut untuk gulai dan soup.', imageUrl: '', unggulan: false },
    { id: 'p21', nama: 'Cumi-cumi Segar', kategori: 'Perikanan', harga: 78000, stok: 12, asal: 'Cilacap, Jawa Tengah', satuan: 'kg', deskripsi: 'Cumi segar dari hasil tangkapan nelayan Cilacap.', imageUrl: '', unggulan: true },
    { id: 'p22', nama: 'Kerang Dara Kupas', kategori: 'Perikanan', harga: 40000, stok: 18, asal: 'Banten, Banten', satuan: '500 g', deskripsi: 'Kerang dara kupas segar, cocok untuk masakan Padang.', imageUrl: '', unggulan: false },
    { id: 'p23', nama: 'Ikan Kakap Putih', kategori: 'Perikanan', harga: 85000, stok: 10, asal: 'Bali, Bali', satuan: 'kg', deskripsi: 'Kakap putih segar, daging putih lembut dan gurih.', imageUrl: '', unggulan: false },
    { id: 'p24', nama: 'Cabe Merah Keriting', kategori: 'Pertanian', harga: 42000, stok: 38, asal: 'Garut, Jawa Barat', satuan: 'kg', deskripsi: 'Cabai merah keriting segar untuk bumbu dan sambal.', imageUrl: '', unggulan: false },
    { id: 'p25', nama: 'Teh Hijau Curah', kategori: 'Pertanian', harga: 38000, stok: 25, asal: 'Wonosobo, Jawa Tengah', satuan: '250 g', deskripsi: 'Teh hijau curah dari perkebunan Wonosobo.', imageUrl: '', unggulan: false },
  ];
}

/** Dua puluh dua tutorial contoh. */
export function createSampleGuides() {
  return [
    { id: 'g1', judul: 'Menyiapkan sawah, tegalan, dan pekarangan', kategori: 'Pertanian', tingkat: 'Pemula', topik: 'Lahan', imageUrl: '', ringkasan: 'Sawah: bajak atau traktor tangan, garu, lalu ratakan lumpur sebelum tanam.', langkah: ['Sawah: bajak atau traktor tangan, garu, lalu ratakan lumpur sebelum tanam.', 'Tegalan dan pekarangan: gemburkan tanah, campur pupuk kandang atau kompos.', 'Buat bedengan dan parit drainase untuk sayuran dan palawija.'], tips: 'jerami sisa panen bisa dikomposkan lalu dikembalikan ke lahan.' },
    { id: 'g2', judul: 'Memilih benih dan menanam', kategori: 'Pertanian', tingkat: 'Pemula', topik: 'Tanam', imageUrl: '', ringkasan: 'Pilih benih bersertifikat dan varietas unggul yang cocok dengan wilayahmu, misalnya Inpari untuk padi sawah.', langkah: ['Pilih benih bersertifikat dan varietas unggul yang cocok dengan wilayahmu, misalnya Inpari untuk padi sawah.', 'Tanam padi dengan sistem jajar legowo agar cahaya dan udara lebih leluasa.', 'Atur waktu tanam mengikuti awal musim hujan atau kemarau di daerahmu.'], tips: 'tanyakan varietas dan jadwal tanam ke penyuluh pertanian lapangan (PPL).' },
    { id: 'g3', judul: 'Air, pupuk, dan hama', kategori: 'Pertanian', tingkat: 'Pemula', topik: 'Perawatan', imageUrl: '', ringkasan: 'Padi tidak harus tergenang terus; pengairan berselang (basah-kering) bisa menghemat air.', langkah: ['Padi tidak harus tergenang terus; pengairan berselang (basah-kering) bisa menghemat air.', 'Gunakan pupuk berimbang: kombinasikan pupuk organik dan NPK sesuai anjuran.', 'Pantau hama seperti wereng cokelat dan tikus, dan utamakan pengendalian hama terpadu (PHT).'], tips: 'kelompok tani bisa mengendalikan hama serentak dan lebih hemat tenaga.' },
    { id: 'g4', judul: 'Panen dan pascapanen', kategori: 'Pertanian', tingkat: 'Pemula', topik: 'Panen', imageUrl: '', ringkasan: 'Panen padi saat sekitar 90–95% bulir menguning.', langkah: ['Panen padi saat sekitar 90–95% bulir menguning.', 'Jemur gabah sampai kadar air sekitar 14% sebelum disimpan atau digiling.', 'Kopi dan kakao: petik buah matang, lalu fermentasi dan jemur sesuai standar.'], tips: 'catat tanggal tanam, pupuk, dan hasil panen sebagai bahan evaluasi musim berikutnya.' },
    { id: 'g5', judul: 'Menyiapkan kolam atau tambak', kategori: 'Perikanan', tingkat: 'Pemula', topik: 'Kolam & Tambak', imageUrl: '', ringkasan: 'Air tawar: kolam terpal atau tanah untuk nila, lele, dan patin. Air payau: tambak untuk bandeng dan udang vaname.', langkah: ['Air tawar: kolam terpal atau tanah untuk nila, lele, dan patin. Air payau: tambak untuk bandeng dan udang vaname.', 'Keringkan dan jemur dasar kolam, beri kapur bila perlu, lalu isi air bertahap.', 'Pastikan air masuk bersih, ada saluran pembuangan, dan aerasi cukup (kincir untuk tambak).'], tips: 'biarkan air beberapa hari hingga warnanya stabil sebelum benih ditebar.' },
    { id: 'g6', judul: 'Memilih dan menebar benih', kategori: 'Perikanan', tingkat: 'Pemula', topik: 'Benih', imageUrl: '', ringkasan: 'Beli benih dari Balai Benih Ikan (BBI) atau pembenih yang tepercaya.', langkah: ['Beli benih dari Balai Benih Ikan (BBI) atau pembenih yang tepercaya.', 'Pilih benih aktif, sehat, dan berukuran seragam.', 'Tebar pagi atau sore saat suhu sejuk, setelah suhu air disamakan (aklimatisasi).'], tips: 'kepadatan yang terlalu tinggi membuat air cepat kotor dan ikan mudah stres.' },
    { id: 'g7', judul: 'Pakan dan kualitas air', kategori: 'Perikanan', tingkat: 'Pemula', topik: 'Pakan & Air', imageUrl: '', ringkasan: 'Beri pelet sesuai jenis dan ukuran ikan, secukupnya dan teratur.', langkah: ['Beri pelet sesuai jenis dan ukuran ikan, secukupnya dan teratur.', 'Maggot BSF dapat menjadi pakan tambahan bagi lele dan nila.', 'Pantau suhu, pH, bau air, dan nafsu makan ikan.'], tips: 'ikan megap-megap di permukaan biasanya tanda oksigen kurang: segera aerasi atau ganti air.' },
    { id: 'g8', judul: 'Panen dan rantai dingin', kategori: 'Perikanan', tingkat: 'Pemula', topik: 'Panen', imageUrl: '', ringkasan: 'Panen saat ukuran sesuai permintaan pasar, dan kurangi pakan sebelum panen.', langkah: ['Panen saat ukuran sesuai permintaan pasar, dan kurangi pakan sebelum panen.', 'Segera beri es agar ikan tetap segar sampai ke pembeli.', 'Olah menjadi bandeng presto, terasi, atau abon untuk menambah nilai dan masa simpan.'], tips: 'jalin pembeli tetap, misalnya warung makan, katering, dan pengepul, sebelum panen.' },
    { id: 'g9', judul: 'Subak, air dibagi bersama', kategori: 'Kearifan Lokal', tingkat: 'Pemula', topik: 'Bali · Subak', imageUrl: '', ringkasan: 'Sistem pengairan sawah yang diatur petani secara gotong royong dengan landasan Tri Hita Karana. Lanskap subak diakui UNESCO sebagai Warisan Dunia.', langkah: [], tips: '' },
    { id: 'g10', judul: 'Membaca tanda musim', kategori: 'Kearifan Lokal', tingkat: 'Pemula', topik: 'Jawa · Pranata Mangsa', imageUrl: '', ringkasan: 'Kalender tani tradisional Jawa yang memakai tanda alam untuk menentukan waktu tanam. Kini bisa dipadukan dengan prakiraan cuaca BMKG.', langkah: [], tips: '' },
    { id: 'g11', judul: 'Ikan di antara batang padi', kategori: 'Kearifan Lokal', tingkat: 'Pemula', topik: 'Mina Padi', imageUrl: '', ringkasan: 'Memelihara ikan seperti nila atau mas di sawah bersama padi. Ikan dapat membantu memakan hama, sehingga satu lahan menghasilkan padi sekaligus ikan.', langkah: [], tips: '' },
    { id: 'g12', judul: 'Menjaga laut lewat adat', kategori: 'Kearifan Lokal', tingkat: 'Pemula', topik: 'Maluku & Papua · Sasi', imageUrl: '', ringkasan: 'Aturan adat yang melarang panen hasil laut atau kebun pada waktu tertentu, agar sumber daya sempat pulih.', langkah: [], tips: '' },
    { id: 'g13', judul: 'Budidaya Cabai Rawit di Lahan Sempit', kategori: 'Pertanian', tingkat: 'Menengah', topik: 'Cabai', imageUrl: '', ringkasan: 'Menanam cabai rawit di pot atau polybag agar hasilnya maksimal meskipun lahan terbatas.', langkah: ['Siapkan media tanam berupa campuran tanah, pupuk kandang, dan sekam dengan perbandingan 2:1:1.', 'Pilih bibit cabai unggul yang sudah berdaun 4–5 helai.', 'Tanam di polybag dengan jarak cukup, siram pagi dan sore.', 'Beri pupuk NPK 2 minggu sekali dan kontrol hama ulat.', 'Panen saat buah berwarna merah cerah.'], tips: 'cabai menyukai sinar matahari penuh; letakkan polybag di tempat terbuka.' },
    { id: 'g14', judul: 'Cara Menanam Tomat Hidroponik', kategori: 'Pertanian', tingkat: 'Menengah', topik: 'Tomat', imageUrl: '', ringkasan: 'Menanam tomat tanpa tanah dengan sistem hidroponik untuk hasil bersih dan bebas hama tanah.', langkah: ['Siapkan sistem hidroponik sederhana (NFT atau pasang surut).', 'Gunakan nutrisi AB mix khusus sayur dengan EC sekitar 2.0–2.5.', 'Semai benih tomat di rockwool hingga berdaun 4 helai.', 'Pindahkan ke sistem hidroponik dan pasang ajir/tali penyangga.', 'Kontrol pH 5.5–6.5 dan ganti nutrisi setiap 1–2 minggu.'], tips: 'jaga suhu 20–28°C dan sirkulasi udara agar tomat tidak terserang jamur.' },
    { id: 'g15', judul: 'Pembuatan Pupuk Kompos dari Sampah Organik', kategori: 'Pertanian', tingkat: 'Pemula', topik: 'Pupuk', imageUrl: '', ringkasan: 'Mengubah sisa dapur dan sampah kebun menjadi pupuk organik yang kaya nutrisi.', langkah: ['Kumpulkan sampah organik: sisa sayur, kulit buah, daun kering, dan ranting kecil.', 'Tumpuk di lubang atau wadah tertutup, lapisi tanah di antaranya.', 'Jaga kelembapan seperti kain peras; balik setiap 1–2 minggu.', 'Setelah 1–3 bulan, kompos berwarna cokelat gelap dan siap dipakai.'], tips: 'hindari daging, tulang, dan minyak agar tidak mengundang hama.' },
    { id: 'g16', judul: 'Budidaya Lele di Kolam Terpal', kategori: 'Perikanan', tingkat: 'Pemula', topik: 'Lele', imageUrl: '', ringkasan: 'Panduan praktis memelihara lele di kolam terpal untuk pemula.', langkah: ['Siapkan kolam terpal ukuran minimal 2×1 meter, isi air setinggi 60–80 cm.', 'Tebar benih lele ukuran 3–5 cm dengan padat tebar 100–200 ekor per m³.', 'Beri pakan pelet 2 kali sehari pagi dan sore.', 'Ganti air secara parsial setiap minggu jika air keruh atau berbau.', 'Panen saat lele mencapai ukuran 6–8 ekor per kg, biasanya 3–4 bulan.'], tips: 'waktu panen pagi atau sore agar ikan tidak stres.' },
    { id: 'g17', judul: 'Teknik Pembenihan Ikan Nila', kategori: 'Perikanan', tingkat: 'Lanjut', topik: 'Nila', imageUrl: '', ringkasan: 'Cara memproduksi benih nila sendiri untuk menekan biaya budidaya.', langkah: ['Pilih induk jantan dan betina yang sehat, berukuran minimal 300 gram.', 'Masukkan ke dalam bak pemijahan dengan rasio 1 jantan : 3 betina.', 'Telur akan dikerami di mulut induk betina selama 4–5 hari.', 'Pindahkan larva ke bak pendederan dan beri pakan alami (infusoria) lalu pelet halus.', 'Benih siap ditebar ke kolam setelah berukuran 3–5 cm.'], tips: 'suhu air 28–30°C mempercepat proses pemijahan.' },
    { id: 'g18', judul: 'Pengolahan Rumput Laut Menjadi Agar-agar', kategori: 'Perikanan', tingkat: 'Menengah', topik: 'Rumput Laut', imageUrl: '', ringkasan: 'Mengolah rumput laut kering menjadi agar-agar yang tahan lama dan bernilai jual lebih tinggi.', langkah: ['Cuci rumput laut kering hingga bersih, lalu rendam air bersih selama 2 jam.', 'Rebus dengan air (1 kg rumput laut : 10 liter air) selama 1–2 jam sampai hancur.', 'Saring dengan kain saring untuk memisahkan ampas.', 'Tuang ke cetakan dan biarkan membeku di suhu ruang.', 'Potong-potong atau keringkan menjadi agar-agar lembaran.'], tips: 'bisa ditambah pewarna alami dan gula untuk variasi rasa.' },
    { id: 'g19', judul: 'Menjual Produk Tani ke Pasar Digital', kategori: 'Kearifan Lokal', tingkat: 'Pemula', topik: 'Pemasaran', imageUrl: '', ringkasan: 'Strategi sederhana memasarkan produk tani dan hasil perikanan melalui WhatsApp dan media sosial.', langkah: ['Ambil foto produk dengan latar bersih dan pencahayaan alami.', 'Tulis deskripsi jelas: nama, harga, satuan, asal, dan cara pesan.', 'Bagikan ke grup WhatsApp warga atau halaman media sosial.', 'Siapkan nomor WhatsApp khusus dan balas pesan calon pembeli dengan cepat.', 'Kemas rapi dan pastikan produk sampai segar ke tangan pembeli.'], tips: 'beri diskon untuk pembelian borongan agar pembeli tetap datang.' },
    { id: 'g20', judul: 'Pengairan Tetes untuk Tanaman Sayur', kategori: 'Pertanian', tingkat: 'Menengah', topik: 'Irigasi', imageUrl: '', ringkasan: 'Sistem irigasi tetes hemat air dan tenaga, cocok untuk sayuran di lahan sempit.', langkah: ['Pasang selang utama dan selang drip di sepanjang bedengan tanaman.', 'Hubungkan dengan pompa atau tangki air yang diletakkan lebih tinggi.', 'Atur debit air agar tanah selalu lembap tapi tidak tergenang.', 'Nyalakan 1–2 kali sehari tergantung cuaca.', 'Bersihkan selang secara berkala agar tidak tersumbat.'], tips: 'hemat air hingga 50% dibandingkan cara siram konvensional.' },
    { id: 'g21', judul: 'Budidaya Udang Vaname di Tambak Tradisional', kategori: 'Perikanan', tingkat: 'Lanjut', topik: 'Udang', imageUrl: '', ringkasan: 'Prinsip budidaya udang vaname yang ramah lingkungan dan mengurangi risiko penyakit.', langkah: ['Siapkan tambak, keringkan dasar, dan beri kapur untuk menstabilkan pH.', 'Isi air dan biarkan plankton tumbuh selama 5–7 hari sebelum menebar benih.', 'Tebar benih berukuran PL-12 dengan padat 50–80 ekor per m².', 'Kontrol kualitas air (suhu, pH, DO) setiap hari.', 'Panen saat udang mencapai ukuran 40–60 ekor per kg, biasanya 90–100 hari.'], tips: 'jangan overfeeding karena sisa pakan merusak kualitas air.' },
    { id: 'g22', judul: 'Pengawetan Ikan dengan Cara Pengasapan', kategori: 'Perikanan', tingkat: 'Pemula', topik: 'Pengolahan', imageUrl: '', ringkasan: 'Mengasap ikan agar lebih awet, gurih, dan memiliki nilai tambah ekonomis.', langkah: ['Bersihkan ikan, buang isi perut, dan belah menjadi dua bagian.', 'Rendam dalam larutan garam (10%) selama 1–2 jam.', 'Tiriskan lalu jemur setengah kering (1–2 hari).', 'Asap dengan kayu bakar serai atau kelapa selama 6–8 jam.', 'Simpan di wadah tertutup di tempat kering.'], tips: 'cara pengasapan dingin menghasilkan ikan yang lebih awet.' },
  ];
}
