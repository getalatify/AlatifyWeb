## What changed

<!-- Short summary of the code or docs change. -->

## Why

<!-- What problem this solves, or which issue it addresses. -->

## How it was verified

<!-- Commands you ran and what you checked manually. -->

## Checklist

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes
- [ ] No new network request carrying user data
- [ ] If UI strings were added, both `en.ts` and `id.ts` were updated

Note on the last item: `en.ts` and `id.ts` are independent untyped objects. A missing key in `id.ts` causes a silent fallback to English at runtime, with no TypeScript error and no build failure.
