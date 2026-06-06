import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { parseHTML } from 'linkedom';

const MAX_SIZE = 4 * 1024 * 1024; // 4MB (Vercel Hobby safe limit)
const FETCH_TIMEOUT = 8000; // 8 seconds

// Block requests to private/internal networks (SSRF prevention)
function isPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (process.env.ALATIFY_TEST === 'true') {
    if (['localhost', '127.0.0.1', '::1'].includes(lower)) return false;
  }
  
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

// Resolve relative URLs against base
function resolveUrl(src: string, baseUrl: URL): string {
  try {
    return new URL(src, baseUrl).toString();
  } catch {
    return src; // fallback to as-is
  }
}

// Extract Open Graph, Twitter Card, Schema, or image elements from HTML
function extractImageFromHtml(html: string, baseUrl: URL): string | null {
  try {
    const { document } = parseHTML(html);
    
    // Priority 1: Open Graph image (most reliable)
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    if (ogImage) return resolveUrl(ogImage, baseUrl);
    
    // Priority 1b: Open Graph image:secure_url
    const ogImageSecure = document.querySelector('meta[property="og:image:secure_url"]')?.getAttribute('content');
    if (ogImageSecure) return resolveUrl(ogImageSecure, baseUrl);
    
    // Priority 2: Twitter Card image
    const twitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
                      ?? document.querySelector('meta[name="twitter:image:src"]')?.getAttribute('content');
    if (twitterImage) return resolveUrl(twitterImage, baseUrl);
    
    // Priority 3: Schema.org image
    const schemaImage = document.querySelector('meta[itemprop="image"]')?.getAttribute('content');
    if (schemaImage) return resolveUrl(schemaImage, baseUrl);
    
    // Priority 4: link rel="image_src" (older convention)
    const linkImage = document.querySelector('link[rel="image_src"]')?.getAttribute('href');
    if (linkImage) return resolveUrl(linkImage, baseUrl);
    
    // Priority 5: First reasonable <img> tag (≥200px wide if specified, or no size info)
    const images = document.querySelectorAll('img');
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = img.getAttribute('src');
      if (!src) continue;
      
      // Skip tiny tracking pixels, icons
      const widthStr = img.getAttribute('width');
      const heightStr = img.getAttribute('height');
      const width = widthStr ? parseInt(widthStr, 10) : 0;
      const height = heightStr ? parseInt(heightStr, 10) : 0;
      
      if (width > 0 && width < 200) continue;
      if (height > 0 && height < 200) continue;
      
      // Skip data URLs and obvious icons
      if (src.startsWith('data:')) continue;
      if (src.match(/(icon|favicon|logo|sprite)/i)) continue;
      
      return resolveUrl(src, baseUrl);
    }
    
    return null;
  } catch (e) {
    console.error('[fetch-image] HTML parse error:', e);
    return null;
  }
}

