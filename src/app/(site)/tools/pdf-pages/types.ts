import type { PDFDocument } from "pdf-lib";

export interface PdfSource {
  id: string;
  fileName: string;
  bytes: Uint8Array;
  doc: PDFDocument;
}

export interface WorkingPage {
  id: string;
  sourceId: string;
  sourceFileName: string;
  sourcePageIndex: number;
  rotation: number;
  selected: boolean;
}