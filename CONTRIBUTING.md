# Contributing to Alatify

Thanks for looking. Alatify is a suite of file and image tools that run entirely in the browser, and contributions of any size are welcome.

Alatify is maintained by one person as a side project. Reviews are not fast. If you are planning anything larger than a bug fix, please open an issue first so you do not spend a weekend on something that gets declined for a reason you could not have guessed.

## The one hard rule

**No tool may send user file data anywhere.**

This is not a style preference. It is the entire product. Every tool processes files locally using Canvas, WebAssembly, and Web Workers, and a user can verify that by opening the Network tab or simply turning off their WiFi.

A pull request that uploads a file to a server will be declined regardless of how good the feature is, how fast the server is, or how briefly the data is retained. If a feature genuinely cannot work client-side, it does not belong in Alatify.

Three exceptions exist today and no more will be added casually:

- AI models are downloaded once from a CDN and then cached. Your image is not part of that request.
- Stock Image Finder queries Unsplash, Pexels, and Pixabay through a server route so the API keys stay server-side. Search terms leave the device. No user file does.
- `/api/ping` is a connectivity probe carrying no data.

If you are adding anything that touches the network, say so explicitly in your pull request description. Do not let a reviewer discover it.

## What is welcome

- Bug fixes, especially reproducible ones with clear steps
- Browser compatibility fixes, particularly Safari and mobile
- Performance improvements to existing tools
- Accessibility improvements
- Indonesian translation corrections
- Documentation fixes

## What is likely to be declined

- Any feature requiring a backend, user accounts, or storage
- Analytics, tracking, or telemetry of any kind
- Adding a dependency licensed GPL-2.0 or under any license incompatible with AGPL-3.0
- Large refactors that were not discussed in an issue first
- Reformatting or restyling that is not part of a functional change
- New tools that duplicate what an existing tool already does

## Prerequisites

`package.json` declares `"engines": { "node": ">=20" }`. Node 20 or newer is required. Development happens on Node 24.

The floor is set by two things: Next.js `14.2.35` requires `node >= 18.17.0`, and the project standardizes on Node 20 or newer so that npm major versions match across machines. Mismatched npm majors produce lockfile churn that shows up as noise in every pull request.

npm ships with Node. There is no `.nvmrc`; use whatever version manager you prefer.

## Setup

```bash
git clone https://github.com/getalatify/AlatifyWeb.git
cd AlatifyWeb
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

On Windows PowerShell, use `Copy-Item .env.example .env.local` for that third command.

Nineteen of the twenty tools work immediately with no configuration.

### Environment variables

Names and comments live in `.env.example`. Values there stay empty. Copy it to `.env.local` and fill in only what you need. Never commit real keys, and never prefix any of these with `NEXT_PUBLIC_`, because Next.js inlines every `NEXT_PUBLIC_` value into the client bundle at build time.

| Variable | Used by | Required for |
| --- | --- | --- |
| `UNSPLASH_ACCESS_KEY` | `src/app/api/stock-search/route.ts`, `src/app/api/stock-download-trigger/route.ts` | Stock Image Finder Unsplash results and Unsplash download tracking |
| `PEXELS_API_KEY` | `src/app/api/stock-search/route.ts` | Stock Image Finder Pexels results |
| `PIXABAY_API_KEY` | `src/app/api/stock-search/route.ts` | Stock Image Finder Pixabay results |
| `ALATIFY_TEST` | `src/app/api/fetch-image/route.ts` | Optional. Set to `true` only for local tests needing localhost or private targets in the fetch-image SSRF allowlist. Never set this in production. |

**Stock Image Finder** (`/tools/stock-finder`) is the only tool that depends on third-party API keys. A provider with a missing key returns empty results for that provider rather than crashing the route, so you can work on the tool with one key, or none.

Every other tool runs client-side and needs no keys at all.

Other API routes:

- `src/app/api/fetch-image/route.ts` fetches a remote image on the user's behalf for URL-based intake. It is guarded by an allowlist. No provider key.
- `src/app/api/ping/route.ts` is a connectivity probe. No keys.

## Available scripts

From `package.json` `scripts`:

| Script | Command | What it does |
| --- | --- | --- |
| `dev` | `next dev` | Start the development server |
| `build` | `next build` | Production build, including the lint and type checks Next runs |
| `start` | `next start` | Serve a previously built production app |
| `lint` | `next lint` | Run ESLint via Next |

There is no `npm test` script and no CI pipeline. See "Before opening a pull request" for what actually gates a change.

## Project structure

Annotated view of `src/` only:

```text
src/
  app/
    (site)/                 # public site route group (URL paths omit "(site)")
      tools/                # one folder per tool: page.tsx + *-client.tsx
      about|privacy|terms|support|embed|...
    api/                    # Route Handlers (stock-search, fetch-image, ping, ...)
    dev/components/         # local playground; returns 404 in production
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

On Windows PowerShell, quote any path containing the `(site)` route group, for example `"src/app/(site)/tools/cropper/page.tsx"`.

### The registry is the single source of truth

