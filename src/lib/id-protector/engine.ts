export type RedactionMode = 'solid' | 'blur';

export interface Redaction {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  mode: RedactionMode;
  color: string; // Used for solid mode
}

export interface WatermarkConfig {
  text: string;
  opacityPct: number;
  fontScalePct: number;
  angleDeg: number;
  color: string;
  tiled: boolean;
  spacingPct: number;
}

export function renderToCanvas(
  source: HTMLImageElement,
  redactions: Redaction[],
  watermark: WatermarkConfig | null,
  canvas: HTMLCanvasElement,
  isDisplayPreview: boolean = false
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (isDisplayPreview) {
    // For preview, bound the canvas to max 1500px width/height to avoid massive repaints
    const MAX_PREVIEW_SIZE = 1500;
    const scale = Math.min(1, MAX_PREVIEW_SIZE / Math.max(source.naturalWidth, source.naturalHeight));
    canvas.width = source.naturalWidth * scale;
    canvas.height = source.naturalHeight * scale;
    ctx.scale(scale, scale);
  } else {
    // Size canvas to source natural dimensions for full export
    canvas.width = source.naturalWidth;
    canvas.height = source.naturalHeight;
  }

  // Draw source image
  ctx.drawImage(source, 0, 0, source.naturalWidth, source.naturalHeight);

  // Draw redactions
  for (const redaction of redactions) {
    if (redaction.mode === 'solid') {
      ctx.fillStyle = redaction.color;
      ctx.fillRect(redaction.x, redaction.y, redaction.w, redaction.h);
    } else if (redaction.mode === 'blur') {
      ctx.save();
      // Clip to redaction rect
      ctx.beginPath();
      ctx.rect(redaction.x, redaction.y, redaction.w, redaction.h);
      ctx.clip();

      // Apply blur to the clipped area
      ctx.filter = `blur(${Math.max(source.naturalWidth, source.naturalHeight) * 0.02}px)`; // Dynamic blur size
      // Draw image exactly in place to avoid scaling artifacts/misalignment
      ctx.drawImage(source, 0, 0, source.naturalWidth, source.naturalHeight);
      ctx.restore();
    }
  }

  // Draw watermark
  if (watermark && watermark.text.trim().length > 0) {
    ctx.save();

    // Convert percentage values
    const opacity = watermark.opacityPct / 100;
    const fontSize = source.naturalWidth * (watermark.fontScalePct / 100);
    const angleRad = (watermark.angleDeg * Math.PI) / 180;
    const spacing = source.naturalWidth * (watermark.spacingPct / 100);

    // Set text properties
    ctx.globalAlpha = opacity;
    ctx.fillStyle = watermark.color;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (watermark.tiled) {
      // Rotate canvas center
      const centerX = source.naturalWidth / 2;
      const centerY = source.naturalHeight / 2;

      ctx.translate(centerX, centerY);
      ctx.rotate(angleRad);

      // Calculate how far to tile
      // We need to tile enough to cover the whole image even when rotated
      const diag = Math.sqrt(source.naturalWidth * source.naturalWidth + source.naturalHeight * source.naturalHeight);
      const halfDiag = diag / 2;

      // Get text width to determine horizontal spacing
      const metrics = ctx.measureText(watermark.text);
      const textWidth = metrics.width;

      const stepX = textWidth + spacing;
      const stepY = fontSize + spacing;

      for (let x = -halfDiag; x < halfDiag; x += stepX) {
        for (let y = -halfDiag; y < halfDiag; y += stepY) {
          ctx.fillText(watermark.text, x, y);
        }
      }
    } else {
      ctx.translate(source.naturalWidth / 2, source.naturalHeight / 2);
      ctx.rotate(angleRad);
      ctx.fillText(watermark.text, 0, 0);
    }

    ctx.restore();
  }
}

export async function exportPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      },
      'image/png'
    );
  });
}
