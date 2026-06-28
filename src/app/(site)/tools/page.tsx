import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ToolsClient = dynamic(() => import("./tools-client"), { ssr: false });

export const metadata: Metadata = {
  title: 'All Image Tools',
  description: 'Explore our collection of browser-based, privacy-first image tools. Compress, resize, convert formats, and remove backgrounds entirely offline without uploading to any server.',
  openGraph: {
    title: 'All Image Tools | Alatify',
    description: 'Explore Alatify\'s complete collection of client-side browser tools. High-fidelity image manipulation, completely private.',
  },
  alternates: {
    canonical: 'https://getalatify.com/tools',
  },
};

export default function ToolsHubPage() {
  return <ToolsClient />;
}
