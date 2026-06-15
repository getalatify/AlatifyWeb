"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ThemeToggle, Logo } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Upload,
  Download,
  Trash2,
  Undo2,
  RefreshCw,
  Image as
  Shield,
  EyeOff,
  Type,

  Lock
} from "lucide-react";
import { Redaction, WatermarkConfig, renderToCanvas, exportPng, RedactionMode } from "@/lib/id-protector/engine";

export default function IdProtectorClient() {
  const [file, setFile] = useState<File | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [redactions, setRedactions] = useState<Redaction[]>([]);
  const [history, setHistory] = useState<Redaction[][]>([]);

  const [mode, setMode] = useState<RedactionMode>('solid');
  const [solidColor, setSolidColor] = useState<string>('#000000');

  const [watermark, setWatermark] = useState<WatermarkConfig>({
    text: '',
    opacityPct: 15,
    fontScalePct: 5,
    angleDeg: -45,
    color: '#000000',
    tiled: true,
    spacingPct: 10
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

  const [activeRedactionId, setActiveRedactionId] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        handleFileSelect(acceptedFiles[0]);
      }
    },
  });

  const handleFileSelect = (selectedFile: File) => {
    const url = URL.createObjectURL(selectedFile);
    const img = new window.Image();
    img.onload = () => {
      setImageObj(img);
      setFile(selectedFile);
      setRedactions([]);
      setHistory([]);
      setCurrentRect(null);
      setActiveRedactionId(null);
    };
    img.src = url;
  };

  const updateCanvas = useCallback(() => {
    if (!imageObj || !previewCanvasRef.current) return;
    renderToCanvas(imageObj, redactions, watermark, previewCanvasRef.current, true);
  }, [imageObj, redactions, watermark]);

  useEffect(() => {
    // Debounce/Throttle the update to only fire when dependencies change
    // Using simple rAF wrapper for now, but avoiding infinite 60fps loop
    const rAF = requestAnimationFrame(updateCanvas);
    return () => cancelAnimationFrame(rAF);
  }, [updateCanvas]);

  const getNaturalCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!containerRef.current || !imageObj) return null;

    const rect = containerRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent | MouseEvent).clientX;
      clientY = (e as React.MouseEvent | MouseEvent).clientY;
    }

    const scaleX = imageObj.naturalWidth / rect.width;
    const scaleY = imageObj.naturalHeight / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getNaturalCoords(e);
    if (!coords) return;

    // Check if clicking on existing redaction handles or body could go here.
    // For simplicity, just creating new rects for now.

    setStartPos(coords);
    setIsDragging(true);
    setCurrentRect({ x: coords.x, y: coords.y, w: 0, h: 0 });
    setActiveRedactionId(null);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !startPos) return;

    const coords = getNaturalCoords(e);
    if (!coords) return;

    setCurrentRect({
      x: Math.min(startPos.x, coords.x),
      y: Math.min(startPos.y, coords.y),
      w: Math.abs(coords.x - startPos.x),
      h: Math.abs(coords.y - startPos.y)
    });
  };

  const handlePointerUp = () => {
    if (isDragging && currentRect && currentRect.w > 5 && currentRect.h > 5) {
      const newRedaction: Redaction = {
        id: Math.random().toString(36).substr(2, 9),
        x: currentRect.x,
        y: currentRect.y,
        w: currentRect.w,
        h: currentRect.h,
        mode: mode,
        color: solidColor
      };

      setHistory(prev => [...prev, [...redactions]]);
      setRedactions(prev => [...prev, newRedaction]);
      setActiveRedactionId(newRedaction.id);
    }

    setIsDragging(false);
    setStartPos(null);
    setCurrentRect(null);
  };

  const undo = () => {
    if (history.length > 0) {
      const prevRedactions = history[history.length - 1];
      setRedactions(prevRedactions);
      setHistory(history.slice(0, -1));
      setActiveRedactionId(null);
    }
  };

  const clearAll = () => {
    if (redactions.length > 0) {
      setHistory(prev => [...prev, [...redactions]]);
      setRedactions([]);
      setActiveRedactionId(null);
    }
  };

  const handleDownload = async () => {
    if (!imageObj) return;

    try {
      const offscreenCanvas = document.createElement('canvas');
      renderToCanvas(imageObj, redactions, watermark, offscreenCanvas, false); // false for natural size export

      const blob = await exportPng(offscreenCanvas);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `id-protected.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Image downloaded successfully!");
    } catch {
      toast.error("Failed to download image.");
    }
  };

  const setTodayDate = () => {
    const today = new Date();
    const str = today.toISOString().split('T')[0];
    setWatermark(prev => ({ ...prev, text: prev.text ? `${prev.text} ${str}` : str }));
  };

  const setPurposeText = () => {
    const purpose = "For verification purposes only";
    setWatermark(prev => ({ ...prev, text: prev.text ? `${prev.text} - ${purpose}` : purpose }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeRedactionId) {
        setHistory(prev => [...prev, [...redactions]]);
        setRedactions(prev => prev.filter(r => r.id !== activeRedactionId));
        setActiveRedactionId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRedactionId, redactions]);

  // Display-sized overlay to show drawing interactions
  const renderOverlay = () => {
    if (!imageObj || !containerRef.current) return null;

    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = rect.width / imageObj.naturalWidth;
    const scaleY = rect.height / imageObj.naturalHeight;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {redactions.map(r => (
          <div
            key={r.id}
            className={cn(
              "absolute border-2 pointer-events-auto",
              r.id === activeRedactionId ? "border-primary" : "border-transparent hover:border-primary/50"
            )}
            style={{
              left: r.x * scaleX,
              top: r.y * scaleY,
              width: r.w * scaleX,
              height: r.h * scaleY,
              backgroundColor: r.mode === 'solid' ? r.color : 'rgba(200,200,200,0.5)',
              opacity: r.mode === 'solid' ? 0.8 : 1 // just for selection visibility
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveRedactionId(r.id);
            }}
          />
        ))}
        {currentRect && (
          <div
            className="absolute border-2 border-primary border-dashed bg-primary/20"
            style={{
              left: currentRect.x * scaleX,
              top: currentRect.y * scaleY,
              width: currentRect.w * scaleX,
              height: currentRect.h * scaleY,
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <header className="w-full max-w-7xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <span className="font-bold text-xl">Alatify</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="w-full max-w-7xl mx-auto px-4 py-2">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">

        {/* SEO Header */}
        <div className="sr-only" aria-hidden="false">
          <h1>ID Privacy Shield</h1>
          <p>Redact and watermark sensitive documents — entirely on your device.</p>
          <h2>How It Works</h2>
          <ol>
            <li>Upload: Select your KTP, SIM, or passport. Your image never leaves your browser.</li>
            <li>Redact: Use solid boxes to black out sensitive data like the NIK, signature, and address.</li>
            <li>Watermark: Add a diagonal tiled watermark stating the purpose and date across the entire document.</li>
            <li>Download: Save the protected PNG directly to your device. Metadata is automatically stripped.</li>
          </ol>
          <h2>Use Cases</h2>
          <ul>
            <li>Securing KTP/SIM/passport for vehicle rental without giving them full unwatermarked copies.</li>
            <li>Freelance or marketplace verification.</li>
            <li>Hotel check-in rather than sending a raw ID on WhatsApp or email.</li>
          </ul>
          <h2>FAQ</h2>
          <dl>
            <dt>Are my IDs uploaded to a server?</dt>
            <dd>No. All processing happens locally in your web browser. Nothing is ever uploaded.</dd>

            <dt>Are the solid redaction blocks reversible?</dt>
            <dd>No. Once downloaded, the solid redaction blocks permanently destroy the underlying pixels. Blur is theoretically reversible, so we strongly recommend solid boxes for sensitive information.</dd>

            <dt>Can the watermark be cropped out?</dt>
            <dd>Using the tiled watermark option covers the entire document, making it impossible to crop without losing the ID itself.</dd>

            <dt>Does this work on mobile devices?</dt>
            <dd>Yes, the ID Privacy Shield works perfectly on mobile phones and tablets.</dd>

            <dt>Is EXIF data and metadata preserved?</dt>
            <dd>No. Re-encoding the image to PNG intentionally strips all EXIF/GPS metadata for maximum privacy.</dd>
          </dl>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col gap-4">
          {!file ? (
            <div
              {...getRootProps()}
              className={cn(
                "flex-1 min-h-[500px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center transition-colors cursor-pointer",
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Upload an Image</h3>
              <p className="text-muted-foreground max-w-sm">
                Drag and drop your ID, passport, or document here, or click to browse.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={undo} disabled={history.length === 0}>
                    <Undo2 className="w-4 h-4 mr-2" /> Undo
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll} disabled={redactions.length === 0}>
                    <Trash2 className="w-4 h-4 mr-2" /> Clear All
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => {
                    setFile(null);
                    setImageObj(null);
                    setRedactions([]);
                  }}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Start Over
                  </Button>
                  <Button onClick={handleDownload} className="gap-2">
                    <Download className="w-4 h-4" /> Download PNG
                  </Button>
                </div>
              </div>

              <div className="flex-1 bg-secondary/50 rounded-xl border border-border overflow-hidden relative flex items-center justify-center min-h-[500px]">
                {/* The actual interactive area */}
                <div
                  ref={containerRef}
                  className="relative touch-none select-none max-w-full max-h-full"
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onMouseLeave={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                  style={{
                    width: imageObj ? '100%' : 'auto',
                    height: imageObj ? '100%' : 'auto',
                    aspectRatio: imageObj ? `${imageObj.naturalWidth}/${imageObj.naturalHeight}` : 'auto'
                  }}
                >
                  <canvas
                    ref={previewCanvasRef}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                  {renderOverlay()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          <div className="bg-card border border-border rounded-xl p-5 space-y-6">

            {/* Redaction Settings */}
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Redaction Tools
              </h3>

              <div className="space-y-3">
                <div className="flex bg-secondary p-1 rounded-lg">
                  <button
                    className={cn(
                      "flex-1 text-sm py-1.5 rounded-md font-medium transition-colors",
                      mode === 'solid' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setMode('solid')}
                  >
                    Solid
                  </button>
                  <button
                    className={cn(
                      "flex-1 text-sm py-1.5 rounded-md font-medium transition-colors",
                      mode === 'blur' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setMode('blur')}
                  >
                    Blur
                  </button>
                </div>

                {mode === 'blur' && (
                  <div className="bg-destructive/10 text-destructive text-xs p-2 rounded border border-destructive/20 flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Blurring is theoretically reversible and less secure. Use Solid blocks for highly sensitive data like ID numbers.</span>
                  </div>
                )}

                {mode === 'solid' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Color</label>
                    <div className="flex gap-2">
                      <button
                        className={cn("w-8 h-8 rounded border-2", solidColor === '#000000' ? "border-primary" : "border-transparent")}
                        style={{ backgroundColor: '#000000' }}
                        onClick={() => setSolidColor('#000000')}
                      />
                      <button
                        className={cn("w-8 h-8 rounded border-2", solidColor === '#ffffff' ? "border-primary" : "border-border")}
                        style={{ backgroundColor: '#ffffff' }}
                        onClick={() => setSolidColor('#ffffff')}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Watermark Settings */}
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" /> Watermark
              </h3>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Text</label>
                  <input
                    type="text"
                    value={watermark.text}
                    onChange={(e) => setWatermark(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="e.g. For verification only"
                    className="w-full bg-background border border-input rounded-md h-9 px-3 text-sm"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button variant="secondary" size="sm" className="h-7 text-xs flex-1" onClick={setTodayDate}>
                      + Date
                    </Button>
                    <Button variant="secondary" size="sm" className="h-7 text-xs flex-1" onClick={setPurposeText}>
                      + Purpose
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Tiled Pattern</label>
                    <Switch
                      checked={watermark.tiled}
                      onCheckedChange={(c) => setWatermark(prev => ({ ...prev, tiled: c }))}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Opacity</label>
                    <span className="text-xs text-muted-foreground">{watermark.opacityPct}%</span>
                  </div>
                  <Slider
                    value={[watermark.opacityPct]}
                    min={1} max={100} step={1}
                    onValueChange={(v) => setWatermark(prev => ({ ...prev, opacityPct: v[0] }))}
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Size</label>
                    <span className="text-xs text-muted-foreground">{watermark.fontScalePct}%</span>
                  </div>
                  <Slider
                    value={[watermark.fontScalePct]}
                    min={1} max={20} step={1}
                    onValueChange={(v) => setWatermark(prev => ({ ...prev, fontScalePct: v[0] }))}
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Angle</label>
                    <span className="text-xs text-muted-foreground">{watermark.angleDeg}°</span>
                  </div>
                  <Slider
                    value={[watermark.angleDeg]}
                    min={-90} max={90} step={1}
                    onValueChange={(v) => setWatermark(prev => ({ ...prev, angleDeg: v[0] }))}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Trust Footer Area */}
      <section className="w-full bg-secondary/30 border-t border-border mt-12 py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold">100% Client-Side Processing</h2>
            <p className="text-muted-foreground">
              This tool runs entirely in your web browser. Your sensitive documents never leave your device, no data is uploaded to any server, and all metadata is stripped automatically upon download.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/tools/blur" className="p-4 rounded-xl border border-border/50 bg-card hover:border-primary/50 transition-colors flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <EyeOff className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm group-hover:text-primary transition-colors">Image Blur</h4>
                <p className="text-xs text-muted-foreground">Blur faces and backgrounds.</p>
              </div>
            </Link>

            <Link href="/tools/watermark" className="p-4 rounded-xl border border-border/50 bg-card hover:border-primary/50 transition-colors flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm group-hover:text-primary transition-colors">Watermark</h4>
                <p className="text-xs text-muted-foreground">Add custom text or image watermarks.</p>
              </div>
            </Link>

            <Link href="/tools/exif-cleaner" className="p-4 rounded-xl border border-border/50 bg-card hover:border-primary/50 transition-colors flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm group-hover:text-primary transition-colors">EXIF Cleaner</h4>
                <p className="text-xs text-muted-foreground">Strip metadata and GPS tags.</p>
              </div>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
