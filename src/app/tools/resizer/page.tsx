import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ResizerClient = dynamic(() => import("./resizer-client"), { ssr: false });

export const metadata: Metadata = {
  title: "Free Image Resizer — Resize by Pixels or Percentage, No Upload | Alatify",
  description: "Resize images by exact pixels, percentage, or aspect ratio in your browser — batch resize with high-quality resampling, no upload, no sign-up. Files stay on your device.",
  openGraph: {
    title: "Free Image Resizer — Resize by Pixels or Percentage, No Upload | Alatify",
    description: "Resize images by exact pixels, percentage, or aspect ratio in your browser — batch resize with high-quality resampling, no upload, no sign-up. Files stay on your device.",
  },
};

export default function ResizerPage() {
  return <ResizerClient />;
}
