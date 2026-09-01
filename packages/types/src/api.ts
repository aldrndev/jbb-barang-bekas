export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedList<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    nextCursor?: string | null;
  };
}

export interface ListingFilterParams {
  q?: string;
  category?: string;
  condition?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  province?: string;
  isCod?: boolean;
  isNego?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  limit?: number;
  cursor?: string;
}
