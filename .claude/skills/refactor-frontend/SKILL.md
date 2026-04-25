---
name: refactor-frontend
description: Refactor frontend code into maintainable structure. Enforces Jotai state management, bans as-any casts, and eliminates unnecessary useEffect. Use when asked to refactor, clean up, or restructure frontend code.
argument-hint: file, directory, or "all"
disable-model-invocation: true
---

Refactor the target frontend code following all rules below. If $ARGUMENTS is a path, refactor that file/directory. If $ARGUMENTS is "all" or empty, scan the entire `packages/frontend/src/` tree.

---

## Rule 1 — Project Structure

Every file must live in its correct directory. Reorganise if needed.

```
packages/frontend/src/
├── app/                        # Next.js App Router — pages and layouts only
│   ├── (auth)/                 # Route group: login, register
│   ├── (dashboard)/            # Route group: main app screens
│   ├── offline/                # PWA offline fallback
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── sw.ts                   # Serwist service worker entry
├── components/
│   ├── ui/                     # shadcn/ui primitives — do not edit these manually
│   └── <feature>/              # Feature components, e.g. pool/, auth/, pwa/
├── hooks/                      # Custom React hooks (useSomething.ts)
├── lib/
│   ├── api.ts                  # Typed fetch wrappers for backend endpoints
│   └── utils.ts                # cn() and other pure helpers
├── store/                      # Jotai atoms only — no component logic here
│   ├── auth.ts                 # session, user atoms
│   ├── pool.ts                 # pool state atoms
│   └── ui.ts                   # modal open/close, install prompt, etc.
└── types/                      # TypeScript interfaces not derived from Prisma
```

**Placement rules:**
- Page-level components (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`) stay in `app/`.
- Everything else is a component and belongs in `components/<feature>/`.
- One component per file. File name = component name in kebab-case.
- Barrel exports (`index.ts`) are allowed per feature folder, not at the top level.

---

## Rule 2 — Jotai State Management

Use **Jotai** for all shared/global client state. Remove zustand, React Context for state (Context for DI only), and any `useState` that is shared across components.

### Atom patterns

```typescript
// store/pool.ts
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { Pool } from "db";

// Primitive atom
export const activePoolIdAtom = atom<string | null>(null);

// Derived read-only atom
export const hasActivePoolAtom = atom((get) => get(activePoolIdAtom) !== null);

// Persisted atom (survives page refresh)
export const dismissedInstallPromptAtom = atomWithStorage("install-dismissed", false);

// Write-only atom (action)
export const clearPoolAtom = atom(null, (_get, set) => {
  set(activePoolIdAtom, null);
});
```

### In components

```typescript
import { useAtom, useAtomValue, useSetAtom } from "jotai";

// Read + write
const [activeId, setActiveId] = useAtom(activePoolIdAtom);

// Read only (no re-render on unrelated writes)
const hasPool = useAtomValue(hasActivePoolAtom);

// Write only (cheapest — no subscription to value)
const clearPool = useSetAtom(clearPoolAtom);
```

### What stays as useState

`useState` is fine for **local, non-shared UI state** that never leaves the component:
- Input field value before submit
- Toggle open/closed within one component
- Hover / focus state

If the same piece of state is read by two or more components → move it to a Jotai atom.

---

## Rule 3 — Eliminate useEffect

`useEffect` is the last option. Before reaching for it, try:

| Need | Use instead |
|---|---|
| Fetch data on mount | TanStack Query `useQuery` |
| Mutate data | TanStack Query `useMutation` |
| Derive value from state | `useMemo` or a Jotai derived atom |
| React to state change | Jotai `atomEffect` (from `jotai-effect`) or event handler |
| Sync to external store | `useSyncExternalStore` |
| Run once on mount (analytics, third-party init) | `useEffect` with `[]` **is acceptable** |
| DOM measurement / refs | `useLayoutEffect` or a callback ref |

### Refactor pattern — data fetching

```typescript
// ❌ Before
useEffect(() => {
  fetch("/api/v1/pools").then(r => r.json()).then(setData);
}, []);

// ✅ After
const { data, isPending, error } = useQuery({
  queryKey: ["pools"],
  queryFn: () => api.pools.list(),
});
```

### Refactor pattern — derived state

```typescript
// ❌ Before
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ After
const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);
```

### Refactor pattern — event-driven

```typescript
// ❌ Before
useEffect(() => {
  if (isSuccess) {
    router.push("/dashboard");
  }
}, [isSuccess]);

// ✅ After — in the mutation onSuccess callback
useMutation({
  mutationFn: loginFn,
  onSuccess: () => router.push("/dashboard"),
});
```

When `useEffect` is the only correct tool, add a comment explaining why:
```typescript
useEffect(() => {
  // capturing beforeinstallprompt — no event-handler alternative for this browser API
  window.addEventListener("beforeinstallprompt", handler);
  return () => window.removeEventListener("beforeinstallprompt", handler);
}, []);
```

---

## Rule 4 — Remove `as any`

`as any` silences the type system and is banned. Replace every instance:

### Use the correct Prisma-generated type

```typescript
// ❌
const pool = data as any;

// ✅ — import from db workspace
import type { Pool } from "db";
const pool = data as Pool;
```

### Narrow with unknown + type guard

```typescript
// ❌
const parsed = JSON.parse(raw) as any;

// ✅
function isPool(value: unknown): value is Pool {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "status" in value
  );
}
const parsed: unknown = JSON.parse(raw);
if (isPool(parsed)) { /* safe */ }
```

### Use satisfies for object literals

```typescript
// ❌
const config = { theme: "default" } as any;

// ✅
const config = { theme: "default" } satisfies AppConfig;
```

### Widen to a safe type instead

```typescript
// ❌ — handler param typed as any
const onChange = (e: any) => setValue(e.target.value);

// ✅
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);
```

### For API response shapes not yet typed

```typescript
// ❌
const res = await fetch(...);
const body = await res.json() as any;

// ✅ — create a typed helper in lib/api.ts
async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}
```

---

## Execution checklist

For each target file:

- [ ] File is in the correct directory per the structure above
- [ ] All shared state uses Jotai atoms (`store/*.ts`)
- [ ] No `useEffect` for data fetching, derived state, or event-driven logic
- [ ] Every remaining `useEffect` has a comment explaining why it is necessary
- [ ] Zero `as any` — every cast replaced with a proper type, guard, or `unknown`
- [ ] No unused imports left behind after refactor
- [ ] TypeScript compiles cleanly (`pnpm typecheck`)

Run after finishing:

```bash
pnpm --filter frontend typecheck
```

Fix any new type errors before considering the refactor complete.
