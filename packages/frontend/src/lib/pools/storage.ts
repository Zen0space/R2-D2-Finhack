import type { MemberProfile } from "@/types/auth";
import type {
  CreatePoolInput,
  PoolJoinPreview,
  PoolListItem,
  PoolMemberSnapshot,
  PoolNeedCategory,
  PoolObligationRecord,
  PoolRecord,
  PoolSuggestionFilter,
  PoolSuggestionRecord,
  PoolTransactionRecord,
  PoolVoteChoice,
  PoolVoteRecord,
  PoolVotingState,
} from "@/types/pool";
import { buildPoolSuggestions, listCatalogueItems } from "./catalogue";

const POOLS_KEY = "duitlater.phase2.pools";
const INVITE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEFAULT_POOL_CAPACITY = 8;
const MIN_MEMBERS_TO_LOCK = 2;
const DEFAULT_REPAYMENT_CYCLES = 6;

type ShareAllocation = Omit<PoolObligationRecord, "id"> & {
  remainder: number;
};

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
    approvedAt: pool.approvedAt ?? null,
    deliveredAt: pool.deliveredAt ?? null,
    selectedSuggestionId: pool.selectedSuggestionId ?? null,
    suggestedAt: pool.suggestedAt ?? null,
    suggestionFilter: pool.suggestionFilter ?? "semua",
    suggestions: pool.suggestions ?? [],
    transaction: pool.transaction ?? null,
    votingStartedAt: pool.votingStartedAt ?? null,
    votes: pool.votes ?? [],
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

function getMemberContributionCents(member: PoolMemberSnapshot) {
  return member.individualAllowanceAtLockCents ?? member.individualAllowanceCents;
}

function buildShareAllocations(pool: PoolRecord, totalAmountCents: number): ShareAllocation[] {
  if (pool.members.length === 0) {
    return [];
  }

  const members = pool.members.map((member) => ({
    contributionCents: getMemberContributionCents(member),
    member,
  }));

  const totalContributionCents = members.reduce(
    (sum, entry) => sum + Math.max(entry.contributionCents, 0),
    0,
  );
  const effectiveContributionCents =
    totalContributionCents > 0 ? totalContributionCents : members.length;

  const baseAllocations = members.map((entry, index) => {
    const weight = totalContributionCents > 0 ? Math.max(entry.contributionCents, 0) : 1;
    const exactShare = (totalAmountCents * weight) / effectiveContributionCents;
    const shareAmountCents = Math.floor(exactShare);
    const sharePct = effectiveContributionCents > 0 ? (weight / effectiveContributionCents) * 100 : 0;

    return {
      index,
      allocation: {
        monthlyAmountCents: Math.round(shareAmountCents / DEFAULT_REPAYMENT_CYCLES),
        poolMemberId: entry.member.id,
        remainder: exactShare - shareAmountCents,
        shareAmountCents,
        sharePct: Math.round(sharePct * 100) / 100,
        totalCycles: DEFAULT_REPAYMENT_CYCLES,
        userId: entry.member.userId,
        userName: entry.member.name,
      },
    };
  });

  const allocatedCents = baseAllocations.reduce(
    (sum, entry) => sum + entry.allocation.shareAmountCents,
    0,
  );
  const remainingCents = Math.max(totalAmountCents - allocatedCents, 0);

  const remainderOrder = [...baseAllocations].sort((left, right) => {
    if (right.allocation.remainder !== left.allocation.remainder) {
      return right.allocation.remainder - left.allocation.remainder;
    }

    return left.index - right.index;
  });

  for (let index = 0; index < remainingCents; index += 1) {
    const target = remainderOrder[index];

    if (!target) {
      break;
    }

    target.allocation.shareAmountCents += 1;
    target.allocation.monthlyAmountCents = Math.round(
      target.allocation.shareAmountCents / DEFAULT_REPAYMENT_CYCLES,
    );
  }

  return baseAllocations
    .sort((left, right) => left.index - right.index)
    .map((entry) => entry.allocation);
}

function buildTransactionForPool(
  pool: PoolRecord,
  suggestion: PoolSuggestionRecord,
): PoolTransactionRecord {
  const approvedAt = new Date().toISOString();
  const obligations = buildShareAllocations(pool, suggestion.priceCents).map((allocation) => ({
    ...allocation,
    id: createId("obligation"),
  }));

  return {
    approvedAt,
    deliveredAt: null,
    id: createId("pool-transaction"),
    itemNameBm: suggestion.nameBm,
    obligations,
    suggestionId: suggestion.id,
    totalAmountCents: suggestion.priceCents,
  };
}

function buildVoteRecord(
  member: PoolMemberSnapshot,
  vote: PoolVoteChoice,
): PoolVoteRecord {
  return {
    id: createId("pool-vote"),
    userId: member.userId,
    userName: member.name,
    vote,
    votedAt: new Date().toISOString(),
  };
}

