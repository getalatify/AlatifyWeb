/* eslint-disable @next/next/no-img-element */
"use client";

import { useT } from "@/lib/i18n/useT";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useFilenameStem } from "@/lib/files/use-filename-stem";
import { FilenameField } from "@/components/shared/filename-field";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Header, PrivacyNotice } from "@/components/shared";
import { ImageSourceInput } from "@/components/image-source-input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useHandoffInput } from "@/lib/chaining/useHandoffInput";
import { type Provenance } from "@/lib/chaining/WorkingImageProvider";
import { ContinueWith } from "@/components/chaining/continue-with";
import {
  Settings,
  Download,
  Plus,
  X,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  HelpCircle,
  CheckCircle2,
  Shield,
  EyeOff
} from "lucide-react";
import { formatBytes } from "@/lib/utils/format";


interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  sourcePreviewUrl: string | null;
  width: number;
  height: number;
  hasTransparency: boolean;
  status: 'pending' | 'processing' | 'ready' | 'error';
  error?: string;
  warning?: string;
}

interface WatermarkSettings {
  mode: 'text' | 'logo';
  
  // text settings
  text: string;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  sizePercent: number;
  color: string;
  opacity: number;
  strokeEnabled: boolean;
  strokeColor: string;
  shadowEnabled: boolean;

  // logo settings
  logoSizePercent: number;
  logoOpacity: number;

  // placement settings
  placement: 'grid' | 'free' | 'tiled';
  gridPosition: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  rotationByMode: {
    grid: number;
    free: number;
    tiled: number;
  };
  marginPercent: number;
  tileSpacingPercent: number;
  positionX: number;   // 0-100, % of image WIDTH, horizontal position of watermark CENTER, default 50
  positionY: number;   // 0-100, % of image HEIGHT, vertical position of watermark CENTER, default 50

  // output settings
  outputFormat: 'original' | 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number;
}

const defaultSettings: WatermarkSettings = {
  mode: 'text',
  text: "© Alatify",
  fontFamily: '"Geist Sans", var(--font-sans), sans-serif',
  fontWeight: 'bold',
  sizePercent: 5,
  color: "#FFFFFF",
  opacity: 50,
  strokeEnabled: true,
  strokeColor: "#000000",
  shadowEnabled: true,
  logoSizePercent: 20,
  logoOpacity: 70,
  placement: 'grid',
  gridPosition: 'bottom-right',
  rotationByMode: {
    grid: 0,
    free: 0,
    tiled: -45
  },
  marginPercent: 4,
  tileSpacingPercent: 10,
  positionX: 50,
  positionY: 50,
  outputFormat: 'original',
  quality: 92
};

interface WatermarkClientProps {
  geistSansFamily: string;
  geistMonoFamily: string;
}

