import React from "react";
import { Shield } from "lucide-react";

interface PrivacyNoticeProps {
  children: React.ReactNode;
}

export function PrivacyNotice({ children }: PrivacyNoticeProps) {
  return (
    <section className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-xs text-muted-foreground leading-relaxed max-w-5xl mx-auto w-full space-y-2 mt-2">
      <p className="font-extrabold text-foreground text-sm flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        Natively Private & Client-Side Secure
      </p>
      {children}
    </section>
  );
}
