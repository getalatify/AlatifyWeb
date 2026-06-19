/* eslint-disable @next/next/no-img-element */
"use client";

import { useT } from "@/lib/i18n/useT";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Header, PrivacyNotice } from "@/components/shared";
import { ImageSourceInput } from "@/components/image-source-input";
import { UrlInputHelp } from "@/components/url-input-help";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { toast } from "sonner";
import { EyeOff, Trash2, Undo, Sliders, Image as ImageIcon, HelpCircle, Shield, Brush, Box, CheckCircle2, Info, Download, AlertTriangle, Scissors } from "lucide-react";
import { formatBytes } from "@/lib/utils/format";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

interface Region {
  id: string;
  type: "box" | "brush";
  x: number;
  y: number;
  w: number;
  h: number;
  points: { x: number; y: number }[];
  brushSize: number;
  effect: "blur" | "pixelate" | "solid";
  blurStrength: number;
  pixelSize: number;
}

export default function BlurClient() {
  const t = useT();
  const [activeImage, setActiveImage] = useState<File | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const faceDetectorRef = useRef<FaceDetector | null>(null);
  
  // UI Panel Controls
  const [drawMode, setDrawMode] = useState<"box" | "brush">("box");
  const [activeEffect, setActiveEffect] = useState<"blur" | "pixelate" | "solid">("blur");
  const [activeBlurStrength, setActiveBlurStrength] = useState<number>(25);
  const [activePixelSize, setActivePixelSize] = useState<number>(16);
  const [activeBrushSize, setActiveBrushSize] = useState<number>(40);
  const [regions, setRegions] = useState<Region[]>([]);
  const [exportFormat, setExportFormat] = useState<"image/png" | "image/jpeg">("image/png");

  // Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: 0, h: 0 });
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);

  // Brush Cursor Hover State
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const completedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const effectCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Intercept window.fetch to cache WASM and model assets locally
  useEffect(() => {
    if (typeof window === "undefined" || !("caches" in window)) return;

    const originalFetch = window.fetch;
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === "string" ? input : (input instanceof URL ? input.href : input.url);

      if (url.includes("/wasm/") || url.includes("/models/")) {
        try {
          const cache = await caches.open("alatify-model-cache");
          const cachedResponse = await cache.match(url);
          if (cachedResponse) {
            return cachedResponse;
          }
          const response = await originalFetch(input, init);
          if (response.ok) {
            await cache.put(url, response.clone());
          }
          return response;
        } catch {
          return originalFetch(input, init);
        }
      }
      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Clean up object URL on change
  useEffect(() => {
    if (!activeImage) {
      setOriginalDimensions(null);
      setRegions([]);
      return;
    }

    const url = URL.createObjectURL(activeImage);

    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      imageRef.current = img;
      setRegions([]); // Reset on new image
    };
    img.onerror = () => {
      toast.error("Failed to load image structure. Verify file integrity.");
    };
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [activeImage]);

  // Redraw canvas to active state wrapped in useCallback to fix eslint react-hooks/exhaustive-deps
  const drawCanvas = useCallback((isExporting = false) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);

    // Helper: Mask pixel data from effect source onto main context
    const drawMaskedEffect = (
      c: CanvasRenderingContext2D,
      region: Region,
      effectCanvas: HTMLCanvasElement
    ) => {
      const { type, x, y, w, h, points, brushSize } = region;

      c.save();
      if (type === "box") {
        c.drawImage(effectCanvas, x, y, w, h, x, y, w, h);
      } else if (type === "brush" && points.length > 0) {
        // Generate standard mask using composition
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const maskCtx = maskCanvas.getContext("2d");
        if (maskCtx) {
          maskCtx.lineCap = "round";
          maskCtx.lineJoin = "round";
          maskCtx.lineWidth = brushSize;
          maskCtx.strokeStyle = "white";
          maskCtx.beginPath();
          maskCtx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            maskCtx.lineTo(points[i].x, points[i].y);
          }
          maskCtx.stroke();

          maskCtx.globalCompositeOperation = "source-in";
          maskCtx.drawImage(effectCanvas, 0, 0);

          c.drawImage(maskCanvas, 0, 0);
        }
      }
      c.restore();
    };

    // Helper: Apply Blur/Pixelate/Solid effects onto target context
    const applyRegionEffect = (c: CanvasRenderingContext2D, region: Region) => {
      const img = imageRef.current;
      if (!img) return;

      const { type, x, y, w, h, points, brushSize, effect, blurStrength, pixelSize } = region;

      if (effect === "solid") {
        c.save();
        c.fillStyle = "black";
        if (type === "box") {
          c.fillRect(x, y, w, h);
        } else if (type === "brush" && points.length > 0) {
          c.lineWidth = brushSize;
          c.lineCap = "round";
          c.lineJoin = "round";
          c.strokeStyle = "black";
          c.beginPath();
          c.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            c.lineTo(points[i].x, points[i].y);
          }
          c.stroke();
        }
        c.restore();
      } else if (effect === "blur") {
        // Create blurred version of image
        const blurCanvas = document.createElement("canvas");
        blurCanvas.width = img.naturalWidth;
        blurCanvas.height = img.naturalHeight;
        const blurCtx = blurCanvas.getContext("2d");
        if (blurCtx) {
          blurCtx.filter = `blur(${blurStrength}px)`;
          blurCtx.drawImage(img, 0, 0);
          drawMaskedEffect(c, region, blurCanvas);
        }
      } else if (effect === "pixelate") {
        // Create pixelated version of image
        const pixelCanvas = document.createElement("canvas");
        pixelCanvas.width = img.naturalWidth;
        pixelCanvas.height = img.naturalHeight;
        const pixelCtx = pixelCanvas.getContext("2d");
        if (pixelCtx) {
          const scale = 1 / pixelSize;
          const tempW = Math.max(1, Math.round(img.naturalWidth * scale));
          const tempH = Math.max(1, Math.round(img.naturalHeight * scale));

          const smallCanvas = document.createElement("canvas");
          smallCanvas.width = tempW;
          smallCanvas.height = tempH;
          const smallCtx = smallCanvas.getContext("2d");
          if (smallCtx) {
            smallCtx.drawImage(img, 0, 0, tempW, tempH);
            pixelCtx.imageSmoothingEnabled = false;
            // @ts-expect-error - vendor prefixes
            pixelCtx.mozImageSmoothingEnabled = false;
            // @ts-expect-error - vendor prefixes
            pixelCtx.webkitImageSmoothingEnabled = false;
            pixelCtx.drawImage(smallCanvas, 0, 0, tempW, tempH, 0, 0, img.naturalWidth, img.naturalHeight);
            drawMaskedEffect(c, region, pixelCanvas);
          }
        }
      }
    };

    // Helper: Draw visual helpers on workspace preview only
    const drawRegionHelper = (c: CanvasRenderingContext2D, region: Region) => {
      const { type, x, y, w, h, points } = region;

      c.save();
      if (type === "box") {
        // Dashed outer highlight
        c.strokeStyle = "rgba(255, 255, 255, 0.75)";
        c.lineWidth = 1.5;
        c.setLineDash([4, 4]);
        c.strokeRect(x, y, w, h);

        // Solid inner shadow for contrast
        c.strokeStyle = "rgba(0, 0, 0, 0.4)";
        c.lineWidth = 1;
        c.setLineDash([]);
        c.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
      } else if (type === "brush" && points.length > 0) {
        // Dash center line indicator
        c.strokeStyle = "rgba(255, 255, 255, 0.5)";
        c.lineWidth = 1;
        c.setLineDash([2, 4]);
        c.beginPath();
        c.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          c.lineTo(points[i].x, points[i].y);
        }
        c.stroke();
      }
      c.restore();
    };

    // Render each region sequentially
    for (const region of regions) {
      applyRegionEffect(ctx, region);
      if (!isExporting) {
        drawRegionHelper(ctx, region);
      }
    }
  }, [regions]);

  // Main Canvas Redraw Trigger
  useEffect(() => {
    if (originalDimensions && imageRef.current && canvasRef.current) {
      // Set resolution properties of canvas to match original image dimensions
      canvasRef.current.width = originalDimensions.width;
      canvasRef.current.height = originalDimensions.height;
      drawCanvas(false);
    }
  }, [regions, originalDimensions, drawCanvas]);

  // Calculate coordinates ratio scale
  const getScaleRatio = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 1;
    const rect = canvas.getBoundingClientRect();
    return rect.width / canvas.width;
  };

  // Pointer Handlers (Draw actions)
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    // Capture initial pointer target
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Cache completed regions to optimize dragging experience
    const completedCanvas = completedCanvasRef.current || document.createElement("canvas");
    completedCanvas.width = canvas.width;
    completedCanvas.height = canvas.height;
    const completedCtx = completedCanvas.getContext("2d");
    if (completedCtx) {
      completedCtx.clearRect(0, 0, canvas.width, canvas.height);
      completedCtx.drawImage(imageRef.current, 0, 0);
      
      const drawMaskedEffectLocal = (
        c: CanvasRenderingContext2D,
        region: Region,
        effectCanvas: HTMLCanvasElement
      ) => {
        const { type, x: rx, y: ry, w: rw, h: rh, points, brushSize } = region;

        c.save();
        if (type === "box") {
          c.drawImage(effectCanvas, rx, ry, rw, rh, rx, ry, rw, rh);
        } else if (type === "brush" && points.length > 0) {
          const maskCanvas = document.createElement("canvas");
          maskCanvas.width = canvas.width;
          maskCanvas.height = canvas.height;
          const maskCtx = maskCanvas.getContext("2d");
          if (maskCtx) {
            maskCtx.lineCap = "round";
            maskCtx.lineJoin = "round";
            maskCtx.lineWidth = brushSize;
            maskCtx.strokeStyle = "white";
            maskCtx.beginPath();
            maskCtx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
              maskCtx.lineTo(points[i].x, points[i].y);
            }
            maskCtx.stroke();

            maskCtx.globalCompositeOperation = "source-in";
            maskCtx.drawImage(effectCanvas, 0, 0);

            c.drawImage(maskCanvas, 0, 0);
          }
        }
        c.restore();
      };

      const applyRegionEffectLocal = (c: CanvasRenderingContext2D, region: Region) => {
        const img = imageRef.current;
        if (!img) return;

        const { type, x: rx, y: ry, w: rw, h: rh, points, brushSize, effect, blurStrength, pixelSize } = region;

        if (effect === "solid") {
          c.save();
          c.fillStyle = "black";
          if (type === "box") {
            c.fillRect(rx, ry, rw, rh);
          } else if (type === "brush" && points.length > 0) {
            c.lineWidth = brushSize;
            c.lineCap = "round";
            c.lineJoin = "round";
            c.strokeStyle = "black";
            c.beginPath();
            c.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
              c.lineTo(points[i].x, points[i].y);
            }
            c.stroke();
          }
          c.restore();
        } else if (effect === "blur") {
          const blurCanvas = document.createElement("canvas");
          blurCanvas.width = img.naturalWidth;
          blurCanvas.height = img.naturalHeight;
          const blurCtx = blurCanvas.getContext("2d");
          if (blurCtx) {
            blurCtx.filter = `blur(${blurStrength}px)`;
            blurCtx.drawImage(img, 0, 0);
            drawMaskedEffectLocal(c, region, blurCanvas);
          }
        } else if (effect === "pixelate") {
          const pixelCanvas = document.createElement("canvas");
          pixelCanvas.width = img.naturalWidth;
          pixelCanvas.height = img.naturalHeight;
          const pixelCtx = pixelCanvas.getContext("2d");
          if (pixelCtx) {
            const scale = 1 / pixelSize;
            const tempW = Math.max(1, Math.round(img.naturalWidth * scale));
            const tempH = Math.max(1, Math.round(img.naturalHeight * scale));

            const smallCanvas = document.createElement("canvas");
            smallCanvas.width = tempW;
            smallCanvas.height = tempH;
            const smallCtx = smallCanvas.getContext("2d");
            if (smallCtx) {
              smallCtx.drawImage(img, 0, 0, tempW, tempH);
              pixelCtx.imageSmoothingEnabled = false;
              // @ts-expect-error - vendor prefixes
              pixelCtx.mozImageSmoothingEnabled = false;
              // @ts-expect-error - vendor prefixes
              pixelCtx.webkitImageSmoothingEnabled = false;
              pixelCtx.drawImage(smallCanvas, 0, 0, tempW, tempH, 0, 0, img.naturalWidth, img.naturalHeight);
              drawMaskedEffectLocal(c, region, pixelCanvas);
            }
          }
        }
      };

      for (const reg of regions) {
        applyRegionEffectLocal(completedCtx, reg);
      }
    }
    completedCanvasRef.current = completedCanvas;

    // Cache active effect canvas (blur/pixelate) to avoid real-time filtering updates
    const effectCanvas = effectCanvasRef.current || document.createElement("canvas");
    effectCanvas.width = canvas.width;
    effectCanvas.height = canvas.height;
    const effectCtx = effectCanvas.getContext("2d");
    if (effectCtx) {
      effectCtx.clearRect(0, 0, canvas.width, canvas.height);
      if (activeEffect === "blur") {
        effectCtx.filter = `blur(${activeBlurStrength}px)`;
        effectCtx.drawImage(imageRef.current, 0, 0);
      } else if (activeEffect === "pixelate") {
        const scale = 1 / activePixelSize;
        const tempW = Math.max(1, Math.round(canvas.width * scale));
        const tempH = Math.max(1, Math.round(canvas.height * scale));

        const smallCanvas = document.createElement("canvas");
        smallCanvas.width = tempW;
        smallCanvas.height = tempH;
        const smallCtx = smallCanvas.getContext("2d");
        if (smallCtx) {
          smallCtx.drawImage(imageRef.current, 0, 0, tempW, tempH);
          effectCtx.imageSmoothingEnabled = false;
          // @ts-expect-error - vendor prefixes
          effectCtx.mozImageSmoothingEnabled = false;
          // @ts-expect-error - vendor prefixes
          effectCtx.webkitImageSmoothingEnabled = false;
          effectCtx.drawImage(smallCanvas, 0, 0, tempW, tempH, 0, 0, canvas.width, canvas.height);
        }
      }
    }
    effectCanvasRef.current = effectCanvas;

    setIsDrawing(true);
    setStartPoint({ x, y });
    if (drawMode === "brush") {
      setCurrentPoints([{ x, y }]);
    } else {
      setCurrentBox({ x, y, w: 0, h: 0 });
    }
  };

  const drawMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    // Update brush hover cursor coordinates
    setCursorPos({ x: cursorX, y: cursorY });

    if (!isDrawing || !startPoint) return;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.max(0, Math.min(canvas.width, cursorX * scaleX));
    const y = Math.max(0, Math.min(canvas.height, cursorY * scaleY));

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw cached completed regions
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (completedCanvasRef.current) {
      ctx.drawImage(completedCanvasRef.current, 0, 0);
    }

    // 2. Draw live active region preview
    if (drawMode === "brush") {
      const newPoints = [...currentPoints, { x, y }];
      setCurrentPoints(newPoints);

      if (activeEffect === "solid") {
        ctx.save();
        ctx.lineWidth = activeBrushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        for (const pt of newPoints) {
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.restore();
      } else if (effectCanvasRef.current) {
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const maskCtx = maskCanvas.getContext("2d");
        if (maskCtx) {
          maskCtx.lineCap = "round";
          maskCtx.lineJoin = "round";
          maskCtx.lineWidth = activeBrushSize;
          maskCtx.strokeStyle = "white";
          maskCtx.beginPath();
          maskCtx.moveTo(startPoint.x, startPoint.y);
          for (const pt of newPoints) {
            maskCtx.lineTo(pt.x, pt.y);
          }
          maskCtx.stroke();

          maskCtx.globalCompositeOperation = "source-in";
          maskCtx.drawImage(effectCanvasRef.current, 0, 0);

          ctx.drawImage(maskCanvas, 0, 0);
        }
      }
    } else {
      // Box mode preview
      const w = x - startPoint.x;
      const h = y - startPoint.y;
      setCurrentBox({ x: startPoint.x, y: startPoint.y, w, h });

      const boxX = Math.min(startPoint.x, x);
      const boxY = Math.min(startPoint.y, y);
      const boxW = Math.abs(w);
      const boxH = Math.abs(h);

      if (boxW > 0 && boxH > 0) {
        if (activeEffect === "solid") {
          ctx.save();
          ctx.fillStyle = "black";
          ctx.fillRect(boxX, boxY, boxW, boxH);
          ctx.restore();
        } else if (effectCanvasRef.current) {
          ctx.drawImage(effectCanvasRef.current, boxX, boxY, boxW, boxH, boxX, boxY, boxW, boxH);
        }

        // Draw interactive dashed bounding outline helper
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX - 0.5, boxY - 0.5, boxW + 1, boxH + 1);
        ctx.restore();
      }
    }
  };

  const endDrawing = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (e && canvasRef.current) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }

    if (drawMode === "brush") {
      if (currentPoints.length > 1) {
        setRegions((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            type: "brush",
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            points: currentPoints,
            brushSize: activeBrushSize,
            effect: activeEffect,
            blurStrength: activeBlurStrength,
            pixelSize: activePixelSize,
          },
        ]);
      }
      setCurrentPoints([]);
    } else {
      const boxX = Math.min(startPoint!.x, currentBox.x + currentBox.w);
      const boxY = Math.min(startPoint!.y, currentBox.y + currentBox.h);
      const boxW = Math.abs(currentBox.w);
      const boxH = Math.abs(currentBox.h);

      if (boxW > 2 && boxH > 2) {
        setRegions((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            type: "box",
            x: boxX,
            y: boxY,
            w: boxW,
            h: boxH,
            points: [],
            brushSize: 0,
            effect: activeEffect,
            blurStrength: activeBlurStrength,
            pixelSize: activePixelSize,
          },
        ]);
      }
      setCurrentBox({ x: 0, y: 0, w: 0, h: 0 });
    }
    setStartPoint(null);
  };

  // Actions
  const handleUndo = () => {
    if (regions.length > 0) {
      setRegions((prev) => prev.slice(0, -1));
      toast.success("Last redaction region undone.");
    }
  };

  const handleClearAll = () => {
    if (regions.length > 0) {
      setRegions([]);
      toast.success("All redaction regions cleared.");
    }
  };

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setActiveImage(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setActiveImage(null);
    setRegions([]);
    toast.success("Image removed.");
  };

  const handleAutoDetectFaces = async () => {
    if (!imageRef.current || !activeImage) {
      toast.error("Please load an image first.");
      return;
    }

    setIsDetecting(true);
    try {
      // Lazy-load and cache face detector if not already loaded
      if (!faceDetectorRef.current) {
        // Retrieve model via cached fetch
        const cache = await caches.open("alatify-model-cache");
        const modelUrl = "/models/blaze_face_short_range.tflite";
        let modelResponse = await cache.match(modelUrl);
        if (!modelResponse) {
          const resp = await fetch(modelUrl);
          if (!resp.ok) {
            throw new Error("Failed to download local face detection model.");
          }
          await cache.put(modelUrl, resp.clone());
          modelResponse = resp;
        }
        const blob = await modelResponse.blob();
        const arrayBuffer = await blob.arrayBuffer();

        // Retrieve wasm files via cached fetches to warm up the cache
        const wasmFiles = [
          "/wasm/vision_wasm_internal.wasm",
          "/wasm/vision_wasm_internal.js",
          "/wasm/vision_wasm_internal_simd.wasm",
          "/wasm/vision_wasm_internal_simd.js"
        ];
        for (const file of wasmFiles) {
          const match = await cache.match(file);
          if (!match) {
            try {
              const resp = await fetch(file);
              if (resp.ok) {
                await cache.put(file, resp.clone());
              }
            } catch (e) {
              console.warn("WASM caching failed:", e);
            }
          }
        }

        const vision = await FilesetResolver.forVisionTasks("/wasm");
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetBuffer: new Uint8Array(arrayBuffer),
            delegate: "GPU"
          },
          runningMode: "IMAGE"
        });
        faceDetectorRef.current = detector;
      }

      // Execute detection on natural image
      const results = faceDetectorRef.current.detect(imageRef.current);
      const detections = results.detections || [];

      if (detections.length === 0) {
        toast.info("No faces detected — add regions manually.");
        setIsDetecting(false);
        return;
      }

      // Map detections to new regions
      const newRegions: Region[] = [];
      const imgW = imageRef.current.naturalWidth;
      const imgH = imageRef.current.naturalHeight;

      for (const detection of detections) {
        if (!detection.boundingBox) continue;
        const box = detection.boundingBox;

        // Bounding box from MediaPipe is in pixels relative to natural size
        // Clamp bounds to prevent painting issues
        const x = Math.max(0, Math.min(imgW, box.originX));
        const y = Math.max(0, Math.min(imgH, box.originY));
        const w = Math.max(2, Math.min(imgW - x, box.width));
        const h = Math.max(2, Math.min(imgH - y, box.height));

        newRegions.push({
          id: Math.random().toString(36).substring(2, 9),
          type: "box",
          x,
          y,
          w,
          h,
          points: [],
          brushSize: 0,
          effect: activeEffect,
          blurStrength: activeBlurStrength,
          pixelSize: activePixelSize
        });
      }

      if (newRegions.length > 0) {
        setRegions((prev) => [...prev, ...newRegions]);
        toast.success(`Detected and redacted ${newRegions.length} face${newRegions.length > 1 ? "s" : ""}.`);
      } else {
        toast.info("No faces detected — add regions manually.");
      }
    } catch (err) {
      console.error("Face detection failed:", err);
      toast.error(err instanceof Error ? err.message : "Face detection failed.");
    } finally {
      setIsDetecting(false);
    }
  };

  // Export Download
  const handleDownload = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) {
      toast.error("No image workspace to export.");
      return;
    }

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) {
      toast.error("Failed to compile output context.");
      return;
    }

    // 1. Rasterize original base pixels
    exportCtx.drawImage(img, 0, 0);

    const drawMaskedEffectLocal = (
      c: CanvasRenderingContext2D,
      region: Region,
      effectCanvas: HTMLCanvasElement
    ) => {
      const { type, x, y, w, h, points, brushSize } = region;

      c.save();
      if (type === "box") {
        c.drawImage(effectCanvas, x, y, w, h, x, y, w, h);
      } else if (type === "brush" && points.length > 0) {
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const maskCtx = maskCanvas.getContext("2d");
        if (maskCtx) {
          maskCtx.lineCap = "round";
          maskCtx.lineJoin = "round";
          maskCtx.lineWidth = brushSize;
          maskCtx.strokeStyle = "white";
          maskCtx.beginPath();
          maskCtx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            maskCtx.lineTo(points[i].x, points[i].y);
          }
          maskCtx.stroke();

          maskCtx.globalCompositeOperation = "source-in";
          maskCtx.drawImage(effectCanvas, 0, 0);

          c.drawImage(maskCanvas, 0, 0);
        }
      }
      c.restore();
    };

    // Helper: Apply Blur/Pixelate/Solid effects onto target context
    const applyRegionEffectLocal = (c: CanvasRenderingContext2D, region: Region) => {
      const { type, x, y, w, h, points, brushSize, effect, blurStrength, pixelSize } = region;

      if (effect === "solid") {
        c.save();
        c.fillStyle = "black";
        if (type === "box") {
          c.fillRect(x, y, w, h);
        } else if (type === "brush" && points.length > 0) {
          c.lineWidth = brushSize;
          c.lineCap = "round";
          c.lineJoin = "round";
          c.strokeStyle = "black";
          c.beginPath();
          c.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            c.lineTo(points[i].x, points[i].y);
          }
          c.stroke();
        }
        c.restore();
      } else if (effect === "blur") {
        const blurCanvas = document.createElement("canvas");
        blurCanvas.width = img.naturalWidth;
        blurCanvas.height = img.naturalHeight;
        const blurCtx = blurCanvas.getContext("2d");
        if (blurCtx) {
          blurCtx.filter = `blur(${blurStrength}px)`;
          blurCtx.drawImage(img, 0, 0);
          drawMaskedEffectLocal(c, region, blurCanvas);
        }
      } else if (effect === "pixelate") {
        const pixelCanvas = document.createElement("canvas");
        pixelCanvas.width = img.naturalWidth;
        pixelCanvas.height = img.naturalHeight;
        const pixelCtx = pixelCanvas.getContext("2d");
        if (pixelCtx) {
          const scale = 1 / pixelSize;
          const tempW = Math.max(1, Math.round(img.naturalWidth * scale));
          const tempH = Math.max(1, Math.round(img.naturalHeight * scale));

          const smallCanvas = document.createElement("canvas");
          smallCanvas.width = tempW;
          smallCanvas.height = tempH;
          const smallCtx = smallCanvas.getContext("2d");
          if (smallCtx) {
            smallCtx.drawImage(img, 0, 0, tempW, tempH);
            pixelCtx.imageSmoothingEnabled = false;
            // @ts-expect-error - vendor prefixes
            pixelCtx.mozImageSmoothingEnabled = false;
            // @ts-expect-error - vendor prefixes
            pixelCtx.webkitImageSmoothingEnabled = false;
            pixelCtx.drawImage(smallCanvas, 0, 0, tempW, tempH, 0, 0, img.naturalWidth, img.naturalHeight);
            drawMaskedEffectLocal(c, region, pixelCanvas);
          }
        }
      }
    };

    // 2. Destructively apply regions without drawing overlay visual helpers
    for (const region of regions) {
      applyRegionEffectLocal(exportCtx, region);
    }

    const mime = exportFormat;
    const ext = exportFormat === "image/jpeg" ? "jpg" : "png";
    const quality = exportFormat === "image/jpeg" ? 0.95 : undefined;

    exportCanvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          const originalName = activeImage ? activeImage.name.substring(0, activeImage.name.lastIndexOf(".")) : "redacted";
          a.download = `${originalName}-redacted.${ext}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success(`Redacted image exported as ${ext.toUpperCase()} (EXIF metadata removed).`);
        } else {
          toast.error("Failed to generate exported image payload.");
        }
      },
      mime,
      quality
    );
  };

  const displayRatio = getScaleRatio();
  const displayBrushSize = activeBrushSize * displayRatio;

  const originalSize = activeImage?.size ?? 0;
  const originalNameStr = activeImage ? activeImage.name : "";

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip">
      {/* Glow overlays */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <Header showBackToTools />

      {/* Hidden upload reference */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/avif, image/bmp"
        className="hidden"
      />

      <div className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-10 z-10 flex flex-col gap-6 sm:gap-10">
        {/* H1 SEO Header */}
        <section className="text-center sm:text-left space-y-2 sm:space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-fade-in">
            <EyeOff className="w-3.5 h-3.5 text-primary" />
            Privacy Tool
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Blur & Redact
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            {t("tools.blur.intro")}
          </p>
        </section>

        {/* Workspace Display Layout */}
        {!activeImage ? (
          <section className="flex-1 flex flex-col items-center justify-center py-12 max-w-xl mx-auto w-full">
            <ImageSourceInput onImageReady={setActiveImage} className="w-full animate-fade-in" />
          </section>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full animate-fade-in">
            
            {/* Display Canvas Area */}
            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 w-full">
              <div className="w-full max-w-md md:max-w-none mx-auto p-3 sm:p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Interactive Workspace
                  </span>
                  <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
                    {originalSize > 0 ? formatBytes(originalSize) : "---"}
                  </span>
                </div>

                {/* Canvas Bounding wrapper */}
                <div className="relative w-full aspect-[4/3] sm:aspect-square bg-[#0f0f11] rounded-xl overflow-hidden border border-border/50 shadow-inner min-h-[320px] sm:min-h-[420px] md:min-h-[460px] flex items-center justify-center p-4">
                  <div className="relative max-w-full max-h-[300px] sm:max-h-[380px] md:max-h-[420px] flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      onPointerDown={startDrawing}
                      onPointerMove={drawMove}
                      onPointerUp={endDrawing}
                      onPointerLeave={() => {
                        setIsHovering(false);
                        if (isDrawing) endDrawing();
                      }}
                      onPointerEnter={() => setIsHovering(true)}
                      style={{ touchAction: "none" }}
                      className="max-w-full max-h-[300px] sm:max-h-[380px] md:max-h-[420px] object-contain rounded-xl select-none cursor-crosshair"
                    />

                    {/* Custom brush size indicator overlay */}
                    {drawMode === "brush" && isHovering && cursorPos && (
                      <div
                        className="absolute border border-white rounded-full pointer-events-none mix-blend-difference"
                        style={{
                          left: cursorPos.x,
                          top: cursorPos.y,
                          width: `${displayBrushSize}px`,
                          height: `${displayBrushSize}px`,
                          transform: "translate(-50%, -50%)",
                          boxShadow: "0 0 0 1px black",
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Dimensions Label Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span className="font-medium truncate max-w-[120px] sm:max-w-[150px]">
                    {originalNameStr}
                  </span>
                  <span className="font-semibold shrink-0">
                    {originalDimensions
                      ? `${originalDimensions.width} × ${originalDimensions.height} · ${activeImage.type.split("/")[1].toUpperCase()}`
                      : "---"}
                  </span>
                </div>
              </div>

              {/* Upload Replace controls footer */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-card rounded-2xl border border-border/60 shadow-sm w-full">
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  Drawing on workspace is client-only. Visual borders vanish on export.
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReplaceClick}
                    className="gap-1.5 text-xs border-border hover:bg-muted text-foreground flex-1 sm:flex-none h-9 rounded-xl"
                  >
                    Replace Image
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 flex-1 sm:flex-none h-9 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar Controls panel */}
            <div className="lg:col-span-1 p-4 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-md space-y-5 sm:space-y-6 w-full flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-border/40 pb-2.5 sm:pb-3">
                  <Sliders className="w-4 h-4 text-primary" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
                    Redact Controls
                  </h2>
                </div>

                {/* Auto-Detect Faces Section */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                    Automation
                  </span>
                  <Button
                    onClick={handleAutoDetectFaces}
                    disabled={isDetecting}
                    className="w-full text-xs font-bold py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg flex items-center justify-center gap-2 h-10 transition-all"
                  >
                    {isDetecting ? (
                      <>
                        <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full" />
                        <span>Detecting...</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Auto-Detect Faces</span>
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                    {t("tools.blur.autoDetectHelp")}
                  </p>
                </div>

                {/* Selection Mode Toggle */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                    Selection Method
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={drawMode === "box" ? "default" : "secondary"}
                      onClick={() => setDrawMode("box")}
                      className="text-[10px] font-bold py-2 rounded-xl border border-border/40 flex items-center gap-1.5"
                    >
                      <Box className="w-3.5 h-3.5" />
                      Box Mode
                    </Button>
                    <Button
                      variant={drawMode === "brush" ? "default" : "secondary"}
                      onClick={() => setDrawMode("brush")}
                      className="text-[10px] font-bold py-2 rounded-xl border border-border/40 flex items-center gap-1.5"
                    >
                      <Brush className="w-3.5 h-3.5" />
                      Brush Mode
                    </Button>
                  </div>
                </div>

                {/* Brush size settings */}
                {drawMode === "brush" && (
                  <div className="space-y-2 pt-2 border-t border-border/40 animate-fade-in">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                        Brush Size
                      </span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold">
                        {activeBrushSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={150}
                      step={1}
                      value={activeBrushSize}
                      onChange={(e) => setActiveBrushSize(Number(e.target.value))}
                      className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                )}

                {/* Effect Mode configuration */}
                <div className="space-y-2 pt-2.5 border-t border-border/40">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                    Redaction Effect
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Button
                      variant={activeEffect === "blur" ? "default" : "secondary"}
                      onClick={() => setActiveEffect("blur")}
                      className="text-[9px] font-bold py-2.5 rounded-xl border border-border/40"
                    >
                      Blur
                    </Button>
                    <Button
                      variant={activeEffect === "pixelate" ? "default" : "secondary"}
                      onClick={() => setActiveEffect("pixelate")}
                      className="text-[9px] font-bold py-2.5 rounded-xl border border-border/40"
                    >
                      Pixelate
                    </Button>
                    <Button
                      variant={activeEffect === "solid" ? "default" : "secondary"}
                      onClick={() => setActiveEffect("solid")}
                      className="text-[9px] font-bold py-2.5 rounded-xl border border-border/40"
                    >
                      Solid Fill
                    </Button>
                  </div>
                </div>

                {/* Dynamic sliders depending on effect */}
                {activeEffect === "blur" && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                        Blur Strength
                      </span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold">
                        {activeBlurStrength}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={1}
                      value={activeBlurStrength}
                      onChange={(e) => setActiveBlurStrength(Number(e.target.value))}
                      className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                )}

                {activeEffect === "pixelate" && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                        Pixel Block Size
                      </span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold">
                        {activePixelSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={100}
                      step={1}
                      value={activePixelSize}
                      onChange={(e) => setActivePixelSize(Number(e.target.value))}
                      className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                )}

                {/* Inline security warning */}
                <div className="p-3 bg-secondary/50 rounded-xl border border-border/60 space-y-1 text-[11px] text-muted-foreground leading-relaxed flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground">Security Note:</span> For truly sensitive text or info, use <strong className="text-foreground">Solid Fill</strong>. Blur and pixelate algorithms can sometimes be partially reversed via reconstruction tools.
                  </div>
                </div>

                {/* Action button layout */}
                <div className="flex gap-2 pt-2 border-t border-border/40">
                  <Button
                    variant="outline"
                    onClick={handleUndo}
                    disabled={regions.length === 0}
                    className="text-[10px] font-bold h-9 rounded-xl flex-1 gap-1"
                  >
                    <Undo className="w-3 h-3" />
                    Undo Last
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearAll}
                    disabled={regions.length === 0}
                    className="text-[10px] font-bold h-9 rounded-xl flex-1 gap-1 text-destructive hover:bg-destructive/5 border-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Download controls section */}
              <div className="space-y-4 pt-5 border-t border-border/40 mt-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                    Export Format
                  </span>
                  <Select value={exportFormat} onValueChange={(val) => setExportFormat(val as "image/png" | "image/jpeg")}>
                    <SelectTrigger className="w-full bg-secondary border border-border/80 hover:border-primary/50 text-foreground text-xs rounded-xl h-10 px-3 outline-none flex items-center justify-between transition-all duration-200">
                      <span className="font-semibold">
                        {exportFormat === "image/png"
                          ? "PNG — Lossless (Preserves quality)"
                          : "JPEG — Optimized (Smaller file)"}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border/80 rounded-xl shadow-xl backdrop-blur-md">
                      <SelectItem value="image/png" className="text-xs font-semibold cursor-pointer">
                        PNG — Lossless (Preserves quality)
                      </SelectItem>
                      <SelectItem value="image/jpeg" className="text-xs font-semibold cursor-pointer">
                        JPEG — Optimized (Smaller file)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Privacy Stripped metadata badge */}
                <div className="flex items-center gap-1.5 bg-primary/5 border border-primary/15 rounded-xl px-3 py-2 text-[10px] font-bold text-primary">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Privacy Mode Active · Metadata removed on export</span>
                </div>

                {/* Download trigger */}
                <Button
                  onClick={handleDownload}
                  className="w-full py-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg flex items-center justify-center gap-2 h-11 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download Redacted Image
                </Button>
              </div>
            </div>

          </section>
        )}

        {!activeImage && <UrlInputHelp />}

        {/* Divider separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-4" />

        {/* How It Works Guide Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Obscure and redact sensitive elements in four quick steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Upload File",
                text: t("tools.blur.howItWorks.step1"),
              },
              {
                step: "02",
                title: "Choose Settings",
                text: t("tools.blur.howItWorks.step2"),
              },
              {
                step: "03",
                title: "Obscure Regions",
                text: t("tools.blur.howItWorks.step3"),
              },
              {
                step: "04",
                title: "Scrub & Save",
                text: t("tools.blur.howItWorks.step4"),
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
                q: t("tools.blur.faq.q1"),
                a: t("tools.blur.faq.a1"),
              },
              {
                q: t("tools.blur.faq.q2"),
                a: t("tools.blur.faq.a2"),
              },
              {
                q: t("tools.blur.faq.q3"),
                a: t("tools.blur.faq.a3"),
              },
              {
                q: t("tools.blur.faq.q4"),
                a: t("tools.blur.faq.a4"),
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
        <section className="max-w-4xl mx-auto w-full space-y-4 pt-4">
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
                    {t("shared.related.exif-cleaner-metadata")}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </Link>

            <Link
              href="/tools/bg-remover"
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    AI Background Remover
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {t("shared.related.bg-remover")}
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
            {t("tools.blur.privacyNotice")}
          </p>
        </PrivacyNotice>
      </div>
    </main>
  );
}
