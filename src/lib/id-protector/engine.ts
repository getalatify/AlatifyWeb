export type RedactionMode = 'solid' | 'blur';

export interface Redaction {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  mode: RedactionMode;
  color: string; // Used for solid mode
  blurStrength?: number;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isDisplayPreview: boolean = false,
  blurStrength: number = 25
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = source.naturalWidth;
  canvas.height = source.naturalHeight;

  // Draw source image
  ctx.drawImage(source, 0, 0, source.naturalWidth, source.naturalHeight);

  // Draw redactions
  for (const redaction of redactions) {
    if (redaction.mode === 'solid') {
      ctx.fillStyle = redaction.color;
      ctx.fillRect(redaction.x, redaction.y, redaction.w, redaction.h);
    } else if (redaction.mode === 'blur') {
      const strength = redaction.blurStrength ?? blurStrength ?? 25;
      const pad = Math.ceil(strength * 3);
      const sx = Math.max(0, redaction.x - pad);
      const sy = Math.max(0, redaction.y - pad);
      const ex = Math.min(source.naturalWidth,  redaction.x + redaction.w + pad);
      const ey = Math.min(source.naturalHeight, redaction.y + redaction.h + pad);
      const sw = ex - sx;
      const sh = ey - sy;
      if (sw > 0 && sh > 0) {
        const rc = document.createElement('canvas');
        rc.width = sw;
        rc.height = sh;
        const rctx = rc.getContext('2d');
        if (rctx) {
          rctx.filter = `blur(${strength}px)`;
          rctx.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
          ctx.drawImage(
            rc,
            redaction.x - sx, redaction.y - sy, redaction.w, redaction.h,
            redaction.x, redaction.y, redaction.w, redaction.h
          );
        }
      }
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
