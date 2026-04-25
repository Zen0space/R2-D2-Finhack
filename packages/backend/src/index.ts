import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { requestLogger, log } from "./middleware/logger.js";
import { auth } from "./lib/auth.js";
import { mykasihRouter } from "./routes/mykasih.js";
import { nadiRouter } from "./routes/nadi.js";
import { meRouter } from "./routes/me.js";
import { poolsRouter } from "./routes/pools.js";
import { repaymentsRouter } from "./routes/repayments.js";
import { kampungsRouter } from "./routes/kampungs.js";
import { uploadsRouter } from "./routes/uploads.js";
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

app.use("*", requestLogger);
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  }),
);

// Better Auth — mounts /api/auth/* (sign-up · sign-in · sign-out · session · etc.)
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

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

app.route("/api/v1/me", meRouter);
app.route("/api/v1/pools", poolsRouter);
app.route("/api/v1/repayments", repaymentsRouter);
app.route("/api/v1/kampungs", kampungsRouter);
app.route("/api/v1/mykasih", mykasihRouter);
app.route("/api/v1/nadi", nadiRouter);
app.route("/api/v1/uploads", uploadsRouter);

const port = Number(process.env.PORT) || 4000;

serve({ fetch: app.fetch, port }, () => {
  log("INFO", `Server running on http://localhost:${port}`);
});
