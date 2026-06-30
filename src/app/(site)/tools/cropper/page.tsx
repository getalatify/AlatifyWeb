import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/json-ld";

const CropperClient = dynamic(() => import("./cropper-client"));

export const metadata: Metadata = {
  title: "Free Image Cropper — Crop & Straighten Online, No Upload | Alatify",
  description: "Crop images to any ratio, adjust freely with draggable handles, and straighten with rotation — in your browser. No upload, no sign-up. Your photo stays on your device.",
  openGraph: {
    title: "Free Image Cropper — Crop & Straighten Online, No Upload | Alatify",
    description: "Crop images to any ratio, adjust freely with draggable handles, and straighten with rotation — in your browser. No upload, no sign-up. Your photo stays on your device.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Image Cropper — Alatify",
      "url": "https://getalatify.com/tools/cropper",
      "description": "Crop images to any ratio, adjust freely with draggable handles, and straighten with rotation — in your browser. No upload, no sign-up. Your photo stays on your device.",
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
        { "@type": "ListItem", "position": 3, "name": "Image Cropper", "item": "https://getalatify.com/tools/cropper" }
      ]
    }
  ]
};

export default function CropperPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <CropperClient />
    </>
  );
}

