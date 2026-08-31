'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Listing } from '@jbb/types';

interface WishlistContextType {
  wishlistItems: Listing[];
  wishlistCount: number;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (listing: Listing) => boolean; // returns new isWishlisted state
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<Listing[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jbb_wishlist_items');
      if (saved) {
        setWishlistItems(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('jbb_wishlist_items', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isLoaded]);

  const isWishlisted = (id: string): boolean => {
    return wishlistItems.some((item) => item.id === id);
  };

  const toggleWishlist = (listing: Listing): boolean => {
    let nowWishlisted = false;
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === listing.id);
      if (exists) {
        nowWishlisted = false;
        return prev.filter((item) => item.id !== listing.id);
      } else {
        nowWishlisted = true;
        return [listing, ...prev];
      }
    });
    return nowWishlisted;
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
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
