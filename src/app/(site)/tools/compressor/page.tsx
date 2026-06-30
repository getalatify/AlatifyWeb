import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/json-ld";

const CompressorClient = dynamic(() => import("./compressor-client"));

export const metadata: Metadata = {
  title: "Free Image Compressor — Reduce File Size, No Upload | Alatify",
  description: "Compress JPG, PNG, and WebP images to a smaller size in your browser — lossy or lossless, batch processing, no upload, no sign-up. Shrink files while keeping quality.",
  openGraph: {
    title: "Free Image Compressor — Reduce File Size, No Upload | Alatify",
    description: "Compress JPG, PNG, and WebP images to a smaller size in your browser — lossy or lossless, batch processing, no upload, no sign-up. Shrink files while keeping quality.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Image Compressor — Alatify",
      "url": "https://getalatify.com/tools/compressor",
      "description": "Compress JPG, PNG, and WebP images to a smaller size in your browser — lossy or lossless, batch processing, no upload, no sign-up. Shrink files while keeping quality.",
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
        { "@type": "ListItem", "position": 3, "name": "Image Compressor", "item": "https://getalatify.com/tools/compressor" }
      ]
    }
  ]
};

export default function CompressorPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <CompressorClient />
    </>
  );
}

