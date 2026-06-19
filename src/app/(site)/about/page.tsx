import React from "react";
import type { Metadata } from "next";
import AboutClient from "./about-client";

export const metadata: Metadata = {
  title: "About Alatify",
  description: "Discover why we build browser-based, privacy-first image tools. Read about our mission, our local-first architecture, and why your files never leave your device.",
  openGraph: {
    title: "About Alatify | Privacy-First Image Tools",
    description: "Learn about the mission behind Alatify. Browser-based image compression, cropping, resizing, and AI editing.",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
