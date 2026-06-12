import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CompressorClient = dynamic(() => import("./compressor-client"), { ssr: false });

export const metadata: Metadata = {
  title: "Free Image Compressor — Reduce File Size, No Upload | Alatify",
  description: "Compress JPG, PNG, and WebP images to a smaller size in your browser — lossy or lossless, batch processing, no upload, no sign-up. Shrink files while keeping quality.",
  openGraph: {
    title: "Free Image Compressor — Reduce File Size, No Upload | Alatify",
    description: "Compress JPG, PNG, and WebP images to a smaller size in your browser — lossy or lossless, batch processing, no upload, no sign-up. Shrink files while keeping quality.",
  },
};

export default function CompressorPage() {
  return <CompressorClient />;
}
