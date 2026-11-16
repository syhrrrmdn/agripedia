-- ============================================================
-- AgriPedia — setup database Supabase
-- Cara pakai: Supabase Dashboard -> SQL Editor -> New query ->
-- tempel seluruh isi file ini -> Run.
--
-- Isi skrip:
--   1. Hapus tabel sisa project lama.
--   2. Buat tabel AgriPedia (users, products, guides, settings).
--   3. Isi data dummy: 3 akun, 25 produk, 22 edukasi.
-- ============================================================

BEGIN;

-- 1) Hapus tabel project lama milik project ini -------------------
DROP TABLE IF EXISTS "User", "AuditLog", "Election", "UserCategory", "DynamicAttribute", "SystemSettings", "VoteRecord", "Candidate", "users", "products", "guides", "settings" CASCADE;

-- 2) Buat tabel AgriPedia -----------------------------------------
CREATE TABLE "users" (
  "id" SERIAL NOT NULL,
  "email" TEXT NOT NULL,
  "nama" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "products" (
  "id" TEXT NOT NULL,
  "nama" TEXT NOT NULL,
  "kategori" TEXT NOT NULL DEFAULT 'Pertanian',
  "harga" INTEGER NOT NULL DEFAULT 0,
  "stok" INTEGER NOT NULL DEFAULT 0,
  "asal" TEXT NOT NULL DEFAULT '',
  "satuan" TEXT NOT NULL DEFAULT '',
  "deskripsi" TEXT NOT NULL DEFAULT '',
  "image_url" TEXT NOT NULL DEFAULT '',
  "unggulan" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "guides" (
  "id" TEXT NOT NULL,
  "judul" TEXT NOT NULL,
  "kategori" TEXT NOT NULL DEFAULT 'Pertanian',
  "tingkat" TEXT NOT NULL DEFAULT 'Pemula',
  "topik" TEXT NOT NULL DEFAULT '',
  "ringkasan" TEXT NOT NULL DEFAULT '',
  "langkah" TEXT[] NOT NULL,
  "tips" TEXT NOT NULL DEFAULT '',
  "image_url" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "guides_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "settings" (
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL DEFAULT '',
  CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- 3) Data dummy ---------------------------------------------------
INSERT INTO "users" ("email", "nama", "role", "password_hash") VALUES
  ('admin@gmail.com', 'Admin Agripedia', 'admin', '7d5605fb95050b2076ae618933fa3a4a:b471cf4c60167e87c3735e4735f180477a64623b5d5cd9a1aacee73f5f8d08558888f71bf5e5f13a99a1769ee329365deb27140cfed3a020e83f9e1a87660594'),
  ('penjual@gmail.com', 'Pak Tani Penjual', 'penjual', '805c68ad2fc363d5383919ee9ee1aee2:e8c5226d7c497c03d2f0a5a17ae163012b967632391ec61317c4b54f2b7579664d7edc8eb57cd90b05bd2e9aa3abdf5d6a407c18c352cac79115e401998c4e68'),
  ('buyer@gmail.com', 'Bu Sari Pembeli', 'buyer', 'e59a807aeb8d79f67ebde6f1a2fa2661:721a2fb0b0c1b11d124ae98a146af6b4ae9f3670b66d06174e11be5d85758851cf67840a45cb00ba304133d4d19a63e18035c23736177a339b32c5a972f7a9f8');

INSERT INTO "products" ("id", "nama", "kategori", "harga", "stok", "asal", "satuan", "deskripsi", "image_url", "unggulan", "created_at", "updated_at") VALUES
  ('p1', 'Beras Pandan Wangi', 'Pertanian', 92000, 42, 'Cianjur, Jawa Barat', '5 kg', 'Beras pulen dan harum, digiling dari padi sawah petani lokal.', '', true, now() + interval '0 milliseconds', now() + interval '0 milliseconds'),
  ('p2', 'Kopi Arabika Gayo', 'Pertanian', 62000, 30, 'Aceh Tengah, Aceh', '250 g', 'Biji kopi dataran tinggi Gayo yang dipetik merah oleh kelompok tani.', '', true, now() + interval '10 milliseconds', now() + interval '10 milliseconds'),
  ('p3', 'Madu Hutan Sumbawa', 'Pertanian', 95000, 18, 'Sumbawa, Nusa Tenggara Barat', 'botol 500 ml', 'Madu hutan alami yang dipanen oleh kelompok petani madu.', '', true, now() + interval '20 milliseconds', now() + interval '20 milliseconds'),
  ('p4', 'Cabai Rawit Merah', 'Pertanian', 55000, 25, 'Kediri, Jawa Timur', 'kg', 'Cabai rawit segar, pedas, dan siap untuk sambal.', '', false, now() + interval '30 milliseconds', now() + interval '30 milliseconds'),
  ('p5', 'Gula Aren Cetak', 'Pertanian', 28000, 40, 'Minahasa, Sulawesi Utara', '500 g', 'Gula aren dari nira pohon enau, cocok untuk kolak dan kopi.', '', false, now() + interval '40 milliseconds', now() + interval '40 milliseconds'),
  ('p6', 'Pala Biji Banda', 'Pertanian', 45000, 22, 'Kepulauan Banda, Maluku', '100 g', 'Pala kering beraroma tajam dari Kepulauan Rempah.', '', false, now() + interval '50 milliseconds', now() + interval '50 milliseconds'),
  ('p7', 'Ikan Nila Segar', 'Perikanan', 38000, 34, 'Danau Toba, Sumatra Utara', 'kg', 'Nila segar dari keramba jaring apung, cocok untuk digoreng atau dibakar.', '', true, now() + interval '60 milliseconds', now() + interval '60 milliseconds'),
  ('p8', 'Udang Vaname', 'Perikanan', 95000, 16, 'Indramayu, Jawa Barat', 'kg', 'Udang tambak segar, cocok untuk aneka masakan.', '', true, now() + interval '70 milliseconds', now() + interval '70 milliseconds'),
  ('p9', 'Bandeng Presto', 'Perikanan', 46000, 21, 'Gresik, Jawa Timur', '500 g', 'Bandeng berduri lunak, praktis untuk hidangan keluarga.', '', false, now() + interval '80 milliseconds', now() + interval '80 milliseconds'),
  ('p10', 'Rumput Laut Kering', 'Perikanan', 30000, 50, 'Rote Ndao, Nusa Tenggara Timur', 'kg', 'Rumput laut hasil budidaya pesisir, siap diolah.', '', false, now() + interval '90 milliseconds', now() + interval '90 milliseconds'),
  ('p11', 'Terasi Udang Rebon', 'Perikanan', 24000, 35, 'Cirebon, Jawa Barat', '250 g', 'Terasi tradisional untuk sambal dan bumbu masakan.', '', false, now() + interval '100 milliseconds', now() + interval '100 milliseconds'),
  ('p12', 'Jahe Emas Segar', 'Pertanian', 18000, 55, 'Kuningan, Jawa Barat', 'kg', 'Jahe segar untuk bumbu dapur dan minuman hangat.', '', false, now() + interval '110 milliseconds', now() + interval '110 milliseconds'),
  ('p13', 'Kunyit Kuning', 'Pertanian', 16000, 48, 'Lampung Tengah, Lampung', 'kg', 'Kunyit segar untuk bumbu kuning dan jamu.', '', false, now() + interval '120 milliseconds', now() + interval '120 milliseconds'),
  ('p14', 'Bawang Merah Brebes', 'Pertanian', 32000, 60, 'Brebes, Jawa Tengah', 'kg', 'Bawang merah berkualitas dari sentra produksi Brebes.', '', true, now() + interval '130 milliseconds', now() + interval '130 milliseconds'),
  ('p15', 'Bawang Putih Katingan', 'Pertanian', 36000, 33, 'Katingan, Kalimantan Tengah', 'kg', 'Bawang putih lokal dengan aroma kuat.', '', false, now() + interval '140 milliseconds', now() + interval '140 milliseconds'),
  ('p16', 'Tomat Merah Sari', 'Pertanian', 12000, 70, 'Berastagi, Sumatera Utara', 'kg', 'Tomat merah segar dari dataran tinggi Karo.', '', false, now() + interval '150 milliseconds', now() + interval '150 milliseconds'),
  ('p17', 'Kentang Dieng', 'Pertanian', 22000, 45, 'Wonosobo, Jawa Tengah', 'kg', 'Kentang berkualitas dari dataran tinggi Dieng.', '', true, now() + interval '160 milliseconds', now() + interval '160 milliseconds'),
  ('p18', 'Wortel Berastagi', 'Pertanian', 14000, 40, 'Berastagi, Sumatera Utara', 'kg', 'Wortel segar, manis, dan renyah.', '', false, now() + interval '170 milliseconds', now() + interval '170 milliseconds'),
  ('p19', 'Ikan Lele Segar', 'Perikanan', 30000, 28, 'Sukabumi, Jawa Barat', 'kg', 'Lele segar dari kolam terpal, cocok digoreng atau dibakar.', '', false, now() + interval '180 milliseconds', now() + interval '180 milliseconds'),
  ('p20', 'Ikan Patin', 'Perikanan', 35000, 22, 'Jambi, Jambi', 'kg', 'Ikan patin daging lembut untuk gulai dan soup.', '', false, now() + interval '190 milliseconds', now() + interval '190 milliseconds'),
  ('p21', 'Cumi-cumi Segar', 'Perikanan', 78000, 12, 'Cilacap, Jawa Tengah', 'kg', 'Cumi segar dari hasil tangkapan nelayan Cilacap.', '', true, now() + interval '200 milliseconds', now() + interval '200 milliseconds'),
  ('p22', 'Kerang Dara Kupas', 'Perikanan', 40000, 18, 'Banten, Banten', '500 g', 'Kerang dara kupas segar, cocok untuk masakan Padang.', '', false, now() + interval '210 milliseconds', now() + interval '210 milliseconds'),
  ('p23', 'Ikan Kakap Putih', 'Perikanan', 85000, 10, 'Bali, Bali', 'kg', 'Kakap putih segar, daging putih lembut dan gurih.', '', false, now() + interval '220 milliseconds', now() + interval '220 milliseconds'),
  ('p24', 'Cabe Merah Keriting', 'Pertanian', 42000, 38, 'Garut, Jawa Barat', 'kg', 'Cabai merah keriting segar untuk bumbu dan sambal.', '', false, now() + interval '230 milliseconds', now() + interval '230 milliseconds'),
  ('p25', 'Teh Hijau Curah', 'Pertanian', 38000, 25, 'Wonosobo, Jawa Tengah', '250 g', 'Teh hijau curah dari perkebunan Wonosobo.', '', false, now() + interval '240 milliseconds', now() + interval '240 milliseconds');

INSERT INTO "guides" ("id", "judul", "kategori", "tingkat", "topik", "ringkasan", "langkah", "tips", "image_url", "created_at", "updated_at") VALUES
  ('g1', 'Menyiapkan sawah, tegalan, dan pekarangan', 'Pertanian', 'Pemula', 'Lahan', 'Sawah: bajak atau traktor tangan, garu, lalu ratakan lumpur sebelum tanam.', ARRAY['Sawah: bajak atau traktor tangan, garu, lalu ratakan lumpur sebelum tanam.', 'Tegalan dan pekarangan: gemburkan tanah, campur pupuk kandang atau kompos.', 'Buat bedengan dan parit drainase untuk sayuran dan palawija.']::text[], 'jerami sisa panen bisa dikomposkan lalu dikembalikan ke lahan.', '', now() + interval '0 milliseconds', now() + interval '0 milliseconds'),
  ('g2', 'Memilih benih dan menanam', 'Pertanian', 'Pemula', 'Tanam', 'Pilih benih bersertifikat dan varietas unggul yang cocok dengan wilayahmu, misalnya Inpari untuk padi sawah.', ARRAY['Pilih benih bersertifikat dan varietas unggul yang cocok dengan wilayahmu, misalnya Inpari untuk padi sawah.', 'Tanam padi dengan sistem jajar legowo agar cahaya dan udara lebih leluasa.', 'Atur waktu tanam mengikuti awal musim hujan atau kemarau di daerahmu.']::text[], 'tanyakan varietas dan jadwal tanam ke penyuluh pertanian lapangan (PPL).', '', now() + interval '10 milliseconds', now() + interval '10 milliseconds'),
  ('g3', 'Air, pupuk, dan hama', 'Pertanian', 'Pemula', 'Perawatan', 'Padi tidak harus tergenang terus; pengairan berselang (basah-kering) bisa menghemat air.', ARRAY['Padi tidak harus tergenang terus; pengairan berselang (basah-kering) bisa menghemat air.', 'Gunakan pupuk berimbang: kombinasikan pupuk organik dan NPK sesuai anjuran.', 'Pantau hama seperti wereng cokelat dan tikus, dan utamakan pengendalian hama terpadu (PHT).']::text[], 'kelompok tani bisa mengendalikan hama serentak dan lebih hemat tenaga.', '', now() + interval '20 milliseconds', now() + interval '20 milliseconds'),
  ('g4', 'Panen dan pascapanen', 'Pertanian', 'Pemula', 'Panen', 'Panen padi saat sekitar 90–95% bulir menguning.', ARRAY['Panen padi saat sekitar 90–95% bulir menguning.', 'Jemur gabah sampai kadar air sekitar 14% sebelum disimpan atau digiling.', 'Kopi dan kakao: petik buah matang, lalu fermentasi dan jemur sesuai standar.']::text[], 'catat tanggal tanam, pupuk, dan hasil panen sebagai bahan evaluasi musim berikutnya.', '', now() + interval '30 milliseconds', now() + interval '30 milliseconds'),
  ('g5', 'Menyiapkan kolam atau tambak', 'Perikanan', 'Pemula', 'Kolam & Tambak', 'Air tawar: kolam terpal atau tanah untuk nila, lele, dan patin. Air payau: tambak untuk bandeng dan udang vaname.', ARRAY['Air tawar: kolam terpal atau tanah untuk nila, lele, dan patin. Air payau: tambak untuk bandeng dan udang vaname.', 'Keringkan dan jemur dasar kolam, beri kapur bila perlu, lalu isi air bertahap.', 'Pastikan air masuk bersih, ada saluran pembuangan, dan aerasi cukup (kincir untuk tambak).']::text[], 'biarkan air beberapa hari hingga warnanya stabil sebelum benih ditebar.', '', now() + interval '40 milliseconds', now() + interval '40 milliseconds'),
  ('g6', 'Memilih dan menebar benih', 'Perikanan', 'Pemula', 'Benih', 'Beli benih dari Balai Benih Ikan (BBI) atau pembenih yang tepercaya.', ARRAY['Beli benih dari Balai Benih Ikan (BBI) atau pembenih yang tepercaya.', 'Pilih benih aktif, sehat, dan berukuran seragam.', 'Tebar pagi atau sore saat suhu sejuk, setelah suhu air disamakan (aklimatisasi).']::text[], 'kepadatan yang terlalu tinggi membuat air cepat kotor dan ikan mudah stres.', '', now() + interval '50 milliseconds', now() + interval '50 milliseconds'),
  ('g7', 'Pakan dan kualitas air', 'Perikanan', 'Pemula', 'Pakan & Air', 'Beri pelet sesuai jenis dan ukuran ikan, secukupnya dan teratur.', ARRAY['Beri pelet sesuai jenis dan ukuran ikan, secukupnya dan teratur.', 'Maggot BSF dapat menjadi pakan tambahan bagi lele dan nila.', 'Pantau suhu, pH, bau air, dan nafsu makan ikan.']::text[], 'ikan megap-megap di permukaan biasanya tanda oksigen kurang: segera aerasi atau ganti air.', '', now() + interval '60 milliseconds', now() + interval '60 milliseconds'),
  ('g8', 'Panen dan rantai dingin', 'Perikanan', 'Pemula', 'Panen', 'Panen saat ukuran sesuai permintaan pasar, dan kurangi pakan sebelum panen.', ARRAY['Panen saat ukuran sesuai permintaan pasar, dan kurangi pakan sebelum panen.', 'Segera beri es agar ikan tetap segar sampai ke pembeli.', 'Olah menjadi bandeng presto, terasi, atau abon untuk menambah nilai dan masa simpan.']::text[], 'jalin pembeli tetap, misalnya warung makan, katering, dan pengepul, sebelum panen.', '', now() + interval '70 milliseconds', now() + interval '70 milliseconds'),
  ('g9', 'Subak, air dibagi bersama', 'Kearifan Lokal', 'Pemula', 'Bali · Subak', 'Sistem pengairan sawah yang diatur petani secara gotong royong dengan landasan Tri Hita Karana. Lanskap subak diakui UNESCO sebagai Warisan Dunia.', ARRAY[]::text[], '', '', now() + interval '80 milliseconds', now() + interval '80 milliseconds'),
  ('g10', 'Membaca tanda musim', 'Kearifan Lokal', 'Pemula', 'Jawa · Pranata Mangsa', 'Kalender tani tradisional Jawa yang memakai tanda alam untuk menentukan waktu tanam. Kini bisa dipadukan dengan prakiraan cuaca BMKG.', ARRAY[]::text[], '', '', now() + interval '90 milliseconds', now() + interval '90 milliseconds'),
  ('g11', 'Ikan di antara batang padi', 'Kearifan Lokal', 'Pemula', 'Mina Padi', 'Memelihara ikan seperti nila atau mas di sawah bersama padi. Ikan dapat membantu memakan hama, sehingga satu lahan menghasilkan padi sekaligus ikan.', ARRAY[]::text[], '', '', now() + interval '100 milliseconds', now() + interval '100 milliseconds'),
  ('g12', 'Menjaga laut lewat adat', 'Kearifan Lokal', 'Pemula', 'Maluku & Papua · Sasi', 'Aturan adat yang melarang panen hasil laut atau kebun pada waktu tertentu, agar sumber daya sempat pulih.', ARRAY[]::text[], '', '', now() + interval '110 milliseconds', now() + interval '110 milliseconds'),
  ('g13', 'Budidaya Cabai Rawit di Lahan Sempit', 'Pertanian', 'Menengah', 'Cabai', 'Menanam cabai rawit di pot atau polybag agar hasilnya maksimal meskipun lahan terbatas.', ARRAY['Siapkan media tanam berupa campuran tanah, pupuk kandang, dan sekam dengan perbandingan 2:1:1.', 'Pilih bibit cabai unggul yang sudah berdaun 4–5 helai.', 'Tanam di polybag dengan jarak cukup, siram pagi dan sore.', 'Beri pupuk NPK 2 minggu sekali dan kontrol hama ulat.', 'Panen saat buah berwarna merah cerah.']::text[], 'cabai menyukai sinar matahari penuh; letakkan polybag di tempat terbuka.', '', now() + interval '120 milliseconds', now() + interval '120 milliseconds'),
  ('g14', 'Cara Menanam Tomat Hidroponik', 'Pertanian', 'Menengah', 'Tomat', 'Menanam tomat tanpa tanah dengan sistem hidroponik untuk hasil bersih dan bebas hama tanah.', ARRAY['Siapkan sistem hidroponik sederhana (NFT atau pasang surut).', 'Gunakan nutrisi AB mix khusus sayur dengan EC sekitar 2.0–2.5.', 'Semai benih tomat di rockwool hingga berdaun 4 helai.', 'Pindahkan ke sistem hidroponik dan pasang ajir/tali penyangga.', 'Kontrol pH 5.5–6.5 dan ganti nutrisi setiap 1–2 minggu.']::text[], 'jaga suhu 20–28°C dan sirkulasi udara agar tomat tidak terserang jamur.', '', now() + interval '130 milliseconds', now() + interval '130 milliseconds'),
  ('g15', 'Pembuatan Pupuk Kompos dari Sampah Organik', 'Pertanian', 'Pemula', 'Pupuk', 'Mengubah sisa dapur dan sampah kebun menjadi pupuk organik yang kaya nutrisi.', ARRAY['Kumpulkan sampah organik: sisa sayur, kulit buah, daun kering, dan ranting kecil.', 'Tumpuk di lubang atau wadah tertutup, lapisi tanah di antaranya.', 'Jaga kelembapan seperti kain peras; balik setiap 1–2 minggu.', 'Setelah 1–3 bulan, kompos berwarna cokelat gelap dan siap dipakai.']::text[], 'hindari daging, tulang, dan minyak agar tidak mengundang hama.', '', now() + interval '140 milliseconds', now() + interval '140 milliseconds'),
  ('g16', 'Budidaya Lele di Kolam Terpal', 'Perikanan', 'Pemula', 'Lele', 'Panduan praktis memelihara lele di kolam terpal untuk pemula.', ARRAY['Siapkan kolam terpal ukuran minimal 2×1 meter, isi air setinggi 60–80 cm.', 'Tebar benih lele ukuran 3–5 cm dengan padat tebar 100–200 ekor per m³.', 'Beri pakan pelet 2 kali sehari pagi dan sore.', 'Ganti air secara parsial setiap minggu jika air keruh atau berbau.', 'Panen saat lele mencapai ukuran 6–8 ekor per kg, biasanya 3–4 bulan.']::text[], 'waktu panen pagi atau sore agar ikan tidak stres.', '', now() + interval '150 milliseconds', now() + interval '150 milliseconds'),
  ('g17', 'Teknik Pembenihan Ikan Nila', 'Perikanan', 'Lanjut', 'Nila', 'Cara memproduksi benih nila sendiri untuk menekan biaya budidaya.', ARRAY['Pilih induk jantan dan betina yang sehat, berukuran minimal 300 gram.', 'Masukkan ke dalam bak pemijahan dengan rasio 1 jantan : 3 betina.', 'Telur akan dikerami di mulut induk betina selama 4–5 hari.', 'Pindahkan larva ke bak pendederan dan beri pakan alami (infusoria) lalu pelet halus.', 'Benih siap ditebar ke kolam setelah berukuran 3–5 cm.']::text[], 'suhu air 28–30°C mempercepat proses pemijahan.', '', now() + interval '160 milliseconds', now() + interval '160 milliseconds'),
  ('g18', 'Pengolahan Rumput Laut Menjadi Agar-agar', 'Perikanan', 'Menengah', 'Rumput Laut', 'Mengolah rumput laut kering menjadi agar-agar yang tahan lama dan bernilai jual lebih tinggi.', ARRAY['Cuci rumput laut kering hingga bersih, lalu rendam air bersih selama 2 jam.', 'Rebus dengan air (1 kg rumput laut : 10 liter air) selama 1–2 jam sampai hancur.', 'Saring dengan kain saring untuk memisahkan ampas.', 'Tuang ke cetakan dan biarkan membeku di suhu ruang.', 'Potong-potong atau keringkan menjadi agar-agar lembaran.']::text[], 'bisa ditambah pewarna alami dan gula untuk variasi rasa.', '', now() + interval '170 milliseconds', now() + interval '170 milliseconds'),
  ('g19', 'Menjual Produk Tani ke Pasar Digital', 'Kearifan Lokal', 'Pemula', 'Pemasaran', 'Strategi sederhana memasarkan produk tani dan hasil perikanan melalui WhatsApp dan media sosial.', ARRAY['Ambil foto produk dengan latar bersih dan pencahayaan alami.', 'Tulis deskripsi jelas: nama, harga, satuan, asal, dan cara pesan.', 'Bagikan ke grup WhatsApp warga atau halaman media sosial.', 'Siapkan nomor WhatsApp khusus dan balas pesan calon pembeli dengan cepat.', 'Kemas rapi dan pastikan produk sampai segar ke tangan pembeli.']::text[], 'beri diskon untuk pembelian borongan agar pembeli tetap datang.', '', now() + interval '180 milliseconds', now() + interval '180 milliseconds'),
  ('g20', 'Pengairan Tetes untuk Tanaman Sayur', 'Pertanian', 'Menengah', 'Irigasi', 'Sistem irigasi tetes hemat air dan tenaga, cocok untuk sayuran di lahan sempit.', ARRAY['Pasang selang utama dan selang drip di sepanjang bedengan tanaman.', 'Hubungkan dengan pompa atau tangki air yang diletakkan lebih tinggi.', 'Atur debit air agar tanah selalu lembap tapi tidak tergenang.', 'Nyalakan 1–2 kali sehari tergantung cuaca.', 'Bersihkan selang secara berkala agar tidak tersumbat.']::text[], 'hemat air hingga 50% dibandingkan cara siram konvensional.', '', now() + interval '190 milliseconds', now() + interval '190 milliseconds'),
  ('g21', 'Budidaya Udang Vaname di Tambak Tradisional', 'Perikanan', 'Lanjut', 'Udang', 'Prinsip budidaya udang vaname yang ramah lingkungan dan mengurangi risiko penyakit.', ARRAY['Siapkan tambak, keringkan dasar, dan beri kapur untuk menstabilkan pH.', 'Isi air dan biarkan plankton tumbuh selama 5–7 hari sebelum menebar benih.', 'Tebar benih berukuran PL-12 dengan padat 50–80 ekor per m².', 'Kontrol kualitas air (suhu, pH, DO) setiap hari.', 'Panen saat udang mencapai ukuran 40–60 ekor per kg, biasanya 90–100 hari.']::text[], 'jangan overfeeding karena sisa pakan merusak kualitas air.', '', now() + interval '200 milliseconds', now() + interval '200 milliseconds'),
  ('g22', 'Pengawetan Ikan dengan Cara Pengasapan', 'Perikanan', 'Pemula', 'Pengolahan', 'Mengasap ikan agar lebih awet, gurih, dan memiliki nilai tambah ekonomis.', ARRAY['Bersihkan ikan, buang isi perut, dan belah menjadi dua bagian.', 'Rendam dalam larutan garam (10%) selama 1–2 jam.', 'Tiriskan lalu jemur setengah kering (1–2 hari).', 'Asap dengan kayu bakar serai atau kelapa selama 6–8 jam.', 'Simpan di wadah tertutup di tempat kering.']::text[], 'cara pengasapan dingin menghasilkan ikan yang lebih awet.', '', now() + interval '210 milliseconds', now() + interval '210 milliseconds');

INSERT INTO "settings" ("key", "value") VALUES ('wa_number', '')
ON CONFLICT ("key") DO NOTHING;

COMMIT;

-- Verifikasi: harus 25 produk, 22 edukasi, 3 akun -----------------
SELECT 'products' AS tabel, count(*) AS jumlah FROM "products"
UNION ALL SELECT 'guides', count(*) FROM "guides"
UNION ALL SELECT 'users', count(*) FROM "users"
UNION ALL SELECT 'settings', count(*) FROM "settings";
