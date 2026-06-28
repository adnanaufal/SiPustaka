/*
  SiPustaka Seed Data
  - 10 Popular Indonesian books
  - 5 Store locations in Jabodetabek
  
  Note: User seeds must be created via Supabase Auth signup
  (the handle_new_user trigger auto-inserts into public.users).
  Create these accounts manually:
    - admin@sipustaka.com (then UPDATE role to 'admin')
    - cashier@sipustaka.com (then UPDATE role to 'cashier')
    - customer@sipustaka.com (default role: 'customer')
*/

-- ============================================
-- SEED BOOKS (10 Indonesian popular books)
-- ============================================
INSERT INTO books (title, author, category, year, price, stock, weight, cover_image, description) VALUES
(
  'Laskar Pelangi',
  'Andrea Hirata',
  'Novel',
  2005,
  89000,
  25,
  350,
  'https://upload.wikimedia.org/wikipedia/id/thumb/8/8e/Laskar_pelangi_sampul.jpg/250px-Laskar_pelangi_sampul.jpg',
  'Kisah inspiratif tentang perjuangan 10 anak Belitong dalam meraih pendidikan. Novel yang mengharukan dan memotivasi, bercerita tentang semangat pantang menyerah dalam menghadapi keterbatasan.'
),
(
  'Bumi Manusia',
  'Pramoedya Ananta Toer',
  'Sastra',
  1980,
  95000,
  15,
  400,
  'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1565658920i/1398034.jpg',
  'Novel pertama dari Tetralogi Buru yang mengisahkan kehidupan Minke, seorang pribumi terpelajar di era kolonial Belanda. Karya sastra Indonesia yang paling berpengaruh di abad ke-20.'
),
(
  'Filosofi Teras',
  'Henry Manampiring',
  'Self-Help',
  2018,
  75000,
  30,
  300,
  'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1548033656i/42861019.jpg',
  'Buku tentang filsafat Stoa yang dikemas dengan bahasa ringan dan relevan untuk kehidupan modern. Membantu pembaca mengelola emosi dan menghadapi tantangan hidup dengan bijak.'
),
(
  'Laut Bercerita',
  'Leila S. Chudori',
  'Novel',
  2017,
  98000,
  20,
  380,
  'https://www.gramedia.com/blog/content/images/2020/08/laut-bercerita-leila-s-chudori_gramedia.jpg',
  'Novel yang mengisahkan kehidupan aktivis mahasiswa di era Orde Baru dan perjuangan mereka melawan ketidakadilan. Sebuah penghormatan untuk para pejuang demokrasi Indonesia.'
),
(
  'Perahu Kertas',
  'Dee Lestari',
  'Fiksi',
  2009,
  79000,
  18,
  320,
  'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1356225544i/6765740.jpg',
  'Kisah cinta dan pencarian jati diri dua anak muda — Kugy yang bermimpi menjadi penulis dongeng dan Keenan yang bercita-cita menjadi pelukis. Sebuah perjalanan menemukan passion.'
),
(
  'Negeri 5 Menara',
  'Ahmad Fuadi',
  'Novel',
  2009,
  85000,
  22,
  350,
  'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1249749162i/6688121.jpg',
  'Novel inspiratif tentang kehidupan di pesantren dan persahabatan lima santri dari berbagai daerah di Indonesia. Mengajarkan tentang tekad, kerja keras, dan mantra Man Jadda Wajada.'
),
(
  'Cantik Itu Luka',
  'Eka Kurniawan',
  'Sastra',
  2002,
  92000,
  12,
  420,
  'https://cdn.gramedia.com/uploads/items/9786020366517_Cantik-Itu-Luka-Hard-Cover---Limited-Edition.jpg',
  'Novel yang memadukan realisme magis dengan sejarah Indonesia. Mengisahkan Dewi Ayu, perempuan cantik yang dikutuk, dan keturunannya melalui era penjajahan hingga pasca-kemerdekaan.'
),
(
  'Sapiens: Riwayat Singkat Umat Manusia',
  'Yuval Noah Harari',
  'Non-Fiksi',
  2011,
  110000,
  28,
  450,
  'https://cdn.gramedia.com/uploads/items/591701404_sapiens.jpg',
  'Edisi terjemahan Bahasa Indonesia dari buku fenomenal yang menelusuri sejarah umat manusia dari Zaman Batu hingga era Silicon. Mengubah cara kita memahami dunia dan diri sendiri.'
),
(
  'Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa',
  'James Clear',
  'Self-Help',
  2018,
  99000,
  35,
  330,
  'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg',
  'Edisi terjemahan Bahasa Indonesia. Panduan praktis untuk membangun kebiasaan baik dan menghancurkan kebiasaan buruk. Mengajarkan sistem perubahan 1% setiap hari untuk hasil transformatif.'
),
(
  'Pulang',
  'Tere Liye',
  'Novel',
  2015,
  82000,
  20,
  360,
  'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1441194791i/26211806.jpg',
  'Novel tentang Bujang, seorang pemuda dari pedalaman Sumatera yang merantau dan terlibat dalam dunia gelap keuangan internasional. Sebuah perjalanan pulang dalam arti yang sesungguhnya.'
);

-- ============================================
-- SEED STORE LOCATIONS (5 Jabodetabek)
-- ============================================
INSERT INTO store_locations (name, address, city, city_id, province, phone, latitude, longitude, operating_hours, is_active) VALUES
(
  'SiPustaka Jakarta Pusat',
  'Jl. Salemba Raya No. 25, Paseban, Senen',
  'Jakarta Pusat',
  152, -- RajaOngkir city_id for Jakarta Pusat
  'DKI Jakarta',
  '021-3456-7890',
  -6.1754,
  106.8510,
  'Sen-Sab 09:00-21:00, Min 10:00-20:00',
  true
),
(
  'SiPustaka Jakarta Selatan',
  'Jl. Fatmawati Raya No. 12, Cipete Utara, Kebayoran Baru',
  'Jakarta Selatan',
  153, -- RajaOngkir city_id for Jakarta Selatan
  'DKI Jakarta',
  '021-7654-3210',
  -6.2615,
  106.7976,
  'Sen-Sab 09:00-21:00, Min 10:00-20:00',
  true
),
(
  'SiPustaka Bekasi',
  'Jl. Ahmad Yani No. 88, Bekasi Selatan',
  'Bekasi',
  54, -- RajaOngkir city_id for Bekasi
  'Jawa Barat',
  '021-8890-1234',
  -6.2484,
  106.9926,
  'Sen-Sab 09:00-21:00, Min 10:00-20:00',
  true
),
(
  'SiPustaka Tangerang',
  'Jl. MH Thamrin No. 15, Cikokol, Tangerang',
  'Tangerang',
  455, -- RajaOngkir city_id for Tangerang
  'Banten',
  '021-5567-8901',
  -6.1781,
  106.6319,
  'Sen-Sab 09:00-21:00, Min 10:00-20:00',
  true
),
(
  'SiPustaka Depok',
  'Jl. Margonda Raya No. 200, Kemiri Muka, Beji',
  'Depok',
  115, -- RajaOngkir city_id for Depok
  'Jawa Barat',
  '021-7789-0123',
  -6.3723,
  106.8316,
  'Sen-Sab 09:00-21:00, Min 10:00-20:00',
  true
);
