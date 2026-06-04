import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ResizerClient = dynamic(() => import("./resizer-client"), { ssr: false });

export const metadata: Metadata = {
  title: 'Free Image Resizer',
  description: 'Resize images to any custom dimension, scale by percentage, or use social media presets in your browser. Pixel-perfect, private, and fast.',
  openGraph: {
    title: 'Free Image Resizer | Alatify',
    description: 'Resize images online using your local device. Standard presets for Instagram, YouTube, TikTok, and custom crops.',
  },
};

export default function ResizerPage() {
  return <ResizerClient />;
}
