import type { MemberProfile } from "@/types/auth";
import type {
  CreatePoolInput,
  PoolJoinPreview,
  PoolListItem,
  PoolMemberSnapshot,
  PoolNeedCategory,
  PoolRecord,
  PoolSuggestionFilter,
} from "@/types/pool";
import { buildPoolSuggestions, listCatalogueItems } from "./catalogue";

const POOLS_KEY = "duitlater.phase2.pools";
const INVITE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEFAULT_POOL_CAPACITY = 8;
const MIN_MEMBERS_TO_LOCK = 2;

function isBrowser() {
  return typeof window !== "undefined";
}

function storage() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage;
}

function parseJson<T>(value: string | null, fallback: T) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizePoolRecord(pool: PoolRecord): PoolRecord {
  return {
    ...pool,
    selectedSuggestionId: pool.selectedSuggestionId ?? null,
    suggestedAt: pool.suggestedAt ?? null,
    suggestionFilter: pool.suggestionFilter ?? "semua",
    suggestions: pool.suggestions ?? [],
  };
}

function readPools() {
  return parseJson<PoolRecord[]>(storage()?.getItem(POOLS_KEY) ?? null, []).map(normalizePoolRecord);
}

function writePools(pools: PoolRecord[]) {
  storage()?.setItem(POOLS_KEY, JSON.stringify(pools));
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

function normalizeInviteCode(code: string) {
  return code.trim().toUpperCase();
}

function generateInviteCode() {
  let result = "";

  for (let index = 0; index < 8; index += 1) {
    const randomIndex = Math.floor(Math.random() * INVITE_CHARS.length);
    result += INVITE_CHARS[randomIndex] ?? "A";
  }

  return result;
}

function createUniqueInviteCode(pools: PoolRecord[]) {
  let attempts = 0;

  while (attempts < 20) {
    const inviteCode = generateInviteCode();

    if (!pools.some((pool) => pool.inviteCode === inviteCode)) {
      return inviteCode;
    }

    attempts += 1;
  }

  return `${generateInviteCode().slice(0, 7)}X`;
}

function createMemberSnapshot(user: MemberProfile, isInitiator: boolean): PoolMemberSnapshot {
  return {
    id: createId("pool-member"),
    name: user.name,
    email: user.email,
    userId: user.id,
    joinedAt: new Date().toISOString(),
    isInitiator,
    individualAllowanceCents: user.individualPayLaterAllowanceCents,
    individualAllowanceAtLockCents: null,
  };
}

function resolveOrigin() {
  if (!isBrowser()) {
    return "";
  }

  return window.location.origin;
}

export function calculateLiveCombinedCapCents(pool: PoolRecord) {
  return pool.members.reduce((sum, member) => sum + member.individualAllowanceCents, 0);
}

export function listCatalogue(filter: PoolSuggestionFilter = "semua") {
  return listCatalogueItems(filter);
}

export function toPoolListItem(pool: PoolRecord, currentUserId: string): PoolListItem {
  return {
    id: pool.id,
    name: pool.name,
    state: pool.state,
    kampungName: pool.kampungName,
    statedNeedCategory: pool.statedNeedCategory,
    targetBudgetCents: pool.targetBudgetCents,
    combinedCapCents: pool.combinedCapCents,
    currentCombinedCapCents: calculateLiveCombinedCapCents(pool),
    inviteCode: pool.inviteCode,
    memberCount: pool.members.length,
    remainingSlots: Math.max(pool.maxMembers - pool.members.length, 0),
    isInitiator: pool.initiatorUserId === currentUserId,
  };
}

export function listPoolsForUser(userId: string) {
  return readPools()
    .filter((pool) => pool.members.some((member) => member.userId === userId))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((pool) => toPoolListItem(pool, userId));
}

export function getPoolById(poolId: string) {
  return readPools().find((pool) => pool.id === poolId) ?? null;
}

export function getPoolByInviteCode(inviteCode: string) {
  const normalizedCode = normalizeInviteCode(inviteCode);

  return readPools().find((pool) => pool.inviteCode === normalizedCode) ?? null;
}

export function buildPoolJoinPreview(pool: PoolRecord): PoolJoinPreview {
  return {
    inviteCode: pool.inviteCode,
    name: pool.name,
    kampungName: pool.kampungName,
    statedNeedCategory: pool.statedNeedCategory,
    statedNeedText: pool.statedNeedText,
    targetBudgetCents: pool.targetBudgetCents,
  };
}

export function buildPoolJoinPath(pool: PoolRecord) {
  const searchParams = new URLSearchParams({
    kampung: pool.kampungName,
    name: pool.name,
    need: pool.statedNeedText,
    category: pool.statedNeedCategory,
    target: String(pool.targetBudgetCents),
  });

  return `/join/${pool.inviteCode}?${searchParams.toString()}`;
}

export function buildPoolShareLink(pool: PoolRecord) {
  const joinPath = buildPoolJoinPath(pool);
  const origin = resolveOrigin();

  return origin ? `${origin}${joinPath}` : joinPath;
}

export function createPool(input: CreatePoolInput, user: MemberProfile) {
  const pools = readPools();
  const inviteCode = createUniqueInviteCode(pools);

  const pool: PoolRecord = {
    id: createId("pool"),
    name: input.name.trim(),
    statedNeedText: input.statedNeedText.trim(),
    statedNeedCategory: input.statedNeedCategory,
    targetBudgetCents: input.targetBudgetCents,
    inviteCode,
    state: "draft",
    initiatorUserId: user.id,
    kampungId: user.kampung.id,
    kampungName: user.kampung.name,
    createdAt: new Date().toISOString(),
    lockedAt: null,
    combinedCapCents: null,
    maxMembers: DEFAULT_POOL_CAPACITY,
    members: [createMemberSnapshot(user, true)],
    selectedSuggestionId: null,
    suggestedAt: null,
    suggestionFilter: "semua",
    suggestions: [],
  };

  writePools([pool, ...pools]);

  return pool;
}

export function joinPool(inviteCode: string, user: MemberProfile) {
  const normalizedCode = normalizeInviteCode(inviteCode);
  const pools = readPools();
  const poolIndex = pools.findIndex((pool) => pool.inviteCode === normalizedCode);

  if (poolIndex < 0) {
    throw new Error("Kod jemputan ini belum wujud dalam demo frontend ini.");
  }

  const pool = pools[poolIndex];

  if (!pool) {
    throw new Error("Pool tak ditemui.");
  }

  if (pool.state !== "draft") {
    throw new Error("Pool ini dah dikunci. Tak boleh sertai lagi.");
  }

  if (pool.kampungId !== user.kampung.id) {
    throw new Error(`Pool ini untuk ahli ${pool.kampungName}.`);
  }

  if (pool.members.some((member) => member.userId === user.id)) {
    return pool;
  }

  if (pool.members.length >= pool.maxMembers) {
    throw new Error("Pool ini dah penuh.");
  }

  const updatedPool: PoolRecord = {
    ...pool,
    members: [...pool.members, createMemberSnapshot(user, false)],
  };

  pools[poolIndex] = updatedPool;
  writePools(pools);

  return updatedPool;
}

export function lockPool(poolId: string, userId: string) {
  const pools = readPools();
  const poolIndex = pools.findIndex((pool) => pool.id === poolId);

  if (poolIndex < 0) {
    throw new Error("Pool tak ditemui.");
  }

  const pool = pools[poolIndex];

  if (!pool) {
    throw new Error("Pool tak ditemui.");
  }

  if (pool.initiatorUserId !== userId) {
    throw new Error("Hanya pencipta pool boleh lock pool ini.");
  }

  if (pool.state !== "draft") {
    throw new Error("Pool ini bukan lagi dalam status draft.");
  }

  if (pool.members.length < MIN_MEMBERS_TO_LOCK) {
    throw new Error("Pool perlukan sekurang-kurangnya 2 ahli sebelum boleh dikunci.");
  }

  const combinedCapCents = calculateLiveCombinedCapCents(pool);
  const updatedPool: PoolRecord = {
    ...pool,
    state: "locked",
    combinedCapCents,
    lockedAt: new Date().toISOString(),
    members: pool.members.map((member) => ({
      ...member,
      individualAllowanceAtLockCents: member.individualAllowanceCents,
    })),
  };

  pools[poolIndex] = updatedPool;
  writePools(pools);

  return updatedPool;
}

export function suggestPool(poolId: string, filter: PoolSuggestionFilter = "semua") {
  const pools = readPools();
  const poolIndex = pools.findIndex((pool) => pool.id === poolId);

  if (poolIndex < 0) {
    throw new Error("Pool tak ditemui.");
  }

  const pool = pools[poolIndex];

  if (!pool) {
    throw new Error("Pool tak ditemui.");
  }

  if (!["locked", "suggesting"].includes(pool.state)) {
    throw new Error("Cadangan barang hanya boleh dijana untuk pool yang sudah dikunci.");
  }

  const suggestions = buildPoolSuggestions(pool, filter);

  if (suggestions.length === 0) {
    throw new Error("Belum ada item katalog yang muat dalam combined cap pool ini.");
  }

  const updatedPool: PoolRecord = {
    ...pool,
    state: "suggesting",
    selectedSuggestionId: null,
    suggestedAt: new Date().toISOString(),
    suggestionFilter: filter,
    suggestions,
  };

  pools[poolIndex] = updatedPool;
  writePools(pools);

  return updatedPool;
}

export function selectSuggestion(poolId: string, suggestionId: string) {
  const pools = readPools();
  const poolIndex = pools.findIndex((pool) => pool.id === poolId);

  if (poolIndex < 0) {
    throw new Error("Pool tak ditemui.");
  }

  const pool = pools[poolIndex];

  if (!pool) {
    throw new Error("Pool tak ditemui.");
  }

  const selectedSuggestion = pool.suggestions.find((suggestion) => suggestion.id === suggestionId);

  if (!selectedSuggestion) {
    throw new Error("Cadangan barang ini belum tersedia lagi.");
  }

  if (!["suggesting", "locked"].includes(pool.state)) {
    throw new Error("Pool ini belum berada pada fasa pemilihan barang.");
  }

  const updatedPool: PoolRecord = {
    ...pool,
    state: "voting",
    selectedSuggestionId: suggestionId,
  };

  pools[poolIndex] = updatedPool;
  writePools(pools);

  return updatedPool;
}

export function getSelectedSuggestion(pool: PoolRecord) {
  if (!pool.selectedSuggestionId) {
    return null;
  }

  return pool.suggestions.find((suggestion) => suggestion.id === pool.selectedSuggestionId) ?? null;
}

export function countCatalogueMatches(pool: PoolRecord, filter: PoolSuggestionFilter = "semua") {
  const capCents = pool.combinedCapCents ?? calculateLiveCombinedCapCents(pool);

  return listCatalogueItems(filter).filter((product) => product.priceCents <= capCents).length;
}

export function parsePoolJoinPreview(searchParams: URLSearchParams, inviteCode: string): PoolJoinPreview {
  const category = searchParams.get("category");
  const target = searchParams.get("target");
  const targetBudgetCents = target ? Number(target) : null;

  return {
    inviteCode,
    name: searchParams.get("name"),
    kampungName: searchParams.get("kampung"),
    statedNeedText: searchParams.get("need"),
    statedNeedCategory: isPoolNeedCategory(category) ? category : null,
    targetBudgetCents: Number.isFinite(targetBudgetCents) ? targetBudgetCents : null,
  };
}

function isPoolNeedCategory(value: string | null): value is PoolNeedCategory {
  return value !== null && [
    "makanan",
    "alat-sekolah",
    "peralatan",
    "elektrik",
    "pertanian",
    "air",
    "rumah",
    "lain-lain",
  ].includes(value);
}
