import { seedCategories, seedListings, seedUsers } from '@jbb/database';
import type { Category, Completeness, Listing, Offer, Order, Review, UserProfile } from '@jbb/types';

// In-memory data store for ultra-fast edge simulation and fallback
class MemoryStore {
  users: UserProfile[] = [...seedUsers];
  categories: Category[] = [...seedCategories];
  listings: Listing[] = seedListings.map((item) => ({
    ...item,
    completeness: JSON.parse(item.completeness) as Completeness[],
    specs: item.specs ? JSON.parse(item.specs) : null,
    seller: seedUsers.find((u) => u.id === item.sellerId),
    category: seedCategories.find((c) => c.id === item.categoryId)
  }));
  offers: Offer[] = [
    {
      id: 'offer-1',
      listingId: 'item-1',
      buyerId: 'usr-seller-3',
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
      listingId: 'item-6',
      buyerId: 'usr-seller-3',
      sellerId: 'usr-seller-2',
      offeredPrice: 17500000,
      message: 'Nego 17.5 jt siap rekber kurir instant gan.',
      status: 'ACCEPTED',
      counterPrice: null,
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      createdAt: '2026-08-30T11:00:00Z',
      updatedAt: '2026-08-30T11:30:00Z'
    },
    {
      id: 'offer-3',
      listingId: 'item-18',
      buyerId: 'usr-seller-1',
      sellerId: 'usr-seller-5',
      offeredPrice: 6100000,
      message: 'Bisa 6.1 jt langsung bungkus bang?',
      status: 'ACCEPTED',
      counterPrice: null,
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      createdAt: '2026-08-29T14:00:00Z',
      updatedAt: '2026-08-29T14:30:00Z'
    }
  ];
  orders: Order[] = [
    {
      id: 'ord-1001',
      orderNumber: 'PEYGO-20260830-1001',
      listingId: 'item-6',
      buyerId: 'usr-seller-3',
      sellerId: 'usr-seller-2',
      offerId: 'offer-2',
      amount: 17500000,
      shippingFee: 35000,
      serviceFee: 175000,
      totalAmount: 17710000,
      deliveryMethod: 'KURIR_REGULER',
      escrowStatus: 'DELIVERED_INSPECTION',
      recipientName: 'Dimas Ardiansyah',
      recipientPhone: '082155443322',
      shippingAddress: 'Jl. Raya Darmo Permai III No. 45, Gubeng, Surabaya, Jawa Timur 60281',
      courierName: 'JNE YES',
      trackingNumber: 'JNE8829103921',
      createdAt: '2026-08-30T10:00:00Z',
      updatedAt: '2026-08-30T14:30:00Z'
    },
    {
      id: 'ord-1002',
      orderNumber: 'PEYGO-20260829-1002',
      listingId: 'item-18',
      buyerId: 'usr-seller-1',
      sellerId: 'usr-seller-5',
      offerId: 'offer-3',
      amount: 6100000,
      shippingFee: 0,
      serviceFee: 61000,
      totalAmount: 6161000,
      deliveryMethod: 'COD_KETEMUAN',
      escrowStatus: 'COMPLETED',
      recipientName: 'Budi Santoso',
      recipientPhone: '081288991122',
      shippingAddress: 'The Breeze BSD / AEON Mall Serpong',
      courierName: 'COD Langsung',
      trackingNumber: null,
      createdAt: '2026-08-29T15:00:00Z',
      updatedAt: '2026-08-29T17:00:00Z'
    },
    {
      id: 'ord-1003',
      orderNumber: 'PEYGO-20260828-1003',
      listingId: 'item-22',
      buyerId: 'usr-seller-3',
      sellerId: 'usr-seller-4',
      offerId: null,
      amount: 1150000,
      shippingFee: 22000,
      serviceFee: 11500,
      totalAmount: 1183500,
      deliveryMethod: 'KURIR_REGULER',
      escrowStatus: 'COMPLETED',
      recipientName: 'Dimas Ardiansyah',
      recipientPhone: '082155443322',
      shippingAddress: 'Jl. Raya Darmo Permai III No. 45, Gubeng, Surabaya, Jawa Timur 60281',
      courierName: 'SiCepat BEST',
      trackingNumber: '002938491028',
      createdAt: '2026-08-28T10:00:00Z',
      updatedAt: '2026-08-28T16:00:00Z'
    }
  ];
  reviews: Review[] = [
    {
      id: 'rev-1',
      orderId: 'ord-1002',
      listingId: 'item-18',
      reviewerId: 'usr-seller-1',
      sellerId: 'usr-seller-5',
      rating: 5,
      comment:
        'Mantap bang PS5 mulus banget sesuai deskripsi! Respon cepat dan ramah banget saat COD.',
      itemConditionMatch: true,
      fastResponse: true,
      createdAt: '2026-08-29T18:00:00Z'
    },
    {
      id: 'rev-2',
      orderId: 'ord-1003',
      listingId: 'item-22',
      reviewerId: 'usr-seller-3',
      sellerId: 'usr-seller-4',
      rating: 5,
      comment:
        'Sepatu Nike Dunk Panda 100% original, packing bubble wrap tebal dan sampai tepat waktu.',
      itemConditionMatch: true,
      fastResponse: true,
      createdAt: '2026-08-28T17:00:00Z'
    }
  ];

