import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { Header } from "@/components/shared";
import { LandingPageLayout } from "@/components/landing/landing-page-layout";
import { LANDING_PAGES } from "@/lib/landing/registry";

const PAGE_SLUG = "remove-background-without-uploading";
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
        { "@type": "ListItem", "position": 2, "name": "Remove Image Background Without Uploading Your Photo", "item": `https://getalatify.com/${PAGE_SLUG}` }
      ]
    }
  ]
};

const SECTIONS = [
  {
    heading: "Where your photo goes with most tools",
    body: [
      "Popular background removers send your image to a cloud server, run their model there, and return the result. Your original photo, whatever it contains, has been transmitted to and processed on someone else's infrastructure.",
      "For a product shot that might be fine. For a photo of a person, a document, or anything private, it's a real exposure you didn't sign up for."
    ]
  },
  {
    heading: "How Alatify is different",
    body: [
      "Alatify runs the background-removal model directly in your browser using your device's own hardware. The AI model file downloads once from a CDN the first time you use the tool, and after that it's cached. The important part: your photo itself is never uploaded, only the reusable model comes down, and only once.",
      "So the honest claim is precise: the tool fetches its model over the network once, then every image you process stays on your device."
    ]
  },
  {
    heading: "Verify it yourself",
    body: [
      "Open DevTools (F12) → Network tab, then remove a background. After the one-time model download, you'll see no request carrying your actual image to any server. The cutout is generated locally."
    ]
  },
  {
    heading: "How to remove a background",
    body: [
      "Open the Background Remover, drop in your image, and let it process on your device. Download the result as a transparent PNG at full resolution, no watermark, no sign-up, no limit."
    ]
  }
];

const COMPARISON = {
  alatify: [
    "Your photo is never uploaded",
    "AI runs on your own device",
    "Full resolution, no watermark",
    "Unlimited and free, no account"
  ],
  others: [
    "Photo uploaded to a cloud server",
    "Processing happens on their machines",
    "Free tier often downsized or watermarked",
    "Usually requires an account or credits"
  ]
};

const FAQS = [
  {
    q: "Is my photo really not uploaded?",
    a: "Correct. The AI model downloads once from a CDN, then all processing runs in your browser. Your image is never sent to a server, you can confirm this in the Network tab after the initial model load."
  },
  {
    q: "Why does it download something the first time?",
    a: "That's the AI model itself, not your photo. It's fetched once and cached so future removals are faster. Your images never travel over the network."
  },
  {
    q: "Is there a limit or watermark?",
    a: "No usage limit and no watermark. Because processing happens on your device, there's no server cost to meter, and results export at full resolution."
  }
];

export default function RemoveBackgroundPage() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <main className="relative flex min-h-screen flex-col items-center p-6 text-foreground select-none overflow-x-clip">
        <Header showToolsLink showSupportLink />
        <LandingPageLayout
          eyebrow="Privacy-first · AI runs on your device"
          h1="Remove Image Background Without Uploading Your Photo"
          heroSubtext="Most background removers upload your image to their servers to process it. Alatify doesn't. The AI runs on your own device, so your photo never leaves your computer, and you can prove it."
          ctaLabel="Open the Background Remover →"
          ctaHref={pageConfig.targetToolPath}
          sections={SECTIONS}
          comparison={COMPARISON}
          faqs={FAQS}
        />
      </main>
    </>
  );
}
