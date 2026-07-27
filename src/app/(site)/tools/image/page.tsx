import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ToolsClient = dynamic(() => import("../tools-client"));

export const metadata: Metadata = {
  title: "Free Image Editing & Optimization Tools | Alatify",
  description: "Browse Alatify's image tools. Crop, resize, compress, convert, remove backgrounds, and clean metadata. Your photos are never uploaded to a server.",
  alternates: {
    canonical: "https://getalatify.com/tools/image",
  },
  openGraph: {
    title: "Free Image Editing & Optimization Tools | Alatify",
    description: "Browse Alatify's image tools. Crop, resize, compress, convert, remove backgrounds, and clean metadata. Your photos are never uploaded to a server.",
  },
};

export default function ImageToolsPage() {
  return <ToolsClient categoryFilter="image" />;
}
