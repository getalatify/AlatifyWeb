import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/json-ld";

const ResizerClient = dynamic(() => import("./resizer-client"));

export const metadata: Metadata = {
  title: "Free Image Resizer — Resize by Pixels or Percentage, No Upload | Alatify",
  description: "Resize images by exact pixels, percentage, or aspect ratio in your browser — batch resize with high-quality resampling, no upload, no sign-up. Files stay on your device.",
  openGraph: {
    title: "Free Image Resizer — Resize by Pixels or Percentage, No Upload | Alatify",
    description: "Resize images by exact pixels, percentage, or aspect ratio in your browser — batch resize with high-quality resampling, no upload, no sign-up. Files stay on your device.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Image Resizer — Alatify",
      "url": "https://getalatify.com/tools/resizer",
      "description": "Resize images by exact pixels, percentage, or aspect ratio in your browser — batch resize with high-quality resampling, no upload, no sign-up. Files stay on your device.",
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
        { "@type": "ListItem", "position": 3, "name": "Image Resizer", "item": "https://getalatify.com/tools/resizer" }
      ]
    }
  ]
};

export default function ResizerPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <ResizerClient />
    </>
  );
}

