import type { Metadata } from "next";
import dynamic from "next/dynamic";

const StockFinderClient = dynamic(() => import("./stock-finder-client"), { ssr: false });

export const metadata: Metadata = {
  title: "Free Stock Photos, Illustrations & Vectors — Search & Edit | Alatify",
  description: "Search millions of free stock photos, illustrations, and vectors from Unsplash, Pexels, and Pixabay in one place — then edit them instantly with Alatify's browser tools. No sign-up.",
  openGraph: {
    title: "Free Stock Photos, Illustrations & Vectors — Search & Edit | Alatify",
    description: "Search millions of free stock photos, illustrations, and vectors from Unsplash, Pexels, and Pixabay in one place — then edit them instantly with Alatify's browser tools. No sign-up.",
  },
};

export default function StockFinderPage() {
  return <StockFinderClient />;
}
