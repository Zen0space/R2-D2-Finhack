export type NadiWeeklySummaryPayload = {
  anomaliesBm: string[];
  headlineBm: string;
  observationsBm: string[];
  suggestionBm: string;
};

export type NadiWeeklySummaryMetrics = {
  activePools: number;
  latePaymentEvents: number;
  pendingDeliveryCount: number;
  poolsFormedCount: number;
  repaymentsThisWeek: number;
  topItemNameBm: string | null;
  trustDelta: number;
  trustScore: number;
};

export type NadiWeeklySummaryRecord = {
  generatedAt: string;
  metrics: NadiWeeklySummaryMetrics;
  provider: "alibaba-qwen" | "heuristic";
  summary: NadiWeeklySummaryPayload;
  weekEnd: string;
  weekStart: string;
};

export type NadiPoolStateCounts = {
  DRAFT: number;
  LOCKED: number;
  SUGGESTING: number;
  VOTING: number;
  APPROVED: number;
  ACTIVE: number;
  COMPLETED: number;
  DISSOLVED: number;
};

export type NadiDashboardStats = {
  kampung: {
    id: string;
    name: string;
    districtHint: string | null;
    trustScore: number;
  };
  pools: {
    byState: NadiPoolStateCounts;
    pendingDelivery: number;
    active: number;
    completed: number;
    total: number;
  };
  members: {
    totalSeats: number;
  };
  finance: {
    totalDisbursedCents: number;
    repaymentCompletionPct: number;
    cyclesPaid: number;
    cyclesTotal: number;
  };
};
