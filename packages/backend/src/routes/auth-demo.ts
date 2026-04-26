/**
 * Demo "Try Now" claim endpoint.
 *
 * Lets the landing-page form mint or resume a demo account from a name
 * alone, with no client-side credentials. The flow is:
 *
 *   POST /api/v1/auth/demo/claim   { name }
 *
 *   slug = slugify(name)
 *   email = `demo-${slug}@duitlater.demo`
 *   password = HMAC-SHA256(BETTER_AUTH_SECRET, `demo:${email}`).slice(0, 32)
 *
 *   if user exists → sign in with that password
 *   else            → sign up, then sign in
 *
 * The Set-Cookie headers from Better Auth's sign-in are forwarded to the
 * browser so the next request carries the session.
 *
 * Trade-off: anyone who types "Aiman" lands on the same account. Acceptable
 * for hackathon demo (no real PII, no real money). Productionizing would
 * require a per-user PIN or recovery code.
 */

import { createHmac } from "node:crypto";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "db";
import { auth } from "../lib/auth.js";
import { ApiError } from "../lib/errors.js";
import { successResponse } from "../lib/response.js";
import { createFeatureErrorHandler } from "../lib/feature-error-handler.js";

export const authDemoRouter = new Hono();

authDemoRouter.onError(createFeatureErrorHandler("auth-demo"));

const claimSchema = z.object({
  name: z.string().min(2).max(60),
});

const DEFAULT_KAMPUNG_NADI_ID = "selangor-felda-gedangsa";

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function derivePassword(email: string) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw ApiError.internal("BETTER_AUTH_SECRET is not configured");
  }
  return createHmac("sha256", secret).update(`demo:${email}`).digest("hex").slice(0, 32);
}

authDemoRouter.post("/claim", zValidator("json", claimSchema), async (c) => {
  const { name } = c.req.valid("json");
  const slug = slugify(name);
  if (!slug) {
    throw ApiError.badRequest("Name contains no usable characters");
  }

  const kampung = await prisma.kampung.findUnique({
    where: { nadiCentreId: DEFAULT_KAMPUNG_NADI_ID },
    select: { id: true },
  });
  if (!kampung) {
    throw ApiError.internal("Default demo kampung is not seeded");
  }

  const email = `demo-${slug}@duitlater.demo`;
  const password = derivePassword(email);

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!existing) {
    await auth.api.signUpEmail({
      body: { email, password, name: name.trim() },
      asResponse: false,
    });
    // Better Auth doesn't accept additionalFields on sign-up reliably across
    // versions; set kampungId in a follow-up update. The user defaults
    // (role=MEMBER, individualPaylaterCents=30000) come from the schema.
    await prisma.user.update({
      where: { email },
      data: { kampungId: kampung.id },
    });
  }

  const signInResponse = await auth.api.signInEmail({
    body: { email, password },
    asResponse: true,
  });

  if (!signInResponse.ok) {
    throw ApiError.internal("Couldn't issue a demo session");
  }

  // Forward each Set-Cookie individually — Headers.entries() collapses
  // multiple Set-Cookie headers into one comma-separated string which
  // browsers don't parse correctly.
  const setCookies = signInResponse.headers.getSetCookie();
  for (const cookie of setCookies) {
    c.header("Set-Cookie", cookie, { append: true });
  }

  return c.json(successResponse({ name: name.trim() }));
});