// Recursive function to fetch and validate the image or parse webpage HTML
async function fetchAndReturnImage(url: string, depth: number): Promise<Response> {
  if (depth > 1) {
    return NextResponse.json({ 
      error: "Failed to resolve image. Too many redirects between pages and images." 
    }, { status: 400 });
  }
  
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ 
      error: "This doesn't look like a valid URL. URLs should start with https:// and point to an image file (like .jpg, .png, .webp)." 
    }, { status: 400 });
  }
  
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return NextResponse.json({ 
      error: "Only HTTP and HTTPS URLs are supported. Direct image links look like: https://images.example.com/photo.jpg" 
    }, { status: 400 });
  }
  
  if (isPrivateHost(parsedUrl.hostname)) {
    return NextResponse.json({ 
      error: "Internal network URLs are not allowed for security reasons." 
    }, { status: 403 });
  }

  const hostnameLower = parsedUrl.hostname.toLowerCase();
  if (
    hostnameLower.includes('pinterest.com') ||
    hostnameLower.includes('pinimg.com') ||
    hostnameLower.includes('instagram.com') ||
    hostnameLower.includes('cdninstagram.com') ||
    hostnameLower.includes('facebook.com') ||
    hostnameLower.includes('fbcdn.net')
  ) {
    return NextResponse.json({ 
      error: "This website blocks external image access (common with Pinterest, Instagram, Facebook). Please download the image and use the Upload File tab." 
    }, { status: 502 });
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Alatify/1.0 (Image Fetcher; +https://getalatify.com)',
        'Accept': 'text/html,image/*',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      redirect: 'follow',
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ 
          error: "This image requires login or is protected from external access. Try downloading the image and uploading it directly instead." 
        }, { status: 502 });
      }
      if (response.status === 403) {
        return NextResponse.json({ 
          error: "This website blocks external image access (common with Pinterest, Instagram, Facebook). Please download the image and use the Upload File tab." 
        }, { status: 502 });
      }
      if (response.status === 404) {
        return NextResponse.json({ 
          error: "Image not found at this URL. The link may have expired or been removed." 
        }, { status: 502 });
      }
      return NextResponse.json({ 
        error: "Failed to fetch image. The URL might be incorrect, the server is down, or the source blocks external access." 
      }, { status: 502 });
    }
    
    const contentType = response.headers.get('content-type') || '';
    const cleanContentType = contentType.toLowerCase().split(';')[0].trim();
    
    // Check for SVG reject
    if (cleanContentType === 'image/svg+xml') {
      return NextResponse.json({ 
        error: 'SVG files are not supported via URL for security reasons. Please upload SVG files directly.' 
      }, { status: 400 });
    }
    
    const isUnknownOrOctetStream = 
      !cleanContentType || 
      cleanContentType === 'application/octet-stream' || 
      cleanContentType === 'binary/octet-stream';

    // 1. IMAGE PATH (Fast path)
    if (cleanContentType.startsWith('image/') || isUnknownOrOctetStream) {
      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
      if (contentLength > MAX_SIZE) {
        return NextResponse.json({ 
          error: "Image is too large (over 4MB). Try a smaller resolution or compress the source image first." 
        }, { status: 413 });
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      if (arrayBuffer.byteLength > MAX_SIZE) {
        return NextResponse.json({ 
          error: "Image is too large (over 4MB). Try a smaller resolution or compress the source image first." 
        }, { status: 413 });
      }

      let finalContentType = cleanContentType;
      if (isUnknownOrOctetStream) {
        const detected = detectImageType(arrayBuffer);
        if (detected) {
          finalContentType = detected;
        } else {
          return NextResponse.json({ 
            error: "This URL doesn't point to an image directly. It might be a webpage URL. To get the direct image URL: right-click on the image → 'Copy Image Address' (not 'Copy Link Address')." 
          }, { status: 400 });
        }
      }

      // Re-verify that detected format is not SVG
      if (finalContentType.toLowerCase().split(';')[0].trim() === 'image/svg+xml') {
        return NextResponse.json({ 
          error: 'SVG files are not supported via URL for security reasons. Please upload SVG files directly.' 
        }, { status: 400 });
      }
      
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': finalContentType,
          'Content-Length': arrayBuffer.byteLength.toString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    // 2. HTML PATH (New parsing path)
    if (cleanContentType.includes('text/html')) {
      const html = await response.text();
      
      // Size check on HTML (don't parse huge pages)
      if (html.length > 2 * 1024 * 1024) {  // 2MB HTML cap
        return NextResponse.json({ 
          error: "Webpage is too large to scan for images. Try the direct image URL instead." 
        }, { status: 413 });
      }
      
      const imageUrl = extractImageFromHtml(html, parsedUrl);
      
      if (!imageUrl) {
        return NextResponse.json({ 
          error: "No image found on this webpage. The page might not have a preview image, or images are loaded dynamically. Try right-clicking the image and selecting 'Copy Image Address'." 
        }, { status: 400 });
      }
      
      // Recursive fetch with validation, incrementing depth
      return fetchAndReturnImage(imageUrl, depth + 1);
    }

    // Otherwise, reject
    return NextResponse.json({ 
      error: "This URL doesn't point to an image directly. It might be a webpage URL. To get the direct image URL: right-click on the image → 'Copy Image Address' (not 'Copy Link Address')." 
    }, { status: 400 });
    
  } catch (error) {
    const errorName = error instanceof Error ? error.name : '';
    if (errorName === 'TimeoutError' || errorName === 'AbortError') {
      return NextResponse.json({ 
        error: "Request timed out. The image source may be slow or unreachable. Try a different image URL." 
      }, { status: 504 });
    }
    return NextResponse.json({ 
      error: "Failed to fetch image. The URL might be incorrect, the server is down, or the source blocks external access." 
    }, { status: 500 });
  }
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
      return NextResponse.json({ 
        error: "This doesn't look like a valid URL. URLs should start with https:// and point to an image file (like .jpg, .png, .webp)." 
      }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ 
      error: "This doesn't look like a valid URL. URLs should start with https:// and point to an image file (like .jpg, .png, .webp)." 
    }, { status: 400 });
  }

  return fetchAndReturnImage(url.trim(), 0);
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
