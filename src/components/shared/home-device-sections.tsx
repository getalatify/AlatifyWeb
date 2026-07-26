"use client";

import React from "react";
import Link from "next/link";
import { Plane } from "lucide-react";
import { useT } from "@/lib/i18n/useT";
import { useInView } from "@/hooks/use-in-view";

export function HomeDeviceSections() {
  const t = useT();
  const phone = useInView();
  const desktop = useInView();

  return (
    <>
      <noscript>
        <style>{`.device-anim,.device-progress-fill{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      {/* Section one: phone + Blur & Redact */}
      <section
        ref={phone.ref as React.RefObject<HTMLElement>}
        id="features-section"
        className={`mt-20 w-full max-w-5xl z-10 shrink-0 scroll-mt-6 grid grid-cols-1 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] gap-8 md:gap-12 items-center ${
          phone.inView ? "device-inview" : ""
        }`}
      >
        {/* DOM order: text first */}
        <div className="order-1 md:order-2 flex flex-col gap-3 text-left">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
            {t("home.device.blur.title")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
            {t("home.device.blur.text")}
          </p>
          <Link
            href="/tools/blur"
            className="inline-flex items-center text-sm font-semibold text-foreground underline-offset-4 hover:underline w-fit"
          >
            {t("home.device.blur.cta")}
          </Link>
        </div>

        {/* Device second; left at md */}
        <div className="order-2 md:order-1 flex justify-center md:justify-start">
          <div className="device-phone-bezel w-full max-w-[15rem] aspect-[9/19.5] rounded-[1.75rem] border border-border bg-card shadow-md overflow-hidden flex flex-col">
            {/* Status bar */}
            <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 shrink-0">
              <div className="flex items-center gap-1">
                <span className="block h-1.5 w-6 rounded-full bg-muted-foreground/50" />
                <span className="block h-1.5 w-3 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Plane className="w-3 h-3" aria-hidden="true" />
                <span className="text-[9px] font-medium leading-none">
                  {t("home.device.blur.airplane")}
                </span>
              </div>
            </div>

            {/* Screen */}
            <div className="flex-1 min-h-0 px-2.5 pb-3 flex flex-col gap-2">
              <div className="h-6 rounded-md bg-secondary border border-border shrink-0" />

              <div className="relative flex-1 min-h-0 rounded-lg bg-secondary/60 border border-border p-2.5 overflow-hidden">
                {/* Abstract document */}
                <div className="device-anim absolute inset-2.5 rounded-md bg-card border border-border p-2.5 flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <span className="block w-8 h-8 rounded-full bg-muted-foreground/25 shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5 pt-0.5">
                      <span className="block h-1.5 w-full rounded-full bg-muted-foreground/30" />
                      <span className="block h-1.5 w-4/5 rounded-full bg-muted-foreground/20" />
                    </div>
                  </div>
                  <span className="block h-1.5 w-full rounded-full bg-muted-foreground/20" />
                  <span className="block h-1.5 w-5/6 rounded-full bg-muted-foreground/15" />
                  <span className="block h-1.5 w-2/3 rounded-full bg-muted-foreground/15" />
                </div>

                {/* Redaction block */}
                <div className="device-anim device-delay-1 absolute left-5 right-5 bottom-8 h-7 rounded-sm bg-foreground" />

                {/* Confirmation */}
                <div className="device-anim device-delay-2 absolute left-1/2 -translate-x-1/2 bottom-2.5 flex items-center gap-1 rounded-full bg-card border border-border px-2 py-0.5 shadow-sm">
                  <span className="block w-2 h-2 rounded-full bg-foreground" />
                  <span className="text-[9px] font-semibold text-foreground leading-none">
                    {t("home.device.blur.done")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section two: desktop browser + Format Converter batch ZIP */}
      <section
        ref={desktop.ref as React.RefObject<HTMLElement>}
        className={`mt-20 w-full max-w-5xl z-10 shrink-0 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center ${
          desktop.inView ? "device-inview" : ""
        }`}
      >
        <div className="flex flex-col gap-3 text-left">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
            {t("home.device.batch.title")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
            {t("home.device.batch.text")}
          </p>
          <Link
            href="/tools/converter"
            className="inline-flex items-center text-sm font-semibold text-foreground underline-offset-4 hover:underline w-fit"
          >
            {t("home.device.batch.cta")}
          </Link>
        </div>

        <div className="w-full">
          <div className="device-browser-bezel w-full aspect-[16/10] rounded-xl border border-border bg-card shadow-md overflow-hidden flex flex-col">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/40 shrink-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="block w-2 h-2 rounded-full bg-muted-foreground/40" />
                <span className="block w-2 h-2 rounded-full bg-muted-foreground/40" />
                <span className="block w-2 h-2 rounded-full bg-muted-foreground/40" />
              </div>
              <div className="flex-1 min-w-0 h-5 rounded-md bg-background border border-border px-2 flex items-center">
                <span className="text-[10px] font-mono text-muted-foreground truncate">
                  /tools/converter
                </span>
              </div>
            </div>

            {/* Browser body */}
            <div className="flex-1 min-h-0 p-3 flex flex-col gap-2 overflow-hidden">
              <div className="device-anim flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-2 py-1.5">
                <span className="block w-3 h-3 rounded-sm bg-muted-foreground/30 shrink-0" />
                <span className="text-[10px] font-mono text-muted-foreground truncate">
                  img-01.png
                </span>
              </div>
              <div className="device-anim device-delay-1 flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-2 py-1.5">
                <span className="block w-3 h-3 rounded-sm bg-muted-foreground/30 shrink-0" />
                <span className="text-[10px] font-mono text-muted-foreground truncate">
                  img-02.png
                </span>
              </div>
              <div className="device-anim device-delay-2 flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-2 py-1.5">
                <span className="block w-3 h-3 rounded-sm bg-muted-foreground/30 shrink-0" />
                <span className="text-[10px] font-mono text-muted-foreground truncate">
                  img-03.png
                </span>
              </div>

              <div className="mt-auto space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="device-anim device-delay-3 text-[10px] font-medium text-muted-foreground">
                    {t("home.device.batch.progress")}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div className="device-progress-fill h-full w-full rounded-full bg-foreground origin-left" />
                </div>
                <div className="device-anim device-delay-4 flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-2 py-1.5">
                  <span className="block w-3 h-3 rounded-sm bg-foreground/80 shrink-0" />
                  <span className="text-[10px] font-mono font-semibold text-foreground truncate">
                    {t("home.device.batch.zip")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
