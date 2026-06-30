import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/json-ld";

const BlurClient = dynamic(() => import("./blur-client"));

export const metadata: Metadata = {
  title: "Blur & Redact Image Online — Hide Faces, License Plates & Sensitive Info, No Upload | Alatify",
  description: "Obscure sensitive info, blur faces, and redact license plates in your images locally. Completely private, client-side editor with no file uploads.",
  openGraph: {
    title: "Blur & Redact Image Online — Hide Faces, License Plates & Sensitive Info, No Upload | Alatify",
    description: "Obscure sensitive details in your images entirely in the browser using box or brush selection. No file uploads required, 100% private.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Blur & Redact — Alatify",
      "url": "https://getalatify.com/tools/blur",
      "description": "Obscure sensitive info, blur faces, and redact license plates in your images locally. Completely private, client-side editor with no file uploads.",
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
        { "@type": "ListItem", "position": 3, "name": "Blur & Redact", "item": "https://getalatify.com/tools/blur" }
      ]
    }
  ]
};

export default function BlurPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <BlurClient />
    </>
  );
}

