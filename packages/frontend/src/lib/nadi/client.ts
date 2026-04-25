"use client";

import { API_BASE } from "@/lib/auth/client";
import type { NadiWeeklySummaryRecord } from "@/types/nadi";

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
};
