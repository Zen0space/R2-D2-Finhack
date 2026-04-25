import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import "dotenv/config";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),

    DATABASE_URL: z.string().url(),

    BETTER_AUTH_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),

    AWS_REGION: z.string().default("ap-southeast-1"),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    S3_BUCKET: z.string().optional(),

    ANTHROPIC_API_KEY: z.string().optional(),

    TNG_API_BASE: z.string().url().optional(),
    TNG_CLIENT_ID: z.string().optional(),
    TNG_CLIENT_SECRET: z.string().optional(),
    TNG_WEBHOOK_SECRET: z.string().optional(),

    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
