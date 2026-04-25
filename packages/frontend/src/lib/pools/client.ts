"use client";

import { API_BASE } from "@/lib/auth/client";
import type { MemberProfile } from "@/types/auth";
import type {
  CatalogueProduct,
  CreatePoolInput,
  PoolListItem,
  PoolNeedCategory,
  PoolObligationRecord,
  PoolRecord,
  PoolState,
  PoolSuggestionFilter,
  PoolSuggestionRecord,
  PoolTransactionRecord,
  PoolVoteChoice,
  PoolVoteRecord,
} from "@/types/pool";
import {
  calculateLiveCombinedCapCents,
  getSelectedSuggestion,
  listCatalogue as listFallbackCatalogue,
  listPoolsForNadi as listLocalNadiPools,
  toPoolListItem,
} from "./storage";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
};

class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

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

type BackendSuggestion = {
  itemId: string;
  itemName: string;
  priceCents: number;
  allocationPct: number;
  reasoningBm: string;
  reasoningEn: string;
};

type BackendVotingState = {
  poolId: string;
  state: string;
  tally: {
    majorityThreshold: number;
    no: number;
    pendingMembers: Array<{ userId: string; name: string }>;
    totalMembers: number;
    yes: number;
  };
  votes: Array<{
    userId: string;
    userName: string;
    vote: PoolVoteChoice;
    votedAt: string;
  }>;
};

type BackendLedgerEntry = {
  obligationId: string;
  member: { id: string; name: string };
  shareAmountCents: number;
  sharePct: number;
  perCycleCents: number;
  totalCycles: number;
  cyclesPaid: number;
  progressPct: number;
  cycles: Array<{
    cycleNumber: number;
    amountCents: number;
    status: string;
    paidAt: string | null;
    tngReference: string | null;
  }>;
};

type BackendLedger = {
  poolId: string;
  ledger: BackendLedgerEntry[];
  totals: {
    memberCount: number;
    cyclesPaid: number;
    cyclesTotal: number;
  };
};

type BackendProduct = {
  id: string;
  name: string;
  nameMs: string | null;
  brand: string | null;
  category: string;
  unit: string | null;
  priceRm: number | string;
  subsidyRm: number | string | null;
  imageUrl: string | null;
  stock: number | null;
  barcode: string | null;
  description?: string | null;
};

type PoolUiCache = {
  suggestedAt?: string | null;
  suggestionFilter?: PoolSuggestionFilter;
  suggestions?: PoolSuggestionRecord[];
  votingStartedAt?: string | null;
};

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