  approvedUserIds = new Set<string>();
  rejectedUserIds = new Set<string>();

  findUserByEmail(email: string) {
    const raw = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!raw) return undefined;
    return this.findUserById(raw.id);
  }

  findUserById(id: string): UserProfile | undefined {
    const user = this.users.find((u) => u.id === id);
    if (!user) return undefined;
    const isApproved = this.approvedUserIds.has(user.id);
    const isRejected = this.rejectedUserIds.has(user.id);
    const isVerified = (isApproved || Boolean(user.isKycVerified)) && !isRejected;

    return {
      ...user,
      isKycVerified: isVerified,
      trustScore: isRejected ? 75 : isVerified ? 98 : user.trustScore || 80,
      role: isVerified ? 'SELLER' : user.role
    };
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

  getCategories(): Category[] {
    return this.categories.map((cat) => {
      const activeCount = this.listings.filter(
        (l) => (l.categoryId === cat.id || l.category?.id === cat.id) && l.status === 'ACTIVE'
      ).length;
      return {
        ...cat,
        itemCount: activeCount
      };
    });
  }

  wishlists: Array<{ id: string; userId: string; listingId: string; createdAt: string }> = [
    {
      id: 'wsh-1',
      userId: 'usr-buyer-1',
      listingId: 'item-2',
      createdAt: '2026-08-30T10:00:00Z'
    },
    {
      id: 'wsh-2',
      userId: 'usr-buyer-1',
      listingId: 'item-4',
      createdAt: '2026-08-31T09:00:00Z'
    }
  ];

  getUserWishlist(userId: string): Listing[] {
    const userWishlistEntries = this.wishlists.filter((w) => w.userId === userId);
    const listingIds = userWishlistEntries.map((w) => w.listingId);
    return this.listings
      .filter((l) => listingIds.includes(l.id))
      .map((l) => this.getListingDetail(l.id) || l);
  }

  isItemWishlisted(userId: string, listingId: string): boolean {
    return this.wishlists.some((w) => w.userId === userId && w.listingId === listingId);
  }

  toggleWishlist(userId: string, listingId: string): boolean {
    const index = this.wishlists.findIndex((w) => w.userId === userId && w.listingId === listingId);
    if (index !== -1) {
      this.wishlists.splice(index, 1);
      return false;
    } else {
      this.wishlists.unshift({
        id: `wsh-${Date.now()}`,
        userId,
        listingId,
        createdAt: new Date().toISOString()
      });
      return true;
    }
  }

  removeFromWishlist(userId: string, listingId: string) {
    this.wishlists = this.wishlists.filter(
      (w) => !(w.userId === userId && w.listingId === listingId)
    );
  }

  clearWishlist(userId: string) {
    this.wishlists = this.wishlists.filter((w) => w.userId !== userId);
  }

  addListing(listing: Listing) {
    this.listings.unshift(listing);
    return listing;
  }
}

export const memoryStore = new MemoryStore();
