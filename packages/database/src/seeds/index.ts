export const seedCategories = [
  {
    id: 'cat-gadget',
    name: 'HP & Gadget',
    slug: 'hp-gadget',
    icon: 'Smartphone',
    featured: true,
    sortOrder: 1,
    itemCount: 420
  },
  {
    id: 'cat-laptop',
    name: 'Laptop & Komputer',
    slug: 'laptop-komputer',
    icon: 'Laptop',
    featured: true,
    sortOrder: 2,
    itemCount: 310
  },
  {
    id: 'cat-kamera',
    name: 'Kamera & Fotografi',
    slug: 'kamera-fotografi',
    icon: 'Camera',
    featured: true,
    sortOrder: 3,
    itemCount: 185
  },
  {
    id: 'cat-otomotif',
    name: 'Motor & Otomotif',
    slug: 'motor-otomotif',
    icon: 'Bike',
    featured: true,
    sortOrder: 4,
    itemCount: 290
  },
  {
    id: 'cat-game',
    name: 'Console & Gaming',
    slug: 'console-gaming',
    icon: 'Gamepad2',
    featured: true,
    sortOrder: 5,
    itemCount: 160
  },
  {
    id: 'cat-fashion',
    name: 'Fashion & Sepatu (Thrift)',
    slug: 'fashion-sepatu',
    icon: 'Shirt',
    featured: true,
    sortOrder: 6,
    itemCount: 540
  },
  {
    id: 'cat-audio',
    name: 'Audio & Headphone',
    slug: 'audio-headphone',
    icon: 'Headphones',
    featured: false,
    sortOrder: 7,
    itemCount: 125
  },
  {
    id: 'cat-elektronik',
    name: 'Elektronik Rumah',
    slug: 'elektronik-rumah',
    icon: 'Tv',
    featured: false,
    sortOrder: 8,
    itemCount: 210
  }
];

export const seedUsers = [
  {
    id: 'usr-seller-1',
    name: 'Budi Santoso',
    email: 'budi.gadget@example.com',
    passwordHash: 'argon2_or_bcrypt_mock_hash',
    phone: '081288991122',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'SELLER' as const,
    isKycVerified: true,
    isPhoneVerified: true,
    trustScore: 98,
    totalTransactions: 64,
    ratingAverage: 4.9,
    ratingCount: 52,
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    bio: 'Pribadi pecinta gadget Apple & Camera. Jual barang koleksi pribadi, selalu jujur kondisi apa adanya.',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'usr-seller-2',
    name: 'Rian Pratama',
    email: 'rian.tech@example.com',
    passwordHash: 'argon2_or_bcrypt_mock_hash',
    phone: '081399887766',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'SELLER' as const,
    isKycVerified: true,
    isPhoneVerified: true,
    trustScore: 95,
    totalTransactions: 38,
    ratingAverage: 4.85,
    ratingCount: 31,
    city: 'Bandung',
    province: 'Jawa Barat',
    bio: 'Software engineer. Jual laptop & equipment kerja eks-upgrade kantor / pribadi.',
    createdAt: '2025-03-15T12:00:00Z',
    updatedAt: '2026-08-30T12:00:00Z'
  },
  {
    id: 'usr-buyer-1',
    name: 'Dimas Ardiansyah',
    email: 'dimas.ardi@example.com',
    passwordHash: 'argon2_or_bcrypt_mock_hash',
    phone: '082155443322',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'BUYER' as const,
    isKycVerified: true,
    isPhoneVerified: true,
    trustScore: 92,
    totalTransactions: 19,
    ratingAverage: 5.0,
    ratingCount: 14,
    city: 'Surabaya',
    province: 'Jawa Timur',
    bio: 'Kolektor kamera dan pecinta thrift jacket.',
    createdAt: '2025-05-20T08:00:00Z',
    updatedAt: '2026-08-30T08:00:00Z'
  }
];

