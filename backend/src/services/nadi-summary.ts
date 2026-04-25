/**
 * NADI Weekly Summary — 2nd AI use-case.
 *
 * Generates a BM-first weekly digest for NADI staff covering:
 *   - Pools formed this week (count + breakdown by category)
 *   - Items most requested (top 5 catalogue items)
 *   - Kampung trust score trends (Δ vs last week)
 *   - Repayment anomalies (clusters of late payments suggesting kampung-level distress)
 *
 * Same multi-cloud routing pattern as `penasihat.ts` — Alibaba Function Compute
 * primary (Qwen for BM-native summarisation), Anthropic Claude fallback.
 *
 * NADI staff sees this on `/nadi/dashboard` as the weekly briefing card.
 */

import { env } from "@/env";
import { logger } from "@/lib/logger";

export type WeeklyContext = {
  kampungId: string;
  kampungName: string;
  weekStart: string; // ISO-8601
  poolsFormedCount: number;
  poolsFormedByCategory: Record<string, number>;
  topRequestedItems: Array<{ name: string; count: number }>;
  trustScoreNow: number;
  trustScoreLastWeek: number;
  latePaymentEvents: Array<{ poolId: string; memberCount: number; daysLate: number }>;
};

export type Summary = {
  headline_bm: string;
  observations_bm: string[]; // 3-5 bullet points
  anomalies_bm: string[];    // 0-3 anomalies surfaced (empty array if none)
  suggestion_bm: string;
};

const ALIBABA_TIMEOUT_MS = 5000;

export async function summariseWeek(
  ctx: WeeklyContext,
): Promise<{ summary: Summary; provider: "alibaba-qwen" | "anthropic-claude" }> {
  if (env.ALIBABA_FUNCTION_COMPUTE_URL_NADI) {
    try {
      const summary = await callAlibabaSummary(ctx);
      return { summary, provider: "alibaba-qwen" };
    } catch (err) {
      logger.warn({ err }, "Alibaba NADI summary failed; falling back to Anthropic Claude");
    }
  }
  const summary = await callClaudeSummary(ctx);
  return { summary, provider: "anthropic-claude" };
}

async function callAlibabaSummary(ctx: WeeklyContext): Promise<Summary> {
  const url = env.ALIBABA_FUNCTION_COMPUTE_URL_NADI;
  if (!url) throw new Error("ALIBABA_FUNCTION_COMPUTE_URL_NADI not set");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ALIBABA_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.ALIBABA_FUNCTION_COMPUTE_KEY
          ? { "X-Fc-Auth-Key": env.ALIBABA_FUNCTION_COMPUTE_KEY }
          : {}),
      },
      body: JSON.stringify({ context: ctx }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Alibaba FC NADI returned ${res.status}`);
    return (await res.json()) as Summary;
  } finally {
    clearTimeout(timeout);
  }
}

async function callClaudeSummary(ctx: WeeklyContext): Promise<Summary> {
  // Demo-stub heuristic — Phase 5 wires real Claude integration.
  const trustDelta = ctx.trustScoreNow - ctx.trustScoreLastWeek;
  const observations: string[] = [
    `${ctx.poolsFormedCount} pool baru terbentuk minggu ni di ${ctx.kampungName}.`,
  ];
  if (ctx.topRequestedItems[0]) {
    observations.push(
      `Barang paling banyak diminta: ${ctx.topRequestedItems[0].name} (${ctx.topRequestedItems[0].count} pool).`,
    );
  }
  observations.push(
    `Skor kepercayaan kampung sekarang ${ctx.trustScoreNow.toFixed(0)} (${trustDelta >= 0 ? "+" : ""}${trustDelta.toFixed(1)} dari minggu lepas).`,
  );

  const anomalies: string[] = [];
  for (const event of ctx.latePaymentEvents) {
    if (event.memberCount >= 3) {
      anomalies.push(
        `${event.memberCount} ahli pool ${event.poolId.slice(0, 8)} bayar lewat ${event.daysLate} hari — clusters seperti ni boleh jadi tanda kesusahan kampung.`,
      );
    }
  }

  return {
    headline_bm: `Ringkasan minggu untuk ${ctx.kampungName}`,
    observations_bm: observations,
    anomalies_bm: anomalies,
    suggestion_bm:
      anomalies.length > 0
        ? "Cadang follow-up dengan ahli pool yang bayar lewat — mungkin perlu sokongan tambahan dari NADI."
        : "Kampung kekal sihat. Teruskan operasi pool seperti biasa.",
  };
}
