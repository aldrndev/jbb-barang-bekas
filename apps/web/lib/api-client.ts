import type {
  ApiResponse,
  Category,
  Listing,
  ListingFilterParams,
  Offer,
  Order,
  PaginatedList,
  Review,
  UserProfile
} from '@jbb/types';
import type {
  CreateListingInput,
  CreateOrderInput,
  CreateReviewInput,
  MakeOfferInput,
  SubmitKycInput,
  UpdateBankPayoutInput,
  UpdateListingInput,
  UpdateProfileInput
} from '@jbb/validators';

export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.endsWith('.local');

    if (!isLocal) {
      if (
        process.env.NEXT_PUBLIC_API_URL &&
        !process.env.NEXT_PUBLIC_API_URL.includes('localhost') &&
        !process.env.NEXT_PUBLIC_API_URL.includes('127.0.0.1')
      ) {
        return process.env.NEXT_PUBLIC_API_URL;
      }
      return 'https://bekasin-api.corporate-e78.workers.dev';
    }
  }

  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jbb_auth_token');
}

function extractFriendlyErrorMessage(rawError: unknown): string {
  if (!rawError) return 'Terjadi kesalahan pada permintaan';

  if (typeof rawError === 'string') {
    const trimmed = rawError.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        return extractFriendlyErrorMessage(parsed);
      } catch {
        return rawError;
      }
    }
    return rawError;
  }

  if (Array.isArray(rawError)) {
    if (rawError.length > 0) {
      const first: unknown = rawError[0];
      if (
        first &&
        typeof first === 'object' &&
        'message' in first &&
        typeof (first as { message: unknown }).message === 'string'
      ) {
        return (first as { message: string }).message;
      }
      if (typeof first === 'string') {
        return first;
      }
    }
    return 'Data form tidak valid';
  }

  if (typeof rawError === 'object') {
    const obj = rawError as Record<string, unknown>;
    if (typeof obj.message === 'string') {
      return obj.message;
    }
    if (Array.isArray(obj.issues)) {
      return extractFriendlyErrorMessage(obj.issues);
    }
    if (obj.error) {
      return extractFriendlyErrorMessage(obj.error);
    }
  }

  return 'Terjadi kesalahan pada permintaan';
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const base = getApiBase();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const res = await fetch(`${base}${cleanEndpoint}`, {
      ...options,
      headers
    });

    const data = (await res.json()) as ApiResponse<T>;

    if (!res.ok || data.success === false) {
      const errorMessage = extractFriendlyErrorMessage(data?.error || data);

      return {
        success: false,
        error: {
          code: data?.error?.code || 'VALIDATION_ERROR',
          message: errorMessage,
          details: data?.error
        }
      };
    }

    return data;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Gagal terhubung ke server API';
    console.error(`API Error on [${endpoint}]:`, err);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: errorMessage
      }
    };
  }
}

