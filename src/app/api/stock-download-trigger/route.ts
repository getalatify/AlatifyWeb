import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const downloadUrl = searchParams.get('url');

  if (!downloadUrl) {
    return NextResponse.json({ error: 'Missing required parameter: url' }, { status: 400 });
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error('[stock-download-trigger] UNSPLASH_ACCESS_KEY env variable is not set');
    return NextResponse.json({ error: 'Unsplash integration is unconfigured.' }, { status: 500 });
  }

  try {
    const res = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'User-Agent': 'Alatify/1.0 (Stock Downloader; +https://getalatify.com)',
      },
    });

    if (!res.ok) {
      console.error(`[stock-download-trigger] Unsplash download API responded with ${res.status}`);
      return NextResponse.json({ error: 'Unsplash API call failed.' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[stock-download-trigger] Fetch error:', err);
    return NextResponse.json({ error: 'Failed to trigger Unsplash download' }, { status: 500 });
  }
}
