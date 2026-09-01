import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 180,
  height: 180
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #022c22 60%, #021a14 100%)',
          borderRadius: '44px',
          position: 'relative'
        }}
      >
        <svg
          viewBox="0 0 200 200"
          style={{ width: '80%', height: '80%' }}
          fill="none"
        >
          {/* Top Loop */}
          <path
            d="M62 46 H112 C132 46 148 62 148 82 C148 102 132 118 112 118 H62 Z"
            stroke="#10b981"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Left Spine */}
          <path
            d="M62 46 V158"
            stroke="#10b981"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <circle cx="62" cy="82" r="9" fill="#06B6D4" />
          <circle cx="112" cy="82" r="5" fill="#34D399" opacity="0.8" />
        </svg>
      </div>
    ),
    {
      ...size
    }
  );
}
