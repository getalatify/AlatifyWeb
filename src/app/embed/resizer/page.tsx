import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ResizerClient = dynamic(() => import("@/app/(site)/tools/resizer/resizer-client"));

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  manifest: null,
};

export default function EmbedResizerPage() {
  return <ResizerClient isEmbed={true} />;
}
