import type { Metadata } from "next";
import EmbedClient from "./embed-client";

export const metadata: Metadata = {
  title: "Embed Background Remover: Free Widget Code | Alatify",
  description: "Add a free, privacy-first, 100% client-side background remover widget to your own website with a simple iframe snippet.",
  openGraph: {
    title: "Embed Background Remover: Free Widget Code | Alatify",
    description: "Add a free, privacy-first, 100% client-side background remover widget to your own website with a simple iframe snippet.",
  },
};

export default function EmbedPage() {
  return <EmbedClient />;
}
