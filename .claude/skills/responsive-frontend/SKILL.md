---
name: responsive-frontend
description: Audit and fix responsiveness on the Next.js 15 + Tailwind v4 frontend. Mobile-first breakpoints, touch targets, safe-area insets, fluid typography, container queries. Use when asked to make a page responsive, fix mobile layout, or audit responsive issues.
argument-hint: file, route, component, or "all"
disable-model-invocation: true
---

Audit and fix responsiveness on the target. If `$ARGUMENTS` is a path or route, scope to it. If `all` or empty, scan all of `packages/frontend/src/app/` and `src/components/`.

**Stack assumed:** Next.js 15 App Router · React 19 · Tailwind v4 (CSS-first config) · Jotai · shadcn/ui.

---

## Rule 1 — Mobile-first, never desktop-first

Tailwind classes apply mobile-first. Write the **base** for the smallest screen, then layer up with prefixes.

```tsx
// ✅ correct
<div className="flex flex-col gap-3 md:flex-row md:gap-6">

// ❌ wrong — desktop-first, breaks on mobile
<div className="flex flex-row gap-6 max-md:flex-col max-md:gap-3">
```

**Breakpoint scale (Tailwind v4 defaults):**

| Prefix | Min width | Use for |
|---|---|---|
| _(none)_ | 0 | phone portrait — start here |
| `sm:` | 640px | phone landscape, small tablets |
| `md:` | 768px | tablet portrait |
| `lg:` | 1024px | tablet landscape, small laptop |
| `xl:` | 1280px | desktop |
| `2xl:` | 1536px | wide desktop |

Don't invent custom breakpoints unless a real design constraint requires it. If you do, declare them in `globals.css` via `@theme`:

```css
@theme {
  --breakpoint-3xl: 1920px;
}
```

---

## Rule 2 — Use logical viewport units

Replace `min-h-screen` and `h-screen` with `min-h-dvh` / `h-dvh`. The dynamic viewport unit accounts for mobile browser chrome that shrinks/grows on scroll.

```tsx
// ✅
<main className="min-h-dvh">

// ❌ — leaves a gap or causes overflow on iOS Safari
<main className="min-h-screen">
```

For sections that must always fit, prefer `svh` (small) or `lvh` (large) per intent. Default to `dvh`.

---

## Rule 3 — Safe-area insets for notch/home-bar

Any element pinned to the viewport edge (headers, bottom nav, FAB, modal close buttons) must respect iOS safe areas. Requires `viewportFit: "cover"` in `layout.tsx` viewport (the PWA setup handles this).

```tsx
// Bottom nav
<nav className="fixed inset-x-0 bottom-0 pb-[env(safe-area-inset-bottom)]">

// Top header
<header className="sticky top-0 pt-[env(safe-area-inset-top)]">

// Side drawer
<aside className="pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
```

Tailwind v4 supports `pb-[env(...)]` arbitrary values inline. Don't write a custom plugin for this.

---

## Rule 4 — Touch targets ≥ 44×44px

Any tappable element on mobile must be at least 44×44 CSS pixels (Apple HIG / WCAG 2.5.5). For `Button` from shadcn/ui this is already true at `default`/`lg` size; `sm` and `icon` sizes are below threshold.

```tsx
// ✅ icon button — ensure min-h/min-w
<Button size="icon" className="min-h-11 min-w-11">

// ✅ inline link in dense list — pad the hit area
<Link className="-mx-2 inline-block px-2 py-3">

// ❌ raw <a> with no padding
<a className="text-sm text-primary">Tap me</a>
```

Spacing between adjacent targets: ≥ 8px (`gap-2`).

---

## Rule 5 — Fluid typography with `clamp()`

For headings and hero text, use `clamp(min, preferred, max)` instead of breakpoint-jumped sizes. Avoid layout shift across resize.

```tsx
// ✅ fluid — scales smoothly between 24px and 40px
<h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-semibold">

// ⚠️ acceptable but jumpy
<h1 className="text-2xl md:text-3xl lg:text-4xl">
```

