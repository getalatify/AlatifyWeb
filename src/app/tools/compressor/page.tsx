import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CompressorClient = dynamic(() => import("./compressor-client"), { ssr: false });

export const metadata: Metadata = {
  title: 'Free Image Compressor',
  description: 'Compress JPG, PNG, and WebP images up to 90% without losing quality. All processing happens in your browser — your files never leave your device.',
  openGraph: {
    title: 'Free Image Compressor | Alatify',
    description: 'Compress images up to 90% in your browser. Private, unlimited, no signup.',
  },
};

export default function CompressorPage() {
  return <CompressorClient />;
}
