import type { Metadata } from "next";
import dynamic from "next/dynamic";

const BgRemoverClient = dynamic(() => import("@/app/(site)/tools/bg-remover/bg-remover-client"), {
  ssr: false,
});

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmbedBgRemoverPage() {
  return <BgRemoverClient isEmbed={true} />;
}
