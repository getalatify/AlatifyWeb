import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/json-ld";

const IdProtectorClient = dynamic(() => import("./id-protector-client"), { ssr: false });

export const metadata: Metadata = {
  title: "ID Privacy Shield — Redact & Watermark Locally | Alatify",
  description: "Redact and watermark sensitive documents entirely on your device. Zero server uploads, 100% private.",
  openGraph: {
    title: "ID Privacy Shield — Redact & Watermark Locally | Alatify",
    description: "Redact and watermark sensitive documents entirely on your device. Zero server uploads, 100% private.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "ID Privacy Shield — Alatify",
      "url": "https://getalatify.com/tools/id-protector",
      "description": "Redact and watermark sensitive documents entirely on your device. Zero server uploads, 100% private.",
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
        { "@type": "ListItem", "position": 3, "name": "ID Privacy Shield", "item": "https://getalatify.com/tools/id-protector" }
      ]
    }
  ]
};

export default function IdProtectorPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <IdProtectorClient />
    </>
  );
}
