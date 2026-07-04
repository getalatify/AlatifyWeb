import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import HtmlToMarkdownClient from "./html-to-markdown-client";

export const metadata: Metadata = {
  title: "Free HTML to Markdown Converter — No Signup, 100% Private | Alatify",
  description: "Convert HTML source code or .html files into clean Markdown inside your browser. No server uploads, no limits, completely secure.",
  openGraph: {
    title: "Free HTML to Markdown Converter — No Signup, 100% Private | Alatify",
    description: "Convert HTML source code or .html files into clean Markdown inside your browser. No server uploads, no limits, completely secure.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "HTML to Markdown Converter — Alatify",
      "url": "https://getalatify.com/tools/html-to-markdown",
      "description": "Convert HTML source code or .html files into clean Markdown inside your browser. No server uploads, no limits, completely secure.",
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
        { "@type": "ListItem", "position": 3, "name": "HTML to Markdown", "item": "https://getalatify.com/tools/html-to-markdown" }
      ]
    }
  ]
};

export default function HtmlToMarkdownPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <HtmlToMarkdownClient />
    </>
  );
}