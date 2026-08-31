import { seedCategories, seedListings, seedUsers } from '@jbb/database';
import type { Category, Listing, Offer, Order, Review, UserProfile } from '@jbb/types';

// In-memory data store for ultra-fast edge simulation and fallback
class MemoryStore {
  users: UserProfile[] = [...seedUsers];
  categories: Category[] = [...seedCategories];
  listings: Listing[] = seedListings.map((item) => ({
    ...item,
    completeness: JSON.parse(item.completeness) as any,
    specs: item.specs ? JSON.parse(item.specs) : null,
    seller: seedUsers.find((u) => u.id === item.sellerId),
    category: seedCategories.find((c) => c.id === item.categoryId)
  }));
  offers: Offer[] = [
    {
      id: 'offer-1',
      listingId: 'item-1',
      buyerId: 'usr-buyer-1',
      sellerId: 'usr-seller-1',
      offeredPrice: 9400000,
      message: 'Bisa 9.4 jt gan? Langsung COD Gandaria City besok siang.',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      createdAt: '2026-08-30T15:00:00Z',
      updatedAt: '2026-08-30T15:00:00Z'
    },
    {
      id: 'offer-2',
      listingId: 'item-2',
      buyerId: 'usr-buyer-1',
      sellerId: 'usr-seller-2',
      offeredPrice: 17500000,
      message: 'Nego 17.5 jt siap rekber kurir instant gan.',
      status: 'ACCEPTED',
      counterPrice: null,
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      createdAt: '2026-08-30T11:00:00Z',
      updatedAt: '2026-08-30T11:30:00Z'
    }
  ];
  orders: Order[] = [
    {
      id: 'ord-1001',
      orderNumber: 'JBB-20260830-1001',
      listingId: 'item-1',
      buyerId: 'usr-buyer-1',
      sellerId: 'usr-seller-1',
      offerId: 'offer-1',
      amount: 9400000,
      shippingFee: 25000,
      serviceFee: 94000,
      totalAmount: 9519000,
      deliveryMethod: 'KURIR_REGULER',
      escrowStatus: 'DELIVERED_INSPECTION',
      recipientName: 'Dimas Ardiansyah',
      recipientPhone: '082155443322',
      shippingAddress: 'Jl. Raya Darmo Permai III No. 45, Gubeng, Surabaya, Jawa Timur 60281',
      courierName: 'JNE Reguler',
      trackingNumber: 'JNE8829103921',
      createdAt: '2026-08-30T10:00:00Z',
      updatedAt: '2026-08-30T14:30:00Z'
    },
    {
      id: 'ord-1002',
      orderNumber: 'JBB-20260830-1002',
      listingId: 'item-2',
      buyerId: 'usr-buyer-1',
      sellerId: 'usr-seller-2',
      offerId: 'offer-2',
      amount: 17500000,
      shippingFee: 35000,
      serviceFee: 175000,
      totalAmount: 17710000,
      deliveryMethod: 'KURIR_REGULER',
      escrowStatus: 'IN_TRANSIT',
      recipientName: 'Dimas Ardiansyah',
      recipientPhone: '082155443322',
      shippingAddress: 'Jl. Raya Darmo Permai III No. 45, Gubeng, Surabaya, Jawa Timur 60281',
      courierName: 'SiCepat BEST',
      trackingNumber: '002938491028',
      createdAt: '2026-08-30T12:00:00Z',
      updatedAt: '2026-08-30T16:30:00Z'
    },
    {
      id: 'ord-1003',
      orderNumber: 'JBB-20260829-1003',
      listingId: 'item-5',
      buyerId: 'usr-buyer-1',
      sellerId: 'usr-seller-1',
      offerId: null,
      amount: 1150000,
      shippingFee: 0,
      serviceFee: 11500,
      totalAmount: 1161500,
      deliveryMethod: 'COD_KETEMUAN',
      escrowStatus: 'COMPLETED',
      recipientName: 'Dimas Ardiansyah',
      recipientPhone: '082155443322',
      shippingAddress: 'Pakuwon Mall Jogja / Cafe Kaliurang',
      courierName: 'COD Langsung',
      trackingNumber: null,
      createdAt: '2026-08-29T14:00:00Z',
      updatedAt: '2026-08-29T18:00:00Z'
    },
    {
      id: 'ord-1004',
      orderNumber: 'JBB-20260831-1004',
      listingId: 'item-3',
      buyerId: 'usr-seller-2',
      sellerId: 'usr-seller-1',
      offerId: null,
      amount: 13500000,
      shippingFee: 30000,
      serviceFee: 135000,
      totalAmount: 13665000,
      deliveryMethod: 'KURIR_REGULER',
      escrowStatus: 'SELLER_PACKING',
      recipientName: 'Rian Pratama',
      recipientPhone: '081399887766',
      shippingAddress: 'Jl. Dago Asri No. 12, Coblong, Bandung, Jawa Barat 40132',
      courierName: 'JNE Reguler',
      trackingNumber: null,
      createdAt: '2026-08-31T09:00:00Z',
      updatedAt: '2026-08-31T09:30:00Z'
    },
    {
      id: 'ord-1005',
      orderNumber: 'JBB-20260828-1005',
      listingId: 'item-4',
      buyerId: 'usr-seller-1',
      sellerId: 'usr-seller-2',
      offerId: null,
      amount: 6400000,
      shippingFee: 25000,
      serviceFee: 64000,
      totalAmount: 6489000,
      deliveryMethod: 'KURIR_REGULER',
      escrowStatus: 'DELIVERED_INSPECTION',
      recipientName: 'Budi Santoso',
      recipientPhone: '081288991122',
      shippingAddress: 'Jl. Wijaya II No. 88, Kebayoran Baru, Jakarta Selatan 12130',
      courierName: 'J&T Express',
      trackingNumber: 'JT9928172635',
      createdAt: '2026-08-28T11:00:00Z',
      updatedAt: '2026-08-28T15:00:00Z'
    }
  ];
  reviews: Review[] = [
    {
      id: 'rev-1',
      orderId: 'ord-999',
      listingId: 'item-1',
      reviewerId: 'usr-buyer-1',
      sellerId: 'usr-seller-1',
      rating: 5,
      comment: 'Barang sangat mulus sesuai deskripsi, penjual ramah dan fast respon. Recomended seller!',
      itemConditionMatch: true,
      fastResponse: true,
      createdAt: '2026-08-25T10:00:00Z'
    }
  ];

  findUserByEmail(email: string) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string) {
    return this.users.find((u) => u.id === id);
  }

  addUser(user: UserProfile) {
    this.users.push(user);
    return user;
  }

  getListingDetail(idOrSlug: string) {
    const item = this.listings.find((l) => l.id === idOrSlug || l.slug === idOrSlug);
    if (!item) return null;
    return {
      ...item,
      seller: this.findUserById(item.sellerId),
      category: this.categories.find((c) => c.id === item.categoryId)
    };
  }

  addListing(listing: Listing) {
    this.listings.unshift(listing);
    return listing;
  }
}

export const memoryStore = new MemoryStore();
