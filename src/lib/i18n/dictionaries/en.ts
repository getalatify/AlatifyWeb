export const en = {
  home: {
    hero: {
      tagline: "Privacy-first image tools that run entirely in your browser",
    },
    features: {
      card1: {
        text: "All algorithms execute locally inside your sandboxed browser tab. No server holds your files.",
      },
      card2: {
        text: "Skip upload waits entirely. Process high-resolution images right on your device.",
      },
    },
  },
  about: {
    intro: "Image tools should respect your privacy.",
    why: {
      p1: "Most online image tools require uploading your files to their servers. That means your images, possibly containing personal moments, business assets, or sensitive content, pass through someone else's infrastructure.",
      p2: "Alatify is different: every tool runs entirely in your browser, using your own device's resources. Your files never leave your device. We believe in providing fast, powerful, and absolutely private utilities that respect user autonomy.",
    },
    offer: {
      li1: "A full browser suite, Background Remover, Image Compressor, Format Converter, Resizer, Cropper, EXIF Cleaner, Watermark, QR Toolkit, and more, all running locally in your browser.",
      li2: "No user registration, no server-side uploads, and no analytics cookies.",
      li3: "Process files of any size without registration, credit cards, or hidden limits.",
      li4: "Transparent, offline-capable code execution using standard web containers.",
    },
    who: {
      p1: "Alatify was designed and built by an independent developer in Indonesia. Driven by a passion for privacy-first tech and clean user experiences, the platform is crafted to prove that browser-based applications can achieve professional-grade capabilities without compromising user privacy.",
      p2: "Our tech stack features Next.js, WebAssembly, and Tailwind CSS, with hosting and static asset delivery provided by Vercel. If you find Alatify useful, please share it with others who value privacy!",
    },
    road: {
      p1: "Alatify is built to keep growing. The suite now spans background removal, compression, format conversion, resizing, cropping, EXIF cleaning, watermarking, and AI upscaling, all running locally in your browser, with new privacy-first tools added over time.",
      p2_start:
        "Your feedback is invaluable. If you have suggestions, feature requests, or bugs to report, reach out to us at",
      p2_end: ".",
    },
  },
  privacy: {
    short:
      "Alatify doesn't collect, store, or transmit your images or personal data. All processing happens entirely in your browser. There's no account registration, no user tracking, and no third-party analytics.",
    collect: {
      p1: "Because Alatify is engineered to run 100% locally on your computer, we do not access or collect any of the following items:",
      li1: "Your files never upload to any remote server. They are parsed and modified locally in your browser sandbox.",
      li2: "We don't log your connection parameters.",
      li3: "We do not monitor how often you use our tools or what settings you apply.",
      li4: "We don't use tracking code, third-party cookies, or browser fingerprinting.",
      li5: "No names, email addresses, payment credentials, or accounts are required.",
    },
    do: {
      p1: "To provide our image processing utilities without server overhead, Alatify operates on these principles:",
      li1: "We compile tools utilizing WebAssembly and client-side JavaScript. All computations are executed inside your browser thread using your local hardware resources.",
      li2: "AI models (such as the Background Remover engine weights) are downloaded into your browser cache once. They are stored locally on your device for repeat usage and are never transmitted.",
      li3: "Our web assets (HTML, CSS, JS) are served as static files via global Content Delivery Networks (CDNs) for high availability.",
    },
    thirdParty: {
      p1: "We minimize third-party connections. The only external services involved are standard web host providers required to display this page:",
      li1: "Our platform is hosted on Vercel. Vercel automatically processes standard web server logs (which contain anonymous headers) to serve static resources and protect against DDoS events.",
      li2: "The neural network models utilized in background removal are downloaded directly to your browser from imgly CDN hosts. Once downloaded, they run locally.",
      li3: "We deliberately exclude Google Analytics, Facebook Pixel, Mixpanel, Hotjar, or any other tracking tools.",
    },
    rights: {
      p1: "Under GDPR, CCPA, and global privacy standards, your rights are automatically respected:",
      li1: "You do not need to request deletion of your data because we never collected it.",
      li2: "You can completely remove cached neural weights and model data by clearing your browser cache.",
      li3: "Since there is zero data collection or tracking, there is no need for cookie banners, opt-out forms, or privacy preference centers.",
    },
    contact: {
      start: "Have questions about our local-first architecture? Contact us at",
      end: "",
    },
  },
  terms: {
    short:
      'Use Alatify freely for personal or commercial purposes. We provide these browser-based tools "as-is" without warranties. You remain fully responsible for the images you process, and you must not use Alatify to handle illegal content.',
    license: {
      p1: "We grant you a permissive, royalty-free license to use Alatify under the following terms:",
      li1: "You are free to modify and export images for commercial products, personal designs, social media branding, or print publications.",
      li2: "You are not required to credit Alatify or link back to our service in your finished works.",
      li3: "There are no processing rate limits, upload caps, or account walls since all processes are powered by your own local device.",
    },
    user: {
      p1: "Because Alatify is local-only, we do not monitor or restrict what images you import. However, by using the service, you agree to the following responsibilities:",
      li1: "You verify that you own or have appropriate licensing rights to the images you import and modify.",
      li2: "You must not use Alatify to process illegal, abusive, or harmful material, including copyrighted assets without permission, or other illegal material.",
      li3: "You accept responsibility for ensuring your device has adequate CPU and RAM resources to run heavy WebAssembly computations safely.",
    },
    disclaimer: {
      p1: "Please review the standard limitations of liability that govern our browser-based service:",
      li1: "Alatify is provided without warranties of any kind, express or implied. We do not guarantee continuous availability, compatibility with all file formats, or error-free rendering.",
      li2: "Because your image files are processed on the fly and never stored on any servers, we cannot recover lost configurations or edits. We are not liable for any data loss.",
      li3: "Output results (compression, resizing, formatting) are approximations. Verify all output parameters and file integrity before deploying images to production.",
    },
    changes:
      "These terms may change periodically. The latest and governing terms of service will always be accessible on this page. Your continued use of Alatify after amendments are posted constitutes acceptance of those updated terms.",
    contact: {
      start: "Have questions about our terms of service? Contact us at",
      end: "",
    },
  },
  shared: {
    privacyNotice: {
      body: "Alatify processes your graphics files completely locally using sandbox APIs inside your browser tab. We never upload any of your files or private coordinates to external clouds, making the tool 100% immune to leaks or server-side data retention.",
    },
    related: {
      blur: "Obscure faces, plates, and info locally.",
      "exif-cleaner-metadata": "Strip GPS location and camera metadata.",
      "exif-cleaner-gps": "Strip GPS & metadata before sharing.",
      "exif-cleaner-tags": "Strip metadata and GPS tags.",
      "exif-cleaner-info":
        "Strip location and camera info from photos locally.",
      "bg-remover": "Extract subjects locally in your browser.",
      "bg-remover-backdrops": "Extract subjects and remove backdrops locally.",
      upscaler: "Enlarge photos 2x & 4x on-device.",
      "compressor-savings":
        "Reduce file sizes by up to 90% while keeping quality.",
      "compressor-offline": "Reduce image file sizes by up to 90% offline.",
      "resizer-dimensions": "Resize image dimensions by percentage or pixels.",
      "resizer-pixels": "Resize dimensions by pixels, ratio, or percent.",
      "converter-formats":
        "Convert files between JPG, PNG, WebP, PDF, and vectors.",
      "converter-instantly": "Convert between PNG, JPEG, and WebP instantly.",
      watermark: "Add custom text or image watermarks.",
    },
  },
  tools: {
    compressor: {
      intro:
        "Reduce image file sizes with full control. Choose lossy compression for the smallest size, or lossless to preserve every single pixel, running entirely in your browser without uploads.",
      hintBubble:
        "Tip: for the smallest files, export photos as JPEG. Choose PNG when you need transparency.",
      alreadyOptimised:
        "Already optimized, this file can't be shrunk further.",
      losslessConvertDisabled:
        "Lossless is only available when recompressing an original PNG.",
      pngLargerNudge:
        "Converting to PNG made this file larger. For a smaller file, try WebP or JPEG instead.",
      howItWorks: {
        step1: "Add one or many images.",
        step2: "Choose lossy or lossless, and set your quality target.",
        step3: "Shrink them instantly, on your device.",
        step4: "Save the smaller files individually or as a ZIP.",
      },
      useCases: {
        case1: "Smaller images load faster and improve page speed and SEO.",
        case2:
          "Get under attachment and upload size limits without losing quality.",
        case3: "Free up space by shrinking large photo libraries.",
        case4: "Meet platform size requirements while keeping images sharp.",
      },
      faq: {
        q1: "How much smaller can my images get?",
        a1: "Often up to 90% smaller, depending on the image and quality setting, while staying visually crisp.",
        q2: "Does it upload my images?",
        a2: "No. Compression runs entirely in your browser; your files never leave your device.",
        q3: "What's the difference between lossy and lossless?",
        a3: "Lossy gives the smallest size by discarding some invisible detail; lossless keeps every pixel and still reduces size. You choose.",
        q4: "Can I compress many images at once?",
        a4: "Yes, batch-compress and download them all as a ZIP.",
        q5: "Which formats are supported?",
        a5: "JPG, PNG, and WebP.",
      },
      privacyNotice:
        "Alatify processes your graphics files completely locally using sandbox APIs inside your browser tab. We never upload any of your files or private coordinates to external clouds, making the tool 100% immune to leaks or server-side logging. Compress JPG, PNG, and WebP images instantly and privately on your own device.",
    },
    "bg-remover": {
      sizes: {
        isnet_quint8: "~45 MB",
        isnet_fp16: "~85 MB",
        isnet: "~170 MB",
      },
      intro:
        "Most free background removers upload your image to their servers, and many quietly use it to train their AI or cap free downloads at low resolution. Alatify's runs entirely in your browser using GPU-accelerated on-device AI. Your photo never leaves your device. No sign-up, no watermark, no resolution limit, and no cap on how many you process, full quality, fully private, unlimited.",
      howItWorks: {
        step1: "Drop your image. It stays on your device.",
        step2:
          "On-device AI detects the subject and removes the background, GPU-accelerated, in seconds.",
        step3:
          "Get a clean cutout with a transparent background, at full resolution.",
        step4: "Save your transparent PNG. No watermark, no limits.",
      },
      useCases: {
        case1:
          "Clean transparent or white-background product shots for Amazon, Etsy, Shopify, and eBay listings.",
        case2: "Isolate yourself for a clean professional or LinkedIn photo.",
        case3:
          "Cut out logos, objects, or people to drop into designs, slides, and thumbnails.",
        case4:
          "Place your subject on any background for posts, stories, and graphics.",
      },
      faq: {
        q1: "Is it really free and unlimited?",
        a1: "Yes, no sign-up, no watermark, no daily limit, and no resolution cap. It runs on your own device, so there's nothing for us to meter.",
        q2: "Does it upload my image to a server?",
        a2: "No. Unlike most free removers that process server-side, and some that use your uploads to train their AI, Alatify runs the AI entirely in your browser. Your image never leaves your device.",
        q3: "Do I get the full resolution?",
        a3: "Yes. Many free tools cap downloads at low resolution and charge for HD. Alatify gives you the full-resolution cutout for free.",
        q4: "How does it work without uploading?",
        a4: "It uses on-device AI (via WebGPU/WebAssembly) that runs locally in your browser. Your own device does the processing.",
        q5: "What can I use the result for?",
        a5: "Product photos, transparent PNGs for design, profile pictures, social posts, and marketplace listings, anywhere you need a clean cutout.",
      },
      privacyNotice:
        "Alatify removes image backgrounds entirely inside your browser tab using GPU-accelerated on-device AI. Your photo is never uploaded to a server, never used to train a model, and never logged, making the tool 100% immune to leaks or server-side data retention. Get unlimited, full-resolution, watermark-free transparent PNGs, processed privately on your own device.",
      onnxNotice:
        "Alatify AI background extraction runs a highly optimized neural network on your browser sandbox using ONNX runtime WebAssembly.",
      modelNotice:
        "GPU models are faster on supported devices; the Lite (CPU) model is best for devices without GPU acceleration.",
      runtimeNotice:
        "First use also downloads the AI runtime (~33 MB) once. Everything is then cached offline. Later uses load instantly.",
    },
    blur: {
      intro:
        "Obscure faces, license plates, and sensitive credentials securely in your web browser. Drag rectangular boxes or draw freeform brush strokes to completely destroy sensitive pixel data offline.",
      howItWorks: {
        step1:
          "Upload your image via drag-drop, file dialogue, or download from a secure URL.",
        step2:
          "Select Box mode for plates/text, or Brush mode for organic targets like faces.",
        step3:
          "Draw rectangles or paint paths. Tweak sizes and blur intensities dynamically.",
        step4:
          "Click Download. Alatify destroys the underlying pixel data and strips EXIF metadata.",
      },
      faq: {
        q1: "How do I blur a license plate before selling a car online?",
        a1: "Upload the photo, toggle to Box Mode or Brush Mode, cover the license plate area, and apply the pixelate or blur effect. This prevents auto-scrapers and data aggregators from linking your vehicle to your personal license registration.",
        q2: "Can I redact sensitive passwords or credentials from screenshots?",
        a2: "Yes. For highly sensitive passwords, financial numbers, or keys, we strongly recommend using the Solid Fill effect. Unlike blur or pixelation which might be partially reversed by AI, Solid Fill replaces the target area with complete black pixels.",
        q3: "Is it safe to blur children or faces before posting online?",
        a3: "Absolutely. Choose Brush Mode to paint over faces with customizable brush sizing. Since everything runs locally inside your sandboxed web browser, the unredacted original photo is never transmitted over the internet.",
        q4: "Does this page upload my image to a server?",
        a4: "No. All Alatify utilities operate on a strict privacy model. Image rendering, box drafting, pixel rendering, and file compilation are executed entirely client-side. The original file never leaves your machine.",
      },
      privacyNotice:
        "Alatify processes your graphics files completely locally using sandbox APIs inside your browser tab. We never upload any of your files or private coordinates to external clouds, making the tool 100% immune to leaks or server-side logging. Obscure faces, license plates, and sensitive credentials securely and privately on your own device.",
      autoDetectHelp:
        "⚡ Local face detection. Works best on clear, front-facing faces. Manual touch-up is available.",
    },
    converter: {
      intro:
        "Convert images between eight formats, including web favorites like WebP, design formats like SVG and TIFF, and specialty formats like ICO (favicons), entirely in your browser. Drag in multiple files, pick an output format, and convert in one click. No upload, no sign-up, no watermark. Your files never leave your device.",
      howItWorks: {
        step1: "Add one or many images (drag-drop or file picker).",
        step2: "Pick your output: JPG, PNG, WebP, ICO, SVG, TIFF, BMP, or GIF.",
        step3: "Process them all at once, instantly, on your device.",
        step4: "Save individually, or grab everything as a ZIP.",
      },
      useCases: {
        case1:
          "Shrink images for faster-loading websites without quality loss.",
        case2: "Create favicons for your website in the correct format.",
        case4: "Trace raster images into scalable vector graphics.",
        case5: "Convert iPhone photos into universally compatible JPGs.",
      },
      faq: {
        q1: "Which formats can I convert between?",
        a1: "JPG, PNG, WebP, ICO, SVG, TIFF, BMP, and GIF, plus HEIC input from iPhones.",
        q2: "Does it upload my files to a server?",
        a2: "No. Conversion runs entirely in your browser; your files never leave your device.",
        q3: "Can I convert many images at once?",
        a3: "Yes, drag in multiple files, convert them all in one click, and download as a ZIP.",
        q4: "How do I convert a PNG to an ICO favicon?",
        a4: "Upload the PNG, choose ICO as the output format, and download, ready to use as a site favicon.",
        q5: "Can I convert HEIC photos from my iPhone?",
        a5: "Yes. Add your HEIC files and convert them to JPG or PNG instantly.",
      },
      privacyNotice:
        "Alatify processes your graphics files completely locally using sandbox APIs inside your browser tab. We never upload any of your files or private coordinates to external clouds, making the tool 100% immune to leaks or server-side logging. Convert images between JPG, PNG, WebP, ICO, SVG, TIFF, BMP, and GIF formats instantly and privately on your own device.",
      svgTooLarge:
        "Image too large for SVG tracing (max 1000 × 1000 supported). Resize image first using our Resizer tool, or use PNG/WebP for photos.",
      alphaBackdropHelp:
        "Selected target format does not fully guarantee native alpha channel rendering. Fill transparent pixels:",
      combinePdfPointer: "Need to combine images into a PDF?",
      combinePdfPointerLink: "Use the dedicated tool →",
    },
    cropper: {
      intro:
        "Crop to a fixed ratio or freely with draggable handles, then straighten with precise rotation, all with real-time preview in your browser. No upload, no sign-up. Your photo never leaves your device.",
      howItWorks: {
        step1: "Drop your image. It stays on your device.",
        step2:
          "Drag the handles for a free crop, or pick a fixed ratio like 1:1 or 16:9.",
        step3: "Rotate to level a crooked photo or align your subject.",
        step4: "Save your cropped image.",
      },
      useCases: {
        case1:
          "Crop to the exact ratios platforms use, 1:1 squares, 16:9 banners, story sizes.",
        case2: "Frame your headshot perfectly for any profile or avatar.",
        case3:
          "Crop tight, attention-grabbing thumbnails for videos and articles.",
        case4: "Trim distracting edges or straighten a tilted horizon.",
      },
      faq: {
        q1: "Can I crop to a specific ratio?",
        a1: "Yes, choose common ratios like 1:1, 4:3, or 16:9, or drag the handles for a completely free crop.",
        q2: "Does it upload my photo to a server?",
        a2: "No. Cropping runs entirely in your browser; your photo never leaves your device.",
        q3: "Can I straighten a crooked photo?",
        a3: "Yes, use rotation to level a tilted horizon or align your subject before cropping.",
        q4: "Will cropping reduce my image quality?",
        a4: "No, cropping keeps the original pixels within the selected area at full quality.",
        q5: "Can I do a free-form crop instead of a fixed ratio?",
        a5: "Yes, drag the handles to any size and position you like.",
      },
      privacyNotice:
        "Alatify processes your graphics files completely locally using sandbox APIs inside your browser tab. We never upload any of your files or private coordinates to external clouds, making the tool 100% immune to leaks or server-side logging. Crop and rotate images instantly and privately on your own device.",
    },
    "exif-cleaner": {
      intro:
        "Every photo your phone takes carries hidden EXIF metadata (GPS coordinates, camera model, date, and device details) that travels with the file when you share it. Alatify shows you exactly what's hidden inside, then strips it clean. Everything runs in your browser: your photo is never uploaded, and the cleaning is fully lossless, so only the metadata is removed. Your image quality stays untouched.",
      howItWorks: {
        step1:
          "Drag and drop your photo, or pick a file. It stays on your device.",
        step2:
          "See all detected metadata, with a prominent warning if GPS location is present.",
        step3:
          "Strip the metadata losslessly. No re-compression, no quality loss.",
        step4: "Save a clean copy with zero metadata, ready to share safely.",
      },
      useCases: {
        case1:
          "Photos taken at home embed your GPS location. Remove it before posting to Facebook Marketplace, eBay, or Craigslist so a listing can't reveal your address.",
        case2:
          "Vacation photos can broadcast that you're away from home. Strip location and timestamps before posting.",
        case3:
          "Exact GPS coordinates can lead strangers to your door. Clean your photos before sharing publicly.",
        case4:
          "Remove location data before delivering to clients or publishing online.",
      },
      faq: {
        q1: "Doesn't Instagram or Facebook already remove EXIF data?",
        a1: "Public posts on most platforms strip EXIF, but they keep the original internally, and many sharing methods (sending the file directly, cloud storage, some platforms) keep the metadata intact. Cleaning it yourself first is the only way to be sure.",
        q2: "How do I remove GPS location before selling something online?",
        a2: "Upload the photo, check the GPS warning, strip the metadata, and download the clean copy to post, no location data attached.",
        q3: "Will removing metadata reduce my photo's quality?",
        a3: "No. Alatify removes metadata losslessly by editing the file's binary structure directly. Your pixels are never re-compressed, so quality is identical.",
        q4: "Can I see what metadata my photo contains first?",
        a4: "Yes. Before cleaning, Alatify displays all detected metadata (GPS coordinates, camera model, date, and device info), so you know exactly what you're removing.",
        q5: "Is my photo uploaded to a server?",
        a5: "No. Detection and cleaning run entirely in your browser. Your photo never leaves your device.",
      },
      privacyNotice:
        "Alatify processes your graphics files completely locally using sandbox APIs inside your browser tab. We never upload any of your files or private coordinates to external clouds, making the tool 100% immune to leaks or server-side logging. Strip location histories (GPS Latitude/Longitude), device markers (manufacturer/model), software history logs, and capture timestamps instantly and safely before distribution.",
      alreadyCleanNotice:
        "This image is already clean. No EXIF, GPS, camera, or software tags were detected.",
      coordinatesNotice:
        "This image reveals exactly where the photo was taken:",
    },
    "id-protector": {
      intro:
        "Every day, millions of raw ID photos (KTP, SIM, passports) are shared online, exposing them to identity theft and fraud. The ID Privacy Shield allows you to redact sensitive details with solid irreversible blocks and apply tiled watermarks to enforce specific usage contexts. Everything runs 100% locally in your browser: your documents never touch a server, and the downloaded file automatically strips all hidden metadata.",
      howItWorks: {
        step1:
          "Select your KTP, SIM, passport, or ID photo. Your document never leaves your browser.",
        step2:
          "Draw SOLID redaction boxes over sensitive fields like NIK/ID numbers, signatures, and addresses.",
        step3:
          "Add a diagonal tiled watermark stating the purpose and date to prevent unauthorized reuse.",
        step4:
          "Save the protected PNG directly. Redactions are baked into the pixels and metadata is stripped.",
      },
      useCases: {
        case1:
          "Secure your KTP, SIM, or passport copy before sending it to rental providers. Add a watermark containing the rental agency name and date to avoid reuse.",
        case2:
          "Redact non-essential numbers and signature blocks before submitting your ID to gig platforms or freelance marketplace verification portals.",
        case3:
          "Avoid sending raw, unprotected ID photos over WhatsApp or email for hotel reservations, freelance contracts, or service registrations.",
      },
      faq: {
        q1: "Are my ID files uploaded to a server?",
        a1: "No. ID Privacy Shield runs entirely in your web browser. All processing, redaction, and watermark overlay is done locally via sandbox canvas APIs. Your private documents never touch our servers.",
        q2: "Can the solid redaction blocks be reversed?",
        a2: "No. When you use Solid redactions, the pixels are baked directly into the output PNG, permanently overwriting the original pixels. Note that Blur is theoretically reversible, so we strongly recommend Solid blocks for highly sensitive data.",
        q3: "Does the watermark prevent cropping?",
        a3: "Yes. By choosing the Tiled Pattern option, the watermark is rendered repeatedly across the entire document canvas. This makes it impossible to crop the watermark out without cropping out the ID content itself.",
        q4: "Does this tool work on mobile devices?",
        a4: "Yes. ID Privacy Shield is responsive and fully supports touch controls, allowing you to draw redaction blocks and download documents on smartphones and tablets.",
        q5: "Is metadata and EXIF data stripped?",
        a5: "Yes. Re-encoding the modified image to PNG automatically strips all EXIF metadata, GPS coordinates, device tags, and history parameters for maximum privacy.",
      },
      privacyNotice:
        "Alatify processes your ID files completely locally using sandbox APIs inside your browser tab. We never upload any of your documents or private coordinates to external clouds, making the tool 100% immune to leaks or server-side logging. Redact sensitive identity numbers, overlay diagonal tiled watermarks, and strip GPS/camera EXIF metadata instantly and safely on your own device before distribution.",
      uploadInstructions:
        "Drag & drop your KTP, SIM, passport, or ID photo here, or click to browse.",
    },
    "qr-toolkit": {
      intro:
        "Create completely offline, static QR codes that belong to you forever without dynamic expiration traps. Scan unknown QR codes and audit their endpoints safely inside your browser tab: strip tracking parameters and analyze URLs before opening them.",
      howItWorks: {
        step1:
          "Select URL, Text, or Wi-Fi mode. Type the details. QR renders immediately offline.",
        step2:
          "Tune sizes, margins, custom colors, and error correction before downloading PNG/SVG.",
        step3:
          "Point your camera or drop an image. Decodes are executed locally inside your browser.",
        step4:
          "Verify domain targets, scrub tracking params, and review warnings on shortened paths.",
      },
      faq: {
        q1: "What is a tracker-free QR code?",
        a1: "Many QR generator services force you to use dynamic links pointing to redirect proxies. This tracks your location, device, and frequency. Alatify generates static QR codes encoding raw text directly: zero tracking, zero expiry, completely yours.",
        q2: "Why does the Safe Scanner strip URL tracking parameters?",
        a2: "QR codes are increasingly used for marketing tracking or phishing (quishing). When you scan a URL, we detect parameters like UTMs and client IDs, strip them, and reveal the direct domain so you know exactly where you are landing.",
        q3: "Can the scanner follow shortener links to inspect the destination?",
        a3: "No. Resolving redirects from shorteners like bit.ly or tinyurl requires sending requests to external servers, which leaks your IP and metadata. To remain 100% private, we flag shortened URLs with a safety notice so you can proceed with caution.",
        q4: "Are my scanned camera feeds or uploaded images sent to any server?",
        a4: "Never. All decoders and generators operate locally on your client machine using JS execution sandboxes. There are no API endpoints, analytics trackers, or network fetches used during operation.",
      },
      privacyNotice:
        "Alatify processes your QR codes completely locally using sandboxed client APIs inside your browser tab. We never upload any of your URLs, plain text contents, camera feeds, or uploaded graphics files. The tool is 100% offline and telemetry-free, keeping all scanned destinations and generated payloads fully private to your device.",
    },
    resizer: {
      intro:
        "Resize images by exact pixels, by percentage, or with a locked aspect ratio, all in your browser. High-quality resampling keeps edges crisp, and you can resize a whole batch at once. No upload, no sign-up. Your images never leave your device.",
      howItWorks: {
        step1: "Add one or many images.",
        step2:
          "Enter exact pixels, scale by percentage, or lock the aspect ratio.",
        step3: "Apply to all images at once with high-quality resampling.",
        step4: "Save individually or as a ZIP.",
      },
      useCases: {
        case1:
          "Resize to the exact dimensions platforms expect, square posts, stories, banners, and profile pictures.",
        case2: "Shrink oversized photos to load faster and fit upload limits.",
        case3:
          "Resize an entire folder of images to the same dimensions in one go.",
        case4: "Hit precise pixel dimensions for layouts and templates.",
      },
      faq: {
        q1: "Can I resize to exact pixel dimensions?",
        a1: "Yes, enter exact width and height in pixels, scale by percentage, or lock the aspect ratio to avoid stretching.",
        q2: "Does it upload my images to a server?",
        a2: "No. Resizing runs entirely in your browser; your files never leave your device.",
        q3: "Will resizing stretch or distort my image?",
        a3: "Not if you keep the aspect ratio locked, it scales proportionally. You can also unlock it for a free resize.",
        q4: "Can I resize many images at once?",
        a4: "Yes, batch-resize them all to the same dimensions and download as a ZIP.",
        q5: "Will resizing reduce quality?",
        a5: "Alatify uses high-quality resampling to keep results as crisp as possible when scaling.",
      },
      privacyNotice:
        "Alatify processes your graphics files completely locally using sandbox APIs inside your browser tab. We never upload any of your files or private coordinates to external clouds, making the tool 100% immune to leaks or server-side logging. Resize images by exact pixels, percentage, or aspect ratio instantly and privately on your own device.",
      cropBehaviorHelp:
        "Fills preset size entirely, trimming excess dimensions from the center aspect.",
      fitBehaviorHelp:
        "Contains full image inside preset boundaries, padding with transparent or solid background.",
    },
    steganography: {
      intro:
        "Protect your communications offline. Embed private texts into images via Least Significant Bit (LSB) steganography, with optional AES-GCM password encryption. The files remain identical to the naked eye. Everything runs entirely in your browser sandbox: no servers, no leaks.",
      howItWorks: {
        step1:
          "Select a carrier host image. Transparent layers are flattened to solid white in-memory.",
        step2:
          "Type secret message. Entering a password triggers AES-GCM 256-bit encryption before packing.",
        step3:
          "Binary bits of the packed payload replace the Least Significant Bits of RGB image channels.",
        step4:
          "Export as PNG format only. This guarantees that compression algorithms do not alter LSB pixels.",
      },
      faq: {
        q1: "Will my steganography survive sending via WhatsApp or Instagram?",
        a1: "No. Chat apps and social media automatically convert files to lossy JPEGs/WebPs to save bandwidth. This destroys LSB pixel variations. To preserve messages, share stego PNGs as uncompressed Document files or direct download links.",
        q2: "Is LSB steganography mathematically undetectable?",
        a2: "No. LSB steganography leaves the carrier visually indistinguishable to the human eye. However, specialized stego scanners can detect statistical alterations in the pixel distribution (steganalysis). For high-security deniability, encrypt with a robust password.",
        q3: "What message formats can I embed?",
        a3: "You can embed any plain text, markdown notes, license keys, or configuration strings. We enforce clear capacity limit checks to prevent truncation, based on the natural dimensions of the uploaded carrier image.",
        q4: "Are my images or password data sent to any server?",
        a4: "Never. All encryption (using Web Crypto API) and pixel-level LSB adjustments happen client-side in-browser. Your original files and passwords never leave your device.",
      },
      privacyNotice:
        "Alatify processes your graphics files completely locally using sandbox APIs inside your browser tab. We never upload any of your files, secret messages, or passwords to external clouds. LSB embedding, PBKDF2 key derivation, and AES-GCM encryption run entirely offline, protecting your data from server-side leaks.",
      passwordHelp:
        "Locking with a password derivates a 256-bit key to encrypt your message. Extracting without the correct password yields unreadable ciphertext.",
    },
    upscaler: {
      intro:
        "Sharpen and enlarge your photos with a Real-ESRGAN neural network that runs entirely in your browser. Runs 100% in your browser. Your image never leaves your device.",
      howItWorks: {
        step1: "Drop your image. It stays on your device.",
        step2: "Pick 2x for speed or 4x for maximum detail.",
        step3:
          "On-device AI enhances the image tile by tile, GPU-accelerated where supported.",
        step4: "Save your sharper, higher-resolution PNG.",
      },
      useCases: {
        case1:
          "Enlarge old or low-resolution photos without losing sharpness or detail.",
        case2:
          "Sharpen and upscale product images for clean Amazon, Shopify, or Etsy listings.",
        case3:
          "Prepare images for large-format physical printing or high-DPI displays.",
        case4:
          "Restore detail and fix artifacts in heavily compressed or downscaled graphics.",
        case5:
          "Upscale Midjourney, DALL-E, or Stable Diffusion outputs for high-res downloads.",
        case6:
          "Enhance screen captures and graphics for presentations and slide decks.",
      },
      faq: {
        q1: "Are my images uploaded to a server?",
        a1: "No. All processing happens locally in your browser. Your images never leave your device.",
        q2: "How does the AI upscaler work?",
        a2: "It uses a Real-ESRGAN neural network that reconstructs detail and sharpens edges, running on your device's GPU via WebGPU (with a CPU fallback).",
        q3: "What's the difference between 2x and 4x?",
        a3: "2x is faster and good for moderate enlargement; 4x produces a larger, sharper result but takes longer.",
        q4: "Is it free?",
        a4: "Yes, completely free, no account or sign-up.",
        q5: "Which formats are supported?",
        a5: "JPG, PNG, and WebP; output is a lossless PNG.",
        q6: "Why does the first run take a moment?",
        a6: "The first use downloads a ~33MB AI model once. It's cached afterward, so later runs are instant and even work offline.",
        q7: "Is there a size limit?",
        a7: "Very large images are scaled down before upscaling to stay reliable on phones and mid-range devices.",
        q8: "Does it work offline?",
        a8: "Yes, once the model is cached, your browser can upscale with no internet connection.",
      },
      privacyNotice:
        "Alatify upscales images entirely inside your browser tab using GPU-accelerated on-device AI. Your photo is never uploaded to a server, never used to train a model, and never logged, making the tool 100% immune to leaks or server-side data retention. Get unlimited, high-resolution, watermark-free upscaled images, processed privately on your own device.",
      fasterOptionDesc: "Double the resolution · quicker",
      sharperOptionDesc: "Quadruple the resolution · slower",
      gpuWarning:
        "Runs 100% in your browser. Your image never leaves your device.",
      localWarning:
        "Processing happens locally and can take a while for large images or slower devices. Keep this tab open.",
    },
    watermark: {
      intro:
        "Protect and brand your images with text or logo watermarks, entirely in your browser. Drag the watermark exactly where you want it, tile it diagonally across the whole image, rotate it, and tune the opacity for the look you want. Watermark a single image or a whole batch at once. No upload, no sign-up. Your images and logo never leave your device.",
      howItWorks: {
        step1: "Add one or many images (up to 30).",
        step2:
          "Pick a text or logo watermark and style it: size, opacity, color, rotation.",
        step3:
          "Snap it to a corner, tile it across the image, or drag it anywhere you like.",
        step4: "Save your watermarked images individually or as a ZIP.",
      },
      useCases: {
        case1:
          "Deter image theft and unauthorized reuse with a visible watermark.",
        case2: "Add your logo or handle to photos before posting or sharing.",
        case3: "Apply the same watermark across an entire batch in one go.",
        case4:
          "Repeat the watermark diagonally so it can't simply be cropped out.",
      },
      faq: {
        q1: "Does it upload my images or logo?",
        a1: "No. Everything runs in your browser; your images and logo never leave your device.",
        q2: "Can I watermark many images at once?",
        a2: "Yes, add up to 30 images and download them all as a ZIP with the same watermark applied.",
        q3: "Can I use my own logo?",
        a3: "Yes. Upload a PNG (transparency supported) and adjust its size and opacity.",
        q4: "Will the watermark look the same across different image sizes?",
        a4: "Yes. Sizes are set relative to each image's width, so the watermark stays proportional whether the photo is large or small.",
        q5: "Can I stop people from cropping out the watermark?",
        a5: "Use tiled mode to repeat the watermark diagonally across the whole image, which makes it much harder to remove by cropping.",
        q6: "What formats can I export?",
        a6: "Keep the original format, or export as JPG, PNG, or WebP.",
      },
      privacyNotice:
        "Alatify processes your graphics files completely locally using sandbox APIs inside your browser tab. We never upload any of your files or private watermark coordinates to external clouds, making the tool 100% immune to leaks or server-side logging. Securely brand and protect your images directly on your own device.",
      previewResolutionNotice:
        "Preview resolution is capped at 1200px. Watermark applies to full-resolution on export.",
    },
    "stock-finder": {
      intro:
        "Search across Unsplash, Pexels, and Pixabay at once, and unlike most stock finders that only show photos, Alatify also surfaces illustrations and vectors. Find the perfect image, then jump straight into Alatify's editing tools to remove its background, compress it, or convert it, all free, no sign-up.",
      howItWorks: {
        step1:
          "Type a keyword to search free stock across Unsplash, Pexels, and Pixabay at once.",
        step2:
          "Narrow by content type (photos, illustrations, or vectors), source, and orientation.",
        step3: "Choose the image you want.",
        step4:
          "Open it in one click in Alatify's tools, or download it directly.",
      },
      useCases: {
        case1:
          "High-quality, royalty-free photography for blogs, articles, and social posts.",
        case2:
          "Scalable graphics for presentations, designs, and thumbnails, not just photos.",
        case3: "Wide, high-resolution shots for websites and headers.",
        case4:
          "Send any result straight into Alatify to cut out the background, compress, or convert.",
      },
      faq: {
        q1: "Are the images free to use?",
        a1: "Yes, results come from Unsplash, Pexels, and Pixabay, which offer free-to-use images. Some sources ask for attribution to the photographer, shown alongside each image.",
        q2: "Can I find illustrations and vectors, not just photos?",
        a2: "Yes. Most stock finders only show photos. Alatify also surfaces illustrations and vectors, so you can search by content type.",
        q3: "Can I edit an image right after finding it?",
        a3: "Yes, open any result in one click in Alatify's browser tools to remove its background, compress it, convert it, and more.",
        q4: "Do I need to sign up?",
        a4: "No. Search and edit freely, no account required.",
        q5: "Where do the images come from?",
        a5: "Three of the largest free stock libraries: Unsplash, Pexels, and Pixabay.",
      },
    },
    "html-to-markdown": {
      intro:
        "Convert HTML source code or .html files into clean, readable Markdown, entirely in your browser. Paste markup or upload a file, then copy or download the result. No server uploads, no account, and your content never leaves your device.",
      howItWorks: {
        step1:
          "Paste HTML into the editor or upload a local .html file from your device.",
        step2:
          "The converter parses your markup locally using Turndown inside the browser sandbox.",
        step3:
          "Headings, lists, links, bold/italic, blockquotes, and code blocks are mapped to Markdown.",
        step4:
          "Copy the output to your clipboard or download it as a .md file instantly.",
      },
      useCases: {
        subtitle:
          "Turn web pages, exports, and HTML snippets into editable Markdown drafts.",
        case1:
          "Migrate blog posts, landing pages, or CMS exports into Markdown for static site generators.",
        case2:
          "Convert internal wiki pages, help docs, or knowledge-base HTML into portable .md files.",
        case3:
          "Archive newsletter or email HTML locally and reformat it into clean text-based Markdown.",
        case4:
          "Transform saved webpage source into Markdown notes for Obsidian, Notion, or GitHub.",
      },
      faq: {
        q1: "Is my HTML uploaded to a server?",
        a1: "No. All parsing and conversion runs inside your browser. Your HTML source is never sent to any backend or third-party service.",
        q2: "What HTML elements are supported?",
        a2: "Common elements like headings, paragraphs, bold/italic, links, ordered and unordered lists, blockquotes, code blocks, and horizontal rules are converted. Complex layouts may simplify to linear Markdown.",
        q3: "Can I upload a full webpage file?",
        a3: "Yes. Upload any .html or .htm file and the tool reads it locally, then converts the full document source to Markdown.",
        q4: "Will tables convert to Markdown table syntax?",
        a4: "Plain Turndown does not include a GFM table plugin. HTML tables use Turndown's default behavior. They are not reliably converted to Markdown pipe-table syntax. Complex or nested tables may become plain text or simplified output. Review the result if table structure matters.",
        q5: "Do I need to pay or create an account?",
        a5: "No. Like all tools on Alatify, this converter is completely free, has no caps or limits, and requires no registration.",
      },
      privacyNotice:
        "Alatify processes your HTML files completely locally using sandbox APIs inside your browser tab. We never upload any of your source code or private content to external clouds, making the tool 100% immune to leaks or server-side logging. Convert HTML to Markdown directly on your own device.",
      placeholder:
        "Paste HTML or upload a .html file to see the converted Markdown output here.",
      downloadMd: "Download .md",
    },
    "code-to-image": {
      intro:
        "Turn your code into polished, share-ready images for Twitter, blogs, and docs, with developer-focused themes and crisp Geist Mono typography. Style your snippets, export PNG or SVG, and hand off to other image tools.",
      howItWorks: {
        step1:
          "Paste your source code into the editor, or load the example snippet to get started.",
        step2:
          "Shiki highlights your code locally with auto-detected language or a manual override.",
        step3:
          "Pick a theme, Geist Monokrom, Dark, or Light, and toggle window chrome and padding.",
        step4:
          "Download PNG or SVG, copy to clipboard, or continue to compressor, resizer, converter, or watermark.",
      },
      useCases: {
        subtitle:
          "Create beautiful code visuals for social posts, documentation, and presentations.",
        case1:
          "Share syntax-highlighted snippets on dev Twitter, Mastodon, or LinkedIn without ugly screenshots.",
        case2:
          "Add polished code blocks to blog posts, README files, and technical documentation.",
        case3:
          "Create conference slide visuals and tutorial graphics with consistent monospace typography.",
        case4:
          "Generate code images and chain them into the compressor or converter for optimized delivery.",
      },
      faq: {
        q1: "What themes are available?",
        a1: "Three themes: Geist Monokrom (signature monochrome with Geist Mono), Dark (GitHub Dark style), and Light Minimal (GitHub Light). Window chrome with traffic-light dots works on any theme.",
        q2: "Which programming languages are supported?",
        a2: "JavaScript, TypeScript, JSX/TSX, Python, HTML, CSS, JSON, Bash, Go, Rust, SQL, Markdown, and plain text. Auto-detect picks the best match, or override manually from the dropdown.",
        q3: "What export formats are available?",
        a3: "PNG (primary, chainable), SVG (vector), and copy-to-clipboard as PNG. PNG is the format used when continuing to other Alatify image tools.",
        q4: "Can I copy the image to my clipboard?",
        a4: "Yes. Click Copy Image to paste the PNG into Slack, Discord, or any app that accepts clipboard images. Some browsers may block this. A toast will notify you if it fails.",
        q5: "Is this tool free?",
        a5: "Yes. Like all Alatify tools, Code to Image is completely free with no account, no limits, and no watermarks on your exports.",
      },
      privacyNotice:
        "Highlighting and image export run locally in your browser tab using Shiki and modern-screenshot.",
    },
    "markdown-to-pdf": {
      intro:
        "Convert Markdown files or raw text into beautifully formatted PDF documents completely locally. No server uploads, no configuration, and zero registration required. Your private notes and documentation never leave your device.",
      howItWorks: {
        step1:
          "Paste or type your Markdown into the editor, or upload a local .md file.",
        step2:
          "Preview the rendered layout live in the side panel with automatic formatting.",
        step3:
          "Generate the PDF client-side using vector rendering for crisp, selectable text.",
        step4: "Download the completed document instantly. Completely private.",
      },
      useCases: {
        case1:
          "Quickly save markdown readme files, project guides, or software notes as readable PDFs.",
        case2:
          "Generate readable handouts, notes, and study guides from text files.",
        case3:
          "Print clean, outline-formatted reports and logs offline without server dependency.",
        case4:
          "Save personal journaling, wikis, or internal guides privately without leakage risk.",
      },
      faq: {
        q1: "Is my document uploaded to a server?",
        a1: "No. Everything runs inside your browser sandbox. The markdown is parsed and the PDF is generated using client-side JavaScript, ensuring 100% offline security.",
        q2: "Will the PDF text be selectable?",
        a2: "Yes. Unlike tools that render pages as blurry images, this tool produces genuine vector PDFs. All text remains sharp, copyable, and searchable.",
        q3: "Can I upload images?",
        a3: "Data URLs (base64) embedded in your markdown are fully supported. For remote images, the browser will attempt a direct load; if it fails due to CORS, the PDF is generated safely by skipping them.",
        q4: "What markdown features are supported?",
        a4: "Headings, paragraphs, bold/italic/strikethrough styles, bullet/numbered/task lists, quotes, tables, code blocks, and horizontal lines are all parsed and formatted.",
        q5: "Do I need to pay or create an account?",
        a5: "No. Like all tools on Alatify, this converter is completely free, has no caps or limits, and requires no registration.",
      },
      privacyNotice:
        "Alatify processes your document files completely locally using sandbox APIs inside your browser tab. We never upload any of your files or private coordinates to external clouds, making the tool 100% immune to leaks or server-side logging. Securely format and compile Markdown to PDF directly on your own device.",
      downloadMd: "Download .md",
    },
    "pdf-to-markdown": {
      intro:
        "Extract text layers from PDF documents and format them into readable Markdown, entirely in your browser. Your files never leave your device.",
      howItWorks: {
        step1:
          "Choose or drag in a standard PDF document containing selectable text layers.",
        step2:
          "Click convert to analyze text strings, layout structures, and lines fully offline.",
        step3:
          "Compute dominant font sizes to map heading tiers and lists automatically.",
        step4:
          "Review the formatted Markdown results, then copy the text or download the .md file.",
      },
      useCases: {
        subtitle:
          "Convert reading material, papers, and transcripts back to clean markup formats.",
        case1:
          "Recover plain text from scholastic publications or journals and format them into Markdown for note-taking tools.",
        case2:
          "Convert text-heavy guides, technical papers, or open-licensed ebooks into Markdown drafts for editing.",
        case3:
          "Process sensitive invoices, contracts, or records locally and confidentially, keeping text off third-party servers.",
        case4:
          "Instantly convert study guides, outline reports, and reference documents into tidy formatted wiki notes.",
      },
      faq: {
        q1: "Is my document uploaded to a server?",
        a1: "No. All file processing, parsing, and text extraction is completed 100% on the client side inside your web browser. Nothing is uploaded to any backend.",
        q2: "Can it extract text from scanned or picture-only PDFs?",
        a2: "No. Scanned PDFs are image files compiled into PDF envelopes and do not contain text metadata. Since we run entirely offline, OCR is out of scope. If scanned sheets are detected, a warning banner will appear.",
        q3: "How does it detect headings and lists?",
        a3: "It scans the page's character sizes to compute the dominant body font height. It then classifies larger lines into H1, H2, or H3 depending on size ratios. Lists are parsed by identifying leading markers like dots or numbers.",
        q4: "What are the limitations of this tool?",
        a4: "This converter extracts plain layout structures. PDF doesn't have native column or grid definitions, meaning tables will convert into flat linear rows, and reading order in multi-column sheets might wrap awkwardly.",
      },
      privacyNotice:
        "All PDF text extraction and document compiling is done entirely inside your local browser sandbox. No file is ever sent to a server or external cloud provider, preserving absolute confidentiality and privacy.",
      placeholder:
        'Upload a document and select "Convert to Markdown" to see the formatted output here.',
      warningScanned:
        "We detected little to no selectable text in this document. It is highly likely this is a scanned/image-only PDF with no embedded text layers. Offline OCR is not supported.",
      limitations: {
        tables:
          "PDFs contain no tabular semantics. Grid coordinates are flat and output is linear.",
        columns:
          "Text runs are processed sequentially, reading order may interleave.",
        scanned:
          "No offline OCR is performed. Scanned pages will trigger a warning banner.",
      },
    },
    "pdf-pages": {
      intro:
        "Load one or more PDFs, rearrange pages with drag-and-drop, rotate or remove individual pages, and export a new PDF, entirely in your browser. Loading multiple files merges them in order. Select pages to extract a subset. No upload, no account, no data leaves your device.",
      howItWorks: {
        step1:
          "Drop one or more PDF files. Pages from every file appear in a single list, in load order, that is your merge.",
        step2:
          "Drag rows to reorder, rotate individual pages 90°, delete unwanted pages, or select pages for extraction.",
        step3:
          "Click Merge & Export All Pages for the full working set, or Export selected pages to split out only the pages you checked.",
        step4:
          "pdf-lib copies original page objects into a new file, no rasterization, so quality and text selectability are preserved.",
      },
      useCases: {
        subtitle:
          "Merge, split, and tidy PDFs without desktop software or cloud uploads.",
        case1:
          "Combine invoices, contracts, or scanned pages from multiple files into one ordered document.",
        case2:
          "Select only the pages you need and export a smaller PDF, useful for sharing one section of a large file.",
        case3:
          "Reorder pages after a bad scan or a mixed export without re-printing or re-scanning.",
        case4:
          "Turn individual landscape or upside-down pages upright before exporting the final PDF.",
      },
      faq: {
        q1: "Are my PDFs uploaded to a server?",
        a1: "No. All loading, editing, and exporting happens locally in your browser. Your files never leave your device.",
        q2: "How do I merge two PDFs?",
        a2: "Load the first file, then click Add more files and load the second. Pages appear in one combined list in the order you added them. Merge & Export All Pages to save the merged result.",
        q3: "How do I split or extract pages?",
        a3: "Select the pages you want with the checkbox on each row, then click Export selected pages. Only checked pages are included in the download.",
        q4: "Does export reduce quality?",
        a4: "No. pdf-lib copies the original page objects into a new PDF. Content is not re-rendered or rasterized.",
        q5: "Can I use password-protected PDFs?",
        a5: "Encrypted or password-protected PDFs cannot be opened in the browser without the password. Remove protection first with a desktop tool, then load the file here.",
      },
      privacyNotice:
        "Every PDF you load is parsed and processed entirely inside your browser using pdf-lib. Files are never uploaded to a server, stored on our infrastructure, or sent to third parties. Close the tab and your documents are gone from memory.",
      exportAllExplanation:
        "Export all pages as one PDF, in the order shown above.",
      exportSelectedPlaceholder: "Select pages first.",
      exportSelectedExplanation: "Only checked pages are exported.",
    },
    "pdf-to-image": {
      intro:
        "Convert PDF pages into high-quality JPG or PNG images directly in your browser. Select specific pages or ranges, adjust the resolution scale, and download individual pages or a combined ZIP archive. No uploads, no sign-ups, 100% private.",
      howItWorks: {
        step1:
          "Upload your PDF document by dragging it in or browsing your files.",
        step2:
          "Choose PNG (keeps transparency) or JPG (flats to white) and set the render scale.",
        step3:
          "Select all pages or specify a custom subset/range of pages to extract.",
        step4:
          "Click Convert and download your image or a ZIP containing all pages.",
      },
      useCases: {
        case1:
          "Convert presentation slides or document pages into images for embedding in web pages or slides.",
        case2:
          "Extract photos, receipts, or single-page diagrams from a PDF as clean image assets.",
        case3:
          "Turn documents into social media images or inline graphics that don't require a PDF reader.",
        case4:
          "Convert sensitive financial sheets locally on-device without passing through third-party servers.",
      },
      faq: {
        q1: "Is my PDF uploaded to a server for conversion?",
        a1: "No. Everything runs inside your browser sandbox. The PDF pages are rendered directly to a canvas element locally, keeping your files completely secure.",
        q2: "What formats can I save pages as?",
        a2: "You can export pages as PNG (best for lossless graphics) or JPEG (high-resolution compressed format, default white background).",
        q3: "What does the render scale setting do?",
        a3: "It controls the resolution of the output images. 1x matches the default PDF page dimensions, while 2x and 3x multiply the pixels for crisper, print-quality text and graphics.",
        q4: "Can I convert just a subset of pages?",
        a4: "Yes. You can select all pages, pick specific pages from the visual checklist, or specify a custom range (e.g. 1-3, 5).",
        q5: "Does the tool support password-protected files?",
        a5: "Protected or encrypted PDFs cannot be rendered in the browser. You must remove password protection first before uploading.",
      },
      privacyNotice:
        "Alatify processes your PDF files completely locally using sandbox APIs inside your browser tab. We never upload any of your files or private coordinates to external clouds, making the tool 100% immune to leaks or server-side logging.",
      scaleStandard: "1x (Standard)",
      scaleHigh: "2x (High)",
      scaleMaximum: "3x (Maximum)",
      scaleHelper:
        "Higher scale = sharper images, but larger files and slower processing.",
    },
    "image-to-pdf": {
      intro:
        "Combine multiple JPG, PNG, or WebP images into a single, beautifully organized PDF document. Rearrange pages with drag-and-drop or shift buttons, set page dimensions, margins, and orientation, all computed locally on-device.",
      howItWorks: {
        step1:
          "Add one or more images (drag-and-drop or browse multiple files).",
        step2:
          "Reorder pages by dragging thumbnails or using the Move Up/Down buttons.",
        step3:
          "Configure page size (fit to image, A4, or Letter), orientation, and margins.",
        step4:
          "Generate and download the compiled, multi-page PDF document instantly.",
      },
      useCases: {
        case1:
          "Merge scanned images, receipts, or sketches into a single PDF document for submission or archiving.",
        case2:
          "Create digital portfolios, photo compilations, or slide decks from separate design files.",
        case3:
          "Convert a sequence of photos into a structured multi-page document for easy reading.",
        case4:
          "Assemble sensitive records, contracts, or IDs locally and privately without risking data leaks.",
      },
      faq: {
        q1: "Are my images uploaded to any server?",
        a1: "No. The PDF generation is done entirely on the client-side using jsPDF in your browser tab. Your files never leave your device.",
        q2: "Can I arrange the order of the pages?",
        a2: "Yes. You can drag the page thumbnails to reorder them, or use the explicit Move Up and Move Down buttons (designed to work reliably on mobile/touch screens).",
        q3: "What page size options do I have?",
        a3: "You can select 'Fit Page to Image' to create pages matching each image's exact dimensions, or choose standard sizes like A4 and Letter with the image scaled to fit.",
        q4: "Are my images compressed when compiling?",
        a4: "The tool embeds images directly into the PDF. For optimal file size, you can compress your source images using our Image Compressor before compiling.",
        q5: "How many images can I add at once?",
        a5: "There is no strict limit, but compiling dozens of high-resolution images may consume significant memory. The tool handles standard sets smoothly.",
      },
      privacyNotice:
        "Alatify compiles your images into a PDF completely locally using sandbox APIs inside your browser tab. We never upload any of your files or private coordinates to external clouds, making the tool 100% immune to leaks or server-side logging.",
    },
    status: {
      available: "Available",
    },
  },
  toolsPage: {
    intro:
      "A curated collection of privacy-first image tools that run entirely in your browser, no uploads, no sign-up, fully private. From Background Remover and Image Compressor to format conversion, resizing, and more, every tool processes your images right on your device.",
    backToHome: "Back to home",
    title: "Tools",
    scrollExplore: "Scroll to explore",
    stockFinder: {
      badge: "No image to start with?",
      description:
        "Start from scratch. Search free stock photos and edit them in one click.",
      button: "Browse Stock Photos",
    },
    section: {
      title: "Our tools",
      subtitle:
        "Every tool runs 100% locally in your browser, so nothing ever leaves your device.",
    },
  },
  "tools-image": {
    intro:
      "Browse our privacy-first tools for image editing, optimization, and conversion. Everything runs locally in your browser sandbox.",
    nav: "Image",
  },
  "tools-document": {
    intro:
      "Access our secure, browser-based utilities for PDF page operations, Markdown conversion, and text extraction.",
    nav: "Document",
  },
  "tools-all": {
    nav: "All",
  },
  header: {
    tools: "Tools",
    support: "Support Us",
    backToTools: "Back to tools",
  },
  footer: {
    tagline:
      "Privacy-first image tools that run entirely in your browser. No server uploads, absolute confidentiality.",
    builtWithCare: "© 2026 Alatify. Built with care.",
    product: "Product",
    allTools: "All Tools",
    embedWidgets: "Embed Widgets",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    about: "About",
    supportUs: "Support Us",
    connect: "Connect",
    madeIn: "Made in Indonesia 🇮🇩",
  },
  backToTop: {
    label: "Back to top",
  },
  download: {
    success: "File downloaded successfully",
    error: "Something went wrong. Please try again",
    label: "Download",
  },
  embed: {
    attribution: {
      private: "100% private, runs in your browser",
      poweredBy: "Powered by",
    },
    brandHeader: {
      back: "Back",
    },
    helpBubble: {
      openFull: "New here? Open the full tool",
    },
  },
  imagePreview: {
    alt: "Preview",
    replace: "Replace",
    remove: "Remove",
  },
  imageUploader: {
    error: {
      failedRead: "Failed to read image file.",
      unsupportedType:
        "Unsupported file type. Please upload a PNG, JPG, WebP, GIF, AVIF, BMP, HEIC, TIFF, or SVG.",
      tooLarge: "File is too large. Maximum size allowed is 50MB.",
      invalidSelection: "Invalid file selection.",
    },
    reading: "Reading image file...",
    dropImages: "Drop your images here",
    dropImage: "Drop your image here",
    unsupportedTypeTitle: "Unsupported file type",
    dragAndDropMultiple: "Drag and drop images here, or click to select",
    dragAndDropSingle: "Drag and drop image here, or click to select",
    checkFile: "Please check file format or size",
    specsMultiple: "Up to 50MB per file · JPG, PNG, WebP, HEIC, TIFF, SVG",
    specsSingle: "Up to 50MB · JPG, PNG, WebP, HEIC, TIFF, SVG",
  },
  requiresInternet: {
    toast: {
      restored: "Connection restored! You can now use the tool.",
      stillOffline: "Still offline. Please check your internet connection.",
    },
    title: "Connection Required",
    desc: "The {toolName} tool requires an active internet connection to download AI weights or fetch external databases.",
    checking: "Checking...",
    checkButton: "Check Connection",
  },
  languageToggle: {
    ariaLabel: "Toggle language",
  },
  themeToggle: {
    ariaLabel: "Toggle theme",
  },
  imageSourceInput: {
    toast: {
      gifWarning: "Animated GIFs will be processed as a single frame.",
    },
    error: {
      emptyUrl: "Please enter a URL",
      failedFetch: "Failed to fetch image",
    },
    uploadFile: "Upload File",
    pasteUrl: "Paste URL",
    placeholder: "Paste any image URL or webpage URL",
    fetching: "Fetching...",
    fetchImage: "Fetch Image",
    privacyNote: {
      title: "🛡 Privacy Policy Note",
      text: "We fetch the URL on your behalf. If you paste a webpage URL, we'll automatically find the main image on that page. All processing then happens entirely in your browser. Max image file size is {maxSizeMB}MB.",
    },
    needHelp: "Need help finding the right URL? ↓",
  },
  processingOverlay: {
    default: {
      title: "Removing background...",
      description:
        "This usually takes 30-60 seconds. Please don't close this tab.",
    },
    downloading: {
      title: "Downloading AI model (one-time setup)…",
      description:
        "Downloading neural weights {modelSize}. This file is cached locally so future runs load instantly.",
    },
    initializing: {
      title: "Setting up AI engine…",
      description: "Initializing execution environment...",
    },
    compiling: {
      description: "Compiling WebGPU shaders for hardware acceleration...",
    },
    processing: {
      description:
        "Running local subject extraction on your device's hardware.",
    },
    downloadingLabel: "Downloading...",
    upscalingTiles: "Upscaling… {done} / {total} tiles",
    elapsedPrefix: "Elapsed: ",
    cancelButton: "Cancel",
    noCancelNotice: "Processing cannot be cancelled once started",
  },
  landing: {
    comparison: {
      title: "How it compares",
      localLabel: "Local",
      othersLabel: "Upload-based tools",
    },
    faq: {
      title: "Frequently Asked Questions",
    },
    cta: {
      title: "Ready to try Alatify?",
      subtitle:
        "Process your images safely and instantly. No uploads, no limits, no catches.",
    },
  },
  hintBubble: {
    toggleTip: "Toggle tip",
    ariaToggleTip: "Toggle hint tip",
    dismiss: "Dismiss hint",
  },
  "url-input-help": {
    title: "How to get the right image URL",
    intro:
      "You can paste either a direct image URL (right-clicked → Copy Image Address) OR a webpage URL that displays the image. We'll automatically find the main image on the page in most cases.",
    note: "**Note:** If pasting the webpage URL doesn't work (some sites block this), fall back to the Copy Image Address method below.",
    "desktop-title": "On Desktop",
    "desktop-step1": "Navigate to the source image (e.g. on Unsplash, Imgur).",
    "desktop-step2": "**Right-click directly on the image** itself.",
    "desktop-step3":
      'Select **"Copy Image Address"** (Chrome/Edge) or **"Copy Image Link"** (Firefox/Safari).',
    "desktop-step4": "Paste the URL directly in the input box above.",
    "desktop-warning":
      '**Important:** Do not select "Copy Link Address", that will copy the webpage URL instead of the image.',
    "mobile-title": "On Mobile",
    "mobile-step1": "Find the image on your mobile browser.",
    "mobile-step2": "**Long-press the image** until the context menu appears.",
    "mobile-step3":
      'Select **"Copy Image Link"** / **"Copy Image Address"**, or choose **"Open image in new tab"**.',
    "mobile-step4":
      "If opened in a new tab: tap the address bar and copy the full URL.",
    "mobile-step5": "Paste the URL in the input box above.",
    "examples-title": "What a direct image URL looks like",
    "examples-correct-label": "Correct: Direct Image URLs",
    "examples-wrong-label": "Wrong: Webpage URLs",
    "blocked-title": "Some websites block external image access",
    "blocked-desc":
      "Pinterest, Instagram, Facebook, and TikTok intentionally block their images from being loaded outside their platforms (known as hotlink protection). If you get an access block error, follow these steps:",
    "blocked-step1":
      "Save the image directly to your computer or mobile device.",
    "blocked-step2":
      'Switch to the **"Upload File"** tab at the top of the workspace.',
    "blocked-step3":
      "Select or drag your saved file to start processing locally.",
  },
};
