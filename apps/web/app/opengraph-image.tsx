import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Bekasin - Jual Beli Barang Bekas Terpercaya Indonesia';
export const size = {
  width: 1200,
  height: 630
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
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
            <svg
              viewBox="0 0 200 200"
              style={{ width: '80%', height: '80%' }}
              fill="none"
            >
              <path
                d="M62 46 H112 C132 46 148 62 148 82 C148 102 132 118 112 118 H62 Z"
                stroke="#10b981"
                strokeWidth="22"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em' }}>
              Peygo
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
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
            ✓ Garansi Rekber 48 Jam & Inspeksi Fisik Transparan
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
            Beli gadget, laptop, dan barang second dengan dana tertahan aman sampai barang dicek sesuai deskripsi.
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
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#34d399' }}>
            peygo.id
          </span>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            PT Peygo Rekber Indonesia
          </span>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
