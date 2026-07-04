import { GeistMono } from "geist/font/mono";
import { domToPng, domToSvg } from "modern-screenshot";

const FONT_OPTIONS = { preferredFormat: "woff2" as const };

async function ensureFontsLoaded(): Promise<void> {
  await document.fonts.ready;
  await document.fonts.load(`14px ${GeistMono.style.fontFamily}`);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function capturePng(node: HTMLElement): Promise<Blob> {
  await ensureFontsLoaded();
  const dataUrl = await domToPng(node, {
    scale: 2,
    backgroundColor: null,
    font: FONT_OPTIONS,
  });
  return dataUrlToBlob(dataUrl);
}

export async function captureSvg(node: HTMLElement): Promise<string> {
  await ensureFontsLoaded();
  return domToSvg(node, {
    font: FONT_OPTIONS,
  });
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadSvg(svg: string, fileName: string): void {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, fileName);
}