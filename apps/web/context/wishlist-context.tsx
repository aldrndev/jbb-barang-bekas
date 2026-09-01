'use client';

import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Listing } from '@jbb/types';
import { useAuth } from './auth-context';
import { api } from '../lib/api-client';

interface WishlistContextType {
  wishlistItems: Listing[];
  wishlistCount: number;
  isLoading: boolean;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (listing: Listing) => Promise<boolean>;
  removeFromWishlist: (id: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, openAuthModal } = useAuth();
  const queryClient = useQueryClient();

  // Fetch live wishlist directly from Database/API when user is authenticated
  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await api.getWishlist();
      if (res.success && res.data) {
        return res.data;
      }
      return [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const wishlistItems: Listing[] = user && Array.isArray(wishlistData) ? wishlistData : [];
  const wishlistCount = wishlistItems.length;

  const isWishlisted = (id: string): boolean => {
    if (!user) return false;
    return wishlistItems.some((item) => item.id === id);
  };

  // Toggle Wishlist Mutation with instant Optimistic Updates
  const toggleMutation = useMutation({
    mutationFn: async (listing: Listing) => {
      const res = await api.toggleWishlist(listing.id);
      return { listing, isWishlisted: res.data?.isWishlisted ?? false };
    },
    onMutate: async (listing: Listing) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist', user?.id] });
      const previousWishlist = queryClient.getQueryData<Listing[]>(['wishlist', user?.id]) || [];
      const exists = previousWishlist.some((item) => item.id === listing.id);

      const nextWishlist = exists
        ? previousWishlist.filter((item) => item.id !== listing.id)
        : [listing, ...previousWishlist];

      queryClient.setQueryData(['wishlist', user?.id], nextWishlist);

      return { previousWishlist };
    },
    onError: (_err, _listing, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist', user?.id], context?.previousWishlist);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
    }
  });

  // Remove Mutation with Optimistic Updates
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.removeFromWishlist(id);
      return id;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist', user?.id] });
      const previousWishlist = queryClient.getQueryData<Listing[]>(['wishlist', user?.id]) || [];
      queryClient.setQueryData(
        ['wishlist', user?.id],
        previousWishlist.filter((item) => item.id !== id)
      );
      return { previousWishlist };
    },
    onError: (_err, _id, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist', user?.id], context?.previousWishlist);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
    }
  });

  // Clear Mutation with Optimistic Updates
  const clearMutation = useMutation({
    mutationFn: async () => {
      await api.clearWishlist();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['wishlist', user?.id] });
      const previousWishlist = queryClient.getQueryData<Listing[]>(['wishlist', user?.id]) || [];
      queryClient.setQueryData(['wishlist', user?.id], []);
      return { previousWishlist };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist', user?.id], context?.previousWishlist);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
    }
  });

  const toggleWishlist = async (listing: Listing): Promise<boolean> => {
    if (!user) {
      openAuthModal();
      return false;
    }
    const exists = wishlistItems.some((item) => item.id === listing.id);
    await toggleMutation.mutateAsync(listing);
    return !exists;
  };

  const removeFromWishlist = async (id: string): Promise<void> => {
    if (!user) return;
    await removeMutation.mutateAsync(id);
  };

  const clearWishlist = async (): Promise<void> => {
    if (!user) return;
    await clearMutation.mutateAsync();
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        isLoading,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

