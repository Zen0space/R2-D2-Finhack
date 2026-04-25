"use client";

import type { MemberProfile } from "@/types/auth";
import type { CreatePoolInput } from "@/types/pool";
import {
  buildPoolShareLink,
  createPool,
  getPoolById,
  getPoolByInviteCode,
  joinPool,
  listPoolsForUser,
  lockPool,
} from "./storage";

export const poolsClient = {
  async listMine(userId: string) {
    return listPoolsForUser(userId);
  },

  async getById(poolId: string) {
    return getPoolById(poolId);
  },

  async getByInviteCode(inviteCode: string) {
    return getPoolByInviteCode(inviteCode);
  },

  async create(input: CreatePoolInput, user: MemberProfile) {
    return createPool(input, user);
  },

  async join(inviteCode: string, user: MemberProfile) {
    return joinPool(inviteCode, user);
  },

  async lock(poolId: string, userId: string) {
    return lockPool(poolId, userId);
  },

  buildShareLink: buildPoolShareLink,
};
