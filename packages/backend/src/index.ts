import "dotenv/config";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import { serve } from "@hono/node-server";
import { rateLimiter } from "hono-rate-limiter";
import { requestLogger, log } from "./middleware/logger.js";
import { auth } from "./lib/auth.js";
import { mykasihRouter } from "./routes/mykasih.js";
import { nadiRouter } from "./routes/nadi.js";
import { userRouter } from "./routes/user.js";
import { poolsRouter } from "./routes/pools.js";
import { repaymentsRouter } from "./routes/repayments.js";
import { kampungsRouter } from "./routes/kampungs.js";
import { uploadsRouter } from "./routes/uploads.js";
import { authVerificationRouter } from "./routes/auth-verification.js";
import { authDemoRouter } from "./routes/auth-demo.js";
import { ApiError, errorResponse } from "./lib/errors.js";
import { prisma } from "db";

const app = new Hono();

app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(
      errorResponse(err),
      err.statusCode as 400 | 401 | 403 | 404 | 409 | 500,
    );
  }
  log("ERROR", err.message);
  return c.json(errorResponse(ApiError.internal()), 500);
});

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: { code: "NOT_FOUND", message: `Route ${c.req.method} ${c.req.path} not found` },
    },
    404,
  );
});

const allowedOrigins = process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"];

app.use("*", requestLogger);
app.use("*", secureHeaders());
app.use(
  "*",
  bodyLimit({
    maxSize: 1 * 1024 * 1024, // 1 MB — largest legitimate body is pool create / summary req
    onError: (c) =>
      c.json(
        errorResponse(ApiError.badRequest("Request body too large (max 1 MB)")),
        413,
      ),
  }),
);
app.use(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
// CSRF: only allow mutating requests from our own origins (browsers always
// send Origin on POST/PUT/PATCH/DELETE). GET/HEAD/OPTIONS are unaffected.
app.use("*", csrf({ origin: allowedOrigins }));

// Rate limit factory — keyed by client IP via Caddy's forwarded headers.
const clientIp = (c: { req: { header: (name: string) => string | undefined } }) =>
  c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
  c.req.header("x-real-ip") ??
  "unknown";

const tooManyRequests = (c: import("hono").Context) =>
  c.json(
    errorResponse(
      new ApiError(429, "RATE_LIMITED", "Too many requests. Try again later."),
    ),
    429,
  );

// 20 mutating auth requests per IP per minute (login, signup, password reset).
const authLimiter = rateLimiter({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: "draft-6",
  keyGenerator: clientIp,
  handler: tooManyRequests,
});

// 10 AI calls per IP per minute — protects Claude/Qwen budget.
const aiLimiter = rateLimiter({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: "draft-6",
  keyGenerator: clientIp,
  handler: tooManyRequests,
});

// Better Auth — mounts /api/auth/* (sign-up · sign-in · sign-out · session · etc.)
app.on(["POST"], "/api/auth/*", authLimiter);
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// AI endpoints — wrap in tighter rate limit before the routers handle them.
app.use("/api/v1/pools/:id/suggest", aiLimiter);
app.use("/api/v1/nadi/summary", aiLimiter);

// Demo claim endpoint shares the auth rate limit budget — same brute-force
// surface (an attacker enumerating names) and same protection needed.
app.use("/api/v1/auth/demo/claim", authLimiter);

// Simple ping with DB check — used by Caddy + Cloudflare LB health monitor
app.get("/health", async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return c.json({ ok: true, db: "connected", env: process.env.NODE_ENV ?? "development" });
  } catch {
    return c.json({ ok: false, db: "disconnected" }, 503);
  }
});

app.get("/api/v1/health", (c) => {
  return c.json({
    status: "ok",
    env: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  });
});

app.route("/api/v1/user", userRouter);
app.route("/api/v1/pools", poolsRouter);
app.route("/api/v1/repayments", repaymentsRouter);
app.route("/api/v1/kampungs", kampungsRouter);
app.route("/api/v1/mykasih", mykasihRouter);
app.route("/api/v1/nadi", nadiRouter);
app.route("/api/v1/uploads", uploadsRouter);
app.route("/api/v1/auth", authVerificationRouter);
app.route("/api/v1/auth/demo", authDemoRouter);

const port = Number(process.env.PORT) || 4000;

serve({ fetch: app.fetch, port }, () => {
  log("INFO", `Server running on http://localhost:${port}`);
});
