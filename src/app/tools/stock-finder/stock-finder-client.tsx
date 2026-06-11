'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { ThemeToggle, Logo } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Search,
  Download,
  ChevronDown,
  Sparkles,
  Scissors,
  Minimize2,
  Maximize2,
  RefreshCw,
  Crop,
  AlertCircle,
  Loader2,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { StockImage } from '@/app/api/stock-search/route';

export default function StockFinderClient() {
  const router = useRouter();

  // Search state
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [provider, setProvider] = useState<'unsplash' | 'pexels' | 'pixabay' | 'all'>('all');
  const [orientation, setOrientation] = useState<'all' | 'landscape' | 'portrait' | 'square'>('all');
  const [contentType, setContentType] = useState<'photo' | 'illustration' | 'vector'>('photo');

  // Results & Pagination state
  const [results, setResults] = useState<StockImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown states per image card
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ x: number; y: number; width: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdownId(null);
        setDropdownCoords(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch results from search proxy
  const searchPhotos = async (searchPage: number, append: boolean = false) => {
    if (!query.trim()) return;

    if (searchPage === 1) {
      setLoading(true);
      setError(null);
      setResults([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await fetch(
        `/api/stock-search?query=${encodeURIComponent(query.trim())}&provider=${provider}&page=${searchPage}&orientation=${orientation}&contentType=${contentType}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to search stock photos');
      }

      if (append) {
        setResults((prev) => [...prev, ...data.results]);
      } else {
        setResults(data.results);
      }

      setHasMore(data.hasMore);
      setPage(searchPage);
      setActiveQuery(query.trim());
    } catch (err) {
      console.error('[Stock Finder] Search error details:', err);
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchPhotos(1);
  };

  // Re-run search if filters change and there's an active query
  useEffect(() => {
    if (activeQuery) {
      searchPhotos(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, orientation, contentType]);

  // Trigger Unsplash download API
  const handleUnsplashTrigger = async (downloadTriggerUrl: string) => {
    try {
      await fetch('/api/stock-download-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ downloadLocation: downloadTriggerUrl }),
      });
    } catch (err) {
      console.error('[Stock Finder] Unsplash download trigger failed:', err);
    }
  };

  // Direct download logic
  const handleDownload = async (item: StockImage) => {
    const toastId = toast.loading('Initiating full resolution download...');

    if (item.provider === 'unsplash' && item.downloadTriggerUrl) {
      handleUnsplashTrigger(item.downloadTriggerUrl);
    }

    try {
      const res = await fetch(item.fullUrl);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();

      const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
      const safeName = item.photographer.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const filename = `alatify-${item.provider}-${safeName}.${ext}`;

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      toast.success('Download completed successfully!', { id: toastId });
    } catch (err) {
      console.error('[Stock Download] Failed:', err);
      toast.error('Download failed. Try right-clicking the image or opening original link to save manually.', { id: toastId });
    }
  };

  // Route photo to Alatify tool logic
  const handleRouteToTool = async (item: StockImage, routePath: string, toolName: string) => {
    const toastId = toast.loading(`Preparing image for ${toolName}...`);

    if (item.provider === 'unsplash' && item.downloadTriggerUrl) {
      await handleUnsplashTrigger(item.downloadTriggerUrl);
    }

    try {
      const pendingData = {
        url: item.previewUrl,
        provider: item.provider,
        id: item.id,
      };

      sessionStorage.setItem('alatify-pending-image', JSON.stringify(pendingData));

      toast.success(`Redirecting to ${toolName}...`, { id: toastId });
      router.push(routePath);
    } catch (err) {
      console.error('[Stock Finder] Auto route redirection error:', err);
      toast.error('Failed to redirect to tool.', { id: toastId });
    }
  };

  const toolsList = [
    { name: 'Background Remover', path: '/tools/bg-remover', icon: Scissors },
    { name: 'Image Compressor', path: '/tools/compressor', icon: Minimize2 },
    { name: 'Image Resizer', path: '/tools/resizer', icon: Maximize2 },
    { name: 'Format Converter', path: '/tools/converter', icon: RefreshCw },
    { name: 'Image Cropper', path: '/tools/cropper', icon: Crop },
  ];

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip">
      {/* Ambient backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="glass-header rounded-2xl flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto w-full z-10 shrink-0 border-b border-border/40">
        <div className="flex flex-col gap-1 items-start">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              Alatify
            </span>
          </div>
          <Link
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to tools
          </Link>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-10 z-10 flex flex-col gap-6 sm:gap-10">
        {/* Intro Header */}
        <section className="text-center sm:text-left space-y-2 sm:space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Stock Photos
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Stock Image Finder
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            Search millions of high-quality free stock photos from Unsplash, Pexels, and Pixabay. Download them directly or edit them instantly in one click using our offline tools.
          </p>
        </section>

        {/* Search Bar and Filters */}
        <section className="glass-real p-4 sm:p-6 rounded-2xl border border-border/60 shadow-md space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search free high-resolution photos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className="w-full bg-secondary/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm rounded-xl p-3 pl-10 outline-none transition-all duration-200 text-foreground"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
            </div>
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="py-3 px-6 text-sm rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-md active:scale-[0.98] transition-all duration-150 gap-2 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </Button>
          </form>

          {/* Filtering row */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-2 border-t border-border/40">
            {/* Content Type Filter */}
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Content Type</span>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as 'photo' | 'illustration' | 'vector')}
                disabled={loading}
                className="bg-secondary border border-border text-foreground rounded-lg p-2 outline-none cursor-pointer focus:border-primary"
              >
                <option value="photo">Photos</option>
                <option value="illustration">Illustrations</option>
                <option value="vector">Vectors</option>
              </select>
            </div>

            {/* Provider Filter (photos only - illustrations/vectors are Pixabay-only) */}
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Source Provider</span>
              <select
                value={contentType === 'photo' ? provider : 'pixabay'}
                onChange={(e) => setProvider(e.target.value as 'unsplash' | 'pexels' | 'pixabay' | 'all')}
                disabled={loading || contentType !== 'photo'}
                className="bg-secondary border border-border text-foreground rounded-lg p-2 outline-none cursor-pointer focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {contentType === 'photo' ? (
                  <>
                    <option value="all">All Providers</option>
                    <option value="unsplash">Unsplash</option>
                    <option value="pexels">Pexels</option>
                    <option value="pixabay">Pixabay</option>
                  </>
                ) : (
                  <option value="pixabay">Pixabay</option>
                )}
              </select>
            </div>

            {/* Orientation Filter */}
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Orientation</span>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as 'all' | 'landscape' | 'portrait' | 'square')}
                disabled={loading}
                className="bg-secondary border border-border text-foreground rounded-lg p-2 outline-none cursor-pointer focus:border-primary"
              >
                <option value="all">All Orientations</option>
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
                <option value="square">Square</option>
              </select>
            </div>
          </div>

          {/* Source note for illustrations / vectors */}
          {contentType !== 'photo' && (
            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 pt-1">
              <Sparkles className="w-3 h-3 text-primary shrink-0" />
              {contentType === 'illustration' ? 'Illustrations' : 'Vectors'} provided by Pixabay
            </p>
          )}
        </section>

        {/* Results grid */}
        <section className="flex-1 min-h-[300px]">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-card rounded-2xl border border-border/40 shadow-sm flex flex-col justify-between overflow-hidden animate-pulse">
                  <div className="flex-1 bg-secondary/80" />
                  <div className="p-3 border-t border-border/30 space-y-2">
                    <div className="h-3 w-3/4 bg-secondary rounded" />
                    <div className="h-2.5 w-1/2 bg-secondary rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 bg-destructive/5 border border-destructive/10 text-destructive rounded-2xl max-w-md mx-auto text-center gap-3">
              <AlertCircle className="w-10 h-10 animate-bounce" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm uppercase tracking-wider">Search Failed</h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{error}</p>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border border-border text-muted-foreground/40">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground">
                  {activeQuery ? 'No results found' : 'Find Free Stock Photos'}
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  {activeQuery
                    ? `We couldn't find any images matching "${activeQuery}". Try checking your spelling or typing different keywords.`
                    : 'Search free high-quality images from Unsplash, Pexels, and Pixabay to use directly in our editor.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
                {results.map((item) => {
                  const isDropdownOpen = activeDropdownId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="group relative aspect-[3/4] rounded-2xl bg-card border border-border/60 shadow-sm flex flex-col justify-between overflow-hidden hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative flex-1 overflow-hidden bg-secondary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnailUrl}
                          alt={item.altText}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Hover Overlay Actions */}
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 select-none">
                          <div className="flex justify-end gap-1.5">
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-card/90 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground border border-border/20 shadow-sm transition-all duration-150"
                              title={`View original on ${item.provider}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          {/* Quick Edit/Download Panel */}
                          <div className="flex flex-col gap-1.5 w-full">
                            {/* Edit Dropdown Menu */}
                            <div className="relative w-full">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (activeDropdownId === item.id) {
                                    setActiveDropdownId(null);
                                    setDropdownCoords(null);
                                  } else {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const dropdownHeight = 155;
                                    const spaceBelow = window.innerHeight - rect.bottom;
                                    const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

                                    setDropdownCoords({
                                      x: rect.left + window.scrollX,
                                      y: (openUpward ? rect.top - dropdownHeight - 6 : rect.bottom + 6) + window.scrollY,
                                      width: rect.width,
                                    });
                                    setActiveDropdownId(item.id);
                                  }
                                }}
                                size="sm"
                                className="w-full text-[10px] font-extrabold py-2 px-2.5 bg-primary hover:bg-primary-hover text-primary-foreground shadow-md transition-all duration-150 gap-1.5 justify-between flex rounded-lg"
                              >
                                <span>Edit image in...</span>
                                <ChevronDown className="w-3 h-3 shrink-0" />
                              </Button>

                              {/* Portal-based dropdown render */}
                              {isDropdownOpen && dropdownCoords && createPortal(
                                <>
                                  <div
                                    className="fixed inset-0 z-[9998] bg-transparent cursor-default"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdownId(null);
                                      setDropdownCoords(null);
                                    }}
                                  />
                                  <div
                                    ref={dropdownRef}
                                    style={{
                                      position: 'absolute',
                                      left: `${dropdownCoords.x}px`,
                                      top: `${dropdownCoords.y}px`,
                                      width: `${dropdownCoords.width}px`,
                                    }}
                                    className="z-[9999] bg-popover text-popover-foreground border border-border shadow-xl rounded-xl p-1 text-[10px] font-bold animate-fade-in flex flex-col gap-0.5"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {toolsList.map((tool) => {
                                      const ToolIcon = tool.icon;
                                      return (
                                        <button
                                          key={tool.name}
                                          onClick={() => {
                                            handleRouteToTool(item, tool.path, tool.name);
                                            setActiveDropdownId(null);
                                            setDropdownCoords(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-150 text-left"
                                        >
                                          <ToolIcon className="w-3.5 h-3.5 shrink-0" />
                                          {tool.name}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </>,
                                document.body
                              )}
                            </div>

                            {/* Download Action */}
                            <Button
                              onClick={() => handleDownload(item)}
                              variant="default"
                              size="sm"
                              className="w-full text-[10px] font-bold py-2 bg-primary hover:bg-primary-hover text-primary-foreground shadow-md transition-all duration-150 gap-1.5 flex justify-center rounded-lg"
                            >
                              <Download className="w-3 h-3" />
                              {item.contentType === 'illustration'
                                ? 'Download Illustration'
                                : item.contentType === 'vector'
                                ? 'Download Vector'
                                : 'Download Photo'}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer (Attribution) */}
                      <div className="p-3 bg-secondary/30 border-t border-border/40 select-none">
                        <div className="text-[10px] leading-relaxed text-muted-foreground truncate font-medium">
                          {item.provider === 'unsplash' && (
                            <>
                              Photo by{' '}
                              <a
                                href={`${item.photographer.profileUrl}?utm_source=alatify&utm_medium=referral`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-foreground hover:underline"
                              >
                                {item.photographer.name}
                              </a>{' '}
                              on{' '}
                              <a
                                href="https://unsplash.com/?utm_source=alatify&utm_medium=referral"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-foreground hover:underline"
                              >
                                Unsplash
                              </a>
                            </>
                          )}

                          {item.provider === 'pexels' && (
                            <>
                              Photos provided by{' '}
                              <a
                                href="https://www.pexels.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-foreground hover:underline"
                              >
                                Pexels
                              </a>{' '}
                              ·{' '}
                              <a
                                href={item.photographer.profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-foreground hover:underline"
                              >
                                {item.photographer.name}
                              </a>
                            </>
                          )}

                          {item.provider === 'pixabay' && (
                            <>
                              {item.contentType === 'illustration'
                                ? 'Illustration by'
                                : item.contentType === 'vector'
                                ? 'Vector by'
                                : 'Photo by'}{' '}
                              <a
                                href={item.photographer.profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-foreground hover:underline"
                              >
                                {item.photographer.name}
                              </a>{' '}
                              on{' '}
                              <a
                                href="https://pixabay.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-foreground hover:underline"
                              >
                                Pixabay
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Pagination */}
              {hasMore && (
                <div className="flex justify-center pt-4 select-none">
                  <Button
                    onClick={() => searchPhotos(page + 1, true)}
                    disabled={loadingMore}
                    className="py-4 px-8 text-sm rounded-xl font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border/60 shadow-md active:scale-[0.98] transition-all duration-150 gap-2 flex items-center justify-center disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading more photos...
                      </>
                    ) : (
                      'Load More Photos'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
