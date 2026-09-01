import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 32,
  height: 32
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #022c22 100%)',
        borderRadius: '8px',
        position: 'relative'
      }}
    >
      <svg viewBox="0 0 200 200" style={{ width: '85%', height: '85%' }} fill="none">
        {/* Top Loop */}
        <path
          d="M64 44 H110 C130 44 146 60 146 80 C146 100 130 116 110 116 H64"
          stroke="#10b981"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Spine */}
        <path d="M64 44 V156" stroke="#10b981" strokeWidth="24" strokeLinecap="round" />
      </svg>
    </div>,
    {
      ...size
    }
  );
}
