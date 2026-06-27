import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import PdfToMarkdownClient from "./pdf-to-markdown-client";

export const metadata: Metadata = {
  title: "Free PDF to Markdown Converter — 100% Private, Client-Side | Alatify",
  description: "Extract text from PDF documents and convert them to clean Markdown files. Completely private, secure, and runs 100% in your browser without uploads.",
  openGraph: {
    title: "Free PDF to Markdown Converter — 100% Private, Client-Side | Alatify",
    description: "Extract text from PDF documents and convert them to clean Markdown files. Completely private, secure, and runs 100% in your browser without uploads.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "PDF to Markdown Converter — Alatify",
      "url": "https://getalatify.com/tools/pdf-to-markdown",
      "description": "Extract text from PDF documents and convert them to clean Markdown files. Completely private, secure, and runs 100% in your browser without uploads.",
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
        { "@type": "ListItem", "position": 3, "name": "PDF to Markdown", "item": "https://getalatify.com/tools/pdf-to-markdown" }
      ]
    }
  ]
};

export default function PdfToMarkdownPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <PdfToMarkdownClient />
    </>
  );
}
