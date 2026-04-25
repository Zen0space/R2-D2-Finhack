/**
 * Feature-scoped error handler factory.
 *
 * Every Hono router in `routes/` calls `router.onError(createFeatureErrorHandler("<feature>"))`.
 * The helper guarantees a unified envelope across the entire backend:
 *
 *   1. ApiError      → its own status + structured payload via errorResponse()
 *   2. Prisma known  → mapped to a meaningful 4xx with a stable error code
 *   3. Prisma valid. → 400 (the query was structurally wrong)
 *   4. Anything else → log with the feature tag, return generic 500
 *
 * The global `app.onError` in `index.ts` is the final safety net for routes
 * that don't have their own handler (or that throw before the router matches).
 */

import { Prisma } from "db";
import type { ErrorHandler } from "hono";

import { ApiError, errorResponse } from "./errors.js";
import { log } from "../middleware/logger.js";

type FeatureErrorStatus = 400 | 401 | 403 | 404 | 409 | 500;

export function createFeatureErrorHandler(feature: string): ErrorHandler {
  return (err, c) => {
    if (err instanceof ApiError) {
      return c.json(errorResponse(err), err.statusCode as FeatureErrorStatus);
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case "P2002":
          return c.json(errorResponse(ApiError.conflict("Resource already exists")), 409);
        case "P2003":
          return c.json(errorResponse(ApiError.badRequest("Related resource not found")), 400);
        case "P2025":
          return c.json(errorResponse(ApiError.notFound("Resource")), 404);
        case "P2034":
          return c.json(errorResponse(ApiError.conflict("Transaction conflict")), 409);
      }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
      return c.json(errorResponse(ApiError.badRequest("Invalid database input")), 400);
    }

    log("ERROR", `[${feature}] ${err instanceof Error ? err.message : String(err)}`);
    return c.json(errorResponse(ApiError.internal()), 500);
  };
}
