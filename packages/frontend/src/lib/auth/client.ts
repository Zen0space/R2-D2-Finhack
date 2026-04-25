"use client";

import { createAuthClient } from "better-auth/client";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const authClient = createAuthClient({
  baseURL: API_BASE,
});

// Seeded via `pnpm --filter backend tsx src/scripts/seed-demo.ts`
export const DEMO_CREDENTIALS = {
  email: "aminah@duitlater.demo",
  password: "FeldaG3dangsa!",
} as const;

export const DEMO_ACCOUNTS = [
  {
    email: "aminah@duitlater.demo",
    name: "Mak Cik Aminah",
    password: DEMO_CREDENTIALS.password,
    role: "member",
  },
  {
    email: "razali@duitlater.demo",
    name: "Pak Cik Razali",
    password: DEMO_CREDENTIALS.password,
    role: "member",
  },
  {
    email: "faiz@duitlater.demo",
    name: "Adik Faiz",
    password: DEMO_CREDENTIALS.password,
    role: "member",
  },
  {
    email: "hamid@duitlater.demo",
    name: "Pakcik Hamid",
    password: DEMO_CREDENTIALS.password,
    role: "member",
  },
  {
    email: "hidayah@duitlater.demo",
    name: "Cik Hidayah",
    password: DEMO_CREDENTIALS.password,
    role: "nadi_staff",
  },
] as const;
