/**
 * Better Auth configuration for DuitLater backend.
 *
 * Wires Better Auth to the Prisma `User`/`Session`/`Account`/`Verification`
 * tables (already declared in `packages/db/prisma/schema.prisma`).
 *
 * Mounted at `/api/auth/*` in `packages/backend/src/index.ts`.
 *
 * Frontend client: `packages/frontend/src/lib/auth/client.ts` (Akmal builds UI).
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "db";

const SECRET = process.env.BETTER_AUTH_SECRET;
if (!SECRET || SECRET.length < 32) {
  throw new Error(
    "BETTER_AUTH_SECRET must be set (min 32 chars). Generate via: openssl rand -base64 32",
  );
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24,
    },
  },
  user: {
    // Extend the default User model with our DuitLater fields
    additionalFields: {
      kampungId: {
        type: "string",
        required: false,
      },
      individualPaylaterCents: {
        type: "number",
        required: false,
        defaultValue: 30000, // RM 300 default
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "MEMBER",
      },
    },
  },
  trustedOrigins: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
  secret: SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:4000",
});

export type Auth = typeof auth;
