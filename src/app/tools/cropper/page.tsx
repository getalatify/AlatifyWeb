import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CropperClient = dynamic(() => import("./cropper-client"), { ssr: false });

export const metadata: Metadata = {
  title: "Free Image Cropper — Crop & Straighten Online, No Upload | Alatify",
  description: "Crop images to any ratio, adjust freely with draggable handles, and straighten with rotation — in your browser. No upload, no sign-up. Your photo stays on your device.",
  openGraph: {
    title: "Free Image Cropper — Crop & Straighten Online, No Upload | Alatify",
    description: "Crop images to any ratio, adjust freely with draggable handles, and straighten with rotation — in your browser. No upload, no sign-up. Your photo stays on your device.",
  },
};

export default function CropperPage() {
  return <CropperClient />;
}
