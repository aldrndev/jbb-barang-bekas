import { seedCategories, seedListings, seedUsers } from '@jbb/database';
import type {
  Category,
  Completeness,
  CreateCustomInvoiceInput,
  Invoice,
  InvoiceItem,
  Listing,
  Offer,
  Order,
  Review,
  UserProfile
} from '@jbb/types';

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
      message: 'Nego 17.5 jt siap checkout kurir instant gan.',
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

  customInvoices: Invoice[] = [
    {
      id: 'inv-custom-1',
      invoiceNumber: 'INV-PEYGO-2026-9001',
      type: 'CUSTOM_ADMIN',
      status: 'PAID',
      buyerName: 'Dr. Hendra Gunawan',
      buyerPhone: '081299887766',
      buyerEmail: 'hendra.gunawan@example.com',
      buyerAddress: 'Jl. Senopati No. 45, Kebayoran Baru',
      buyerCity: 'Jakarta Selatan',
      sellerName: 'Peygo Official Store',
      sellerPhone: '081122334455',
      sellerEmail: 'support@peygo.id',
      sellerCity: 'Jakarta Pusat',
      items: [
        {
          id: 'item-inv-1',
          title: 'Jasa Mediasi & Pengujian Fisik Gadget Luxury VIP',
          description: 'Inspeksi keaslian, cek sirkuit logic board, dan sertifikat garansi 30 hari',
          quantity: 1,
          price: 350000,
          total: 350000,
          condition: 'NEW'
        }
      ],
      amount: 350000,
      shippingFee: 0,
      serviceFee: 25000,
      discountAmount: 0,
      totalAmount: 375000,
      netSellerAmount: 350000,
      deliveryMethod: 'COD_KETEMUAN',
      paymentMeta: {
        provider: 'XENDIT',
        gatewayRef: 'XND-INV-202609-0091',
        channel: 'BCA_VA',
        vaNumber: '8801299887766001',
        qrisUrl:
          'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PEYGO-INV-2026-9001',
        paidAt: '2026-08-31T14:30:00Z'
      },
      terms: 'Faktur ini sah dan diterbitkan secara digital oleh sistem proteksi transaksi Peygo.',
      issuedAt: '2026-08-31T10:00:00Z',
      paidAt: '2026-08-31T14:30:00Z',
      createdBy: 'ADMIN'
    }
  ];

  createInvoiceFromOrder(order: Order): Invoice {
    const isPaid = order.escrowStatus !== 'WAITING_PAYMENT' && order.escrowStatus !== 'CANCELLED';
    const status = order.escrowStatus === 'CANCELLED' ? 'CANCELLED' : isPaid ? 'PAID' : 'UNPAID';

    const invoiceNumber = `INV-${order.orderNumber.replace(/^(JBB-|PEYGO-)/, 'PEYGO-')}`;

    const items: InvoiceItem[] = [
      {
        id: `item-${order.id}`,
        title: order.listing?.title || 'Transaksi Barang Pre-Loved',
        description: `Kondisi: ${order.listing?.condition || 'USED_GOOD'} • Kategori: ${order.listing?.category?.name || 'Umum'}`,
        quantity: 1,
        price: order.amount,
        total: order.amount,
        condition: order.listing?.condition || 'USED_GOOD'
      }
    ];

    const vaCode = order.buyerId
      ? `8800${order.buyerId.replace(/\D/g, '').slice(-6).padStart(6, '0')}`
      : `8800${order.id.replace(/\D/g, '').slice(-6).padStart(6, '0')}`;

    return {
      id: `inv-${order.id}`,
      invoiceNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      type: 'ESCROW_ORDER',
      status,
      buyerId: order.buyerId,
      buyerName: order.recipientName || order.buyer?.name || 'Pembeli',
      buyerPhone: order.recipientPhone || order.buyer?.phone || '-',
      buyerEmail: order.buyer?.email,
      buyerAddress: order.shippingAddress || 'Alamat Belum Diisi',
      buyerCity: order.buyer?.city || order.listing?.city,
      sellerId: order.sellerId,
      sellerName: order.seller?.name || order.listing?.seller?.name || 'Penjual Terverifikasi',
      sellerPhone: order.seller?.phone || order.listing?.seller?.phone,
      sellerEmail: order.seller?.email || order.listing?.seller?.email,
      sellerCity: order.seller?.city || order.listing?.city,
      items,
      amount: order.amount,
      shippingFee: order.shippingFee,
      serviceFee: order.serviceFee,
      discountAmount: 0,
      totalAmount: order.totalAmount,
      netSellerAmount: order.amount,
      deliveryMethod: order.deliveryMethod,
      courierName: order.courierName,
      trackingNumber: order.trackingNumber,
      paymentMeta: {
        provider: 'MIDTRANS',
        gatewayRef: `PG-PAY-${order.orderNumber}`,
        channel: order.deliveryMethod === 'COD_KETEMUAN' ? 'COD_CASH' : 'BCA_VA',
        vaNumber: vaCode,
        qrisUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PEYGO-${order.orderNumber}`,
        paymentUrl: `https://peygo.id/pay/${order.orderNumber}`,
        expiredAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        paidAt: isPaid ? order.createdAt : null
      },
      notes:
        order.deliveryMethod === 'COD_KETEMUAN'
          ? 'Metode COD Ketemuan Resmi: Pembayaran aman dilindungi garansi sampai konfirmasi serah terima fisik dilakukan di aplikasi.'
          : 'Pengiriman kurir terlindungi. Pembayaran aman sampai inspeksi fisik 48 jam selesai.',
      terms:
        'Invoice ini diterbitkan secara otomatis oleh sistem Peygo dan dilindungi oleh garansi uang kembali 100%.',
      issuedAt: order.createdAt,
      paidAt: isPaid ? order.createdAt : null,
      dueDate: new Date(new Date(order.createdAt).getTime() + 24 * 3600 * 1000).toISOString(),
      createdBy: 'SYSTEM'
    };
  }

  addCustomInvoice(input: CreateCustomInvoiceInput, createdBy = 'ADMIN'): Invoice {
    const timestamp = Date.now();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-PEYGO-${dateStr}-${randomSuffix}`;
    const id = `inv-custom-${timestamp}`;

    const items: InvoiceItem[] = input.items.map((item, idx) => ({
      id: `item-${timestamp}-${idx + 1}`,
      title: item.title,
      description: item.description || null,
      quantity: item.quantity || 1,
      price: item.price,
      total: (item.quantity || 1) * item.price,
      condition: item.condition || 'NEW'
    }));

    const amount = items.reduce((sum, it) => sum + it.total, 0);
    const shippingFee = input.shippingFee || 0;
    const serviceFee = input.serviceFee || Math.round(amount * 0.01);
    const discountAmount = input.discountAmount || 0;
    const totalAmount = Math.max(0, amount + shippingFee + serviceFee - discountAmount);

    const now = new Date().toISOString();
    const isPaid = input.status === 'PAID';

    const newInvoice: Invoice = {
      id,
      invoiceNumber,
      type: input.type || 'CUSTOM_ADMIN',
      status: input.status || 'UNPAID',
      buyerName: input.buyerName,
      buyerPhone: input.buyerPhone,
      buyerEmail: input.buyerEmail || null,
      buyerAddress: input.buyerAddress,
      buyerCity: input.buyerCity || 'Jakarta',
      sellerName: input.sellerName,
      sellerPhone: input.sellerPhone || null,
      sellerCity: input.sellerCity || 'Jakarta Pusat',
      items,
      amount,
      shippingFee,
      serviceFee,
      discountAmount,
      totalAmount,
      netSellerAmount: amount,
      deliveryMethod: 'KURIR_REGULER',
      paymentMeta: {
        provider: 'MIDTRANS',
        gatewayRef: `PG-CUSTOM-${randomSuffix}`,
        channel: input.paymentChannel || 'BCA_VA',
        vaNumber: `8800${randomSuffix}99`,
        qrisUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${invoiceNumber}`,
        paymentUrl: `https://peygo.id/pay/${invoiceNumber}`,
        expiredAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        paidAt: isPaid ? now : null
      },
      notes:
        input.notes || 'Invoice manual diterbitkan oleh Customer Support / Administrator Peygo.',
      terms:
        'Pembayaran wajib dilakukan ke nomor rekening penampungan resmi sebelum batas waktu berakhir.',
      issuedAt: now,
      paidAt: isPaid ? now : null,
      dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      createdBy
    };

    this.customInvoices.unshift(newInvoice);
    return newInvoice;
  }

  getInvoiceById(id: string): Invoice | undefined {
    // 1. Check custom invoices
    const custom = this.customInvoices.find(
      (inv) => inv.id === id || inv.invoiceNumber === id || inv.orderId === id
    );
    if (custom) return custom;

    // 2. Check if it's an order ID or orderNumber
    const cleanOrderId = id.startsWith('inv-') ? id.slice(4) : id;
    const order = this.orders.find(
      (o) =>
        o.id === cleanOrderId ||
        o.id === id ||
        o.orderNumber === id ||
        `INV-${o.orderNumber.replace(/^(JBB-|PEYGO-)/, 'PEYGO-')}` === id
    );
    if (order) {
      return this.createInvoiceFromOrder(order);
    }

    return undefined;
  }

  getAllInvoices(): Invoice[] {
    const orderInvoices = this.orders.map((o) => this.createInvoiceFromOrder(o));
    return [...this.customInvoices, ...orderInvoices].sort(
      (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    );
  }

  updateInvoiceStatus(
    id: string,
    status: 'PAID' | 'UNPAID' | 'CANCELLED' | 'REFUNDED',
    notes?: string | null
  ): Invoice | undefined {
    // Check custom invoices first
    const custom = this.customInvoices.find((inv) => inv.id === id || inv.invoiceNumber === id);
    if (custom) {
      custom.status = status;
      if (status === 'PAID') {
        custom.paidAt = new Date().toISOString();
        if (custom.paymentMeta) {
          custom.paymentMeta.paidAt = custom.paidAt;
        }
      }
      if (notes) custom.notes = notes;
      return custom;
    }

    // If order invoice
    const cleanOrderId = id.startsWith('inv-') ? id.slice(4) : id;
    const order = this.orders.find(
      (o) => o.id === cleanOrderId || o.id === id || o.orderNumber === id
    );
    if (order) {
      if (status === 'PAID' && order.escrowStatus === 'WAITING_PAYMENT') {
        order.escrowStatus = 'PAYMENT_CONFIRMED';
      } else if (status === 'CANCELLED') {
        order.escrowStatus = 'CANCELLED';
      }
      return this.createInvoiceFromOrder(order);
    }

    return undefined;
  }
}

export const memoryStore = new MemoryStore();
