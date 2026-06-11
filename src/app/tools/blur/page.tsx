import type { Metadata } from "next";
import dynamic from "next/dynamic";

const BlurClient = dynamic(() => import("./blur-client"), { ssr: false });

export const metadata: Metadata = {
  title: "Blur & Redact Image Online — Hide Faces, License Plates & Sensitive Info, No Upload | Alatify",
  description: "Obscure sensitive info, blur faces, and redact license plates in your images locally. Completely private, client-side editor with no file uploads.",
  openGraph: {
    title: "Blur & Redact Image Online — Hide Faces, License Plates & Sensitive Info, No Upload | Alatify",
    description: "Obscure sensitive details in your images entirely in the browser using box or brush selection. No file uploads required, 100% private.",
  },
};

export default function BlurPage() {
  return <BlurClient />;
}
