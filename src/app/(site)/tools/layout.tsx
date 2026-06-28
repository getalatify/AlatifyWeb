import React from "react";
import { BackToTop } from "@/components/shared";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BackToTop />
    </>
  );
}
