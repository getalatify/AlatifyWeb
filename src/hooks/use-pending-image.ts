'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function usePendingImage(setActiveImage: (file: File) => void) {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pendingDataStr = sessionStorage.getItem('alatify-pending-image');
    if (!pendingDataStr) return;

    // Remove immediately to prevent duplicate runs (e.g. in React StrictMode)
    sessionStorage.removeItem('alatify-pending-image');

    let url = '';
    let downloadTriggerUrl = '';
    
    try {
      const data = JSON.parse(pendingDataStr);
      url = data.url;
      downloadTriggerUrl = data.downloadTriggerUrl;
    } catch {
      // Fallback to raw string if not JSON
      url = pendingDataStr;
    }

    if (!url) return;

    const fetchPendingImage = async () => {
      setIsProcessing(true);
      const toastId = toast.loading('Loading stock image into workspace...');
      
      try {
        // Fire Unsplash trigger if applicable (before fetching/using the photo)
        if (downloadTriggerUrl) {
          try {
            await fetch(`/api/stock-download-trigger?url=${encodeURIComponent(downloadTriggerUrl)}`);
          } catch (triggerErr) {
            console.error('[usePendingImage] Failed to fire Unsplash download trigger:', triggerErr);
          }
        }

        const res = await fetch('/api/fetch-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch image from source.');
        }

        const blob = await res.blob();
        const contentType = res.headers.get('Content-Type') || 'image/png';

        // Resolve clean filename
        let filename = 'stock-image.png';
        try {
          const urlObj = new URL(url);
          const pathname = urlObj.pathname;
          const lastSegment = pathname.substring(pathname.lastIndexOf('/') + 1);
          const validExtensions = /\.(png|jpe?g|webp|gif|avif|bmp|tiff?|svg)$/i;
          
          if (lastSegment && validExtensions.test(lastSegment)) {
            filename = decodeURIComponent(lastSegment);
          } else {
            let extension = 'png';
            if (contentType) {
              const parts = contentType.split('/');
              if (parts.length >= 2) {
                const mimeExt = parts[1].toLowerCase().split(';')[0].trim().replace(/\+xml$/, "");
                extension = mimeExt === 'jpeg' ? 'jpg' : mimeExt;
              }
            }
            filename = `stock-image.${extension}`;
          }
        } catch {
          // Fallback
        }

        const file = new File([blob], filename, { type: contentType });
        setActiveImage(file);
        toast.success('Stock image loaded successfully!', { id: toastId });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown proxy error.';
        toast.error(`Error loading stock image: ${message}`, { id: toastId });
        console.error('[usePendingImage] Fetch error:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    fetchPendingImage();
  }, [setActiveImage]);

  return { isProcessing };
}
