import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import ImageToPdfClient from "./image-to-pdf-client";

export const metadata: Metadata = {
  title: "Free Image to PDF Converter: Combine Images Online Privately | Alatify",
  description: "Combine multiple PNG, JPG, or WebP images into a single PDF document. Drag-and-drop or shift buttons to reorder, set page margins, orientation, and sizes locally. 100% private.",
  openGraph: {
    title: "Free Image to PDF Converter: Combine Images Online Privately | Alatify",
    description: "Combine multiple PNG, JPG, or WebP images into a single PDF document. Drag-and-drop or shift buttons to reorder, set page margins, orientation, and sizes locally. 100% private.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Image to PDF Converter: Alatify",
      "url": "https://getalatify.com/tools/image-to-pdf",
      "description": "Combine multiple PNG, JPG, or WebP images into a single PDF document. Drag-and-drop or shift buttons to reorder, set page margins, orientation, and sizes locally. 100% private.",
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
        { "@type": "ListItem", "position": 3, "name": "Image to PDF", "item": "https://getalatify.com/tools/image-to-pdf" }
      ]
    }
  ]
};

export default function ImageToPdfPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <ImageToPdfClient />
    </>
  );
}
