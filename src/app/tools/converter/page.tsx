import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ConverterClient = dynamic(() => import("./converter-client"), { ssr: false });

export const metadata: Metadata = {
  title: "Free Image Converter — Convert to PNG, JPG, WebP, ICO, SVG & PDF | Alatify",
  description: "Convert images between 9 formats — PNG, JPG, WebP, ICO, SVG, TIFF, BMP, GIF, PDF — right in your browser. Batch convert, no upload, no sign-up. Files stay on your device.",
  openGraph: {
    title: "Free Image Converter — Convert to PNG, JPG, WebP, ICO, SVG & PDF | Alatify",
    description: "Convert images between 9 formats — PNG, JPG, WebP, ICO, SVG, TIFF, BMP, GIF, PDF — right in your browser. Batch convert, no upload, no sign-up. Files stay on your device.",
  },
};

export default function ConverterPage() {
  return <ConverterClient />;
}
