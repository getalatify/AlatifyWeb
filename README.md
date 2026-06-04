# Alatify

Alatify is a privacy-first web application featuring premium image processing tools that run entirely inside your browser. No files are ever uploaded to a server, ensuring 100% data security and confidentiality.

## Key Features

- **100% Client-Side Processing**: Background removal, compression, cropping, and dropzone uploads run completely in the user's browser.
- **Privacy First**: Zero server-side interaction for image processing. Your data never leaves your device.
- **Sleek Modern UI**: Custom visual elements built with shadcn/ui and fully responsive Tailwind CSS layouts.
- **Dark Mode Support**: Class-based, native dark mode built seamlessly into the color palette.

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS & shadcn/ui
- **State Management**: Zustand
- **Image Operations**:
  - Background removal: `@imgly/background-removal`
  - Compression: `browser-image-compression`
  - Cropping: `react-image-crop`
  - Uploads: `react-dropzone`
- **Iconography**: Lucide React

## Getting Started

First, install the dependencies:

```bash
npm install
```

Next, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
