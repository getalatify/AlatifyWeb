import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/json-ld";

const UpscalerClient = dynamic(() => import("./upscaler-client"));

export const metadata: Metadata = {
  title: "Free AI Image Upscaler — Enlarge Photos 2x & 4x | Alatify",
  description: "Upscale and sharpen images 2x or 4x with a Real-ESRGAN AI model that runs 100% in your browser. No uploads, no account — completely free and private.",
  openGraph: {
    title: "Free AI Image Upscaler — Enlarge Photos 2x & 4x | Alatify",
    description: "Upscale and sharpen images 2x or 4x with a Real-ESRGAN AI model that runs 100% in your browser. No uploads, no account — completely free and private.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "AI Image Upscaler — Alatify",
      "url": "https://getalatify.com/tools/upscaler",
      "description": "Upscale and sharpen images 2x or 4x with a Real-ESRGAN AI model that runs 100% in your browser. No uploads, no account — completely free and private.",
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
        { "@type": "ListItem", "position": 3, "name": "AI Image Upscaler", "item": "https://getalatify.com/tools/upscaler" }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Are my images uploaded to a server?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. All processing happens locally in your browser — your images never leave your device."
          }
        },
        {
          "@type": "Question",
          "name": "How does the AI upscaler work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It uses a Real-ESRGAN neural network that reconstructs detail and sharpens edges, running on your device's GPU via WebGPU (with a CPU fallback)."
          }
        },
        {
          "@type": "Question",
          "name": "What's the difference between 2x and 4x?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "2x is faster and good for moderate enlargement; 4x produces a larger, sharper result but takes longer."
          }
        },
        {
          "@type": "Question",
          "name": "Is it free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes — completely free, no account or sign-up."
          }
        },
        {
          "@type": "Question",
          "name": "Which formats are supported?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "JPG, PNG, and WebP; output is a lossless PNG."
          }
        },
        {
          "@type": "Question",
          "name": "Why does the first run take a moment?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The first use downloads a ~33MB AI model once. It's cached afterward, so later runs are instant and even work offline."
          }
        },
        {
          "@type": "Question",
          "name": "Is there a size limit?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Very large images are scaled down before upscaling to stay reliable on phones and mid-range devices."
          }
        },
        {
          "@type": "Question",
          "name": "Does it work offline?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes — once the model is cached, your browser can upscale with no internet connection."
          }
        }
      ]
    }
  ]
};

export default function UpscalerPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <UpscalerClient />
    </>
  );
}
