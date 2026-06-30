import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ToolsClient = dynamic(() => import("../tools-client"));

export const metadata: Metadata = {
  title: "Privacy-First PDF & Document Tools | Alatify",
  description: "Convert Markdown to PDF, PDF to Markdown, and edit PDF pages locally. Secure document processing completely in your browser, keeping your data private.",
  alternates: {
    canonical: "https://getalatify.com/tools/document",
  },
  openGraph: {
    title: "Privacy-First PDF & Document Tools | Alatify",
    description: "Convert Markdown to PDF, PDF to Markdown, and edit PDF pages locally. Secure document processing completely in your browser, keeping your data private.",
  },
};

export default function DocumentToolsPage() {
  return <ToolsClient categoryFilter="document" />;
}
