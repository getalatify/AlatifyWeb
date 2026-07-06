import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { Header } from "@/components/shared";
import { LandingPageLayout } from "@/components/landing/landing-page-layout";
import { LANDING_PAGES } from "@/lib/landing/registry";

const PAGE_SLUG = "blur-face-in-photo-without-uploading";
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
        { "@type": "ListItem", "position": 2, "name": "Blur Faces & Sensitive Info in Photos: Without Uploading", "item": `https://getalatify.com/${PAGE_SLUG}` }
      ]
    }
  ]
};

const SECTIONS = [
  {
    heading: "The contradiction in most blur tools",
    body: [
      "You blur a photo precisely because it contains something sensitive, a face, an address, a document, a plate number. Yet most online blur tools require you to upload that exact sensitive photo to their servers first.",
      "That means the un-redacted original has already been transmitted before any blurring happens. The protection is applied after the exposure."
    ]
  },
  {
    heading: "How Alatify keeps it private",
    body: [
      "Alatify applies the blur in your browser and bakes it irreversibly into the exported image's pixels. The original, un-blurred photo is never uploaded anywhere. What you're protecting never leaves your device.",
      "Manual blur works fully offline. Optional automatic face detection downloads a small model once; even then, your photo is never sent to a server."
    ]
  },
  {
    heading: "Verify it yourself",
    body: [
      "Open DevTools (F12) → Network tab and blur a photo. You'll see no upload request carrying your image. The redaction happens locally and is written permanently into the downloaded file."
    ]
  },
  {
    heading: "How to blur a photo",
    body: [
      "Open Blur & Redact, add your image, drag blur or solid redaction blocks over anything sensitive, and download. The blur is permanent in the exported file. It can't be reversed by removing a layer."
    ]
  }
];

const COMPARISON = {
  alatify: [
    "Un-blurred original never uploaded",
    "Blur baked permanently into the pixels",
    "Manual blur works fully offline",
    "Free, unlimited, no sign-up"
  ],
  others: [
    "Sensitive photo uploaded before blurring",
    "Redaction sometimes reversible (CSS/layers)",
    "Requires a connection and a server round-trip",
    "Often limited or account-gated"
  ]
};

const FAQS = [
  {
    q: "Is the blur permanent and irreversible?",
    a: "Yes. Alatify writes the blur and solid redactions directly into the exported image's pixels, so they can't be undone by stripping a layer or editing metadata."
  },
  {
    q: "Do I have to upload my photo to blur it?",
    a: "No. Blurring happens entirely in your browser. The un-blurred original is never sent to a server, verifiable in the Network tab."
  },
  {
    q: "Can I use it offline?",
    a: "Manual blur works fully offline. Automatic face detection needs a one-time model download, but your photo still stays on your device."
  }
];

export default function BlurFacesPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <main className="relative flex min-h-screen flex-col items-center p-6 text-foreground select-none overflow-x-clip">
        <Header showToolsLink showSupportLink />
        <LandingPageLayout
          eyebrow="Privacy-first · runs in your browser"
          h1="Blur Faces & Sensitive Info in Photos: Without Uploading"
          heroSubtext="Blurring a face or a license plate to protect someone's privacy, then uploading that photo to a random website to do it, defeats the purpose. Alatify blurs everything on your own device, so the un-blurred original never leaves your computer."
          ctaLabel="Open Blur & Redact →"
          ctaHref={pageConfig.targetToolPath}
          sections={SECTIONS}
          comparison={COMPARISON}
          faqs={FAQS}
        />
      </main>
    </>
  );
}
