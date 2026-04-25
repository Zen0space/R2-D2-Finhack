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
