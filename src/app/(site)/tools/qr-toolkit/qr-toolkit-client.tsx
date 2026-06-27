"use client";

import { useT } from "@/lib/i18n/useT";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Header, PrivacyNotice } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { QrCode, Scan, Download, Copy, Check, AlertTriangle, ExternalLink, Wifi, Type, Link2, CheckCircle2, HelpCircle, Shield, EyeOff, Camera, Upload, Info } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import jsQR from "jsqr";

interface CleanedUrlInfo {
  originalUrl: string;
  cleanedUrl: string;
  hostname: string;
  isShortened: boolean;
  hasTrackers: boolean;
  strippedList: string[];
}

export default function QrToolkitClient() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<"generate" | "scan">("generate");

  // =========================================================================
  // GENERATOR STATES
  // =========================================================================
  const [genMode, setGenMode] = useState<"url" | "text" | "wifi">("url");
  const [genText, setGenText] = useState("");
  const [genUrl, setGenUrl] = useState("https://");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiAuth, setWifiAuth] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  // Generator Options
  const [qrSize, setQrSize] = useState(256);
  const [qrMargin, setQrMargin] = useState(4);
  const [qrErrorLevel, setQrErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedGen, setCopiedGen] = useState(false);

  // Compile final generator payload
  const getGeneratorPayload = (): string => {
    if (genMode === "url") {
      return genUrl.trim();
    }
    if (genMode === "text") {
      return genText;
    }
    if (genMode === "wifi") {
      const escapeWifi = (val: string) => {
        return val
          .replace(/\\/g, "\\\\")
          .replace(/;/g, "\\;")
          .replace(/:/g, "\\:")
          .replace(/,/g, "\\,")
          .replace(/"/g, '\\"');
      };
      // WIFI:S:SSID;T:TYPE;P:PASS;H:HIDDEN;;
      const s = escapeWifi(wifiSsid);
      const p = wifiPassword ? escapeWifi(wifiPassword) : "";
      const t = wifiAuth;
      const h = wifiHidden ? "H:true" : "";
      return `WIFI:S:${s};T:${t};${wifiPassword ? `P:${p};` : ""}${h};`;
    }
    return "";
  };

  const payload = getGeneratorPayload();

  // Render QR Code to canvas on options change
  useEffect(() => {
    if (activeTab === "generate" && canvasRef.current && payload) {
      QRCode.toCanvas(
        canvasRef.current,
        payload,
        {
          width: qrSize,
          margin: qrMargin,
          color: {
            dark: fgColor,
            light: bgColor
          },
          errorCorrectionLevel: qrErrorLevel
        },
        (err) => {
          if (err) {
            console.error("QR rendering failed", err);
          }
        }
      );
    }
  }, [payload, qrSize, qrMargin, qrErrorLevel, fgColor, bgColor, activeTab]);

  const downloadPng = () => {
    if (!canvasRef.current || !payload) return;
    try {
      const url = canvasRef.current.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-code-${genMode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("PNG QR Code downloaded successfully.");
    } catch {
      toast.error("Failed to export PNG.");
    }
  };

  const downloadSvg = () => {
    if (!payload) return;
    QRCode.toString(
      payload,
      {
        type: "svg",
        width: qrSize,
        margin: qrMargin,
        color: {
          dark: fgColor,
          light: bgColor
        },
        errorCorrectionLevel: qrErrorLevel
      },
      (err, svgString) => {
        if (err) {
          toast.error("Failed to generate SVG.");
          return;
        }
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qr-code-${genMode}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("SVG QR Code downloaded successfully.");
      }
    );
  };

  const copyPayload = () => {
    if (!payload) return;
    navigator.clipboard.writeText(payload);
    setCopiedGen(true);
    toast.success("Copied payload text to clipboard!");
    setTimeout(() => setCopiedGen(false), 2000);
  };

  // =========================================================================
  // SCANNER STATES
  // =========================================================================
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanType, setScanType] = useState<"url" | "text" | "wifi" | null>(null);
  const [wifiParsed, setWifiParsed] = useState<{ ssid: string; pass: string; type: string; hidden: boolean } | null>(null);
  const [urlInfo, setUrlInfo] = useState<CleanedUrlInfo | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<number | null>(null);

  // Stop camera helper
  const stopCamera = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start camera helper
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      videoStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
        setIsCameraActive(true);
        // Start continuous decoding loop
        scanLoopRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: unknown) {
      console.error("Camera access failed", err);
      setCameraError("Camera access denied or unavailable. Please verify permissions.");
      toast.error("Could not activate webcam.");
    }
  };

  // Frame processing loop for QR decoding
  const scanFrame = () => {
    if (!videoStreamRef.current || !videoRef.current || !hiddenCanvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = hiddenCanvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "dontInvert"
        });

        if (decoded && decoded.data) {
          // Found QR code!
          handleScanSuccess(decoded.data);
          return; // Stop loop
        }
      } catch (err) {
        console.error("Frame decoding error:", err);
      }
    }

    // Continue loop
    scanLoopRef.current = requestAnimationFrame(scanFrame);
  };

  // Process decoded QR payload (uploads + webcam both feed here)
  const handleScanSuccess = (rawText: string) => {
    stopCamera();
    setScanResult(rawText);

    // Audit and categorize
    const trimmed = rawText.trim();

    // 1. Wi-Fi
    if (/^wifi:/i.test(trimmed)) {
      setScanType("wifi");
      const ssidMatch = trimmed.match(/S:([^;]+)/i);
      const passMatch = trimmed.match(/P:([^;]+)/i);
      const typeMatch = trimmed.match(/T:([^;]+)/i);
      const hiddenMatch = trimmed.match(/H:([^;]+)/i);

      const ssid = ssidMatch ? ssidMatch[1] : "Unknown SSID";
      const pass = passMatch ? passMatch[1] : "";
      const type = typeMatch ? typeMatch[1] : "none";
      const hidden = hiddenMatch ? hiddenMatch[1].toLowerCase() === "true" : false;

      setWifiParsed({ ssid, pass, type, hidden });
      setUrlInfo(null);
      toast.success("Wi-Fi network configuration scanned!");
      return;
    }

    // 2. URL detection
    let isUrl = false;
    let urlString = trimmed;

    if (/^[a-zA-Z][a-zA-Z0-9.+-]*:\/\//i.test(trimmed)) {
      isUrl = true;
    } else if (/^[a-zA-Z0-9-.]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed) && !/\s/.test(trimmed)) {
      isUrl = true;
      urlString = "https://" + trimmed;
    }

    if (isUrl) {
      try {
        const url = new URL(urlString);
        const host = url.hostname.toLowerCase();

        // Common shorteners list
        const shorteners = [
          "bit.ly", "tinyurl.com", "t.co", "goo.gl", "rebrand.ly", "is.gd",
          "buff.ly", "adf.ly", "bit.do", "mcaf.ee", "su.pr", "ow.ly",
          "linktr.ee", "git.io", "t.me", "v.gd", "tiny.cc", "shrte.st",
          "bl.ink", "qr.ae", "lnkd.in", "db.tt", "qr.net", "shorturl.at"
        ];

        const isShortened = shorteners.some(s => host === s || host.endsWith("." + s));

        // Tracker params
        const trackerKeys = [
          "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id",
          "fbclid", "gclid", "dclid", "wbraid", "gbraid", "mc_eid", "igshid",
          "msclkid", "ttclid", "yclid", "twclid", "_hsenc", "_hsmi", "mkt_tok"
        ];

        const originalUrl = urlString;
        const cleanParams = new URLSearchParams();
        const strippedList: string[] = [];

        url.searchParams.forEach((val, key) => {
          if (trackerKeys.includes(key.toLowerCase()) || key.toLowerCase().startsWith("utm_")) {
            strippedList.push(key);
          } else {
            cleanParams.append(key, val);
          }
        });

        url.search = cleanParams.toString();
        const cleanedUrl = url.toString();
        const hasTrackers = originalUrl !== cleanedUrl;

        setScanType("url");
        setUrlInfo({
          originalUrl,
          cleanedUrl,
          hostname: url.hostname,
          isShortened,
          hasTrackers,
          strippedList
        });
        setWifiParsed(null);
        toast.success("Safe Preview audit loaded for scanned URL.");
        return;
      } catch {
        // Fallback to text
      }
    }

    // 3. Plain Text fallback
    setScanType("text");
    setUrlInfo(null);
    setWifiParsed(null);
    toast.success("Text QR code scanned!");
  };

  // Uploaded image decoding handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            toast.error("Could not allocate decoder canvas.");
            return;
          }
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);

          try {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const decoded = jsQR(imgData.data, imgData.width, imgData.height);

            if (decoded && decoded.data) {
              handleScanSuccess(decoded.data);
            } else {
              toast.error("No valid QR code detected in the uploaded image.");
            }
          } catch {
            toast.error("Failed to decode the uploaded image.");
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Clean streams and loops on unmount
  useEffect(() => {
    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (scanLoopRef.current) {
        cancelAnimationFrame(scanLoopRef.current);
      }
    };
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Panel */}
      <Header showBackToTools />

      <div className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-10 z-10 flex flex-col gap-6 sm:gap-10">
        {/* Intro */}
        <section className="text-center sm:text-left space-y-2 sm:space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-fade-in">
            <QrCode className="w-3.5 h-3.5 text-primary" />
            QR Toolkit
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Generate clean, tracker-free QR codes and scan unknown ones safely.
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            {t("tools.qr-toolkit.intro")}
          </p>
        </section>

        {/* Tab Toggle Navigation */}
        <div className="flex justify-center sm:justify-start">
          <div className="inline-flex p-1 rounded-xl bg-secondary/80 border border-border/60">
            <button
              onClick={() => {
                stopCamera();
                setActiveTab("generate");
              }}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
                activeTab === "generate"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              QR Generator
            </button>
            <button
              onClick={() => setActiveTab("scan")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
                activeTab === "scan"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              Safe Scanner
            </button>
          </div>
        </div>

        {/* TAB 1: GENERATOR CONTENT */}
        {activeTab === "generate" ? (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full animate-fade-in">
            {/* Controls panel */}
            <div className="lg:col-span-2 w-full p-4 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-6">
              {/* Input modes selector */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                  QR Payload Mode
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={genMode === "url" ? "default" : "secondary"}
                    onClick={() => setGenMode("url")}
                    className="text-xs font-bold py-2.5 rounded-xl border border-border/40 flex items-center gap-1.5"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    URL
                  </Button>
                  <Button
                    variant={genMode === "text" ? "default" : "secondary"}
                    onClick={() => setGenMode("text")}
                    className="text-xs font-bold py-2.5 rounded-xl border border-border/40 flex items-center gap-1.5"
                  >
                    <Type className="w-3.5 h-3.5" />
                    Text
                  </Button>
                  <Button
                    variant={genMode === "wifi" ? "default" : "secondary"}
                    onClick={() => setGenMode("wifi")}
                    className="text-xs font-bold py-2.5 rounded-xl border border-border/40 flex items-center gap-1.5"
                  >
                    <Wifi className="w-3.5 h-3.5" />
                    Wi-Fi
                  </Button>
                </div>
              </div>

              {/* Dynamic input fields based on active genMode */}
              <div className="space-y-4">
                {genMode === "url" && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-extrabold text-muted-foreground uppercase">
                      Website URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={genUrl}
                      onChange={(e) => setGenUrl(e.target.value)}
                      className="w-full bg-secondary border border-border/80 focus:border-primary/50 text-foreground text-sm rounded-xl h-10 px-3 outline-none transition-all"
                    />
                    <span className="text-[10px] text-muted-foreground leading-normal block">
                      Note: Static QR codes encode this raw URL directly.
                    </span>
                  </div>
                )}

                {genMode === "text" && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-extrabold text-muted-foreground uppercase">
                      Plain Text / Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter the text message to encode..."
                      value={genText}
                      onChange={(e) => setGenText(e.target.value)}
                      className="w-full bg-secondary border border-border/80 focus:border-primary/50 text-foreground text-sm rounded-xl p-3 outline-none transition-all resize-y"
                    />
                  </div>
                )}

                {genMode === "wifi" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-muted-foreground uppercase">
                        Network Name (SSID)
                      </label>
                      <input
                        type="text"
                        placeholder="MyHomeWifi"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        className="w-full bg-secondary border border-border/80 focus:border-primary/50 text-foreground text-sm rounded-xl h-10 px-3 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-muted-foreground uppercase">
                        Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        className="w-full bg-secondary border border-border/80 focus:border-primary/50 text-foreground text-sm rounded-xl h-10 px-3 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-muted-foreground uppercase">
                        Encryption Type
                      </label>
                      <Select
                        value={wifiAuth}
                        onValueChange={(val) => setWifiAuth(val as "WPA" | "WEP" | "nopass")}
                      >
                        <SelectTrigger className="w-full bg-secondary border border-border/80 text-foreground text-xs rounded-xl h-10 px-3">
                          <SelectValue placeholder="Security Protocol" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border/80 rounded-xl shadow-xl">
                          <SelectItem value="WPA" className="text-xs font-semibold">
                            WPA/WPA2/WPA3 (Standard)
                          </SelectItem>
                          <SelectItem value="WEP" className="text-xs font-semibold">
                            WEP (Legacy)
                          </SelectItem>
                          <SelectItem value="nopass" className="text-xs font-semibold">
                            Unencrypted / Open
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="wifi-hidden"
                        checked={wifiHidden}
                        onChange={(e) => setWifiHidden(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <label htmlFor="wifi-hidden" className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                        Hidden Network SSID
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced rendering parameters */}
              <div className="pt-4 border-t border-border/40 space-y-4">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                  QR Customization & Design
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Size setting */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-muted-foreground uppercase">
                      Resolution Size
                    </label>
                    <Select value={String(qrSize)} onValueChange={(val) => setQrSize(Number(val))}>
                      <SelectTrigger className="w-full bg-secondary border border-border/80 text-foreground text-xs rounded-xl h-10 px-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border border-border/80 rounded-xl shadow-xl">
                        <SelectItem value="128" className="text-xs font-semibold">128 × 128 px</SelectItem>
                        <SelectItem value="256" className="text-xs font-semibold">256 × 256 px</SelectItem>
                        <SelectItem value="384" className="text-xs font-semibold">384 × 384 px</SelectItem>
                        <SelectItem value="512" className="text-xs font-semibold">512 × 512 px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Error correction Level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-muted-foreground uppercase">
                      Error Correction
                    </label>
                    <Select value={qrErrorLevel} onValueChange={(val) => setQrErrorLevel(val as "L" | "M" | "Q" | "H")}>
                      <SelectTrigger className="w-full bg-secondary border border-border/80 text-foreground text-xs rounded-xl h-10 px-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border border-border/80 rounded-xl shadow-xl">
                        <SelectItem value="L" className="text-xs font-semibold">L — Low (7% recovery)</SelectItem>
                        <SelectItem value="M" className="text-xs font-semibold">M — Medium (15% recovery)</SelectItem>
                        <SelectItem value="Q" className="text-xs font-semibold">Q — Quartile (25% recovery)</SelectItem>
                        <SelectItem value="H" className="text-xs font-semibold">H — High (30% recovery)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Margin Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-xs font-extrabold text-muted-foreground uppercase">
                        Quiet Zone Margin
                      </label>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold">
                        {qrMargin} modules
                      </span>
                    </div>
                    <div className="pt-2">
                      <input
                        type="range"
                        min={0}
                        max={8}
                        step={1}
                        value={qrMargin}
                        onChange={(e) => setQrMargin(Number(e.target.value))}
                        className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Color picks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-muted-foreground uppercase">
                      Foreground Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-border/80 bg-secondary p-0.5"
                      />
                      <input
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        placeholder="#000000"
                        className="flex-1 bg-secondary border border-border/80 focus:border-primary/50 text-foreground text-xs rounded-xl h-10 px-3 outline-none"
                      />
                    </div>
                    {/* curated palette */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {["#000000", "#1a1a1a", "#2e3440", "#ffffff"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFgColor(c)}
                          className="w-5 h-5 rounded-full border border-border/60 hover:scale-110 active:scale-95 transition-all shadow-sm"
                          style={{ backgroundColor: c }}
                          title={`Set foreground to ${c}`}
                          aria-label={`Set foreground color to ${c}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-muted-foreground uppercase">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor === "transparent" ? "#ffffff" : bgColor}
                        disabled={bgColor === "transparent"}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-border/80 bg-secondary p-0.5 disabled:opacity-50"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 bg-secondary border border-border/80 focus:border-primary/50 text-foreground text-xs rounded-xl h-10 px-3 outline-none"
                      />
                    </div>
                    {/* curated palette */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {["#ffffff", "transparent", "#f3f4f6", "#1a1a1a"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setBgColor(c)}
                          className="w-5 h-5 rounded-full border border-border/60 hover:scale-110 active:scale-95 transition-all shadow-sm flex items-center justify-center text-[8px] overflow-hidden"
                          style={{
                            backgroundColor: c === "transparent" ? "#ffffff" : c,
                            backgroundImage: c === "transparent" ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)" : "none",
                            backgroundSize: "6px 6px",
                            backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0"
                          }}
                          title={`Set background to ${c}`}
                          aria-label={`Set background color to ${c}`}
                        >
                          {c === "transparent" && <span className="opacity-70 font-bold select-none text-[8px]">T</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Display / Download Panel */}
            <div className="lg:col-span-1 p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5" />
                  Live Preview
                </span>
                <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
                  {qrSize} × {qrSize}
                </span>
              </div>

              {/* QR Canvas Container with premium checkerboard backdrop */}
              <div
                className="relative bg-canvas rounded-xl p-6 flex flex-col items-center justify-center aspect-square border border-border/50 overflow-hidden shadow-inner"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "repeat",
                }}
              >
                {payload ? (
                  <canvas ref={canvasRef} className="max-w-full max-h-full object-contain rounded-md" />
                ) : (
                  <div className="text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                    <QrCode className="w-8 h-8 opacity-30" />
                    <span>Enter content to generate QR</span>
                  </div>
                )}
              </div>

              {payload && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col gap-1.5 text-xs text-muted-foreground p-2 border border-border/40 bg-secondary/25 rounded-xl">
                    <span className="font-bold text-foreground uppercase text-[9px] tracking-wider block">QR Payload</span>
                    <code className="block break-all font-mono max-h-[80px] overflow-y-auto custom-scrollbar select-all">
                      {payload}
                    </code>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={copyPayload}
                      className="flex-1 text-xs font-bold rounded-xl border border-border/80 gap-1.5 h-9"
                    >
                      {copiedGen ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Raw
                    </Button>
                  </div>

                  <div className="h-px bg-border/40 my-1" />

                  <Button
                    onClick={downloadPng}
                    className="w-full text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md h-10 gap-1.5 flex items-center justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </Button>

                  <Button
                    onClick={downloadSvg}
                    variant="outline"
                    className="w-full text-xs font-bold rounded-xl border border-border/80 text-foreground hover:bg-secondary h-10 gap-1.5 flex items-center justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Download SVG
                  </Button>

                  <p className="text-[10px] text-muted-foreground text-center leading-normal">
                    This QR code is static. It will work forever and never expire.
                  </p>
                </div>
              )}
            </div>
          </section>
        ) : (
          // =========================================================================
          // TAB 2: SCANNER CONTENT
          // =========================================================================
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full animate-fade-in">
            {/* Input scan channels */}
            <div className="lg:col-span-2 w-full flex flex-col gap-6">
              {/* Webcam viewport */}
              <div className="w-full p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    Webcam safe Scan
                  </span>
                  {isCameraActive && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                    </span>
                  )}
                </div>

                {/* Video rendering box */}
                <div className="relative w-full aspect-[4/3] bg-[#0f0f11] rounded-xl overflow-hidden border border-border/50 shadow-inner flex items-center justify-center p-4">
                  {isCameraActive ? (
                    <>
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {/* Laser overlay animation */}
                      <div className="absolute inset-x-0 h-0.5 bg-destructive opacity-85 shadow-[0_0_8px_red] animate-bounce top-1/2" />
                    </>
                  ) : (
                    <div className="text-center text-xs text-muted-foreground flex flex-col items-center gap-3 max-w-sm px-6">
                      <Camera className="w-10 h-10 opacity-20" />
                      <p className="font-bold text-foreground">Awaiting webcam connection</p>
                      <p className="text-[11px] leading-normal text-muted-foreground">
                        Your browser will prompt for camera access. The raw feed is decoded entirely in-memory and never sent anywhere.
                      </p>
                      <Button
                        onClick={startCamera}
                        className="mt-2 text-xs font-extrabold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover px-6 h-9 gap-1.5"
                      >
                        <Camera className="w-4 h-4" />
                        Start Webcam
                      </Button>
                    </div>
                  )}
                </div>

                {isCameraActive && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                      <Info className="w-3 h-3 text-primary" />
                      Place a QR code directly in front of the lens.
                    </span>
                    <Button
                      variant="ghost"
                      onClick={stopCamera}
                      className="text-xs font-extrabold text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-4 rounded-lg"
                    >
                      Stop Camera
                    </Button>
                  </div>
                )}

                {cameraError && (
                  <div className="p-3.5 bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2.5 text-destructive text-xs">
                    <AlertTriangle className="w-4.5 h-4.5 mt-0.5 shrink-0" />
                    <p className="font-semibold">{cameraError}</p>
                  </div>
                )}
              </div>

              {/* File upload decode */}
              <div className="w-full p-5 rounded-2xl bg-card border border-border/60 shadow-md flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                    <Upload className="w-4 h-4" />
                    Upload QR Image
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Pick a screenshot, image, or photo containing a QR code from your local machine to parse and inspect offline.
                  </p>
                </div>

                <div className="shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-extrabold rounded-xl border border-border/80 text-foreground hover:bg-secondary h-10 px-5 gap-1.5"
                  >
                    Select File
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Hidden canvas for image decoding */}
            <canvas ref={hiddenCanvasRef} className="hidden" />

            {/* Safe Preview / Audit Panel */}
            <div className="lg:col-span-1 p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-4 min-h-[300px]">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Safe Preview
                </span>
                {scanType && (
                  <span className="text-xs font-bold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border capitalize">
                    {scanType}
                  </span>
                )}
              </div>

              {!scanResult ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/40 rounded-xl text-center gap-2">
                  <Shield className="w-10 h-10 text-muted-foreground/30" />
                  <span className="text-xs font-semibold text-muted-foreground">Safe Preview Idle</span>
                  <span className="text-[10px] text-muted-foreground/60 leading-normal max-w-[200px]">
                    Webcam decode or image uploads load here instantly for safe auditing.
                  </span>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4 justify-between animate-fade-in">
                  <div className="space-y-4">
                    {/* Confirmed decode notice */}
                    <div className="p-3 bg-success/5 dark:bg-success/10 border border-success/20 rounded-xl flex items-center justify-between text-success font-bold text-xs">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        Decoded Offline
                      </span>
                      <button
                        onClick={() => {
                          setScanResult(null);
                          setScanType(null);
                          setUrlInfo(null);
                          setWifiParsed(null);
                        }}
                        className="text-[10px] text-muted-foreground hover:text-foreground font-semibold px-2 py-0.5 rounded border border-border/60 bg-secondary/40 transition-colors"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Dynamic results rendering depending on type */}
                    {scanType === "url" && urlInfo && (
                      <div className="space-y-3.5 animate-fade-in">
                        {/* Domain Flag Header */}
                        <div className="p-3 bg-secondary/60 rounded-xl border border-border/60 text-center">
                          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                            Destination Domain
                          </span>
                          <span className="text-base font-extrabold text-foreground tracking-tight select-all">
                            {urlInfo.hostname}
                          </span>
                        </div>

                        {/* Shortener caution warning */}
                        {urlInfo.isShortened && (
                          <div className="p-3 bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 text-destructive animate-fade-in">
                            <AlertTriangle className="w-4.5 h-4.5 mt-0.5 shrink-0" />
                            <div className="space-y-1 text-left">
                              <p className="font-extrabold text-xs">Caution: Shortened URL</p>
                              <p className="text-[10px] text-muted-foreground leading-normal">
                                The real endpoint is hidden behind a URL shortener ({urlInfo.hostname}). Resolving redirects requires network requests which cannot be done client-side safely without leak risks. Proceed with caution.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Trackers Stripped indicator */}
                        {urlInfo.hasTrackers ? (
                          <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-2 text-foreground animate-fade-in">
                            <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-1 text-left">
                              <p className="font-bold text-xs text-primary">Tracking parameters stripped</p>
                              <p className="text-[10px] text-muted-foreground leading-normal">
                                Cleaned tracking analytics: <span className="font-semibold text-foreground">{urlInfo.strippedList.join(", ")}</span>.
                              </p>
                            </div>
                          </div>
                        ) : null}

                        {/* URL comparison display */}
                        <div className="space-y-2.5">
                          {urlInfo.hasTrackers && (
                            <div className="space-y-1 text-xs">
                              <span className="font-extrabold text-muted-foreground uppercase text-[9px]">Original URL (Embedded)</span>
                              <div className="p-2 border border-border/40 bg-secondary/25 rounded-lg text-[10px] font-mono break-all line-through opacity-60 max-h-[80px] overflow-y-auto custom-scrollbar">
                                {urlInfo.originalUrl}
                              </div>
                            </div>
                          )}

                          <div className="space-y-1 text-xs">
                            <span className="font-extrabold text-muted-foreground uppercase text-[9px]">Cleaned URL (Audited)</span>
                            <div className="p-2.5 border border-border/80 bg-secondary/40 font-mono text-[10.5px] rounded-lg break-all select-all max-h-[100px] overflow-y-auto custom-scrollbar font-bold">
                              {urlInfo.cleanedUrl}
                            </div>
                          </div>
                        </div>

                        {/* URL Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => copyToClipboard(urlInfo.cleanedUrl)}
                            className="flex-1 text-xs font-bold rounded-xl border border-border/80 h-10 gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy Cleaned URL
                          </Button>
                        </div>

                        <a
                          href={urlInfo.cleanedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block pt-1"
                        >
                          <Button className="w-full text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md h-10 gap-1.5 flex items-center justify-center">
                            <span>Open Link Safely</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      </div>
                    )}

                    {scanType === "wifi" && wifiParsed && (
                      <div className="space-y-3.5 animate-fade-in">
                        <div className="p-4 bg-secondary/50 rounded-xl border border-border/50 space-y-3">
                          <div className="flex items-center gap-2 text-primary font-bold">
                            <Wifi className="w-5 h-5" />
                            <span className="text-xs uppercase tracking-wider">Wi-Fi Configuration</span>
                          </div>

                          <div className="space-y-1 text-xs pt-1">
                            <div className="flex justify-between py-1 border-b border-border/20">
                              <span className="text-muted-foreground font-semibold">SSID:</span>
                              <span className="font-bold text-foreground select-all">{wifiParsed.ssid}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-border/20">
                              <span className="text-muted-foreground font-semibold">Security:</span>
                              <span className="font-bold text-foreground uppercase">{wifiParsed.type}</span>
                            </div>
                            {wifiParsed.pass && (
                              <div className="flex flex-col py-1 gap-1">
                                <span className="text-muted-foreground font-semibold">Password:</span>
                                <code className="block bg-secondary border border-border/80 rounded px-2.5 py-1.5 text-xs font-bold text-foreground font-mono select-all">
                                  {wifiParsed.pass}
                                </code>
                              </div>
                            )}
                            {wifiParsed.hidden && (
                              <div className="text-[10px] text-warning font-bold uppercase tracking-wider pt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Hidden Network
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                          {wifiParsed.pass && (
                            <Button
                              variant="outline"
                              onClick={() => copyToClipboard(wifiParsed.pass)}
                              className="w-full text-xs font-bold rounded-xl border border-border/80 h-10 gap-1.5"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Copy password
                            </Button>
                          )}
                          <Button
                            onClick={() => copyToClipboard(`SSID: ${wifiParsed.ssid}\nPassword: ${wifiParsed.pass}\nSecurity: ${wifiParsed.type}`)}
                            className="w-full text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md h-10 gap-1.5"
                          >
                            Copy Connection config
                          </Button>
                        </div>
                      </div>
                    )}

                    {scanType === "text" && (
                      <div className="space-y-3.5 animate-fade-in">
                        <div className="space-y-1 text-xs">
                          <span className="font-extrabold text-muted-foreground uppercase text-[9px]">Text Content</span>
                          <div className="p-3 border border-border/80 bg-secondary/40 font-mono text-[10.5px] rounded-lg break-all select-all max-h-[160px] overflow-y-auto custom-scrollbar font-bold">
                            {scanResult}
                          </div>
                        </div>

                        <Button
                          onClick={() => copyToClipboard(scanResult)}
                          className="w-full text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md h-10 gap-1.5 flex items-center justify-center"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy Decoded Text
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-4" />

        {/* How It Works Guide Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Offline generation and safety auditing for QR codes in four steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Generate / Input",
                text: t("tools.qr-toolkit.howItWorks.step1"),
              },
              {
                step: "02",
                title: "Customize & Save",
                text: t("tools.qr-toolkit.howItWorks.step2"),
              },
              {
                step: "03",
                title: "Scan Safely",
                text: t("tools.qr-toolkit.howItWorks.step3"),
              },
              {
                step: "04",
                title: "Audit Preview",
                text: t("tools.qr-toolkit.howItWorks.step4"),
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border/40 shadow-sm relative flex flex-col gap-2.5"
              >
                <span className="text-2xl font-black text-primary/25 absolute top-4 right-5 select-none font-mono">
                  {item.step}
                </span>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: t("tools.qr-toolkit.faq.q1"),
                a: t("tools.qr-toolkit.faq.a1"),
              },
              {
                q: t("tools.qr-toolkit.faq.q2"),
                a: t("tools.qr-toolkit.faq.a2"),
              },
              {
                q: t("tools.qr-toolkit.faq.q3"),
                a: t("tools.qr-toolkit.faq.a3"),
              },
              {
                q: t("tools.qr-toolkit.faq.q4"),
                a: t("tools.qr-toolkit.faq.a4"),
              },
            ].map((faq, idx) => (
              <div key={idx} className="space-y-1.5 p-1">
                <h3 className="text-xs sm:text-sm font-extrabold text-foreground flex gap-1.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-5.5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Tools internal link block */}
        <section className="max-w-4xl mx-auto w-full space-y-4 pt-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground text-center sm:text-left">
            Related Privacy Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/tools/exif-cleaner"
              onClick={stopCamera}
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    EXIF Privacy Cleaner
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {t("shared.related.exif-cleaner-metadata")}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </Link>

            <Link
              href="/tools/blur"
              onClick={stopCamera}
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Blur & Redact Image
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {t("shared.related.blur")}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </Link>
          </div>
        </section>

        {/* Offline Privacy Notice */}
        <PrivacyNotice>
          <p>
            {t("tools.qr-toolkit.privacyNotice")}
          </p>
        </PrivacyNotice>
      </div>
    </main>
  );
}