const productCategoryMap: Record<string, PoolNeedCategory> = {
  GROCERY: "makanan",
  DAIRY: "makanan",
  PRODUCE: "makanan",
  BEVERAGE: "makanan",
  FROZEN: "makanan",
  BABY: "rumah",
  PERSONAL_CARE: "lain-lain",
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

const poolUiCache = new Map<string, PoolUiCache>();
const knownPoolIds = new Set<string>();

function rememberPoolId(poolId: string) {
  if (poolId) {
    knownPoolIds.add(poolId);
  }
}

function createSuggestionId(poolId: string, productId: string) {
  return `suggestion-${poolId}-${productId}`;
}

function extractProductId(poolId: string, suggestionId: string) {
  const prefix = `suggestion-${poolId}-`;

  if (suggestionId.startsWith(prefix)) {
    return suggestionId.slice(prefix.length);
  }

  return suggestionId;
}

function mapBackendCategory(category: string) {
  return (categoryFromBackend[category] ?? "lain-lain") as PoolNeedCategory;
}

function mapProductCategory(category: string, fallback: PoolNeedCategory) {
  return (productCategoryMap[category] ?? fallback) as PoolNeedCategory;
}

function mergePoolUiCache(pool: PoolRecord): PoolRecord {
  const cache = poolUiCache.get(pool.id);

  if (!cache) {
    return pool;
  }

  const suggestions = [...(cache.suggestions ?? [])];
  const knownSuggestionIds = new Set(suggestions.map((suggestion) => suggestion.id));

  for (const suggestion of pool.suggestions) {
    if (!knownSuggestionIds.has(suggestion.id)) {
      suggestions.push(suggestion);
      knownSuggestionIds.add(suggestion.id);
    }
  }

  return {
    ...pool,
    suggestedAt: cache.suggestedAt ?? pool.suggestedAt,
    suggestionFilter: cache.suggestionFilter ?? pool.suggestionFilter,
    suggestions,
    votingStartedAt: cache.votingStartedAt ?? pool.votingStartedAt,
  };
}

function patchPoolUiCache(poolId: string, patch: PoolUiCache) {
  const previous = poolUiCache.get(poolId) ?? {};
  poolUiCache.set(poolId, { ...previous, ...patch });
  rememberPoolId(poolId);
}

function mapBackendPool(basePool: BackendPool): PoolRecord {
  rememberPoolId(basePool.id);

  return {
    approvedAt: basePool.approvedAt,
    combinedCapCents: basePool.combinedCapCents,
    createdAt: basePool.createdAt,
    deliveredAt: basePool.deliveredAt,
    id: basePool.id,
    initiatorUserId: basePool.initiatorUserId,
    inviteCode: basePool.inviteCode,
    kampungId: basePool.kampung.id,
    kampungName: basePool.kampung.name,
    lockedAt: basePool.lockedAt,
    maxMembers: 8,
    members: basePool.members.map((member) => ({
      id: member.id,
      userId: member.userId,
      name: member.userName,
      email: member.userEmail,
      isInitiator: member.userId === basePool.initiatorUserId,
      joinedAt: member.joinedAt,
      individualAllowanceCents: member.individualPaylaterCents,
      individualAllowanceAtLockCents:
        member.individualAllowanceAtLockCents > 0 ? member.individualAllowanceAtLockCents : null,
    })),
    name: basePool.name,
    selectedSuggestionId: basePool.selectedCatalogueItemId
      ? createSuggestionId(basePool.id, basePool.selectedCatalogueItemId)
      : null,
    state: (stateMap[basePool.state] ?? "draft") as PoolState,
    statedNeedCategory: mapBackendCategory(basePool.category),
    statedNeedText: basePool.statedNeed,
    suggestedAt: null,
    suggestionFilter: "semua",
    suggestions: [],
    targetBudgetCents: basePool.targetBudgetCents,
    transaction: null,
    votingStartedAt: null,
    votes: [],
  };
}

function buildVoteRecord(poolId: string, vote: BackendVotingState["votes"][number]): PoolVoteRecord {
  return {
    id: `vote-${poolId}-${vote.userId}-${vote.votedAt}`,
    userId: vote.userId,
    userName: vote.userName,
    vote: vote.vote,
    votedAt: vote.votedAt,
  };
}

function buildTransactionFromLedger(
  pool: PoolRecord,
  ledger: BackendLedgerEntry[],
  itemNameBm: string,
): PoolTransactionRecord {
  const obligations: PoolObligationRecord[] = ledger.map((entry) => {
    const member = pool.members.find((poolMember) => poolMember.userId === entry.member.id);

    return {
      id: entry.obligationId,
      monthlyAmountCents: entry.perCycleCents,
      poolMemberId: member?.id ?? entry.member.id,
      shareAmountCents: entry.shareAmountCents,
      sharePct: entry.sharePct,
      totalCycles: entry.totalCycles,
      userId: entry.member.id,
      userName: entry.member.name,
    };
  });

  return {
    approvedAt: pool.approvedAt ?? new Date().toISOString(),
    deliveredAt: pool.deliveredAt,
    id: `pool-transaction-${pool.id}`,
    itemNameBm,
    obligations,
    suggestionId: pool.selectedSuggestionId ?? `suggestion-${pool.id}`,
    totalAmountCents: obligations.reduce((sum, obligation) => sum + obligation.shareAmountCents, 0),
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };

    throw new ApiRequestError(
      body.error?.message ?? `Request failed (${response.status})`,
      response.status,
    );
  }

  return (await response.json()) as ApiResponse<T>;
}