Body copy stays fixed (`text-sm` / `text-base`) — fluid body text harms readability.

---

## Rule 6 — Container queries for component-level responsiveness

When a component's layout depends on **its own** width (not the viewport's) — e.g. a card that may sit in a sidebar or full-width — use container queries.

```tsx
<section className="@container">
  <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @xl:grid-cols-3">
    {/* cards */}
  </div>
</section>
```

Tailwind v4 has container queries built-in (`@container`, `@sm:`, `@md:`, etc.) — no plugin needed.

---

## Rule 7 — Images and media

- Always use `next/image` with `sizes` attribute reflecting actual responsive widths:
  ```tsx
  <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 50vw" />
  ```
- Avoid fixed `width`/`height` on raster images — let aspect-ratio + container drive size.
- Videos and iframes wrap in `aspect-video` (or specific `aspect-[16/9]`) container.
- SVG icons get `aria-hidden` and explicit `w-`/`h-` classes — never bare `<svg>` without size.

---

## Rule 8 — Overflow hygiene

Horizontal scroll on mobile is the most common bug. Audit checks:

- `<body>` must never have `overflow-x: visible` content wider than viewport.
- Long strings (URLs, addresses, BM compound words) need `break-words` or `truncate`.
- Tables wrap in `<div className="overflow-x-auto">` — not the table itself.
- `<pre>` / code blocks: `overflow-x-auto whitespace-pre`.
- Grids with fixed-width children use `min-w-0` on the child to allow shrink.

```tsx
// Common fix — flex/grid child won't shrink without min-w-0
<div className="flex items-center gap-2">
  <Avatar />
  <div className="min-w-0 flex-1">
    <p className="truncate">{veryLongName}</p>
  </div>
</div>
```

---

## Rule 9 — Forms on mobile

- Inputs: `text-base` (16px) minimum to prevent iOS auto-zoom on focus.
- Use proper `inputMode` and `autoComplete` for keyboard correctness:
  - Phone → `inputMode="tel" autoComplete="tel"`
  - Amount → `inputMode="decimal"`
  - OTP → `inputMode="numeric" autoComplete="one-time-code"`
  - Email → `type="email" inputMode="email" autoComplete="email"`
- Sticky submit buttons: `pb-[env(safe-area-inset-bottom)]` so they clear the home bar.
- Error messages: render below input, not as toasts only.

---

## Rule 10 — Reduced motion + dark mode hooks

Respect `prefers-reduced-motion` for animations heavier than a fade:

```tsx
<div className="motion-safe:animate-in motion-safe:fade-in motion-reduce:transition-none">
```

Dark mode is **not** a current requirement for this product — do not add `dark:` variants speculatively. Only add when the user asks.

---

## Workflow

1. **Audit** — list every violation found, grouped by rule (1–10) with file:line refs.
2. **Plan** — confirm priority. Critical: overflow, touch targets, viewport units. Cosmetic: fluid type, container queries.
3. **Fix** — surgical edits only. Don't restructure component trees unless layout cannot be fixed via classes.
4. **Verify** — for each changed route:
   - `pnpm dev` → Chrome DevTools → device toolbar
   - Test at: 360×640 (small phone), 390×844 (iPhone 14), 768×1024 (iPad), 1280×800 (laptop)
   - Rotate to landscape on phone widths
   - Check no horizontal scroll on body
5. **Report** — list what was fixed, with before/after class diffs.

Don't declare done until all four widths render without overflow and all touch targets meet 44px.

---

## What NOT to do

- Do NOT add `useEffect` to detect screen size — use Tailwind responsive prefixes or container queries.
- Do NOT use `window.innerWidth` in render — causes hydration mismatch.
- Do NOT add `react-responsive` or similar libs — Tailwind covers it.
- Do NOT hide content with `hidden md:block` if it conveys essential info on mobile — restructure instead.
- Do NOT use `vh` for full-height layouts — use `dvh`.
- Do NOT introduce `dark:` variants unless asked.
- Do NOT touch shadcn/ui primitives in `components/ui/` — wrap them in your own component if you need different responsive behaviour.
