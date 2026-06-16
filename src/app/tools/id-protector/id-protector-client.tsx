"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ThemeToggle, Logo, PrivacyNotice } from "@/components/shared";
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
  Redo2,
  RefreshCw,
  Shield,
  EyeOff,
  Type,
  Lock,
  HelpCircle,
  CheckCircle2
} from "lucide-react";
import { Redaction, WatermarkConfig, renderToCanvas, exportPng, RedactionMode } from "@/lib/id-protector/engine";

export default function IdProtectorClient() {
  const [file, setFile] = useState<File | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [redactions, setRedactions] = useState<Redaction[]>([]);
  const [history, setHistory] = useState<Redaction[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

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

  // Drawing state
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

  // Drag-to-reposition states
  const [draggedRedaction, setDraggedRedaction] = useState<Redaction | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{ id: string; x: number; y: number } | null>(null);
  const rAFRef = useRef<number | null>(null);

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
      setHistory([[]]);
      setHistoryIndex(0);
      setCurrentRect(null);
      setActiveRedactionId(null);
      setDraggedRedaction(null);
      setDragState(null);
    };
    img.src = url;
  };

  const updateCanvas = useCallback(() => {
    if (!imageObj || !previewCanvasRef.current) return;
    const previewRedactions = draggedRedaction
      ? redactions.filter(r => r.id !== draggedRedaction.id)
      : redactions;
    renderToCanvas(imageObj, previewRedactions, watermark, previewCanvasRef.current, true);
  }, [imageObj, redactions, watermark, draggedRedaction]);

  useEffect(() => {
    const rAF = requestAnimationFrame(updateCanvas);
    return () => cancelAnimationFrame(rAF);
  }, [updateCanvas]);

  useEffect(() => {
    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    };
  }, []);

  const pushState = useCallback((newRedactions: Redaction[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, newRedactions]);
    setHistoryIndex(nextHistory.length);
    setRedactions(newRedactions);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setRedactions(history[nextIndex]);
      setActiveRedactionId(null);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setRedactions(history[nextIndex]);
      setActiveRedactionId(null);
    }
  }, [history, historyIndex]);

  const clearAll = () => {
    if (redactions.length > 0) {
      pushState([]);
      setActiveRedactionId(null);
    }
  };

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

    // Check if clicked inside an existing redaction block (search in reverse to select top-most block first)
    const clickedRedaction = [...redactions].reverse().find(r => {
      return coords.x >= r.x && coords.x <= r.x + r.w &&
             coords.y >= r.y && coords.y <= r.y + r.h;
    });

    if (clickedRedaction) {
      setDraggedRedaction(clickedRedaction);
      setDragOffset({ x: coords.x - clickedRedaction.x, y: coords.y - clickedRedaction.y });
      setDragState({ id: clickedRedaction.id, x: clickedRedaction.x, y: clickedRedaction.y });
      setActiveRedactionId(clickedRedaction.id);
    } else {
      setStartPos(coords);
      setIsDragging(true);
      setCurrentRect({ x: coords.x, y: coords.y, w: 0, h: 0 });
      setActiveRedactionId(null);
      setDraggedRedaction(null);
      setDragState(null);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getNaturalCoords(e);
    if (!coords) return;

    if (draggedRedaction) {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      rAFRef.current = requestAnimationFrame(() => {
        const newX = coords.x - dragOffset.x;
        const newY = coords.y - dragOffset.y;
        
        // Clamp boundaries so the block stays entirely on the image canvas
        const clampedX = Math.max(0, Math.min(newX, imageObj!.naturalWidth - draggedRedaction.w));
        const clampedY = Math.max(0, Math.min(newY, imageObj!.naturalHeight - draggedRedaction.h));
        
        setDragState({ id: draggedRedaction.id, x: clampedX, y: clampedY });
      });
    } else if (isDragging && startPos) {
      setCurrentRect({
        x: Math.min(startPos.x, coords.x),
        y: Math.min(startPos.y, coords.y),
        w: Math.abs(coords.x - startPos.x),
        h: Math.abs(coords.y - startPos.y)
      });
    }
  };

  const handlePointerUp = () => {
    if (draggedRedaction && dragState) {
      const hasMoved = dragState.x !== draggedRedaction.x || dragState.y !== draggedRedaction.y;
      const newRedactions = redactions.map(r => {
        if (r.id === draggedRedaction.id) {
          return { ...r, x: dragState.x, y: dragState.y };
        }
        return r;
      });

      if (hasMoved) {
        pushState(newRedactions);
      } else {
        setRedactions(newRedactions);
      }
      setDraggedRedaction(null);
      setDragState(null);
    } else if (isDragging && currentRect && currentRect.w > 5 && currentRect.h > 5) {
      const newRedaction: Redaction = {
        id: Math.random().toString(36).substr(2, 9),
        x: currentRect.x,
        y: currentRect.y,
        w: currentRect.w,
        h: currentRect.h,
        mode: mode,
        color: solidColor
      };

      pushState([...redactions, newRedaction]);
      setActiveRedactionId(newRedaction.id);
    }

    setIsDragging(false);
    setStartPos(null);
    setCurrentRect(null);
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

  // Keyboard shortcut listener (ignores focus in text inputs/editable elements)
  useEffect(() => {
    const isEditable = (el: HTMLElement | null) => {
      if (!el) return false;
      const tagName = el.tagName.toLowerCase();
      return tagName === "input" || 
             tagName === "textarea" || 
             el.isContentEditable;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && isEditable(activeEl)) {
        return; // Let native text operations work
      }

      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl+Y, Ctrl+Shift+Z / Cmd+Shift+Z
      const isRedoShortcut = 
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z');

      if (isRedoShortcut) {
        e.preventDefault();
        redo();
      }

      // Delete / Backspace keys
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeRedactionId) {
        e.preventDefault();
        const newRedactions = redactions.filter(r => r.id !== activeRedactionId);
        pushState(newRedactions);
        setActiveRedactionId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRedactionId, redactions, historyIndex, history, pushState, undo, redo]);

  // Display-sized overlay to show drawing interactions
  const renderOverlay = () => {
    if (!imageObj || !containerRef.current) return null;

    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = rect.width / imageObj.naturalWidth;
    const scaleY = rect.height / imageObj.naturalHeight;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {redactions.map(r => {
          const isDraggingThis = dragState && dragState.id === r.id;
          const x = isDraggingThis ? dragState.x : r.x;
          const y = isDraggingThis ? dragState.y : r.y;
          return (
            <div
              key={r.id}
              className={cn(
                "absolute border-2 pointer-events-auto cursor-move",
                r.id === activeRedactionId ? "border-primary animate-pulse" : "border-transparent hover:border-primary/50"
              )}
              style={{
                left: 0,
                top: 0,
                width: r.w * scaleX,
                height: r.h * scaleY,
                transform: `translate3d(${x * scaleX}px, ${y * scaleY}px, 0)`,
                backgroundColor: r.mode === 'solid' ? r.color : 'rgba(200,200,200,0.5)',
                opacity: r.mode === 'solid' ? 0.8 : 1 // just for selection visibility
              }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveRedactionId(r.id);
              }}
            />
          );
        })}
        {currentRect && (
          <div
            className="absolute border-2 border-primary border-dashed bg-primary/20"
            style={{
              left: 0,
              top: 0,
              width: currentRect.w * scaleX,
              height: currentRect.h * scaleY,
              transform: `translate3d(${currentRect.x * scaleX}px, ${currentRect.y * scaleY}px, 0)`
            }}
          />
        )}
      </div>
    );
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
        <div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-10 z-10 flex flex-col gap-6 sm:gap-10">
        {/* Intro Header */}
        <section className="text-center sm:text-left space-y-2 sm:space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-fade-in">
            <Shield className="w-3.5 h-3.5 text-primary" />
            ID Privacy Shield
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Redact & Watermark ID Documents Locally
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            Every day, millions of raw ID photos (KTP, SIM, passports) are shared online, exposing them to identity theft and fraud. The ID Privacy Shield allows you to redact sensitive details with solid irreversible blocks and apply tiled watermarks to enforce specific usage contexts. Everything runs 100% locally in your browser: your documents never touch a server, and the downloaded file automatically strips all hidden metadata.
          </p>
        </section>

        {/* Main Editor Section */}
        <section className="flex flex-col lg:flex-row gap-8 items-start w-full animate-fade-in">
          {/* Left/Center Editor Area */}
          <div className="flex-1 w-full flex flex-col gap-4">
            {!file ? (
              <div
                {...getRootProps()}
                className={cn(
                  "flex-1 min-h-[500px] border-2 border-dashed rounded-2xl bg-card/40 backdrop-blur-sm shadow-md border-border/60 hover:border-primary/50 flex flex-col items-center justify-center p-8 text-center transition-all cursor-pointer group hover:bg-card/60",
                  isDragActive && "border-primary bg-primary/5"
                )}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6 border border-border/40 group-hover:scale-105 transition-transform">
                  <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-extrabold text-foreground mb-2">Upload your ID Image</h3>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                  Drag & drop your KTP, SIM, passport, or ID photo here, or click to browse.
                </p>
                <div className="mt-6 flex items-center gap-1.5 text-[10px] text-muted-foreground/75 font-semibold uppercase tracking-wider bg-secondary/30 px-3 py-1 rounded-full border border-border/20">
                  <Lock className="w-3 h-3 text-primary" />
                  Processed 100% locally
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={undo}
                      disabled={historyIndex === 0}
                      className="h-9 text-xs font-bold rounded-xl border-border/80 hover:bg-muted text-foreground"
                    >
                      <Undo2 className="w-3.5 h-3.5 mr-1.5" /> Undo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className="h-9 text-xs font-bold rounded-xl border-border/80 hover:bg-muted text-foreground"
                    >
                      <Redo2 className="w-3.5 h-3.5 mr-1.5" /> Redo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAll}
                      disabled={redactions.length === 0}
                      className="h-9 text-xs font-bold rounded-xl border-border/80 hover:bg-destructive/5 hover:border-destructive/30 text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear Redactions
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFile(null);
                        setImageObj(null);
                        setRedactions([]);
                      }}
                      className="h-9 text-xs font-bold rounded-xl border-border/80 text-foreground hover:bg-secondary/40"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Start Over
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDownload}
                      className="h-9 text-xs font-extrabold rounded-xl bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary-hover text-primary-foreground shadow-md hover:shadow-lg active:scale-[0.98] transition-all gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Protected PNG
                    </Button>
                  </div>
                </div>

                <div
                  className="flex-1 bg-canvas rounded-2xl border border-border/50 overflow-hidden relative flex items-center justify-center min-h-[500px] shadow-inner p-4"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                  }}
                >
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
                      className="w-full h-full object-contain pointer-events-none rounded-md"
                    />
                    {renderOverlay()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Controls Panel */}
          <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
            <div className="bg-card border border-border/60 shadow-md rounded-2xl p-5 space-y-6">
              {/* Redaction Settings */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                  <Shield className="w-4 h-4 text-primary" /> Redaction Tools
                </h3>

                <div className="space-y-3">
                  <div className="flex bg-secondary p-1 rounded-lg">
                    <button
                      className={cn(
                        "flex-1 text-xs py-1.5 rounded-md font-bold transition-colors",
                        mode === 'solid' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => setMode('solid')}
                    >
                      Solid
                    </button>
                    <button
                      className={cn(
                        "flex-1 text-xs py-1.5 rounded-md font-bold transition-colors",
                        mode === 'blur' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => setMode('blur')}
                    >
                      Blur
                    </button>
                  </div>

                  {mode === 'blur' && (
                    <div className="p-3 bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 text-destructive text-xs leading-normal">
                      <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-destructive" />
                      <span>Blurring is theoretically reversible. Use <strong>Solid</strong> blocks for sensitive fields (e.g. ID numbers).</span>
                    </div>
                  )}

                  {mode === 'solid' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground">Solid Color</label>
                      <div className="flex gap-2">
                        <button
                          className={cn("w-8 h-8 rounded-lg border-2", solidColor === '#000000' ? "border-primary" : "border-transparent")}
                          style={{ backgroundColor: '#000000' }}
                          onClick={() => setSolidColor('#000000')}
                        />
                        <button
                          className={cn("w-8 h-8 rounded-lg border-2", solidColor === '#ffffff' ? "border-primary" : "border-border")}
                          style={{ backgroundColor: '#ffffff' }}
                          onClick={() => setSolidColor('#ffffff')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-border/40" />

              {/* Watermark Settings */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                  <Type className="w-4 h-4 text-primary" /> Watermark Settings
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">Watermark Text</label>
                    <input
                      type="text"
                      value={watermark.text}
                      onChange={(e) => setWatermark(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="e.g. For verification only"
                      className="w-full bg-secondary border border-border hover:border-primary/30 focus:border-primary focus:outline-none rounded-xl h-10 px-3 text-sm font-semibold transition-all"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold flex-1 rounded-lg border-border hover:bg-secondary" onClick={setTodayDate}>
                        + Add Date
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold flex-1 rounded-lg border-border hover:bg-secondary" onClick={setPurposeText}>
                        + Add Purpose
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/30 pt-3">
                    <label className="text-xs font-bold text-foreground">Tiled Pattern</label>
                    <Switch
                      checked={watermark.tiled}
                      onCheckedChange={(c) => setWatermark(prev => ({ ...prev, tiled: c }))}
                    />
                  </div>

                  {/* Opacity slider */}
                  <div className="space-y-2 border-t border-border/30 pt-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground">Opacity</span>
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-extrabold text-[11px]">
                        {watermark.opacityPct}%
                      </span>
                    </div>
                    <Slider
                      value={[watermark.opacityPct]}
                      min={1} max={100} step={1}
                      onValueChange={(v) => setWatermark(prev => ({ ...prev, opacityPct: v[0] }))}
                    />
                  </div>

                  {/* Font Size slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground">Text Size</span>
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-extrabold text-[11px]">
                        {watermark.fontScalePct}%
                      </span>
                    </div>
                    <Slider
                      value={[watermark.fontScalePct]}
                      min={1} max={20} step={1}
                      onValueChange={(v) => setWatermark(prev => ({ ...prev, fontScalePct: v[0] }))}
                    />
                  </div>

                  {/* Angle slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground">Rotation Angle</span>
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-extrabold text-[11px]">
                        {watermark.angleDeg}°
                      </span>
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
        </section>

        {/* How It Works Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Protect and secure your sensitive identity documents in four simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: <span>Upload<br />Document</span>,
                text: "Select your KTP, SIM, passport, or ID photo. Your document never leaves your browser.",
              },
              {
                step: "02",
                title: <span>Redact Sensitive<br />Info</span>,
                text: "Draw SOLID redaction boxes over sensitive fields like NIK/ID numbers, signatures, and addresses.",
              },
              {
                step: "03",
                title: <span>Apply<br />Watermark</span>,
                text: "Add a diagonal tiled watermark stating the purpose and date to prevent unauthorized reuse.",
              },
              {
                step: "04",
                title: <span>Download<br />PNG</span>,
                text: "Save the protected PNG directly. Redactions are baked into the pixels and metadata is stripped.",
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
              Common Use Cases
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Prevent fraud when sharing identity verification documents with third parties.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Vehicle & Property Rentals",
                text: "Secure your KTP, SIM, or passport copy before sending it to rental providers. Add a watermark containing the rental agency name and date to avoid reuse.",
              },
              {
                title: "Freelance & Gig Verification",
                text: "Redact non-essential numbers and signature blocks before submitting your ID to gig platforms or freelance marketplace verification portals.",
              },
              {
                title: "Hotel Check-ins & Services",
                text: "Avoid sending raw, unprotected ID photos over WhatsApp or email for hotel reservations, freelance contracts, or service registrations.",
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
                q: "Are my ID files uploaded to a server?",
                a: "No. ID Privacy Shield runs entirely in your web browser. All processing, redaction, and watermark overlay is done locally via sandbox canvas APIs. Your private documents never touch our servers.",
              },
              {
                q: "Can the solid redaction blocks be reversed?",
                a: "No. When you use Solid redactions, the pixels are baked directly into the output PNG, permanently overwriting the original pixels. Note that Blur is theoretically reversible, so we strongly recommend Solid blocks for highly sensitive data.",
              },
              {
                q: "Does the watermark prevent cropping?",
                a: "Yes. By choosing the Tiled Pattern option, the watermark is rendered repeatedly across the entire document canvas. This makes it impossible to crop the watermark out without cropping out the ID content itself.",
              },
              {
                q: "Does this tool work on mobile devices?",
                a: "Yes. ID Privacy Shield is responsive and fully supports touch controls, allowing you to draw redaction blocks and download documents on smartphones and tablets.",
              },
              {
                q: "Is metadata and EXIF data stripped?",
                a: "Yes. Re-encoding the modified image to PNG automatically strips all EXIF metadata, GPS coordinates, device tags, and history parameters for maximum privacy.",
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

        {/* Related Privacy Tools internal link block */}
        <section className="max-w-4xl mx-auto w-full space-y-4 pt-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground text-center sm:text-left">
            Related Privacy Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    Obscure faces, plates, and info locally.
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </Link>

            <Link
              href="/tools/watermark"
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors">
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Watermark Image
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Add custom text or image watermarks.
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </Link>

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
                    Strip metadata and GPS tags.
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </Link>
          </div>
        </section>

        {/* Offline Privacy notice block */}
        <PrivacyNotice>
          <p>
            Alatify processes your ID files completely locally using sandbox APIs inside your browser tab. We never upload any of your documents or private coordinates to external clouds, making the tool 100% immune to leaks or server-side logging. Redact sensitive identity numbers, overlay diagonal tiled watermarks, and strip GPS/camera EXIF metadata instantly and safely on your own device before distribution.
          </p>
        </PrivacyNotice>
      </div>
    </main>
  );
}
