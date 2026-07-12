import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/json-ld";

const PdfPagesClient = dynamic(() => import("./pdf-pages-client"), { ssr: false });

export const metadata: Metadata = {
  title: "Free PDF Page Tools: Merge, Split, Reorder & Rotate Pages | Alatify",
  description:
    "Load one or more PDFs, reorder, rotate, delete, and extract pages, then export a new PDF entirely in your browser. No upload, no sign-up. Files never leave your device.",
  openGraph: {
    title: "Free PDF Page Tools: Merge, Split, Reorder & Rotate Pages | Alatify",
    description:
      "Load one or more PDFs, reorder, rotate, delete, and extract pages, then export a new PDF entirely in your browser. No upload, no sign-up. Files never leave your device.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "PDF Page Tools: Alatify",
      url: "https://getalatify.com/tools/pdf-pages",
      description:
        "Load one or more PDFs, reorder, rotate, delete, and extract pages, then export a new PDF entirely in your browser. No upload, no sign-up. Files never leave your device.",
      applicationCategory: "DocumentApplication",
      operatingSystem: "Web Browser",
      browserRequirements: "Requires a modern web browser",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      isAccessibleForFree: true,
      publisher: {
        "@type": "Organization",
        name: "Alatify",
        url: "https://getalatify.com",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://getalatify.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tools",
          item: "https://getalatify.com/tools",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "PDF Page Tools",
          item: "https://getalatify.com/tools/pdf-pages",
        },
      ],
    },
  ],
};

export default function PdfPagesPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <PdfPagesClient />
    </>
  );
}