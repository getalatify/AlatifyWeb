import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Alatify — Privacy-First Image Tools';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Ambient Glows */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            left: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '500px',
            background: 'rgba(16, 185, 129, 0.08)',
            filter: 'blur(100px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            right: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '500px',
            background: 'rgba(16, 185, 129, 0.06)',
            filter: 'blur(100px)',
          }}
        />

        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <svg
            viewBox="0 0 100 100"
            style={{
              width: '48px',
              height: '48px',
            }}
          >
            <defs>
              <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5f5f5" />
                <stop offset="100%" stopColor="#a3a3a3" />
              </linearGradient>
              <linearGradient id="logo-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d4d4d4" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#525252" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path
              d="M50 8L86 28.8V71.2L50 92L14 71.2V28.8L50 8Z"
              stroke="url(#logo-grad-1)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M50 22L76 72H63L50 47L37 72H24L50 22Z"
              fill="url(#logo-grad-1)"
            />
            <path
              d="M40 52H60L50 32L40 52Z"
              fill="url(#logo-grad-2)"
            />
          </svg>
          <span
            style={{
              color: '#ffffff',
              fontSize: '32px',
              fontWeight: '800',
              letterSpacing: '-0.05em',
            }}
          >
            Alatify
          </span>
        </div>

        {/* Middle Content */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1, marginTop: '40px' }}>
          {/* Left Block */}
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '600px' }}>
            <h1
              style={{
                color: '#ffffff',
                fontSize: '56px',
                fontWeight: '900',
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: '-0.03em',
              }}
            >
              Privacy-First <span style={{ color: '#f5f5f5' }}>Image Tools</span>
            </h1>
            <p
              style={{
                color: '#9ca3af',
                fontSize: '20px',
                lineHeight: 1.5,
                marginTop: '20px',
                marginBottom: '0px',
              }}
            >
              Compress, resize, convert, crop, and remove backgrounds locally. Zero server uploads. Absolute confidentiality.
            </p>
          </div>

          {/* Right Block - Tools List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '380px' }}>
            {[
              { name: '⚡ Image Compressor', desc: 'Reduce file sizes up to 90%' },
              { name: '✨ Background Remover', desc: 'AI-powered local extraction' },
              { name: '📐 Image Resizer', desc: 'Scale by dimensions or presets' },
              { name: '🔄 Format Converter', desc: 'Convert PNG, JPG, WebP, SVG' },
              { name: '✂️ Image Cropper', desc: 'Free aspect ratios & locks' },
            ].map((t) => (
              <div
                key={t.name}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '12px 20px',
                }}
              >
                <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>{t.name}</span>
                <span style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>{t.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '32px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span style={{ color: '#f5f5f5', fontSize: '14px', fontWeight: '700' }}>✓ 100% Client-Side</span>
            <span style={{ color: '#f5f5f5', fontSize: '14px', fontWeight: '700' }}>✓ No Server Uploads</span>
            <span style={{ color: '#f5f5f5', fontSize: '14px', fontWeight: '700' }}>✓ Free & Unlimited</span>
          </div>
          <span style={{ color: '#4b5563', fontSize: '14px', fontWeight: '500' }}>getalatify.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
