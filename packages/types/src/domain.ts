export type ItemCondition =
  | 'NEW'
  | 'LIKE_NEW'
  | 'USED_EXCELLENT'
  | 'USED_GOOD'
  | 'USED_FAIR'
  | 'PARTS_ONLY';

export const ItemConditionLabel: Record<ItemCondition, { label: string; badge: string; description: string; score: string }> = {
  NEW: {
    label: 'Baru (BNOB / Segel)',
    badge: '100% Baru',
    description: 'Belum pernah dipakai, kotak segel atau Brand New Open Box.',
    score: '100%'
  },
  LIKE_NEW: {
    label: 'Seperti Baru (Mulus 95%+)',
    badge: 'Mulus 95%+',
    description: 'Pemakaian sangat minim, bodi tanpa lecet berarti, fungsi normal total.',
    score: '95%+'
  },
  USED_EXCELLENT: {
    label: 'Bekas Sangat Bagus (85% - 94%)',
    badge: 'Bekas 85%+',
    description: 'Tanda pemakaian wajar halus, semua tombol dan fitur 100% lancar.',
    score: '85-94%'
  },
  USED_GOOD: {
    label: 'Bekas Wajar (70% - 84%)',
    badge: 'Bekas 70%+',
    description: 'Ada goresan/baret pemakaian normal harian, performa mesin/fungsi tetap prima.',
    score: '70-84%'
  },
  USED_FAIR: {
    label: 'Minus Ringan / Lecet',
    badge: 'Ada Minus',
    description: 'Ada lecet jelas atau minus fungsional minor yang dijelaskan di deskripsi.',
    score: '< 70%'
  },
  PARTS_ONLY: {
    label: 'Rusak / Kanibalan / Sparepart',
    badge: 'Untuk Sparepart',
    description: 'Barang mati total atau rusak parah, hanya cocok untuk teknisi/kanibalan.',
    score: 'Mati/Sparepart'
  }
};

export type Completeness =
  | 'FULLSET'
  | 'UNIT_ONLY'
  | 'BOX_UNIT'
  | 'WITH_RECEIPT'
  | 'ACTIVE_WARRANTY';

export const CompletenessLabel: Record<Completeness, string> = {
  FULLSET: 'Fullset (Dus + Charger + Aksesoris Lengkap)',
  UNIT_ONLY: 'Batangan (Hanya Unit)',
  BOX_UNIT: 'Unit + Dus (Tanpa Aksesoris Tambahan)',
  WITH_RECEIPT: 'Ada Nota / Struk Pembelian Asli',
  ACTIVE_WARRANTY: 'Garansi Resmi Masih Aktif'
};

export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'IN_NEGO' | 'RESERVED' | 'SOLD' | 'ARCHIVED';

export const ListingStatusLabel: Record<ListingStatus, { label: string; badge: string }> = {
  DRAFT: { label: 'Draf Iklan', badge: 'Draf' },
  ACTIVE: { label: 'Iklan Aktif', badge: 'Aktif' },
  IN_NEGO: { label: 'Sedang Nego', badge: 'Nego Berjalan' },
  RESERVED: { label: 'Sudah Dibooking', badge: 'Booking' },
  SOLD: { label: 'Terjual', badge: 'Terjual' },
  ARCHIVED: { label: 'Diarsipkan', badge: 'Arsip' }
};

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'COUNTERED' | 'REJECTED' | 'EXPIRED' | 'COMPLETED';

export const OfferStatusLabel: Record<OfferStatus, { label: string; badge: string }> = {
  PENDING: { label: 'Menunggu Respon Penjual', badge: 'Menunggu Respon' },
  ACCEPTED: { label: 'Tawaran Disetujui', badge: 'Disetujui' },
  COUNTERED: { label: 'Penjual Tawar Balik', badge: 'Tawar Balik' },
  REJECTED: { label: 'Tawaran Ditolak', badge: 'Ditolak' },
  EXPIRED: { label: 'Tawaran Kadaluarsa', badge: 'Kadaluarsa' },
  COMPLETED: { label: 'Transaksi Nego Selesai', badge: 'Selesai' }
};

export type EscrowStatus =
  | 'WAITING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'SELLER_PACKING'
  | 'IN_TRANSIT'
  | 'DELIVERED_INSPECTION'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED';

