import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "@/env";
import { logger } from "@/lib/logger";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: env.NODE_ENV === "development" ? ["http://localhost:3000"] : [],
    credentials: true,
  }),
);

app.get("/health", (c) => c.json({ ok: true, service: "duitlater-backend", env: env.NODE_ENV }));

app.get("/", (c) => c.json({ name: "Kutu Digitizer API", version: "0.1.0" }));

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  logger.error({ err }, "unhandled error");
  return c.json({ error: "Internal server error" }, 500);
});

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info(`duitlater-backend listening on :${info.port}`);
});