async function fetchProduct(productId: string): Promise<BackendProduct | null> {
  try {
    const response = await apiFetch<BackendProduct>(`/api/v1/mykasih/products/${productId}`);
    return response.data;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

async function buildSuggestionRecords(
  poolId: string,
  fallbackCategory: PoolNeedCategory,
  suggestions: BackendSuggestion[],
): Promise<PoolSuggestionRecord[]> {
  const products = await Promise.all(
    suggestions.map(async (suggestion) => [suggestion.itemId, await fetchProduct(suggestion.itemId)] as const),
  );
  const productById = new Map(products);

  return suggestions.map((suggestion, index) => {
    const product = productById.get(suggestion.itemId);
    const category = product ? mapProductCategory(product.category, fallbackCategory) : fallbackCategory;

    return {
      id: createSuggestionId(poolId, suggestion.itemId),
      productId: suggestion.itemId,
      nameBm: product?.nameMs ?? suggestion.itemName,
      priceCents: suggestion.priceCents,
      category,
      allocationPct: suggestion.allocationPct,
      imageUrl: product?.imageUrl ?? null,
      rank: index + 1,
      reasoningBm: suggestion.reasoningBm,
    };
  });
}

async function ensureSelectedSuggestion(pool: PoolRecord): Promise<PoolRecord> {
  if (!pool.selectedSuggestionId) {
    return pool;
  }

  const alreadySelected = pool.suggestions.some(
    (suggestion) => suggestion.id === pool.selectedSuggestionId,
  );

  if (alreadySelected) {
    return pool;
  }

  const productId = extractProductId(pool.id, pool.selectedSuggestionId);
  const product = await fetchProduct(productId);

  if (!product) {
    return pool;
  }

  const syntheticSuggestion: PoolSuggestionRecord = {
    id: createSuggestionId(pool.id, product.id),
    productId: product.id,
    nameBm: product.nameMs ?? product.name,
    priceCents: Math.round(Number(product.priceRm) * 100),
    category: mapProductCategory(product.category, pool.statedNeedCategory),
    allocationPct: Math.max(
      1,
      Math.round(
        (Math.round(Number(product.priceRm) * 100) /
          Math.max(pool.combinedCapCents ?? calculateLiveCombinedCapCents(pool), 1)) *
          100,
      ),
    ),
    imageUrl: product.imageUrl,
    rank: 1,
    reasoningBm:
      "Item dipulihkan daripada katalog backend supaya keputusan undian dan ringkasan transaksi kekal kelihatan.",
  };

  return mergePoolUiCache({
    ...pool,
    suggestions: [...pool.suggestions, syntheticSuggestion],
  });
}

async function hydratePoolRecord(basePool: BackendPool): Promise<PoolRecord> {
  let pool = mergePoolUiCache(mapBackendPool(basePool));
  pool = await ensureSelectedSuggestion(pool);

  if (pool.selectedSuggestionId && ["voting", "approved", "active"].includes(pool.state)) {
    const votingState = await apiFetch<BackendVotingState>(`/api/v1/pools/${pool.id}/voting-state`).catch(
      (error) => {
        if (error instanceof ApiRequestError && error.status === 400) {
          return null;
        }

        throw error;
      },
    );

    if (votingState) {
      const votes = votingState.data.votes.map((vote) => buildVoteRecord(pool.id, vote));
      const votingStartedAt =
        votes.at(0)?.votedAt ??
        poolUiCache.get(pool.id)?.votingStartedAt ??
        pool.votingStartedAt ??
        pool.lockedAt;

      patchPoolUiCache(pool.id, { votingStartedAt });
      pool = {
        ...pool,
        votes,
        votingStartedAt,
      };
    }
  }

  if (pool.selectedSuggestionId && ["approved", "active"].includes(pool.state)) {
    const ledger = await apiFetch<BackendLedger>(`/api/v1/pools/${pool.id}/ledger`).catch((error) => {
      if (error instanceof ApiRequestError && error.status === 400) {
        return null;
      }

      throw error;
    });

    if (ledger) {
      const selectedSuggestion = getSelectedSuggestion(pool);
      const productId = extractProductId(pool.id, pool.selectedSuggestionId);
      const product = selectedSuggestion ? null : await fetchProduct(productId);
      const itemNameBm =
        selectedSuggestion?.nameBm ??
        product?.nameMs ??
        product?.name ??
        "Item pool";

      pool = {
        ...pool,
        transaction: buildTransactionFromLedger(pool, ledger.data.ledger, itemNameBm),
      };
    }
  }

  return mergePoolUiCache(pool);
}

async function fetchPoolRecord(poolId: string): Promise<PoolRecord | null> {
  try {
    const response = await apiFetch<{ pool: BackendPool }>(`/api/v1/pools/${poolId}`);
    return hydratePoolRecord(response.data.pool);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export const poolsClient = {
  async listMine(userId: string): Promise<PoolListItem[]> {
    const response = await apiFetch<{ pools: BackendPool[] }>("/api/v1/pools/mine");
    const pools = response.data.pools.map((pool) => {
      rememberPoolId(pool.id);
      return toPoolListItem(mapBackendPool(pool), userId);
    });

    return pools;
  },

  async listForNadi(user: MemberProfile): Promise<PoolRecord[]> {
    if (user.role !== "nadi_staff") {
      return [];
    }

    const response = await apiFetch<{ pools: BackendPool[] }>("/api/v1/pools/nadi").catch(
      (error) => {
        if (error instanceof ApiRequestError && (error.status === 403 || error.status === 404)) {
          return null;
        }

        throw error;
      },
    );

    if (response) {
      const hydratedPools = await Promise.all(response.data.pools.map(hydratePoolRecord));
      hydratedPools.forEach((pool) => rememberPoolId(pool.id));

      if (hydratedPools.length > 0) {
        return hydratedPools;
      }
    }

    return listLocalNadiPools(user);
  },

  async getById(poolId: string): Promise<PoolRecord | null> {
    return fetchPoolRecord(poolId);
  },

  async getByInviteCode(code: string): Promise<PoolRecord | null> {
    try {
      const response = await apiFetch<{ pool: BackendPool }>(`/api/v1/pools/by-code/${code}`);
      return hydratePoolRecord(response.data.pool);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 404) {
        return null;
      }

      throw error;
    }
  },

  async create(input: CreatePoolInput, user: MemberProfile): Promise<PoolRecord> {
    const response = await apiFetch<{ pool: BackendPool }>("/api/v1/pools", {
      method: "POST",
      body: JSON.stringify({
        kampungId: user.kampung.id,
        name: input.name,
        statedNeed: input.statedNeedText,
        category: categoryToBackend[input.statedNeedCategory],
        targetBudgetCents: input.targetBudgetCents,
      }),
    });

    return hydratePoolRecord(response.data.pool);
  },

  async join(inviteCode: string, user: MemberProfile): Promise<PoolRecord> {
    void user;

    const response = await apiFetch<{ poolId: string }>("/api/v1/pools/join", {
      method: "POST",
      body: JSON.stringify({ code: inviteCode }),
    });

    const pool = await fetchPoolRecord(response.data.poolId);

    if (!pool) {
      throw new Error("Pool tak ditemui selepas join.");
    }

    return pool;
  },

  async lock(poolId: string, userId: string): Promise<PoolRecord> {
    void userId;

    await apiFetch(`/api/v1/pools/${poolId}/lock`, { method: "POST" });

    const pool = await fetchPoolRecord(poolId);

    if (!pool) {
      throw new Error("Pool tak ditemui selepas lock.");
    }

    return pool;
  },

  async suggest(poolId: string, filter: PoolSuggestionFilter = "semua"): Promise<PoolRecord> {
    const currentPool = await fetchPoolRecord(poolId);

    if (!currentPool) {
      throw new Error("Pool tak ditemui.");
    }

    const response = await apiFetch<{
      items: BackendSuggestion[];
      provider: string;
      cached: boolean;
      suggestedAt: string;
    }>(`/api/v1/pools/${poolId}/suggest`, {
      method: "POST",
    });

    const suggestions = await buildSuggestionRecords(
      poolId,
      currentPool.statedNeedCategory,
      response.data.items,
    );

    patchPoolUiCache(poolId, {
      suggestedAt: response.data.suggestedAt,
      suggestionFilter: filter,
      suggestions,
    });

    const pool = await fetchPoolRecord(poolId);

    if (!pool) {
      throw new Error("Pool tak ditemui selepas jana cadangan.");
    }

    return {
      ...pool,
      state: "suggesting",
      suggestedAt: response.data.suggestedAt,
      suggestionFilter: filter,
      suggestions,
    };
  },

  async chooseSuggestion(poolId: string, suggestionId: string): Promise<PoolRecord> {
    const cache = poolUiCache.get(poolId);
    const cachedSuggestion = cache?.suggestions?.find((suggestion) => suggestion.id === suggestionId);
    const productId = cachedSuggestion?.productId ?? extractProductId(poolId, suggestionId);

    await apiFetch(`/api/v1/pools/${poolId}/select-item`, {
      method: "POST",
      body: JSON.stringify({ catalogueItemId: productId }),
    });

    patchPoolUiCache(poolId, {
      votingStartedAt: new Date().toISOString(),
    });

    const pool = await fetchPoolRecord(poolId);

    if (!pool) {
      throw new Error("Pool tak ditemui selepas pilih barang.");
    }

    return pool;
  },

  async vote(poolId: string, userId: string, vote: PoolVoteChoice): Promise<PoolRecord> {
    void userId;

    await apiFetch(`/api/v1/pools/${poolId}/vote`, {
      method: "POST",
      body: JSON.stringify({ vote }),
    });

    const pool = await fetchPoolRecord(poolId);

    if (!pool) {
      throw new Error("Pool tak ditemui selepas undian dihantar.");
    }

    return pool;
  },

  async confirmDelivery(poolId: string, user: MemberProfile): Promise<PoolRecord> {
    void user;

    await apiFetch(`/api/v1/pools/${poolId}/confirm-delivery`, {
      method: "POST",
    });

    const pool = await fetchPoolRecord(poolId);

    if (!pool) {
      throw new Error("Pool tak ditemui selepas pengesahan penghantaran.");
    }

    return pool;
  },

  async listCatalogue(filter?: PoolSuggestionFilter): Promise<CatalogueProduct[]> {
    return listFallbackCatalogue(filter);
  },

  getSelectedSuggestion,

  countCatalogueMatches: (pool: PoolRecord, filter?: PoolSuggestionFilter) => {
    void filter;

    const cap = pool.combinedCapCents ?? calculateLiveCombinedCapCents(pool);
    return cap > 0 ? 1 : 0;
  },

  buildShareLink: (pool: PoolRecord) =>
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${pool.inviteCode}`
      : `/join/${pool.inviteCode}`,
};