export const api = {
  // Auth (Google OAuth Only)
  loginWithGoogle: (data: { credential: string }) =>
    request<{ token: string; user: UserProfile }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMe: () => request<UserProfile>('/api/auth/me'),

  updateProfile: (data: UpdateProfileInput) =>
    request<UserProfile>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  submitKyc: (data: SubmitKycInput) =>
    request<UserProfile>('/api/auth/kyc', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateBankPayout: (data: UpdateBankPayoutInput) =>
    request<UserProfile>('/api/auth/bank-payout', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Categories
  getCategories: () => request<Category[]>('/api/categories'),

  // Listings
  getListings: (params: ListingFilterParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.category) searchParams.set('category', params.category);
    if (params.condition) {
      if (Array.isArray(params.condition)) {
        for (const c of params.condition) {
          searchParams.append('condition', c);
        }
      } else {
        searchParams.set('condition', params.condition);
      }
    }
    if (params.minPrice !== undefined) searchParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) searchParams.set('maxPrice', params.maxPrice.toString());
    if (params.city) searchParams.set('city', params.city);
    if (params.isCod !== undefined) searchParams.set('isCod', params.isCod.toString());
    if (params.isNego !== undefined) searchParams.set('isNego', params.isNego.toString());
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.cursor) searchParams.set('cursor', params.cursor);

    const qs = searchParams.toString();
    return request<PaginatedList<Listing>>(`/api/listings${qs ? `?${qs}` : ''}`);
  },

  getFeaturedListings: () => request<Listing[]>('/api/listings/featured'),

  getListingDetail: (idOrSlug: string) => request<Listing>(`/api/listings/${idOrSlug}`),

  recordListingView: (idOrSlug: string) =>
    request<{ success: boolean }>(`/api/listings/${idOrSlug}/view`, {
      method: 'POST'
    }),

  getMyListings: () => request<Listing[]>('/api/listings/my'),

  updateListingStatus: (id: string, status: string) =>
    request<{ message: string }>(`/api/listings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  deleteListing: (id: string) =>
    request<{ message: string }>(`/api/listings/${id}`, {
      method: 'DELETE'
    }),

  recordView: (idOrSlug: string) =>
    request<{ viewCount: number }>(`/api/listings/${idOrSlug}/view`, {
      method: 'POST'
    }),

  createListing: (payload: CreateListingInput) =>
    request<Listing>('/api/listings', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateListing: (id: string, payload: UpdateListingInput) =>
    request<Listing>(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  // Offers
  makeOffer: (listingId: string, offeredPrice: number, message?: string) =>
    request<Offer>('/api/offers', {
      method: 'POST',
      body: JSON.stringify({
        listingId,
        offeredPrice,
        message
      } as MakeOfferInput)
    }),

  getReceivedOffers: () => request<Offer[]>('/api/offers/received'),
  getSentOffers: () => request<Offer[]>('/api/offers/sent'),

  respondOffer: (
    offerId: string,
    action: 'ACCEPT' | 'REJECT' | 'COUNTER',
    counterPrice?: number,
    counterMessage?: string
  ) =>
    request<Offer>(`/api/offers/${offerId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ offerId, action, counterPrice, counterMessage })
    }),

  // Orders / Escrow
  createOrder: (payload: CreateOrderInput) =>
    request<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getOrders: () => request<Order[]>('/api/orders'),
  getOrderDetail: (id: string) => request<Order>(`/api/orders/${id}`),

  updateShipping: (orderId: string, courierName: string, trackingNumber: string) =>
    request<Order>(`/api/orders/${orderId}/ship`, {
      method: 'PUT',
      body: JSON.stringify({ orderId, courierName, trackingNumber })
    }),

  confirmDelivered: (orderId: string) =>
    request<Order>(`/api/orders/${orderId}/deliver`, {
      method: 'PUT'
    }),

  completeOrder: (orderId: string) =>
    request<Order>(`/api/orders/${orderId}/complete`, {
      method: 'PUT'
    }),

  disputeOrder: (orderId: string, reason: string, evidenceUrls: string[]) =>
    request<Order>(`/api/orders/${orderId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ orderId, reason, evidenceUrls })
    }),

  // Reviews
  createReview: (payload: CreateReviewInput) =>
    request<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getSellerReviews: (sellerId: string) => request<Review[]>(`/api/reviews/seller/${sellerId}`),

  // Admin Portal Endpoints
  getAdminStats: () =>
    request<{
      escrowHoldingTotal: number;
      completedPayoutTotal: number;
      totalGmv: number;
      activeDisputesCount: number;
      pendingKycCount: number;
      totalUsersCount: number;
      totalListingsCount: number;
      activeListingsCount: number;
    }>('/api/admin/stats'),

  getAdminKycQueue: () =>
    request<
      Array<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        nik: string;
        ktpImageUrl: string;
        selfieImageUrl: string;
        isKycVerified: boolean;
        isRejected: boolean;
        trustScore: number;
        role: string;
        createdAt: string;
        kycSubmittedAt: string | null;
      }>
    >('/api/admin/kyc-queue'),

  approveKyc: (userId: string) =>
    request<{ id: string; isKycVerified: boolean; isRejected: boolean }>(
      `/api/admin/kyc/${userId}/approve`,
      {
        method: 'POST'
      }
    ),

  rejectKyc: (userId: string) =>
    request<{ id: string; isKycVerified: boolean; isRejected: boolean }>(
      `/api/admin/kyc/${userId}/reject`,
      {
        method: 'POST'
      }
    ),

  getAdminDisputes: () => request<Order[]>('/api/admin/disputes'),

  resolveDispute: (
    orderId: string,
    action: 'REFUND_BUYER' | 'RELEASE_TO_SELLER',
    adminNotes?: string
  ) =>
    request<{ orderId: string; action: string; status: string }>(
      `/api/admin/disputes/${orderId}/resolve`,
      {
        method: 'POST',
        body: JSON.stringify({ action, adminNotes })
      }
    ),

  getAdminPayouts: () =>
    request<
      Array<{
        id: string;
        orderId: string;
        orderNumber: string;
        listingTitle: string;
        amount: number;
        serviceFee: number;
        netAmount: number;
        payoutBank: string;
        payoutAccountNumber: string;
        payoutAccountHolder: string;
        sellerName: string;
        sellerPhone: string;
        readyAt: string;
        status: string;
        transferRef: string | null;
        completedAt: string | null;
      }>
    >('/api/admin/payouts'),

  disbursePayout: (payoutId: string) =>
    request<{ id: string; status: string }>(`/api/admin/payouts/${payoutId}/disburse`, {
      method: 'POST'
    }),

  batchDisbursePayouts: (payoutIds: string[]) =>
    request<{ disbursedCount: number }>('/api/admin/payouts/batch-disburse', {
      method: 'POST',
      body: JSON.stringify({ payoutIds })
    }),

  getAdminListings: () => request<Listing[]>('/api/admin/listings'),

  updateAdminListingStatus: (listingId: string, status: 'ACTIVE' | 'ARCHIVED' | 'SOLD') =>
    request<{ listingId: string; status: string }>(`/api/admin/listings/${listingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  // Cloudflare Storage / R2 Upload
  uploadImage: async (file: File): Promise<ApiResponse<{ url: string; key: string }>> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${getApiBase()}/api/uploads`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = (await res.json()) as ApiResponse<{
        url: string;
        key: string;
      }>;
      if (!res.ok || data.success === false) {
        return {
          success: false,
          error: {
            code: data?.error?.code || 'UPLOAD_FAILED',
            message:
              extractFriendlyErrorMessage(data?.error || data) || 'Gagal mengunggah foto barang'
          }
        };
      }
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengunggah foto barang';
      return {
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: errorMessage
        }
      };
    }
  },

  // Wishlist Database Endpoints
  getWishlist: () => request<Listing[]>('/api/wishlist'),
  toggleWishlist: (listingId: string) =>
    request<{ isWishlisted: boolean }>(`/api/wishlist/${listingId}/toggle`, {
      method: 'POST'
    }),
  removeFromWishlist: (listingId: string) =>
    request<{ success: boolean }>(`/api/wishlist/${listingId}`, {
      method: 'DELETE'
    }),
  clearWishlist: () =>
    request<{ success: boolean }>('/api/wishlist', {
      method: 'DELETE'
    })
};
