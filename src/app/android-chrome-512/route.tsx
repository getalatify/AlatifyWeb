import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0F19',
          padding: '64px',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <defs>
            <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="logo-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.2" />
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
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
