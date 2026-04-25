import type { MemberProfile } from "@/types/auth";

export type PoolState =
  | "draft"
  | "locked"
  | "suggesting"
  | "voting"
  | "approved"
  | "active"
  | "completed"
  | "dissolved";

export type PoolNeedCategory =
  | "makanan"
  | "alat-sekolah"
  | "peralatan"
  | "elektrik"
  | "pertanian"
  | "air"
  | "rumah"
  | "lain-lain";

export type PoolSuggestionFilter = PoolNeedCategory | "semua";

export const poolNeedCategories = [
  { value: "makanan", label: "Makanan" },
  { value: "alat-sekolah", label: "Alat sekolah" },
  { value: "peralatan", label: "Peralatan" },
  { value: "elektrik", label: "Elektrik" },
  { value: "pertanian", label: "Pertanian" },
  { value: "air", label: "Air" },
  { value: "rumah", label: "Rumah" },
  { value: "lain-lain", label: "Lain-lain" },
] as const satisfies ReadonlyArray<{ label: string; value: PoolNeedCategory }>;

export type PoolMemberSnapshot = {
  email: string;
  id: string;
  individualAllowanceAtLockCents: number | null;
  individualAllowanceCents: number;
  isInitiator: boolean;
  joinedAt: string;
  name: string;
  userId: string;
};

export type CatalogueProduct = {
  category: PoolNeedCategory;
  descriptionBm: string;
  id: string;
  imageUrl: string | null;
  keywords: string[];
  nameBm: string;
  priceCents: number;
};

export type PoolSuggestionRecord = {
  allocationPct: number;
  category: PoolNeedCategory;
  id: string;
  imageUrl: string | null;
  nameBm: string;
  priceCents: number;
  productId: string;
  rank: number;
  reasoningBm: string;
};

export type PoolVoteChoice = "YES" | "NO";

export type PoolVoteRecord = {
  id: string;
  userId: string;
  userName: string;
  vote: PoolVoteChoice;
  votedAt: string;
};

export type PoolObligationRecord = {
  id: string;
  monthlyAmountCents: number;
  poolMemberId: string;
  shareAmountCents: number;
  sharePct: number;
  totalCycles: number;
  userId: string;
  userName: string;
};

export type PoolTransactionRecord = {
  approvedAt: string;
  deliveredAt: string | null;
  id: string;
  itemNameBm: string;
  obligations: PoolObligationRecord[];
  suggestionId: string;
  totalAmountCents: number;
};

export type PoolRepaymentCycleStatus = "PAID" | "DUE" | "PENDING";

export type PoolRepaymentCycleRecord = {
  amountCents: number;
  cycleNumber: number;
  paidAt: string | null;
  status: PoolRepaymentCycleStatus;
  tngReference: string | null;
};

export type PoolRepaymentLedgerEntry = {
  cycles: PoolRepaymentCycleRecord[];
  cyclesPaid: number;
  monthlyAmountCents: number;
  obligationId: string;
  outstandingAmountCents: number;
  progressPct: number;
  shareAmountCents: number;
  sharePct: number;
  totalCycles: number;
  userId: string;
  userName: string;
};

export type PoolRepaymentSummary = {
  cyclesPaid: number;
  cyclesTotal: number;
  memberCount: number;
};

export type PoolVotingState = {
  hasMajorityApproval: boolean;
  majorityThreshold: number;
  noCount: number;
  pendingMemberIds: string[];
  pendingMemberNames: string[];
  totalMembers: number;
  yesCount: number;
};

export type PoolRecord = {
  approvedAt: string | null;
  combinedCapCents: number | null;
  createdAt: string;
  deliveredAt: string | null;
  id: string;
  initiatorUserId: string;
  inviteCode: string;
  kampungId: string;
  kampungName: string;
  lockedAt: string | null;
  maxMembers: number;
  members: PoolMemberSnapshot[];
  name: string;
  selectedSuggestionId: string | null;
  state: PoolState;
  statedNeedCategory: PoolNeedCategory;
  statedNeedText: string;
  suggestedAt: string | null;
  suggestionFilter: PoolSuggestionFilter;
  suggestions: PoolSuggestionRecord[];
  targetBudgetCents: number;
  repaymentLedger?: PoolRepaymentLedgerEntry[];
  repaymentSummary?: PoolRepaymentSummary | null;
  transaction: PoolTransactionRecord | null;
  votingStartedAt: string | null;
  votes: PoolVoteRecord[];
};

export type KampungTrustRecord = {
  completionRatePct: number;
  kampungId: string;
  kampungName: string;
  labelBm: string;
  poolCount: number;
  score: number;
  signalCount: number;
  totalCycles: number;
  totalPaid: number;
};

export type CreatePoolInput = {
  name: string;
  statedNeedCategory: PoolNeedCategory;
  statedNeedText: string;
  targetBudgetCents: number;
};

export type PoolListItem = {
  combinedCapCents: number | null;
  currentCombinedCapCents: number;
  id: string;
  inviteCode: string;
  isInitiator: boolean;
  kampungName: string;
  memberCount: number;
  name: string;
  remainingSlots: number;
  state: PoolState;
  statedNeedCategory: PoolNeedCategory;
  targetBudgetCents: number;
};

export type PoolJoinPreview = {
  inviteCode: string;
  kampungName: string | null;
  name: string | null;
  statedNeedCategory: PoolNeedCategory | null;
  statedNeedText: string | null;
  targetBudgetCents: number | null;
};

export type PoolClientContext = {
  currentUser: MemberProfile;
};
