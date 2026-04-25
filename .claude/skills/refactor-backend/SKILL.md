---
name: refactor-backend
description: Refactor backend code to eliminate as-any, enforce Zod validation on all inputs, unify success/error response shape, and add per-feature error handlers. Use when asked to refactor, clean up, or add validation to backend routes.
argument-hint: file, directory, or "all"
disable-model-invocation: true
---

Refactor the target backend code following all rules below. If $ARGUMENTS is a path, refactor that file/directory. If $ARGUMENTS is "all" or empty, scan the entire `packages/backend/src/` tree.

---

## Rule 1 — Project Structure

```
packages/backend/src/
├── lib/
│   ├── errors.ts           # ApiError class — do not duplicate
│   └── response.ts         # successResponse + errorResponse helpers
├── validators/             # Zod schemas, one file per feature/router
│   ├── mykasih.ts
│   └── pool.ts
├── routes/                 # Hono routers, one file per feature
│   └── mykasih.ts
├── middleware/
│   └── logger.ts
└── index.ts                # App bootstrap — global onError + notFound only
```

Schemas live in `validators/`, not inside route files.
`lib/` is for shared utilities — never for business logic.

---

## Rule 2 — Eliminate `as any`

`as any` is banned. Replace every instance:

### Use Zod inferred types

```typescript
// ❌
const body = await c.req.json() as any;

// ✅ — validated and typed via zValidator (see Rule 3)
const body = c.req.valid("json"); // type inferred from schema
```

### Use Prisma-generated types from `db`

```typescript
// ❌
const product = result as any;

// ✅
import type { MykasihProduct } from "db";
const product = result as MykasihProduct;
```

### Use unknown + narrowing for catch blocks

```typescript
// ❌
} catch (err: any) {
  console.error(err.message);
}

// ✅
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
}
```

### Use satisfies for config/literal objects

```typescript
// ❌
const options = { mode: "insensitive" } as any;

// ✅
const options = { mode: "insensitive" } satisfies Prisma.QueryMode;
// or just type the variable:
const mode: Prisma.QueryMode = "insensitive";
```

---

## Rule 3 — Zod Validation on Every Input

Install if not already present:
```bash
pnpm --filter backend add @hono/zod-validator zod
```

### Schema file pattern (`validators/<feature>.ts`)

```typescript
// validators/mykasih.ts
import { z } from "zod";

const CATEGORIES = ["GROCERY","DAIRY","PRODUCE","HOUSEHOLD","PERSONAL_CARE","BABY","BEVERAGE","FROZEN"] as const;
const SORT_FIELDS = ["name","priceRm","subsidyRm","createdAt"] as const;

export const listProductsQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  q:        z.string().max(100).optional(),
  page:     z.coerce.number().int().min(1).default(1),
  sort:     z.enum(SORT_FIELDS).default("name"),
  order:    z.enum(["asc","desc"]).default("asc"),
  inStock:  z.enum(["true","false"]).optional(),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
```

### Wiring in the router (`routes/<feature>.ts`)

```typescript
import { zValidator } from "@hono/zod-validator";
import { listProductsQuerySchema } from "../validators/mykasih.js";

router.get(
  "/products",
  zValidator("query", listProductsQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse(ApiError.badRequest("Invalid query parameters", result.error.flatten().fieldErrors)),
        400,
      );
    }
  }),
  async (c) => {
    const { category, q, page, sort, order, inStock } = c.req.valid("query");
    // all values are already typed + coerced — no manual parseInt, no isNaN checks
  },
);
```

### Validation targets

| Input | Method | zValidator target |
|---|---|---|
| JSON body (POST/PATCH) | `c.req.valid("json")` | `"json"` |
| Query string params | `c.req.valid("query")` | `"query"` |
| Path params | `c.req.valid("param")` | `"param"` |
| Form data | `c.req.valid("form")` | `"form"` |

Always use `zValidator` — never `c.req.json()` + manual checks.

---

## Rule 4 — Unified Response Shape

### Create `lib/response.ts` if it does not exist

```typescript
// lib/response.ts
export function successResponse<T>(data: T, meta?: Record<string, unknown>) {
  return {
    success: true as const,
    data,
    ...(meta !== undefined ? { meta } : {}),
  };
}
```

`errorResponse` already lives in `lib/errors.ts` — import from there.

### Every route must return one of these two shapes

```typescript
// Success
return c.json(successResponse(product));
return c.json(successResponse(products, { total, page, pageSize, totalPages }));

// Error (thrown or returned)
return c.json(errorResponse(ApiError.notFound("Product")), 404);
throw ApiError.internal("DB write failed");
```

Never return a raw object — always go through `successResponse` or `errorResponse`.

---

## Rule 5 — Per-Feature Error Handler

Every router must have its own `onError` that handles:
1. `ApiError` — return the error response with correct status
2. Prisma known errors — map to meaningful HTTP errors
3. Unknown errors — log server-side, return generic 500

```typescript
// routes/pool.ts (example pattern)
import { Prisma } from "db";
import { ApiError, errorResponse } from "../lib/errors.js";
import { log } from "../middleware/logger.js";

poolRouter.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(errorResponse(err), err.statusCode as 400 | 404 | 500);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return c.json(errorResponse(ApiError.badRequest("Resource already exists")), 400);
      case "P2025":
        return c.json(errorResponse(ApiError.notFound("Resource")), 404);
      case "P2003":
        return c.json(errorResponse(ApiError.badRequest("Related resource not found")), 400);
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return c.json(errorResponse(ApiError.badRequest("Invalid database input")), 400);
  }

  log("ERROR", `[${c.req.path}] ${err instanceof Error ? err.message : String(err)}`);
  return c.json(errorResponse(ApiError.internal()), 500);
});
```

Common Prisma error codes:

| Code | Meaning | HTTP |
|---|---|---|
| `P2002` | Unique constraint violation | 400 |
| `P2003` | Foreign key constraint violation | 400 |
| `P2025` | Record not found | 404 |
| `P2016` | Query interpretation error | 400 |
| `P2034` | Transaction conflict | 409 |

The global `app.onError` in `index.ts` is the final safety net — per-feature handlers run first.

---

## Execution checklist

For each target file:

- [ ] Zero `as any` — every cast replaced with proper types, Zod inference, or `unknown`
- [ ] All route inputs validated via `zValidator` with schemas in `validators/`
- [ ] All success responses use `successResponse()` from `lib/response.ts`
- [ ] All error responses use `errorResponse()` + `ApiError` from `lib/errors.ts`
- [ ] Router has its own `onError` covering ApiError + Prisma errors + unknown
- [ ] Schemas are exported as types (`z.infer<typeof schema>`) and used in the handler signature
- [ ] No manual `parseInt`, `isNaN`, or `typeof` checks on validated inputs — Zod coercion handles it

Run after finishing:

```bash
pnpm --filter backend typecheck
```

Fix all type errors before considering the refactor complete.
