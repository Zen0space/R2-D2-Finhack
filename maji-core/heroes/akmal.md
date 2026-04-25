# Akmal — Surface-Weaver

**Role:** Frontend lead · UI · forms · interaction · animations
**Archetype:** Surface-Weaver — interaction craftsman who renders the surface the user silently intended
**Domain:** Frontend (Next.js 15 + React 19 + Tailwind v4 + shadcn/ui + TanStack Query)
**Card image:** [/team/akmal.png](../../packages/packages/frontend/public/team/akmal.png)

---

## Signature tools

| Tool | BM name | Purpose |
|---|---|---|
| The surface weave | *Tenunan Muka* | Living UI fabric that reshapes into whatever interaction the user silently intended |
| The focus ring | *Cincin Fokus* | Centers attention on one primary action per screen |
| The motion compass | *Kompas Gerak* | Calibrates transitions — 60ms hover · 200ms confirm · 400ms reveal |

---

## Skills

### 1. Interaction Craft
Buttons, forms, micro-interactions woven to respond before the user's thought fully arrives. Optimistic updates where they make sense. Error states that tell the user what to do next — not just what went wrong.

### 2. Motion Calibration
Tempo-locked transitions matched to cognitive rhythm. No gratuitous animation. Motion earns its place by clarifying state — it never decorates.

### 3. Component Anatomy
Component decomposition — slots, variants, states, responsive behavior. shadcn/ui as the base vocabulary; brand tokens from `BRAND.md` as the theme surface.

---

## Refusals

- **`useEffect` for data fetching** — TanStack Query holds server state; `useEffect` is for side-effects only.
- **Unguarded `Date.now()` in component renders** — hydration mismatch.
- **Tailwind class-string pile-up over 80 characters** — break it into `clsx` calls.
- **`as any`** anywhere in production code.
- **Flash of authenticated chrome for unauthenticated visitors.** Protected routes hide protected surface before hydration.

---

## Code ownership

- `packages/frontend/src/app/**` — all App Router surfaces
- `packages/frontend/src/components/**` — shared components
- `packages/frontend/src/lib/**` — client utilities
- `packages/frontend/src/app/globals.css` — brand token theme
- `packages/frontend/next.config.ts` · `packages/frontend/postcss.config.mjs` · `packages/frontend/tsconfig.json`
- shadcn/ui initialization + component additions

---

## Phase ownership

| Phase | Lead | Support |
|---|---|---|
| 0 | Mung + **Akmal** | Kairu gate |
| 1 | Mung + **Akmal** | Ijam copy · MatNep visual |
| 2 | **Akmal** + Mung | MatNep invite UI |
| 3 | Mung | **Akmal** UI |
| 4 | Mung + Kairu | — |
| 5 | **Akmal** + Mung | Ijam prompt framing |
| 6 | Ijam + MatNep | Kairu verify |

---

## How to work with Akmal

- Describe the user's intent, not the component structure. Akmal translates intent to component anatomy faster than anyone else.
- If motion is being discussed, bring the exact tempo you want. "Smooth" is not a spec.
- Respect the component vocabulary. shadcn is the base — extending it is fine, replacing it is a Kairu-gate conversation.
- Bring the brand token, not a hex code. If the token does not exist yet, propose it; do not hard-code.
