-- Seeds for JBB Marketplace Local D1 Database
-- Peygo - Jual Beli Barang Bekas Terpercaya Indonesia

PRAGMA foreign_keys = OFF;

-- Clean existing data to avoid orphan references
DELETE FROM reviews;
DELETE FROM orders;
DELETE FROM offers;
DELETE FROM listing_images;
DELETE FROM wishlists;
DELETE FROM chats;
DELETE FROM listings;
DELETE FROM users;

-- 1. Categories
INSERT OR REPLACE INTO categories (id, name, slug, icon, parent_id, item_count, featured, sort_order, created_at) VALUES
('cat-gadget', 'HP & Gadget', 'hp-gadget', 'Smartphone', NULL, 420, 1, 1, '2025-01-01T00:00:00Z'),
('cat-laptop', 'Laptop & Komputer', 'laptop-komputer', 'Laptop', NULL, 310, 1, 2, '2025-01-01T00:00:00Z'),
('cat-kamera', 'Kamera & Fotografi', 'kamera-fotografi', 'Camera', NULL, 185, 1, 3, '2025-01-01T00:00:00Z'),
('cat-otomotif', 'Motor & Otomotif', 'motor-otomotif', 'Bike', NULL, 290, 1, 4, '2025-01-01T00:00:00Z'),
('cat-game', 'Console & Gaming', 'console-gaming', 'Gamepad2', NULL, 160, 1, 5, '2025-01-01T00:00:00Z'),
('cat-fashion', 'Fashion & Sepatu', 'fashion-sepatu', 'Shirt', NULL, 540, 1, 6, '2025-01-01T00:00:00Z'),
('cat-audio', 'Audio & Headphone', 'audio-headphone', 'Headphones', NULL, 125, 0, 7, '2025-01-01T00:00:00Z'),
('cat-elektronik', 'Elektronik Rumah', 'elektronik-rumah', 'Tv', NULL, 210, 0, 8, '2025-01-01T00:00:00Z');

