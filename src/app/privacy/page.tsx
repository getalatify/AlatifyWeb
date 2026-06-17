import React from "react";
import type { Metadata } from "next";
import PrivacyClient from "./privacy-client";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Alatify privacy policy. We run entirely in your web browser. Zero server uploads, zero data collection, and absolute confidentiality.",
  openGraph: {
    title: "Privacy Policy | Alatify",
    description: "Your files never leave your device. Read about our local-first privacy architecture.",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyClient />;
}
