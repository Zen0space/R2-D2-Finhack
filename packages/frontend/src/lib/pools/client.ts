"use client";

import { API_BASE } from "@/lib/auth/client";
import type { MemberProfile } from "@/types/auth";
import type {
  CreatePoolInput,
  PoolListItem,
  PoolNeedCategory,
  PoolRecord,
  PoolState,
  PoolSuggestionFilter,
} from "@/types/pool";
import {
  calculateLiveCombinedCapCents,
  getSelectedSuggestion,
  toPoolListItem,
} from "./storage";

// ---------------------------------------------------------------------------
// Shape returned by poolView() on the backend
// ---------------------------------------------------------------------------

type BackendMember = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  individualPaylaterCents: number;
  individualAllowanceAtLockCents: number;
  joinedAt: string;
};

type BackendPool = {
  id: string;
  name: string;
  statedNeed: string;
  category: string;
  state: string;
  kampung: { id: string; name: string; districtHint: string | null };
  targetBudgetCents: number;
  combinedCapCents: number;
  inviteCode: string;
  selectedCatalogueItemId: string | null;
  initiatorUserId: string;
  members: BackendMember[];
  memberCount: number;
  createdAt: string;
  lockedAt: string | null;
  approvedAt: string | null;
  deliveredAt: string | null;
};

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

const stateMap: Record<string, PoolState> = {
  DRAFT: "draft",
  LOCKED: "locked",
  SUGGESTING: "suggesting",
  VOTING: "voting",
  APPROVED: "approved",
  ACTIVE: "active",
  COMPLETED: "completed",
  DISSOLVED: "dissolved",
};

const categoryFromBackend: Record<string, PoolNeedCategory> = {
  EQUIPMENT: "peralatan",
  GROCERY: "makanan",
  SCHOOL_SUPPLIES: "alat-sekolah",
  AGRICULTURAL: "pertanian",
  APPLIANCE: "elektrik",
  TRANSPORT: "rumah",
  OTHER: "lain-lain",
};

export const categoryToBackend: Record<PoolNeedCategory, string> = {
  peralatan: "EQUIPMENT",
  makanan: "GROCERY",
  "alat-sekolah": "SCHOOL_SUPPLIES",
  pertanian: "AGRICULTURAL",
  elektrik: "APPLIANCE",
  air: "OTHER",
  rumah: "TRANSPORT",
  "lain-lain": "OTHER",
};

function mapBackendPool(p: BackendPool): PoolRecord {
  return {
    id: p.id,
    name: p.name,
    statedNeedText: p.statedNeed,
    statedNeedCategory: (categoryFromBackend[p.category] ?? "lain-lain") as PoolNeedCategory,
    state: (stateMap[p.state] ?? "draft") as PoolState,
    kampungId: p.kampung.id,
    kampungName: p.kampung.name,
    targetBudgetCents: p.targetBudgetCents,
    combinedCapCents: p.combinedCapCents,
    inviteCode: p.inviteCode,
    selectedSuggestionId: p.selectedCatalogueItemId,
    initiatorUserId: p.initiatorUserId,
    maxMembers: 8,
    members: p.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.userName,
      email: m.userEmail,
      isInitiator: m.userId === p.initiatorUserId,
      joinedAt: m.joinedAt,
      individualAllowanceCents: m.individualPaylaterCents,
      individualAllowanceAtLockCents: m.individualAllowanceAtLockCents || null,
    })),
    createdAt: p.createdAt,
    lockedAt: p.lockedAt,
    suggestedAt: null,
    suggestionFilter: "semua",
    suggestions: [],
  };
}

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
  }

  return res.json() as Promise<{ success: boolean; data: Record<string, unknown> }>;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export const poolsClient = {
  async listMine(userId: string): Promise<PoolListItem[]> {
    const body = await apiFetch("/api/v1/pools/mine");
    const pools = (body.data as { pools: BackendPool[] }).pools;
    return pools.map((p) => toPoolListItem(mapBackendPool(p), userId));
  },

  async getById(poolId: string): Promise<PoolRecord | null> {
    try {
      const body = await apiFetch(`/api/v1/pools/${poolId}`);
      return mapBackendPool((body.data as { pool: BackendPool }).pool);
    } catch (err) {
      if (err instanceof Error && err.message.includes("404")) return null;
      throw err;
    }
  },

  async getByInviteCode(code: string): Promise<PoolRecord | null> {
    try {
      const body = await apiFetch(`/api/v1/pools/by-code/${code}`);
      return mapBackendPool((body.data as { pool: BackendPool }).pool);
    } catch (err) {
      if (err instanceof Error && err.message.includes("404")) return null;
      throw err;
    }
  },

  async create(input: CreatePoolInput, user: MemberProfile): Promise<PoolRecord> {
    const body = await apiFetch("/api/v1/pools", {
      method: "POST",
      body: JSON.stringify({
        kampungId: user.kampung.id,
        name: input.name,
        statedNeed: input.statedNeedText,
        category: categoryToBackend[input.statedNeedCategory],
        targetBudgetCents: input.targetBudgetCents,
      }),
    });
    return mapBackendPool((body.data as { pool: BackendPool }).pool);
  },

  async join(inviteCode: string, _user: MemberProfile): Promise<PoolRecord> {
    const joinBody = await apiFetch("/api/v1/pools/join", {
      method: "POST",
      body: JSON.stringify({ code: inviteCode }),
    });
    const poolId = (joinBody.data as { poolId: string }).poolId;
    const pool = await poolsClient.getById(poolId);
    if (!pool) throw new Error("Pool tak ditemui selepas join.");
    return pool;
  },

  async lock(poolId: string, _userId: string): Promise<PoolRecord> {
    await apiFetch(`/api/v1/pools/${poolId}/lock`, { method: "POST" });
    const pool = await poolsClient.getById(poolId);
    if (!pool) throw new Error("Pool tak ditemui selepas lock.");
    return pool;
  },

  // Phase 3 stubs — wired in the next phase
  async suggest(_poolId: string, _filter?: PoolSuggestionFilter): Promise<PoolRecord> {
    throw new Error("AI Penasihat belum disambung — Phase 3.");
  },

  async chooseSuggestion(_poolId: string, _suggestionId: string): Promise<PoolRecord> {
    throw new Error("Pilih barang belum disambung — Phase 3.");
  },

  async listCatalogue(_filter?: PoolSuggestionFilter) {
    return [];
  },

  getSelectedSuggestion,

  countCatalogueMatches: (pool: PoolRecord, _filter?: PoolSuggestionFilter) => {
    const cap = pool.combinedCapCents ?? calculateLiveCombinedCapCents(pool);
    return cap > 0 ? 1 : 0;
  },

  buildShareLink: (pool: PoolRecord) =>
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${pool.inviteCode}`
      : `/join/${pool.inviteCode}`,
};
