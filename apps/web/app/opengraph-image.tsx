import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Belanjanya - Jual Beli Barang Bekas Terpercaya Indonesia';
export const size = {
  width: 1200,
  height: 630
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px 80px',
        background: 'linear-gradient(145deg, #064e3b 0%, #022c22 60%, #0f172a 100%)',
        color: 'white',
        fontFamily: 'sans-serif',
        position: 'relative'
      }}
    >
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #0f172a 0%, #022c22 60%, #021a14 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <svg viewBox="0 0 200 200" style={{ width: '80%', height: '80%' }} fill="none">
            <path
              d="M62 48 H104 C120 48 134 58 134 74 C134 90 120 100 104 100 H62 Z"
              stroke="#10b981"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M62 100 H108 C126 100 140 112 140 128 C140 144 126 154 108 154 H62 Z"
              stroke="#10b981"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M62 44 V158" stroke="#10b981" strokeWidth="20" strokeLinecap="round" />
            <circle cx="62" cy="74" r="7" fill="#06B6D4" />
            <circle cx="104" cy="74" r="4" fill="#34D399" opacity="0.8" />
            <circle cx="108" cy="128" r="4" fill="#34D399" opacity="0.8" />
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Belanjanya
          </span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            Jual Beli Barang Bekas
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '850px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '6px 16px',
            borderRadius: '999px',
            width: 'fit-content',
            fontSize: '14px',
            fontWeight: 800,
            color: '#34d399'
          }}
        >
          ✓ Garansi Perlindungan 48 Jam & Inspeksi Fisik Transparan
        </div>
        <h1
          style={{
            fontSize: '56px',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            margin: 0,
            color: '#f8fafc'
          }}
        >
          Pasar Barang Bekas Berkualitas & Terpercaya Indonesia
        </h1>
        <p style={{ fontSize: '20px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
          Beli gadget, laptop, dan barang second dengan dana tertahan aman sampai barang dicek
          sesuai deskripsi.
        </p>
      </div>

      {/* Footer info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '24px'
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#34d399' }}>belanjanya.id</span>
        <span style={{ fontSize: '14px', color: '#64748b' }}>
          Belanjanya • Part of Digitesia Edge Digital
        </span>
      </div>
    </div>,
    {
      ...size
    }
  );
}
