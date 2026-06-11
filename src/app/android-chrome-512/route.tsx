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
          background: '#0a0a0a',
          padding: '70px',
        }}
      >
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }} fill="none">
          <path
            d="M15 87 L50 13 L85 87"
            stroke="#f5f5f5"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="miter"
          />
          <path
            d="M28 63 L72 63"
            stroke="#f5f5f5"
            strokeWidth="9"
            strokeLinecap="round"
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
