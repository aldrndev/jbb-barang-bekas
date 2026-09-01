import type { Completeness, ItemCondition } from '@jbb/types';

export interface CategoryCompletenessOption {
  id: Completeness;
  label: string;
  sublabel?: string;
}

export interface CategoryConditionOption {
  id: ItemCondition;
  label: string;
  description: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  defaultTitlePlaceholder: string;
  defaultDescriptionPlaceholder: string;
  completenessOptions: CategoryCompletenessOption[];
  conditionOptions: CategoryConditionOption[];
  historySectionTitle: string;
  showReceiptToggle: boolean;
  receiptLabel: string;
  receiptSublabel: string;
  showWarrantyField: boolean;
  warrantyLabel: string;
  warrantyPlaceholder: string;
  yearLabel: string;
  suggestedSpecs: string[];
}

export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  'cat-gadget': {
    id: 'cat-gadget',
    name: 'HP & Gadget',
    slug: 'hp-gadget',
    iconName: 'Smartphone',
    defaultTitlePlaceholder: 'Contoh: iPhone 13 Pro 128GB Sierra Blue iBox Fullset Mulus',
    defaultDescriptionPlaceholder:
      'Jelaskan kondisi fisik, battery health, IMEI terdaftar Kemenperin, fungsi Face ID/TrueTone, riwayat servis bila ada...',
    completenessOptions: [
      { id: 'FULLSET', label: 'Fullset Dus & Box', sublabel: 'Dus + kabel original' },
      { id: 'UNIT_ONLY', label: 'Batangan (Unit Saja)', sublabel: 'Tanpa box/charger' },
      { id: 'BOX_UNIT', label: 'Unit + Dus Saja', sublabel: 'Tanpa charger/headset' },
      { id: 'WITH_RECEIPT', label: 'Ada Nota Toko Asli', sublabel: 'Faktur resmi iBox/Digimap' },
      { id: 'ACTIVE_WARRANTY', label: 'Garansi Resmi Aktif', sublabel: 'AppleCare / SEIN' }
    ],
    conditionOptions: [
      {
        id: 'NEW',
        label: 'Baru Segel / BNOB (100%)',
        description: 'Belum pernah diaktivasi, segel utuh'
      },
      {
        id: 'LIKE_NEW',
        label: 'Like New (96% - 99% Mulus)',
        description: 'Mulus tanpa baret, BH 90%+'
      },
      {
        id: 'USED_EXCELLENT',
        label: 'Sangat Mulus (90% - 95%)',
        description: 'Baret halus pemakaian wajar, semua normal'
      },
      {
        id: 'USED_GOOD',
        label: 'Mulus Terawat (80% - 89%)',
        description: 'Ada tanda pemakaian harian, fungsi 100% lancar'
      },
      {
        id: 'USED_FAIR',
        label: 'Ada Minus Fisik / Jamur (65% - 79%)',
        description: 'Lecet sudut atau BH di bawah 75%'
      },
      {
        id: 'PARTS_ONLY',
        label: 'Kondisi Minus / Kanibalan',
        description: 'LCD garis, bypass, atau mati total'
      }
    ],
    historySectionTitle: 'Riwayat Pembelian & Keaslian Unit',
    showReceiptToggle: true,
    receiptLabel: 'Menyertakan Nota / Struk Pembelian Asli',
    receiptSublabel: 'Struk toko fisik resmi (iBox/Erafone) atau invoice e-commerce',
    showWarrantyField: true,
    warrantyLabel: 'Masa Garansi Resmi (Opsional):',
    warrantyPlaceholder: 'Contoh: Aktif s/d November 2026 (iBox)',
    yearLabel: 'Tahun Pembelian / Aktivasi:',
    suggestedSpecs: [
      'RAM',
      'Penyimpanan (Storage)',
      'Battery Health',
      'Warna',
      'Status IMEI',
      'Kapasitas Baterai'
    ]
  },

  'cat-laptop': {
    id: 'cat-laptop',
    name: 'Laptop & Komputer',
    slug: 'laptop-komputer',
    iconName: 'Laptop',
    defaultTitlePlaceholder: 'Contoh: MacBook Pro 14 M1 Pro 16/512GB Space Grey Fullset',
    defaultDescriptionPlaceholder:
      'Jelaskan kondisi bodi, cycle count baterai, fungsi keyboard & trackpad, port USB/Thunderbolt, layar anti-glare/staingate...',
    completenessOptions: [
      { id: 'FULLSET', label: 'Fullset Dus & Charger Asli', sublabel: 'Dus + Magsafe original' },
      { id: 'UNIT_ONLY', label: 'Unit + Charger (No Box)', sublabel: 'Tanpa kotak bawaan' },
      { id: 'BOX_UNIT', label: 'Unit Saja (Batangan)', sublabel: 'Hanya unit laptop' },
      { id: 'WITH_RECEIPT', label: 'Ada Nota Pembelian Asli', sublabel: 'Struk toko resmi' },
      {
        id: 'ACTIVE_WARRANTY',
        label: 'Garansi Resmi / Toko',
        sublabel: 'Garansi distributor aktif'
      }
    ],
    conditionOptions: [
      { id: 'NEW', label: 'Baru Segel Box (100%)', description: 'Brand new, belum pernah dibuka' },
      {
        id: 'LIKE_NEW',
        label: 'Like New (96% - 99% Mulus)',
        description: 'CC baterai rendah, bodi mulus tanpa dent'
      },
      {
        id: 'USED_EXCELLENT',
        label: 'Sangat Mulus (90% - 95%)',
        description: 'Baret halus pemakaian wajar kantor/kuliah'
      },
      {
        id: 'USED_GOOD',
        label: 'Mulus Terawat (80% - 89%)',
        description: 'Ada lecet sudut ringan, mesin dingin & normal'
      },
      {
        id: 'USED_FAIR',
        label: 'Pemakaian Aktif / Minus Ringan',
        description: 'Baterai service, baret wajar'
      },
      {
        id: 'PARTS_ONLY',
        label: 'Rusak / Bahan Kanibalan',
        description: 'Mati total atau layar pecah'
      }
    ],
    historySectionTitle: 'Riwayat Laptop & Garansi Resmi',
    showReceiptToggle: true,
    receiptLabel: 'Menyertakan Faktur / Nota Toko Asli',
    receiptSublabel: 'Faktur pembelian untuk klaim garansi distributor',
    showWarrantyField: true,
    warrantyLabel: 'Garansi Distributor / Resmi:',
    warrantyPlaceholder: 'Contoh: Garansi Resmi Asus s/d Jan 2026',
    yearLabel: 'Tahun Pembelian / Perakitan:',
    suggestedSpecs: [
      'Processor (CPU)',
      'RAM',
      'SSD / Storage',
      'VGA / GPU',
      'Ukuran Layar',
      'Cycle Count Baterai'
    ]
  },

  'cat-kamera': {
    id: 'cat-kamera',
    name: 'Kamera & Fotografi',
    slug: 'kamera-fotografi',
    iconName: 'Camera',
    defaultTitlePlaceholder: 'Contoh: Sony A6400 Body Only Shutter Count 4.200 Fullset Mulus',
    defaultDescriptionPlaceholder:
      'Jelaskan kondisi sensor bersih/bebas jamur, shutter count (SC), fungsi autofokus, karet grip kencang/melar, fungsi tombol...',
    completenessOptions: [
      {
        id: 'FULLSET',
        label: 'Fullset Dus & Strap Asli',
        sublabel: 'Dus + baterai + strap + charger'
      },
      { id: 'UNIT_ONLY', label: 'Unit Body Only (No Box)', sublabel: 'Tanpa kotak bawaan' },
      { id: 'BOX_UNIT', label: 'Body + Lensa Kit', sublabel: 'Termasuk lensa bawaan' },
      {
        id: 'WITH_RECEIPT',
        label: 'Ada Nota Pembelian Asli',
        sublabel: 'Faktur resmi toko kamera'
      },
      {
        id: 'ACTIVE_WARRANTY',
        label: 'Garansi Resmi Sony/Canon/Fuji',
        sublabel: 'Kartu garansi resmi'
      }
    ],
    conditionOptions: [
      { id: 'NEW', label: 'Baru Segel Toko (100%)', description: 'SC 0, segel resmi' },
      {
        id: 'LIKE_NEW',
        label: 'Like New (SC < 5.000)',
        description: 'Sensor bening, karet kencang, bodi mulus'
      },
      {
        id: 'USED_EXCELLENT',
        label: 'Sangat Mulus (SC 5.000 - 15.000)',
        description: 'Kondisi prima, optik bersih'
      },
      {
        id: 'USED_GOOD',
        label: 'Mulus Terawat (SC > 15.000)',
        description: 'Tulisan tombol jelas, AF responsif'
      },
      {
        id: 'USED_FAIR',
        label: 'Pemakaian Berat / Karet Melar',
        description: 'Ada baret wajar pemakaian lapangan'
      },
      {
        id: 'PARTS_ONLY',
        label: 'Error / Butuh Servis Sensor',
        description: 'Error shutter / sensor berjamur parah'
      }
    ],
    historySectionTitle: 'Riwayat Pemakaian & Shutter Count',
    showReceiptToggle: true,
    receiptLabel: 'Menyertakan Nota Toko Kamera Asli',
    receiptSublabel: 'Struk dari Focus Nusantara, Doss, JPC, dll',
    showWarrantyField: true,
    warrantyLabel: 'Status Garansi Resmi:',
    warrantyPlaceholder: 'Contoh: Garansi Resmi PT Alta Nikindo s/d 2026',
    yearLabel: 'Tahun Pembelian Unit:',
    suggestedSpecs: [
      'Shutter Count (SC)',
      'Sensor Type',
      'Mount Lensa',
      'Resolusi (MP)',
      'Kondisi Sensor & Optik',
      'Fungsi Autofokus'
    ]
  },

  'cat-fashion': {
    id: 'cat-fashion',
    name: 'Fashion & Sepatu',
    slug: 'fashion-sepatu',
    iconName: 'Shirt',
    defaultTitlePlaceholder: 'Contoh: Nike Dunk Low Retro White Black Panda Size 43 BNIB / VNDS',
    defaultDescriptionPlaceholder:
      'Jelaskan kondisi sol (bintang/stars masih utuh/kikis), kondisi upper & insole, kelengkapan extra laces, bukti keaslian...',
    completenessOptions: [
      {
        id: 'FULLSET',
        label: 'Lengkap Box Original & Tag',
        sublabel: 'Box asli + tali cadangan + silica'
      },
      { id: 'BOX_UNIT', label: 'Replace Box (Kotak Pengganti)', sublabel: 'Box custom/polos' },
      { id: 'UNIT_ONLY', label: 'Unit Saja (Tanpa Box)', sublabel: 'Hanya sepatu/pakaian' },
      {
        id: 'WITH_RECEIPT',
        label: 'Ada Invoice / Struk Resmi',
        sublabel: 'Nota Footlocker/Atmos/Official'
      },
      {
        id: 'ACTIVE_WARRANTY',
        label: 'Sertifikat / Tag Otentikasi',
        sublabel: 'Verified by SneakerCon/Kick Avenue'
      }
    ],
    conditionOptions: [
      {
        id: 'NEW',
        label: 'Baru BNIB / BNWT (100%)',
        description: 'Brand New In Box, tag belum lepas'
      },
      {
        id: 'LIKE_NEW',
        label: 'VNDS / 1-2x Pakai Indoor (96%+)',
        description: 'Sol bintang utuh, insole bersih tanpa noda'
      },
      {
        id: 'USED_EXCELLENT',
        label: 'Sangat Mulus (90% - 95%)',
        description: 'Kikis sol sangat tipis, upper mulus terawat'
      },
      {
        id: 'USED_GOOD',
        label: 'Pemakaian Wajar (80% - 89%)',
        description: 'Ada crease/lipatan wajar, sol masih tebal'
      },
      {
        id: 'USED_FAIR',
        label: 'Ada Minus Noda / Kikis (65% - 79%)',
        description: 'Ada noda pemakaian, butuh deep cleaning'
      },
      {
        id: 'PARTS_ONLY',
        label: 'Butuh Sol Ulang / Rusak',
        description: 'Sole separation atau robek'
      }
    ],
    historySectionTitle: 'Bukti Keaslian & Riwayat Pembelian',
    showReceiptToggle: true,
    receiptLabel: 'Menyertakan Invoice Pembelian Asli',
    receiptSublabel: 'Bukti pembelian toko resmi / authorized retailer untuk jaminan 100% original',
    showWarrantyField: false,
    warrantyLabel: '',
    warrantyPlaceholder: '',
    yearLabel: 'Tahun Rilis / Pembelian:',
    suggestedSpecs: [
      'Ukuran / Size (US/EU)',
      'Warna / Colorway',
      'Kode SKU / Article',
      'Bahan / Material',
      'Kondisi Sol Bawah',
      'Made In'
    ]
  },

  'cat-otomotif': {
    id: 'cat-otomotif',
    name: 'Motor & Otomotif',
    slug: 'motor-otomotif',
    iconName: 'Bike',
    defaultTitlePlaceholder:
      'Contoh: Vespa Sprint S 150 ABS 2023 Grey Titanio KM 6.200 Pajak Panjang',
    defaultDescriptionPlaceholder:
      'Jelaskan status kepemilikan (tangan ke-1), kelengkapan BPKB/STNK/Faktur, kondisi cat & bodi, mesin standar/bore-up, riwayat servis...',
    completenessOptions: [
      { id: 'FULLSET', label: 'STNK + BPKB + Faktur Lengkap', sublabel: 'Surat-surat komplit sah' },
      { id: 'BOX_UNIT', label: 'STNK + BPKB (Tanpa Faktur)', sublabel: 'Surat resmi lengkap' },
      {
        id: 'WITH_RECEIPT',
        label: 'Kunci Cadangan Ada (2 Kunci)',
        sublabel: 'Kunci master/cadangan lengkap'
      },
      {
        id: 'ACTIVE_WARRANTY',
        label: 'Pajak Hidup & Panjang',
        sublabel: 'Pajak tahunan & 5 tahunan aman'
      },
      { id: 'UNIT_ONLY', label: 'STNK Only / Butuh Urus BPKB', sublabel: 'Kondisi surat tertentu' }
    ],
    conditionOptions: [
      {
        id: 'NEW',
        label: 'KM Rendah Seperti Baru (100%)',
        description: 'KM < 1.000, servis gratis masih ada'
      },
      {
        id: 'LIKE_NEW',
        label: 'Sangat Mulus Terawat (95%+)',
        description: 'Cat 100% ori, mesin halus standar pabrik'
      },
      {
        id: 'USED_EXCELLENT',
        label: 'Pemakaian Harian Prima (90%+)',
        description: 'Baret halus pemakaian parkir wajar'
      },
      {
        id: 'USED_GOOD',
        label: 'Kondisi Sehat Siap Pakai (80%+)',
        description: 'Mesin kering tidak rembes, kelistrikan normal'
      },
      {
        id: 'USED_FAIR',
        label: 'Ada PR Servis / Pajak Mati',
        description: 'Butuh ganti ban/aki atau cat ulang'
      },
      {
        id: 'PARTS_ONLY',
        label: 'Bahan Restorasi / Kanibalan',
        description: 'Mati total atau bahan bangun ulang'
      }
    ],
    historySectionTitle: 'Legalitas Surat & Kelengkapan Kendaraan',
    showReceiptToggle: true,
    receiptLabel: 'Faktur Pembelian / Buku Servis Tersedia',
    receiptSublabel: 'Buku manual, buku servis berkala, dan faktur awal dealer',
    showWarrantyField: true,
    warrantyLabel: 'Masa Berlaku Pajak STNK:',
    warrantyPlaceholder: 'Contoh: Pajak Hidup s/d Oktober 2026',
    yearLabel: 'Tahun Pembuatan / Perakitan:',
    suggestedSpecs: [
      'Odometer (KM)',
      'Kapasitas Mesin (CC)',
      'Tahun Perakitan',
      'Warna Bodi',
      'Plat Nomor (Kota/Daerah)',
      'Status Pajak STNK'
    ]
  },

  'cat-game': {
    id: 'cat-game',
    name: 'Console & Gaming',
    slug: 'console-gaming',
    iconName: 'Gamepad2',
    defaultTitlePlaceholder: 'Contoh: PS5 Digital Edition Slim 1TB Fullset Dus + 2 Stik DualSense',
    defaultDescriptionPlaceholder:
      'Jelaskan kondisi segel void pabrik (belum pernah servis), kondisi analog stik (no drift), kelengkapan kabel HDMI/Power, bonus game...',
    completenessOptions: [
      {
        id: 'FULLSET',
        label: 'Fullset Dus & Stik Original',
        sublabel: 'Dus + 1/2 DualSense + kabel lengkap'
      },
      { id: 'BOX_UNIT', label: 'Mesin + Stik (Tanpa Dus)', sublabel: 'Unit siap main' },
      { id: 'UNIT_ONLY', label: 'Mesin Console Saja', sublabel: 'Hanya console unit' },
      { id: 'WITH_RECEIPT', label: 'Ada Nota Pembelian Toko', sublabel: 'Struk toko game resmi' },
      { id: 'ACTIVE_WARRANTY', label: 'Garansi Resmi Sony/Nintendo', sublabel: 'Garansi aktif' }
    ],
    conditionOptions: [
      { id: 'NEW', label: 'Baru Segel Dus (100%)', description: 'Segel resmi belum dibuka' },
      {
        id: 'LIKE_NEW',
        label: 'Like New (96% - 99% Mulus)',
        description: 'Segel void utuh, kipas hening, no overheat'
      },
      {
        id: 'USED_EXCELLENT',
        label: 'Sangat Mulus (90% - 95%)',
        description: 'Stik presisi no drift, bodi mulus'
      },
      {
        id: 'USED_GOOD',
        label: 'Pemakaian Normal (80% - 89%)',
        description: 'Baret halus wajar pemakaian gaming harian'
      },
      {
        id: 'USED_FAIR',
        label: 'Ada Minus Stik / Bodi Lecet',
        description: 'Stik butuh servis analog atau lecet bodi'
      },
      {
        id: 'PARTS_ONLY',
        label: 'Kondisi BLOD / Mati / Sparepart',
        description: 'Mati total atau unit kanibal'
      }
    ],
    historySectionTitle: 'Keaslian Segel Pabrik & Garansi Toko',
    showReceiptToggle: true,
    receiptLabel: 'Menyertakan Nota Pembelian Toko Game',
    receiptSublabel: 'Struk toko fisik (GS Shop, PS Enterprise, dll)',
    showWarrantyField: true,
    warrantyLabel: 'Status Garansi Toko / Resmi:',
    warrantyPlaceholder: 'Contoh: Garansi Resmi Sony Indonesia s/d 2026',
    yearLabel: 'Tahun Pembelian Console:',
    suggestedSpecs: [
      'Tipe / Versi Console',
      'Kapasitas Penyimpanan',
      'Jumlah Controller / Stik',
      'Status Segel Void',
      'Region',
      'Bonus Game / Aksesoris'
    ]
  },

  'cat-audio': {
    id: 'cat-audio',
    name: 'Audio & Headphone',
    slug: 'audio-headphone',
    iconName: 'Headphones',
    defaultTitlePlaceholder: 'Contoh: Sony WH-1000XM5 Wireless ANC Headphone Black Fullset Mulus',
    defaultDescriptionPlaceholder:
      'Jelaskan kondisi earpad/busa, fungsi Active Noise Cancelling (ANC), daya tahan baterai, kelengkapan pouch case & kabel jack 3.5mm...',
    completenessOptions: [
      {
        id: 'FULLSET',
        label: 'Fullset Dus & Hardcase Asli',
        sublabel: 'Dus + case + kabel jack/charge'
      },
      { id: 'BOX_UNIT', label: 'Unit + Hardcase Saja', sublabel: 'Tanpa dus luar' },
      { id: 'UNIT_ONLY', label: 'Unit Saja (Batangan)', sublabel: 'Hanya headphone/TWS' },
      {
        id: 'WITH_RECEIPT',
        label: 'Ada Nota Pembelian Resmi',
        sublabel: 'Faktur toko audio resmi'
      },
      { id: 'ACTIVE_WARRANTY', label: 'Garansi Resmi Distributor', sublabel: 'Garansi resmi aktif' }
    ],
    conditionOptions: [
      { id: 'NEW', label: 'Baru Segel Box (100%)', description: 'Brand new, belum pernah dibuka' },
      {
        id: 'LIKE_NEW',
        label: 'Like New (96% - 99% Mulus)',
        description: 'Earpad seperti baru, baterai awet maksimal'
      },
      {
        id: 'USED_EXCELLENT',
        label: 'Sangat Mulus (90% - 95%)',
        description: 'Fungsi suara & ANC 100% prima'
      },
      {
        id: 'USED_GOOD',
        label: 'Mulus Terawat (80% - 89%)',
        description: 'Busa kulit aman, tombol responsif'
      },
      {
        id: 'USED_FAIR',
        label: 'Ada Minus Kulit Earpad Mengelupas',
        description: 'Butuh ganti busa earpad'
      },
      {
        id: 'PARTS_ONLY',
        label: 'Mati Sebelah / Rusak',
        description: 'Driver mati sebelah atau baterai drop parah'
      }
    ],
    historySectionTitle: 'Riwayat Pembelian & Garansi Audio',
    showReceiptToggle: true,
    receiptLabel: 'Menyertakan Nota Pembelian Toko Audio',
    receiptSublabel: 'Struk Jaben, CSI-Zone, Desound, dll',
    showWarrantyField: true,
    warrantyLabel: 'Status Garansi Distributor:',
    warrantyPlaceholder: 'Contoh: Garansi Resmi Sony Indonesia 1 Tahun',
    yearLabel: 'Tahun Pembelian Unit:',
    suggestedSpecs: [
      'Konektivitas (Bluetooth/Kabel)',
      'Daya Tahan Baterai',
      'Fitur ANC (Noise Cancelling)',
      'Kondisi Earpad / Busa',
      'Driver Size',
      'Warna'
    ]
  },

  'cat-elektronik': {
    id: 'cat-elektronik',
    name: 'Elektronik Rumah',
    slug: 'elektronik-rumah',
    iconName: 'Tv',
    defaultTitlePlaceholder: 'Contoh: Smart TV LG 43 Inch 4K UHD ThinQ AI Fullset Mulus Normal',
    defaultDescriptionPlaceholder:
      'Jelaskan kondisi layar panel (bebas dead pixel/garis), fungsi remote original, kelengkapan kaki stand / bracket, daya listrik...',
    completenessOptions: [
      {
        id: 'FULLSET',
        label: 'Unit Lengkap Dus & Remote Ori',
        sublabel: 'Dus + remote + kabel power'
      },
      { id: 'BOX_UNIT', label: 'Unit + Remote (Tanpa Dus)', sublabel: 'Siap pakai' },
      { id: 'UNIT_ONLY', label: 'Unit Saja (Tanpa Remote)', sublabel: 'Hanya unit perangkat' },
      {
        id: 'WITH_RECEIPT',
        label: 'Ada Nota Pembelian Toko',
        sublabel: 'Struk Electronic City/Hartono'
      },
      {
        id: 'ACTIVE_WARRANTY',
        label: 'Garansi Kompresor / Panel',
        sublabel: 'Garansi resmi pabrik'
      }
    ],
    conditionOptions: [
      { id: 'NEW', label: 'Baru Segel Box (100%)', description: 'Belum pernah dibuka dari kardus' },
      {
        id: 'LIKE_NEW',
        label: 'Like New (96% - 99% Mulus)',
        description: 'Pemakaian minim, fungsi 100% normal'
      },
      {
        id: 'USED_EXCELLENT',
        label: 'Sangat Mulus Terawat (90%+)',
        description: 'Bodi mulus, fitur normal tanpa kendala'
      },
      {
        id: 'USED_GOOD',
        label: 'Pemakaian Wajar Rumah Tangga',
        description: 'Tanda pemakaian normal harian'
      },
      {
        id: 'USED_FAIR',
        label: 'Ada Minus Fisik / Lecet',
        description: 'Ada baret wajar bodi luar'
      },
      {
        id: 'PARTS_ONLY',
        label: 'Mati / Rusak / Sparepart',
        description: 'Unit mati total atau butuh servis teknisi'
      }
    ],
    historySectionTitle: 'Riwayat Pembelian & Garansi Pabrik',
    showReceiptToggle: true,
    receiptLabel: 'Menyertakan Nota / Kartu Garansi Toko',
    receiptSublabel: 'Faktur resmi Electronic City, Hartono, Best Denki, dll',
    showWarrantyField: true,
    warrantyLabel: 'Masa Garansi Pabrik / Kompresor:',
    warrantyPlaceholder: 'Contoh: Garansi Panel s/d 2027',
    yearLabel: 'Tahun Pembelian Unit:',
    suggestedSpecs: [
      'Daya Listrik (Watt)',
      'Ukuran Layar / Dimensi',
      'Resolusi / Tipe Panel',
      'Warna',
      'Fitur Smart / IoT',
      'Kondisi Remote'
    ]
  }
};

export function getCategoryConfig(categoryId?: string, categorySlug?: string): CategoryConfig {
  if (categoryId && CATEGORY_CONFIGS[categoryId]) {
    return CATEGORY_CONFIGS[categoryId];
  }
  if (categorySlug) {
    const found = Object.values(CATEGORY_CONFIGS).find((c) => c.slug === categorySlug);
    if (found) return found;
  }
  return CATEGORY_CONFIGS['cat-gadget'];
}
