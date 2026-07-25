# Contributing to Alatify

Factual setup and verification notes for this repository as it exists today.
Policy, review process, and code of conduct sections may be added separately.

## Prerequisites

`package.json` has **no** `engines` field. There is no `.nvmrc`, `.node-version`, or
`.tool-versions` file.

What the tree does declare:

- Next.js is pinned at `14.2.35`. Its published `engines` field requires
  `node >= 18.17.0` (see `node_modules/next` / the lockfile entry).
- Dev dependency `@types/node` is `^20`.

Install a current Node.js LTS that satisfies Next's floor (18.17 or newer).
This document was authored against Node `v24.15.0` on the maintainer machine;
that is an observation, not a project constraint.

You also need npm (ships with Node).

## Setup

```bash
git clone https://github.com/getalatify/AlatifyWeb.git
cd AlatifyWeb
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

### Environment variables

Names and comments live in `.env.example`. Values stay empty in the example file.
Copy to `.env.local` for local overrides. Never commit real keys. Never prefix these
with `NEXT_PUBLIC_`.

| Variable | Used by | Required for |
| --- | --- | --- |
| `UNSPLASH_ACCESS_KEY` | `src/app/api/stock-search/route.ts`, `src/app/api/stock-download-trigger/route.ts` | Stock Image Finder Unsplash results and Unsplash download tracking |
| `PEXELS_API_KEY` | `src/app/api/stock-search/route.ts` | Stock Image Finder Pexels results |
| `PIXABAY_API_KEY` | `src/app/api/stock-search/route.ts` | Stock Image Finder Pixabay results |
| `ALATIFY_TEST` | `src/app/api/fetch-image/route.ts` | Optional. Set to `true` only for local tests that need localhost/private targets in the fetch-image SSRF allowlist |

**Stock Image Finder** (`/tools/stock-finder`) is the only product tool that depends
on third-party API keys. Providers with a missing key return empty results for that
provider rather than crashing the route.

**Every other tool** (background remover, compressor, converter, cropper, resizer,
watermark, EXIF cleaner, blur, ID protector, QR toolkit, steganography, PDF/Markdown
converters, code-to-image, upscaler, and the rest registered in
`src/lib/tools/registry.ts`) runs client-side and needs **no** API keys.

Other API routes:

- `src/app/api/fetch-image/route.ts`: server-side image/HTML fetch helper used by
  URL-based image intake. No provider API key. Optional `ALATIFY_TEST` only.
- `src/app/api/ping/route.ts`: health/ping. No env keys.

## Available scripts

From `package.json` `scripts` (verbatim names; there is no `test` script):

| Script | Command | What it does |
| --- | --- | --- |
| `dev` | `next dev` | Start the Next.js development server |
| `build` | `next build` | Production build (includes lint/type checks Next runs during build) |
| `start` | `next start` | Serve a previously built production app |
| `lint` | `next lint` | Run ESLint via Next's lint command |

There is **no** `npm test` script and **no** `.github/workflows` CI pipeline in this
repository today. Do not invent either when contributing.

## Project structure

Annotated view of `src/` only (App Router, TypeScript):

```text
src/
  app/
    (site)/                 # public site route group (URL paths omit "(site)")
      tools/                # one folder per tool: page.tsx + *-client.tsx
      about|privacy|terms|support|embed|...
    api/                    # Route Handlers (stock-search, fetch-image, ping, ...)
    dev/components/         # local playground; not a product surface
  components/
    shared/                 # header, footer, uploaders, theme, language toggle, ...
    ui/                     # shadcn/ui primitives (button, select, slider, ...)
    ToolSearch/             # internal tool search UI
  lib/
    tools/
      registry.ts           # SINGLE SOURCE OF TRUTH for the tool list
      search.ts             # internal search built from the registry
      tool-icons.tsx
    i18n/
      dictionaries/en.ts    # English nested dictionary
      dictionaries/id.ts    # Bahasa Indonesia nested dictionary
      useT.ts               # client hook: key lookup + {var} interpolation
      LanguageProvider.tsx
    store/                  # client state (e.g. active image)
    utils/                  # shared pure helpers
  workers/                  # Web Workers (bg-remover, upscaler, ...)
```

`src/lib/tools/registry.ts` is the single source of truth for every tool entry.
The tools hub, the sitemap (`src/app/sitemap.ts`), internal search
(`src/lib/tools/search.ts` / ToolSearch), and related-tool surfaces all derive from
that registry. To add a tool, append an entry there and add the matching
`src/app/(site)/tools/<id>/` route. Do not hardcode a second tool list elsewhere.

On Windows PowerShell, quote any path that contains the `(site)` route group, e.g.
`src/app/(site)/tools/cropper/page.tsx`.

## Adding or changing UI strings

i18n is two nested TypeScript objects:

- `src/lib/i18n/dictionaries/en.ts` exports `export const en = { ... }`
- `src/lib/i18n/dictionaries/id.ts` exports `export const id = { ... }`

There is no shared typed dictionary interface. The objects are independent.

Consumption:

- Client components call `useT()` from `src/lib/i18n/useT.ts`.
- Keys are dotted paths into the nested object, e.g. `t("tools.compressor.intro")`
  or `t("shared.privacyNotice.title")`.
- Interpolation uses **single braces**: `t("some.key", { count: 3 })` replaces
  `{count}` in the string. The implementation is a `{(\w+)}` replace in `useT`.
- Tool copy lives under the `tools` namespace. Hyphenated tool IDs appear as quoted
  keys where needed (example: `"bg-remover"`, `"exif-cleaner"`). Flat camelCase
  leaf keys sit inside each tool (or shared) object.
- Cross-tool strings use the `shared` namespace (and other top-level namespaces such
  as `header`, `footer`, `download`).
- `src/components/rich-text.tsx` exports `RichText`. It turns `**bold**` markers in a
  string into `<strong>` nodes. No HTML injection; only the double-asterisk markers.

**Always update both dictionaries together.** Because the dictionaries are untyped
and independent, a key present only in `en.ts` does **not** fail `tsc` or `build`.
At runtime, `useT` falls back silently to English when the Indonesian value is
missing or empty (`useT.ts`: if `id` lookup is undefined or `""`, use `en`).

## Before opening a pull request

This repository has no automated test suite and no CI workflows. The verification
gate you must run locally is exactly:

```bash
npx tsc --noEmit
npm run build
```

Both must pass. That is the whole gate.

Also respect the product constraint: do not introduce a new network path that sends
user files or personal image data to a server. Client-side processing is the default.
