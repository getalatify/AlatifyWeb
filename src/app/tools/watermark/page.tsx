import type { Metadata } from "next";
import dynamic from "next/dynamic";

const WatermarkClient = dynamic(() => import("./watermark-client"), { ssr: false });

export const metadata: Metadata = {
  title: "Watermark Tool | Alatify",
  description: "Apply text or logo watermarks to your images locally in your browser sandbox.",
};

export default function WatermarkPage() {
  return <WatermarkClient />;
}
