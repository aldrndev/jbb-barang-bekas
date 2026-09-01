'use client';

import Link from 'next/link';
import { useId } from 'react';

interface PeygoLogoIconProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
}

export function PeygoLogoIcon({ className = '', size = 'md' }: PeygoLogoIconProps) {
  const uniqueId = useId().replace(/:/g, '');
  const gradId = `peygoGrad_${uniqueId}`;
  const bgGradId = `peygoBgGrad_${uniqueId}`;

  const sizeMap = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-14 w-14'
  };

  const dimensionClass =
    typeof size === 'number' ? `h-[${size}px] w-[${size}px]` : sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${dimensionClass} ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-300"
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="40"
            y1="30"
            x2="160"
            y2="170"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
          <linearGradient
            id={bgGradId}
            x1="0"
            y1="0"
            x2="200"
            y2="200"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="50%" stopColor="#022C22" />
            <stop offset="100%" stopColor="#021A14" />
          </linearGradient>
        </defs>

        {/* 1. Sleek Squircle Container */}
        <rect width="200" height="200" rx="54" fill={`url(#${bgGradId})`} />
        <rect
          x="5"
          y="5"
          width="190"
          height="190"
          rx="49"
          stroke="#10B981"
          strokeOpacity="0.25"
          strokeWidth="2.5"
        />

        {/* 2. Top 'P' Loop */}
        <path
          d="M64 44 H110 C130 44 146 60 146 80 C146 100 130 116 110 116 H64"
          stroke={`url(#${gradId})`}
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3. Left 'P' Spine */}
        <path d="M64 44 V156" stroke={`url(#${gradId})`} strokeWidth="22" strokeLinecap="round" />

        {/* 4. Glowing Cyan & Emerald Accents */}
        <circle cx="64" cy="80" r="7" fill="#06B6D4" />
        <circle cx="110" cy="80" r="4" fill="#34D399" opacity="0.9" />
      </svg>
    </div>
  );
}

interface PeygoLogoProps {
  href?: string;
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PeygoLogo({
  href = '/',
  showSubtitle = true,
  size = 'md',
  className = ''
}: PeygoLogoProps) {
  const iconSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
  const textClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const subtitleClass = size === 'sm' ? 'text-[9px]' : 'text-[10px]';

  const content = (
    <div className={`flex items-center gap-2.5 shrink-0 group ${className}`}>
      <PeygoLogoIcon size={iconSize} className="group-hover:scale-105 transition-transform" />
      <div>
        <span className={`${textClass} font-black tracking-tight leading-none block`}>
          <span className="text-slate-900">Pey</span>
          <span className="bg-linear-to-r from-brand-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            go
          </span>
        </span>
        {showSubtitle && (
          <span
            className={`${subtitleClass} font-bold text-slate-400 uppercase tracking-wider block mt-0.5 group-hover:text-slate-600 transition-colors`}
          >
            Jual Beli Barang Bekas
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
