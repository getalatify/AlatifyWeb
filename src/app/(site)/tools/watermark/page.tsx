import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { JsonLd } from "@/components/json-ld";

const WatermarkClient = dynamic(() => import("./watermark-client"), { ssr: false });

export const metadata: Metadata = {
  title: "Free Image Watermark Tool — Add Text or Logo Watermarks, Batch | Alatify",
  description: "Add text or logo watermarks to images in your browser — drag to position, tile diagonally, rotate, and batch-watermark up to 30 photos at once. No upload, no sign-up. Files stay on your device.",
  openGraph: {
    title: "Free Image Watermark Tool — Add Text or Logo Watermarks, Batch | Alatify",
    description: "Add text or logo watermarks to images in your browser — drag to position, tile diagonally, rotate, and batch-watermark up to 30 photos at once. No upload, no sign-up. Files stay on your device.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Image Watermark Tool — Alatify",
      "url": "https://getalatify.com/tools/watermark",
      "description": "Add text or logo watermarks to images in your browser — drag to position, tile diagonally, rotate, and batch-watermark up to 30 photos at once. No upload, no sign-up. Files stay on your device.",
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
        { "@type": "ListItem", "position": 3, "name": "Image Watermark", "item": "https://getalatify.com/tools/watermark" }
      ]
    }
  ]
};

export default function WatermarkPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <WatermarkClient
        geistSansFamily={GeistSans.style.fontFamily}
        geistMonoFamily={GeistMono.style.fontFamily}
      />
    </>
  );
}
