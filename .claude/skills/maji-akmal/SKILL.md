---
name: maji-akmal
description: Design brief generator for Akmal (Surface-Weaver). Reads current phase, translates features into front-facing UI/UX briefs. No backend info, no tech jargon, no routes. Pure product design output.
argument-hint: optional — phase number or feature name (e.g. "phase 2" or "pool formation")
disable-model-invocation: true
---

Akmal is the Surface-Weaver. This skill reads the current build phase and produces a professional, front-facing design brief — screens, copy, components, flows. No API routes. No TypeScript. No database. Only what the user sees and feels.

Follow this procedure exactly.

---

## Step 1 — Read current phase status

Read [`docs/process/DEVELOPMENT-PLAN.md`](../../../docs/process/DEVELOPMENT-PLAN.md).

Find the **Phase Status** table at the bottom. Identify:
- Which phase is currently `🟡 in progress`
- If none in progress, use the first `⏳ Pending` phase
- If an argument was passed (e.g. "phase 2"), target that phase instead

State out loud: **"Designing for Phase X — [phase name]"**

---

## Step 2 — Read the phase feature scope

Read that phase's section in DEVELOPMENT-PLAN.md. Focus only on:
- **Frontend tasks** — what screens, what interactions
- **Testable outcome** — the end state the user must reach
- **Goal** — what the user accomplishes

Ignore completely: schema additions, routes, migrations, backend logic, services.

If the argument named a specific feature (e.g. "pool formation"), scope to that feature only.

---

## Step 3 — Read brand + voice

Read [`docs/product/BRAND.md`](../../../docs/product/BRAND.md). Extract and apply:
- **Tone:** quietly confident, BM-first, respectful, no fintech jargon
- **Colour tokens:** tabung-gold, heritage-maroon, cream-parchment, forest-green, etc.
- **Typography:** Cormorant Garamond (display), Inter (body), JetBrains Mono (money figures)
- **Words to use / avoid** from the Voice section
- Any relevant iconography or glyph guidance

---

## Step 4 — Read PRD user stories for this phase

Read [`docs/product/PRD.md`](../../../docs/product/PRD.md). Find the **User Stories** section (§8) that maps to this phase's features. These tell you what the user wants to accomplish — use them as design intent, not implementation instructions.

---

## Step 5 — Produce the design brief

Output a structured, professional design brief. The audience is Akmal — a frontend developer doing the UI implementation. Format it clearly. Use these sections:

### 🎯 Objective
One paragraph. What does this phase deliver to the user? What changes in their experience? Write in full sentences, BM-first where natural.

### 🧭 User Journey
A step-by-step flow from the user's perspective. Start from what the user sees on screen, through each interaction, to the final state. No code, no routes, no fetch calls. Example:

```
1. User buka dashboard → nampak butang "Cipta Pool" (Gold, prominent)
2. Klik → modal muncul dengan 3 field: nama pool, keperluan, bajet
3. Submit → redirected ke Pool Detail page
4. Pool Detail: ahli-ahli, combined cap, butang jemput (sharing ready)
```

### 📱 Screens Required
List every screen or major view that needs to be built. For each:
- **Screen name** (e.g. "Pool Detail Page")
- **URL/route slug** (e.g. `/pools/[id]`) — route hanya sebagai reference lokasi, bukan implementation
- **Primary purpose** — what the user does here
- **Key components visible** — card, button, table, modal, etc.

### 🧩 Components & UI Elements
List shadcn/ui components to use, with design notes:

| Component | Usage | Brand guidance |
|---|---|---|
| `Button` | Primary CTA "Cipta Pool" | tabung-gold bg, white text, rounded-md |
| `Card` | Pool member tiles | cream-parchment bg, sand border |
| `Dialog` | Create pool modal | Ivory surface, soft shadow |
| `Badge` | Pool state indicator | forest-green for "aktif", amber for "pending" |

Add any custom components needed that shadcn doesn't cover.

### ✍️ Copy & Labels
Every piece of user-visible text for this phase. BM-first.

| Element | BM copy | EN fallback |
|---|---|---|
| Page title | "Pool Saya" | "My Pools" |
| Empty state | "Belum ada pool. Cipta atau sertai satu." | "No pools yet. Create or join one." |
| Primary CTA | "Cipta Pool" | "Create Pool" |
| Success toast | "Pool berjaya dicipta!" | "Pool created!" |
| Lock confirm | "Kunci pool sekarang? Roster tak boleh berubah selepas ni." | "Lock pool now? Roster cannot change after this." |

Include: page titles, buttons, labels, empty states, error messages, success confirmations, tooltips.

### ♿ Accessibility Checklist
- [ ] WCAG 2.2 AA contrast (4.5:1 body · 3:1 large text) — check gold on cream
- [ ] All interactive elements keyboard-navigable (Tab + Enter)
- [ ] Focus rings visible in tabung-gold
- [ ] `aria-label` on icon-only buttons
- [ ] Money figures in JetBrains Mono with `aria-live` on updates
- [ ] `prefers-reduced-motion` respected on any animations

### 📐 Layout Notes
- 12-column fluid grid
- 8pt baseline
- 65ch max body measure
- Mobile-first (B40 users on mid-tier Android — smallest breakpoint matters most)
- Any specific layout considerations for this phase's screens

### 🚫 Out of Scope for This Phase
Explicitly list what Akmal should NOT build yet — features from later phases that might be tempting to add. Keep the scope clean.

### ✅ Design Done When
Restate the testable outcome from DEVELOPMENT-PLAN in design terms — what does "done" look like visually?

---

## Rules for this skill

- **Never mention**: API routes, fetch calls, TypeScript types, Prisma models, database tables, migration names, env variables, Docker, backend services
- **Always write**: from the user's perspective — what they see, tap, read, feel
- **BM-first**: all copy defaults BM, EN in brackets for reference
- **Phase discipline**: only design what's in the current phase. If Akmal asks about a feature from Phase 4 while in Phase 2, note it's deferred and redirect
- **Professional**: output reads like a proper design handoff doc, not a casual note
- **Component-grounded**: always reference shadcn/ui by component name — Akmal knows the library
- **Brand-locked**: every colour call must use the named token, not a hex. Example: "tabung-gold" not "#C8941F"
