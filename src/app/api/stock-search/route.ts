import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export interface StockImage {
  id: string;
  provider: 'unsplash' | 'pexels' | 'pixabay';
  thumbnailUrl: string;
  previewUrl: string;
  fullUrl: string;
  width: number;
  height: number;
  photographer: {
    name: string;
    profileUrl: string;
  };
  sourceUrl: string;
  downloadTriggerUrl?: string;
  altText: string;
  // Content type of this result. Photos come from any provider; illustrations
  // and vectors are Pixabay-only.
  contentType: 'photo' | 'illustration' | 'vector';
  // True vector/SVG source URL, if the Pixabay account has full API access.
  // Omitted for standard accounts (only raster previews are returned then).
  vectorSourceUrl?: string;
}

interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  description?: string;
  alt_description?: string;
  urls: {
    small: string;
    thumb: string;
    regular: string;
    full: string;
    raw: string;
  };
  links: {
    html: string;
    download_location: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  src: {
    medium: string;
    large2x?: string;
    large: string;
    original: string;
  };
  photographer: string;
  photographer_url: string;
  alt?: string;
}

interface PixabayHit {
  id: number;
  type?: string;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  user: string;
  user_id: number;
  pageURL: string;
  tags?: string;
  // Only present when the account has full API access approval. For vectors,
  // this is the true SVG resource; otherwise omitted.
  vectorURL?: string;
}

// In-Memory Cache for Pixabay (24 hours TTL)
const pixabayCache = new Map<string, { timestamp: number; data: StockImage[] }>();
const PIXABAY_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Helper to clean query strings for caching keying.
// IMPORTANT: the key includes imageType so "cat" photos, illustrations, and
// vectors are cached separately and never collide.
function getPixabayCacheKey(query: string, page: number, orientation: string, imageType: string): string {
  return `${query.toLowerCase().trim()}_p${page}_o${orientation}_t${imageType}`;
}

