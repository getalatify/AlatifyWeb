import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/shared";
import { Toaster } from "sonner";
import { JsonLd } from "@/components/json-ld";

const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "Alatify",
      "url": "https://getalatify.com",
      "logo": "https://getalatify.com/apple-icon.png",
      "sameAs": ["https://x.com/getalatify"]
    },
    {
      "@type": "WebSite",
      "name": "Alatify",
      "url": "https://getalatify.com"
    }
  ]
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://getalatify.com'),
  title: {
    default: 'Alatify — Privacy-First Image Tools',
    template: '%s | Alatify',
  },
  description: 'Free online image tools that run entirely in your browser. Compress, resize, convert formats, remove backgrounds, and crop images without uploading to servers. Your files never leave your device.',
  keywords: [
    'image compressor',
    'image resizer',
    'image converter',
    'background remover',
    'image cropper',
    'privacy-first image tools',
    'free image editor',
    'browser-based image tools',
    'no upload image tools',
    'client-side image processing',
  ],
  authors: [{ name: 'Alatify' }],
  creator: 'Alatify',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://getalatify.com',
    siteName: 'Alatify',
    title: 'Alatify — Privacy-First Image Tools',
    description: 'Free online image tools that run entirely in your browser. No uploads, no tracking, unlimited use.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Alatify - Privacy-First Image Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alatify — Privacy-First Image Tools',
    description: 'Free online image tools that run entirely in your browser. No uploads, no tracking, unlimited use.',
    images: ['/opengraph-image'],
    creator: '@getalatify',
    site: '@getalatify',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
};

import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { WorkingImageProvider } from "@/lib/chaining/WorkingImageProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", GeistSans.variable, GeistMono.variable)}
    >
      <head>
        <JsonLd data={siteSchema} />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <WorkingImageProvider>
              {children}
            </WorkingImageProvider>
            <Toaster richColors position="top-right" />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