`src/lib/tools/registry.ts` defines every tool. The tools hub, the sitemap (`src/app/sitemap.ts`), internal search (`src/lib/tools/search.ts` and ToolSearch), the mobile navigation drawer, and the related-tools sections all derive from it.

Never hardcode a second tool list anywhere. If you find yourself typing tool names into an array, the registry is what you actually want.

### Adding a tool

1. Add an entry to `src/lib/tools/registry.ts`, including both language keyword sets.
2. Create `src/app/(site)/tools/<id>/page.tsx` and `<id>-client.tsx`. Follow an existing tool as a template.
3. Add copy to both dictionaries under the `tools` namespace.
4. Add the icon to `src/lib/tools/tool-icons.tsx`.

The sitemap, hub card, and search entry appear automatically. Do not add them by hand.

Two constraints worth knowing before you start. Tool pages must be server-rendered; do not use `dynamic(..., { ssr: false })` on a tool page, because it caused a measured Cumulative Layout Shift of 0.733 and every tool page was migrated away from it. And any ESM or WebAssembly package using `new URL(..., import.meta.url)` must be added to `transpilePackages` in `next.config.mjs`, or its worker chunk resolves fine locally and 404s only in the production build.

## Adding or changing UI strings

Every user-facing string is translated. i18n is two nested TypeScript objects:

- `src/lib/i18n/dictionaries/en.ts` exports `export const en = { ... }`
- `src/lib/i18n/dictionaries/id.ts` exports `export const id = { ... }`

There is no shared typed interface. The objects are independent.

Consumption:

- Client components call `useT()` from `src/lib/i18n/useT.ts`.
- Keys are dotted paths, for example `t("tools.compressor.intro")` or `t("shared.privacyNotice.title")`.
- Interpolation uses single braces: `t("some.key", { count: 3 })` replaces `{count}`.
- Tool copy lives under the `tools` namespace, with hyphenated tool IDs as quoted keys such as `"bg-remover"`. Leaf keys are flat camelCase.
- Cross-tool strings use the `shared` namespace. Other top-level namespaces include `header`, `footer`, and `download`.
- `src/components/rich-text.tsx` exports `RichText`, which turns `**bold**` markers into `<strong>` nodes. It does not inject HTML.

**Always update both dictionaries together.** Because they are untyped and independent, a key present only in `en.ts` does not fail `tsc` or `build`. At runtime `useT` falls back silently to English when the Indonesian value is missing or empty. A missing key produces no error anywhere. It just quietly ships the wrong language.

### Copy conventions

These are settled decisions, not open questions:

- **Product and format names stay English** in both dictionaries: AI Background Remover, HTML to Markdown, ID Protector, Code to Image, and all format tokens such as PNG, WebP, ZIP.
- **Generic category labels are translated**: Privacy Tool becomes Tools Privasi, Document Tool becomes Tools Dokumen.
- **Indonesian uses casual "kamu", never "Anda".** Technical terms and brand names stay English: browser, GPU, WebGPU, AI, ZIP, Geist. Use "background", not "latar belakang".
- **No em dashes anywhere**, in either language. Use commas, colons, or full stops. Use straight quotes and apostrophes, never curly ones.
- **SEO metadata stays English.** The i18n system is client-side, so crawlers only ever see the server-rendered English HTML. Translating metadata accomplishes nothing.

### Privacy claims must be accurate

Several tools display a "Natively Private" block stating that files never leave the device. Only add it where that is literally true.

Stock Image Finder does not carry it, because it calls external APIs. AI tools download a model once, so they are never described as making zero network requests. Do not add a privacy claim to a tool without checking that the tool actually behaves that way. Overclaiming here damages the project more than a missing feature ever could.

## Branching and pull requests

- Branch from `main`. Name it for what it does: `fix/cropper-drag-offset`, `feat/pdf-rotate`, `docs/readme-typo`.
- Keep pull requests focused. One concern per PR.
- Commit messages follow a loose conventional style: `feat:`, `fix:`, `chore:`, `docs:`.
- Write a description explaining what changed and why. "Fixes #12" alone is not enough context for a reviewer coming back to it in six months.
- Pull requests are squash-merged.

## Before opening a pull request

This repository has no automated test suite and no CI workflows. The gate you run locally is exactly:

```bash
npx tsc --noEmit
npm run build
```

Both must pass. That is the whole gate, and it exists because the deploy platform surfaces build errors one at a time, so catching them locally saves a lot of round trips.

Then check your change by hand:

- If you touched a tool, use it. Upload a real file and confirm the output.
- If you added UI strings, switch to Indonesian and confirm nothing fell back to English.
- If you touched anything involving Web Workers, WebAssembly, service workers, or PWA behaviour, be aware that these can behave differently in a production build than they do under `npm run dev`. Say so in your PR so it gets checked on a deploy preview.

## Security

Do not open a public issue for a security vulnerability. See [SECURITY.md](SECURITY.md).

## License

Alatify is licensed under the [GNU Affero General Public License v3.0 only](LICENSE). By contributing, you agree that your contribution is licensed under the same terms.

Note that `@imgly/background-removal` is itself AGPL-3.0, so this obligation is not something a fork can license away.
