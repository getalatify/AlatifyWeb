import type { Metadata } from "next";
import dynamic from "next/dynamic";

const BgRemoverClient = dynamic(() => import("./bg-remover-client"), { ssr: false });

export const metadata: Metadata = {
  title: "Free Background Remover — Unlimited, Full-Res, No Upload | Alatify",
  description: "Remove image backgrounds in your browser — unlimited, full resolution, no sign-up, no watermark. Your photo never leaves your device. AI-powered and 100% private.",
  openGraph: {
    title: "Free Background Remover — Unlimited, Full-Res, No Upload | Alatify",
    description: "Remove image backgrounds in your browser — unlimited, full resolution, no sign-up, no watermark. Your photo never leaves your device. AI-powered and 100% private.",
  },
};

export default function BackgroundRemoverPage() {
  return <BgRemoverClient />;
}
