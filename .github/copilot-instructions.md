# Copilot instructions (paperlesspaper-apps)

## What this repo is
- Next.js App Router app optimized for fixed-size, low-color eInk layouts.
- Routes live in `src/app/*`; integrations are implemented as pages + components under `src/components/*` (each integration usually has its own README).

## Local dev / scripts
- Install: `npm install`
- Dev server: `npm run dev` (port `3001`, see `package.json`).
- Build/lint/deploy: `npm run build`, `npm run lint`, `npm run deploy` (Vercel CLI).

## Screenshot/Puppeteer rendering contract
- The renderer detects readiness via DOM markers:
  - Add `#website-has-loading-element` to opt into “wait for ready”.
  - Add `#website-has-loaded` when the page is ready for screenshot.
- Prefer using the built-in helper: `LoadingProvider` in `src/helpers/Loading.tsx`.
  - It renders `#website-has-loaded` when all registered operations finished.
  - Use `useLoading({ id })` in components to toggle loading states.

## Theming convention
- Theme is driven by a URL param `color` (e.g. `dark`, `light`, `green-dark`).
- Implementation: `src/components/Theme/ColorVariablesFromParam.tsx` is mounted in `src/app/layout.tsx`.
- When adding a theme, update the allowed class list in `ColorVariablesFromParam`.

## Open Integration (plugin provider) example
- The Open Integration system is documented in `OPENINTEGRATION.md`.
- Reference implementation (keep behavior compatible):
  - Manifest route: `src/app/open-integration-example/config.json/route.ts`
  - Settings iframe: `src/app/open-integration-example/settings/page.tsx`
  - Render target: `src/app/open-integration-example/render/page.tsx`
  - Optional mock OAuth: `src/app/open-integration-example/auth/page.tsx`
- Settings/render pages communicate via `window.postMessage`; follow the message envelopes in `OPENINTEGRATION.md` (structured `source/type/payload` + legacy `{cmd: ...}` support).
- Manifest fetch happens in a browser context; include CORS headers (see `OPENINTEGRATION.md` and helper patterns like `src/helpers/corsHeaders.ts`).

## Where to look for patterns
- Parameter parsing & layout fitting: `src/components/GoogleCalendar/GoogleCalendar.tsx`.
- i18n helpers: `src/i18n/*`.
