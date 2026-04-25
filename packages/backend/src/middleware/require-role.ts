/**
 * require-role — gate a route on the authenticated user's role. Must run
 * after `requireAuth` so `c.get("user")` is populated.
 *
 *   router.use("*", requireAuth, requireRole("NADI_STAFF", "ADMIN"));
 */

import type { MiddlewareHandler } from "hono";
import { ApiError } from "../lib/errors.js";

type Role = "MEMBER" | "NADI_STAFF" | "ADMIN";

export function requireRole(...allowed: Role[]): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get("user");
    if (!allowed.includes(user.role)) {
      throw ApiError.forbidden("Insufficient role for this action");
    }
    await next();
  };
}
