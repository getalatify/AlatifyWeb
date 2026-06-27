import { PDFDocument, degrees } from "pdf-lib";
import type { PdfSource, WorkingPage } from "./types";

export async function loadPdfSource(file: File): Promise<PdfSource> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await PDFDocument.load(bytes);
  return {
    id: crypto.randomUUID(),
    fileName: file.name,
    bytes,
    doc,
  };
}

export function createWorkingPages(source: PdfSource): WorkingPage[] {
  const count = source.doc.getPageCount();
  return Array.from({ length: count }, (_, index) => ({
    id: crypto.randomUUID(),
    sourceId: source.id,
    sourceFileName: source.fileName,
    sourcePageIndex: index,
    rotation: 0,
    selected: false,
  }));
}

export async function exportWorkingPages(
  pages: WorkingPage[],
  sources: Record<string, PdfSource>,
  filename: string,
): Promise<void> {
  if (pages.length === 0) {
    throw new Error("No pages to export.");
  }

  const newPdf = await PDFDocument.create();

  for (const workingPage of pages) {
    const source = sources[workingPage.sourceId];
    if (!source) continue;

    const [copiedPage] = await newPdf.copyPages(source.doc, [
      workingPage.sourcePageIndex,
    ]);

    const originalRotation = source.doc
      .getPage(workingPage.sourcePageIndex)
      .getRotation().angle;
    const totalRotation = (originalRotation + workingPage.rotation) % 360;
    if (totalRotation !== 0) {
      copiedPage.setRotation(degrees(totalRotation));
    }

    newPdf.addPage(copiedPage);
  }

  const pdfBytes = await newPdf.save();
  const blob = new Blob([Uint8Array.from(pdfBytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function reorderPages<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }
  const result = [...items];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

export function filterPdfFiles(files: File[]): File[] {
  return files.filter((file) => file.name.toLowerCase().endsWith(".pdf"));
}