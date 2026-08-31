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
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-2xs hover:border-brand-500/30 hover:shadow-md transition-all duration-200"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-50/80">
        <img
          src={primaryImage}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <ConditionBadge condition={listing.condition} size="sm" />
        </div>

        {listing.isNegotiable && (
          <div className="absolute top-2.5 right-2.5 z-10 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200/80 backdrop-blur-md shadow-2xs flex items-center gap-1">
            <MessageSquareQuote className="h-3 w-3 text-amber-600" />
            <span>Nego</span>
          </div>
        )}

        {/* COD Pill at bottom of image */}
        {listing.isCodAvailable && (
          <div className="absolute bottom-2 left-2 z-10 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold text-brand-700 border border-brand-200/80 backdrop-blur-md shadow-2xs flex items-center gap-1">
            <Zap className="h-2.5 w-2.5 text-brand-600" />
            <span>Siap COD</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
          {listing.title}
        </h3>

        {/* Price & Savings */}
        <div className="mt-2.5 flex items-baseline justify-between gap-1 flex-wrap">
          <div className="text-base sm:text-lg font-black text-slate-900">
            {formatIDR(listing.price)}
          </div>
          {discountPercent && (
            <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 border border-rose-100">
              Hemat {discountPercent}%
            </span>
          )}
        </div>

        {/* Seller Info & Location Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100/80 pt-2.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[120px]">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">{listing.city}</span>
          </div>

          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-600 shrink-0" />
            <span>Rekber</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
