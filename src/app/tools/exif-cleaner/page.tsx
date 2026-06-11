import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ExifCleanerClient = dynamic(() => import("./exif-cleaner-client"), { ssr: false });

export const metadata: Metadata = {
  title: 'EXIF Privacy Cleaner',
  description: 'Strip location, camera, and metadata from your images before sharing — entirely in your browser. 100% private and offline.',
  openGraph: {
    title: 'EXIF Privacy Cleaner | Alatify',
    description: 'Protect your privacy by cleaning EXIF metadata, GPS locations, camera tags, and editor history from images offline.',
  },
};

export default function ExifCleanerPage() {
  return <ExifCleanerClient />;
}
