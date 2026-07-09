import React from "react";
import { 
  ArrowDown,
  Sparkles, 
  Minimize2, 
  Scissors, 
  RefreshCw, 
  Crop,
  Shield,
  Search,
  EyeOff,
  Type,
  Binary,
  QrCode,
  FileText,
  FileCode,
  FileImage,
  Files,
  Code2,
  Wrench
} from "lucide-react";

export const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "bg-remover": Scissors,
  "upscaler": Sparkles,
  "watermark": Type,
  "compressor": ArrowDown,
  "resizer": Minimize2,
  "converter": RefreshCw,
  "cropper": Crop,
  "exif-cleaner": Shield,
  "id-protector": EyeOff,
  "blur": EyeOff,
  "steganography": Binary,
  "qr-toolkit": QrCode,
  "stock-finder": Search,
  "html-to-markdown": FileCode,
  "markdown-to-pdf": FileText,
  "pdf-to-markdown": FileText,
  "pdf-pages": FileText,
  "pdf-to-image": FileImage,
  "image-to-pdf": Files,
  "code-to-image": Code2,
};

export const FALLBACK_TOOL_ICON = Wrench;
