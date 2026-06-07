import { NextRequest, NextResponse } from 'next/server';

async function triggerDownload(downloadUrl: string) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error('[stock-download-trigger] UNSPLASH_ACCESS_KEY env variable is not set');
    throw new Error('Unsplash integration is unconfigured.');
  }

  const res = await fetch(downloadUrl, {
    method: 'GET',
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      'User-Agent': 'Alatify/1.0 (Stock Downloader; +https://getalatify.com)',
    },
  });

  if (!res.ok) {
    throw new Error(`Unsplash API download tracking responded with status ${res.status}`);
  }

  return await res.json();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const downloadUrl = searchParams.get('url');

  if (!downloadUrl) {
    return NextResponse.json({ error: 'Missing required parameter: url' }, { status: 400 });
  }

  try {
    const data = await triggerDownload(downloadUrl);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[stock-download-trigger] GET error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to trigger Unsplash download' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const downloadUrl = body.downloadLocation || body.url;

    if (!downloadUrl) {
      return NextResponse.json({ error: 'Missing required body field: downloadLocation or url' }, { status: 400 });
    }

    const data = await triggerDownload(downloadUrl);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[stock-download-trigger] POST error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to trigger Unsplash download' }, { status: 500 });
  }
}
