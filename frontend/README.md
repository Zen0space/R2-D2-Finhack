# Frontend — Kutu Digitizer UI

**Next.js 15 + React 19 + Tailwind v4 + shadcn/ui · runs on :3000**

---

## Initialize (Saturday morning)

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
# Install per /TECH-STACK.md Section 8 → Frontend
npx shadcn@latest init
npx shadcn@latest add button input form label card dialog ...
```

## Expected Structure (after init)

```
frontend/
├── package.json
├── tsconfig.json
├── next.config.js               # output: 'standalone'
├── Dockerfile
├── .env.local                   (gitignored)
├── .env.example
├── tailwind.config.ts (or @theme in CSS for v4)
├── components.json              # shadcn config
└── src/
    ├── app/
    │   ├── layout.tsx           # Root + providers (TanStack Query, Better Auth)
    │   ├── page.tsx             # Landing
    │   ├── (auth)/
    │   │   ├── sign-in/page.tsx
    │   │   └── sign-up/page.tsx
    │   ├── dashboard/
    │   │   └── page.tsx         # User's tabung list
    │   ├── tabung/
    │   │   ├── new/page.tsx     # Create tabung
    │   │   └── [id]/
    │   │       ├── page.tsx     # Detail · ledger · members
    │   │       └── invite/page.tsx
    │   ├── join/[code]/
    │   │   └── page.tsx
    │   ├── penasihat/
    │   │   └── page.tsx         # AI chat
    │   └── api/
    │       └── (proxy if any — usually we hit /api/* via Caddy)
    ├── components/
    │   ├── ui/                  # shadcn primitives (auto-generated)
    │   ├── tabung/
    │   │   ├── TabungCard.tsx
    │   │   ├── TabungForm.tsx
    │   │   ├── MemberList.tsx
    │   │   ├── ContributionRow.tsx
    │   │   └── RotationTimeline.tsx
    │   ├── auth/
    │   │   └── AuthGate.tsx
    │   └── penasihat/
    │       └── ChatStream.tsx
    ├── lib/
    │   ├── auth-client.ts       # Better Auth client config
    │   ├── api.ts               # fetch wrapper with credentials
    │   ├── query-client.ts      # TanStack Query config
    │   ├── format.ts            # money formatter (cents → RM)
    │   └── utils.ts             # cn, clsx
    ├── schemas/
    │   ├── tabung.ts            # zod schemas (shared with backend by copy)
    │   ├── contribution.ts
    │   └── user.ts
    └── hooks/
        ├── useTabung.ts
        ├── useContributions.ts
        └── usePenasihat.ts
```

## Owner

Akmal (primary) · MatNep (visual direction) · Reka (design system)
