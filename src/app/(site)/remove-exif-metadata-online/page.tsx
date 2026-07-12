import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { Header } from "@/components/shared";
import { LandingPageLayout } from "@/components/landing/landing-page-layout";
import { LANDING_PAGES } from "@/lib/landing/registry";

const PAGE_SLUG = "remove-exif-metadata-online";
const pageConfig = LANDING_PAGES.find((p) => p.slug === PAGE_SLUG)!;

export const metadata: Metadata = {
  title: pageConfig.metaTitle,
  description: pageConfig.metaDescription,
  alternates: {
    canonical: `https://getalatify.com/${PAGE_SLUG}`,
  },
  openGraph: {
    title: pageConfig.metaTitle,
    description: pageConfig.metaDescription,
    url: `https://getalatify.com/${PAGE_SLUG}`,
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `https://getalatify.com/${PAGE_SLUG}`,
      "url": `https://getalatify.com/${PAGE_SLUG}`,
      "name": pageConfig.metaTitle,
      "description": pageConfig.metaDescription,
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://getalatify.com/#website",
        "url": "https://getalatify.com/",
        "name": "Alatify"
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://getalatify.com" },
        { "@type": "ListItem", "position": 2, "name": "Remove EXIF Metadata From Your Photos: Without Uploading", "item": `https://getalatify.com/${PAGE_SLUG}` }
      ]
    }
  ]
};

const SECTIONS = [
  {
    heading: "What's actually hidden in your photos",
    body: [
      "EXIF is metadata your camera or phone writes into every image file. It commonly includes GPS latitude and longitude, the device make and model, the lens, the exact timestamp, and sometimes even a serial number.",
      "Most people never see it, but any recipient can read it with free tools. The GPS field is the real risk: a single photo taken at home can pinpoint where you live."
    ]
  },
  {
    heading: "Why 'no upload' matters here specifically",
    body: [
      "Most online EXIF removers send your photo to a server, strip the data there, and send it back. That means your original photo, with the GPS coordinates still intact, has already left your device and sat on someone else's machine.",
      "Alatify never does that. The metadata is read and stripped entirely in your browser. The file that carries your location never travels anywhere. This isn't a promise you have to take on faith, you can verify it (see below)."
    ]
  },
  {
    heading: "Verify it yourself in 10 seconds",
    body: [
      "Open your browser's DevTools (F12), go to the Network tab, then clean a photo. You'll see zero upload requests carrying your image. The file is processed locally and the cleaned copy is generated on your device.",
      "That's the whole point of client-side processing: the tool can't leak what it never receives."
    ]
  },
  {
    heading: "How to remove EXIF data",
    body: [
      "Open the EXIF Cleaner, drop in your photo, review the metadata it detects (including any GPS warning), and download the cleaned copy. The exported image keeps full quality. Only the metadata is removed."
    ]
  }
];

const COMPARISON = {
  alatify: [
    "Photo never leaves your device",
    "GPS and all metadata stripped locally",
    "Verifiable in the Network tab",
    "Free, unlimited, no sign-up"
  ],
  others: [
    "Photo uploaded to a server to be processed",
    "Your location data reaches a third party first",
    "You can't verify what happens to it",
    "Often limited or account-gated"
  ]
};

const FAQS = [
  {
    q: "Does Alatify upload my photo to remove EXIF data?",
    a: "No. Reading and stripping metadata happens entirely in your browser. Your photo is never sent to a server, which you can confirm in the Network tab of your browser's DevTools."
  },
  {
    q: "Will removing EXIF reduce my image quality?",
    a: "No. Only the metadata segment is removed. The image pixels are untouched, so quality and resolution stay exactly the same."
  },
  {
    q: "What metadata gets removed?",
    a: "GPS location, camera make and model, lens, timestamps, and other EXIF fields written by your device. The cleaner shows you what it detects before you download."
  }
];

export default function RemoveExifPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <main className="relative flex min-h-screen flex-col items-center p-6 text-foreground select-none overflow-x-clip">
        <Header showToolsLink showSupportLink />
        <LandingPageLayout
          eyebrow="Privacy-first · runs in your browser"
          h1="Remove EXIF Metadata From Your Photos: Without Uploading"
          heroSubtext="Every photo you take carries hidden data: the exact GPS coordinates where it was shot, your camera model, and the date and time. Post it online and you may be revealing your home address without realizing it. Alatify strips all of it, on your own device, with nothing uploaded."
          ctaLabel="Open the EXIF Cleaner →"
          ctaHref={pageConfig.targetToolPath}
          sections={SECTIONS}
          comparison={COMPARISON}
          faqs={FAQS}
        />
      </main>
    </>
  );
}
