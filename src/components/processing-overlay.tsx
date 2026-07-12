"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/useT";

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface ProcessingOverlayProps {
  isProcessing: boolean;
  onCancel?: () => void;
  canCancel?: boolean;
  elapsed?: number;
  stage?: 'idle' | 'initializing' | 'downloading' | 'compiling' | 'processing' | 'complete' | 'error';
  downloadProgress?: number;
  downloadingFile?: string;
  modelType?: 'isnet_fp16' | 'isnet_quint8' | 'isnet';
  // Optional overrides so other tools (e.g. the AI Upscaler) can reuse this
  // overlay with their own copy. When omitted, default behaviour is unchanged.
  modelSizeLabel?: string;
  processingTitle?: string;
  processingDescription?: string;
  /** When in the processing stage, show "X / Y tiles" + a determinate bar. */
  tileDone?: number;
  tileTotal?: number;
}

const modelSizes = {
  isnet_quint8: "~45 MB",
  isnet_fp16: "~85 MB",
  isnet: "~170 MB",
};

export function ProcessingOverlay({
  isProcessing,
  onCancel,
  canCancel = false,
  elapsed,
  stage,
  downloadProgress = 0,
  downloadingFile = "",
  modelType = "isnet_fp16",
  modelSizeLabel,
  processingTitle,
  processingDescription,
  tileDone,
  tileTotal,
}: ProcessingOverlayProps) {
  const t = useT();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Scroll Lock Safety: Capture original document.body.style.overflow value
  // and restore it on cleanup.
  useEffect(() => {
    if (!isProcessing) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isProcessing]);

  // ESC Key listener
  useEffect(() => {
    if (!isProcessing || !onCancel) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProcessing, onCancel]);

  if (!isProcessing || !mounted) return null;

  const modelSize = modelSizeLabel || modelSizes[modelType] || "~85 MB";
  const tileMode =
    stage === "processing" &&
    typeof tileDone === "number" &&
    typeof tileTotal === "number" &&
    tileTotal > 0;
  const tilePercent = tileMode
    ? Math.min(100, Math.round((tileDone! / tileTotal!) * 100))
    : 0;

  let title = processingTitle || t("processingOverlay.default.title");
  let description =
    processingDescription ||
    t("processingOverlay.default.description");
  let showProgressBar = false;

  if (stage === "downloading") {
    title = t("processingOverlay.downloading.title");
    description = t("processingOverlay.downloading.description", { modelSize });
    showProgressBar = true;
  } else if (stage === "initializing" || stage === "compiling") {
    title = t("processingOverlay.initializing.title");
    description = stage === "compiling"
      ? t("processingOverlay.compiling.description")
      : t("processingOverlay.initializing.description");
  } else if (stage === "processing") {
    title = processingTitle || t("processingOverlay.default.title");
    description =
      processingDescription ||
      t("processingOverlay.processing.description");
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/95 supports-[backdrop-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur-sm pointer-events-auto select-none transition-all duration-300 animate-fade-in">
      <div className="flex flex-col items-center gap-4 text-center max-w-md w-full p-6 bg-card rounded-2xl border border-border shadow-2xl mx-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {showProgressBar && (
          <div className="w-full mt-2 space-y-1.5">
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden border border-border/60">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
              <span className="truncate max-w-[150px]">{downloadingFile || t("processingOverlay.downloadingLabel")}</span>
              <span>{downloadProgress}%</span>
            </div>
          </div>
        )}

        {tileMode && (
          <div className="w-full mt-2 space-y-1.5">
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden border border-border/60">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${tilePercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
              <span>{t("processingOverlay.upscalingTiles", { done: tileDone ?? 0, total: tileTotal ?? 0 })}</span>
              <span>{tilePercent}%</span>
            </div>
          </div>
        )}

        {elapsed !== undefined && stage === "processing" && (
          <span className="text-xs text-muted-foreground/80 mt-0.5 font-mono">
            {t("processingOverlay.elapsedPrefix")}{formatElapsed(elapsed)}
          </span>
        )}

        {canCancel && onCancel ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="mt-2 text-xs border-border hover:bg-muted text-foreground px-4"
          >
            {t("processingOverlay.cancelButton")}
          </Button>
        ) : (
          <p className="text-[10px] text-muted-foreground italic mt-2">
            {t("processingOverlay.noCancelNotice")}
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}
