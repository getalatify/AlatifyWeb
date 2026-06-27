/* eslint-disable @next/next/no-img-element */
"use client";

import { useT } from "@/lib/i18n/useT";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Header, PrivacyNotice } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Binary, Download, Copy, Check, AlertTriangle, Lock, Unlock, CheckCircle2, HelpCircle, Shield, EyeOff, Upload, Info, Eye, FileText, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";



const MAGIC_BYTES = new Uint8Array([0x53, 0x54, 0x45, 0x47]); // "STEG"
const PBKDF2_ITERATIONS = 100000;

// =========================================================================
// CRYPTO HELPERS
// =========================================================================
async function encryptMessage(
  message: string,
  password?: string
): Promise<{ ciphertext: Uint8Array; flag: number; salt?: Uint8Array; iv?: Uint8Array }> {
  const enc = new TextEncoder();
  const rawMessageBytes = enc.encode(message);

  if (!password) {
    return {
      ciphertext: rawMessageBytes,
      flag: 0x00
    };
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const passwordBytes = enc.encode(password);
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    passwordBytes,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["encrypt"]
  );

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as unknown as BufferSource
    },
    aesKey,
    rawMessageBytes as unknown as BufferSource
  );

  return {
    ciphertext: new Uint8Array(ciphertextBuffer),
    flag: 0x01,
    salt,
    iv
  };
}

async function decryptMessage(
  ciphertextBytes: Uint8Array,
  flag: number,
  password?: string,
  salt?: Uint8Array,
  iv?: Uint8Array
): Promise<string> {
  const dec = new TextDecoder();

  if (flag === 0x00) {
    return dec.decode(ciphertextBytes);
  }

  if (!password) {
    throw new Error("Password required to decrypt this message.");
  }
  if (!salt || !iv) {
    throw new Error("Missing key derivation parameters in payload.");
  }

  const enc = new TextEncoder();
  const passwordBytes = enc.encode(password);
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    passwordBytes,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["decrypt"]
  );

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv as unknown as BufferSource
    },
    aesKey,
    ciphertextBytes as unknown as BufferSource
  );

  return dec.decode(decryptedBuffer);
}

// =========================================================================
// BINARY PACKER/UNPACKER
// =========================================================================
function packPayload(
  messageBytes: Uint8Array,
  flag: number,
  salt?: Uint8Array,
  iv?: Uint8Array
): Uint8Array {
  const msgLen = messageBytes.length;
  const headerSize = flag === 0x01 ? 37 : 9;
  const totalSize = headerSize + msgLen;
  const packed = new Uint8Array(totalSize);

  // Magic bytes "STEG"
  packed.set(MAGIC_BYTES, 0);

  // Flag
  packed[4] = flag;

  // Length (big-endian 32-bit)
  packed[5] = (msgLen >> 24) & 0xff;
  packed[6] = (msgLen >> 16) & 0xff;
  packed[7] = (msgLen >> 8) & 0xff;
  packed[8] = msgLen & 0xff;

  if (flag === 0x01 && salt && iv) {
    packed.set(salt, 9);
    packed.set(iv, 25);
    packed.set(messageBytes, 37);
  } else {
    packed.set(messageBytes, 9);
  }

  return packed;
}

interface UnpackedInfo {
  flag: number;
  msgLen: number;
  salt?: Uint8Array;
  iv?: Uint8Array;
  headerSize: number;
}

function parseHeader(headerBytes: Uint8Array): UnpackedInfo {
  if (
    headerBytes[0] !== MAGIC_BYTES[0] ||
    headerBytes[1] !== MAGIC_BYTES[1] ||
    headerBytes[2] !== MAGIC_BYTES[2] ||
    headerBytes[3] !== MAGIC_BYTES[3]
  ) {
    throw new Error("No hidden message found in this image.");
  }

  const flag = headerBytes[4];
  if (flag !== 0x00 && flag !== 0x01) {
    throw new Error("Invalid stego headers detected.");
  }

  const msgLen =
    ((headerBytes[5] << 24) |
      (headerBytes[6] << 16) |
      (headerBytes[7] << 8) |
      headerBytes[8]) >>> 0; // force unsigned 32-bit

  if (flag === 0x01) {
    const salt = headerBytes.slice(9, 25);
    const iv = headerBytes.slice(25, 37);
    return { flag, msgLen, salt, iv, headerSize: 37 };
  } else {
    return { flag, msgLen, headerSize: 9 };
  }
}

