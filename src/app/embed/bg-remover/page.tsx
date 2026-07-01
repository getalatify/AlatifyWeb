import type { Metadata } from "next";
import dynamic from "next/dynamic";

const BgRemoverClient = dynamic(() => import("@/app/(site)/tools/bg-remover/bg-remover-client"));

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  manifest: null,
};

export default function EmbedBgRemoverPage() {
  return <BgRemoverClient isEmbed={true} />;
}
