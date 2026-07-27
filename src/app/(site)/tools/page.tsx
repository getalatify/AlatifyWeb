import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ToolsClient = dynamic(() => import("./tools-client"));

export const metadata: Metadata = {
  title: 'All Image Tools',
  description: 'Browse Alatify\'s browser-based tools for images, PDFs, and documents. Compress, convert, remove backgrounds, and redact. Your files are never uploaded to a server.',
  openGraph: {
    title: 'All Image Tools | Alatify',
    description: 'Every Alatify tool for images, PDFs, and privacy, in one place. Your files are processed in your browser and never uploaded.',
  },
  alternates: {
    canonical: 'https://getalatify.com/tools',
  },
};

export default function ToolsHubPage() {
  return <ToolsClient />;
}
