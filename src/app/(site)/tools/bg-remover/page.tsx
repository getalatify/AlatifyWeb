import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/json-ld";

const BgRemoverClient = dynamic(() => import("./bg-remover-client"));

export const metadata: Metadata = {
  title: "Free Background Remover: Unlimited, Full-Res, No Upload | Alatify",
  description: "Remove image backgrounds in your browser: unlimited, full resolution, no sign-up, no watermark. Your photo never leaves your device. AI-powered and 100% private.",
  openGraph: {
    title: "Free Background Remover: Unlimited, Full-Res, No Upload | Alatify",
    description: "Remove image backgrounds in your browser: unlimited, full resolution, no sign-up, no watermark. Your photo never leaves your device. AI-powered and 100% private.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Background Remover: Alatify",
      "url": "https://getalatify.com/tools/bg-remover",
      "description": "Remove image backgrounds in your browser: unlimited, full resolution, no sign-up, no watermark. Your photo never leaves your device. AI-powered and 100% private.",
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
        { "@type": "ListItem", "position": 3, "name": "Background Remover", "item": "https://getalatify.com/tools/bg-remover" }
      ]
    }
  ]
};

export default function BackgroundRemoverPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <BgRemoverClient />
    </>
  );
}

