"use client";

import { createAuthClient } from "better-auth/client";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const authClient = createAuthClient({
  baseURL: API_BASE,
});

// Demo credentials — seeded via `pnpm --filter backend tsx src/scripts/seed-demo.ts`
export const DEMO_CREDENTIALS = {
  email: "aminah@duitlater.demo",
  password: "FeldaG3dangsa!",
} as const;
