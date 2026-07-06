"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Copy, Heart, ExternalLink, AlertTriangle } from "lucide-react";

type NetworkType = "bep20" | "erc20" | "trc20";

interface CryptoDetails {
  label: string;
  warning: string;
  address: string;
  qrPath: string;
}

const cryptoNetworks: Record<NetworkType, CryptoDetails> = {
  bep20: {
    label: "BEP20 (BSC)",
    warning: "Send USDT on the BEP20 (BSC) network ONLY. Wrong network = funds lost.",
    address: "0x75f08f47c9ffb8d8afff1306d49952fea4b0f518",
    qrPath: "/images/support/usdt-bep20.png"
  },
  erc20: {
    label: "ERC20 (Ethereum)",
    warning: "Send USDT on the ERC20 (Ethereum) network ONLY. Wrong network = funds lost.",
    address: "0x75f08f47c9ffb8d8afff1306d49952fea4b0f518",
    qrPath: "/images/support/usdt-erc20.png"
  },
  trc20: {
    label: "TRC20 (Tron)",
    warning: "Send USDT on the TRC20 (Tron) network ONLY. Wrong network = funds lost.",
    address: "TJ3mMu5ir3dTXwgqD2Sx67BBq8DZF7ig1N",
    qrPath: "/images/support/usdt-trc20.png"
  }
};

export default function SupportClient() {
  const [activeNetwork, setActiveNetwork] = useState<NetworkType>("bep20");

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
      .then(() => {
        toast.success("Address copied");
      })
      .catch(() => {
        toast.error("Failed to copy address");
      });
  };

  const activeCrypto = cryptoNetworks[activeNetwork];

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip">
      {/* Background Glows for Premium Vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <Header  />

      {/* Back to tools, placed BELOW the header box, aligned with the logo */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-3 z-10 shrink-0">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 pl-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to tools
        </Link>
      </div>

      {/* Content Container */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 sm:py-16 z-10 space-y-10 select-text">
        {/* Hero */}
        <section className="text-center sm:text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <Heart className="w-3.5 h-3.5 text-primary fill-primary/20" />
            Support Us
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground bg-clip-text">
            Support Us
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-semibold">
            Free to use. Not free to run.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Alatify is completely free, features no advertisements, does not require accounts, and processes your images completely on your device. Your support directly helps us cover our domain name registration, hosting infrastructure, and development efforts to keep building high-quality, private tools.
          </p>
        </section>

        {/* Divider */}
        <hr className="border-border/40" />

        {/* Donation cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch w-full animate-fade-in select-none">
          {/* Card A: Saweria */}
          <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col justify-between gap-6 hover:border-primary/35 transition-all duration-300 group">
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Saweria
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ideal for donors in Indonesia. Supports QRIS, GoPay, OVO, DANA, LinkAja, and standard bank transfers.
              </p>
            </div>

            {/* QR Container */}
            <div className="flex flex-col items-center justify-center p-6 bg-secondary/35 border border-border/50 rounded-xl space-y-3">
              <div className="relative w-44 h-44 bg-white p-2 rounded-lg shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/support/saweria-qris.png"
                  alt="Saweria Donation QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[11px] text-muted-foreground text-center font-medium">
                Scan to open the Saweria donation page
              </span>
            </div>

            <a
              href="https://saweria.co/alatify"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block"
            >
              <Button className="w-full h-11 text-xs font-extrabold rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 gap-1.5 flex items-center justify-center">
                <span>Donate via Saweria</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>

          {/* Card B: Crypto */}
          <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col justify-between gap-6 hover:border-primary/35 transition-all duration-300">
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Crypto (USDT)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Support us using USDT across BSC, Ethereum, or Tron networks. Choose your network below.
              </p>
            </div>

            {/* Segmented Control */}
            <div className="flex p-1 rounded-xl bg-secondary border border-border/60">
              <button
                onClick={() => setActiveNetwork("bep20")}
                className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${
                  activeNetwork === "bep20"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                BEP20 (BSC)
              </button>
              <button
                onClick={() => setActiveNetwork("erc20")}
                className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${
                  activeNetwork === "erc20"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ERC20 (ETH)
              </button>
              <button
                onClick={() => setActiveNetwork("trc20")}
                className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${
                  activeNetwork === "trc20"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                TRC20 (TRX)
              </button>
            </div>

            {/* Network Content Area */}
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              {/* WARNING Banner */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 text-[11px] font-semibold leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <span>{activeCrypto.warning}</span>
              </div>

              {/* Monospace wallet address with copy button */}
              <div className="space-y-1.5 select-text">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                  USDT Address
                </span>
                <div className="flex items-center gap-2 bg-secondary border border-border/80 rounded-xl p-2.5">
                  <span className="flex-1 font-mono text-[11px] text-foreground break-all select-all pr-2 leading-relaxed">
                    {activeCrypto.address}
                  </span>
                  <Button
                    onClick={() => handleCopyAddress(activeCrypto.address)}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg shrink-0 border-border/60 bg-card hover:bg-secondary hover:text-primary transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* QR Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-secondary/35 border border-border/50 rounded-xl space-y-2">
                <div className="relative w-36 h-36 bg-white p-2 rounded-lg shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeCrypto.qrPath}
                    alt={`USDT ${activeCrypto.label} Address QR Code`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground text-center font-medium">
                  USDT ({activeCrypto.label}) Address QR
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