// =========================================================================
// STEGANOGRAPHY EMBED/EXTRACT LSB MANIPULATORS
// =========================================================================
function embedPayload(imageData: ImageData, payload: Uint8Array): void {
  const data = imageData.data;
  const numPixels = imageData.width * imageData.height;
  const totalBits = payload.length * 8;

  let payloadBitIndex = 0;
  for (let i = 0; i < numPixels; i++) {
    const channels = [i * 4, i * 4 + 1, i * 4 + 2]; // R, G, B channels only (preserve A)
    for (const chIdx of channels) {
      if (payloadBitIndex >= totalBits) {
        return;
      }
      const byteIdx = Math.floor(payloadBitIndex / 8);
      const bitIdx = 7 - (payloadBitIndex % 8);
      const bit = (payload[byteIdx] >> bitIdx) & 1;

      data[chIdx] = (data[chIdx] & 0xfe) | bit;
      payloadBitIndex++;
    }
  }
}

function extractBitsFromData(
  data: Uint8ClampedArray,
  startBit: number,
  numBits: number
): Uint8Array {
  const result = new Uint8Array(Math.ceil(numBits / 8));
  let bitCounter = 0;

  for (let i = startBit; i < startBit + numBits; i++) {
    const pixelIdx = Math.floor(i / 3);
    const channelOffset = i % 3;
    const dataIdx = pixelIdx * 4 + channelOffset;

    if (dataIdx >= data.length) {
      break;
    }

    const bit = data[dataIdx] & 1;
    const targetByteIdx = Math.floor(bitCounter / 8);
    const targetBitOffset = 7 - (bitCounter % 8);

    result[targetByteIdx] |= bit << targetBitOffset;
    bitCounter++;
  }

  return result;
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================
export default function SteganographyClient() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<"encode" | "decode">("encode");

  // Encode tab states
  const [hostFile, setHostFile] = useState<File | null>(null);
  const [hostUrl, setHostUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEncoding, setIsEncoding] = useState(false);
  const [encodedUrl, setEncodedUrl] = useState<string | null>(null);
  const [capacityError, setCapacityError] = useState<string | null>(null);

  // Decode tab states
  const [stegoFile, setStegoFile] = useState<File | null>(null);
  const [stegoUrl, setStegoUrl] = useState<string | null>(null);
  const [decodePassword, setDecodePassword] = useState("");
  const [showDecodePassword, setShowDecodePassword] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  const [copiedDecode, setCopiedDecode] = useState(false);

  const encodeInputRef = useRef<HTMLInputElement>(null);
  const decodeInputRef = useRef<HTMLInputElement>(null);

  // Size helper
  const getCapacityBytes = (w: number, h: number): number => {
    return Math.floor((w * h * 3) / 8);
  };

  const [hostDimensions, setHostDimensions] = useState<{ w: number; h: number } | null>(null);

  // Calculate capacities
  const maxBytes = hostDimensions ? getCapacityBytes(hostDimensions.w, hostDimensions.h) : 0;
  const currentMsgBytes = new TextEncoder().encode(message).length;
  // Estimate headers and tag sizes
  const estimatedPayloadSize = password ? 53 + currentMsgBytes : 9 + currentMsgBytes;
  const capacityPercent = maxBytes > 0 ? (estimatedPayloadSize / maxBytes) * 100 : 0;

  // Cleanup object URLs on change
  useEffect(() => {
    if (hostFile) {
      const url = URL.createObjectURL(hostFile);
      setHostUrl(url);

      const img = new Image();
      img.onload = () => {
        setHostDimensions({ w: img.naturalWidth, h: img.naturalHeight });
      };
      img.src = url;

      return () => {
        URL.revokeObjectURL(url);
        setHostDimensions(null);
      };
    } else {
      setHostUrl(null);
      setHostDimensions(null);
    }
  }, [hostFile]);

  useEffect(() => {
    if (stegoFile) {
      const url = URL.createObjectURL(stegoFile);
      setStegoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setStegoUrl(null);
    }
  }, [stegoFile]);

  useEffect(() => {
    // Check capacity thresholds
    if (maxBytes > 0 && estimatedPayloadSize > maxBytes) {
      setCapacityError(
        `The secret payload requires ${estimatedPayloadSize} bytes, which exceeds the host image's capacity of ${maxBytes} bytes.`
      );
    } else {
      setCapacityError(null);
    }
  }, [estimatedPayloadSize, maxBytes]);

  const resetEncode = () => {
    setHostFile(null);
    setMessage("");
    setPassword("");
    setEncodedUrl(null);
    setCapacityError(null);
  };

  const resetDecode = () => {
    setStegoFile(null);
    setDecodePassword("");
    setDecodedMessage(null);
    setDecodeError(null);
  };

  // =========================================================================
  // CORE ENCODE FLOW
  // =========================================================================
  const handleEncode = async () => {
    if (!hostFile || !message) return;
    if (capacityError) {
      toast.error("Payload size exceeds host capacity.");
      return;
    }

    setIsEncoding(true);
    try {
      // 1. Encrypt if password set
      const { ciphertext, flag, salt, iv } = await encryptMessage(message, password);

      // 2. Pack payload bytes
      const payload = packPayload(ciphertext, flag, salt, iv);

      // 3. Draw image and flatten transparency to white
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = hostUrl!;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not construct 2D rendering canvas context.");

      // Flatten background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // 4. Embed steganography bits
      embedPayload(imageData, payload);
      ctx.putImageData(imageData, 0, 0);

      // 5. Convert to Blob as PNG ONLY (lossless)
      const pngBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png");
      });

      if (!pngBlob) {
        throw new Error("Could not compile PNG blob.");
      }

      if (encodedUrl) URL.revokeObjectURL(encodedUrl);
      setEncodedUrl(URL.createObjectURL(pngBlob));
      toast.success("Message embedded securely. Stego image ready!");
    } catch (err: unknown) {
      console.error("Encoding failed", err);
      toast.error("Steganography encoding process failed.");
    } finally {
      setIsEncoding(false);
    }
  };

  // =========================================================================
  // CORE DECODE FLOW
  // =========================================================================
  const handleDecode = async () => {
    if (!stegoFile) return;

    setIsDecoding(true);
    setDecodeError(null);
    setDecodedMessage(null);
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = stegoUrl!;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not construct 2D rendering canvas context.");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Extract basic header first (9 bytes = 72 bits)
      const basicHeaderBytes = extractBitsFromData(data, 0, 72);
      const tempInfo = parseHeader(basicHeaderBytes);

      // If encrypted, read the full header (37 bytes = 296 bits)
      let info = tempInfo;
      if (tempInfo.flag === 0x01) {
        const fullHeaderBytes = extractBitsFromData(data, 0, 296);
        info = parseHeader(fullHeaderBytes);
      }

      // Check stego limits
      const maxPossibleBytes = Math.floor(((data.length / 4) * 3) / 8);
      if (info.headerSize + info.msgLen > maxPossibleBytes) {
        throw new Error("Corrupted stego header: payload size exceeds image capacity.");
      }

      // Extract full payload (header + ciphertext)
      const totalBits = (info.headerSize + info.msgLen) * 8;
      const fullPayloadBytes = extractBitsFromData(data, 0, totalBits);

      // Slice out the message bytes
      const secretBytes = fullPayloadBytes.slice(info.headerSize);

      // Decrypt
      const plaintext = await decryptMessage(
        secretBytes,
        info.flag,
        decodePassword,
        info.salt,
        info.iv
      );

      setDecodedMessage(plaintext);
      toast.success("Hidden message recovered successfully!");
    } catch (err: unknown) {
      console.error("Decoding failed", err);
      // Clean display message
      const errMsg = err as Error;
      if (
        errMsg.message.includes("No hidden message found") ||
        errMsg.message.includes("Invalid stego headers")
      ) {
        setDecodeError("No hidden message found in this image.");
      } else if (errMsg.name === "OperationError" || errMsg.message.includes("Password required")) {
        setDecodeError("Wrong password or corrupted data.");
      } else {
        setDecodeError("Failed to decode steganography. Make sure this is a lossless PNG file.");
      }
      toast.error("Decoding failed.");
    } finally {
      setIsDecoding(false);
    }
  };

  const copyPlaintext = () => {
    if (!decodedMessage) return;
    navigator.clipboard.writeText(decodedMessage);
    setCopiedDecode(true);
    toast.success("Decoded message copied to clipboard!");
    setTimeout(() => setCopiedDecode(false), 2000);
  };

  const downloadStego = () => {
    if (!encodedUrl) return;
    const a = document.createElement("a");
    a.href = encodedUrl;
    // Derive name from host
    const origName = hostFile ? hostFile.name.substring(0, hostFile.name.lastIndexOf(".")) : "carrier";
    a.download = `${origName}-stego.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip">
      {/* Glow layers */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Panel */}
      <Header showBackToTools />

      <div className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-10 z-10 flex flex-col gap-6 sm:gap-10">
        {/* Intro Section */}
        <section className="text-center sm:text-left space-y-2 sm:space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-fade-in">
            <Binary className="w-3.5 h-3.5 text-primary" />
            Steganography Tool
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Hide Encrypted Messages inside Ordinary Images
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            {t("tools.steganography.intro")}
          </p>
        </section>

        {/* Tab Toggle Navigation */}
        <div className="flex justify-center sm:justify-start">
          <div className="inline-flex p-1 rounded-xl bg-secondary/80 border border-border/60">
            <button
              onClick={() => setActiveTab("encode")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
                activeTab === "encode"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Encode (Hide)
            </button>
            <button
              onClick={() => setActiveTab("decode")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
                activeTab === "decode"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              Decode (Extract)
            </button>
          </div>
        </div>

        {/* TABS CONTENT */}
        {activeTab === "encode" ? (
          /* ENCODE MODE */
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full animate-fade-in">
            {/* Input Form Column */}
            <div className="lg:col-span-2 w-full p-4 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-6">
              {/* Host image upload block */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                  Host Carrier Image
                </span>
                {!hostFile ? (
                  <div
                    onClick={() => encodeInputRef.current?.click()}
                    className="border-2 border-dashed border-border/60 hover:border-primary/40 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2.5 cursor-pointer bg-secondary/10 hover:bg-secondary/20 transition-all duration-200"
                  >
                    <Upload className="w-9 h-9 text-muted-foreground/40" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Click to upload host image</p>
                      <p className="text-[10.5px] text-muted-foreground mt-0.5">Supports PNG, JPEG, WebP, GIF, BMP, etc.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 bg-secondary/40 border border-border/80 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-canvas border border-border/50 overflow-hidden flex items-center justify-center">
                        <img src={hostUrl!} alt="Host thumbnail" className="object-cover w-full h-full" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-[320px]">{hostFile.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {hostDimensions ? `${hostDimensions.w} × ${hostDimensions.h} px · ` : ""}
                          {(hostFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={resetEncode}
                      className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-3 rounded-lg gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear
                    </Button>
                  </div>
                )}
                <input
                  type="file"
                  ref={encodeInputRef}
                  accept="image/*"
                  onChange={(e) => e.target.files && setHostFile(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {/* Secret message field */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-muted-foreground uppercase">
                  Secret Text Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter the secret message you want to hide..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-secondary border border-border/80 focus:border-primary/50 text-foreground text-sm rounded-xl p-3 outline-none transition-all resize-y"
                />
              </div>

              {/* Password option */}
              <div className="space-y-2 border-t border-border/40 pt-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold text-muted-foreground uppercase flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    AES-GCM Encryption Password (Optional)
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password to encrypt message..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-secondary border border-border/80 focus:border-primary/50 text-foreground text-sm rounded-xl h-10 pl-3 pr-10 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  {t("tools.steganography.passwordHelp")}
                </p>
              </div>

              {/* Capacity meter */}
              {hostFile && hostDimensions && (
                <div className="pt-4 border-t border-border/40 space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                      Stego Capacity Utilized
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                        capacityError
                          ? "bg-destructive/15 text-destructive border-destructive/20"
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}
                    >
                      {estimatedPayloadSize.toLocaleString()} / {maxBytes.toLocaleString()} bytes
                    </span>
                  </div>

                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden border border-border/40">
                    <div
                      className={`h-full transition-all duration-300 ${
                        capacityError ? "bg-destructive animate-pulse" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                    />
                  </div>

                  {capacityError ? (
                    <div className="p-3.5 bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2.5 text-destructive text-[11px] leading-normal animate-shake">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>{capacityError}</p>
                    </div>
                  ) : (
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Payload bytes: {estimatedPayloadSize}</span>
                      <span>Usage: {capacityPercent.toFixed(2)}%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Hide Action */}
              <Button
                onClick={handleEncode}
                disabled={isEncoding || !hostFile || !message || !!capacityError}
                className="w-full h-11 text-sm font-extrabold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md active:scale-[0.98] transition-all gap-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isEncoding ? (
                  <>
                    <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full" />
                    Embedding secret payload...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Hide Message inside Image
                  </>
                )}
              </Button>
            </div>

            {/* Visual Previews and downloads column */}
            <div className="lg:col-span-1 p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Binary className="w-3.5 h-3.5" />
                  Stego Output
                </span>
                {encodedUrl && (
                  <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border uppercase">
                    PNG Only
                  </span>
                )}
              </div>

              {!encodedUrl ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/40 rounded-xl text-center gap-2 min-h-[260px]">
                  <Binary className="w-10 h-10 text-muted-foreground/30" />
                  <span className="text-xs font-semibold text-muted-foreground">Output Ready After Encoding</span>
                  <span className="text-[10px] text-muted-foreground/60 leading-normal max-w-[180px]">
                    Hide a text message first to trigger visual rendering previews.
                  </span>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4 justify-between animate-fade-in">
                  <div className="space-y-4">
                    {/* Confirmed decode notice */}
                    <div className="p-3 bg-success/5 dark:bg-success/10 border border-success/20 rounded-xl flex items-center gap-2 text-success font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Payload embedded successfully
                    </div>

                    {/* Stego output preview */}
                    <div
                      className="relative bg-canvas rounded-xl p-4 flex flex-col items-center justify-center aspect-square border border-border/50 overflow-hidden shadow-inner"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "repeat",
                      }}
                    >
                      <img src={encodedUrl} alt="Stego Output Preview" className="object-contain w-full h-full rounded-md" />
                    </div>

                    {/* Security note warnings */}
                    <div className="p-3 bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 text-destructive text-[10px] leading-normal font-medium">
                      <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                      <p>
                        <strong>WARNING: Lossless files only.</strong> Dynamic resizing or lossy chat compresses (like WhatsApp, Instagram) overrides LSB pixels and corrupts the payload. Deliver this image strictly as an <strong>uncompressed File/Document attachment</strong>.
                      </p>
                    </div>

                    <div className="p-3 bg-secondary/50 rounded-xl border border-border/60 text-[10px] text-muted-foreground leading-normal flex items-start gap-2">
                      <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p>
                        Stego carrier is visually identical to the original image. Steganalysis tools or statistical byte inspections can still detect LSB perturbations.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={downloadStego}
                    className="w-full py-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md h-11 gap-1.5 flex items-center justify-center"
                  >
                    <Download className="w-4.5 h-4.5" />
                    Download Stego PNG
                  </Button>
                </div>
              )}
            </div>
          </section>
        ) : (
          /* DECODE MODE */
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full animate-fade-in">
            {/* Upload carrier panel */}
            <div className="lg:col-span-2 w-full p-4 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                  Carrier Stego Image (PNG)
                </span>
                {!stegoFile ? (
                  <div
                    onClick={() => decodeInputRef.current?.click()}
                    className="border-2 border-dashed border-border/60 hover:border-primary/40 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2.5 cursor-pointer bg-secondary/10 hover:bg-secondary/20 transition-all duration-200"
                  >
                    <Upload className="w-9 h-9 text-muted-foreground/40" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Click to upload stego image</p>
                      <p className="text-[10.5px] text-muted-foreground mt-0.5">Please upload lossless PNG files only</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 bg-secondary/40 border border-border/80 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-canvas border border-border/50 overflow-hidden flex items-center justify-center">
                        <img src={stegoUrl!} alt="Stego thumbnail" className="object-cover w-full h-full" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-[320px]">{stegoFile.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {(stegoFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={resetDecode}
                      className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-3 rounded-lg gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear
                    </Button>
                  </div>
                )}
                <input
                  type="file"
                  ref={decodeInputRef}
                  accept="image/*"
                  onChange={(e) => e.target.files && setStegoFile(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {/* Password configuration */}
              <div className="space-y-2 border-t border-border/40 pt-4">
                <label className="text-xs font-extrabold text-muted-foreground uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Decryption Password (If Encrypted)
                </label>
                <div className="relative">
                  <input
                    type={showDecodePassword ? "text" : "password"}
                    placeholder="Enter decryption password..."
                    value={decodePassword}
                    onChange={(e) => setDecodePassword(e.target.value)}
                    className="w-full bg-secondary border border-border/80 focus:border-primary/50 text-foreground text-sm rounded-xl h-10 pl-3 pr-10 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDecodePassword(!showDecodePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title={showDecodePassword ? "Hide password" : "Show password"}
                    aria-label={showDecodePassword ? "Hide password" : "Show password"}
                  >
                    {showDecodePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleDecode}
                disabled={isDecoding || !stegoFile}
                className="w-full h-11 text-sm font-extrabold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md active:scale-[0.98] transition-all gap-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isDecoding ? (
                  <>
                    <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full" />
                    Extracting payload...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    Extract Hidden Message
                  </>
                )}
              </Button>
            </div>

            {/* Results preview panel */}
            <div className="lg:col-span-1 p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-4 min-h-[300px]">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Recovered Plaintext
                </span>
              </div>

              {decodeError && (
                <div className="p-4 bg-destructive/5 border border-destructive/15 text-destructive rounded-xl text-xs flex gap-2 animate-shake flex-1 items-start">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-left">
                    <p className="font-extrabold">Extraction failed</p>
                    <p className="text-muted-foreground leading-normal">{decodeError}</p>
                  </div>
                </div>
              )}

              {!decodedMessage && !decodeError ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/40 rounded-xl text-center gap-2 min-h-[260px]">
                  <FileText className="w-10 h-10 text-muted-foreground/30" />
                  <span className="text-xs font-semibold text-muted-foreground">Extraction Idle</span>
                  <span className="text-[10px] text-muted-foreground/60 leading-normal max-w-[180px]">
                    Hidden parameters will reveal here immediately after processing.
                  </span>
                </div>
              ) : decodedMessage ? (
                <div className="flex-1 flex flex-col gap-4 justify-between animate-fade-in">
                  <div className="space-y-4">
                    <div className="p-3 bg-success/5 dark:bg-success/10 border border-success/20 rounded-xl flex items-center gap-2 text-success font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Plaintext recovered successfully
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Secret Message</span>
                      <div className="p-3 border border-border/80 bg-secondary/40 font-mono text-[10.5px] rounded-lg break-all select-all max-h-[220px] overflow-y-auto custom-scrollbar font-bold">
                        {decodedMessage}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={copyPlaintext}
                    className="w-full text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md h-10 gap-1.5 flex items-center justify-center"
                  >
                    {copiedDecode ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    Copy Message Text
                  </Button>
                </div>
              ) : null}
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
              Embed and extract encrypted secrets inside image files in four steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Upload host",
                text: t("tools.steganography.howItWorks.step1"),
              },
              {
                step: "02",
                title: "Encrypt & Pack",
                text: t("tools.steganography.howItWorks.step2"),
              },
              {
                step: "03",
                title: "LSB Embedding",
                text: t("tools.steganography.howItWorks.step3"),
              },
              {
                step: "04",
                title: "PNG Lossless",
                text: t("tools.steganography.howItWorks.step4"),
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
                q: t("tools.steganography.faq.q1"),
                a: t("tools.steganography.faq.a1"),
              },
              {
                q: t("tools.steganography.faq.q2"),
                a: t("tools.steganography.faq.a2"),
              },
              {
                q: t("tools.steganography.faq.q3"),
                a: t("tools.steganography.faq.a3"),
              },
              {
                q: t("tools.steganography.faq.q4"),
                a: t("tools.steganography.faq.a4"),
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
            {t("tools.steganography.privacyNotice")}
          </p>
        </PrivacyNotice>
      </div>
    </main>
  );
}
