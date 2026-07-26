"use client";

import React from "react";
import Link from "next/link";
import {
  Plane,
  Image as ImageIcon,
  Trash2,
  Sliders,
  EyeOff,
  Box,
  Brush,
  Upload,
  Link as LinkIcon,
  ImageUp,
  Download,
  Shield,
  AlertTriangle,
  Undo,
  MousePointer2,
  CheckCircle2,
} from "lucide-react";
import { useT } from "@/lib/i18n/useT";
import { useInView } from "@/hooks/use-in-view";

export function HomeDeviceSections() {
  const t = useT();
  const phone = useInView({ threshold: 0.35, rootMargin: "0px 0px -12% 0px" });
  const desktop = useInView({ threshold: 0.35, rootMargin: "0px 0px -12% 0px" });

  return (
    <>
      <noscript>
        <style>{`.device-replica-view{opacity:1!important}.device-scene-a{opacity:0!important}.device-scene-b{opacity:1!important}.device-replica-scroll{transform:none!important}.device-redact-box{opacity:1!important;transform:none!important}.device-chip-inner{opacity:1!important}.device-touch-a,.device-touch-b,.device-touch-c{opacity:0!important}.device-dl-btn{transform:none!important}.device-drop-accept{opacity:0!important}.device-title-idle{opacity:1!important}.device-title-accept{opacity:0!important}.device-dl-toast{opacity:0!important}.device-desk-scene-a{opacity:0!important}.device-desk-scene-b{opacity:1!important}.device-desk-row-1,.device-desk-row-2,.device-desk-row-3{opacity:1!important;transform:none!important}.device-desk-progress-fill{transform:scaleX(1)!important}.device-desk-progress-panel{opacity:1!important}.device-desk-zip-row,.device-desk-success{opacity:1!important;transform:none!important}.device-desk-cursor-a,.device-desk-cursor-b,.device-desk-cursor-c{opacity:0!important}.device-desk-convert-btn,.device-desk-zip-btn{transform:none!important}`}</style>
      </noscript>

      {/* Section one: phone + Blur & Redact */}
      <section
        id="features-section"
        className={`mt-20 w-full max-w-5xl z-10 shrink-0 scroll-mt-6 grid grid-cols-1 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] gap-8 md:gap-12 items-center ${
          phone.inView ? "device-inview device-phone-loop" : ""
        }`}
      >
        {/* DOM order: text first */}
        <div className="order-1 md:order-2 flex flex-col gap-3 text-left">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
            {t("home.device.blur.title")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
            {t("home.device.blur.text")}
          </p>
          <Link
            href="/tools/blur"
            className="inline-flex items-center text-sm font-semibold text-foreground underline-offset-4 hover:underline w-fit"
          >
            {t("home.device.blur.cta")}
          </Link>
        </div>

        {/* Device second; left at md — observer on device column */}
        <div
          ref={phone.ref as React.RefObject<HTMLDivElement>}
          className="order-2 md:order-1 flex justify-center md:justify-start"
        >
          <div className="device-phone-bezel w-full max-w-[15rem] aspect-[9/19.5] rounded-[1.75rem] border border-border bg-card shadow-md overflow-hidden flex flex-col">
            {/* Status bar */}
            <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 shrink-0">
              <div className="flex items-center gap-1">
                <span className="block h-1.5 w-6 rounded-full bg-muted-foreground/50" />
                <span className="block h-1.5 w-3 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Plane className="w-3 h-3" aria-hidden="true" />
                <span className="text-[9px] font-medium leading-none">
                  {t("home.device.blur.airplane")}
                </span>
              </div>
            </div>

            {/* Screen */}
            <div className="flex-1 min-h-0 px-2.5 pb-3 flex flex-col gap-2">
              <div className="h-6 rounded-md bg-secondary border border-border shrink-0" />

              {/* Viewport: one-shot fade only — never scale. aria-hidden decorative. */}
              <div
                className="device-replica-view relative flex-1 min-h-0 w-full overflow-hidden rounded-lg bg-secondary/60 border border-border"
                aria-hidden="true"
              >
                {/*
                  Faithful English replica of Blur & Redact.
                  326×664 × 0.6748 = 220×448 (screen content box).
                  Scale STATIC FOREVER — never animated / never transform:none.
                */}
                <div
                  className="device-replica-scale"
                  style={{
                    width: 326,
                    height: 664,
                    transform: "scale(0.6748)",
                    transformOrigin: "top left",
                  }}
                >
                  {/* SCENE A — empty upload, vertically centred (blur-client L990) */}
                  <div
                    className="device-scene-a absolute inset-x-0 top-0 z-10 w-full flex flex-col items-center justify-center px-3"
                    style={{ height: 664 }}
                  >
                    <div className="w-full space-y-3">
                      <div className="grid grid-cols-2 w-full p-1 bg-secondary/60 rounded-xl border border-border/40">
                        <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-semibold bg-background text-foreground shadow-sm border border-border/50">
                          <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                          Upload File
                        </div>
                        <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-semibold text-muted-foreground">
                          <LinkIcon className="w-3.5 h-3.5" aria-hidden="true" />
                          Paste URL
                        </div>
                      </div>

                      {/* Single dropzone: shared icon/specs; title crossfade in fixed-height box; accept skin has no text */}
                      <div className="relative w-full">
                        <div className="relative w-full min-h-[280px] rounded-[var(--radius)] p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-primary/30 bg-transparent text-muted-foreground">
                          {/* Accept skin — border/bg only; no text/icon (showAccept: border-primary bg-primary/5 border-solid) */}
                          <div className="device-drop-accept absolute inset-0 rounded-[var(--radius)] border-2 border-solid border-primary bg-primary/5 pointer-events-none" />
                          <div className="relative z-[1] space-y-3 flex flex-col items-center w-full">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border bg-secondary/50 border-border">
                              <ImageUp className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
                            </div>
                            <div className="space-y-1 w-full">
                              {/* h-10: text-sm (~14px) × ~1.4 leading × 2 lines ≈ 40px; holds both titles without shifting specs */}
                              <div className="relative h-10 w-full">
                                <p className="device-title-idle absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground leading-tight px-1">
                                  Drag and drop image here, or click to select
                                </p>
                                <p className="device-title-accept absolute inset-0 flex items-center justify-center text-sm font-bold text-primary leading-tight px-1">
                                  Drop your image here
                                </p>
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                Up to 50MB · JPG, PNG, WebP, HEIC, TIFF, SVG
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Finger A — dropzone center; -22px baked in keyframes */}
                        <div
                          className="device-touch-a absolute z-10 w-11 h-11 rounded-full bg-foreground/80 ring-2 ring-background/80 shadow-md pointer-events-none"
                          style={{ left: "50%", top: "50%" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SCENE B — loaded workspace; scroll wrapper owns translateY only */}
                  <div
                    className="device-scene-b absolute inset-x-0 top-0 w-full overflow-hidden"
                    style={{ height: 664 }}
                  >
                    <div className="device-replica-scroll w-full">
                      <div className="grid grid-cols-1 gap-8 w-full">
                        <div className="flex flex-col gap-4 w-full">
                          {/* Canvas card */}
                          <div className="w-full p-3 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-3">
                            <div className="flex items-center justify-between border-b border-border/40 pb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                                Interactive Workspace
                              </span>
                              <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
                                1.9 MB
                              </span>
                            </div>

                            <div className="relative w-full aspect-[4/3] bg-[#0f0f11] rounded-xl overflow-hidden border border-border/50 shadow-inner min-h-[320px] flex items-center justify-center p-4">
                              <div className="relative w-full h-full max-h-[300px] flex items-center justify-center">
                                <div className="relative w-[240px] h-[240px] rounded-xl bg-muted overflow-hidden flex flex-col items-center justify-center">
                                  <span className="block w-20 h-20 rounded-full bg-muted-foreground/25" />
                                  <span className="block w-[7.5rem] h-12 mt-3 rounded-t-full bg-muted-foreground/20" />

                                  {/* Box = finger B path: left/top = start, w/h = delta */}
                                  <div
                                    className="device-redact-box absolute z-[5] rounded-sm bg-foreground pointer-events-none"
                                    style={{
                                      left: 74,
                                      top: 46,
                                      width: 92,
                                      height: 88,
                                    }}
                                  />

                                  {/* Finger B — face drag; -22px baked in keyframes */}
                                  <div
                                    className="device-touch-b absolute z-10 w-11 h-11 rounded-full bg-foreground/80 ring-2 ring-background/80 shadow-md pointer-events-none"
                                    style={{ left: 74, top: 46 }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                              <span className="font-medium truncate max-w-[150px]">
                                photo.jpg
                              </span>
                              <span className="font-semibold shrink-0">
                                1600 × 1600 · JPEG
                              </span>
                            </div>
                          </div>

                          {/* Replace / Remove bar */}
                          <div className="flex items-center justify-end p-3 bg-card rounded-2xl border border-border/60 shadow-sm w-full gap-2">
                            <span className="text-xs border border-border rounded-xl h-9 px-3 inline-flex items-center font-medium text-foreground">
                              Replace Image
                            </span>
                            <span className="text-xs rounded-xl h-9 px-3 inline-flex items-center gap-1.5 text-destructive">
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              Remove
                            </span>
                          </div>
                        </div>

                        {/* Full sidebar — Solid Fill selected; no strength slider */}
                        <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-md w-full">
                          <div className="space-y-5">
                            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
                              <Sliders className="w-4 h-4 text-primary" aria-hidden="true" />
                              <span className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
                                Redact Controls
                              </span>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                                Automation
                              </span>
                              <div className="w-full text-xs font-bold py-2.5 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 h-10">
                                <EyeOff className="w-4 h-4" aria-hidden="true" />
                                <span>Auto-Detect Faces</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                                ⚡ Local face detection. Works best on clear, front-facing faces. Manual touch-up is available.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                                Selection Method
                              </span>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-[10px] font-bold py-2 rounded-xl border border-border/40 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground">
                                  <Box className="w-3.5 h-3.5" aria-hidden="true" />
                                  Box Mode
                                </div>
                                <div className="text-[10px] font-bold py-2 rounded-xl border border-border/40 flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground">
                                  <Brush className="w-3.5 h-3.5" aria-hidden="true" />
                                  Brush Mode
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                                Redaction Effect
                              </span>
                              <div className="grid grid-cols-3 gap-1.5">
                                <div className="text-[9px] font-bold py-2.5 rounded-xl border border-border/40 bg-secondary text-secondary-foreground text-center">
                                  Blur
                                </div>
                                <div className="text-[9px] font-bold py-2.5 rounded-xl border border-border/40 bg-secondary text-secondary-foreground text-center">
                                  Pixelate
                                </div>
                                <div className="text-[9px] font-bold py-2.5 rounded-xl border border-border/40 bg-primary text-primary-foreground text-center">
                                  Solid Fill
                                </div>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-secondary/50 border border-border/40 text-[10px] text-muted-foreground leading-relaxed flex gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-foreground" aria-hidden="true" />
                              <p>
                                <span className="font-bold text-foreground">Security Note:</span> For truly sensitive text or info, use{" "}
                                <strong className="text-foreground">Solid Fill</strong>. Blur and pixelate algorithms can sometimes be partially reversed via reconstruction tools.
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-[10px] font-bold py-2 rounded-xl border border-border/40 flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground">
                                <Undo className="w-3.5 h-3.5" aria-hidden="true" />
                                Undo Last
                              </div>
                              <div className="text-[10px] font-bold py-2 rounded-xl border border-border/40 flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground">
                                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                Clear All
                              </div>
                            </div>

                            <div className="mt-4 pt-5 border-t border-border/40 space-y-4">
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                                  Export Format
                                </span>
                                <div className="h-10 w-full rounded-xl border border-border bg-popover px-3 flex items-center text-xs font-medium text-foreground">
                                  PNG
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                                <Shield className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                                <span>Privacy Mode Active · Metadata removed on export</span>
                              </div>

                              <div className="flex flex-col gap-1 w-full">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  File Name
                                </span>
                                <div className="flex items-center gap-1.5 w-full">
                                  <div className="flex-1 min-w-0 h-9 px-2.5 rounded-lg border border-border bg-popover text-popover-foreground text-xs font-mono flex items-center">
                                    photo-redacted
                                  </div>
                                  <span className="text-xs font-mono text-muted-foreground shrink-0">.png</span>
                                </div>
                              </div>

                              {/* Download + finger C (scrolls with button) */}
                              <div className="relative">
                                <div className="device-dl-btn w-full h-11 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2">
                                  <Download className="w-4 h-4" aria-hidden="true" />
                                  Download Redacted Image
                                </div>
                                <div
                                  className="device-touch-c absolute z-10 w-11 h-11 rounded-full bg-foreground/80 ring-2 ring-background/80 shadow-md pointer-events-none"
                                  style={{ left: "50%", top: "50%" }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chip toast over canvas well bottom; outside scale; not scrolled */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                  style={{ top: 236 }}
                >
                  <div className="device-chip-inner flex items-center gap-1 rounded-full bg-card border border-border px-2 py-0.5 shadow-sm">
                    <span className="block w-2 h-2 rounded-full bg-foreground" />
                    <span className="text-[9px] font-semibold text-foreground leading-none">
                      {t("home.device.blur.done")}
                    </span>
                  </div>
                </div>

                {/*
                  Download success toast (real: toast.success PNG string).
                  Outside scale; not scrolled. top:10 → ~y10–50 of 448 viewport.
                  Chip at 236 gone by 56%; Download press 70–73% at bottom — no collide.
                */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none"
                  style={{ top: 10, width: "calc(100% - 16px)", maxWidth: 200 }}
                >
                  <div className="device-dl-toast rounded-md border border-border bg-card px-2 py-1.5 shadow-md flex items-start gap-1.5">
                    <CheckCircle2
                      className="w-3 h-3 text-success shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="text-[8px] font-medium text-foreground leading-snug">
                      Redacted image exported as PNG (EXIF metadata removed).
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section two: desktop browser + Format Converter batch ZIP */}
      <section
        className={`mt-20 w-full max-w-5xl z-10 shrink-0 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center ${
          desktop.inView ? "device-inview device-desktop-loop" : ""
        }`}
      >
        <div className="flex flex-col gap-3 text-left">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
            {t("home.device.batch.title")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
            {t("home.device.batch.text")}
          </p>
          <Link
            href="/tools/converter"
            className="inline-flex items-center text-sm font-semibold text-foreground underline-offset-4 hover:underline w-fit"
          >
            {t("home.device.batch.cta")}
          </Link>
        </div>

        <div
          ref={desktop.ref as React.RefObject<HTMLDivElement>}
          className="w-full"
        >
          <div className="device-browser-bezel w-full aspect-[16/10] rounded-xl border border-border bg-card shadow-md overflow-hidden flex flex-col">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/40 shrink-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="block w-2 h-2 rounded-full bg-muted-foreground/40" />
                <span className="block w-2 h-2 rounded-full bg-muted-foreground/40" />
                <span className="block w-2 h-2 rounded-full bg-muted-foreground/40" />
              </div>
              <div className="flex-1 min-w-0 h-5 rounded-md bg-background border border-border px-2 flex items-center">
                <span className="text-[10px] font-mono text-muted-foreground truncate">
                  /tools/converter
                </span>
              </div>
            </div>

            {/* Browser body: sequential empty → working scenes */}
            <div className="relative flex-1 min-h-0 overflow-hidden">
              {/* Scene A — empty dropzone */}
              <div className="device-desk-scene-a absolute inset-0 p-3 flex flex-col">
                <div className="relative flex-1 rounded-md border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-center px-2">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Drop images to convert
                  </span>
                  <span className="text-[9px] text-muted-foreground/80 mt-1">
                    Batch · ZIP download
                  </span>
                  <div className="device-desk-drop-accept absolute inset-0 rounded-md border-2 border-solid border-primary bg-primary/5 pointer-events-none" />
                </div>
                {/* Cursor A: left/top = dropzone centre target (Akira can nudge) */}
                <div
                  className="device-desk-cursor-a absolute z-20 pointer-events-none"
                  style={{ left: "50%", top: "55%" }}
                >
                  <MousePointer2 className="w-3.5 h-3.5 text-foreground drop-shadow-sm" aria-hidden="true" />
                </div>
              </div>

              {/* Scene B — working queue */}
              <div className="device-desk-scene-b absolute inset-0 p-3 flex flex-col gap-1.5 overflow-hidden">
                <div className="flex items-center justify-between shrink-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Batch queue
                  </span>
                  <span className="text-[9px] font-semibold text-foreground px-1.5 py-0.5 rounded bg-secondary border border-border">
                    WebP
                  </span>
                </div>

                <div className="device-desk-row-1 flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-2 py-1.5">
                  <span className="block w-3 h-3 rounded-sm bg-muted-foreground/30 shrink-0" />
                  <span className="text-[10px] font-mono text-muted-foreground truncate flex-1">
                    img-01.png
                  </span>
                  <span className="text-[9px] text-success font-bold shrink-0">· Ready</span>
                </div>
                <div className="device-desk-row-2 flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-2 py-1.5">
                  <span className="block w-3 h-3 rounded-sm bg-muted-foreground/30 shrink-0" />
                  <span className="text-[10px] font-mono text-muted-foreground truncate flex-1">
                    img-02.png
                  </span>
                  <span className="text-[9px] text-success font-bold shrink-0">· Ready</span>
                </div>
                <div className="device-desk-row-3 flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-2 py-1.5">
                  <span className="block w-3 h-3 rounded-sm bg-muted-foreground/30 shrink-0" />
                  <span className="text-[10px] font-mono text-muted-foreground truncate flex-1">
                    img-03.png
                  </span>
                  <span className="text-[9px] text-success font-bold shrink-0">· Ready</span>
                </div>

                <div className="device-desk-convert-btn relative mt-auto rounded-md bg-primary text-primary-foreground text-[10px] font-bold py-1.5 text-center">
                  <span className="device-desk-convert-label-idle">Convert Batch</span>
                  <span className="device-desk-convert-label-busy absolute inset-0 flex items-center justify-center">
                    Converting Batch...
                  </span>
                </div>

                <div className="device-desk-progress-panel space-y-1">
                  <div className="flex justify-between text-[9px] font-bold text-foreground">
                    <span>{t("home.device.batch.progress")}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="device-desk-progress-fill h-full w-full rounded-full bg-foreground origin-left" />
                  </div>
                  <div className="relative h-3.5 text-[9px] text-muted-foreground font-semibold">
                    <span className="device-desk-stage-1 absolute inset-0 truncate">
                      Converting image 1 of 3: img-01.png
                    </span>
                    <span className="device-desk-stage-2 absolute inset-0 truncate">
                      Converting image 2 of 3: img-02.png
                    </span>
                    <span className="device-desk-stage-3 absolute inset-0 truncate">
                      Converting image 3 of 3: img-03.png
                    </span>
                  </div>
                </div>

                <div className="device-desk-success flex items-start gap-1.5 rounded-md border border-success/15 bg-success/5 px-2 py-1">
                  <CheckCircle2 className="w-3 h-3 text-success shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-[9px] text-muted-foreground leading-snug">
                    Successfully converted all images and bundled into a ZIP archive.
                  </span>
                </div>

                <div className="device-desk-zip-row flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-2 py-1.5">
                  <span className="block w-3 h-3 rounded-sm bg-foreground/80 shrink-0" />
                  <span className="text-[10px] font-mono font-semibold truncate flex-1">
                    {t("home.device.batch.zip")}
                  </span>
                  <span className="device-desk-zip-btn text-[9px] font-bold shrink-0 px-1.5 py-0.5 rounded border border-border bg-background inline-block">
                    Download
                  </span>
                </div>

                {/* Cursor B: over Convert; Cursor C: over Download — nudge left/top in markup */}
                <div
                  className="device-desk-cursor-b absolute z-20 pointer-events-none"
                  style={{ left: "50%", top: "58%" }}
                >
                  <MousePointer2 className="w-3.5 h-3.5 text-foreground drop-shadow-sm" aria-hidden="true" />
                </div>
                <div
                  className="device-desk-cursor-c absolute z-20 pointer-events-none"
                  style={{ left: "88%", top: "92%" }}
                >
                  <MousePointer2 className="w-3.5 h-3.5 text-foreground drop-shadow-sm" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
