import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ExifCleanerClient = dynamic(() => import("./exif-cleaner-client"), { ssr: false });

export const metadata: Metadata = {
  title: "Remove EXIF & GPS Metadata from Photos — Free, No Upload | Alatify",
  description: "Strip GPS location, camera details, and hidden metadata from your photos before sharing — 100% private, runs in your browser, no upload, fully lossless.",
  openGraph: {
    title: "Remove EXIF & GPS Metadata from Photos — Free, No Upload | Alatify",
    description: "Strip GPS location, camera details, and hidden metadata from your photos before sharing — 100% private, runs in your browser, no upload, fully lossless.",
  },
};

export default function ExifCleanerPage() {
  return <ExifCleanerClient />;
}
