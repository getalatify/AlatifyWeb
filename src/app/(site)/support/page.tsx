import type { Metadata } from "next";
import dynamic from "next/dynamic";

const SupportClient = dynamic(() => import("./support-client"), { ssr: false });

export const metadata: Metadata = {
  title: "Support Us",
  description: "Support Alatify financially. Keep the project free, natively private, and client-side without servers or trackers.",
};

export default function SupportPage() {
  return <SupportClient />;
}
