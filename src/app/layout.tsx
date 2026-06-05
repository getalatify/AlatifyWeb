import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider, Footer } from "@/components/shared";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
