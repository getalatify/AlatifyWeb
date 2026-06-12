import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/json-ld";

const ExifCleanerClient = dynamic(() => import("./exif-cleaner-client"), { ssr: false });

export const metadata: Metadata = {
  title: "Remove EXIF & GPS Metadata from Photos — Free, No Upload | Alatify",
  description: "Strip GPS location, camera details, and hidden metadata from your photos before sharing — 100% private, runs in your browser, no upload, fully lossless.",
  openGraph: {
    title: "Remove EXIF & GPS Metadata from Photos — Free, No Upload | Alatify",
    description: "Strip GPS location, camera details, and hidden metadata from your photos before sharing — 100% private, runs in your browser, no upload, fully lossless.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "EXIF Privacy Cleaner — Alatify",
      "url": "https://getalatify.com/tools/exif-cleaner",
      "description": "Strip GPS location, camera details, and hidden metadata from your photos before sharing — 100% private, runs in your browser, no upload, fully lossless.",
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
        { "@type": "ListItem", "position": 3, "name": "EXIF Privacy Cleaner", "item": "https://getalatify.com/tools/exif-cleaner" }
      ]
    }
  ]
};

export default function ExifCleanerPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <ExifCleanerClient />
    </>
  );
}

