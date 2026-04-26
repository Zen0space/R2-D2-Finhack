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

export type NadiCentreSummary = {
  id: string;
  name: string;
  state: string;
  districtHint: string | null;
};

type BackendNadiCentre = {
  id: string;
  name: string;
  state: string;
  district_hint: string | null;
  raw_position: number;
};

export const nadiClient = {
  getCurrentWeekStart,

  async listCentres(params: { state?: string; district?: string; limit?: number } = {}) {
    const search = new URLSearchParams();
    if (params.state) search.set("state", params.state);
    if (params.district) search.set("district", params.district);
    search.set("limit", String(params.limit ?? 200));
    const response = await apiFetch<{
      centres: BackendNadiCentre[];
      meta: { total: number; limit: number; offset: number; returned: number };
    }>(`/api/v1/nadi/centres?${search.toString()}`);

    return {
      total: response.data.meta.total,
      centres: response.data.centres.map<NadiCentreSummary>((row) => ({
        id: row.id,
        name: row.name,
        state: row.state,
        districtHint: row.district_hint,
      })),
    };
  },

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