-- 2. 10 Users
INSERT OR REPLACE INTO users (id, name, email, password_hash, phone, avatar_url, role, is_kyc_verified, is_phone_verified, trust_score, total_transactions, rating_average, rating_count, city, province, bio, created_at, updated_at) VALUES
('usr-seller-1', 'Budi Santoso', 'budi.gadget@example.com', 'argon2_or_bcrypt_mock_hash', '081288991122', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'SELLER', 1, 1, 98, 64, 4.9, 52, 'Jakarta Selatan', 'DKI Jakarta', 'Pribadi pecinta gadget Apple & Camera. Jual barang koleksi pribadi, selalu jujur kondisi apa adanya.', '2025-01-10T10:00:00Z', '2026-08-30T10:00:00Z'),
('usr-seller-2', 'Rian Pratama', 'rian.tech@example.com', 'argon2_or_bcrypt_mock_hash', '081399887766', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'SELLER', 1, 1, 95, 38, 4.85, 31, 'Bandung', 'Jawa Barat', 'Software engineer. Jual laptop & workstation equipment eks-upgrade kantor / pribadi.', '2025-03-15T12:00:00Z', '2026-08-30T12:00:00Z'),
('usr-seller-3', 'Dimas Ardiansyah', 'dimas.ardi@example.com', 'argon2_or_bcrypt_mock_hash', '082155443322', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'SELLER', 1, 1, 96, 45, 4.95, 38, 'Surabaya', 'Jawa Timur', 'Fotografer & videografer komersial. Unit kamera dan lensa selalu dirawat di dry cabinet elektrik.', '2025-05-20T08:00:00Z', '2026-08-30T08:00:00Z'),
('usr-seller-4', 'Siti Nurhaliza', 'siti.nur@example.com', 'argon2_or_bcrypt_mock_hash', '081233445566', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'SELLER', 1, 1, 94, 29, 4.9, 24, 'Yogyakarta', 'DI Yogyakarta', 'Sneaker enthusiast & vintage fashion collector. Semua item dijamin 100% original authentic.', '2025-06-12T09:00:00Z', '2026-08-30T09:00:00Z'),
('usr-seller-5', 'Ahmad Fauzi', 'ahmad.fauzi@example.com', 'argon2_or_bcrypt_mock_hash', '081977665544', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', 'SELLER', 1, 1, 93, 34, 4.88, 28, 'Tangerang Selatan', 'Banten', 'Gamer & PC hardware builder. Jual konsol game dan aksesoris eks pemakaian santai di rumah.', '2025-07-04T11:00:00Z', '2026-08-30T11:00:00Z'),
('usr-seller-6', 'Dewi Lestari', 'dewi.lestari@example.com', 'argon2_or_bcrypt_mock_hash', '081322119988', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 'SELLER', 1, 1, 97, 22, 4.92, 19, 'Semarang', 'Jawa Tengah', 'Home living & kitchen hobbyist. Jual peralatan elektronik rumah tangga mulus eks kado / jarang dipakai.', '2025-08-18T14:00:00Z', '2026-08-30T14:00:00Z'),
('usr-seller-7', 'Bayu Setiawan', 'bayu.setiawan@example.com', 'argon2_or_bcrypt_mock_hash', '085611223344', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', 'SELLER', 1, 1, 91, 18, 4.85, 15, 'Malang', 'Jawa Timur', 'Pecinta roda dua & otomotif. Jual motor dan apparel riding original simpanan pribadi.', '2025-09-02T16:00:00Z', '2026-08-30T16:00:00Z'),
('usr-seller-8', 'Reza Rahardian', 'reza.sound@example.com', 'argon2_or_bcrypt_mock_hash', '081788776655', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', 'SELLER', 1, 1, 99, 27, 5.0, 23, 'Denpasar', 'Bali', 'Music producer & audio engineer. Koleksi headphone audiophile dan perlengkapan audio pro.', '2025-10-10T13:00:00Z', '2026-08-30T13:00:00Z'),
('usr-seller-9', 'Nadia Safitri', 'nadia.safitri@example.com', 'argon2_or_bcrypt_mock_hash', '082266778899', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'SELLER', 1, 1, 92, 15, 4.8, 12, 'Medan', 'Sumatera Utara', 'UI/UX Designer. Gadget dan aksesoris kerja eks pemakaian pribadi, sangat apik dan mulus.', '2025-11-25T15:00:00Z', '2026-08-30T15:00:00Z'),
('usr-seller-10', 'Hendro Wijaya', 'hendro.wijaya@example.com', 'argon2_or_bcrypt_mock_hash', '081199882233', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 'SELLER', 1, 1, 96, 41, 4.93, 35, 'Makassar', 'Sulawesi Selatan', 'Kolektor gadget & home appliances. Barang selalu dibeli resmi dan disimpan dengan apik di ruang AC.', '2025-12-05T10:00:00Z', '2026-08-30T10:00:00Z');

-- 3. 34 Unique Listings Across All 8 Categories
INSERT OR REPLACE INTO listings (id, seller_id, category_id, title, slug, description, price, original_price, is_negotiable, min_offer_price, condition, completeness, purchase_year, warranty_until, has_original_receipt, status, view_count, offer_count, favorite_count, province, city, district, postal_code, is_cod_available, cod_meeting_point, specs, created_at, updated_at) VALUES

-- Category: HP & Gadget (5 Items)
('item-1', 'usr-seller-1', 'cat-gadget', 'iPhone 13 Pro 128GB Sierra Blue Resmi iBox Mulus 96%', 'iphone-13-pro-128gb-sierra-blue-resmi-ibox-mulus-96', 'Dijual iPhone 13 Pro 128GB warna Sierra Blue garansi resmi iBox (PA/A). Kondisi fisik mulus terawat 96%, selalu pakai case dan tempered glass sejak hari pertama. Battery Health 87% original belum pernah servis/bongkar. Face ID, True Tone, 3uTools 100% hijau semua normal. Kelengkapan fullset dus original, kabel type-c original bawaan, sticker apple.', 9850000, 18499000, 1, 9200000, 'LIKE_NEW', '["FULLSET","WITH_RECEIPT"]', 2023, NULL, 1, 'ACTIVE', 384, 8, 42, 'DKI Jakarta', 'Jakarta Selatan', 'Kebayoran Baru', '12130', 1, 'Gandaria City / Blok M Plaza', '{"storage":"128 GB","color":"Sierra Blue","batteryHealth":"87%","region":"PA/A (iBox Indonesia)","faceId":"Normal 100%","trueTone":"Active"}', '2026-08-30T14:30:00Z', '2026-08-30T14:30:00Z'),
('item-2', 'usr-seller-9', 'cat-gadget', 'iPhone 14 Pro 256GB Deep Purple Resmi iBox Baterai 91%', 'iphone-14-pro-256gb-deep-purple-resmi-ibox-baterai-91', 'Dijual iPhone 14 Pro 256GB warna Deep Purple garansi resmi Indonesia. Pemakaian pribadi perempuan, bodi no dent no baret, Dynamic Island dan kamera 48MP berfungsi sempurna. Baterai health 91% masih awet seharian. Fullset dus original.', 13900000, 21999000, 1, 13200000, 'LIKE_NEW', '["FULLSET","BOX_UNIT"]', 2023, NULL, 1, 'ACTIVE', 512, 11, 63, 'Sumatera Utara', 'Medan', 'Medan Barat', '20111', 1, 'Sun Plaza Medan / Center Point', '{"storage":"256 GB","color":"Deep Purple","batteryHealth":"91%","screen":"6.1 Super Retina XDR 120Hz"}', '2026-08-29T11:00:00Z', '2026-08-29T11:00:00Z'),
('item-3', 'usr-seller-2', 'cat-gadget', 'Samsung Galaxy S23 Ultra 5G 12GB / 512GB Phantom Black SEIN', 'samsung-galaxy-s23-ultra-5g-12gb-512gb-phantom-black-sein', 'Dijual flagship Samsung Galaxy S23 Ultra 5G RAM 12GB internal lega 512GB garansi resmi SEIN Indonesia. Kamera 200MP dan zoom 100x sangat jernih. S-Pen mulus responsif, layar Dynamic AMOLED 2X no shadow no green line. Lengkap dus dan kabel data ori.', 12800000, 21999000, 1, 12000000, 'USED_EXCELLENT', '["FULLSET","BOX_UNIT"]', 2023, NULL, 0, 'ACTIVE', 430, 6, 38, 'Jawa Barat', 'Bandung', 'Coblong', '40132', 1, 'Paris Van Java / Ciwalk', '{"ram":"12 GB","storage":"512 GB","chipset":"Snapdragon 8 Gen 2 for Galaxy","color":"Phantom Black"}', '2026-08-28T16:00:00Z', '2026-08-28T16:00:00Z'),
('item-4', 'usr-seller-10', 'cat-gadget', 'iPad Pro 11 Inch M2 128GB Wi-Fi Space Grey Mulus Like New', 'ipad-pro-11-inch-m2-128gb-wi-fi-space-grey', 'iPad Pro 11 inch chip Apple M2 (2022) 128GB Wi-Fi Space Grey. Jarang dipakai hanya untuk nonton Netflix di kamar. Layar ProMotion 120Hz mulus tanpa gores, audio 4 speaker menggelegar. Bonus magnetic smart folio case. Dus dan charger 20W original ada.', 10500000, 15999000, 1, 9900000, 'LIKE_NEW', '["FULLSET","BOX_UNIT"]', 2023, NULL, 1, 'ACTIVE', 290, 4, 31, 'Sulawesi Selatan', 'Makassar', 'Ujung Pandang', '90111', 1, 'Trans Studio Mall Makassar / Phinisi Point', '{"chipset":"Apple M2","storage":"128 GB","display":"11 Inch Liquid Retina 120Hz"}', '2026-08-27T10:00:00Z', '2026-08-27T10:00:00Z'),
('item-5', 'usr-seller-3', 'cat-gadget', 'Google Pixel 8 Pro 128GB Obsidian Black Dual SIM Mulus 98%', 'google-pixel-8-pro-128gb-obsidian-black-dual-sim', 'Dijual Google Pixel 8 Pro 128GB warna Obsidian Black. Kamera AI terbaik dengan fitur Best Take & Magic Audio Eraser. Sinyal all operator aman IMEI terdaftar resmi Bea Cukai (ada bukti bayar pajak). Fisik 98% mulus no minus. Fullset box.', 11200000, 17500000, 1, 10500000, 'USED_EXCELLENT', '["FULLSET","WITH_RECEIPT"]', 2024, NULL, 1, 'ACTIVE', 310, 5, 29, 'Jawa Timur', 'Surabaya', 'Gubeng', '60281', 1, 'Tunjungan Plaza / Grand City Mall', '{"chipset":"Google Tensor G3","storage":"128 GB","ram":"12 GB","camera":"50MP Triple Camera with AI"}', '2026-08-26T13:30:00Z', '2026-08-26T13:30:00Z'),

-- Category: Laptop & Komputer (4 Items)
('item-6', 'usr-seller-2', 'cat-laptop', 'MacBook Pro 14" M1 Pro 16GB / 512GB Space Grey Fullset Garansi Habis', 'macbook-pro-14-m1-pro-16gb-512gb-space-grey-fullset', 'MacBook Pro 14 inci M1 Pro (8-Core CPU, 14-Core GPU, 16GB Unified RAM, 512GB SSD). Pemakaian harian untuk koding. Bodi 94% mulus tidak ada dent/penyok, hanya baret halus di bawah. Layar Liquid Retina XDR mulus no dead pixel/staingate. Cycle Count 165 (Normal). Fullset dus, charger MagSafe 3 67W asli bawaan.', 18200000, 28999000, 1, 17000000, 'USED_EXCELLENT', '["FULLSET","BOX_UNIT"]', 2022, NULL, 0, 'ACTIVE', 612, 12, 78, 'Jawa Barat', 'Bandung', 'Coblong (Dago)', '40132', 1, 'Starbucks Dago / Cihampelas Walk', '{"processor":"Apple M1 Pro (8-Core)","ram":"16 GB","storage":"512 GB SSD","cycleCount":165,"screenSize":"14.2 Inch Liquid Retina XDR"}', '2026-08-29T10:00:00Z', '2026-08-30T10:00:00Z'),
('item-7', 'usr-seller-9', 'cat-laptop', 'MacBook Air 13.6" M2 8GB / 256GB Midnight Mulus 98% Baterai 96%', 'macbook-air-13-6-m2-8gb-256gb-midnight-mulus-98', 'MacBook Air M2 warna Midnight yang sangat elegan. Kondisi fisik 98% istimewa terawat pemakaian wanita untuk tugas desain grafis. Battery Health 96% cycle count baru 82. Keyboard empuk tidak ada tombol pudar. Fullset dus buku charger MagSafe bawaan.', 12500000, 18499000, 1, 11800000, 'LIKE_NEW', '["FULLSET","BOX_UNIT"]', 2023, NULL, 1, 'ACTIVE', 480, 9, 54, 'Sumatera Utara', 'Medan', 'Medan Baru', '20153', 1, 'Cambridge City Square Medan', '{"processor":"Apple M2","ram":"8 GB","storage":"256 GB SSD","batteryHealth":"96%"}', '2026-08-28T09:00:00Z', '2026-08-28T09:00:00Z'),
('item-8', 'usr-seller-1', 'cat-laptop', 'Lenovo ThinkPad X1 Carbon Gen 10 Core i7-1260P 16GB / 512GB NVMe', 'lenovo-thinkpad-x1-carbon-gen-10-core-i7-16gb-512gb', 'Laptop bisnis legendaris ThinkPad X1 Carbon Gen 10. Bobot super ringan hanya 1.12 kg bahan carbon fiber & magnesium. Intel Core i7-1260P (12 cores), RAM 16GB LPDDR5, SSD 512GB NVMe Gen 4. Keyboard ThinkPad terenak di dunia no minus. Unit + Charger Type-C 65W original.', 14500000, 27500000, 1, 13700000, 'USED_EXCELLENT', '["CHARGER_ONLY"]', 2023, NULL, 0, 'ACTIVE', 320, 4, 36, 'DKI Jakarta', 'Jakarta Selatan', 'Setiabudi', '12920', 1, 'Kota Kasablanka / Lotte Mall Kuningan', '{"processor":"Intel Core i7-1260P","ram":"16 GB LPDDR5","storage":"512 GB NVMe Gen4","weight":"1.12 Kg"}', '2026-08-27T14:20:00Z', '2026-08-27T14:20:00Z'),
('item-9', 'usr-seller-5', 'cat-laptop', 'ASUS ROG Zephyrus G14 Ryzen 9 7940HS RTX 4060 16GB / 1TB QHD 165Hz', 'asus-rog-zephyrus-g14-ryzen-9-rtx-4060-16gb-1tb', 'Laptop gaming compact bertenaga ASUS ROG Zephyrus G14 (2023) Moonlight White. AMD Ryzen 9 7940HS, NVIDIA RTX 4060 8GB TGP 125W, Layar ROG Nebula QHD+ 165Hz 100% DCI-P3. Kondisi mulus 95%, thermal paste baru diganti Honeywell PTM7950 dingin stabil.', 19800000, 29999000, 1, 18800000, 'USED_EXCELLENT', '["FULLSET","BOX_UNIT"]', 2023, NULL, 1, 'ACTIVE', 560, 14, 82, 'Banten', 'Tangerang Selatan', 'Serpong', '15322', 1, 'Summarecon Mall Serpong / Living World Alam Sutera', '{"processor":"AMD Ryzen 9 7940HS","gpu":"NVIDIA RTX 4060 8GB","ram":"16 GB DDR5","storage":"1 TB NVMe","screen":"14 Inch QHD+ 165Hz"}', '2026-08-26T15:00:00Z', '2026-08-26T15:00:00Z'),

-- Category: Kamera & Fotografi (4 Items)
('item-10', 'usr-seller-1', 'cat-kamera', 'Sony Alpha A6400 Body + Lensa Sigma 30mm F1.4 DC DN Shutter Count 4.2k', 'sony-alpha-a6400-body-lensa-sigma-30mm-f14', 'Dijual sepaket kamera mirrorless Sony A6400 + Lensa bokeh tajam Sigma 30mm f/1.4. Shutter count baru 4.200 (sangat rendah). Karet kencang, sensor bersih no jamur/debu, autofokus super cepat. Bonus filter UV Hoya, baterai cadangan Kingma 2 pcs + dual charger.', 13500000, 17800000, 1, 12700000, 'USED_EXCELLENT', '["FULLSET","BOX_UNIT"]', 2023, NULL, 1, 'ACTIVE', 420, 5, 39, 'Jawa Timur', 'Surabaya', 'Gubeng', '60281', 1, 'Tunjungan Plaza / Galaxy Mall', '{"shutterCount":4200,"sensor":"24.2 MP APS-C Exmor CMOS","lens":"Sigma 30mm f/1.4 DC DN Contemporary","autofocus":"Real-time Eye AF"}', '2026-08-28T09:15:00Z', '2026-08-28T09:15:00Z'),
('item-11', 'usr-seller-3', 'cat-kamera', 'Fujifilm X-T4 Body Silver Shutter Count 6.5k Terawat Like New', 'fujifilm-x-t4-body-silver-shutter-count-6-5k', 'Kamera mirrorless hybrid Fujifilm X-T4 warna klasik Silver. Dilengkapi fitur IBIS in-body stabilizer 6.5 stop dan film simulation legendaris (Classic Chrome, Nostalgic Negative). Bodi mulus 97%, sensor bening, tombol klik empuk. Fullset dus buku strap asli.', 16800000, 24999000, 1, 15900000, 'LIKE_NEW', '["FULLSET","BOX_UNIT"]', 2022, NULL, 0, 'ACTIVE', 390, 7, 45, 'Jawa Timur', 'Surabaya', 'Rungkut', '60293', 1, 'Galaxy Mall Surabaya / Pakuwon City', '{"shutterCount":6500,"sensor":"26.1 MP X-Trans CMOS 4","stabilization":"5-Axis In-Body IBIS 6.5 Stops","video":"4K 60fps 10-bit"}', '2026-08-27T11:00:00Z', '2026-08-27T11:00:00Z'),
('item-12', 'usr-seller-8', 'cat-kamera', 'Canon EOS R6 Mark II Body Only Garansi Datascrip Mulus 98%', 'canon-eos-r6-mark-ii-body-only-garansi-datascrip', 'Full-frame mirrorless Canon EOS R6 Mark II. Shutter count sangat minim di bawah 3.000 shot. Dual Pixel CMOS AF II super lengket mengunci subjek orang/hewan/kendaraan. Kondisi 98% seperti baru buka dus. Garansi resmi Datascrip Indonesia masih aktif.', 27500000, 39999000, 1, 26000000, 'LIKE_NEW', '["FULLSET","WITH_RECEIPT"]', 2024, '2026-12-31T00:00:00Z', 1, 'ACTIVE', 510, 8, 62, 'Bali', 'Denpasar', 'Denpasar Selatan (Sanur)', '80227', 1, 'Icon Bali Sanur / Living World Denpasar', '{"sensor":"24.2 MP Full-Frame CMOS","continuousShooting":"40 fps Electronic Shutter","video":"6K Oversampled 4K 60p"}', '2026-08-26T16:45:00Z', '2026-08-26T16:45:00Z'),
('item-13', 'usr-seller-10', 'cat-kamera', 'DJI Mini 3 Pro Fly More Combo Plus with DJI RC Screen Controller', 'dji-mini-3-pro-fly-more-combo-plus-dji-rc', 'Drone lipat compact DJI Mini 3 Pro paket terlengkap Fly More Combo Plus dengan remote DJI RC (layar cerah built-in). Dilengkapi 3 baterai intelligent flight battery plus (durasi terbang hingga 47 menit per baterai). Sensor obstacle avoidance 3 arah aktif normal. No crash no hard landing.', 11800000, 17299000, 1, 11000000, 'USED_EXCELLENT', '["FULLSET","BOX_UNIT"]', 2023, NULL, 1, 'ACTIVE', 340, 6, 40, 'Sulawesi Selatan', 'Makassar', 'Panakkukang', '90231', 1, 'Mall Panakkukang / Nipah Park', '{"sensor":"1/1.3 Inch CMOS 48MP","controller":"DJI RC with 5.5 Inch FHD Screen","video":"4K 60fps HDR & True Vertical Shooting"}', '2026-08-25T14:10:00Z', '2026-08-25T14:10:00Z'),

-- Category: Motor & Otomotif (4 Items)
('item-14', 'usr-seller-7', 'cat-otomotif', 'Vespa Sprint 150 i-Get ABS 2022 Matt Grey Km Rendah 4.800 Pajak Hidup', 'vespa-sprint-150-i-get-abs-2022-matt-grey', 'Dijual Vespa Sprint 150 i-Get ABS tahun 2022 warna favorit Grey Titanio (Matt Grey). Odometer baru 4.800 km asli bukan putaran. Servis rutin berkala di bengkel resmi Piaggio Vespa. Kunci master coklat & kunci biru lengkap. Surat-surat lengkap BPKB, STNK, Faktur. Pajak hidup panjang sampai akhir tahun.', 43500000, 54800000, 1, 41000000, 'LIKE_NEW', '["FULLSET","WITH_RECEIPT"]', 2022, NULL, 1, 'ACTIVE', 720, 15, 95, 'Jawa Timur', 'Malang', 'Klojen', '65111', 1, 'Mall Olympic Garden (MOG) Malang / Ijen Boulevard', '{"engine":"150cc i-Get 3-Valves","transmission":"CVT Otomatis","brakes":"ABS Front Disc Brake","odometer":"4.800 km"}', '2026-08-29T13:00:00Z', '2026-08-29T13:00:00Z'),
('item-15', 'usr-seller-1', 'cat-otomotif', 'Honda Vario 160 ABS 2023 Grande Matte Black Mulus Tangan Pertama', 'honda-vario-160-abs-2023-grande-matte-black', 'Honda Vario 160 tipe tertinggi ABS warna Grande Matte Black tahun 2023. Tangan pertama dari baru, pemakaian rumah ke kantor dekat. Bodi 96% mulus terawat sudah dilapisi scotlet bening sejak awal beli. Ban tebal, kampas rem tebal, mesin kering halus no rembes.', 22800000, 29800000, 1, 21500000, 'USED_EXCELLENT', '["FULLSET","WITH_RECEIPT"]', 2023, NULL, 1, 'ACTIVE', 490, 8, 48, 'DKI Jakarta', 'Jakarta Selatan', 'Cilandak', '12430', 1, 'Cilandak Town Square (CITOS) / One Belpark', '{"engine":"160cc eSP+ 4-Katup","system":"Smart Key Keyless & ABS","odometer":"8.900 km"}', '2026-08-28T10:30:00Z', '2026-08-28T10:30:00Z'),
('item-16', 'usr-seller-7', 'cat-otomotif', 'Helm Arai RX-7X Spencer 30th Anniversary Size L Original Mulus 97%', 'helm-arai-rx-7x-spencer-30th-anniversary-size-l', 'Helm premium Arai RX-7X motif legendaris Freddie Spencer 30th Anniversary size L (59-60 cm). Kondisi 97% mulus sangat terawat tidak pernah jatuh/kejedot. Busa pipi dan interior wangi kencang dicuci berkala. Kelengkapan sarung helm asli Arai, buku panduan, pelumas silikon, dan dus original.', 8700000, 12500000, 1, 8000000, 'LIKE_NEW', '["FULLSET","BOX_UNIT"]', 2023, NULL, 0, 'ACTIVE', 280, 4, 33, 'Jawa Timur', 'Malang', 'Lowokwaru', '65141', 1, 'Matos Malang / Cafe Soekarno Hatta', '{"size":"L (59-60 cm)","homologation":"Snell M2020 & JIS Certified","shellMaterial":"PB-SNC2 Structural Net Composite"}', '2026-08-27T15:00:00Z', '2026-08-27T15:00:00Z'),
('item-17', 'usr-seller-5', 'cat-otomotif', 'Knalpot Akrapovic Slip-On Original Carbon Kawasaki Ninja 250 / ZX-25R', 'knalpot-akrapovic-slip-on-carbon-ninja-250', 'Knalpot Akrapovic Slip-On Carbon 100% Original Made in Slovenia (bukan barang purbalingga/replika). Karakter suara ngebass adem padat elegan tidak cempreng. Carbon fiber gloss mulus no retak no scratch. DB Killer original disertakan.', 6500000, 10200000, 1, 5900000, 'USED_EXCELLENT', '["BOX_UNIT"]', 2023, NULL, 0, 'ACTIVE', 310, 5, 27, 'Banten', 'Tangerang Selatan', 'Pondok Aren (Bintaro)', '15224', 1, 'Bintaro Xchange Mall / Living Plaza Bintaro', '{"material":"Carbon Fiber Muffler Body with Titanium Link Pipe","authenticity":"Original Slovenia Verified"}', '2026-08-26T08:45:00Z', '2026-08-26T08:45:00Z'),

-- Category: Console & Gaming (4 Items)
('item-18', 'usr-seller-5', 'cat-game', 'PlayStation 5 (PS5) Digital Edition CFI-1200 + 2 Stik DualSense Ori', 'ps5-digital-edition-cfi-1200-2-stik-dualsense', 'Dijual PS5 Digital CFI-1200 (seri dingin & hening). Kondisi 98% like new jarang dimainkan karena sibuk kantor. Termasuk 2 Controller DualSense Original no drift sama sekali. Dus buku kabel HDMI ultra high speed lengkap.', 6400000, 8500000, 1, 6000000, 'LIKE_NEW', '["FULLSET","BOX_UNIT"]', 2023, NULL, 0, 'ACTIVE', 530, 9, 56, 'Banten', 'Tangerang Selatan', 'Serpong (BSD)', '15310', 1, 'The Breeze BSD / AEON Mall', '{"model":"CFI-1200B Digital","storage":"825 GB Custom SSD","controller":"2x DualSense Wireless"}', '2026-08-27T16:00:00Z', '2026-08-27T16:00:00Z'),
('item-19', 'usr-seller-2', 'cat-game', 'Nintendo Switch OLED White Edition Fullset + Game Zelda TOTK Mulus', 'nintendo-switch-oled-white-edition-fullset-zelda', 'Nintendo Switch OLED Model White Edition. Layar OLED 7 inci warna sangat kontras dan hidup. Joycon aman lancar jaya no drifting. Bonus cartridge game The Legend of Zelda: Tears of the Kingdom + tempered glass terpasang + pouch bag Spigen.', 3750000, 5200000, 1, 3500000, 'LIKE_NEW', '["FULLSET","BOX_UNIT"]', 2023, NULL, 1, 'ACTIVE', 450, 8, 49, 'Jawa Barat', 'Bandung', 'Sumur Bandung', '40111', 1, 'Bandung Indah Plaza (BIP) / Braga City Walk', '{"screen":"7.0 Inch OLED 720p","storage":"64 GB Internal","batteryLife":"4.5 - 9 Hours"}', '2026-08-26T12:00:00Z', '2026-08-26T12:00:00Z'),
('item-20', 'usr-seller-5', 'cat-game', 'Steam Deck OLED 512GB Anti-Glare Screen Fullset Mulus 99% Terawat', 'steam-deck-oled-512gb-anti-glare-screen-fullset', 'Handheld PC gaming Valve Steam Deck OLED 512GB. Layar 90Hz HDR OLED sangat memanjakan mata, baterai lebih awet dibanding versi LCD. Fisik 99% mulus pemakaian indoor ber-AC. Carrying case original, charger Type-C 45W bawaan, dus lengkap.', 8900000, 12500000, 1, 8400000, 'LIKE_NEW', '["FULLSET","BOX_UNIT"]', 2024, NULL, 0, 'ACTIVE', 380, 7, 41, 'Banten', 'Tangerang Selatan', 'Ciputat Timur', '15419', 1, 'Bintaro Plaza / Pondok Indah Mall', '{"processor":"AMD APU 6nm Zen 2 + RDNA 2","display":"7.4 Inch OLED 90Hz HDR","storage":"512 GB NVMe SSD"}', '2026-08-25T17:30:00Z', '2026-08-25T17:30:00Z'),
('item-21', 'usr-seller-10', 'cat-game', 'Xbox Series X 1TB Console 4K 120fps + Controller Robot White', 'xbox-series-x-1tb-console-4k-120fps', 'Konsol terkuat Xbox Series X kapasitas 1TB SSD. Performa gaming 4K 60-120fps super smooth dengan Quick Resume instan. Kondisi fisik 95% mulus no minus. Bonus kabel HDMI 2.1 Ultra High Speed bawaan dan akun Game Pass sisa 2 bulan.', 6800000, 9500000, 1, 6300000, 'USED_EXCELLENT', '["FULLSET","BOX_UNIT"]', 2023, NULL, 0, 'ACTIVE', 290, 4, 28, 'Sulawesi Selatan', 'Makassar', 'Mariso', '90122', 1, 'Phinisi Point Makassar / Pantai Losari', '{"performance":"12 Teraflops GPU RDNA 2","storage":"1 TB Custom NVMe SSD","resolution":"True 4K Gaming up to 120 FPS"}', '2026-08-24T10:00:00Z', '2026-08-24T10:00:00Z'),

-- Category: Fashion & Sepatu (5 Items)
('item-22', 'usr-seller-4', 'cat-fashion', 'Nike Dunk Low Retro White Black "Panda" Size 42.5 / US 9 Original', 'nike-dunk-low-retro-panda-size-42-5-original', 'Sepatu Nike Dunk Low Panda original beli di Hoops Point. Kondisi 88% pemakaian terawat, outsole bintang masih tebal, insole logo Nike masih utuh, toebox minim crease karena pakai crease protector. Replace box Nike original.', 1150000, 1899000, 1, 1000000, 'USED_GOOD', '["UNIT_ONLY"]', 2023, NULL, 1, 'ACTIVE', 290, 4, 27, 'DI Yogyakarta', 'Yogyakarta', 'Depok Sleman', '55281', 1, 'Pakuwon Mall Jogja / Cafe Kaliurang', '{"size":"42.5 EUR / US 9","colorway":"White / Black","authenticity":"100% Original Verified"}', '2026-08-26T11:20:00Z', '2026-08-26T11:20:00Z'),
('item-23', 'usr-seller-4', 'cat-fashion', 'New Balance 990v5 Grey Made in USA Size 43 / US 9.5 D Mulus 94%', 'new-balance-990v5-grey-made-in-usa-size-43', 'Sneakers paling nyaman di dunia New Balance 990v5 Grey original Made in USA. Kulit suede premium halus bersih terawat dengan pembersih Jason Markk. Midsole ENCAP empuk dan stabil. Dus box asli New Balance Made in USA lengkap.', 2450000, 4199000, 1, 2200000, 'USED_EXCELLENT', '["FULLSET","BOX_UNIT"]', 2023, NULL, 1, 'ACTIVE', 410, 6, 44, 'DI Yogyakarta', 'Yogyakarta', 'Gondokusuman', '55223', 1, 'Plaza Ambarrukmo / Galeria Mall Jogja', '{"size":"43 EUR / US 9.5 D","origin":"Made in USA","colorway":"Castlerock Grey with Silver Accents"}', '2026-08-25T13:00:00Z', '2026-08-25T13:00:00Z'),
('item-24', 'usr-seller-4', 'cat-fashion', 'Air Jordan 1 Retro High OG "Lost and Found" Chicago 2022 Size 42.5', 'air-jordan-1-high-og-lost-and-found-chicago-size-42-5', 'Holy grail sneakers Air Jordan 1 High OG Lost & Found (Chicago 2022). Cracked leather vintage style dengan box kwitansi retro era 80an. Baru dipakai 2 kali untuk event indoor, bintang sol masih utuh 99%. Lengkap dus, invoice resmi Nike, dan extra tali putih.', 4800000, 7500000, 1, 4500000, 'LIKE_NEW', '["FULLSET","WITH_RECEIPT"]', 2023, NULL, 1, 'ACTIVE', 680, 13, 89, 'DI Yogyakarta', 'Yogyakarta', 'Kotagede', '55172', 1, 'Jogja City Mall / Malioboro Mall', '{"size":"42.5 EUR / US 9","colorway":"Varsity Red / Black / Sail / Muslin","releaseYear":2022}', '2026-08-24T16:00:00Z', '2026-08-24T16:00:00Z'),
('item-25', 'usr-seller-3', 'cat-fashion', 'Jaket Barbour Beaufort Waxed Cotton Olive Size 38 UK Original Mulus', 'jaket-barbour-beaufort-waxed-cotton-olive-size-38', 'Jaket outdoor heritage legendaris Inggris Barbour Classic Beaufort Waxed Cotton Jacket warna Olive. Ukuran 38 (fit size M ke L lokal). Lapisan wax masih pekat tahan angin dan hujan gerimis. Ritsleting kuningan YKK Barbour lancar jaya.', 3200000, 6800000, 1, 2900000, 'USED_EXCELLENT', '["UNIT_ONLY"]', 2023, NULL, 0, 'ACTIVE', 270, 3, 31, 'Jawa Timur', 'Surabaya', 'Tegalsari', '60262', 1, 'Ciputra World Surabaya / Grand City', '{"size":"38 UK (Chest 97cm / Fit M-L)","material":"100% Mediumweight Thornproof Waxed Cotton","color":"Olive Green"}', '2026-08-23T11:40:00Z', '2026-08-23T11:40:00Z'),
('item-26', 'usr-seller-9', 'cat-fashion', 'Tas Ransel Tumi Alpha Bravo Search Backpack Ballistic Nylon Black', 'tas-ransel-tumi-alpha-bravo-search-backpack-black', 'Tas backpack eksekutif Tumi Alpha Bravo Search warna Hitam. Material FXT Ballistic Nylon anti sobek dan awet seumur hidup. Kompartemen laptop 15 inci empuk, saku botol waterproof, saku RFID aman. Kondisi 95% mulus pemakaian kantor.', 4600000, 8900000, 1, 4200000, 'USED_EXCELLENT', '["UNIT_ONLY"]', 2023, NULL, 1, 'ACTIVE', 350, 5, 38, 'Sumatera Utara', 'Medan', 'Medan Petisah', '20112', 1, 'Podomoro City Deli Park Medan', '{"material":"FXT Ballistic Nylon with Leather Accents","dimensions":"43 x 35.5 x 21 cm","laptopPocket":"Fits up to 15 Inch Laptop"}', '2026-08-22T09:15:00Z', '2026-08-22T09:15:00Z'),

-- Category: Audio & Headphone (4 Items)
('item-27', 'usr-seller-8', 'cat-audio', 'Sony WH-1000XM5 Wireless Noise Cancelling Silver Mulus Garansi Sony', 'sony-wh-1000xm5-wireless-noise-cancelling-silver', 'Headphone flagship peredam bising terbaik Sony WH-1000XM5 warna Silver Platinum. Suara vokal jernih bass bulat empuk, active noise cancelling nomor 1 di dunia. Bantal telinga kulit sintesis sangat lembut no sobek no kelupas. Fullset hardcase magnetik, kabel aux, kabel charger.', 3850000, 5999000, 1, 3500000, 'LIKE_NEW', '["FULLSET","BOX_UNIT"]', 2023, NULL, 1, 'ACTIVE', 520, 10, 67, 'Bali', 'Denpasar', 'Denpasar Barat', '80119', 1, 'Level 21 Mall Denpasar / Mall Bali Galeria', '{"batteryLife":"30 Hours with ANC On","driver":"30mm Carbon Fiber Composite","codec":"LDAC, AAC, SBC with Hi-Res Audio Wireless"}', '2026-08-28T14:00:00Z', '2026-08-28T14:00:00Z'),
('item-28', 'usr-seller-1', 'cat-audio', 'Apple AirPods Pro Gen 2 USB-C MagSafe Case Garansi Resmi iBox', 'apple-airpods-pro-gen-2-usb-c-magsafe-case', 'AirPods Pro Generasi ke-2 versi terbaru dengan port USB-C dan chip H2. Fitur Adaptive Audio dan Transparency Mode terbaik. Suara spasial dinamis dengan head tracking. Bodi case mulus no dent, ear tips cadangan ukuran XS, S, L masih segel belum terpakai. Dus buku lengkap.', 2750000, 3999000, 1, 2500000, 'LIKE_NEW', '["FULLSET","WITH_RECEIPT"]', 2024, NULL, 1, 'ACTIVE', 490, 8, 58, 'DKI Jakarta', 'Jakarta Selatan', 'Tebet', '12810', 1, 'Kota Kasablanka / Mall Ambassador', '{"port":"USB-C MagSafe Charging Case with Speaker","chip":"Apple H2 Headphone Chip","noiseCancellation":"2x More Active Noise Cancellation"}', '2026-08-27T17:00:00Z', '2026-08-27T17:00:00Z'),
('item-29', 'usr-seller-8', 'cat-audio', 'Sennheiser HD 660S2 Open-Back Dynamic Audiophile Headphones Mulus', 'sennheiser-hd-660s2-open-back-audiophile-headphones', 'Headphone audiophile open-back Sennheiser HD 660S2 Made in Ireland (versi upgrade dari HD660S & HD650 legendaris). Bass lebih dalam dan soundstage megah berlapis. Selalu didrive dengan DAC/Amp berkualitas di ruangan ber-AC. Fullset dus dan 2 kabel asli (6.35mm & 4.4mm balanced).', 5900000, 9499000, 1, 5400000, 'LIKE_NEW', '["FULLSET","BOX_UNIT"]', 2023, NULL, 0, 'ACTIVE', 260, 4, 35, 'Bali', 'Denpasar', 'Denpasar Timur', '80237', 1, 'Living World Denpasar / Sanur Beach Cafe', '{"impedance":"300 Ohms","frequencyResponse":"8 - 41,500 Hz","acousticDesign":"Open-Back Dynamic Transducer"}', '2026-08-25T10:20:00Z', '2026-08-25T10:20:00Z'),
('item-30', 'usr-seller-6', 'cat-audio', 'Marshall Stanmore II Bluetooth Speaker Black Original Garansi Tam Mulus', 'marshall-stanmore-ii-bluetooth-speaker-black-original', 'Speaker bluetooth ikonik Marshall Stanmore II warna Black dengan aksen kuningan gold klasik. Suara bertenaga 80W RMS sanggup mengisi ruangan besar dengan bass menggelegar dan treble renyah khas Marshall. Fisik 97% mulus, tombol analog bekerja normal. Dus box original lengkap.', 3600000, 5699000, 1, 3300000, 'USED_EXCELLENT', '["FULLSET","BOX_UNIT"]', 2023, NULL, 1, 'ACTIVE', 380, 6, 46, 'Jawa Tengah', 'Semarang', 'Semarang Barat', '50144', 1, 'The Park Mall Semarang / DP Mall', '{"powerOutput":"80 Watts Class D Amplifier","connectivity":"Bluetooth 5.0 aptX, 3.5mm AUX, RCA","dimensions":"350 x 195 x 185 mm"}', '2026-08-24T14:40:00Z', '2026-08-24T14:40:00Z'),

-- Category: Elektronik Rumah (4 Items)
('item-31', 'usr-seller-6', 'cat-elektronik', 'Dyson V12 Detect Slim Total Clean Cordless Vacuum Cleaner Laser Fluffy', 'dyson-v12-detect-slim-total-clean-laser-fluffy', 'Vacuum cleaner nirkabel premium Dyson V12 Detect Slim Total Clean. Dilengkapi laser optic hijau yang menerangi debu kasat mata di lantai dan sensor piezo pengukur partikel debu. Bobot ringan 2.2 kg, baterai tahan 60 menit. Semua 5 kepala nozzle lengkap dalam kondisi mulus.', 7900000, 12999000, 1, 7400000, 'LIKE_NEW', '["FULLSET","BOX_UNIT"]', 2023, NULL, 1, 'ACTIVE', 430, 7, 52, 'Jawa Tengah', 'Semarang', 'Semarang Tengah', '50132', 1, 'Mall Ciputra Semarang / Simpang Lima', '{"suctionPower":"150 Air Watts","filtration":"Whole-Machine HEPA Filtration 99.99%","weight":"2.2 Kg"}', '2026-08-28T15:30:00Z', '2026-08-28T15:30:00Z'),
('item-32', 'usr-seller-6', 'cat-elektronik', 'DeLonghi Dedica EC685 Espresso Coffee Machine Red Metalic Mulus', 'delonghi-dedica-ec685-espresso-coffee-machine-red', 'Mesin kopi espresso manual rumahan DeLonghi Dedica EC685 warna Metallic Red. Bodi slim hanya 15 cm lebar tidak memakan tempat meja dapur. Tekanan pompa 15 bar stabil dengan milk frother uap untuk membuat cappuccino & cafe latte. Bonus tamper stainless & milk jug stainless.', 2100000, 3999000, 1, 1900000, 'USED_EXCELLENT', '["FULLSET","BOX_UNIT"]', 2023, NULL, 0, 'ACTIVE', 310, 5, 34, 'Jawa Tengah', 'Semarang', 'Banyumanik', '50269', 1, 'Transmart Setiabudi Semarang / Java Mall', '{"pressure":"15 Bar Professional Pump","thermoblock":"Fast Heating System in 40 Seconds","body":"Full Metal Stainless Steel"}', '2026-08-27T08:15:00Z', '2026-08-27T08:15:00Z'),
('item-33', 'usr-seller-10', 'cat-elektronik', 'LG OLED TV 55 Inch 4K Smart Cinema HDR Dolby Vision OLED55C2 Mulus', 'lg-oled-tv-55-inch-4k-smart-cinema-oled55c2', 'Smart TV LG OLED 55 Inch Seri C2 (OLED55C2PSA). Panel OLED evo dengan pixel self-lit menghadirkan warna hitam pekat sempurna (infinite contrast). 4 port HDMI 2.1 support 4K 120Hz G-Sync / FreeSync untuk PS5 & PC Gaming. Layar no burn-in no dead pixel. Remote Magic Remote & stand original.', 12500000, 22999000, 1, 11500000, 'USED_EXCELLENT', '["FULLSET","BOX_UNIT"]', 2023, NULL, 1, 'ACTIVE', 640, 11, 79, 'Sulawesi Selatan', 'Makassar', 'Rappocini', '90222', 1, 'Phinisi Point Mall / Karebosi Link', '{"display":"55 Inch 4K OLED evo Panel 120Hz","processor":"Alpha 9 Gen 5 AI Processor 4K","hdr":"Dolby Vision IQ, HDR10 Pro, Dolby Atmos Audio"}', '2026-08-26T14:00:00Z', '2026-08-26T14:00:00Z'),
('item-34', 'usr-seller-6', 'cat-elektronik', 'Philips Air Fryer XXL Digital 7.2L HD9280 Connected Wi-Fi Mulus', 'philips-air-fryer-xxl-digital-7-2l-hd9280-connected', 'Philips 5000 Series Airfryer XXL kapasitas super besar 7.2 Liter (muat 1 ekor ayam utuh 1.4 kg). Teknologi Rapid Air menggoreng garing renyah dengan lemak hingga 90% lebih sedikit. Fitur smart connected via Wi-Fi aplikasi NutriU. Keranjang anti lengket sangat bersih terawat.', 1650000, 2899000, 1, 1450000, 'LIKE_NEW', '["FULLSET","BOX_UNIT"]', 2023, NULL, 1, 'ACTIVE', 280, 4, 30, 'Jawa Tengah', 'Semarang', 'Candisari', '50257', 1, 'The Park Mall Semarang / Paragon Mall', '{"capacity":"7.2 Liters / 1.4 Kg Basket","power":"2000 Watts Rapid Air Technology","connectivity":"Wi-Fi Smart App Connected"}', '2026-08-25T11:10:00Z', '2026-08-25T11:10:00Z');

-- 4. 85+ Real Listing Images (2-4 images per product)
INSERT OR REPLACE INTO listing_images (id, listing_id, url, is_primary, sort_order, created_at) VALUES
-- Item 1 (iPhone 13 Pro)
('img-1-1', 'item-1', 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-30T14:30:00Z'),
('img-1-2', 'item-1', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-30T14:30:00Z'),
('img-1-3', 'item-1', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80', 0, 3, '2026-08-30T14:30:00Z'),

-- Item 2 (iPhone 14 Pro Deep Purple)
('img-2-1', 'item-2', 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-29T11:00:00Z'),
('img-2-2', 'item-2', 'https://images.unsplash.com/photo-1663499482512-c5101031d277?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-29T11:00:00Z'),
('img-2-3', 'item-2', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80', 0, 3, '2026-08-29T11:00:00Z'),

-- Item 3 (Samsung Galaxy S23 Ultra)
('img-3-1', 'item-3', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-28T16:00:00Z'),
('img-3-2', 'item-3', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-28T16:00:00Z'),
('img-3-3', 'item-3', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80', 0, 3, '2026-08-28T16:00:00Z'),

-- Item 4 (iPad Pro M2 11")
('img-4-1', 'item-4', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-27T10:00:00Z'),
('img-4-2', 'item-4', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-27T10:00:00Z'),

-- Item 5 (Google Pixel 8 Pro)
('img-5-1', 'item-5', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-26T13:30:00Z'),
('img-5-2', 'item-5', 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-26T13:30:00Z'),

-- Item 6 (MacBook Pro 14" M1 Pro)
('img-6-1', 'item-6', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-29T10:00:00Z'),
('img-6-2', 'item-6', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-29T10:00:00Z'),
('img-6-3', 'item-6', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80', 0, 3, '2026-08-29T10:00:00Z'),

-- Item 7 (MacBook Air M2 Midnight)
('img-7-1', 'item-7', 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-28T09:00:00Z'),
('img-7-2', 'item-7', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-28T09:00:00Z'),

-- Item 8 (ThinkPad X1 Carbon Gen 10)
('img-8-1', 'item-8', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-27T14:20:00Z'),
('img-8-2', 'item-8', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-27T14:20:00Z'),

-- Item 9 (ASUS ROG Zephyrus G14)
('img-9-1', 'item-9', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-26T15:00:00Z'),
('img-9-2', 'item-9', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-26T15:00:00Z'),

-- Item 10 (Sony A6400 + Sigma 30mm)
('img-10-1', 'item-10', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-28T09:15:00Z'),
('img-10-2', 'item-10', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-28T09:15:00Z'),

-- Item 11 (Fujifilm X-T4 Silver)
('img-11-1', 'item-11', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-27T11:00:00Z'),
('img-11-2', 'item-11', 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-27T11:00:00Z'),

-- Item 12 (Canon EOS R6 Mark II)
('img-12-1', 'item-12', 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-26T16:45:00Z'),
('img-12-2', 'item-12', 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-26T16:45:00Z'),

-- Item 13 (DJI Mini 3 Pro)
('img-13-1', 'item-13', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-25T14:10:00Z'),
('img-13-2', 'item-13', 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-25T14:10:00Z'),

-- Item 14 (Vespa Sprint 150)
('img-14-1', 'item-14', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-29T13:00:00Z'),
('img-14-2', 'item-14', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-29T13:00:00Z'),

-- Item 15 (Honda Vario 160)
('img-15-1', 'item-15', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-28T10:30:00Z'),
('img-15-2', 'item-15', 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-28T10:30:00Z'),

-- Item 16 (Helm Arai RX-7X)
('img-16-1', 'item-16', 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-27T15:00:00Z'),
('img-16-2', 'item-16', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-27T15:00:00Z'),

-- Item 17 (Knalpot Akrapovic)
('img-17-1', 'item-17', 'https://images.unsplash.com/photo-1589718539308-16936fa5985f?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-26T08:45:00Z'),
('img-17-2', 'item-17', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-26T08:45:00Z'),

-- Item 18 (PS5 Digital)
('img-18-1', 'item-18', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-27T16:00:00Z'),
('img-18-2', 'item-18', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-27T16:00:00Z'),

-- Item 19 (Nintendo Switch OLED)
('img-19-1', 'item-19', 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-26T12:00:00Z'),
('img-19-2', 'item-19', 'https://images.unsplash.com/photo-1612287233207-640a2a4bdf45?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-26T12:00:00Z'),

-- Item 20 (Steam Deck OLED)
('img-20-1', 'item-20', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-25T17:30:00Z'),
('img-20-2', 'item-20', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-25T17:30:00Z'),

-- Item 21 (Xbox Series X)
('img-21-1', 'item-21', 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-24T10:00:00Z'),
('img-21-2', 'item-21', 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-24T10:00:00Z'),

-- Item 22 (Nike Dunk Panda)
('img-22-1', 'item-22', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-26T11:20:00Z'),
('img-22-2', 'item-22', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-26T11:20:00Z'),

-- Item 23 (New Balance 990v5)
('img-23-1', 'item-23', 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-25T13:00:00Z'),
('img-23-2', 'item-23', 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-25T13:00:00Z'),

-- Item 24 (Air Jordan 1 Chicago)
('img-24-1', 'item-24', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-24T16:00:00Z'),
('img-24-2', 'item-24', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-24T16:00:00Z'),

-- Item 25 (Jaket Barbour Beaufort)
('img-25-1', 'item-25', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-23T11:40:00Z'),
('img-25-2', 'item-25', 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-23T11:40:00Z'),

-- Item 26 (Tumi Backpack)
('img-26-1', 'item-26', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-22T09:15:00Z'),
('img-26-2', 'item-26', 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-22T09:15:00Z'),

-- Item 27 (Sony WH-1000XM5)
('img-27-1', 'item-27', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-28T14:00:00Z'),
('img-27-2', 'item-27', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-28T14:00:00Z'),

-- Item 28 (AirPods Pro 2)
('img-28-1', 'item-28', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-27T17:00:00Z'),
('img-28-2', 'item-28', 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-27T17:00:00Z'),

-- Item 29 (Sennheiser HD 660S2)
('img-29-1', 'item-29', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-25T10:20:00Z'),
('img-29-2', 'item-29', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-25T10:20:00Z'),

-- Item 30 (Marshall Stanmore II)
('img-30-1', 'item-30', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-24T14:40:00Z'),
('img-30-2', 'item-30', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-24T14:40:00Z'),

-- Item 31 (Dyson V12 Detect Slim)
('img-31-1', 'item-31', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-28T15:30:00Z'),
('img-31-2', 'item-31', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-28T15:30:00Z'),

-- Item 32 (DeLonghi Dedica EC685)
('img-32-1', 'item-32', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-27T08:15:00Z'),
('img-32-2', 'item-32', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-27T08:15:00Z'),

-- Item 33 (LG OLED TV 55")
('img-33-1', 'item-33', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-26T14:00:00Z'),
('img-33-2', 'item-33', 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-26T14:00:00Z'),

-- Item 34 (Philips Air Fryer XXL)
('img-34-1', 'item-34', 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80', 1, 1, '2026-08-25T11:10:00Z'),
('img-34-2', 'item-34', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80', 0, 2, '2026-08-25T11:10:00Z');

-- 5. Offers
INSERT OR REPLACE INTO offers (id, listing_id, buyer_id, seller_id, offered_price, message, status, counter_price, counter_message, expires_at, created_at, updated_at) VALUES
('offer-1', 'item-1', 'usr-seller-3', 'usr-seller-1', 9400000, 'Bisa 9.4 jt gan? Langsung COD Gandaria City besok siang.', 'PENDING', NULL, NULL, '2026-09-05T15:00:00Z', '2026-08-30T15:00:00Z', '2026-08-30T15:00:00Z'),
('offer-2', 'item-6', 'usr-seller-3', 'usr-seller-2', 17500000, 'Nego 17.5 jt siap rekber kurir instant gan.', 'ACCEPTED', NULL, NULL, '2026-09-05T11:00:00Z', '2026-08-30T11:00:00Z', '2026-08-30T11:30:00Z'),
('offer-3', 'item-18', 'usr-seller-1', 'usr-seller-5', 6100000, 'Bisa 6.1 jt langsung bungkus bang?', 'ACCEPTED', NULL, NULL, '2026-09-05T10:00:00Z', '2026-08-29T14:00:00Z', '2026-08-29T14:30:00Z'),
('offer-4', 'item-27', 'usr-seller-4', 'usr-seller-8', 3600000, 'Tawar 3.6 jt rekber kirim ke Jogja ya kak.', 'PENDING', NULL, NULL, '2026-09-05T18:00:00Z', '2026-08-29T18:00:00Z', '2026-08-29T18:00:00Z');

-- 6. Orders
INSERT OR REPLACE INTO orders (id, order_number, listing_id, buyer_id, seller_id, offer_id, amount, shipping_fee, service_fee, total_amount, delivery_method, escrow_status, recipient_name, recipient_phone, shipping_address, courier_name, tracking_number, created_at, updated_at) VALUES
('ord-1001', 'PEYGO-20260830-1001', 'item-6', 'usr-seller-3', 'usr-seller-2', 'offer-2', 17500000, 35000, 15000, 17550000, 'KURIR_REGULER', 'DELIVERED_INSPECTION', 'Dimas Ardiansyah', '082155443322', 'Jl. Raya Darmo Permai III No. 45, Gubeng, Surabaya, Jawa Timur 60281', 'JNE YES', 'JNE8829103921', '2026-08-30T12:00:00Z', '2026-08-30T14:30:00Z'),
('ord-1002', 'PEYGO-20260829-1002', 'item-18', 'usr-seller-1', 'usr-seller-5', 'offer-3', 6100000, 0, 10000, 6110000, 'COD_KETEMUAN', 'COMPLETED', 'Budi Santoso', '081288991122', 'The Breeze BSD / AEON Mall Serpong', 'COD', NULL, '2026-08-29T15:00:00Z', '2026-08-29T17:00:00Z'),
('ord-1003', 'PEYGO-20260828-1003', 'item-22', 'usr-seller-3', 'usr-seller-4', NULL, 1150000, 22000, 5000, 1177000, 'KURIR_REGULER', 'COMPLETED', 'Dimas Ardiansyah', '082155443322', 'Jl. Raya Darmo Permai III No. 45, Gubeng, Surabaya, Jawa Timur 60281', 'SiCepat BEST', '002938491028', '2026-08-28T10:00:00Z', '2026-08-28T16:00:00Z');

-- 7. Reviews
INSERT OR REPLACE INTO reviews (id, order_id, listing_id, reviewer_id, seller_id, rating, comment, item_condition_match, fast_response, created_at) VALUES
('rev-1', 'ord-1002', 'item-18', 'usr-seller-1', 'usr-seller-5', 5, 'Mantap bang PS5 mulus banget sesuai deskripsi! Respon cepat dan ramah banget saat COD.', 1, 1, '2026-08-29T18:00:00Z'),
('rev-2', 'ord-1003', 'item-22', 'usr-seller-3', 'usr-seller-4', 5, 'Sepatu Nike Dunk Panda 100% original, packing bubble wrap tebal dan sampai tepat waktu.', 1, 1, '2026-08-28T17:00:00Z');
