import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

const MAX_SIZE = 4 * 1024 * 1024; // 4MB (Vercel Hobby safe limit)
const FETCH_TIMEOUT = 8000; // 8 seconds

// Block requests to private/internal networks (SSRF prevention)
function isPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  
  if (['localhost', '0.0.0.0'].includes(lower)) return true;
  if (/^127\./.test(hostname)) return true;
  if (/^10\./.test(hostname)) return true;
  if (/^192\.168\./.test(hostname)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname)) return true;
  if (/^169\.254\./.test(hostname)) return true;
  
  if (lower === '::1') return true;
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
  if (lower.startsWith('fe80')) return true;
  if (lower === '169.254.169.254') return true;
  
  return false;
}

// Magic number check on first 12 bytes of response
function detectImageType(buffer: ArrayBuffer): string | null {
  const arr = new Uint8Array(buffer);
  if (arr.length < 3) return null;

  // 1. JPEG Check: FF D8 FF
  if (arr[0] === 0xff && arr[1] === 0xd8 && arr[2] === 0xff) {
    return 'image/jpeg';
  }

  // 2. PNG Check: 89 50 4E 47 0D 0A 1A 0A
  if (
    arr.length >= 8 &&
    arr[0] === 0x89 &&
    arr[1] === 0x50 &&
    arr[2] === 0x4e &&
    arr[3] === 0x47 &&
    arr[4] === 0x0d &&
    arr[5] === 0x0a &&
    arr[6] === 0x1a &&
    arr[7] === 0x0a
  ) {
    return 'image/png';
  }

  // 3. GIF Check: 47 49 46 38 (GIF8)
  if (arr.length >= 4 && arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x38) {
    return 'image/gif';
  }

  // 4. WebP Check: 52 49 46 46 (RIFF) at start and 57 45 42 50 (WEBP) at bytes 8-11
  if (
    arr.length >= 12 &&
    arr[0] === 0x52 &&
    arr[1] === 0x49 &&
    arr[2] === 0x46 &&
    arr[3] === 0x46 &&
    arr[8] === 0x57 &&
    arr[9] === 0x45 &&
    arr[10] === 0x42 &&
    arr[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() 
        || req.headers.get('x-real-ip') 
        || 'unknown';

  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ 
      error: 'Too many requests. Please wait a few minutes and try again.' 
    }, { status: 429 });
  }

  let url: string;
  try {
    const body = await req.json();
    url = body.url;
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid URL' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }
  
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return NextResponse.json({ 
      error: 'Only HTTP and HTTPS URLs are supported' 
    }, { status: 400 });
  }
  
  if (isPrivateHost(parsedUrl.hostname)) {
    return NextResponse.json({ 
      error: 'Internal or private URLs are not allowed' 
    }, { status: 403 });
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Alatify/1.0 (Image Fetcher; +https://getalatify.com)',
        'Accept': 'image/*',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      redirect: 'follow',
    });
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: `Failed to fetch image (status ${response.status})` 
      }, { status: 502 });
    }
    
    let contentType = response.headers.get('content-type') || '';
    const cleanContentType = contentType.toLowerCase().split(';')[0].trim();
    
    // Check for SVG reject (Option a)
    if (cleanContentType === 'image/svg+xml') {
      return NextResponse.json({ 
        error: 'SVG files are not supported via URL for security reasons. Please upload SVG files directly.' 
      }, { status: 400 });
    }
    
    const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
    if (contentLength > MAX_SIZE) {
      return NextResponse.json({ 
        error: `Image too large. Maximum ${Math.round(MAX_SIZE / 1024 / 1024)}MB allowed.` 
      }, { status: 413 });
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    if (arrayBuffer.byteLength > MAX_SIZE) {
      return NextResponse.json({ 
        error: `Image too large. Maximum ${Math.round(MAX_SIZE / 1024 / 1024)}MB allowed.` 
      }, { status: 413 });
    }

    const isUnknownOrOctetStream = 
      !cleanContentType || 
      cleanContentType === 'application/octet-stream' || 
      cleanContentType === 'binary/octet-stream';

    if (isUnknownOrOctetStream) {
      const detected = detectImageType(arrayBuffer);
      if (detected) {
        contentType = detected;
      } else {
        return NextResponse.json({ 
          error: 'URL points to an unsupported or invalid image file format' 
        }, { status: 400 });
      }
    } else if (!cleanContentType.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'URL does not point to an image' 
      }, { status: 400 });
    }

    // Re-verify that detected format is not SVG
    if (contentType.toLowerCase().split(';')[0].trim() === 'image/svg+xml') {
      return NextResponse.json({ 
        error: 'SVG files are not supported via URL for security reasons. Please upload SVG files directly.' 
      }, { status: 400 });
    }
    
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': arrayBuffer.byteLength.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
    
  } catch (error) {
    const errorName = error instanceof Error ? error.name : '';
    if (errorName === 'TimeoutError' || errorName === 'AbortError') {
      return NextResponse.json({ 
        error: 'Request timed out. Try a different URL.' 
      }, { status: 504 });
    }
    return NextResponse.json({ 
      error: 'Failed to fetch image. Check the URL and try again.' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
