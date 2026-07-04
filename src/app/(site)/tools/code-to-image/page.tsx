import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/json-ld";

const CodeToImageClient = dynamic(() => import("./code-to-image-client"));

export const metadata: Metadata = {
  title: "Free Code to Image — Syntax-Highlighted Snippets for Social | Alatify",
  description:
    "Turn code snippets into polished, share-ready PNG images with developer-focused themes and crisp Geist Mono typography. Runs entirely in your browser.",
  openGraph: {
    title: "Free Code to Image — Syntax-Highlighted Snippets for Social | Alatify",
    description:
      "Turn code snippets into polished, share-ready PNG images with developer-focused themes and crisp Geist Mono typography. Runs entirely in your browser.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Code to Image — Alatify",
      url: "https://getalatify.com/tools/code-to-image",
      description:
        "Turn code snippets into polished, share-ready PNG images with developer-focused themes and crisp Geist Mono typography.",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web Browser",
      browserRequirements: "Requires a modern web browser",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      isAccessibleForFree: true,
      publisher: { "@type": "Organization", name: "Alatify", url: "https://getalatify.com" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://getalatify.com" },
        { "@type": "ListItem", position: 2, name: "Tools", item: "https://getalatify.com/tools" },
        { "@type": "ListItem", position: 3, name: "Code to Image", item: "https://getalatify.com/tools/code-to-image" },
      ],
    },
  ],
};

export default function CodeToImagePage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <CodeToImageClient />
    </>
  );
}