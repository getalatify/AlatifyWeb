// lib/tools/registry.ts
//
// SINGLE SOURCE OF TRUTH for every tool on Alatify.
// Powers: internal search engine, /tools hub, sitemap derivation, Related Tools.
//
// RULES:
// - `route` MUST match an existing folder under app/tools/. Do NOT invent routes.
// - `keywords` power INTERNAL search only. They are NOT rendered into the DOM as
//   hidden text (that would be keyword stuffing — Google penalizes it).
// - English is canonical (matches the i18n decision). Keywords carry English + Bahasa
//   Indonesia because a large share of users search in Indonesian.
// - Search builder MUST dedupe keywords at load time (some EN/ID terms overlap).
// - To add a tool: append an entry here. Nothing else should hardcode the tool list.

export type ToolCategory = "image" | "privacy" | "document" | "utility";

export interface ToolEntry {
  id: string;                 // stable unique slug
  name: string;               // display name (English canonical)
  route: string;              // must match an existing app/tools/* route
  category: ToolCategory;
  description: string;        // one line, shown in search results & hub
  keywords: string[];         // internal-search match terms (lowercase, many)
}

export const TOOLS: ToolEntry[] = [
  {
    id: "bg-remover",
    name: "Background Remover",
    route: "/tools/bg-remover",
    category: "image",
    description: "Remove or erase the background from any image, fully on-device.",
    keywords: [
      // === ENGLISH ===
      "remove background", "background remover", "bg remover", "remove bg",
      "delete background", "erase background", "background eraser",
      "transparent background", "make transparent", "png transparent",
      "cut out", "cutout", "isolate subject", "remove white background",
      "clear background", "product photo background", "background removal",
      "extract foreground", "subject isolation", "transparent png maker",
      // === BAHASA INDONESIA ===
      "hapus background", "penghapus latar belakang", "hapus latar belakang",
      "buat background transparan", "png tanpa background", "cut out gambar",
      "isolasi objek", "potong background", "hapus bg foto", "buat transparan",
      "foto tanpa latar", "background eraser gratis",
    ],
  },
  {
    id: "upscaler",
    name: "AI Upscaler",
    route: "/tools/upscaler",
    category: "image",
    description: "Upscale and enhance photos to higher resolution with AI, on-device.",
    keywords: [
      // === ENGLISH ===
      "upscale", "image upscaler", "ai upscaler", "photo upscaler",
      "enlarge image", "increase resolution", "super resolution",
      "enhance photo", "photo enhancer", "improve image quality",
      "make image bigger", "upscale photo", "hd", "4k upscale",
      "resize without losing quality", "increase image size", "sharpen image",
      "ai image upscaler", "4k photo enhancer", "upscale without quality loss",
      // === BAHASA INDONESIA ===
      "perbesar gambar", "perbesar gambar ai", "upscaler ai", "tingkatkan resolusi",
      "tingkatkan resolusi foto", "enhance foto", "foto hd", "foto 4k",
      "pertajam gambar", "besarkan foto", "perbesar tanpa hilang kualitas",
      "enhance gambar ai",
    ],
  },
  {
    id: "watermark",
    name: "Watermark",
    route: "/tools/watermark",
    category: "image",
    description: "Add text or logo watermarks to images, including tiled and batch.",
    keywords: [
      // === ENGLISH ===
      "watermark", "add watermark", "image watermark", "logo watermark",
      "text watermark", "tiled watermark", "batch watermark", "stamp image",
      "protect image", "copyright image", "brand image", "signature on image",
      "add text watermark", "diagonal watermark", "opacity watermark",
      "batch add watermark", "protect copyright", "brand your images",
      // === BAHASA INDONESIA ===
      "tambah watermark", "watermark gambar", "cap air gambar", "tanda air",
      "logo di gambar", "teks watermark", "watermark batch", "watermark tile",
      "proteksi gambar", "copyright gambar", "tanda air diagonal", "watermark logo",
      "cap air foto", "proteksi copyright", "brand gambar",
    ],
  },
  {
    id: "compressor",
    name: "Image Compressor",
    route: "/tools/compressor",
    category: "image",
    description: "Compress images to reduce file size without leaving your device.",
    keywords: [
      // === ENGLISH ===
      "compress image", "image compressor", "reduce file size", "shrink image",
      "make image smaller", "optimize image", "image optimizer", "minify image",
      "compress jpg", "compress png", "compress jpeg", "reduce image size",
      "lighten image", "smaller photo", "compress photo", "jpg compressor",
      "png compressor", "lossless compress", "optimize for web", "image size reducer",
      // === BAHASA INDONESIA ===
      "kompres gambar", "perkecil ukuran foto", "kompresi jpg", "kurangi ukuran gambar",
      "optimize gambar", "foto lebih kecil", "kompres tanpa hilang kualitas",
      "perkecil foto", "kompres png", "kurangi size foto", "optimize ukuran gambar",
    ],
  },
  {
    id: "converter",
    name: "Format Converter",
    route: "/tools/converter",
    category: "image",
    description: "Convert images between 9 formats including JPG, PNG, WebP, and PDF.",
    keywords: [
      // === ENGLISH ===
      "convert image", "image converter", "format converter", "file converter",
      "jpg to png", "png to jpg", "convert to webp", "webp converter",
      "heic to jpg", "image to pdf", "png to pdf", "change image format",
      "convert jpeg", "bmp", "ico", "gif", "tiff", "svg converter",
      "image format changer", "heic converter", "webp to jpg", "batch convert image",
      // === BAHASA INDONESIA ===
      "konversi gambar", "ubah format foto", "jpg ke png", "png ke jpg",
      "heic ke jpg", "gambar ke pdf", "konverter webp", "ubah jpg ke png",
      "konversi format gambar", "png ke pdf", "webp ke jpg", "ubah ke webp",
      "konversi heic", "gambar ke format lain",
    ],
  },
  {
    id: "cropper",
    name: "Image Cropper",
    route: "/tools/cropper",
    category: "image",
    description: "Crop and trim images freely or to a fixed aspect ratio.",
    keywords: [
      // === ENGLISH ===
      "crop image", "image cropper", "photo cropper", "cut image", "trim image",
      "crop photo", "free crop", "aspect ratio crop", "square crop",
      "crop jpg", "crop png", "crop to size", "freeform crop",
      "aspect ratio cropper", "square cropper", "image trimmer", "center crop",
      // === BAHASA INDONESIA ===
      "potong gambar", "crop foto", "potong foto", "potong sesuai rasio",
      "trim foto", "potong persegi", "crop rasio", "potong gambar bebas",
      "potong jpg", "potong png",
    ],
  },
  {
    id: "resizer",
    name: "Image Resizer",
    route: "/tools/resizer",
    category: "image",
    description: "Resize images by pixels or scale, single or batch.",
    keywords: [
      // === ENGLISH ===
      "resize image", "image resizer", "photo resizer", "change image size",
      "scale image", "change dimensions", "resize jpg", "resize png",
      "pixel resize", "resize for social media", "image dimensions",
      "shrink or enlarge image", "batch resize", "resize by pixels",
      "thumbnail maker", "pixel perfect resize",
      // === BAHASA INDONESIA ===
      "ubah ukuran gambar", "resize foto", "perkecil foto", "perbesar foto",
      "scale gambar", "ukuran pixel", "resize untuk sosmed", "ubah dimensi gambar",
      "perkecil gambar", "besarkan gambar", "resize batch", "ubah size foto",
    ],
  },
  {
    id: "exif-cleaner",
    name: "EXIF Privacy Cleaner",
    route: "/tools/exif-cleaner",
    category: "privacy",
    description: "View and strip EXIF metadata and GPS location from photos.",
    keywords: [
      // === ENGLISH ===
      "exif", "remove exif", "exif cleaner", "strip metadata", "remove metadata",
      "metadata remover", "scrub metadata", "clear gps", "remove gps from photo",
      "remove location from photo", "photo metadata", "delete exif data",
      "remove camera info", "image privacy", "strip gps data",
      "photo privacy tool", "clean image metadata",
      // === BAHASA INDONESIA ===
      "hapus exif", "bersihkan metadata foto", "hapus data gps", "hapus lokasi foto",
      "privasi gambar", "hapus info kamera", "exif remover", "hapus metadata foto",
      "bersihkan exif", "privasi foto", "hapus data kamera", "metadata cleaner",
    ],
  },
  {
    id: "id-protector",
    name: "ID Privacy Shield",
    route: "/tools/id-protector",
    category: "privacy",
    description: "Redact and black out sensitive info on ID cards and documents.",
    keywords: [
      // === ENGLISH ===
      "redact", "redact id", "redact document", "blur id card", "censor document",
      "black out text", "hide personal info", "hide id number", "mask information",
      "cover personal data", "ktp", "id card protector", "passport redact",
      "document privacy", "blur sensitive info", "censor id document",
      "black out sensitive info", "hide personal details",
      // === BAHASA INDONESIA ===
      "redaksi ktp", "sensor ktp", "blur ktp", "hitamkan data ktp",
      "sembunyikan nomor ktp", "redact dokumen", "privasi ktp",
      "hapus info pribadi dokumen", "sensor dokumen", "blackout ktp",
      "redaksi dokumen", "blur data sensitif",
    ],
  },
  {
    id: "blur",
    name: "Blur & Redact",
    route: "/tools/blur", // confirm folder is `blur` under app/tools/
    category: "privacy",
    description: "Blur, pixelate, or redact any part of an image, on-device.",
    keywords: [
      // === ENGLISH ===
      "blur image", "blur photo", "blur part of image", "blur out",
      "blur face", "pixelate", "pixelate image", "pixelate face",
      "censor image", "censor photo", "redact image", "hide part of image",
      "obscure area", "mask area", "blur text in image", "blur sensitive area",
      "blur tool", "pixelate tool", "redact area", "censor face", "mosaic effect",
      // === BAHASA INDONESIA ===
      "blur gambar", "buramkan foto", "pixelate wajah", "sensor wajah",
      "kaburkan area", "redaksi foto", "blur bagian gambar", "efek mosaic",
      "sensor gambar", "kaburkan wajah", "pixelate foto", "blur teks di gambar",
      "sensor area sensitif", "buramkan bagian foto",
    ],
  },
  {
    id: "qr-toolkit",
    name: "QR Toolkit",
    route: "/tools/qr-toolkit",
    category: "utility",
    description: "Generate and read QR codes, including URL and Wi-Fi codes.",
    keywords: [
      // === ENGLISH ===
      "qr code", "qr generator", "create qr", "generate qr", "qr code maker",
      "make qr code", "qr reader", "qr scanner", "scan qr", "read qr code",
      "qr decoder", "url to qr", "wifi qr", "qr toolkit", "qr code generator",
      "qr code scanner",
      // === BAHASA INDONESIA ===
      "buat qr code", "generator qr", "scan qr code", "baca qr", "qr wifi",
      "qr url", "decoder qr", "kode qr maker", "buat kode qr", "baca kode qr",
      "qr code gratis", "generator qr code", "wifi qr code",
    ],
  },
  {
    id: "steganography",
    name: "Steganography",
    route: "/tools/steganography",
    category: "privacy",
    description: "Hide secret messages inside images and decode them back.",
    keywords: [
      // === ENGLISH ===
      "steganography", "image steganography", "hide message in image",
      "hide text in picture", "hidden text", "hidden message", "secret message",
      "secret image", "encode message", "decode hidden message", "conceal text",
      "hide data in photo", "secret message encoder", "decode steganography",
      "conceal data in photo", "stego tool",
      // === BAHASA INDONESIA ===
      "sembunyikan pesan di gambar", "steganografi", "pesan rahasia foto",
      "encode pesan gambar", "sembunyikan data di foto", "steganografi gambar",
      "pesan tersembunyi", "sembunyikan teks di foto", "encode steganografi",
      "decode steganografi",
    ],
  },
  {
    id: "stock-finder",
    name: "Stock Image Finder",
    route: "/tools/stock-finder",
    category: "utility",
    description: "Search free stock photos, illustrations, and vectors in one place.",
    keywords: [
      // === ENGLISH ===
      "stock photos", "free images", "free stock photos", "royalty free",
      "stock image finder", "search images", "download free images",
      "no copyright images", "unsplash", "pexels", "pixabay", "illustrations",
      "vectors", "free photos", "stock photo search", "royalty free photos",
      "public domain images", "creative commons photos",
      // === BAHASA INDONESIA ===
      "cari gambar gratis", "stock photo gratis", "gambar bebas copyright",
      "download foto gratis", "ilustrasi gratis", "vektor gratis", "gambar stok",
      "foto royalty free", "cari gambar unsplash", "foto bebas hak cipta",
      "download gambar gratis", "stock image gratis",
    ],
  },
  {
    id: "markdown-to-pdf",
    name: "Markdown to PDF",
    route: "/tools/markdown-to-pdf",
    category: "document",
    description: "Convert Markdown into a clean PDF with real selectable text.",
    keywords: [
      // === ENGLISH ===
      "markdown to pdf", "md to pdf", ".md to pdf", "convert markdown",
      "markdown converter", "markdown pdf", "export markdown", "markdown export",
      "readme to pdf", "markdown to document", "document converter",
      "md to pdf converter", "convert readme to pdf",
      // === BAHASA INDONESIA ===
      "markdown ke pdf", "md ke pdf", "konversi markdown ke pdf",
      "export markdown pdf", "readme ke pdf", "konverter md ke pdf",
      "ubah markdown ke pdf", "export readme ke pdf",
    ],
  },

  {
    id: "pdf-to-markdown",
    name: "PDF to Markdown",
    route: "/tools/pdf-to-markdown",
    category: "document",
    description: "Extract text from a PDF into clean Markdown, on-device.",
    keywords: [
      // === ENGLISH ===
      "pdf to markdown", "pdf to md", "convert pdf to markdown", "pdf converter",
      "extract text from pdf", "pdf to text", "pdf to readme", "markdown from pdf",
      "pdf extract", "pdf text extractor",
      // === BAHASA INDONESIA ===
      "pdf ke markdown", "pdf ke md", "konversi pdf ke markdown", "ekstrak teks pdf",
      "pdf ke teks", "ambil teks dari pdf", "konverter pdf",
    ],
  },
  {
    id: "pdf-pages",
    name: "PDF Page Tools",
    route: "/tools/pdf-pages",
    category: "document",
    description: "Merge, split, reorder, rotate, and delete PDF pages on-device.",
    keywords: [
      // === ENGLISH ===
      "merge pdf", "combine pdf", "pdf merger", "split pdf", "pdf splitter",
      "reorder pdf", "rearrange pdf", "rotate pdf", "delete pdf page",
      "remove page from pdf", "extract pages", "organize pdf", "pdf page editor",
      // === BAHASA INDONESIA ===
      "gabung pdf", "gabungkan pdf", "pisah pdf", "split pdf", "urutkan pdf",
      "putar halaman pdf", "hapus halaman pdf", "ambil halaman pdf",
      "atur halaman pdf", "edit halaman pdf",
    ],
  },
  {
    id: "pdf-to-image",
    name: "PDF to Image Converter",
    route: "/tools/pdf-to-image",
    category: "document",
    description: "Convert PDF pages into high-quality JPG or PNG images on-device.",
    keywords: [
      // === ENGLISH ===
      "pdf to image", "pdf to png", "pdf to jpg", "pdf to jpeg", "extract pdf pages",
      "convert pdf to image", "save pdf as image", "rasterize pdf", "pdf page extractor",
      // === BAHASA INDONESIA ===
      "pdf ke gambar", "pdf ke png", "pdf ke jpg", "ekstrak halaman pdf",
      "ubah pdf ke gambar", "simpan pdf sebagai gambar", "konversi pdf ke png"
    ],
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    route: "/tools/image-to-pdf",
    category: "document",
    description: "Combine multiple PNG, JPG, or WebP images into a single PDF, on-device.",
    keywords: [
      // === ENGLISH ===
      "image to pdf", "jpg to pdf", "png to pdf", "webp to pdf", "combine images to pdf",
      "merge images to pdf", "compile images to pdf", "images to pdf converter",
      // === BAHASA INDONESIA ===
      "gambar ke pdf", "jpg ke pdf", "png ke pdf", "webp ke pdf", "gabungkan gambar ke pdf",
      "konversi gambar ke pdf", "buat pdf dari gambar"
    ],
  },
];

