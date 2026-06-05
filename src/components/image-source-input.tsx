'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/shared';
import { Upload, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageSourceInputProps {
  onImageReady: (file: File) => void;
  maxSizeMB?: number;
  className?: string;
}

function extractFilename(urlStr: string, contentType: string): string {
  try {
    const urlObj = new URL(urlStr);
    const pathname = urlObj.pathname;
    const lastSegment = pathname.substring(pathname.lastIndexOf('/') + 1);
    
    // Check if the last segment has a valid image extension
    const validExtensions = /\.(png|jpe?g|webp|gif|avif|bmp|tiff?|svg)$/i;
    if (lastSegment && validExtensions.test(lastSegment)) {
      return decodeURIComponent(lastSegment);
    }
  } catch {
    // Ignore URL parsing errors and fallback
  }

  // Fallback based on content-type
  let extension = 'png'; // default fallback
  if (contentType) {
    const parts = contentType.split('/');
    if (parts.length >= 2) {
      const mimeExt = parts[1].toLowerCase().split(';')[0].trim().replace(/\+xml$/, "");
      if (mimeExt === 'jpeg') {
        extension = 'jpg';
      } else {
        extension = mimeExt;
      }
    }
  }
  return `from-url.${extension}`;
}

export function ImageSourceInput({ 
  onImageReady, 
  maxSizeMB = 4,
  className
}: ImageSourceInputProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageReady = (file: File) => {
    if (file.type === 'image/gif') {
      toast.warning("Animated GIFs will be processed as a single frame.");
    }
    onImageReady(file);
  };
  
  const handleUrlFetch = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    
    setError(null);
    setFetching(true);
    
    try {
      const res = await fetch('/api/fetch-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch image');
      }
      
      const blob = await res.blob();
      const contentType = res.headers.get('Content-Type') || 'image/png';
      const filename = extractFilename(url.trim(), contentType);
      
      const file = new File([blob], filename, { type: contentType });
      handleImageReady(file);
      setUrl('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch image';
      setError(message);
    } finally {
      setFetching(false);
    }
  };
  
  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Custom tab selector */}
      <div className="grid grid-cols-2 w-full p-1 bg-secondary/60 backdrop-blur-sm rounded-xl border border-border/40">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={cn(
            "flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all duration-200",
            activeTab === 'upload' 
              ? "bg-card text-foreground shadow-sm border border-border/20" 
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
          )}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={cn(
            "flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all duration-200",
            activeTab === 'url' 
              ? "bg-card text-foreground shadow-sm border border-border/20" 
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
          )}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          Paste URL
        </button>
      </div>

      {/* Tab Contents (preserving state) */}
      <div className="relative w-full">
        {/* Upload Tab */}
        <div className={cn(activeTab === 'upload' ? "block animate-fade-in" : "hidden")}>
          <ImageUploader onUpload={handleImageReady} className="w-full" />
        </div>

        {/* URL Tab */}
        <div className={cn(activeTab === 'url' ? "block space-y-4 animate-fade-in" : "hidden")}>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !fetching && handleUrlFetch()}
              disabled={fetching}
              className="flex-1 bg-secondary/40 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm rounded-xl p-3 outline-none transition-all duration-200 disabled:opacity-50 text-foreground"
            />
            <Button
              onClick={handleUrlFetch}
              disabled={fetching || !url.trim()}
              className="py-3 px-6 text-sm rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-md active:scale-[0.98] transition-all duration-150 gap-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fetching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                'Fetch Image'
              )}
            </Button>
          </div>
          
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-xs text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground mb-1">🛡 Privacy Policy Note</p>
            <p>
              We briefly fetch the image URL on our server to bypass CORS browser restrictions. No files are stored or cached, and your data is processed entirely client-side inside your browser sandbox. Max image file size is {maxSizeMB}MB.
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-destructive/5 border border-destructive/15 text-destructive rounded-xl text-xs leading-relaxed animate-fade-in">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
