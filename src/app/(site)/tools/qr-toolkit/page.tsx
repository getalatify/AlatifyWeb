import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/json-ld";

const QrToolkitClient = dynamic(() => import("./qr-toolkit-client"));

export const metadata: Metadata = {
  title: "QR Toolkit — Free Offline QR Generator & Safe Scanner | Alatify",
  description: "Generate clean, tracker-free QR codes and scan unknown ones safely. Private client-side creation and safety auditing without any server tracking or uploads.",
  openGraph: {
    title: "QR Toolkit — Free Offline QR Generator & Safe Scanner | Alatify",
    description: "Generate clean, tracker-free QR codes and scan unknown ones safely. Private client-side creation and safety auditing without any server tracking or uploads.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "QR Toolkit — Alatify",
      "url": "https://getalatify.com/tools/qr-toolkit",
      "description": "Generate clean, tracker-free QR codes and scan unknown ones safely. Private client-side creation and safety auditing without any server tracking or uploads.",
      "applicationCategory": "UtilitiesApplication",
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
        { "@type": "ListItem", "position": 3, "name": "QR Toolkit", "item": "https://getalatify.com/tools/qr-toolkit" }
      ]
    }
  ]
};

export default function QrToolkitPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <QrToolkitClient />
    </>
  );
}