export function calculateLiveCombinedCapCents(pool: PoolRecord) {
  return pool.members.reduce((sum, member) => sum + member.individualAllowanceCents, 0);
}

export function buildVotingState(pool: PoolRecord): PoolVotingState {
  const yesCount = pool.votes.filter((vote) => vote.vote === "YES").length;
  const noCount = pool.votes.filter((vote) => vote.vote === "NO").length;
  const votedMemberIds = new Set(pool.votes.map((vote) => vote.userId));
  const pendingMembers = pool.members.filter((member) => !votedMemberIds.has(member.userId));
  const majorityThreshold = Math.floor(pool.members.length / 2) + 1;

  return {
    hasMajorityApproval: yesCount >= majorityThreshold,
    majorityThreshold,
    noCount,
    pendingMemberIds: pendingMembers.map((member) => member.userId),
    pendingMemberNames: pendingMembers.map((member) => member.name),
    totalMembers: pool.members.length,
    yesCount,
  };
}

export function getMemberVote(pool: PoolRecord, userId: string) {
  return pool.votes.find((vote) => vote.userId === userId) ?? null;
}

export function getMemberSharePreview(pool: PoolRecord, userId: string) {
  if (pool.transaction) {
    return pool.transaction.obligations.find((obligation) => obligation.userId === userId) ?? null;
  }

  const selectedSuggestion = getSelectedSuggestion(pool);

  if (!selectedSuggestion) {
    return null;
  }

  return buildShareAllocations(pool, selectedSuggestion.priceCents).find(
    (allocation) => allocation.userId === userId,
  ) ?? null;
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

export function listPoolsForNadi(user: MemberProfile) {
  if (user.role !== "nadi_staff") {
    return [];
  }

  return readPools()
    .filter((pool) => pool.kampungId === user.kampung.id)
    .filter((pool) => ["approved", "active", "completed"].includes(pool.state))
    .sort((left, right) => {
      const rightDate = right.approvedAt ?? right.createdAt;
      const leftDate = left.approvedAt ?? left.createdAt;

      return rightDate.localeCompare(leftDate);
    });
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
    approvedAt: null,
    combinedCapCents: null,
    createdAt: new Date().toISOString(),
    deliveredAt: null,
    id: createId("pool"),
    initiatorUserId: user.id,
    inviteCode,
    kampungId: user.kampung.id,
    kampungName: user.kampung.name,
    lockedAt: null,
    maxMembers: DEFAULT_POOL_CAPACITY,
    members: [createMemberSnapshot(user, true)],
    name: input.name.trim(),
    selectedSuggestionId: null,
    state: "draft",
    statedNeedCategory: input.statedNeedCategory,
    statedNeedText: input.statedNeedText.trim(),
    suggestedAt: null,
    suggestionFilter: "semua",
    suggestions: [],
    targetBudgetCents: input.targetBudgetCents,
    transaction: null,
    votingStartedAt: null,
    votes: [],
  };

  writePools([pool, ...pools]);

  return pool;
}

export function joinPool(inviteCode: string, user: MemberProfile) {
  const normalizedCode = normalizeInviteCode(inviteCode);
  const pools = readPools();
  const poolIndex = pools.findIndex((pool) => pool.inviteCode === normalizedCode);

  if (poolIndex < 0) {
    throw new Error("Invite code not found.");
  }

  const pool = pools[poolIndex];

  if (!pool) {
    throw new Error("Pool not found.");
  }

  if (pool.state !== "draft") {
    throw new Error("Pool is locked — joining is no longer allowed.");
  }

  if (pool.kampungId !== user.kampung.id) {
    throw new Error(`Pool is restricted to members of ${pool.kampungName}.`);
  }

  if (pool.members.some((member) => member.userId === user.id)) {
    return pool;
  }

  if (pool.members.length >= pool.maxMembers) {
    throw new Error("Pool is full.");
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
    throw new Error("Pool not found.");
  }

  const pool = pools[poolIndex];

  if (!pool) {
    throw new Error("Pool not found.");
  }

  if (pool.initiatorUserId !== userId) {
    throw new Error("Only the pool initiator can lock this pool.");
  }

  if (pool.state !== "draft") {
    throw new Error("Pool is no longer in draft state.");
  }

  if (pool.members.length < MIN_MEMBERS_TO_LOCK) {
    throw new Error("Pool needs at least 2 members before it can be locked.");
  }

  const combinedCapCents = calculateLiveCombinedCapCents(pool);
  const updatedPool: PoolRecord = {
    ...pool,
    combinedCapCents,
    lockedAt: new Date().toISOString(),
    members: pool.members.map((member) => ({
      ...member,
      individualAllowanceAtLockCents: member.individualAllowanceCents,
    })),
    state: "locked",
  };

  pools[poolIndex] = updatedPool;
  writePools(pools);

  return updatedPool;
}

