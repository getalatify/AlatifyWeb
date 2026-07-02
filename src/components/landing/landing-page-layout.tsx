import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Check, XCircle, X } from "lucide-react";

interface LandingPageLayoutProps {
  eyebrow: string;
  h1: string;
  heroSubtext: string;
  sections: { heading: string; body: string[] }[];
  comparison: { alatify: string[]; others: string[] };
  faqs: { q: string; a: string }[];
  ctaLabel: string;
  ctaHref: string;
}

export function LandingPageLayout({
  eyebrow,
  h1,
  heroSubtext,
  sections,
  comparison,
  faqs,
  ctaLabel,
  ctaHref,
}: LandingPageLayoutProps) {
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 sm:py-16 z-10 space-y-16 select-text">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8 max-w-3xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-border shadow-sm uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-primary" />
          {eyebrow}
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15] font-sans">
          {h1}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
          {heroSubtext}
        </p>
        <div className="pt-4 w-full sm:w-auto">
          <Link href={ctaHref} className="w-full sm:w-auto block">
            <Button className="cta-glass w-full px-8 py-6 text-base font-semibold rounded-xl hover:-translate-y-0.5 active:scale-[0.98] group gap-2 transition-transform duration-200">
              {ctaLabel}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Sections Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 pt-8 border-t border-border/40">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {section.heading}
            </h2>
            {section.body.map((p, pIdx) => (
              <p key={pIdx} className="text-sm text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        ))}
      </section>

      {/* Comparison Section */}
      <section className="space-y-6 pt-12 border-t border-border/40">
        <h2 className="text-2xl font-bold tracking-tight text-center text-foreground font-sans">
          How it compares
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Alatify local card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-md space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-foreground text-background px-3 py-1 text-[10px] font-bold rounded-bl-xl uppercase tracking-wider">
              Local
            </div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-foreground" />
              Alatify
            </h3>
            <ul className="space-y-3">
              {comparison.alatify.map((item, idx) => (
                <li key={idx} className="text-sm text-foreground flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Upload-based tools card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-secondary/20 border border-border/50 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-muted-foreground flex items-center gap-2">
              <XCircle className="w-5 h-5 text-muted-foreground" />
              Upload-based tools
            </h3>
            <ul className="space-y-3">
              {comparison.others.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2.5">
                  <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-6 pt-12 border-t border-border/40">
        <h2 className="text-2xl font-bold tracking-tight text-center text-foreground font-sans">
          Frequently Asked Questions
        </h2>
        <div className="max-w-2xl mx-auto space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {faq.q}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="pt-12 border-t border-border/40 flex flex-col items-center text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground">
          Ready to try Alatify?
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Process your images safely and instantly. No uploads, no limits, no catches.
        </p>
        <div className="pt-2 w-full sm:w-auto">
          <Link href={ctaHref} className="w-full sm:w-auto block">
            <Button className="cta-glass w-full px-8 py-6 text-base font-semibold rounded-xl hover:-translate-y-0.5 active:scale-[0.98] group gap-2 transition-transform duration-200">
              {ctaLabel}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
