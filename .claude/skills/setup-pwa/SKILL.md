---
name: setup-pwa
description: Set up or audit PWA on the Next.js 15 + React 19 frontend using Serwist 9. Configures service worker, manifest, offline fallback, install prompt, and iOS/Android metadata. Use when asked to add PWA, fix PWA, make installable, or enable offline.
argument-hint: "audit" | "install" | "fix" | empty (defaults to audit)
disable-model-invocation: true
---

Run a PWA setup or audit on `packages/frontend/`. If `$ARGUMENTS` is `audit` or empty, only report status — do not modify files. If `install`, set up from scratch. If `fix`, repair specific gaps found.

**Stack assumed:** Next.js 15 App Router · React 19 · Tailwind v4 · Serwist 9 · TypeScript strict.

---

## Step 1 — Audit current state

Check each item. Report a checklist (✅ / ❌) before writing anything.

| Item | Where |
|---|---|
| `serwist` + `@serwist/next` in `package.json` | `packages/frontend/package.json` |
| `withSerwist` wrapping `nextConfig` | `packages/frontend/next.config.mjs` |
| Service worker source exists | `packages/frontend/src/app/sw.ts` |
| Built service worker is gitignored | `packages/frontend/public/sw.js` in `.gitignore` |
| Manifest exists and is linked | `packages/frontend/public/manifest.webmanifest` + `metadata.manifest` in `layout.tsx` |
| Required icons present | `public/icons/` — at minimum a 512×512 maskable + an Apple touch icon (180×180 or 300×300) |
| `viewport` export with `themeColor` and `viewportFit: "cover"` | `src/app/layout.tsx` |
| `appleWebApp` metadata block | `src/app/layout.tsx` |
| `/offline` route exists | `src/app/offline/page.tsx` |
| Install prompt component | `src/components/pwa/` |

If `$ARGUMENTS` is `audit` or empty, stop here and present the report.

---

## Step 2 — Install / repair

Apply only the missing pieces. Do not overwrite working files.

### 2.1 Dependencies

```bash
cd packages/frontend
pnpm add serwist @serwist/next
```

Pin to the latest stable major (currently `^9`). Do not downgrade if a newer version is already installed.

### 2.2 `next.config.mjs`

```js
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import withSerwistInit from "@serwist/next";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout.trim() ||
  randomUUID();

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ url: "/offline", revision }],
  disable: process.env.NODE_ENV === "development",
  swDest: "public/sw.js",
  swSrc: "src/app/sw.ts",
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
};

export default withSerwist(nextConfig);
```

**Why `disable` in dev:** the SW caches aggressively and breaks HMR. Test PWA with `pnpm build && pnpm start`.

### 2.3 Service worker — `src/app/sw.ts`

```ts
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST ?? [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
```

### 2.4 Manifest — `public/manifest.webmanifest`

Use real product values from `src/app/layout.tsx` and `globals.css` (don't fabricate). Required minimum:

```json
{
  "name": "<full app name>",
  "short_name": "<≤12 chars>",
  "description": "<one-liner>",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "<--dl-cream or app bg>",
  "theme_color": "<brand primary>",
  "icons": [
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

**Maskable icons:** keep critical content inside the inner 80% safe zone. If the only available icon is an SVG with `sizes: "any"`, that satisfies Chrome but iOS still needs a PNG.

### 2.5 Layout metadata — `src/app/layout.tsx`

Merge into existing `metadata` and add `viewport` if missing:

```ts
export const metadata: Metadata = {
  applicationName: appName,
  title: { default: appName, template: `%s | ${appName}` },
  description: appDescription,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: appName,
  },
  formatDetection: { telephone: false },
  icons: {
    icon: "/icons/icon-512.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "<brand primary>",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
```

`viewportFit: "cover"` is required for `env(safe-area-inset-*)` to work on iOS notch/home-bar.

### 2.6 Offline page — `src/app/offline/page.tsx`

Server component. No client deps, no fetch — must render from cache only.

```tsx
export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-semibold">Anda di luar talian</h1>
      <p className="text-sm text-[color:var(--dl-slate)]">
        Sambungan internet diperlukan untuk halaman ini. Cuba lagi bila online.
      </p>
    </main>
  );
}
```

### 2.7 Install prompt — `src/components/pwa/install-prompt.tsx`

Client component. Listen for `beforeinstallprompt`, store the event in a Jotai atom (per project frontend rules — no useEffect for derived state, but event listeners are an OK use here).

```tsx
"use client";

import { useAtom } from "jotai";
import { useEffect } from "react";
import { installPromptAtom } from "@/store/ui";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPromptListener() {
  const [, setEvent] = useAtom(installPromptAtom);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [setEvent]);

  return null;
}
```

Add atom to `src/store/ui.ts`:

```ts
import { atom } from "jotai";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export const installPromptAtom = atom<BeforeInstallPromptEvent | null>(null);
```

Mount `<InstallPromptListener />` inside `AppProviders` (not in `layout.tsx` directly — keeps client/server boundary clean).

### 2.8 `.gitignore`

Ensure these are ignored in `packages/frontend/`:

```
public/sw.js
public/sw.js.map
public/swe-worker-*.js
```

---

## Step 3 — Verify

Run, in order:

```bash
cd packages/frontend
pnpm typecheck
pnpm lint
pnpm build
pnpm start
```

Then in Chrome DevTools:

1. **Application → Manifest** — no errors, icons render, `display: standalone`.
2. **Application → Service Workers** — `sw.js` activated, scope `/`.
3. **Network → Offline** + reload a route → `/offline` renders.
4. **Lighthouse → PWA** — installable, no critical failures.
5. iOS Safari: "Add to Home Screen" → app opens fullscreen with theme color.

Report each check ✅ or ❌. Do not declare done until all five pass.

---

## What NOT to do

- Do NOT use `next-pwa` — abandoned. Serwist is the maintained successor.
- Do NOT enable SW in development (`disable: process.env.NODE_ENV === "development"` stays).
- Do NOT precache user-specific or auth-gated routes.
- Do NOT cache `/api/*` blanket — let `defaultCache` runtime-cache instead.
- Do NOT commit `public/sw.js` or its companions.
- Do NOT add `as any` casts in the SW types — use the declared globals above.
