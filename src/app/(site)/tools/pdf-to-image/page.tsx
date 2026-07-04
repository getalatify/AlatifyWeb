import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import PdfToImageClient from "./pdf-to-image-client";

export const metadata: Metadata = {
  title: "Free PDF to Image Converter — 100% Private, Client-Side | Alatify",
  description: "Convert PDF pages into high-quality JPG or PNG images on-device. Choose resolution scale, select specific page ranges, and download as ZIP. Completely private.",
  openGraph: {
    title: "Free PDF to Image Converter — 100% Private, Client-Side | Alatify",
    description: "Convert PDF pages into high-quality JPG or PNG images on-device. Choose resolution scale, select specific page ranges, and download as ZIP. Completely private.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "PDF to Image Converter — Alatify",
      "url": "https://getalatify.com/tools/pdf-to-image",
      "description": "Convert PDF pages into high-quality JPG or PNG images on-device. Choose resolution scale, select specific page ranges, and download as ZIP. Completely private.",
      "applicationCategory": "DocumentApplication",
      "operatingSystem": "Web Browser",
      "browserRequirements": "Requires a modern web browser",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "isAccessibleForFree": true,
      "publisher": { "@type": "Organization", "name": "Alatify", "url": "https://getalatify.com" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://getalatify.com" },
        { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://getalatify.com/tools" },
        { "@type": "ListItem", "position": 3, "name": "PDF to Image", "item": "https://getalatify.com/tools/pdf-to-image" }
      ]
    }
  ]
};

export default function PdfToImagePage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <PdfToImageClient />
    </>
  );
}
