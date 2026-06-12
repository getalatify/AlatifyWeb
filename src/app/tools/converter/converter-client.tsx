/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ThemeToggle, DownloadButton, Logo, PrivacyNotice } from "@/components/shared";
import { ImageSourceInput } from "@/components/image-source-input";
import { UrlInputHelp } from "@/components/url-input-help";
import { Button } from "@/components/ui/button";
import { usePendingImage } from "@/hooks/use-pending-image";
import { 
  ArrowLeft, 
  RefreshCw, 
  Trash2, 
  Image as ImageIcon,
  Settings,
  Loader2,
  CheckCircle2,
  Sparkles,
  Palette,
  Sliders,
  AlertCircle,
  FileText,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  HelpCircle,
  Minimize2,
  Maximize2
} from "lucide-react";
import { formatBytes, getImageFormat } from "@/lib/utils/format";
import { toast } from "sonner";

export default function FormatConverterPage() {
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

  const [imagesList, setImagesList] = useState<ImageItem[]>([]);
  const [conversionProgress, setConversionProgress] = useState<{
    total: number;
    current: number;
    filename: string;
    stage: 'idle' | 'converting' | 'pdf' | 'zip' | 'done';
  }>({
    total: 0,
    current: 0,
    filename: "",
    stage: "idle"
  });

  const activeImage = imagesList.length === 1 ? imagesList[0].file : null;
  const activeImageUrl = imagesList.length === 1 ? imagesList[0].previewUrl : null;
  const sourcePreviewUrl = imagesList.length === 1 ? imagesList[0].sourcePreviewUrl : null;
  const originalDimensions = imagesList.length === 1 ? { width: imagesList[0].width, height: imagesList[0].height } : null;
  const hasTransparency = imagesList.length === 1 ? imagesList[0].hasTransparency : false;

  // Warnings / Notices
  const heicError = imagesList.length === 1 && imagesList[0].status === 'error' ? imagesList[0].error || null : null;
  const svgWarning = imagesList.length === 1 ? imagesList[0].warning || null : null;
  const tiffNotice = imagesList.length === 1 ? imagesList[0].warning || null : null;

  const handlePendingImageReady = (file: File) => {
    handleImagesAdded([file]);
  };
  const { isProcessing: isProcessingPending } = usePendingImage(handlePendingImageReady);

  const clearActiveImage = () => {
    clearImagesList();
  };

  const setActiveImage = (file: File) => {
    handleImagesAdded([file]);
  };

  const handleAddMoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImagesAdded(Array.from(e.target.files));
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreFileInputRef = useRef<HTMLInputElement>(null);

  const handleAddMoreClick = () => {
    addMoreFileInputRef.current?.click();
  };

  // Parameter States
  const [targetFormat, setTargetFormat] = useState<string>("image/webp");
  const [quality, setQuality] = useState<number>(90);
  const [transparencyFill, setTransparencyFill] = useState<'white' | 'custom'>('white');
  const [customFillColor, setCustomFillColor] = useState<string>("#ffffff");
  const [svgPreset, setSvgPreset] = useState<"detailed" | "posterized2">("detailed");

  // Status & Logic States
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [showSlowMessage, setShowSlowMessage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Slow Conversion Helper
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isConverting) {
      setShowSlowMessage(false);
      timer = setTimeout(() => {
        setShowSlowMessage(true);
      }, 5000);
    } else {
      setShowSlowMessage(false);
    }
    return () => clearTimeout(timer);
  }, [isConverting]);

  // SVG Guard & Performance States
  const [svgAcceptedWarning, setSvgAcceptedWarning] = useState<boolean>(false);
  const [isHardBlocked, setIsHardBlocked] = useState<boolean>(false);
  const [wasSvgDownscaled, setWasSvgDownscaled] = useState<boolean>(false);

  // Output States
  const [convertedImage, setConvertedImage] = useState<Blob | File | null>(null);
  const [convertedImageUrl, setConvertedImageUrl] = useState<string | null>(null);

  // 1. Programmatic transparent pixel checker
  const checkImageTransparency = (imageUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const size = 100; // downscaled bounding box for fast scanning
          canvas.width = Math.min(img.naturalWidth, size);
          canvas.height = Math.min(img.naturalHeight, size);
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(false);
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          
          for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 255) {
              resolve(true);
              return;
            }
          }
          resolve(false);
        } catch {
          resolve(false);
        }
      };
      img.onerror = () => resolve(false);
      img.src = imageUrl;
    });
  };

  // 2. Programmatic SVG dimensions parser
  const parseSvgDimensions = async (file: Blob): Promise<{ width: number; height: number }> => {
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "image/svg+xml");
      const svg = doc.querySelector("svg");
      if (!svg) return { width: 800, height: 800 };
      
      const w = svg.getAttribute("width");
      const h = svg.getAttribute("height");
      const viewBox = svg.getAttribute("viewBox");
      
      if (w && h && !w.includes("%") && !h.includes("%")) {
        return { width: parseInt(w), height: parseInt(h) };
      }
      
      if (viewBox) {
        const parts = viewBox.trim().split(/\s+/);
        if (parts.length === 4) {
          const vw = parseInt(parts[2]);
          const vh = parseInt(parts[3]);
          if (vw > 0 && vh > 0) {
            return { width: vw, height: vh };
          }
        }
      }
      return { width: 800, height: 800 };
    } catch {
      return { width: 800, height: 800 };
    }
  };

  // 3. Programmatic SVG external reference scanner
  const checkSvgExternalReferences = async (file: Blob): Promise<boolean> => {
    try {
      const text = await file.text();
      const hasExternalHttp = text.includes("http://") || text.includes("https://");
      const hasExternalImage = /<image[^>]*xlink:href=["'](http|https)/i.test(text) || /<image[^>]*href=["'](http|https)/i.test(text);
      const hasExternalFont = text.includes("@import") || text.includes("<font") || text.includes("@font-face");
      return hasExternalHttp || hasExternalImage || hasExternalFont;
    } catch {
      return false;
    }
  };

  // 4. Custom 32-Bit BGRA BMP Exporter
  const generateBmpBlob = (canvas: HTMLCanvasElement): Blob => {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get BMP offscreen context.");
    
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data; // RGBA, top-to-bottom
    
    const headerSize = 14;
    const dibSize = 40;
    const pixelDataSize = width * height * 4;
    const fileSize = headerSize + dibSize + pixelDataSize;
    
    const bmpBytes = new Uint8Array(fileSize);
    const view = new DataView(bmpBytes.buffer);
    
    // Write File Header (14 bytes)
    bmpBytes[0] = 0x42; // 'B'
    bmpBytes[1] = 0x4D; // 'M'
    view.setUint32(2, fileSize, true); // File size
    view.setUint32(6, 0, true);        // Reserved
    view.setUint32(10, headerSize + dibSize, true); // Offset to pixel data
    
    // Write DIB Header (40 bytes)
    view.setUint32(14, dibSize, true);  // DIB size (40)
    view.setInt32(18, width, true);     // Width
    view.setInt32(22, height, true);    // Height (positive = bottom-to-top)
    view.setUint16(26, 1, true);        // Planes
    view.setUint16(28, 32, true);       // Bits per pixel (32 = RGBA)
    view.setUint32(30, 0, true);        // Compression (0 = uncompressed)
    view.setUint32(34, pixelDataSize, true); // Image data size
    view.setInt32(38, 2835, true);      // X PPM
    view.setInt32(42, 2835, true);      // Y PPM
    view.setUint32(46, 0, true);
    view.setUint32(50, 0, true);
    
    // Write Pixel data (BGRA order, bottom-to-top)
    let offset = headerSize + dibSize;
    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const rgbaOffset = (y * width + x) * 4;
        const r = data[rgbaOffset + 0];
        const g = data[rgbaOffset + 1];
        const b = data[rgbaOffset + 2];
        const a = data[rgbaOffset + 3];
        
        bmpBytes[offset + 0] = b;
        bmpBytes[offset + 1] = g;
        bmpBytes[offset + 2] = r;
        bmpBytes[offset + 3] = a;
        offset += 4;
      }
    }
    
    return new Blob([bmpBytes], { type: "image/bmp" });
  };

  // 5. Custom Favicon ICO Buffer Exporter (sizes: 16x16, 32x32, 48x48 packed as PNGs)
  const generateIcoBlob = async (img: HTMLImageElement): Promise<Blob> => {
    const sizes = [16, 32, 48];
    const pngBuffers: ArrayBuffer[] = [];
    
    // Scale and transcode PNGs
    for (const size of sizes) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to create ICO offscreen canvas.");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, size, size);
      
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("ICO layer PNG transcoding failed.");
      pngBuffers.push(await blob.arrayBuffer());
    }
    
    const headerSize = 6;
    const dirSize = 16 * sizes.length;
    let currentOffset = headerSize + dirSize;
    
    const totalSize = currentOffset + pngBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    const icoBytes = new Uint8Array(totalSize);
    const view = new DataView(icoBytes.buffer);
    
    // Write Header
    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true); // ICO Type (1)
    view.setUint16(4, sizes.length, true);
    
    // Write Directories and Copy buffers
    let dirOffset = headerSize;
    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      const buffer = pngBuffers[i];
      const length = buffer.byteLength;
      
      icoBytes[dirOffset + 0] = size;
      icoBytes[dirOffset + 1] = size;
      icoBytes[dirOffset + 2] = 0; // Colors
      icoBytes[dirOffset + 3] = 0; // Reserved
      view.setUint16(dirOffset + 4, 1, true); // Planes
      view.setUint16(dirOffset + 6, 32, true); // BPP
      view.setUint32(dirOffset + 8, length, true); // Size
      view.setUint32(dirOffset + 12, currentOffset, true); // Offset
      
      icoBytes.set(new Uint8Array(buffer), currentOffset);
      dirOffset += 16;
      currentOffset += length;
    }
    
    return new Blob([icoBytes], { type: "image/x-icon" });
  };

  // Process individual image file metadata and transcode if HEIC/TIFF
  const processImageFile = React.useCallback(async (file: File): Promise<{
    width: number;
    height: number;
    hasTransparency: boolean;
    sourcePreviewUrl: string | null;
    error: string | null;
    warning: string | null;
  }> => {
    const formatStr = getImageFormat(file).toLowerCase();
    const fileUrl = URL.createObjectURL(file);

    try {
      // CASE A: HEIC / HEIF
      if (formatStr === "heic" || formatStr === "heif" || file.type === "image/heic" || file.type === "image/heif") {
        const heic2any = (await import("heic2any")).default;
        const converted = await heic2any({
          blob: file,
          toType: "image/png"
        });
        const resolvedBlob = Array.isArray(converted) ? converted[0] : converted;
        const sourceUrl = URL.createObjectURL(resolvedBlob);

        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const tempImg = new Image();
          tempImg.onload = () => resolve(tempImg);
          tempImg.onerror = () => reject(new Error("HEIC transcoded image failed to load."));
          tempImg.src = sourceUrl;
        });

        return {
          width: img.naturalWidth,
          height: img.naturalHeight,
          hasTransparency: true,
          sourcePreviewUrl: sourceUrl,
          error: null,
          warning: null
        };
      } 
      // CASE B: TIFF / TIF
      else if (formatStr === "tiff" || formatStr === "tif" || file.type.includes("tiff")) {
        const UTIF = await import("utif");
        const buffer = await file.arrayBuffer();
        const ifds = UTIF.decode(buffer);
        let warning = null;
        if (ifds.length > 1) {
          warning = "Multi-page TIFF detected — converting first page only";
        }
        
        UTIF.decodeImage(buffer, ifds[0]);
        const rgba = UTIF.toRGBA8(ifds[0]);
        const width = ifds[0].width;
        const height = ifds[0].height;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to initialize TIFF offscreen decoder.");
        
        const imgData = new ImageData(new Uint8ClampedArray(rgba.buffer as ArrayBuffer), width, height);
        ctx.putImageData(imgData, 0, 0);

        const dataUrl = canvas.toDataURL("image/png");
        return {
          width,
          height,
          hasTransparency: true,
          sourcePreviewUrl: dataUrl,
          error: null,
          warning
        };
      }
      // CASE C: SVG
      else if (formatStr === "svg" || file.type === "image/svg+xml") {
        const dimensions = await parseSvgDimensions(file);
        const hasRefs = await checkSvgExternalReferences(file);
        let warning = null;
        if (hasRefs) {
          warning = "SVG contains external references that may not render correctly";
        }
        return {
          width: dimensions.width,
          height: dimensions.height,
          hasTransparency: true,
          sourcePreviewUrl: fileUrl,
          error: null,
          warning
        };
      }
      // CASE D: Standard images
      else {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const tempImg = new Image();
          tempImg.onload = () => resolve(tempImg);
          tempImg.onerror = () => reject(new Error("Image source failed to load."));
          tempImg.src = fileUrl;
        });

        let hasTrans = false;
        const supportsAlpha = formatStr === "png" || formatStr === "webp" || formatStr === "gif";
        if (supportsAlpha) {
          hasTrans = await checkImageTransparency(fileUrl);
        }

        return {
          width: img.naturalWidth,
          height: img.naturalHeight,
          hasTransparency: hasTrans,
          sourcePreviewUrl: fileUrl,
          error: null,
          warning: null
        };
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      return {
        width: 0,
        height: 0,
        hasTransparency: false,
        sourcePreviewUrl: null,
        error: errorObj.message || "Failed to parse incoming file format.",
        warning: null
      };
    }
  }, []);

  // Background processing of pending files.
  // Each pending image is loaded/decoded in its OWN independent promise so that
  // one image's load can never cancel or discard another's. A ref-backed Set
  // dedupes items that are already being processed, which keeps this effect from
  // re-starting (or, worse, abandoning) in-flight work when `imagesList` changes
  // as each item flips to 'processing' / 'ready'.
  const processingIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const pendingItems = imagesList.filter(
      item => item.status === 'pending' && !processingIdsRef.current.has(item.id)
    );
    if (pendingItems.length === 0) return;

    pendingItems.forEach((pendingItem) => {
      processingIdsRef.current.add(pendingItem.id);

      // Mark this specific item as processing (does not affect the others).
      setImagesList(prev =>
        prev.map(item =>
          item.id === pendingItem.id ? { ...item, status: 'processing' } : item
        )
      );

      // Load + decode this image independently, in its own promise.
      (async () => {
        let result: Awaited<ReturnType<typeof processImageFile>>;
        try {
          // processImageFile wires up onload AND onerror, so a failed/stalled
          // load rejects and is caught here instead of hanging the spinner.
          result = await processImageFile(pendingItem.file);
        } catch (err) {
          result = {
            width: 0,
            height: 0,
            hasTransparency: false,
            sourcePreviewUrl: null,
            error: (err as Error)?.message || 'Failed to process image.',
            warning: null,
          };
        }

        setImagesList(prev => {
          // If the item was removed while it was loading, drop the result and
          // free the object URL we just created (no premature revocation: this
          // only runs AFTER the load has fully completed).
          if (!prev.some(item => item.id === pendingItem.id)) {
            if (result.sourcePreviewUrl && result.sourcePreviewUrl.startsWith('blob:')) {
              URL.revokeObjectURL(result.sourcePreviewUrl);
            }
            return prev;
          }
          return prev.map(item => {
            if (item.id !== pendingItem.id) return item;
            return {
              ...item,
              status: result.error ? 'error' : 'ready',
              width: result.width,
              height: result.height,
              hasTransparency: result.hasTransparency,
              sourcePreviewUrl: result.sourcePreviewUrl || item.previewUrl,
              error: result.error || undefined,
              warning: result.warning || undefined,
            };
          });
        });

        processingIdsRef.current.delete(pendingItem.id);
      })();
    });
  }, [imagesList, processImageFile]);

  // Clean up all object URLs when component unmounts
  const imagesListRef = useRef(imagesList);
  useEffect(() => {
    imagesListRef.current = imagesList;
  }, [imagesList]);

  useEffect(() => {
    return () => {
      imagesListRef.current.forEach(item => {
        if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
        if (item.sourcePreviewUrl && item.sourcePreviewUrl !== item.previewUrl && item.sourcePreviewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.sourcePreviewUrl);
        }
      });
    };
  }, []);

  const handleImagesAdded = (files: File[]) => {
    if (imagesList.length + files.length > 30) {
      toast.warning("Maximum of 30 images allowed per batch. Some files were skipped.");
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
    setConvertedImage(null);
  };

  const removeImageItem = (id: string) => {
    const item = imagesList.find(i => i.id === id);
    if (item) {
      if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
      if (item.sourcePreviewUrl && item.sourcePreviewUrl !== item.previewUrl && item.sourcePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.sourcePreviewUrl);
      }
    }
    setImagesList(prev => prev.filter(i => i.id !== id));
    setConvertedImage(null);
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
    setConvertedImage(null);
  };

  const clearImagesList = () => {
    imagesList.forEach(item => {
      if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
      if (item.sourcePreviewUrl && item.sourcePreviewUrl !== item.previewUrl && item.sourcePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.sourcePreviewUrl);
      }
    });
    setImagesList([]);
    setConvertedImage(null);
    setConvertedImageUrl(null);
    setConversionProgress({ total: 0, current: 0, filename: "", stage: "idle" });
    setError(null);
  };

  // Manage converted URL lifecycles
  useEffect(() => {
    if (!convertedImage) {
      setConvertedImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(convertedImage);
    setConvertedImageUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [convertedImage]);

  // 7. Reusable convert single image to Blob function
  const convertImageToBlob = async (
    file: File,
    sourceUrl: string,
    width: number,
    height: number,
    hasTransparency: boolean,
    targetF: string,
    targetQ: number,
    targetFill: 'white' | 'custom',
    targetColor: string
  ): Promise<Blob> => {
    // 1. Load image onto offscreen cache
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const tempImg = new Image();
      tempImg.onload = () => resolve(tempImg);
      tempImg.onerror = () => reject(new Error("Failed to load source graphics layer."));
      tempImg.src = sourceUrl;
    });

    // ICO
    if (targetF === "image/x-icon") {
      return await generateIcoBlob(img);
    }

    // BMP
    if (targetF === "image/bmp") {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to initialize BMP offscreen canvas.");
      
      if (hasTransparency) {
        ctx.fillStyle = targetFill === "white" ? "#ffffff" : targetColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return generateBmpBlob(canvas);
    }

    // GIF (Single Frame)
    if (targetF === "image/gif") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const GIFClass = (await import("gif.js")).default as any;
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) throw new Error("Failed to initialize GIF offscreen context.");

      tempCtx.drawImage(img, 0, 0);

      const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imgData.data;
      let hasTransparentPixel = false;

      const transR = 255;
      const transG = 0;
      const transB = 255;

      for (let i = 0; i < data.length; i += 4) {
        const a = data[i+3];
        if (a === 0) {
          data[i] = transR;
          data[i+1] = transG;
          data[i+2] = transB;
          data[i+3] = 255;
          hasTransparentPixel = true;
        } else if (a > 0 && a < 255) {
          data[i] = 255;
          data[i+1] = 255;
          data[i+2] = 255;
          data[i+3] = 255;
        }
      }

      tempCtx.putImageData(imgData, 0, 0);

      return await new Promise<Blob>((resolvePromise, rejectPromise) => {
        try {
          const gif = new GIFClass({
            workers: 2,
            quality: 10,
            transparent: hasTransparentPixel ? 0xff00ff : null,
            workerScript: "/gif.worker.js",
            width: tempCanvas.width,
            height: tempCanvas.height,
          });

          gif.on("finished", (blob: Blob) => {
            resolvePromise(blob);
          });

          gif.on("error", (err: unknown) => {
            rejectPromise(err);
          });

          gif.addFrame(tempCtx, { delay: 0, copy: true });
          gif.render();
        } catch (err) {
          rejectPromise(err);
        }
      });
    }

    // TIFF
    if (targetF === "image/tiff") {
      const UTIF = await import("utif");
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to initialize TIFF offscreen canvas.");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const tiffBuffer = UTIF.encodeImage(new Uint8Array(imageData.data.buffer as ArrayBuffer), canvas.width, canvas.height);
      return new Blob([tiffBuffer], { type: "image/tiff" });
    }

    // SVG
    if (targetF === "image/svg+xml") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ImageTracer = (await import("imagetracerjs")).default as any;
      const canvas = document.createElement("canvas");
      
      let targetWidth = width;
      let targetHeight = height;
      const maxDimension = 1000;

      if (targetWidth > maxDimension || targetHeight > maxDimension) {
        if (targetWidth > targetHeight) {
           targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
           targetWidth = maxDimension;
        } else {
           targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
           targetHeight = maxDimension;
        }
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to initialize SVG offscreen canvas.");
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      const logoIconOptions = {
        numberofcolors: 8,
        pathomit: 8,
        colorquantcycles: 3,
        ltres: 1,
        qtres: 1,
        blurradius: 0,
        strokewidth: 1,
      };

      const photoArtisticOptions = {
        numberofcolors: 16,
        pathomit: 4,
        colorquantcycles: 3,
        ltres: 1.5,
        qtres: 1.5,
        blurradius: 2,
        strokewidth: 0,
      };

      const options = svgPreset === "detailed" ? logoIconOptions : photoArtisticOptions;
      const svgString = ImageTracer.imagedataToSVG(imageData, options);
      
      if (!svgString) throw new Error("Vectorization resulted in an empty output.");
      return new Blob([svgString], { type: "image/svg+xml" });
    }

    // STANDARD JPG/PNG/WEBP
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to initialize offscreen canvas context.");
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (targetF === "image/jpeg") {
      ctx.fillStyle = targetFill === "white" ? "#ffffff" : targetColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Graphics encoder failed to write pixels."));
          }
        },
        targetF,
        targetF === "image/png" ? undefined : targetQ / 100
      );
    });
  };

  // Core single image conversion resolver
  const performConversion = async (
    targetF?: string,
    targetQ?: number,
    targetFill?: 'white' | 'custom',
    targetColor?: string
  ) => {
    if (!activeImage || !originalDimensions || (!activeImageUrl && !sourcePreviewUrl)) return;
    if (heicError) return;

    const activeFormat = targetF ?? targetFormat;
    const activeQuality = targetQ ?? quality;
    const activeFill = targetFill ?? transparencyFill;
    const activeColor = targetColor ?? customFillColor;

    const totalPixels = originalDimensions.width * originalDimensions.height;
    if (activeFormat === "image/svg+xml") {
      if (totalPixels > 1000000) {
        setIsHardBlocked(true);
        setIsConverting(false);
        return;
      } else {
        setIsHardBlocked(false);
      }

      if (totalPixels >= 250000 && !svgAcceptedWarning) {
        setIsConverting(false);
        return;
      }
    } else {
      setIsHardBlocked(false);
    }

    setIsConverting(true);
    setError(null);
    
    const sourceUrl = sourcePreviewUrl || activeImageUrl;

    try {
      // PDF Exporter
      if (activeFormat === "application/pdf") {
        const { jsPDF } = await import("jspdf");
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const tempImg = new Image();
          tempImg.onload = () => resolve(tempImg);
          tempImg.onerror = () => reject(new Error("Failed to load source graphics layer."));
          tempImg.src = sourceUrl!;
        });

        const canvas = document.createElement("canvas");
        canvas.width = originalDimensions.width;
        canvas.height = originalDimensions.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to initialize PDF renderer.");
        
        ctx.fillStyle = activeFill === "white" ? "#ffffff" : activeColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const jpegUrl = canvas.toDataURL("image/jpeg", activeQuality / 100);
        const doc = new jsPDF({
          orientation: originalDimensions.width > originalDimensions.height ? "landscape" : "portrait",
          unit: "px",
          format: [originalDimensions.width, originalDimensions.height]
        });
        
        doc.addImage(jpegUrl, "JPEG", 0, 0, originalDimensions.width, originalDimensions.height, undefined, "FAST");
        const pdfBlob = doc.output("blob");
        
        const baseName = (activeImage as File).name.replace(/\.[^/.]+$/, "");
        const fileObj = new File([pdfBlob], `${baseName}.pdf`, {
          type: "application/pdf"
        });
        
        setConvertedImage(fileObj);
        setIsConverting(false);
        return;
      }

      // Other formats
      const blob = await convertImageToBlob(
        activeImage,
        sourceUrl!,
        originalDimensions.width,
        originalDimensions.height,
        hasTransparency,
        activeFormat,
        activeQuality,
        activeFill,
        activeColor
      );

      const ext = activeFormat === "image/jpeg" ? "jpg" : 
                  activeFormat === "image/png" ? "png" : 
                  activeFormat === "image/webp" ? "webp" : 
                  activeFormat === "image/x-icon" ? "ico" : 
                  activeFormat === "image/bmp" ? "bmp" : 
                  activeFormat === "image/gif" ? "gif" : 
                  activeFormat === "image/tiff" ? "tiff" : 
                  activeFormat === "image/svg+xml" ? "svg" : "bin";

      const baseName = (activeImage as File).name.replace(/\.[^/.]+$/, "");
      const newFilename = `${baseName}.${ext}`;

      const fileObj = new File([blob], newFilename, {
        type: activeFormat
      });

      setConvertedImage(fileObj);
      setIsConverting(false);

    } catch (err: unknown) {
      console.error("Conversion error", err);
      const errorObj = err as Error;
      setError(errorObj.message || "Canvas transcoding operation failed.");
      setConvertedImage(null);
      setIsConverting(false);
    }
  };

  // Core multi-image batch conversion resolver
  const performBatchConversion = async () => {
    const readyItems = imagesList.filter(item => item.status === 'ready');
    if (readyItems.length === 0) return;

    setIsConverting(true);
    setError(null);
    setConvertedImage(null);

    setConversionProgress({
      total: readyItems.length,
      current: 0,
      filename: readyItems[0].file.name,
      stage: 'converting'
    });

    try {
      if (targetFormat === "application/pdf") {
        // PDF compilation
        const { jsPDF } = await import("jspdf");
        let doc: InstanceType<typeof jsPDF> | null = null;
        
        for (let i = 0; i < readyItems.length; i++) {
          const item = readyItems[i];
          setConversionProgress(prev => ({
            ...prev,
            current: i,
            filename: item.file.name,
            stage: 'converting'
          }));

          const sourceUrl = item.sourcePreviewUrl || item.previewUrl;
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const tempImg = new Image();
            tempImg.onload = () => resolve(tempImg);
            tempImg.onerror = () => reject(new Error(`Failed to load ${item.file.name}`));
            tempImg.src = sourceUrl;
          });

          const canvas = document.createElement("canvas");
          canvas.width = item.width;
          canvas.height = item.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Failed to initialize PDF renderer.");
          
          ctx.fillStyle = transparencyFill === "white" ? "#ffffff" : customFillColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const jpegUrl = canvas.toDataURL("image/jpeg", quality / 100);
          const orientation = item.width > item.height ? "landscape" : "portrait";
          
          if (i === 0) {
            doc = new jsPDF({
              orientation,
              unit: "px",
              format: [item.width, item.height]
            });
          } else if (doc) {
            doc.addPage([item.width, item.height], orientation);
          }
          
          if (doc) {
            doc.addImage(jpegUrl, "JPEG", 0, 0, item.width, item.height, undefined, "FAST");
          }
        }

        if (!doc) {
          throw new Error("PDF document was not initialized.");
        }

        setConversionProgress(prev => ({
          ...prev,
          current: readyItems.length,
          stage: 'pdf'
        }));

        const pdfBlob = doc.output("blob");
        const fileObj = new File([pdfBlob], "converted.pdf", {
          type: "application/pdf"
        });

        setConvertedImage(fileObj);
      } else {
        // ZIP bundling
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        const usedFilenames = new Set<string>();

        for (let i = 0; i < readyItems.length; i++) {
          const item = readyItems[i];
          setConversionProgress(prev => ({
            ...prev,
            current: i,
            filename: item.file.name,
            stage: 'converting'
          }));

          const sourceUrl = item.sourcePreviewUrl || item.previewUrl;
          const blob = await convertImageToBlob(
            item.file,
            sourceUrl,
            item.width,
            item.height,
            item.hasTransparency,
            targetFormat,
            quality,
            transparencyFill,
            customFillColor
          );

          const ext = targetFormat === "image/jpeg" ? "jpg" : 
                      targetFormat === "image/png" ? "png" : 
                      targetFormat === "image/webp" ? "webp" : 
                      targetFormat === "image/x-icon" ? "ico" : 
                      targetFormat === "image/bmp" ? "bmp" : 
                      targetFormat === "image/gif" ? "gif" : 
                      targetFormat === "image/tiff" ? "tiff" : 
                      targetFormat === "image/svg+xml" ? "svg" : "bin";

          const baseName = item.file.name.replace(/\.[^/.]+$/, "");
          let newFilename = `${baseName}.${ext}`;
          
          let counter = 1;
          while (usedFilenames.has(newFilename)) {
            newFilename = `${baseName}_${counter}.${ext}`;
            counter++;
          }
          usedFilenames.add(newFilename);

          zip.file(newFilename, blob);
        }

        setConversionProgress(prev => ({
          ...prev,
          current: readyItems.length,
          stage: 'zip'
        }));

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const fileObj = new File([zipBlob], "converted-images.zip", {
          type: "application/zip"
        });

        setConvertedImage(fileObj);
      }

      setConversionProgress(prev => ({
        ...prev,
        stage: 'done'
      }));
      setIsConverting(false);

    } catch (err: unknown) {
      console.error("Batch conversion error", err);
      const errorObj = err as Error;
      setError(errorObj.message || "Batch conversion failed.");
      setIsConverting(false);
      setConversionProgress(prev => ({ ...prev, stage: 'idle' }));
    }
  };


  // When active image changes, initialize settings and clear output
  useEffect(() => {
    if (activeImage) {
      const originalFormat = getImageFormat(activeImage).toLowerCase();
      const defaultTarget = originalFormat === "png" ? "image/webp" : "image/png";
      setTargetFormat(defaultTarget);
      setQuality(90);
      setTransparencyFill("white");
      setCustomFillColor("#ffffff");
    }
    setConvertedImage(null);
  }, [activeImage]);

  // Replace file helper
  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setActiveImage(e.target.files[0]);
    }
  };

  // Determine metadata
  const originalSize = activeImage?.size ?? 0;
  const convertedSize = convertedImage?.size ?? 0;
  const originalFormatStr = activeImage ? getImageFormat(activeImage) : "";
  
  // Format descriptor maps for nicer UX
  const getFormatDisplay = (mime: string): string => {
    if (mime === "image/jpeg") return "JPEG";
    if (mime === "image/png") return "PNG";
    if (mime === "image/webp") return "WebP";
    if (mime === "application/pdf") return "PDF";
    if (mime === "image/bmp") return "BMP";
    if (mime === "image/x-icon") return "ICO";
    if (mime === "image/tiff" || mime === "image/tif") return "TIFF";
    if (mime === "image/gif") return "GIF";
    if (mime === "image/svg+xml") return "SVG";
    return mime.replace("image/", "").toUpperCase();
  };

  const convertedFormatStr = convertedImage ? getFormatDisplay(convertedImage.type) : "";

  const isLossyFormat = targetFormat === "image/jpeg" || targetFormat === "image/webp" || targetFormat === "application/pdf";
  const showTransparencyPanel = hasTransparency && (
    targetFormat === "image/jpeg" || 
    targetFormat === "image/bmp" || 
    targetFormat === "image/x-icon" || 
    targetFormat === "application/pdf"
  );

  const getProgressPercentage = () => {
    if (conversionProgress.stage === 'idle') return 0;
    if (conversionProgress.stage === 'pdf' || conversionProgress.stage === 'zip' || conversionProgress.stage === 'done') return 100;
    if (conversionProgress.total === 0) return 0;
    return Math.round((conversionProgress.current / conversionProgress.total) * 100);
  };

  const getProgressStatusText = () => {
    switch (conversionProgress.stage) {
      case 'converting':
        return `Converting image ${conversionProgress.current + 1} of ${conversionProgress.total}: ${conversionProgress.filename}`;
      case 'pdf':
        return "Generating PDF...";
      case 'zip':
        return "Bundling ZIP...";
      case 'done':
        return "Done!";
      default:
        return "";
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip">
      {/* Background Glows for Premium Vibe */}
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

      {/* Hidden File Input for Replace */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/avif, image/bmp, image/heic, image/heif, image/tiff, image/tif, image/svg+xml"
        className="hidden"
      />

      <div className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-10 z-10 flex flex-col gap-6 sm:gap-10">
        {/* Intro Header */}
        <section className="text-center sm:text-left space-y-2 sm:space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-fade-in">
            <RefreshCw className="w-3.5 h-3.5 text-primary" />
            Image Format Converter
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Convert Images Between Any Format
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            Convert images between nine formats — including web favorites like WebP, design formats like SVG and TIFF, and specialty formats like ICO (favicons) and PDF — entirely in your browser. Drag in multiple files, pick an output format, and convert in one click. No upload, no sign-up, no watermark — your files never leave your device.
          </p>
        </section>

        {/* Dynamic Warning Alert banners */}
        {activeImage && (tiffNotice || svgWarning || heicError) && (
          <div className="space-y-2 max-w-6xl w-full animate-fade-in">
            {heicError && (
              <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex gap-2.5 items-start text-xs font-bold shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{heicError}</span>
              </div>
            )}
            {svgWarning && (
              <div className="p-3.5 bg-warning/10 border border-warning/20 text-warning rounded-2xl flex gap-2.5 items-start text-xs font-bold shadow-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{svgWarning}</span>
              </div>
            )}
            {tiffNotice && (
              <div className="p-3.5 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex gap-2.5 items-start text-xs font-bold shadow-sm">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{tiffNotice}</span>
              </div>
            )}
          </div>
        )}

        {/* Conditional Layout */}
        {/* Conditional Layout */}
        {isProcessingPending ? (
          <section className="flex-1 flex flex-col items-center justify-center py-12 max-w-xl mx-auto w-full">
            <div className="p-8 bg-card rounded-2xl border border-border/60 shadow-lg flex flex-col items-center gap-3 max-w-[250px] text-center animate-pulse">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs font-bold text-foreground">Fetching stock photo...</span>
              <span className="text-[10px] text-muted-foreground">Running securely via proxy</span>
            </div>
          </section>
        ) : imagesList.length === 0 ? (
          /* BEFORE UPLOAD centerpiece empty state */
          <section className="flex-1 flex flex-col items-center justify-center py-12 max-w-xl mx-auto w-full">
            <ImageSourceInput 
              multiple={true}
              onImagesReady={handleImagesAdded}
              onImageReady={setActiveImage} 
              className="w-full animate-fade-in" 
            />
          </section>
        ) : imagesList.length === 1 ? (
          /* SINGLE IMAGE WORKSPACE ACTIVE */
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full animate-fade-in">
            
            {/* Previews Area (Stacks vertically on mobile, side-by-side on desktop) */}
            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
                
                {/* 1. ORIGINAL PREVIEW */}
                <div className="w-full max-w-md md:max-w-none mx-auto p-3 sm:p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Original
                    </span>
                    <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
                      {originalSize > 0 ? formatBytes(originalSize) : "Loading..."}
                    </span>
                  </div>

                  <div 
                    className="relative bg-canvas rounded-xl p-4 flex flex-col items-center justify-center aspect-[4/3] sm:aspect-square border border-border/50 overflow-hidden shadow-inner"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "repeat",
                    }}
                  >
                    {isConverting && !sourcePreviewUrl ? (
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    ) : sourcePreviewUrl ? (
                      <img
                        src={sourcePreviewUrl}
                        alt="Source original preview"
                        className="object-contain w-full h-full rounded-md max-h-[180px] sm:max-h-[260px] md:max-h-[350px]"
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground">Parsing image data...</div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="font-medium truncate max-w-[120px] sm:max-w-[150px]">
                      {(activeImage as File).name || "original_file"}
                    </span>
                    <span className="font-semibold shrink-0">
                      {originalDimensions 
                        ? `${originalDimensions.width} × ${originalDimensions.height} · ${originalFormatStr.toUpperCase()}`
                        : "---"}
                    </span>
                  </div>
                </div>

                {/* 2. CONVERTED PREVIEW */}
                <div className="w-full max-w-md md:max-w-none mx-auto p-3 sm:p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-3 sm:gap-4 relative">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-primary" />
                      Converted
                    </span>
                    <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
                      {isConverting 
                        ? "Converting..." 
                        : convertedSize > 0 
                        ? formatBytes(convertedSize) 
                        : "---"}
                    </span>
                  </div>

                  <div 
                    className="relative bg-canvas rounded-xl p-4 flex flex-col items-center justify-center aspect-[4/3] sm:aspect-square border border-border/50 overflow-hidden shadow-inner"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "repeat",
                    }}
                  >
                    {/* Dynamic Loader */}
                    {isConverting && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3 animate-fade-in">
                        <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-lg flex flex-col items-center gap-2.5 max-w-[240px] text-center">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          <span className="text-xs font-bold text-foreground">
                            {targetFormat === "image/svg+xml" && originalDimensions && (originalDimensions.width * originalDimensions.height >= 62500)
                              ? "Tracing in progress..."
                              : "Transcoding..."}
                          </span>
                          {showSlowMessage && (
                            <span className="text-[10px] text-muted-foreground animate-pulse leading-normal">
                              This may take a moment for larger images...
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {error ? (
                      <div className="p-4 flex flex-col items-center text-center gap-2 text-destructive max-w-[200px]">
                        <AlertCircle className="w-8 h-8" />
                        <span className="text-xs font-bold leading-relaxed">{error}</span>
                      </div>
                    ) : isHardBlocked ? (
                      <div className="p-5 flex flex-col items-center text-center gap-3.5 max-w-[260px] animate-fade-in z-20">
                        <AlertCircle className="w-8 h-8 text-destructive animate-pulse" />
                        <div className="space-y-1">
                          <span className="text-xs font-extrabold text-destructive block">Image Too Large</span>
                          <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                            Image too large for SVG tracing (max 1000 × 1000 supported). Resize image first using our Resizer tool, or use PNG/WebP for photos.
                          </p>
                        </div>
                        <Link href="/tools/resizer" className="w-full">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-[10px] font-bold py-1 border-destructive/25 hover:bg-destructive/10 text-destructive gap-1 shadow-sm"
                          >
                            Go to Resizer
                          </Button>
                        </Link>
                      </div>
                    ) : targetFormat === "image/svg+xml" && originalDimensions && (originalDimensions.width * originalDimensions.height >= 250000) && !svgAcceptedWarning ? (
                      <div className="p-5 flex flex-col items-center text-center gap-3.5 max-w-[260px] animate-fade-in z-20">
                        <AlertTriangle className="w-8 h-8 text-warning animate-bounce" />
                        <div className="space-y-1">
                          <span className="text-xs font-extrabold text-warning block">Large Vector Tracing</span>
                          <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                            Tracing this size ({originalDimensions.width} × {originalDimensions.height}) may take 30+ seconds and produce a large SVG file. Continue?
                          </p>
                        </div>
                        <div className="flex gap-2 w-full pt-1">
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => setSvgAcceptedWarning(true)} 
                            className="text-[10px] font-bold py-1 flex-1 bg-warning hover:bg-warning/80 text-warning-foreground shadow-sm"
                          >
                            Continue
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => {
                              setTargetFormat("image/webp");
                              setSvgAcceptedWarning(false);
                            }} 
                            className="text-[10px] font-bold py-1 flex-1 shadow-sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : targetFormat === "application/pdf" && convertedImageUrl ? (
                      /* Display document icon / details if output is PDF */
                      <div className="flex flex-col items-center justify-center text-center gap-3 p-4 select-none animate-fade-in">
                        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center shadow-sm">
                          <FileText className="w-10 h-10 animate-pulse" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-foreground block">PDF Document Ready</span>
                          <span className="text-[10px] text-muted-foreground font-medium block">
                            High-res layout compiled offline.
                          </span>
                        </div>
                      </div>
                    ) : convertedImageUrl ? (
                      <img
                        src={convertedImageUrl}
                        alt="Transcoded converted preview"
                        className="object-contain w-full h-full rounded-md max-h-[180px] sm:max-h-[260px] md:max-h-[350px]"
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground flex flex-col items-center gap-1">
                        <RefreshCw className="w-8 h-8 opacity-40 animate-pulse" />
                        <span>Ready to convert</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="font-medium">
                      {isConverting ? "Encoding..." : error ? "Failed" : "Preview Target"}
                    </span>
                    <span className="font-semibold shrink-0">
                      {convertedImage && !isConverting && !error && originalDimensions
                        ? `${originalDimensions.width} × ${originalDimensions.height} · ${convertedFormatStr}`
                        : "---"}
                    </span>
                  </div>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-card rounded-2xl border border-border/60 shadow-sm w-full">
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                  Need to convert another image?
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReplaceClick}
                    disabled={isConverting}
                    className="gap-1.5 text-xs border-border hover:bg-muted text-foreground flex-1 sm:flex-none"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Replace Image
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearActiveImage}
                    disabled={isConverting}
                    className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            {/* CONTROLS PANEL (RIGHT SIDEBAR) */}
            <div className="lg:col-span-1 p-4 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-md space-y-5 sm:space-y-8 w-full flex flex-col justify-between">
              
              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-center gap-2 border-b border-border/40 pb-2.5 sm:pb-3">
                  <Settings className="w-4 h-4 text-primary" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
                    Conversion Settings
                  </h2>
                </div>

                {/* Selection Dropdown with optgroups */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">
                    Target Format
                  </label>
                  <select
                    value={targetFormat}
                    onChange={(e) => {
                      setTargetFormat(e.target.value);
                      setSvgAcceptedWarning(false);
                      setIsHardBlocked(false);
                      setWasSvgDownscaled(false);
                    }}
                    disabled={isConverting}
                    className="w-full p-2.5 sm:p-3 rounded-xl bg-secondary border border-border hover:border-primary/30 focus:border-primary focus:outline-none text-sm font-semibold transition-all duration-150 disabled:opacity-50"
                  >
                    <optgroup label="Standard">
                      <option value="image/webp">Convert to WebP (Optimized)</option>
                      <option value="image/png">Convert to PNG (Lossless)</option>
                      <option value="image/jpeg">Convert to JPEG (JPG)</option>
                    </optgroup>
                    <optgroup label="Vector">
                      <option value="image/svg+xml">Convert to SVG (Tracing)</option>
                    </optgroup>
                    <optgroup label="Document">
                      <option value="application/pdf">Convert to PDF (High Resolution)</option>
                    </optgroup>
                    <optgroup label="Legacy">
                      <option value="image/bmp">Convert to BMP (32-bit Alpha)</option>
                      <option value="image/tiff">Convert to TIFF (Uncompressed)</option>
                      <option value="image/gif">Convert to GIF (Single Frame)</option>
                    </optgroup>
                    <optgroup label="Web">
                      <option value="image/x-icon">Convert to Favicon (ICO Multi-size)</option>
                    </optgroup>
                  </select>

                  {/* SVG Permanent Tracing Warning Banner */}
                  {targetFormat === "image/svg+xml" && (
                    <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[10px] font-semibold leading-relaxed animate-fade-in flex gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        SVG tracing best for logos, icons, and simple graphics up to 500 × 500 pixels. Larger or complex images produce stylized results. For pixel-perfect photo conversion, use PNG or WebP instead.
                      </span>
                    </div>
                  )}

                  {/* TIFF Uncompressed Warning Banner */}
                  {targetFormat === "image/tiff" && (
                    <div className="p-3 bg-warning/10 border border-warning/20 text-warning rounded-xl text-[10px] font-bold leading-relaxed animate-fade-in flex gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>TIFF uncompressed format. File size will be larger than JPG/WebP.</span>
                    </div>
                  )}
                </div>

                {/* CONDITIONAL CONTROL 1: QUALITY SLIDER */}
                {isLossyFormat && (
                  <div className="space-y-3 pt-2 border-t border-border/40 animate-fade-in">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-primary" />
                        Target Quality
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-extrabold">
                        {quality}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      disabled={isConverting}
                      className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                      <span>50 (Aggressive Size)</span>
                      <span>100 (Maximum Quality)</span>
                    </div>
                  </div>
                )}

                {/* HIDE NOTICE FOR LOSSLESS & TRACING FORMATS */}
                {(targetFormat === "image/png" || targetFormat === "image/bmp" || targetFormat === "image/x-icon" || targetFormat === "image/gif") && (
                  <div className="p-3 bg-secondary/50 border border-border/40 rounded-xl text-[10px] text-muted-foreground font-medium leading-relaxed animate-fade-in">
                    {targetFormat === "image/png" && "PNG is a lossless format, quality sliders are hidden. Edges will be preserved at maximum visual accuracy."}
                    {targetFormat === "image/bmp" && "BMP uncompressed output maintains mathematical color data. Transparency channel is preserved."}
                    {targetFormat === "image/x-icon" && "ICO icon packages three standard layers (16x16, 32x32, 48x48) utilizing high-fidelity PNG containers."}
                    {targetFormat === "image/gif" && "GIF encodes a single static frame limited to 256 colors. 1-bit transparency is supported."}
                  </div>
                )}

                {/* CONDITIONAL CONTROL: SVG TRACING PRESET SELECTOR */}
                {targetFormat === "image/svg+xml" && (
                  <div className="space-y-3 pt-3 border-t border-border/40 animate-fade-in">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-primary" />
                        Tracing Style Preset
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl border border-border/60 text-xs font-bold">
                      <button
                        onClick={() => setSvgPreset("detailed")}
                        disabled={isConverting}
                        className={`py-2 rounded-lg transition-all duration-150 ${svgPreset === "detailed" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Logo/Icon
                      </button>
                      <button
                        onClick={() => setSvgPreset("posterized2")}
                        disabled={isConverting}
                        className={`py-2 rounded-lg transition-all duration-150 ${svgPreset === "posterized2" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Photo/Artistic
                      </button>
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-relaxed pl-1">
                      {svgPreset === "detailed" 
                        ? "Logo/Icon: Traces fine contours with high color counts. Perfect for logos and graphics." 
                        : "Photo/Artistic: Posterizes image with smooth, stylized layers. Ideal for photography."}
                    </div>
                  </div>
                )}

                {/* CONDITIONAL CONTROL 2: TRANSPARENCY HANDLING (flatten backdrops) */}
                {showTransparencyPanel && (
                  <div className="space-y-4 pt-3 border-t border-border/40 animate-fade-in">
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-primary" />
                        Transparency Backdrop
                      </span>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Selected target format does not fully guarantee native alpha channel rendering. Fill transparent pixels:
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl border border-border/60 text-xs font-bold">
                      <button
                        onClick={() => setTransparencyFill("white")}
                        className={`py-2 rounded-lg transition-all duration-150 ${transparencyFill === "white" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        White Solid
                      </button>
                      <button
                        onClick={() => setTransparencyFill("custom")}
                        className={`py-2 rounded-lg transition-all duration-150 ${transparencyFill === "custom" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Custom Color
                      </button>
                    </div>

                    {/* Custom Hex Color Picker Palette */}
                    {transparencyFill === "custom" && (
                      <div className="flex items-center gap-3 pl-1 pt-1 animate-fade-in">
                        <input
                          type="color"
                          value={customFillColor}
                          onChange={(e) => setCustomFillColor(e.target.value)}
                          disabled={isConverting}
                          className="w-9 h-9 p-0 rounded-lg border border-border cursor-pointer bg-transparent shadow-sm shrink-0"
                        />
                        <div className="space-y-1 w-full">
                          <input
                            type="text"
                            value={customFillColor}
                            onChange={(e) => {
                              if (e.target.value.startsWith("#") && e.target.value.length <= 7) {
                                setCustomFillColor(e.target.value);
                              }
                            }}
                            disabled={isConverting}
                            placeholder="#ffffff"
                            className="w-full p-2 bg-secondary border border-border rounded-xl text-xs font-extrabold uppercase focus:outline-none focus:border-primary disabled:opacity-50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Download banner trigger */}
              <div className="pt-4 sm:pt-6 border-t border-border/40 space-y-3 sm:space-y-4">
                {convertedImage && !isConverting && !error && originalDimensions && (
                  <div className="p-3 sm:p-4 rounded-xl bg-success/5 border border-success/15 text-[10px] text-muted-foreground leading-relaxed animate-fade-in flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>
                      {targetFormat === "image/svg+xml" && wasSvgDownscaled ? (
                        `Successfully generated downscaled tracing (${originalDimensions.width} × ${originalDimensions.height} downscaled to 1000px max bound).`
                      ) : (
                        `Successfully transcoded to ${convertedFormatStr} preserving original ${originalDimensions.width} × ${originalDimensions.height} high resolution bounds.`
                      )}
                    </span>
                  </div>
                )}

                {/* Manual Convert Button */}
                <Button
                  onClick={() => performConversion()}
                  disabled={isConverting || !activeImage}
                  className="w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all duration-150 gap-2 shrink-0 flex items-center justify-center"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin animate-fade-in" />
                      Converting...
                    </>
                  ) : convertedImage ? (
                    "Re-convert Image"
                  ) : (
                    "Convert Image"
                  )}
                </Button>

                <DownloadButton
                  file={convertedImage}
                  filenamePrefix="converted"
                  originalFilename={(activeImage as File).name ?? "image"}
                  disabled={isConverting || !convertedImage}
                  className="w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 shadow-md active:scale-[0.98] transition-all duration-150 gap-2 shrink-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  Download Converted File
                </DownloadButton>
              </div>

            </div>

          </section>
        ) : (
          /* BATCH WORKSPACE ACTIVE */
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full animate-fade-in">
            
            {/* Batch List Area (Left Column) */}
            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 w-full">
              <div className="bg-card border border-border/60 rounded-2xl p-4 sm:p-6 shadow-md space-y-5">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    Batch Images Queue
                  </span>
                  <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
                    {imagesList.length} / 30 Images
                  </span>
                </div>

                {/* Queue list container */}
                <div className="max-h-[420px] overflow-y-auto custom-scrollbar space-y-3 pr-1">
                  {imagesList.map((item, index) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/40 transition-colors duration-150 gap-3"
                    >
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-lg bg-canvas border border-border/50 overflow-hidden shrink-0 flex items-center justify-center relative">
                        {item.status === 'processing' || item.status === 'pending' ? (
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        ) : (
                          <img 
                            src={item.sourcePreviewUrl || item.previewUrl} 
                            alt={item.file.name} 
                            className="object-contain w-full h-full"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate" title={item.file.name}>
                          {item.file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {formatBytes(item.file.size)}
                          </span>
                          {item.width > 0 && item.height > 0 && (
                            <span className="text-[10px] text-muted-foreground/85 font-medium">
                              · {item.width} × {item.height}
                            </span>
                          )}
                          {item.status === 'ready' && (
                            <span className="text-[10px] text-success font-bold flex items-center gap-0.5">
                              · Ready
                            </span>
                          )}
                          {item.status === 'error' && (
                            <span className="text-[10px] text-destructive font-bold flex items-center gap-0.5" title={item.error}>
                              · Error
                            </span>
                          )}
                        </div>
                        {item.warning && (
                          <p className="text-[9px] text-warning font-semibold truncate mt-0.5">
                            ⚠️ {item.warning}
                          </p>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveImageItem(index, 'up')}
                          disabled={index === 0 || isConverting}
                          className="w-8 h-8 rounded-lg hover:bg-secondary border border-transparent disabled:opacity-40"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveImageItem(index, 'down')}
                          disabled={index === imagesList.length - 1 || isConverting}
                          className="w-8 h-8 rounded-lg hover:bg-secondary border border-transparent disabled:opacity-40"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImageItem(item.id)}
                          disabled={isConverting}
                          className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress bar container (shows when converting) */}
                {isConverting && (
                  <div className="p-4 bg-secondary/20 border border-border/50 rounded-xl space-y-2.5 animate-fade-in">
                    <div className="flex justify-between items-center text-xs font-bold text-foreground">
                      <span>Progress</span>
                      <span className="text-primary font-extrabold">{getProgressPercentage()}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden border border-border/25 shadow-inner">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-300 ease-out" 
                        style={{ width: `${getProgressPercentage()}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed animate-pulse">
                      {getProgressStatusText()}
                    </p>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-4 border-t border-border/40">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddMoreClick}
                      disabled={isConverting || imagesList.length >= 30}
                      className="gap-1.5 text-xs font-bold border-border hover:bg-muted text-foreground flex-1 sm:flex-none"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Images
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearImagesList}
                      disabled={isConverting}
                      className="gap-1.5 text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear Queue
                    </Button>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    PDF combines into single file · Others batch into ZIP
                  </span>
                </div>
              </div>

              {/* Hidden file input for adding more */}
              <input
                type="file"
                ref={addMoreFileInputRef}
                onChange={handleAddMoreChange}
                multiple
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/avif, image/bmp, image/heic, image/heif, image/tiff, image/tif, image/svg+xml"
                className="hidden"
              />
            </div>

            {/* CONTROLS PANEL (RIGHT SIDEBAR) */}
            <div className="lg:col-span-1 p-4 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-md space-y-5 sm:space-y-8 w-full flex flex-col justify-between">
              
              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-center gap-2 border-b border-border/40 pb-2.5 sm:pb-3">
                  <Settings className="w-4 h-4 text-primary" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
                    Conversion Settings
                  </h2>
                </div>

                {/* Selection Dropdown with optgroups */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">
                    Target Format
                  </label>
                  <select
                    value={targetFormat}
                    onChange={(e) => {
                      setTargetFormat(e.target.value);
                      setSvgAcceptedWarning(false);
                      setIsHardBlocked(false);
                      setWasSvgDownscaled(false);
                    }}
                    disabled={isConverting}
                    className="w-full p-2.5 sm:p-3 rounded-xl bg-secondary border border-border hover:border-primary/30 focus:border-primary focus:outline-none text-sm font-semibold transition-all duration-150 disabled:opacity-50"
                  >
                    <optgroup label="Standard">
                      <option value="image/webp">Convert to WebP (Optimized)</option>
                      <option value="image/png">Convert to PNG (Lossless)</option>
                      <option value="image/jpeg">Convert to JPEG (JPG)</option>
                    </optgroup>
                    <optgroup label="Vector">
                      <option value="image/svg+xml">Convert to SVG (Tracing)</option>
                    </optgroup>
                    <optgroup label="Document">
                      <option value="application/pdf">Convert to PDF (High Resolution)</option>
                    </optgroup>
                    <optgroup label="Legacy">
                      <option value="image/bmp">Convert to BMP (32-bit Alpha)</option>
                      <option value="image/tiff">Convert to TIFF (Uncompressed)</option>
                      <option value="image/gif">Convert to GIF (Single Frame)</option>
                    </optgroup>
                    <optgroup label="Web">
                      <option value="image/x-icon">Convert to Favicon (ICO Multi-size)</option>
                    </optgroup>
                  </select>

                  {/* SVG Permanent Tracing Warning Banner */}
                  {targetFormat === "image/svg+xml" && (
                    <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[10px] font-semibold leading-relaxed animate-fade-in flex gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        SVG tracing best for logos, icons, and simple graphics up to 500 × 500 pixels. Larger or complex images produce stylized results. For pixel-perfect photo conversion, use PNG or WebP instead.
                      </span>
                    </div>
                  )}

                  {/* TIFF Uncompressed Warning Banner */}
                  {targetFormat === "image/tiff" && (
                    <div className="p-3 bg-warning/10 border border-warning/20 text-warning rounded-xl text-[10px] font-bold leading-relaxed animate-fade-in flex gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>TIFF uncompressed format. File size will be larger than JPG/WebP.</span>
                    </div>
                  )}
                </div>

                {/* CONDITIONAL CONTROL 1: QUALITY SLIDER */}
                {isLossyFormat && (
                  <div className="space-y-3 pt-2 border-t border-border/40 animate-fade-in">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-primary" />
                        Target Quality
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-extrabold">
                        {quality}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      disabled={isConverting}
                      className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                      <span>50 (Aggressive Size)</span>
                      <span>100 (Maximum Quality)</span>
                    </div>
                  </div>
                )}

                {/* HIDE NOTICE FOR LOSSLESS & TRACING FORMATS */}
                {(targetFormat === "image/png" || targetFormat === "image/bmp" || targetFormat === "image/x-icon" || targetFormat === "image/gif") && (
                  <div className="p-3 bg-secondary/50 border border-border/40 rounded-xl text-[10px] text-muted-foreground font-medium leading-relaxed animate-fade-in">
                    {targetFormat === "image/png" && "PNG is a lossless format, quality sliders are hidden. Edges will be preserved at maximum visual accuracy."}
                    {targetFormat === "image/bmp" && "BMP uncompressed output maintains mathematical color data. Transparency channel is preserved."}
                    {targetFormat === "image/x-icon" && "ICO icon packages three standard layers (16x16, 32x32, 48x48) utilizing high-fidelity PNG containers."}
                    {targetFormat === "image/gif" && "GIF encodes a single static frame limited to 256 colors. 1-bit transparency is supported."}
                  </div>
                )}

                {/* CONDITIONAL CONTROL: SVG TRACING PRESET SELECTOR */}
                {targetFormat === "image/svg+xml" && (
                  <div className="space-y-3 pt-3 border-t border-border/40 animate-fade-in">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-primary" />
                        Tracing Style Preset
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl border border-border/60 text-xs font-bold">
                      <button
                        onClick={() => setSvgPreset("detailed")}
                        disabled={isConverting}
                        className={`py-2 rounded-lg transition-all duration-150 ${svgPreset === "detailed" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Logo/Icon
                      </button>
                      <button
                        onClick={() => setSvgPreset("posterized2")}
                        disabled={isConverting}
                        className={`py-2 rounded-lg transition-all duration-150 ${svgPreset === "posterized2" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Photo/Artistic
                      </button>
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-relaxed pl-1">
                      {svgPreset === "detailed" 
                        ? "Logo/Icon: Traces fine contours with high color counts. Perfect for logos and graphics." 
                        : "Photo/Artistic: Posterizes image with smooth, stylized layers. Ideal for photography."}
                    </div>
                  </div>
                )}

                {/* CONDITIONAL CONTROL 2: TRANSPARENCY HANDLING (flatten backdrops) */}
                {showTransparencyPanel && (
                  <div className="space-y-4 pt-3 border-t border-border/40 animate-fade-in">
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-primary" />
                        Transparency Backdrop
                      </span>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Selected target format does not fully guarantee native alpha channel rendering. Fill transparent pixels:
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl border border-border/60 text-xs font-bold">
                      <button
                        onClick={() => setTransparencyFill("white")}
                        className={`py-2 rounded-lg transition-all duration-150 ${transparencyFill === "white" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        White Solid
                      </button>
                      <button
                        onClick={() => setTransparencyFill("custom")}
                        className={`py-2 rounded-lg transition-all duration-150 ${transparencyFill === "custom" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Custom Color
                      </button>
                    </div>

                    {/* Custom Hex Color Picker Palette */}
                    {transparencyFill === "custom" && (
                      <div className="flex items-center gap-3 pl-1 pt-1 animate-fade-in">
                        <input
                          type="color"
                          value={customFillColor}
                          onChange={(e) => setCustomFillColor(e.target.value)}
                          disabled={isConverting}
                          className="w-9 h-9 p-0 rounded-lg border border-border cursor-pointer bg-transparent shadow-sm shrink-0"
                        />
                        <div className="space-y-1 w-full">
                          <input
                            type="text"
                            value={customFillColor}
                            onChange={(e) => {
                              if (e.target.value.startsWith("#") && e.target.value.length <= 7) {
                                setCustomFillColor(e.target.value);
                              }
                            }}
                            disabled={isConverting}
                            placeholder="#ffffff"
                            className="w-full p-2 bg-secondary border border-border rounded-xl text-xs font-extrabold uppercase focus:outline-none focus:border-primary disabled:opacity-50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Download banner trigger */}
              <div className="pt-4 sm:pt-6 border-t border-border/40 space-y-3 sm:space-y-4">
                {convertedImage && !isConverting && !error && (
                  <div className="p-3 sm:p-4 rounded-xl bg-success/5 border border-success/15 text-[10px] text-muted-foreground leading-relaxed animate-fade-in flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>
                      {targetFormat === "application/pdf" 
                        ? "Successfully compiled all images into a single multi-page PDF."
                        : `Successfully converted all images and bundled into a ZIP archive.`}
                    </span>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-[10px] font-semibold flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Manual Convert Button */}
                <Button
                  onClick={() => performBatchConversion()}
                  disabled={isConverting || imagesList.filter(item => item.status === 'ready').length === 0}
                  className="w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all duration-150 gap-2 shrink-0 flex items-center justify-center"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin animate-fade-in" />
                      Converting Batch...
                    </>
                  ) : convertedImage ? (
                    "Re-convert Batch"
                  ) : (
                    "Convert Batch"
                  )}
                </Button>

                <DownloadButton
                  file={convertedImage}
                  originalFilename={targetFormat === "application/pdf" ? "converted.pdf" : "converted-images.zip"}
                  disabled={isConverting || !convertedImage}
                  className="w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 shadow-md active:scale-[0.98] transition-all duration-150 gap-2 shrink-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  {targetFormat === "application/pdf" ? "Download Combined PDF" : "Download ZIP Archive"}
                </DownloadButton>
              </div>

            </div>

          </section>
        )}
        {imagesList.length === 0 && <UrlInputHelp />}

        {/* How It Works Guide Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Convert image formats in four quick steps.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Upload",
                text: "Add one or many images (drag-drop or file picker).",
              },
              {
                step: "02",
                title: "Choose format",
                text: "Pick your output: JPG, PNG, WebP, PDF, ICO, SVG, TIFF, BMP, or GIF.",
              },
              {
                step: "03",
                title: "Convert",
                text: "Process them all at once, instantly, on your device.",
              },
              {
                step: "04",
                title: "Download",
                text: "Save individually, or grab everything as a ZIP.",
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

        {/* Use Cases Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              What You Can Do
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Convert files for any design, print, or web deployment scenario.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "PNG ↔ WebP",
                text: "Shrink images for faster-loading websites without quality loss.",
              },
              {
                title: "Image to ICO",
                text: "Create favicons for your website in the correct format.",
              },
              {
                title: "Image to PDF",
                text: "Combine several images into a single multi-page PDF.",
              },
              {
                title: "Image to SVG",
                text: "Trace raster images into scalable vector graphics.",
              },
              {
                title: "HEIC to JPG",
                text: "Convert iPhone photos into universally compatible JPGs.",
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
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: "Which formats can I convert between?",
                a: "JPG, PNG, WebP, PDF, ICO, SVG, TIFF, BMP, and GIF — plus HEIC input from iPhones.",
              },
              {
                q: "Does it upload my files to a server?",
                a: "No. Conversion runs entirely in your browser; your files never leave your device.",
              },
              {
                q: "Can I convert many images at once?",
                a: "Yes — drag in multiple files, convert them all in one click, and download as a ZIP.",
              },
              {
                q: "How do I convert a PNG to an ICO favicon?",
                a: "Upload the PNG, choose ICO as the output format, and download — ready to use as a site favicon.",
              },
              {
                q: "Can I convert HEIC photos from my iPhone?",
                a: "Yes. Add your HEIC files and convert them to JPG or PNG instantly.",
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

        {/* Related Tools Section */}
        <section className="max-w-4xl mx-auto w-full space-y-4 pt-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground text-center sm:text-left">
            Related Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/tools/compressor"
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors">
                  <Minimize2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Image Compressor
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Reduce file sizes by up to 90% while keeping quality.
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </Link>

            <Link
              href="/tools/resizer"
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Image Resizer
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Resize image dimensions by percentage or pixels.
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
            Alatify processes your graphics files completely locally using sandbox APIs inside your browser tab. We never upload any of your files or private coordinates to external clouds, making the tool 100% immune to leaks or server-side logging. Convert images between JPG, PNG, WebP, PDF, ICO, SVG, TIFF, BMP, and GIF formats instantly and privately on your own device.
          </p>
        </PrivacyNotice>
      </div>
    </main>
  );
}
