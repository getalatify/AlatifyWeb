import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CropperClient = dynamic(() => import("./cropper-client"), { ssr: false });

export const metadata: Metadata = {
  title: 'Free Image Cropper',
  description: 'Crop images with custom sizes or predefined aspect ratios. Fluid client-side resizing, rotate, and zoom entirely in your browser.',
  openGraph: {
    title: 'Free Image Cropper | Alatify',
    description: 'Crop and rotate images locally. Select custom aspect ratios, lock dimensions, and export instantly without server uploads.',
  },
};

export default function CropperPage() {
  return <CropperClient />;
}
