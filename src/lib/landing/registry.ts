export interface LandingPage {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  targetToolPath: string; // e.g. "/tools/exif-cleaner"
}

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: "remove-exif-metadata-online",
    metaTitle: "Remove EXIF & GPS Metadata From Photos Online (No Upload): Alatify",
    metaDescription: "Strip EXIF, GPS location, and camera data from your photos right in your browser. Nothing is uploaded. Your files never leave your device. Free, no sign-up.",
    targetToolPath: "/tools/exif-cleaner",
  },
  {
    slug: "remove-background-without-uploading",
    metaTitle: "Remove Background Without Uploading: Free & Private | Alatify",
    metaDescription: "Cut out image backgrounds entirely in your browser. Your photo is never uploaded to a server. The AI runs on your own device. Free, unlimited, no sign-up.",
    targetToolPath: "/tools/bg-remover",
  },
  {
    slug: "blur-face-in-photo-without-uploading",
    metaTitle: "Blur Faces in Photos Without Uploading (Free, Private) | Alatify",
    metaDescription: "Blur faces, license plates, or documents in your photos entirely in-browser. Nothing is uploaded. Your images never leave your device. Free, no sign-up.",
    targetToolPath: "/tools/blur",
  },
];