export function suggestPool(poolId: string, filter: PoolSuggestionFilter = "semua") {
  const pools = readPools();
  const poolIndex = pools.findIndex((pool) => pool.id === poolId);

  if (poolIndex < 0) {
    throw new Error("Pool not found.");
  }

  const pool = pools[poolIndex];

  if (!pool) {
    throw new Error("Pool not found.");
  }

  if (!["locked", "suggesting"].includes(pool.state)) {
    throw new Error("Suggestions can only be generated after the pool is locked.");
  }

  const suggestions = buildPoolSuggestions(pool, filter);

  if (suggestions.length === 0) {
    throw new Error("No catalogue items fit within the pool's combined cap.");
  }

  const updatedPool: PoolRecord = {
    ...pool,
    approvedAt: null,
    deliveredAt: null,
    selectedSuggestionId: null,
    state: "suggesting",
    suggestedAt: new Date().toISOString(),
    suggestionFilter: filter,
    suggestions,
    transaction: null,
    votingStartedAt: null,
    votes: [],
  };

  pools[poolIndex] = updatedPool;
  writePools(pools);

  return updatedPool;
}

export function selectSuggestion(poolId: string, suggestionId: string) {
  const pools = readPools();
  const poolIndex = pools.findIndex((pool) => pool.id === poolId);

  if (poolIndex < 0) {
    throw new Error("Pool not found.");
  }

  const pool = pools[poolIndex];

  if (!pool) {
    throw new Error("Pool not found.");
  }

  const selectedSuggestion = pool.suggestions.find((suggestion) => suggestion.id === suggestionId);

  if (!selectedSuggestion) {
    throw new Error("This suggestion is no longer available.");
  }

  if (!["suggesting", "locked"].includes(pool.state)) {
    throw new Error("Pool is not in the suggestion-selection phase.");
  }

  const updatedPool: PoolRecord = {
    ...pool,
    approvedAt: null,
    deliveredAt: null,
    selectedSuggestionId: suggestionId,
    state: "voting",
    transaction: null,
    votingStartedAt: new Date().toISOString(),
    votes: [],
  };

  pools[poolIndex] = updatedPool;
  writePools(pools);

  return updatedPool;
}

export function voteOnPool(poolId: string, userId: string, vote: PoolVoteChoice) {
  const pools = readPools();
  const poolIndex = pools.findIndex((pool) => pool.id === poolId);

  if (poolIndex < 0) {
    throw new Error("Pool not found.");
  }

  const pool = pools[poolIndex];

  if (!pool) {
    throw new Error("Pool not found.");
  }

  if (pool.state !== "voting") {
    throw new Error("Voting is only open while the pool is in the voting phase.");
  }

  const member = pool.members.find((entry) => entry.userId === userId);

  if (!member) {
    throw new Error("Only pool members can vote.");
  }

  if (pool.votes.some((entry) => entry.userId === userId)) {
    throw new Error("You have already voted in this round.");
  }

  const selectedSuggestion = getSelectedSuggestion(pool);

  if (!selectedSuggestion) {
    throw new Error("No item has been selected for voting yet.");
  }

  const poolWithVote: PoolRecord = {
    ...pool,
    votes: [...pool.votes, buildVoteRecord(member, vote)],
  };
  const votingState = buildVotingState(poolWithVote);

  const updatedPool =
    votingState.hasMajorityApproval
      ? {
          ...poolWithVote,
          approvedAt: new Date().toISOString(),
          state: "approved" as const,
          transaction: buildTransactionForPool(poolWithVote, selectedSuggestion),
        }
      : poolWithVote;

  if (updatedPool.state === "approved" && updatedPool.transaction) {
    updatedPool.approvedAt = updatedPool.transaction.approvedAt;
  }

  pools[poolIndex] = updatedPool;
  writePools(pools);

  return updatedPool;
}

export function confirmPoolDelivery(poolId: string, user: MemberProfile) {
  const pools = readPools();
  const poolIndex = pools.findIndex((pool) => pool.id === poolId);

  if (poolIndex < 0) {
    throw new Error("Pool not found.");
  }

  const pool = pools[poolIndex];

  if (!pool) {
    throw new Error("Pool not found.");
  }

  if (user.role !== "nadi_staff") {
    throw new Error("Only NADI staff can confirm delivery.");
  }

  if (pool.kampungId !== user.kampung.id) {
    throw new Error(`Pool is outside ${user.kampung.name}'s scope.`);
  }

  if (pool.state !== "approved" || !pool.transaction) {
    throw new Error("Pool is not awaiting delivery confirmation.");
  }

  const deliveredAt = new Date().toISOString();
  const updatedPool: PoolRecord = {
    ...pool,
    deliveredAt,
    state: "active",
    transaction: {
      ...pool.transaction,
      deliveredAt,
    },
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
