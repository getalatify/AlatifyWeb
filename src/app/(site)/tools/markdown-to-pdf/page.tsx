import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import MarkdownToPdfClient from "./markdown-to-pdf-client";

export const metadata: Metadata = {
  title: "Free Markdown to PDF Converter — No Signup, 100% Private | Alatify",
  description: "Convert Markdown (.md, .markdown) files or raw text into clean, printable PDFs inside your browser. No server uploads, no limits, completely secure.",
  openGraph: {
    title: "Free Markdown to PDF Converter — No Signup, 100% Private | Alatify",
    description: "Convert Markdown (.md, .markdown) files or raw text into clean, printable PDFs inside your browser. No server uploads, no limits, completely secure.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Markdown to PDF Converter — Alatify",
      "url": "https://getalatify.com/tools/markdown-to-pdf",
      "description": "Convert Markdown (.md, .markdown) files or raw text into clean, printable PDFs inside your browser. No server uploads, no limits, completely secure.",
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
        { "@type": "ListItem", "position": 3, "name": "Markdown to PDF", "item": "https://getalatify.com/tools/markdown-to-pdf" }
      ]
    }
  ]
};

export default function MarkdownToPdfPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <MarkdownToPdfClient />
    </>
  );
}
