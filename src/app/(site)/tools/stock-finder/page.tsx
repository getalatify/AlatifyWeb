import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/json-ld";

const StockFinderClient = dynamic(() => import("./stock-finder-client"), { ssr: false });

export const metadata: Metadata = {
  title: "Free Stock Photos, Illustrations & Vectors — Search & Edit | Alatify",
  description: "Search millions of free stock photos, illustrations, and vectors from Unsplash, Pexels, and Pixabay in one place — then edit them instantly with Alatify's browser tools. No sign-up.",
  openGraph: {
    title: "Free Stock Photos, Illustrations & Vectors — Search & Edit | Alatify",
    description: "Search millions of free stock photos, illustrations, and vectors from Unsplash, Pexels, and Pixabay in one place — then edit them instantly with Alatify's browser tools. No sign-up.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Stock Image Finder — Alatify",
      "url": "https://getalatify.com/tools/stock-finder",
      "description": "Search millions of free stock photos, illustrations, and vectors from Unsplash, Pexels, and Pixabay in one place — then edit them instantly with Alatify's browser tools. No sign-up.",
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
        { "@type": "ListItem", "position": 3, "name": "Stock Image Finder", "item": "https://getalatify.com/tools/stock-finder" }
      ]
    }
  ]
};

export default function StockFinderPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <StockFinderClient />
    </>
  );
}

