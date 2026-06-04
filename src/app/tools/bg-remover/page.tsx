import type { Metadata } from "next";
import dynamic from "next/dynamic";

const BgRemoverClient = dynamic(() => import("./bg-remover-client"), { ssr: false });

export const metadata: Metadata = {
  title: 'AI Background Remover',
  description: 'Remove backgrounds from images instantly using local on-device AI. 100% free, private, and automatic subject isolation without server uploads.',
  openGraph: {
    title: 'AI Background Remover | Alatify',
    description: 'Extract subjects and remove image backgrounds natively in your browser. All AI processing runs completely offline.',
  },
};

export default function BackgroundRemoverPage() {
  return <BgRemoverClient />;
}