export async function GET(req: NextRequest) {
  // 1. IP Rate Limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
        || req.headers.get('x-real-ip')
        || 'unknown';

  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({
      error: 'Too many requests. Please wait a few minutes and try again.'
    }, { status: 429 });
  }

  // 2. Parse Query Params
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';
  const provider = (searchParams.get('provider') || 'all') as 'unsplash' | 'pexels' | 'pixabay' | 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const orientation = (searchParams.get('orientation') || 'all') as 'all' | 'landscape' | 'portrait' | 'square';

  // Content type determines which providers are queried and the Pixabay
  // image_type. Photos = all providers; illustrations/vectors = Pixabay only.
  const rawContentType = searchParams.get('contentType') || 'photo';
  const contentType = (['photo', 'illustration', 'vector'].includes(rawContentType)
    ? rawContentType
    : 'photo') as 'photo' | 'illustration' | 'vector';
  const pixabayImageType = contentType;

  if (!query.trim()) {
    return NextResponse.json({ results: [], page, hasMore: false });
  }

  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const pexelsKey = process.env.PEXELS_API_KEY;
  const pixabayKey = process.env.PIXABAY_API_KEY;

  // 3. Helper Fetch Functions per Provider
  const fetchUnsplash = async (limit: number): Promise<StockImage[]> => {
    if (!unsplashKey) return [];

    let orientationParam = '';
    if (orientation === 'landscape') orientationParam = '&orientation=landscape';
    else if (orientation === 'portrait') orientationParam = '&orientation=portrait';
    else if (orientation === 'square') orientationParam = '&orientation=squarish';

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${limit}${orientationParam}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${unsplashKey}`,
      },
    });

    if (!response.ok) {
      console.error(`Unsplash API search error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const results: UnsplashPhoto[] = data.results || [];

    return results.map((item): StockImage => ({
      id: `unsplash_${item.id}`,
      provider: 'unsplash',
      thumbnailUrl: item.urls.small || item.urls.thumb,
      previewUrl: item.urls.regular,
      fullUrl: item.urls.full || item.urls.raw,
      width: item.width,
      height: item.height,
      photographer: {
        name: item.user.name,
        profileUrl: item.user.links.html,
      },
      sourceUrl: item.links.html,
      downloadTriggerUrl: item.links.download_location,
      altText: item.alt_description || item.description || 'Stock photo from Unsplash',
      contentType: 'photo',
    }));
  };

  const fetchPexels = async (limit: number): Promise<StockImage[]> => {
    if (!pexelsKey) return [];

    let orientationParam = '';
    if (orientation !== 'all') {
      orientationParam = `&orientation=${orientation}`;
    }

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${limit}${orientationParam}`;

    const response = await fetch(url, {
      headers: {
        Authorization: pexelsKey,
      },
    });

    if (!response.ok) {
      console.error(`Pexels API search error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const photos: PexelsPhoto[] = data.photos || [];

    return photos.map((item): StockImage => ({
      id: `pexels_${item.id}`,
      provider: 'pexels',
      thumbnailUrl: item.src.medium,
      previewUrl: item.src.large2x || item.src.large,
      fullUrl: item.src.original,
      width: item.width,
      height: item.height,
      photographer: {
        name: item.photographer,
        profileUrl: item.photographer_url,
      },
      sourceUrl: item.url,
      altText: item.alt || 'Stock photo from Pexels',
      contentType: 'photo',
    }));
  };

  const fetchPixabay = async (limit: number): Promise<StockImage[]> => {
    if (!pixabayKey) return [];

    // Check cache first. Key includes imageType so photo/illustration/vector
    // results for the same query are cached separately (no collision).
    const cacheKey = getPixabayCacheKey(query, page, orientation, pixabayImageType);
    const cached = pixabayCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp < PIXABAY_CACHE_TTL)) {
      console.log(`[Pixabay Cache Hit] Serving query: ${query} (page: ${page}, type: ${pixabayImageType})`);
      return cached.data;
    }

    let orientationParam = '';
    if (orientation === 'landscape') orientationParam = '&orientation=horizontal';
    else if (orientation === 'portrait') orientationParam = '&orientation=vertical';

    const url = `https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(query)}&page=${page}&per_page=${limit}&image_type=${pixabayImageType}${orientationParam}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Pixabay API search error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const hits: PixabayHit[] = data.hits || [];

    const normalized: StockImage[] = hits.map((item): StockImage => ({
      id: `pixabay_${item.id}`,
      provider: 'pixabay',
      thumbnailUrl: item.previewURL || item.webformatURL,
      previewUrl: item.largeImageURL || item.webformatURL,
      fullUrl: item.largeImageURL,
      width: item.imageWidth,
      height: item.imageHeight,
      photographer: {
        name: item.user,
        profileUrl: `https://pixabay.com/users/${item.user}-${item.user_id}/`,
      },
      sourceUrl: item.pageURL,
      altText: item.tags || `Stock ${contentType} from Pixabay`,
      contentType,
      // Present only with full API access; lets us surface an SVG download later.
      vectorSourceUrl: item.vectorURL || undefined,
    }));

    pixabayCache.set(cacheKey, { timestamp: now, data: normalized });
    return normalized;
  };

  // 4. Fetch and Interleave
  try {
    // Illustrations & vectors are Pixabay-only (Unsplash/Pexels are photo-only).
    // Force a Pixabay-only search regardless of the selected provider.
    if (contentType !== 'photo') {
      const results = await fetchPixabay(30);
      return NextResponse.json({
        results,
        page,
        hasMore: results.length === 30,
      });
    }

    if (provider === 'unsplash') {
      const results = await fetchUnsplash(30);
      return NextResponse.json({
        results,
        page,
        hasMore: results.length === 30,
      });
    }

    if (provider === 'pexels') {
      const results = await fetchPexels(30);
      return NextResponse.json({
        results,
        page,
        hasMore: results.length === 30,
      });
    }

    if (provider === 'pixabay') {
      const results = await fetchPixabay(30);
      return NextResponse.json({
        results,
        page,
        hasMore: results.length === 30,
      });
    }

    // Default: 'all' provider
    const [unsplashRes, pexelsRes, pixabayRes] = await Promise.allSettled([
      fetchUnsplash(10),
      fetchPexels(10),
      fetchPixabay(10),
    ]);

    const unsplashList = unsplashRes.status === 'fulfilled' ? unsplashRes.value : [];
    const pexelsList = pexelsRes.status === 'fulfilled' ? pexelsRes.value : [];
    const pixabayList = pixabayRes.status === 'fulfilled' ? pixabayRes.value : [];

    const combined: StockImage[] = [];
    const maxLength = Math.max(unsplashList.length, pexelsList.length, pixabayList.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < unsplashList.length) combined.push(unsplashList[i]);
      if (i < pexelsList.length) combined.push(pexelsList[i]);
      if (i < pixabayList.length) combined.push(pixabayList[i]);
    }

    const hasMore = unsplashList.length === 10 || pexelsList.length === 10 || pixabayList.length === 10;

    return NextResponse.json({
      results: combined,
      page,
      hasMore,
    });
  } catch (err) {
    console.error('[stock-search] Unified search error:', err);
    return NextResponse.json({ error: 'Search operation failed' }, { status: 500 });
  }
}
