# Third-Party Notices

Alatify is licensed under the **GNU Affero General Public License v3.0 only**
(`AGPL-3.0-only`). See the root `LICENSE` file.

This document lists production dependencies that carry attribution or special
license obligations. Unless noted, full license texts live in each package under
`node_modules/<package>/` (for example `LICENSE`, `LICENSE.md`, or `LICENSE.txt`).
Where a version is shown below, it is an obligation-specific pin at the time of
authoring. For all other packages, consult `package-lock.json` for the
authoritative installed version.

---

## AGPL-3.0

| Package | Version | Notes |
|---|---|---|
| `@imgly/background-removal` | 1.7.0 | Package field: `SEE LICENSE IN LICENSE.md`. `LICENSE.md` is the GNU AGPL v3. Compatible with Alatify's AGPL-3.0-only. The package also ships `ThirdPartyLicenses.json` (MIT third-party code/models it redistributes: onnxruntime-web, ISNET, lodash-es, ndarray, zod). Prefer that file for imgly's own dependency notices rather than duplicating it here. |

AGPL also requires that users who interact with a network service be offered
Corresponding Source. The running site links to the public repository from the
footer ("Source Code") for that purpose.

---

## SIL Open Font License 1.1

| Package | Version | Notes |
|---|---|---|
| `geist` | 1.7.2 | Font software (Vercel / basement.studio). OFL 1.1 text in `node_modules/geist/LICENSE.txt`. The license must be retained with the font software; fonts must not be sold by themselves. |

---

## Apache License 2.0

Apache-2.0 requires retention of copyright, patent, trademark, and attribution
notices when redistributing. See each package's `LICENSE` (where present).

| Package | Version |
|---|---|
| `@jsquash/oxipng` | 2.3.0 |
| `@mediapipe/tasks-vision` | 0.10.35 |
| `class-variance-authority` | 0.7.1 |
| `jsqr` | 1.4.0 |
| `pdfjs-dist` | 6.0.227 |

Note: `@mediapipe/tasks-vision` declares Apache-2.0 in `package.json` but does
not ship a root `LICENSE` file in the published tarball inspected for this notice.

---

## Dual license: MIT OR GPL-3.0-or-later

| Package | Version | Election |
|---|---|---|
| `jszip` | 3.10.1 | **This project elects the MIT license** for jszip and retains the upstream copyright notice. We do not select the GPL option. |

---

## MIT / ISC / Unlicense (and similar permissive)

Attribution for these packages attaches to the **package name**, not a pinned
version. Versions are omitted here so this file does not go stale on every
dependency bump. Full license texts (when shipped) live under
`node_modules/<package>/`. Authoritative versions: `package-lock.json`.

| Package | License (package.json) |
|---|---|
| `@ducanh2912/next-pwa` | MIT |
| `@radix-ui/react-dialog` | MIT |
| `@radix-ui/react-select` | MIT |
| `@radix-ui/react-slider` | MIT |
| `@radix-ui/react-slot` | MIT |
| `@radix-ui/react-switch` | MIT |
| `@radix-ui/react-tooltip` | MIT |
| `browser-image-compression` | MIT |
| `clsx` | MIT |
| `exifr` | MIT |
| `gif.js` | MIT |
| `heic2any` | MIT |
| `imagetracerjs` | Unlicense |
| `jspdf` | MIT |
| `linkedom` | ISC |
| `lucide-react` | ISC |
| `markdown-it` | MIT |
| `modern-screenshot` | MIT |
| `next` | MIT |
| `next-themes` | MIT |
| `pdf-lib` | MIT |
| `pdfmake` | MIT |
| `qrcode` | MIT |
| `react` | MIT |
| `react-dom` | MIT |
| `react-dropzone` | MIT |
| `react-image-crop` | ISC |
| `shadcn` | MIT |
| `shiki` | MIT |
| `sonner` | MIT |
| `tailwind-merge` | MIT |
| `turndown` | MIT |
| `tw-animate-css` | MIT |
| `upng-js` | MIT |
| `utif` | MIT |
| `zustand` | MIT |

### Direct MIT dependency with tracked version (this milestone)

| Package | Version | Notes |
|---|---|---|
| `onnxruntime-web` | 1.21.0 | MIT. Declared as a **direct** dependency in this milestone; also used by the AI Upscaler worker and listed in imgly's `ThirdPartyLicenses.json`. |
