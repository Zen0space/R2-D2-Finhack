/**
 * require-auth — Hono middleware that resolves the current Better Auth session
 * and exposes the authenticated user via `c.get("user")` and `c.get("session")`.
 *
 * Returns 401 with the standard ApiError shape if no valid session.
 *
 * Usage:
 *   import { requireAuth } from "../middleware/require-auth.js";
 *   router.use("*", requireAuth);
 *   router.get("/something", (c) => {
 *     const user = c.get("user");
 *     ...
 *   });
 */

import type { MiddlewareHandler } from "hono";
import { auth } from "../lib/auth.js";
import { ApiError, errorResponse } from "../lib/errors.js";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  kampungId: string | null;
  individualPaylaterCents: number;
  role: "MEMBER" | "NADI_STAFF" | "ADMIN";
};

type AuthSession = {
  id: string;
  userId: string;
  expiresAt: Date;
};

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
    session: AuthSession;
  }
}

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json(errorResponse(ApiError.unauthorized()), 401);
  }

  c.set("user", session.user as unknown as AuthUser);
  c.set("session", session.session as unknown as AuthSession);

  await next();
};
