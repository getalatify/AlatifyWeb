# Security Policy

## Reporting a vulnerability

**Please do not open a public issue for a security problem.**

Report it privately through GitHub:

1. Go to the [Security tab](https://github.com/getalatify/AlatifyWeb/security) of this repository
2. Click **Report a vulnerability**

That opens a private channel visible only to the maintainer. If GitHub is not an option for you, send a direct message to [@getalatify](https://x.com/getalatify) asking for a private contact, without any details of the issue in the message itself.

Please include what you can:

- What the issue is and why it matters
- Steps to reproduce, or a proof of concept
- Which URL, route, or file is affected
- Browser and operating system, if relevant

## What to expect

Alatify is maintained by one person as a side project, so please calibrate accordingly:

- **Acknowledgement within 7 days.** If you have heard nothing after that, a public ping asking to check inbox, with no details of the issue, is entirely fair.
- **Assessment within 14 days**, including whether it is in scope and how severe it looks.
- **Fix timing depends on severity.** Anything that exposes user data or allows code execution gets worked on immediately. Lower severity issues get queued honestly rather than promised optimistically.

Reporters are credited in the release notes unless you would rather not be. There is no bug bounty. This project has no revenue.

## Threat model

Alatify's architecture makes the usual attack surface unusually small, and it is worth being specific about why rather than claiming it is simply "secure."

**There is no server that holds user files.** Every tool runs in the browser. There is no upload endpoint, no processing queue, no storage bucket, and no user accounts. The classic breach scenario, where an attacker pulls files or credentials out of a database, does not apply because there is no database and no user data at rest.

What remains genuinely attackable is the list below.

### In scope

**The three API routes.** These are the only server-side code paths in the project:

- `/api/stock-search` proxies queries to Unsplash, Pexels, and Pixabay so the API keys stay server-side. Key leakage, injection into upstream requests, and cache poisoning are all in scope.
- `/api/stock-download-trigger` fires the download event Unsplash's API terms require.
- `/api/ping` is a connectivity probe used by the offline detector.

**The `fetch-image` route.** It fetches a remote image URL on the user's behalf. Server-side request forgery is the obvious risk here and it is defended with an allowlist. Bypasses of that allowlist are in scope and are the single finding most worth reporting.

**Client-side injection.** Several tools parse untrusted input: HTML in the HTML to Markdown converter, PDFs, SVGs, and image metadata. Cross-site scripting or anything that escapes the intended parsing boundary is in scope.

**Redaction and metadata integrity.** Alatify claims that blurs, redactions, and metadata removal are irreversible in the exported file. Any way to recover redacted pixels or stripped metadata from an export is a serious bug, because it breaks a promise the product makes explicitly.

**The privacy claim itself.** If any tool sends user file data anywhere, that is the most serious possible finding in this repository, whether it is deliberate, a bug, or something a dependency does. Report it and it gets fixed the same day.

**The embed widgets.** `X-Frame-Options: DENY` is set globally and deliberately exempted for `/embed/*` so the widgets can be embedded in third-party sites. Clickjacking or a frame-related issue affecting non-embed routes is in scope.

**Supply chain.** A malicious or compromised npm dependency reaching the deployed bundle is in scope. Dependencies are listed in `package.json` and attributed in `THIRD-PARTY-NOTICES.md`.

### Out of scope

- Vulnerabilities in the browser itself, or in the operating system
- Denial of service through the public site, which is Vercel's infrastructure rather than this codebase
- Missing security headers with no demonstrated exploit
- Automated scanner output with no proof of concept
- Social engineering of the maintainer
- Reports that only note the site is served by a third-party host
- Anything requiring physical access to a device that is already unlocked

### Known and intentional

Reporting these is not necessary:

- **`ALATIFY_TEST`** is an environment variable that permits localhost targets in the `fetch-image` allowlist for local testing. It is documented in `.env.example`, defaults to off, and is not set in production. A bypass that works *without* this variable is a real finding.
- **`/dev/components`** is an internal component playground. It is present in the repository and returns 404 in production.
- **AI models are fetched from a CDN** on first use, as documented in the README. This is a network request by design and does not include user data.
- **Stock Image Finder sends search terms to external APIs.** This is documented and the tool does not carry the offline privacy badge.

## Safe harbor

Good-faith security research is welcome and will not be pursued legally, provided you:

- Test only against your own browser session or a local build
- Do not access, modify, or exfiltrate data belonging to anyone else
- Do not degrade the service for other users
- Give a reasonable window to ship a fix before publishing

If you are unsure whether something is in scope, report it anyway. An unnecessary report costs a few minutes. An unreported one can cost a lot more.
