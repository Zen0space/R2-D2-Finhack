"use client";

import type { AuthResult, SignInInput, SignUpInput } from "@/types/auth";
import {
  DEMO_CREDENTIALS,
  createSessionForUser,
  createUser,
  findUserByEmail,
  readSession,
  writeSession,
} from "./storage";

// Frontend-only bridge for Phase 1. We keep the surface area small so the pages can
// swap to Better Auth later without rewriting the route components.
export const authClient = {
  async getSession() {
    return readSession();
  },

  async signIn(input: SignInInput): Promise<AuthResult> {
    const user = findUserByEmail(input.email);

    if (!user || user.password !== input.password) {
      throw new Error("E-mel atau kata laluan tak padan.");
    }

    return {
      isNewUser: false,
      session: createSessionForUser(user),
    };
  },

  async signUp(input: SignUpInput): Promise<AuthResult> {
    const existingUser = findUserByEmail(input.email);

    if (existingUser) {
      throw new Error("Akaun dengan e-mel ini sudah wujud.");
    }

    return {
      isNewUser: true,
      session: createSessionForUser(createUser(input)),
    };
  },

  async signOut() {
    writeSession(null);
  },
};

export { DEMO_CREDENTIALS };
