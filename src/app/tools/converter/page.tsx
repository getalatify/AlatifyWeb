import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ConverterClient = dynamic(() => import("./converter-client"), { ssr: false });

export const metadata: Metadata = {
  title: 'Free Image Format Converter',
  description: 'Convert JPG to PNG, PNG to WebP, HEIC to JPG, or export vector SVG and PDF files natively in your browser. All processing happens locally.',
  openGraph: {
    title: 'Free Image Format Converter | Alatify',
    description: 'Convert image formats online locally on your device. Free, private, no file uploads.',
  },
};

export default function ConverterPage() {
  return <ConverterClient />;
}
