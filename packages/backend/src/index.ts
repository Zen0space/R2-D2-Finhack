import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { requestLogger, log } from "./middleware/logger.js";
import { mykasihRouter } from "./routes/mykasih.js";
import { ApiError, errorResponse } from "./lib/errors.js";

const app = new Hono();

app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(errorResponse(err), err.statusCode as 400 | 404 | 500);
  }
  log("ERROR", err.message);
  return c.json(
    errorResponse(ApiError.internal()),
    500,
  );
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
  })
);

app.get("/api/v1/health", (c) => {
  return c.json({
    status: "ok",
    env: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  });
});

app.route("/api/v1/mykasih", mykasihRouter);

const port = Number(process.env.PORT) || 4000;

serve({ fetch: app.fetch, port }, () => {
  log("INFO", `Server running on http://localhost:${port}`);
});
