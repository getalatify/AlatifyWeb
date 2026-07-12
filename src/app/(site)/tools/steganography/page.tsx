import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/json-ld";

const SteganographyClient = dynamic(() => import("./steganography-client"));

export const metadata: Metadata = {
  title: "Image Steganography: Hide Encrypted Text in Images Offline | Alatify",
  description: "Hide text messages inside images using LSB steganography with optional AES-GCM password encryption. 100% private, client-side, zero uploads.",
  openGraph: {
    title: "Image Steganography: Hide Encrypted Text in Images Offline | Alatify",
    description: "Hide text messages inside images using LSB steganography with optional AES-GCM password encryption. 100% private, client-side, zero uploads.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Image Steganography: Alatify",
      "url": "https://getalatify.com/tools/steganography",
      "description": "Hide text messages inside images using LSB steganography with optional AES-GCM password encryption. 100% private, client-side, zero uploads.",
      "applicationCategory": "SecurityApplication",
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
        { "@type": "ListItem", "position": 3, "name": "Steganography", "item": "https://getalatify.com/tools/steganography" }
      ]
    }
  ]
};

export default function SteganographyPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <SteganographyClient />
    </>
  );
}
