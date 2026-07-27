import React from "react";
import type { Metadata } from "next";
import PrivacyClient from "./privacy-client";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Alatify privacy policy. Your files are processed in your browser and never uploaded to a server. Read what we collect and what we do not.",
  openGraph: {
    title: "Privacy Policy | Alatify",
    description: "Your files never leave your device. Read about our local-first privacy architecture.",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyClient />;
}
