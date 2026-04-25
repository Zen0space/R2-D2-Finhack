"use client";

import type { MemberProfile } from "@/types/auth";
import type { CreatePoolInput, PoolSuggestionFilter } from "@/types/pool";
import {
  buildPoolShareLink,
  countCatalogueMatches,
  createPool,
  getSelectedSuggestion,
  getPoolById,
  getPoolByInviteCode,
  joinPool,
  listCatalogue,
  listPoolsForUser,
  lockPool,
  selectSuggestion,
  suggestPool,
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

  async suggest(poolId: string, filter?: PoolSuggestionFilter) {
    return suggestPool(poolId, filter);
  },

  async chooseSuggestion(poolId: string, suggestionId: string) {
    return selectSuggestion(poolId, suggestionId);
  },

  async listCatalogue(filter?: PoolSuggestionFilter) {
    return listCatalogue(filter);
  },

  getSelectedSuggestion,

  countCatalogueMatches,

  buildShareLink: buildPoolShareLink,
};
