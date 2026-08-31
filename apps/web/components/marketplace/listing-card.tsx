'use client';

import React from 'react';
import Link from 'next/link';
import type { Listing } from '@jbb/types';
import { formatIDR, formatTimeAgo } from '../../lib/utils';
import { ConditionBadge } from './condition-badge';
import { MapPin, ShieldCheck, Star, Zap, MessageSquareQuote } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const primaryImage = listing.images.find((img) => img.isPrimary)?.url || listing.images[0]?.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

  const discountPercent = listing.originalPrice
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : null;

  return (
    <Link
      href={`/listing/${listing.slug || listing.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-slate-200/80 bg-surface-card shadow-subtle-card hover:border-slate-300 hover:shadow-elevated-card transition-all duration-200"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <ConditionBadge condition={listing.condition} size="sm" />
        </div>

        {listing.isNegotiable && (
          <div className="absolute top-2.5 right-2.5 z-10 rounded-badge bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-deal-400 backdrop-blur-sm shadow-xs flex items-center gap-1">
            <MessageSquareQuote className="h-3 w-3" />
            <span>Bisa Nego</span>
          </div>
        )}

        {/* COD Pill at bottom of image */}
        {listing.isCodAvailable && (
          <div className="absolute bottom-2 left-2 z-10 rounded-badge bg-brand-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs flex items-center gap-0.5">
            <Zap className="h-2.5 w-2.5" />
            <span>Siap COD</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-3.5">
        {/* Title */}
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
          {listing.title}
        </h3>

        {/* Price & Discount */}
        <div className="mt-2.5">
          <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {formatIDR(listing.price)}
          </div>
          {listing.originalPrice && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="line-through">{formatIDR(listing.originalPrice)}</span>
              {discountPercent && (
                <span className="font-bold text-rose-500 bg-rose-50 px-1 rounded">
                  Hemat {discountPercent}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Location & Time */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[65%]">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">{listing.city}</span>
          </div>
          <span className="text-[10px] text-slate-400 shrink-0">
            {formatTimeAgo(listing.createdAt)}
          </span>
        </div>

        {/* Seller Info */}
        {listing.seller && (
          <div className="mt-2 flex items-center justify-between text-[11px] bg-slate-50 rounded-xl px-2.5 py-1.5">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-slate-700 truncate">{listing.seller.name.split(' ')[0]}</span>
              {listing.seller.isKycVerified && (
                <ShieldCheck className="h-3 w-3 text-brand-600 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 font-bold text-deal-600">
              <Star className="h-3 w-3 fill-deal-400 text-deal-400" />
              <span>{listing.seller.ratingAverage}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
