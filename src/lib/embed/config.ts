export interface EmbeddableTool {
  id: string;
  slug: string;
  name: string;
  attributionName: string; // e.g. "background remover"
  iframeTitle: string;
  defaultWidth: string;
  defaultHeight: number;
  maxWidth: string;
}

export const EMBEDDABLE_TOOLS: EmbeddableTool[] = [
  {
    id: "bg-remover",
    slug: "bg-remover",
    name: "Background Remover",
    attributionName: "background remover",
    iframeTitle: "Free Background Remover by Alatify",
    defaultWidth: "100%",
    defaultHeight: 640,
    maxWidth: "520px",
  },
  {
    id: "qr-toolkit",
    slug: "qr-toolkit",
    name: "QR Toolkit",
    attributionName: "QR toolkit",
    iframeTitle: "Free QR Generator & Scanner by Alatify",
    defaultWidth: "100%",
    defaultHeight: 680,
    maxWidth: "520px",
  },
  {
    id: "compressor",
    slug: "compressor",
    name: "Image Compressor",
    attributionName: "image compressor",
    iframeTitle: "Free Image Compressor by Alatify",
    defaultWidth: "100%",
    defaultHeight: 640,
    maxWidth: "520px",
  },
  {
    id: "resizer",
    slug: "resizer",
    name: "Image Resizer",
    attributionName: "image resizer",
    iframeTitle: "Free Image Resizer by Alatify",
    defaultWidth: "100%",
    defaultHeight: 640,
    maxWidth: "520px",
  },
];
