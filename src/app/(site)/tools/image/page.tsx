import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ToolsClient = dynamic(() => import("../tools-client"), { ssr: false });

export const metadata: Metadata = {
  title: "Free Image Editing & Optimization Tools | Alatify",
  description: "Browse our privacy-first image tools. Crop, resize, compress, convert, remove backgrounds, and edit photos entirely in your browser without any server uploads.",
  alternates: {
    canonical: "https://getalatify.com/tools/image",
  },
  openGraph: {
    title: "Free Image Editing & Optimization Tools | Alatify",
    description: "Browse our privacy-first image tools. Crop, resize, compress, convert, remove backgrounds, and edit photos entirely in your browser without any server uploads.",
  },
};

export default function ImageToolsPage() {
  return <ToolsClient categoryFilter="image" />;
}
