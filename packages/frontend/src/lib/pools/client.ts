"use client";

import type { MemberProfile } from "@/types/auth";
import type { CreatePoolInput, PoolSuggestionFilter, PoolVoteChoice } from "@/types/pool";
import {
  buildPoolShareLink,
  confirmPoolDelivery,
  countCatalogueMatches,
  createPool,
  getSelectedSuggestion,
  getPoolById,
  getPoolByInviteCode,
  joinPool,
  listCatalogue,
  listPoolsForNadi,
  listPoolsForUser,
  lockPool,
  selectSuggestion,
  suggestPool,
  voteOnPool,
} from "./storage";

export const poolsClient = {
  async listMine(userId: string) {
    return listPoolsForUser(userId);
  },

  async listForNadi(user: MemberProfile) {
    return listPoolsForNadi(user);
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

  async vote(poolId: string, userId: string, vote: PoolVoteChoice) {
    return voteOnPool(poolId, userId, vote);
  },

  async confirmDelivery(poolId: string, user: MemberProfile) {
    return confirmPoolDelivery(poolId, user);
  },

  async listCatalogue(filter?: PoolSuggestionFilter) {
    return listCatalogue(filter);
  },

  getSelectedSuggestion,

  countCatalogueMatches,

  buildShareLink: buildPoolShareLink,
};
