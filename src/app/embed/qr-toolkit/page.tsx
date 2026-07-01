import type { Metadata } from "next";
import dynamic from "next/dynamic";

const QrToolkitClient = dynamic(() => import("@/app/(site)/tools/qr-toolkit/qr-toolkit-client"));

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmbedQrToolkitPage() {
  return <QrToolkitClient isEmbed={true} />;
}
