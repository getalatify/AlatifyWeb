import type { Metadata } from "next";
import dynamic from "next/dynamic";

const StockFinderClient = dynamic(() => import("./stock-finder-client"), { ssr: false });

export const metadata: Metadata = {
  title: 'Stock Image Finder',
  description: 'Search free stock photos from Unsplash, Pexels, and Pixabay — and edit them instantly offline using our browser-based tools.',
  openGraph: {
    title: 'Stock Image Finder | Alatify',
    description: 'Find and edit high-quality stock photos instantly and privately in your browser. Seamless integration with background remover, cropper, compressor, and more.',
  },
};

export default function StockFinderPage() {
  return <StockFinderClient />;
}
