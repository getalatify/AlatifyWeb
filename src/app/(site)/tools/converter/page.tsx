import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/json-ld";

const ConverterClient = dynamic(() => import("./converter-client"));

export const metadata: Metadata = {
  title: "Free Image Converter — Convert to PNG, JPG, WebP, ICO & SVG | Alatify",
  description: "Convert images between 8 formats — PNG, JPG, WebP, ICO, SVG, TIFF, BMP, GIF — right in your browser. Batch convert, no upload, no sign-up. Files stay on your device.",
  openGraph: {
    title: "Free Image Converter — Convert to PNG, JPG, WebP, ICO & SVG | Alatify",
    description: "Convert images between 8 formats — PNG, JPG, WebP, ICO, SVG, TIFF, BMP, GIF — right in your browser. Batch convert, no upload, no sign-up. Files stay on your device.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Format Converter — Alatify",
      "url": "https://getalatify.com/tools/converter",
      "description": "Convert images between 8 formats — PNG, JPG, WebP, ICO, SVG, TIFF, BMP, GIF — right in your browser. Batch convert, no upload, no sign-up. Files stay on your device.",
      "applicationCategory": "MultimediaApplication",
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
        { "@type": "ListItem", "position": 3, "name": "Format Converter", "item": "https://getalatify.com/tools/converter" }
      ]
    }
  ]
};

export default function ConverterPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <ConverterClient />
    </>
  );
}