export const EscrowStatusLabel: Record<EscrowStatus, { label: string; badge: string; description: string }> = {
  WAITING_PAYMENT: {
    label: 'Menunggu Pembayaran Rekber',
    badge: 'Menunggu Bayar',
    description: 'Pembeli belum menyelesaikan transfer pembayaran ke rekening bersama.'
  },
  PAYMENT_CONFIRMED: {
    label: 'Dana Rekber Terverifikasi',
    badge: 'Dana Diamankan',
    description: 'Dana aman 100% di perantara Rekber JBB. Penjual diinstruksikan memproses pesanan.'
  },
  SELLER_PACKING: {
    label: 'Penjual Sedang Mengemas Paket',
    badge: 'Sedang Dikemas',
    description: 'Penjual sedang menyiapkan dan mengemas barang untuk diserahkan ke kurir / COD.'
  },
  IN_TRANSIT: {
    label: 'Dalam Pengiriman Kurir',
    badge: 'Dalam Pengiriman',
    description: 'Paket dalam perjalanan via kurir dengan nomor resi terdaftar.'
  },
  DELIVERED_INSPECTION: {
    label: 'Masa Inspeksi Fisik 48 Jam Aktif',
    badge: 'Inspeksi 48 Jam',
    description: 'Barang telah diterima. Pembeli memiliki waktu 2x24 jam untuk memeriksa kondisi fisik & fungsi.'
  },
  COMPLETED: {
    label: 'Transaksi Selesai',
    badge: 'Selesai',
    description: 'Pembeli telah mengonfirmasi kesesuaian barang. Dana telah berhasil dicairkan ke saldo penjual.'
  },
  DISPUTED: {
    label: 'Komplain Garansi 48 Jam Diajukan',
    badge: 'Komplain / Retur',
    description: 'Pembeli mengajukan komplain karena minus barang tidak sesuai deskripsi. Dana ditahan sementara oleh tim CS.'
  },
  CANCELLED: {
    label: 'Pesanan Dibatalkan',
    badge: 'Dibatalkan',
    description: 'Transaksi dibatalkan dan dana telah dikembalikan ke pembeli jika sudah dibayar.'
  }
};

export type DeliveryMethod = 'COD_KETEMUAN' | 'KURIR_REGULER' | 'KURIR_INSTANT';

export type UserRole = 'BUYER' | 'SELLER' | 'MODERATOR' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  isKycVerified: boolean;
  isPhoneVerified: boolean;
  trustScore: number;
  totalTransactions: number;
  ratingAverage: number;
  ratingCount: number;
  city?: string | null;
  province?: string | null;
  bio?: string | null;
  nik?: string | null;
  ktpImageUrl?: string | null;
  selfieImageUrl?: string | null;
  kycSubmittedAt?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  parentId?: string | null;
  itemCount: number;
  featured: boolean;
}

export interface ListingImage {
  id: string;
  listingId: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Listing {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  isNegotiable: boolean;
  minOfferPrice?: number | null;
  condition: ItemCondition;
  completeness: Completeness[];
  purchaseYear?: number | null;
  warrantyUntil?: string | null;
  hasOriginalReceipt: boolean;
  status: ListingStatus;
  viewCount: number;
  offerCount: number;
  favoriteCount: number;
  
  // Location
  province: string;
  city: string;
  district: string;
  postalCode?: string | null;
  isCodAvailable: boolean;
  codMeetingPoint?: string | null;
  
  // Specifications JSON (e.g. storage, RAM, color, odometer, size)
  specs?: Record<string, string | number | boolean> | null;
  
  images: ListingImage[];
  seller?: UserProfile;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  offeredPrice: number;
  message?: string | null;
  status: OfferStatus;
  counterPrice?: number | null;
  counterMessage?: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  listing?: Listing;
  buyer?: UserProfile;
  seller?: UserProfile;
}

export interface Order {
  id: string;
  orderNumber: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  offerId?: string | null;
  amount: number;
  shippingFee: number;
  serviceFee: number;
  totalAmount: number;
  deliveryMethod: DeliveryMethod;
  escrowStatus: EscrowStatus;
  
  // Shipping details
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  inspectionDeadline?: string | null;
  
  // Dispute
  disputeReason?: string | null;
  disputeEvidenceUrls?: string[] | null;
  disputeStatus?: string | null;
  
  listing?: Listing;
  buyer?: UserProfile;
  seller?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  listingId: string;
  reviewerId: string;
  sellerId: string;
  rating: number; // 1 to 5
  comment: string;
  itemConditionMatch: boolean;
  fastResponse: boolean;
  createdAt: string;
  reviewer?: UserProfile;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  listingId?: string | null;
  message: string;
  isOfferCard?: boolean;
  offerId?: string | null;
  isRead: boolean;
  createdAt: string;
  sender?: UserProfile;
}