export default function WatermarkClient({ geistSansFamily, geistMonoFamily }: WatermarkClientProps) {
  const t = useT();
  const [imagesList, setImagesList] = useState<ImageItem[]>([]);
  const [provenance, setProvenance] = useState<Provenance>({
    sourceToolId: "watermark",
    sourceType: "user-upload",
    aiProcessingBlocked: false,
  });
  const [watermarkedImage, setWatermarkedImage] = useState<Blob | null>(null);

  const handoff = useHandoffInput();

  useEffect(() => {
    if (handoff) {
      const file = new File([handoff.blob], handoff.fileName, { type: handoff.blob.type });
      handleImagesAdded([file]);
      setProvenance(handoff.provenance);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handoff]);

  const [settings, setSettings] = useState<WatermarkSettings>(() => ({
    ...defaultSettings,
    fontFamily: `${geistSansFamily}, system-ui, sans-serif`
  }));

  useEffect(() => {
    setWatermarkedImage(null);
  }, [settings, imagesList]);
  
  // Logo States
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoBitmap, setLogoBitmap] = useState<ImageBitmap | null>(null);
  const logoBitmapRef = useRef<ImageBitmap | null>(null);
  const logoUrlRef = useRef<string | null>(null);
  const [freePositionInitialized, setFreePositionInitialized] = useState(false);
  
  // Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<{
    total: number;
    current: number;
    filename: string;
    stage: 'idle' | 'processing' | 'zipping' | 'done';
  }>({
    total: 0,
    current: 0,
    filename: "",
    stage: "idle"
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const addMoreFileInputRef = useRef<HTMLInputElement | null>(null);
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const requestRef = useRef<number | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const firstFileName = imagesList[0]?.file.name;
  const defaultStem = imagesList.length === 1 && firstFileName
    ? `${firstFileName.replace(/\.[^/.]+$/, "")}-watermarked`
    : "watermarked-images";
  const sourceKey = imagesList.length === 1 ? firstFileName : "batch-zip";
  const filename = useFilenameStem(defaultStem, sourceKey);

  const resolvedExt = (() => {
    if (imagesList.length === 0) return "png";
    const mimeToExtension: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/bmp': 'bmp',
      'image/x-icon': 'ico',
      'image/tiff': 'tiff',
    };
    const format = settings.outputFormat === "original" ? imagesList[0].file.type : settings.outputFormat;
    return mimeToExtension[format.toLowerCase()] || "png";
  })();

  const dragStartOffsetRef = useRef<{ x: number; y: number } | null>(null);

  // Hit-testing for free positioning mode
  const hitTestWatermark = useCallback((canvasX: number, canvasY: number, canvas: HTMLCanvasElement): boolean => {
    if (settings.placement !== 'free') return false;

    const cx = (settings.positionX / 100) * canvas.width;
    const cy = (settings.positionY / 100) * canvas.height;

    const fontPx = (settings.sizePercent / 100) * canvas.width;
    const logoW = (settings.logoSizePercent / 100) * canvas.width;
    const logoH = logoBitmap ? (logoW * (logoBitmap.height / logoBitmap.width)) : 0;

    let watermarkW = 0;
    let watermarkH = 0;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    if (settings.mode === 'text') {
      ctx.save();
      ctx.font = `${settings.fontWeight} ${fontPx}px ${settings.fontFamily}`;
      watermarkW = ctx.measureText(settings.text).width;
      watermarkH = fontPx;
      ctx.restore();
    } else if (settings.mode === 'logo' && logoBitmap) {
      watermarkW = logoW;
      watermarkH = logoH;
    }

    const dx = canvasX - cx;
    const dy = canvasY - cy;
    const currentRotation = settings.rotationByMode[settings.placement];
    const rad = (-currentRotation * Math.PI) / 180;
    const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
    const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

    const pad = 12; // padding for visual forgiveness
    const halfW = watermarkW / 2 + pad;
    const halfH = watermarkH / 2 + pad;

    return Math.abs(localX) <= halfW && Math.abs(localY) <= halfH;
  }, [settings, logoBitmap]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (settings.placement !== 'free') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    const canvasX = cssX * (canvas.width / rect.width);
    const canvasY = cssY * (canvas.height / rect.height);

    if (hitTestWatermark(canvasX, canvasY, canvas)) {
      canvas.setPointerCapture(e.pointerId);
      setIsDragging(true);

      const cx = (settings.positionX / 100) * canvas.width;
      const cy = (settings.positionY / 100) * canvas.height;
      dragStartOffsetRef.current = {
        x: canvasX - cx,
        y: canvasY - cy
      };
      canvas.style.cursor = 'grabbing';
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    const canvasX = cssX * (canvas.width / rect.width);
    const canvasY = cssY * (canvas.height / rect.height);

    if (isDragging && dragStartOffsetRef.current) {
      canvas.style.cursor = 'grabbing';
      
      const targetCx = canvasX - dragStartOffsetRef.current.x;
      const targetCy = canvasY - dragStartOffsetRef.current.y;

      let px = (targetCx / canvas.width) * 100;
      let py = (targetCy / canvas.height) * 100;

      px = Math.max(0, Math.min(100, px));
      py = Math.max(0, Math.min(100, py));

      setSettings(prev => ({
        ...prev,
        positionX: px,
        positionY: py
      }));
    } else if (settings.placement === 'free') {
      const isHover = hitTestWatermark(canvasX, canvasY, canvas);
      canvas.style.cursor = isHover ? 'grab' : 'default';
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
      const rect = canvas.getBoundingClientRect();
      const cssX = e.clientX - rect.left;
      const cssY = e.clientY - rect.top;
      const canvasX = cssX * (canvas.width / rect.width);
      const canvasY = cssY * (canvas.height / rect.height);
      const isHover = hitTestWatermark(canvasX, canvasY, canvas);
      canvas.style.cursor = isHover ? 'grab' : 'default';
    }
    setIsDragging(false);
    dragStartOffsetRef.current = null;
  };

  // Utility to determine extension from mime type
  const getWatermarkedFilename = (originalName: string, mimeType: string): string => {
    const base = originalName.replace(/\.[^/.]+$/, "");
    const mimeToExtension: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/bmp': 'bmp',
      'image/x-icon': 'ico',
      'image/tiff': 'tiff',
    };
    const ext = mimeToExtension[mimeType.toLowerCase()] || "png";
    return `${base}-watermarked.${ext}`;
  };

  // Shared watermark rendering routine
  const renderWatermark = useCallback((
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
    activeSettings: WatermarkSettings,
    logoBmp: ImageBitmap | null
  ) => {
    ctx.save();
    
    // Compute sizes relative to canvas width (correctness constraint)
    const fontPx = (activeSettings.sizePercent / 100) * canvasW;
    const logoW = (activeSettings.logoSizePercent / 100) * canvasW;
    const logoH = logoBmp ? (logoW * (logoBmp.height / logoBmp.width)) : 0;
    const marginPx = (activeSettings.marginPercent / 100) * canvasW;

    let watermarkW = 0;
    let watermarkH = 0;

    if (activeSettings.mode === 'text') {
      ctx.font = `${activeSettings.fontWeight} ${fontPx}px ${activeSettings.fontFamily}`;
      watermarkW = ctx.measureText(activeSettings.text).width;
      watermarkH = fontPx;
    } else if (activeSettings.mode === 'logo' && logoBmp) {
      watermarkW = logoW;
      watermarkH = logoH;
    }

    if (activeSettings.placement === 'grid') {
      // Calculate anchors based on 3x3 positions and bounds
      let cx = 0;
      let cy = 0;

      switch (activeSettings.gridPosition) {
        case 'top-left':
          cx = marginPx + watermarkW / 2;
          cy = marginPx + watermarkH / 2;
          break;
        case 'top-center':
          cx = canvasW / 2;
          cy = marginPx + watermarkH / 2;
          break;
        case 'top-right':
          cx = canvasW - marginPx - watermarkW / 2;
          cy = marginPx + watermarkH / 2;
          break;
        case 'center-left':
          cx = marginPx + watermarkW / 2;
          cy = canvasH / 2;
          break;
        case 'center':
          cx = canvasW / 2;
          cy = canvasH / 2;
          break;
        case 'center-right':
          cx = canvasW - marginPx - watermarkW / 2;
          cy = canvasH / 2;
          break;
        case 'bottom-left':
          cx = marginPx + watermarkW / 2;
          cy = canvasH - marginPx - watermarkH / 2;
          break;
        case 'bottom-center':
          cx = canvasW / 2;
          cy = canvasH - marginPx - watermarkH / 2;
          break;
        case 'bottom-right':
          cx = canvasW - marginPx - watermarkW / 2;
          cy = canvasH - marginPx - watermarkH / 2;
          break;
      }

      ctx.save();
      ctx.translate(cx, cy);
      const currentRotation = activeSettings.rotationByMode[activeSettings.placement];
      ctx.rotate((currentRotation * Math.PI) / 180);

      if (activeSettings.mode === 'text') {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${activeSettings.fontWeight} ${fontPx}px ${activeSettings.fontFamily}`;
        ctx.globalAlpha = activeSettings.opacity / 100;

        if (activeSettings.shadowEnabled) {
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = fontPx * 0.08;
          ctx.shadowOffsetX = fontPx * 0.04;
          ctx.shadowOffsetY = fontPx * 0.04;
        }

        if (activeSettings.strokeEnabled) {
          ctx.lineWidth = fontPx * 0.06;
          ctx.strokeStyle = activeSettings.strokeColor;
          ctx.strokeText(activeSettings.text, 0, 0);
        }

        ctx.fillStyle = activeSettings.color;
        ctx.fillText(activeSettings.text, 0, 0);
      } else if (activeSettings.mode === 'logo' && logoBmp) {
        ctx.globalAlpha = activeSettings.logoOpacity / 100;
        ctx.drawImage(logoBmp, -logoW / 2, -logoH / 2, logoW, logoH);
      }
      ctx.restore();
    } else if (activeSettings.placement === 'free') {
      const cx = (activeSettings.positionX / 100) * canvasW;
      const cy = (activeSettings.positionY / 100) * canvasH;

      ctx.save();
      ctx.translate(cx, cy);
      const currentRotation = activeSettings.rotationByMode[activeSettings.placement];
      ctx.rotate((currentRotation * Math.PI) / 180);

      if (activeSettings.mode === 'text') {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${activeSettings.fontWeight} ${fontPx}px ${activeSettings.fontFamily}`;
        ctx.globalAlpha = activeSettings.opacity / 100;

        if (activeSettings.shadowEnabled) {
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = fontPx * 0.08;
          ctx.shadowOffsetX = fontPx * 0.04;
          ctx.shadowOffsetY = fontPx * 0.04;
        }

        if (activeSettings.strokeEnabled) {
          ctx.lineWidth = fontPx * 0.06;
          ctx.strokeStyle = activeSettings.strokeColor;
          ctx.strokeText(activeSettings.text, 0, 0);
        }

        ctx.fillStyle = activeSettings.color;
        ctx.fillText(activeSettings.text, 0, 0);
      } else if (activeSettings.mode === 'logo' && logoBmp) {
        ctx.globalAlpha = activeSettings.logoOpacity / 100;
        ctx.drawImage(logoBmp, -logoW / 2, -logoH / 2, logoW, logoH);
      }
      ctx.restore();
    } else {
      // Tiled Placement
      ctx.save();
      ctx.translate(canvasW / 2, canvasH / 2);
      const currentRotation = activeSettings.rotationByMode[activeSettings.placement];
      ctx.rotate((currentRotation * Math.PI) / 180);

      const spacing = (activeSettings.tileSpacingPercent / 100) * canvasW;
      const stepX = watermarkW + spacing;
      const stepY = watermarkH + spacing;
      const diag = Math.sqrt(canvasW * canvasW + canvasH * canvasH);

      const startX = -diag / 2;
      const endX = diag / 2;
      const startY = -diag / 2;
      const endY = diag / 2;

      for (let x = startX; x < endX; x += stepX) {
        for (let y = startY; y < endY; y += stepY) {
          ctx.save();
          ctx.translate(x + watermarkW / 2, y + watermarkH / 2);

          if (activeSettings.mode === 'text') {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `${activeSettings.fontWeight} ${fontPx}px ${activeSettings.fontFamily}`;
            ctx.globalAlpha = activeSettings.opacity / 100;

            if (activeSettings.shadowEnabled) {
              ctx.shadowColor = 'rgba(0,0,0,0.5)';
              ctx.shadowBlur = fontPx * 0.08;
              ctx.shadowOffsetX = fontPx * 0.04;
              ctx.shadowOffsetY = fontPx * 0.04;
            }

            if (activeSettings.strokeEnabled) {
              ctx.lineWidth = fontPx * 0.06;
              ctx.strokeStyle = activeSettings.strokeColor;
              ctx.strokeText(activeSettings.text, 0, 0);
            }

            ctx.fillStyle = activeSettings.color;
            ctx.fillText(activeSettings.text, 0, 0);
          } else if (activeSettings.mode === 'logo' && logoBmp) {
            ctx.globalAlpha = activeSettings.logoOpacity / 100;
            ctx.drawImage(logoBmp, -logoW / 2, -logoH / 2, logoW, logoH);
          }
          ctx.restore();
        }
      }
      ctx.restore();
    }

    ctx.restore();
  }, []);

  // Main draw preview trigger
  const drawPreview = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || imagesList.length === 0) return;
    const firstItem = imagesList[0];
    const img = imageCacheRef.current[firstItem.id];
    if (!img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cap preview canvas at 1200px max bounds for rendering speed
    const maxDim = 1200;
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    // Ensure the font is loaded before rendering
    if (settings.mode === 'text') {
      const fontPx = (settings.sizePercent / 100) * w;
      const familyString = settings.fontFamily;
      const fontWeight = settings.fontWeight;
      try {
        await document.fonts.load(`${fontWeight} ${fontPx}px ${familyString}`);
      } catch (e) {
        console.error("Font loading error in preview:", e);
      }
    }

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    renderWatermark(ctx, w, h, settings, logoBitmap);

    // Draw selection overlay outline on the preview canvas only (not on exported image)
    if (settings.placement === 'free') {
      ctx.save();
      const cx = (settings.positionX / 100) * w;
      const cy = (settings.positionY / 100) * h;
      
      const fontPx = (settings.sizePercent / 100) * w;
      const logoW = (settings.logoSizePercent / 100) * w;
      const logoH = logoBitmap ? (logoW * (logoBitmap.height / logoBitmap.width)) : 0;
      
      let watermarkW = 0;
      let watermarkH = 0;
      
      if (settings.mode === 'text') {
        ctx.font = `${settings.fontWeight} ${fontPx}px ${settings.fontFamily}`;
        watermarkW = ctx.measureText(settings.text).width;
        watermarkH = fontPx;
      } else if (settings.mode === 'logo' && logoBitmap) {
        watermarkW = logoW;
        watermarkH = logoH;
      }

      ctx.translate(cx, cy);
      const currentRotation = settings.rotationByMode[settings.placement];
      ctx.rotate((currentRotation * Math.PI) / 180);

      // Dash selection rect
      ctx.strokeStyle = "rgba(0, 150, 255, 0.8)";
      ctx.lineWidth = Math.max(1.5, w * 0.0015);
      ctx.setLineDash([4, 4]);
      
      const pad = 6; // visual spacing padding
      ctx.strokeRect(-watermarkW / 2 - pad, -watermarkH / 2 - pad, watermarkW + pad * 2, watermarkH + pad * 2);
      ctx.restore();
    }
  }, [imagesList, settings, renderWatermark, logoBitmap]);

  // RequestAnimationFrame throttler for drag smoothness
  const triggerPreviewUpdate = useCallback(() => {
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
    }
    requestRef.current = requestAnimationFrame(() => {
      drawPreview();
      requestRef.current = null;
    });
  }, [drawPreview]);

  // Load first image into preview cache when imagesList changes
  useEffect(() => {
    if (imagesList.length === 0) return;
    const firstItem = imagesList[0];
    
    if (imageCacheRef.current[firstItem.id]) {
      triggerPreviewUpdate();
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCacheRef.current[firstItem.id] = img;
      setImagesList(prev => prev.map(item => {
        if (item.id === firstItem.id) {
          return {
            ...item,
            width: img.naturalWidth,
            height: img.naturalHeight,
            status: 'ready'
          };
        }
        return item;
      }));
    };
    img.src = firstItem.previewUrl;
  }, [imagesList, triggerPreviewUpdate]);

  // Trigger preview redraws on settings change
  useEffect(() => {
    triggerPreviewUpdate();
  }, [settings, triggerPreviewUpdate]);

  // Resolve pending queue items
  useEffect(() => {
    const pendingItems = imagesList.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) return;

    pendingItems.forEach(item => {
      setImagesList(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing' } : i));

      const img = new Image();
      img.onload = () => {
        setImagesList(prev => prev.map(i => i.id === item.id ? {
          ...i,
          width: img.naturalWidth,
          height: img.naturalHeight,
          status: 'ready'
        } : i));
      };
      img.onerror = () => {
        setImagesList(prev => prev.map(i => i.id === item.id ? {
          ...i,
          status: 'error',
          error: "Invalid file format."
        } : i));
      };
      img.src = item.previewUrl;
    });
  }, [imagesList]);

  // Trigger redraw once document fonts are fully loaded/ready
  useEffect(() => {
    document.fonts.ready.then(() => {
      triggerPreviewUpdate();
    });
  }, [triggerPreviewUpdate]);

  // Keep logo references in sync for unmount cleanup
  useEffect(() => {
    logoBitmapRef.current = logoBitmap;
  }, [logoBitmap]);

  useEffect(() => {
    logoUrlRef.current = logoUrl;
  }, [logoUrl]);

  // Clean up cache, bitmaps and object urls on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
      Object.values(imageCacheRef.current).forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
      imageCacheRef.current = {};

      if (logoBitmapRef.current) {
        logoBitmapRef.current.close();
      }
      if (logoUrlRef.current) {
        URL.revokeObjectURL(logoUrlRef.current);
      }
    };
  }, []);

  // Decode and resize logo on upload time
  const handleLogoUpload = async (file: File) => {
    if (file.type !== "image/png") {
      toast.error("Logo must be a transparent PNG file");
      return;
    }

    try {
      let bmp = await createImageBitmap(file);
      const maxDim = 2048;
      if (bmp.width > maxDim || bmp.height > maxDim) {
        let w = bmp.width;
        let h = bmp.height;
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }

        const offscreen = document.createElement("canvas");
        offscreen.width = w;
        offscreen.height = h;
        const octx = offscreen.getContext("2d");
        if (octx) {
          octx.drawImage(bmp, 0, 0, w, h);
          const newBmp = await createImageBitmap(offscreen);
          bmp.close();
          bmp = newBmp;
        }
      }

      // Clean up previous logo bitmap and object url
      if (logoBitmap) {
        logoBitmap.close();
      }
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl);
      }

      const url = URL.createObjectURL(file);
      setLogoUrl(url);
      setLogoBitmap(bmp);
      logoBitmapRef.current = bmp;
      setLogoFile(file);
      
      triggerPreviewUpdate();
    } catch {
      toast.error("Couldn't read that logo, try a transparent PNG image.");
    }
  };

  const handleRemoveLogo = () => {
    if (logoBitmap) {
      logoBitmap.close();
    }
    if (logoUrl) {
      URL.revokeObjectURL(logoUrl);
    }
    setLogoBitmap(null);
    logoBitmapRef.current = null;
    setLogoUrl(null);
    setLogoFile(null);
    triggerPreviewUpdate();
  };

  // Add more images to queue
  const handleImagesAdded = (files: File[]) => {
    if (imagesList.length + files.length > 30) {
      toast.warning("Maximum of 30 images allowed per batch. Excess files skipped.");
    }
    
    const limit = 30 - imagesList.length;
    const filesToAdd = files.slice(0, limit);

    const newItems: ImageItem[] = filesToAdd.map(file => {
      const id = Math.random().toString(36).substring(2, 9);
      const previewUrl = URL.createObjectURL(file);
      return {
        id,
        file,
        previewUrl,
        sourcePreviewUrl: null,
        width: 0,
        height: 0,
        hasTransparency: false,
        status: 'pending'
      };
    });

    setImagesList(prev => [...prev, ...newItems]);
  };

  const removeImageItem = (id: string) => {
    const item = imagesList.find(i => i.id === id);
    if (item) {
      if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
      delete imageCacheRef.current[id];
    }
    setImagesList(prev => prev.filter(i => i.id !== id));
  };

  const moveImageItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === imagesList.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newList = [...imagesList];
    const temp = newList[index];
    newList[index] = newList[newIndex];
    newList[newIndex] = temp;
    
    setImagesList(newList);
  };

  const clearImagesList = () => {
    imagesList.forEach(item => {
      if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    imageCacheRef.current = {};
    setImagesList([]);
    setProcessingProgress({ total: 0, current: 0, filename: "", stage: "idle" });
  };

  // Perform single image watermarking download
  const handleSingleExport = async (item: ImageItem) => {
    setIsProcessing(true);
    try {
      const img = imageCacheRef.current[item.id] || await new Promise<HTMLImageElement>((resolve, reject) => {
        const temp = new Image();
        temp.onload = () => resolve(temp);
        temp.onerror = () => reject(new Error("Image failed to load."));
        temp.src = item.previewUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize canvas context");

      // Draw full-res content
      ctx.drawImage(img, 0, 0);

      // Ensure the font is loaded before rendering
      if (settings.mode === 'text') {
        const fontPx = (settings.sizePercent / 100) * canvas.width;
        const familyString = settings.fontFamily;
        const fontWeight = settings.fontWeight;
        try {
          await document.fonts.load(`${fontWeight} ${fontPx}px ${familyString}`);
        } catch (e) {
          console.error("Font loading error in single export:", e);
        }
      }

      // Overlay watermark in original coordinates
      renderWatermark(ctx, canvas.width, canvas.height, settings, logoBitmap);

      const format = settings.outputFormat === "original" ? item.file.type : settings.outputFormat;
      const qualityVal = settings.quality / 100;

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), format, qualityVal);
      });

      if (!blob) throw new Error("Canvas render compression error");

      setWatermarkedImage(blob);

      // Clean up canvas references
      canvas.width = 0;
      canvas.height = 0;

      const downloadName = imagesList.length === 1
        ? `${filename.resolve()}.${resolvedExt}`
        : getWatermarkedFilename(item.file.name, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${item.file.name} watermarked successfully!`);
    } catch (err) {
      console.error(err);
      toast.error(`Could not process ${item.file.name}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Perform multi-image batch zip export
  const handleBatchExport = async () => {
    const readyItems = imagesList.filter(item => item.status === 'ready');
    if (readyItems.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress({
      total: readyItems.length,
      current: 0,
      filename: readyItems[0].file.name,
      stage: 'processing'
    });

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const usedFilenames = new Set<string>();

      for (let i = 0; i < readyItems.length; i++) {
        const item = readyItems[i];
        setProcessingProgress(prev => ({
          ...prev,
          current: i,
          filename: item.file.name,
          stage: 'processing'
        }));

        const img = imageCacheRef.current[item.id] || await new Promise<HTMLImageElement>((resolve, reject) => {
          const temp = new Image();
          temp.onload = () => resolve(temp);
          temp.onerror = () => reject(new Error("Image failed to load."));
          temp.src = item.previewUrl;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not initialize canvas context");

        ctx.drawImage(img, 0, 0);

        // Ensure the font is loaded before rendering
        if (settings.mode === 'text') {
          const fontPx = (settings.sizePercent / 100) * canvas.width;
          const familyString = settings.fontFamily;
          const fontWeight = settings.fontWeight;
          try {
            await document.fonts.load(`${fontWeight} ${fontPx}px ${familyString}`);
          } catch (e) {
            console.error("Font loading error in batch export:", e);
          }
        }

        renderWatermark(ctx, canvas.width, canvas.height, settings, logoBitmap);

        const format = settings.outputFormat === "original" ? item.file.type : settings.outputFormat;
        const qualityVal = settings.quality / 100;

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), format, qualityVal);
        });

        if (!blob) throw new Error(`Compression error on file: ${item.file.name}`);

        // Clean up canvas references immediately to release heap memory
        canvas.width = 0;
        canvas.height = 0;

        const resolvedFilename = getWatermarkedFilename(item.file.name, format);
        let finalZipName = resolvedFilename;
        const base = resolvedFilename.replace(/\.[^/.]+$/, "");
        const ext = resolvedFilename.split('.').pop();
        let counter = 1;
        while (usedFilenames.has(finalZipName)) {
          finalZipName = `${base}_${counter}.${ext}`;
          counter++;
        }
        usedFilenames.add(finalZipName);

        zip.file(finalZipName, blob);
      }

      setProcessingProgress(prev => ({
        ...prev,
        stage: 'zipping',
        current: prev.total
      }));

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename.resolve()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProcessingProgress(prev => ({
        ...prev,
        stage: 'done'
      }));
      toast.success("ZIP archive compiled and downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Batch watermark compilation failed");
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProcessingProgress(prev => ({ ...prev, stage: 'idle' }));
      }, 3000);
    }
  };

  // Adjust defaults on placement toggles to feel intuitive
  const handlePlacementChange = (placement: 'grid' | 'free' | 'tiled') => {
    if (placement === 'free') {
      if (freePositionInitialized) {
        setSettings(prev => ({
          ...prev,
          placement
        }));
        return;
      }

      setFreePositionInitialized(true);
      const firstItem = imagesList[0];
      const img = firstItem ? imageCacheRef.current[firstItem.id] : null;
      
      let px = 50;
      let py = 50;
      
      if (img) {
        const logoBmp = logoBitmap;
        const aspect = img.naturalHeight / img.naturalWidth;
        
        let watermarkWPercent = 0;
        let watermarkHPercent = 0;
        
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.save();
            const fontPx = (settings.sizePercent / 100) * canvas.width;
            ctx.font = `${settings.fontWeight} ${fontPx}px ${settings.fontFamily}`;
            const textW = ctx.measureText(settings.text).width;
            watermarkWPercent = (textW / canvas.width) * 100;
            watermarkHPercent = (fontPx / canvas.height) * 100;
            ctx.restore();
          }
        }
        
        if (watermarkWPercent === 0) {
          watermarkWPercent = settings.mode === 'text' 
            ? settings.text.length * settings.sizePercent * 0.6 
            : settings.logoSizePercent;
          watermarkHPercent = settings.mode === 'text'
            ? settings.sizePercent / aspect
            : (logoBmp ? (settings.logoSizePercent * (logoBmp.height / logoBmp.width)) / aspect : settings.logoSizePercent / aspect);
        }
        
        const marginWPercent = settings.marginPercent;
        const marginHPercent = settings.marginPercent / aspect;
        
        let cx = 50;
        let cy = 50;
        
        switch (settings.gridPosition) {
          case 'top-left':
            cx = marginWPercent + watermarkWPercent / 2;
            cy = marginHPercent + watermarkHPercent / 2;
            break;
          case 'top-center':
            cx = 50;
            cy = marginHPercent + watermarkHPercent / 2;
            break;
          case 'top-right':
            cx = 100 - marginWPercent - watermarkWPercent / 2;
            cy = marginHPercent + watermarkHPercent / 2;
            break;
          case 'center-left':
            cx = marginWPercent + watermarkWPercent / 2;
            cy = 50;
            break;
          case 'center':
            cx = 50;
            cy = 50;
            break;
          case 'center-right':
            cx = 100 - marginWPercent - watermarkWPercent / 2;
            cy = 50;
            break;
          case 'bottom-left':
            cx = marginWPercent + watermarkWPercent / 2;
            cy = 100 - marginHPercent - watermarkHPercent / 2;
            break;
          case 'bottom-center':
            cx = 50;
            cy = 100 - marginHPercent - watermarkHPercent / 2;
            break;
          case 'bottom-right':
            cx = 100 - marginWPercent - watermarkWPercent / 2;
            cy = 100 - marginHPercent - watermarkHPercent / 2;
            break;
        }
        
        px = Math.max(0, Math.min(100, cx));
        py = Math.max(0, Math.min(100, cy));
      }
      
      setSettings(prev => ({
        ...prev,
        placement,
        positionX: Math.round(px),
        positionY: Math.round(py)
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        placement
      }));
    }
  };

  const handleResetPosition = () => {
    const canvas = canvasRef.current;
    const firstItem = imagesList[0];
    const img = firstItem ? imageCacheRef.current[firstItem.id] : null;

    if (!canvas || !img) {
      setSettings(prev => ({
        ...prev,
        positionX: 85,
        positionY: 88
      }));
      return;
    }

    const canvasW = canvas.width;
    const canvasH = canvas.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setSettings(prev => ({
        ...prev,
        positionX: 85,
        positionY: 88
      }));
      return;
    }

    const fontPx = (settings.sizePercent / 100) * canvasW;
    const logoW = (settings.logoSizePercent / 100) * canvasW;
    const logoBmp = logoBitmap;
    const logoH = logoBmp ? (logoW * (logoBmp.height / logoBmp.width)) : 0;
    
    let watermarkW = 0;
    let watermarkH = 0;

    if (settings.mode === 'text') {
      ctx.save();
      ctx.font = `${settings.fontWeight} ${fontPx}px ${settings.fontFamily}`;
      watermarkW = ctx.measureText(settings.text).width;
      watermarkH = fontPx;
      ctx.restore();
    } else if (settings.mode === 'logo') {
      if (logoBmp) {
        watermarkW = logoW;
        watermarkH = logoH;
      } else {
        watermarkW = logoW;
        watermarkH = logoW;
      }
    }

    const currentRotation = settings.rotationByMode['free'];
    const rad = (currentRotation * Math.PI) / 180;
    const cosVal = Math.abs(Math.cos(rad));
    const sinVal = Math.abs(Math.sin(rad));

    const wBox = watermarkW * cosVal + watermarkH * sinVal;
    const hBox = watermarkW * sinVal + watermarkH * cosVal;

    const marginPx = 0.04 * canvasW;

    const cx = canvasW - marginPx - wBox / 2;
    const cy = canvasH - marginPx - hBox / 2;

    const px = Math.max(0, Math.min(100, (cx / canvasW) * 100));
    const py = Math.max(0, Math.min(100, (cy / canvasH) * 100));

    setSettings(prev => ({
      ...prev,
      positionX: Math.round(px),
      positionY: Math.round(py)
    }));
  };

  const displayPct =
    processingProgress.stage === 'done' || processingProgress.stage === 'zipping'
      ? 100
      : processingProgress.total > 0
        ? Math.round((processingProgress.current / processingProgress.total) * 100)
        : 0;

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 text-foreground flex flex-col gap-6 select-none">
      
      {/* Header section with back navigation */}
      <Header showBackToTools />

      <div className="text-center sm:text-left space-y-2 sm:space-y-3 max-w-2xl mt-1 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm max-w-max">
          Image Watermark Tool
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
          Add Text or Logo Watermarks to Your Images
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {t("tools.watermark.intro")}
        </p>
      </div>

      {/* Main split dashboard panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT PANEL: CONTROLS (1-Column Span on Desktop) */}
        <section className="lg:col-span-1 p-5 rounded-2xl bg-card border border-border/80 shadow-md space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
          
          {/* Header block */}
          <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
            <Settings className="w-4 h-4 text-primary" />
            <h2 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground">
              Watermark Configurations
            </h2>
          </div>

          {/* Mode Selector Segmented Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl border border-border/60 text-xs font-bold">
            <button
              onClick={() => setSettings(prev => ({ ...prev, mode: 'text' }))}
              className={`py-2 rounded-lg transition-all duration-150 ${settings.mode === "text" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Text Watermark
            </button>
            <button
              onClick={() => setSettings(prev => ({ ...prev, mode: 'logo' }))}
              className={`py-2 rounded-lg transition-all duration-150 ${settings.mode === "logo" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Logo Watermark
            </button>
          </div>

          {/* TEXT MODE CONFIGURATIONS */}
          {settings.mode === 'text' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Text Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Watermark Text</label>
                <input
                  type="text"
                  value={settings.text}
                  onChange={(e) => setSettings(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-secondary border border-border/80 hover:border-primary/30 focus:border-primary focus:outline-none text-sm font-semibold transition-all"
                />
              </div>

              {/* Font Family Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Font Family</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => setSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-secondary border border-border/80 hover:border-primary/30 focus:border-primary focus:outline-none text-sm font-semibold transition-all [color-scheme:light] dark:[color-scheme:dark]"
                >
                  <option value={`${geistSansFamily}, system-ui, sans-serif`}>Geist Sans</option>
                  <option value='Georgia, serif'>Georgia Serif</option>
                  <option value={`${geistMonoFamily}, ui-monospace, monospace`}>Geist Mono</option>
                </select>
              </div>

              {/* Font Weight Toggles */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Font Weight</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl border border-border/60 text-xs font-bold">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, fontWeight: 'normal' }))}
                    className={`py-1.5 rounded-lg transition-all ${settings.fontWeight === 'normal' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, fontWeight: 'bold' }))}
                    className={`py-1.5 rounded-lg transition-all ${settings.fontWeight === 'bold' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Bold
                  </button>
                </div>
              </div>

              {/* Relative Font Size Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground">Font Size (% of Image Width)</span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold">{settings.sizePercent}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={0.5}
                  value={settings.sizePercent}
                  onChange={(e) => setSettings(prev => ({ ...prev, sizePercent: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Text Color + Opacity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.color}
                      onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                      className="w-9 h-9 p-0 rounded-lg border border-border cursor-pointer bg-transparent shadow-sm shrink-0"
                    />
                    <input
                      type="text"
                      value={settings.color.toUpperCase()}
                      onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full p-2 text-center rounded-lg bg-secondary border border-border text-xs font-bold uppercase"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">Opacity</span>
                    <span className="font-extrabold text-primary">{settings.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings.opacity}
                    onChange={(e) => setSettings(prev => ({ ...prev, opacity: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary mt-2.5"
                  />
                </div>
              </div>

              {/* Stroke Configurations */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.strokeEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, strokeEnabled: e.target.checked }))}
                    className="rounded border-border/80 bg-secondary text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>Enable Stroke Outline</span>
                </label>

                {settings.strokeEnabled && (
                  <div className="flex items-center gap-2.5 pl-6 animate-fade-in">
                    <input
                      type="color"
                      value={settings.strokeColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, strokeColor: e.target.value }))}
                      className="w-8 h-8 p-0 rounded-lg border border-border cursor-pointer bg-transparent shadow-sm shrink-0"
                    />
                    <input
                      type="text"
                      value={settings.strokeColor.toUpperCase()}
                      onChange={(e) => setSettings(prev => ({ ...prev, strokeColor: e.target.value }))}
                      className="w-24 p-1.5 text-center rounded-lg bg-secondary border border-border text-xs font-bold uppercase"
                    />
                  </div>
                )}
              </div>

              {/* Shadow Config */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.shadowEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, shadowEnabled: e.target.checked }))}
                    className="rounded border-border/80 bg-secondary text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>Enable Text Drop Shadow</span>
                </label>
              </div>

            </div>
          )}

          {/* LOGO MODE CONFIGURATIONS */}
          {settings.mode === 'logo' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Dropzone logo input */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Select Watermark Logo File
                </span>
                
                {!logoFile ? (
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className="border-2 border-dashed border-border/80 hover:border-primary/45 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-secondary/15 hover:bg-secondary/30 transition-all text-muted-foreground"
                  >
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleLogoUpload(e.target.files[0]);
                        }
                      }}
                      accept="image/png"
                      className="hidden"
                    />
                    <Plus className="w-6 h-6 mb-1 text-muted-foreground/50" />
                    <span className="text-xs font-bold">Upload Logo (PNG)</span>
                    <span className="text-[10px] text-muted-foreground/60">Transparency support required</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border/80">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {logoUrl && (
                        <img
                          src={logoUrl}
                          alt="Logo preview"
                          className="w-10 h-10 object-contain bg-canvas rounded border border-border shrink-0"
                        />
                      )}
                      <div className="text-left overflow-hidden">
                        <p className="text-xs font-bold truncate text-foreground">{logoFile.name}</p>
                        <p className="text-[10px] text-muted-foreground">{formatBytes(logoFile.size)}</p>
                      </div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveLogo}
                          aria-label="Remove logo"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 p-2 shrink-0 h-8 w-8 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Remove Logo
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>

              {/* Logo Size Percent */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground">Logo Width (% of Image Width)</span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold">{settings.logoSizePercent}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={1}
                  value={settings.logoSizePercent}
                  onChange={(e) => setSettings(prev => ({ ...prev, logoSizePercent: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Logo Opacity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground">Logo Opacity</span>
                  <span className="font-extrabold text-primary">{settings.logoOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={settings.logoOpacity}
                  onChange={(e) => setSettings(prev => ({ ...prev, logoOpacity: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

            </div>
          )}

          {/* SHARED PLACEMENT PARAMETERS */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            
            {/* Placement Layout Pattern */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Placement Pattern</label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-secondary rounded-xl border border-border/60 text-[10px] sm:text-xs font-bold">
                <button
                  onClick={() => handlePlacementChange('grid')}
                  className={`py-1.5 rounded-lg transition-all ${settings.placement === 'grid' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Grid Anchor
                </button>
                <button
                  onClick={() => handlePlacementChange('free')}
                  className={`py-1.5 rounded-lg transition-all ${settings.placement === 'free' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Free Position
                </button>
                <button
                  onClick={() => handlePlacementChange('tiled')}
                  className={`py-1.5 rounded-lg transition-all ${settings.placement === 'tiled' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Tiled Repeated
                </button>
              </div>
            </div>

            {/* Free Position coordinates */}
            {settings.placement === 'free' && (
              <div className="space-y-3 pt-1 animate-fade-in">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-foreground block">Position coordinates (%)</label>
                  <button
                    type="button"
                    onClick={handleResetPosition}
                    className="text-[10px] font-extrabold text-primary hover:underline bg-transparent border-none p-0 cursor-pointer"
                  >
                    Reset to bottom-right
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-muted-foreground">X (%)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round(settings.positionX)}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (isNaN(val)) val = 50;
                        val = Math.max(0, Math.min(100, val));
                        setSettings(prev => ({ ...prev, positionX: val }));
                      }}
                      className="w-full p-2 rounded-xl bg-secondary border border-border/80 hover:border-primary/30 focus:border-primary focus:outline-none text-sm font-semibold transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-muted-foreground">Y (%)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round(settings.positionY)}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (isNaN(val)) val = 50;
                        val = Math.max(0, Math.min(100, val));
                        setSettings(prev => ({ ...prev, positionY: val }));
                      }}
                      className="w-full p-2 rounded-xl bg-secondary border border-border/80 hover:border-primary/30 focus:border-primary focus:outline-none text-sm font-semibold transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Grid Position 3x3 layout selector */}
            {settings.placement === 'grid' && (
              <div className="space-y-3 pt-1 animate-fade-in">
                <label className="text-xs font-bold text-foreground block">Anchor corner</label>
                <div className="grid grid-cols-3 gap-1.5 w-32 p-1.5 bg-secondary rounded-xl border border-border/60">
                  {(['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const).map((pos) => (
                    <Tooltip key={pos}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setSettings(prev => ({ ...prev, gridPosition: pos }))}
                          aria-label={`Align watermark to ${pos}`}
                          className={`w-8 h-8 rounded-lg border transition-all ${settings.gridPosition === pos ? "bg-primary border-primary shadow-md text-primary-foreground scale-105" : "bg-card border-border/60 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"}`}
                        >
                          <div className={`w-2 h-2 rounded-full mx-auto ${settings.gridPosition === pos ? "bg-background" : "bg-muted-foreground/35"}`} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {pos}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>

                {/* Margin slider */}
                <div className="space-y-2 pt-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">Edge Margin (% of Image Width)</span>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold">{settings.marginPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    step={0.5}
                    value={settings.marginPercent}
                    onChange={(e) => setSettings(prev => ({ ...prev, marginPercent: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            )}

            {/* Tiled parameters */}
            {settings.placement === 'tiled' && (
              <div className="space-y-2 pt-1 animate-fade-in">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground">Tile Spacing (% of Image Width)</span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold">{settings.tileSpacingPercent}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={0.5}
                  value={settings.tileSpacingPercent}
                  onChange={(e) => setSettings(prev => ({ ...prev, tileSpacingPercent: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}

            {/* Rotation slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">Rotation Degrees</span>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold">{settings.rotationByMode[settings.placement]}°</span>
              </div>
              <input
                type="range"
                min={-90}
                max={90}
                step={1}
                value={settings.rotationByMode[settings.placement]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSettings(prev => ({
                    ...prev,
                    rotationByMode: {
                      ...prev.rotationByMode,
                      [prev.placement]: val
                    }
                  }));
                }}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

          </div>

          {/* OUTPUT SETTINGS */}
          <div className="space-y-3 pt-4 border-t border-border/40">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">Output Format</label>
              <select
                value={settings.outputFormat}
                onChange={(e) => setSettings(prev => ({ ...prev, outputFormat: e.target.value as WatermarkSettings['outputFormat'] }))}
                className="w-full p-2.5 rounded-xl bg-secondary border border-border/85 hover:border-primary/30 focus:border-primary focus:outline-none text-sm font-semibold transition-all [color-scheme:light] dark:[color-scheme:dark]"
              >
                <option value="original">Keep original format</option>
                <option value="image/jpeg">Convert to JPEG</option>
                <option value="image/png">Convert to PNG (Lossless)</option>
                <option value="image/webp">Convert to WebP</option>
              </select>
            </div>

            {(settings.outputFormat === "image/jpeg" || settings.outputFormat === "image/webp") && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground">Export Quality</span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold">{settings.quality}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={1}
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({ ...prev, quality: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}
          </div>

        </section>

        {/* RIGHT PANEL: LIVE PREVIEW + BATCH QUEUE AREA (2-Column Span on Desktop) */}
        <section className="lg:col-span-2 space-y-6 flex flex-col items-center">
          
          {/* Dropzone or Preview display */}
          {imagesList.length === 0 ? (
            <div className="w-full">
              <ImageSourceInput
                multiple={true}
                onImagesReady={(files) => {
                  setProvenance({
                    sourceToolId: "watermark",
                    sourceType: "user-upload",
                    aiProcessingBlocked: false,
                  });
                  handleImagesAdded(files);
                }}
                onImageReady={(file) => {
                  setProvenance({
                    sourceToolId: "watermark",
                    sourceType: "user-upload",
                    aiProcessingBlocked: false,
                  });
                  handleImagesAdded([file]);
                }}
                maxSizeMB={50}
              />
            </div>
          ) : (
            <div className="w-full space-y-4">
              
              {/* Canvas Preview Box */}
              <div className="w-full rounded-2xl bg-card border border-border/60 shadow-md p-4 flex flex-col items-center justify-center relative min-h-[300px]">
                
                {/* Note message */}
                <div className="absolute top-3 right-3 text-[10px] text-muted-foreground font-bold px-2 py-1 bg-secondary rounded-lg border border-border/45 z-10">
                  Preview shows first image
                </div>

                <div
                  className="relative bg-canvas rounded-xl p-3 flex items-center justify-center border border-border/40 overflow-hidden shadow-inner max-w-full"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    className="max-h-[350px] sm:max-h-[420px] object-contain rounded-md w-full"
                    style={{
                      touchAction: settings.placement === 'free' ? 'none' : 'auto'
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  />
                </div>

                <p className="text-[10px] text-muted-foreground font-semibold text-center mt-2">
                  {t("tools.watermark.previewResolutionNotice")}
                </p>
              </div>

              {/* Progress and Process block */}
              <div className="w-full p-4 sm:p-5 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4">
                
                {/* Batch processing state bar */}
                {processingProgress.stage !== 'idle' && (
                  <div className="space-y-2.5 animate-fade-in">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-primary uppercase tracking-wider text-[10px]">
                        {processingProgress.stage === 'processing'
                          ? `Processing full-resolution images (${processingProgress.current + 1}/${processingProgress.total})`
                          : processingProgress.stage === 'zipping'
                          ? "Assembling ZIP file archive..."
                          : "Watermarking completed!"}
                      </span>
                      <span className="text-foreground shrink-0">
                        {displayPct}%
                      </span>
                    </div>
                    
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden border border-border/50">
                      <div
                        className="h-full bg-primary transition-all duration-300 rounded-full"
                        style={{
                          width: `${displayPct}%`,
                        }}
                      />
                    </div>
                    
                    {processingProgress.stage === 'processing' && (
                      <p className="text-[10px] text-muted-foreground truncate leading-normal">
                        Rendering: {processingProgress.filename}
                      </p>
                    )}
                  </div>
                )}

                <FilenameField
                  showLabel={true}
                  value={filename.value}
                  onChange={filename.onChange}
                  ext={imagesList.length > 1 ? "zip" : resolvedExt}
                  placeholder={defaultStem}
                  className="mb-2"
                />

                {/* Primary Button Trigger */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={imagesList.length === 1 ? () => handleSingleExport(imagesList[0]) : handleBatchExport}
                    disabled={isProcessing || imagesList.some(item => item.status === 'pending' || item.status === 'processing')}
                    className="flex-1 py-6 text-sm font-extrabold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>
                          {imagesList.length === 1
                            ? "Apply & Download Image"
                            : `Apply & Download ${imagesList.filter(item => item.status === 'ready').length} Images`}
                        </span>
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={clearImagesList}
                    disabled={isProcessing}
                    className="py-6 px-6 text-sm font-extrabold rounded-xl border border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary/40 shrink-0 gap-2 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Batch</span>
                  </Button>
                </div>
                {imagesList.length === 1 && watermarkedImage && (
                  <ContinueWith
                    currentToolId="watermark"
                    outputBlob={watermarkedImage}
                    outputFileName={`${filename.resolve()}.${resolvedExt}`}
                    provenance={provenance}
                    onStartOver={clearImagesList}
                  />
                )}
              </div>

              {/* Batch Queue File List */}
              <div className="w-full p-4 sm:p-5 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    Images Queue list ({imagesList.length} / 30)
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => addMoreFileInputRef.current?.click()}
                    disabled={imagesList.length >= 30}
                    className="text-xs font-bold gap-1 text-primary hover:bg-primary/5 hover:text-primary rounded-lg h-8 px-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add More
                  </Button>
                </div>

                <div className="max-h-[250px] overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
                  {imagesList.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${idx === 0 ? "bg-primary/5 border-primary/20" : "bg-secondary/20 border-border/60"}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={item.previewUrl}
                          alt="Thumbnail preview"
                          className="w-10 h-10 object-cover rounded border border-border bg-card shrink-0"
                        />
                        <div className="text-left overflow-hidden">
                          <p className="text-xs font-bold truncate text-foreground max-w-[150px] sm:max-w-[280px]">
                            {item.file.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatBytes(item.file.size)} {item.width > 0 && `· ${item.width} × ${item.height}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Order navigation */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveImageItem(idx, 'up')}
                              disabled={idx === 0}
                              aria-label="Move item up"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Move Up
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveImageItem(idx, 'down')}
                              disabled={idx === imagesList.length - 1}
                              aria-label="Move item down"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Move Down
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImageItem(item.id)}
                              aria-label="Remove item from queue"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg ml-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Remove Image
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>

                <input
                  type="file"
                  ref={addMoreFileInputRef}
                   onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setProvenance({
                        sourceToolId: "watermark",
                        sourceType: "user-upload",
                        aiProcessingBlocked: false,
                      });
                      handleImagesAdded(Array.from(e.target.files));
                    }
                  }}
                  multiple
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />
              </div>

            </div>
          )}

        </section>

      </div>

      <div className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-10 z-10 flex flex-col gap-6 sm:gap-10">
        {/* How It Works Guide Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-4 animate-fade-in">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Protect and brand your photos in four quick steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Upload",
                text: t("tools.watermark.howItWorks.step1"),
              },
              {
                step: "02",
                title: "Configure",
                text: t("tools.watermark.howItWorks.step2"),
              },
              {
                step: "03",
                title: "Position",
                text: t("tools.watermark.howItWorks.step3"),
              },
              {
                step: "04",
                title: "Download",
                text: t("tools.watermark.howItWorks.step4"),
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border/40 shadow-sm relative flex flex-col gap-2.5"
              >
                <span className="text-2xl font-black text-primary/25 absolute top-4 right-5 select-none font-mono">
                  {item.step}
                </span>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What You Can Do Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-2 animate-fade-in">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              What You Can Do
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Protect your work and build your brand with customizable watermark options.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Protect your work",
                text: t("tools.watermark.useCases.case1"),
              },
              {
                title: "Brand every image",
                text: t("tools.watermark.useCases.case2"),
              },
              {
                title: "Bulk-watermark",
                text: t("tools.watermark.useCases.case3"),
              },
              {
                title: "Tile for safety",
                text: t("tools.watermark.useCases.case4"),
              },
            ].map((useCase, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border/40 shadow-sm flex flex-col gap-2"
              >
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                  {useCase.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {useCase.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-2 animate-fade-in">
          <div className="text-center sm:text-left flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: t("tools.watermark.faq.q1"),
                a: t("tools.watermark.faq.a1"),
              },
              {
                q: t("tools.watermark.faq.q2"),
                a: t("tools.watermark.faq.a2"),
              },
              {
                q: t("tools.watermark.faq.q3"),
                a: t("tools.watermark.faq.a3"),
              },
              {
                q: t("tools.watermark.faq.q4"),
                a: t("tools.watermark.faq.a4"),
              },
              {
                q: t("tools.watermark.faq.q5"),
                a: t("tools.watermark.faq.a5"),
              },
              {
                q: t("tools.watermark.faq.q6"),
                a: t("tools.watermark.faq.a6"),
              },
            ].map((faq, idx) => (
              <div key={idx} className="space-y-1.5 p-1">
                <h3 className="text-xs sm:text-sm font-extrabold text-foreground flex gap-1.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-5.5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Tools internal link block */}
        <section className="max-w-4xl mx-auto w-full space-y-4 pt-4 animate-fade-in">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground text-center sm:text-left">
            Related Privacy Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/tools/exif-cleaner"
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    EXIF Privacy Cleaner
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {t("shared.related.exif-cleaner-info")}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </Link>

            <Link
              href="/tools/blur"
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Blur & Redact Image
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {t("shared.related.blur")}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </Link>
          </div>
        </section>

        {/* Info panel highlighting offline privacy */}
        <PrivacyNotice>
          <p>
            {t("tools.watermark.privacyNotice")}
          </p>
        </PrivacyNotice>
      </div>

    </main>
  );
}
