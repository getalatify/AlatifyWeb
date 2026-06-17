import React from "react";
import type { Metadata } from "next";
import TermsClient from "./terms-client";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Alatify terms of service. Permissive license for personal and commercial local image processing. No hidden tracking, no upload walls.",
  openGraph: {
    title: "Terms of Service | Alatify",
    description: "Read about your rights, licensing rules, and disclaimers when using our client-side tools.",
  },
};

export default function TermsOfServicePage() {
  return <TermsClient />;
}