export const seedListings = [
  {
    id: 'item-1',
    sellerId: 'usr-seller-1',
    categoryId: 'cat-gadget',
    title: 'iPhone 13 Pro 128GB Sierra Blue Resmi iBox Mulus 96%',
    slug: 'iphone-13-pro-128gb-sierra-blue-resmi-ibox-mulus-96',
    description: 'Dijual iPhone 13 Pro 128GB warna Sierra Blue garansi resmi iBox (PA/A). Kondisi fisik mulus terawat 96%, selalu pakai case dan tempered glass sejak hari pertama. Battery Health 87% original belum pernah servis/bongkar. Face ID, True Tone, 3uTools 100% hijau semua normal. Kelengkapan fullset dus original, kabel type-c original bawaan, sticker apple.',
    price: 9850000,
    originalPrice: 18499000,
    isNegotiable: true,
    minOfferPrice: 9200000,
    condition: 'LIKE_NEW' as const,
    completeness: JSON.stringify(['FULLSET', 'WITH_RECEIPT']),
    purchaseYear: 2023,
    warrantyUntil: null,
    hasOriginalReceipt: true,
    status: 'ACTIVE' as const,
    viewCount: 384,
    offerCount: 8,
    favoriteCount: 42,
    province: 'DKI Jakarta',
    city: 'Jakarta Selatan',
    district: 'Kebayoran Baru',
    postalCode: '12130',
    isCodAvailable: true,
    codMeetingPoint: 'Gandaria City / Blok M Plaza',
    specs: JSON.stringify({
      storage: '128 GB',
      color: 'Sierra Blue',
      batteryHealth: '87%',
      region: 'PA/A (iBox Indonesia)',
      faceId: 'Normal 100%',
      trueTone: 'Active'
    }),
    images: [
      {
        id: 'img-1-1',
        listingId: 'item-1',
        url: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
        sortOrder: 1
      },
      {
        id: 'img-1-2',
        listingId: 'item-1',
        url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
        isPrimary: false,
        sortOrder: 2
      }
    ],
    createdAt: '2026-08-30T14:30:00Z',
    updatedAt: '2026-08-30T14:30:00Z'
  },
  {
    id: 'item-2',
    sellerId: 'usr-seller-2',
    categoryId: 'cat-laptop',
    title: 'MacBook Pro 14" M1 Pro 16GB / 512GB Space Grey Fullset Garansi Habis',
    slug: 'macbook-pro-14-m1-pro-16gb-512gb-space-grey-fullset',
    description: 'MacBook Pro 14 inci M1 Pro (8-Core CPU, 14-Core GPU, 16GB Unified RAM, 512GB SSD). Pemakaian harian untuk koding. Bodi 94% mulus tidak ada dent/penyok, hanya baret halus di bawah. Layar Liquid Retina XDR mulus no dead pixel/staingate. Cycle Count 165 (Normal). Fullset dus, charger MagSafe 3 67W asli bawaan.',
    price: 18200000,
    originalPrice: 28999000,
    isNegotiable: true,
    minOfferPrice: 17000000,
    condition: 'USED_EXCELLENT' as const,
    completeness: JSON.stringify(['FULLSET', 'BOX_UNIT']),
    purchaseYear: 2022,
    warrantyUntil: null,
    hasOriginalReceipt: false,
    status: 'ACTIVE' as const,
    viewCount: 612,
    offerCount: 12,
    favoriteCount: 78,
    province: 'Jawa Barat',
    city: 'Bandung',
    district: 'Coblong (Dago)',
    postalCode: '40132',
    isCodAvailable: true,
    codMeetingPoint: 'Starbucks Dago / Cihampelas Walk',
    specs: JSON.stringify({
      processor: 'Apple M1 Pro (8-Core)',
      ram: '16 GB',
      storage: '512 GB SSD',
      cycleCount: 165,
      screenSize: '14.2 Inch Liquid Retina XDR'
    }),
    images: [
      {
        id: 'img-2-1',
        listingId: 'item-2',
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
        sortOrder: 1
      },
      {
        id: 'img-2-2',
        listingId: 'item-2',
        url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
        isPrimary: false,
        sortOrder: 2
      }
    ],
    createdAt: '2026-08-29T10:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'item-3',
    sellerId: 'usr-seller-1',
    categoryId: 'cat-kamera',
    title: 'Sony Alpha A6400 Body + Lensa Sigma 30mm F1.4 DC DN Shutter Count 4.2k',
    slug: 'sony-alpha-a6400-body-lensa-sigma-30mm-f14',
    description: 'Dijual sepaket kamera mirrorless Sony A6400 + Lensa bokeh tajam Sigma 30mm f/1.4. Shutter count baru 4.200 (sangat rendah). Karet kencang, sensor bersih no jamur/debu, autofokus super cepat. Bonus filter UV Hoya, baterai cadangan Kingma 2 pcs + dual charger.',
    price: 13500000,
    originalPrice: 17800000,
    isNegotiable: true,
    minOfferPrice: 12700000,
    condition: 'USED_EXCELLENT' as const,
    completeness: JSON.stringify(['FULLSET', 'BOX_UNIT']),
    purchaseYear: 2023,
    warrantyUntil: null,
    hasOriginalReceipt: true,
    status: 'ACTIVE' as const,
    viewCount: 420,
    offerCount: 5,
    favoriteCount: 39,
    province: 'Jawa Timur',
    city: 'Surabaya',
    district: 'Gubeng',
    postalCode: '60281',
    isCodAvailable: true,
    codMeetingPoint: 'Tunjungan Plaza / Galaxy Mall',
    specs: JSON.stringify({
      shutterCount: 4200,
      sensor: '24.2 MP APS-C Exmor CMOS',
      lens: 'Sigma 30mm f/1.4 DC DN Contemporary',
      autofocus: 'Real-time Eye AF'
    }),
    images: [
      {
        id: 'img-3-1',
        listingId: 'item-3',
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    createdAt: '2026-08-28T09:15:00Z',
    updatedAt: '2026-08-28T09:15:00Z'
  },
  {
    id: 'item-4',
    sellerId: 'usr-seller-2',
    categoryId: 'cat-game',
    title: 'PlayStation 5 (PS5) Digital Edition CFI-1200 + 2 Stik DualSense Ori',
    slug: 'ps5-digital-edition-cfi-1200-2-stik-dualsense',
    description: 'Dijual PS5 Digital CFI-1200 (seri dingin & hening). Kondisi 98% like new jarang dimainkan karena sibuk kantor. Termasuk 2 Controller DualSense Original no drift sama sekali. Dus buku kabel HDMI ultra high speed lengkap.',
    price: 6400000,
    originalPrice: 8500000,
    isNegotiable: true,
    minOfferPrice: 6000000,
    condition: 'LIKE_NEW' as const,
    completeness: JSON.stringify(['FULLSET', 'BOX_UNIT']),
    purchaseYear: 2023,
    warrantyUntil: null,
    hasOriginalReceipt: false,
    status: 'ACTIVE' as const,
    viewCount: 530,
    offerCount: 9,
    favoriteCount: 56,
    province: 'Banten',
    city: 'Tangerang Selatan',
    district: 'Serpong (BSD)',
    postalCode: '15310',
    isCodAvailable: true,
    codMeetingPoint: 'The Breeze BSD / AEON Mall',
    specs: JSON.stringify({
      model: 'CFI-1200B Digital',
      storage: '825 GB Custom SSD',
      controller: '2x DualSense Wireless'
    }),
    images: [
      {
        id: 'img-4-1',
        listingId: 'item-4',
        url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    createdAt: '2026-08-27T16:00:00Z',
    updatedAt: '2026-08-27T16:00:00Z'
  },
  {
    id: 'item-5',
    sellerId: 'usr-seller-1',
    categoryId: 'cat-fashion',
    title: 'Nike Dunk Low Retro White Black "Panda" Size 42.5 / US 9 Original',
    slug: 'nike-dunk-low-retro-panda-size-42-5-original',
    description: 'Sepatu Nike Dunk Low Panda original beli di Hoops Point. Kondisi 88% pemakaian terawat, outsole bintang masih tebal, insole logo Nike masih utuh, toebox minim crease karena pakai crease protector. Replace box Nike original.',
    price: 1150000,
    originalPrice: 1899000,
    isNegotiable: true,
    minOfferPrice: 1000000,
    condition: 'USED_GOOD' as const,
    completeness: JSON.stringify(['UNIT_ONLY']),
    purchaseYear: 2023,
    warrantyUntil: null,
    hasOriginalReceipt: true,
    status: 'ACTIVE' as const,
    viewCount: 290,
    offerCount: 4,
    favoriteCount: 27,
    province: 'DI Yogyakarta',
    city: 'Yogyakarta',
    district: 'Depok Sleman',
    postalCode: '55281',
    isCodAvailable: true,
    codMeetingPoint: 'Pakuwon Mall Jogja / Cafe Kaliurang',
    specs: JSON.stringify({
      size: '42.5 EUR / US 9',
      colorway: 'White / Black',
      authenticity: '100% Original Verified'
    }),
    images: [
      {
        id: 'img-5-1',
        listingId: 'item-5',
        url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    createdAt: '2026-08-26T11:20:00Z',
    updatedAt: '2026-08-26T11:20:00Z'
  }
];
