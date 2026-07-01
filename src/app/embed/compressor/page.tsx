import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CompressorClient = dynamic(() => import("@/app/(site)/tools/compressor/compressor-client"));

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmbedCompressorPage() {
  return <CompressorClient isEmbed={true} />;
}
