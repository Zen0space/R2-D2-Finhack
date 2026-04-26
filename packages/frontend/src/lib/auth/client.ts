"use client";

import { createAuthClient } from "better-auth/client";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const authClient = createAuthClient({
  baseURL: API_BASE,
});

async function postJson<TBody>(path: string, body: TBody) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; error?: { message?: string } }
    | null;

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error?.message ?? "Request failed.");
  }

  return payload;
}

export function requestRegistrationCode(input: { email: string; name?: string }) {
  return postJson("/api/v1/auth/registration-code", input);
}

export function verifyRegistrationCode(input: { email: string; code: string }) {
  return postJson("/api/v1/auth/verify-registration-code", input);
}

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
