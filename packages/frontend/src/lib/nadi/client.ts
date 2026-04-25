"use client";

import { apiFetch as baseApiFetch } from "@/lib/api/errors";
import { API_BASE } from "@/lib/auth/client";
import type { NadiDashboardStats, NadiWeeklySummaryRecord } from "@/types/nadi";

type BackendNadiSummary = {
  generatedAt: string;
  metrics: {
    activePools: number;
    latePaymentEvents: number;
    pendingDeliveryCount: number;
    poolsFormedCount: number;
    repaymentsThisWeek: number;
    topItemNameBm: string | null;
    trustDelta: number;
    trustScore: number;
  };
  provider: "alibaba-qwen" | "heuristic";
  summary: {
    anomalies_bm: string[];
    headline_bm: string;
    observations_bm: string[];
    suggestion_bm: string;
  };
  weekEnd: string;
  weekStart: string;
};

function apiFetch<T>(path: string, init?: RequestInit) {
  return baseApiFetch<T>(`${API_BASE}${path}`, init);
}

function getCurrentWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = (day + 6) % 7;
  const mondayUtc = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset),
  );

  return mondayUtc.toISOString();
}

function mapSummaryRecord(summary: BackendNadiSummary): NadiWeeklySummaryRecord {
  return {
    generatedAt: summary.generatedAt,
    metrics: summary.metrics,
    provider: summary.provider,
    summary: {
      anomaliesBm: summary.summary.anomalies_bm,
      headlineBm: summary.summary.headline_bm,
      observationsBm: summary.summary.observations_bm,
      suggestionBm: summary.summary.suggestion_bm,
    },
    weekEnd: summary.weekEnd,
    weekStart: summary.weekStart,
  };
}

export const nadiClient = {
  getCurrentWeekStart,

  async getWeeklySummary(kampungId: string, weekStart = getCurrentWeekStart()) {
    const response = await apiFetch<BackendNadiSummary>("/api/v1/nadi/summary", {
      method: "POST",
      body: JSON.stringify({ kampungId, weekStart }),
    });

    return mapSummaryRecord(response.data);
  },

  async getDashboard(kampungId?: string): Promise<NadiDashboardStats> {
    const query = kampungId ? `?kampungId=${encodeURIComponent(kampungId)}` : "";
    const response = await apiFetch<NadiDashboardStats>(`/api/v1/nadi/dashboard${query}`);
    return response.data;
  },
};
