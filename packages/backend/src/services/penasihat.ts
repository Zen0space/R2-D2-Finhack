/**
 * Penasihat — multi-cloud AI item suggester.
 *
 * Routes:
 *   1. ALIBABA_FUNCTION_COMPUTE_URL set → call Alibaba Cloud Function Compute
 *      (wraps Qwen-plus, BM-native LLM · sponsor-aligned).
 *   2. Else → fall back to deterministic heuristic ranking.
 *
 * Failover semantic: if Alibaba FC returns 5xx or times out, fall through
 * to heuristic. The same structured-output schema is returned regardless
 * of provider.
 */

import { log } from "../middleware/logger.js";

const ALIBABA_TIMEOUT_MS = 6000;

export type SuggestionContext = {
  poolId: string;
  combinedCapCents: number;
  statedNeed: string;
  statedNeedCategory: string;
  kampungName: string;
  monthOfYear: number;
};

export type CatalogueItem = {
  id: string;
  name_bm: string;
  category: string;
  price_cents: number;
};

export type Suggestion = {
  itemId: string;
  itemName: string;
  priceCents: number;
  allocationPct: number;
  reasoningBm: string;
  reasoningEn: string;
};

export type Provider = "alibaba-qwen" | "anthropic-claude" | "heuristic";

type EnvShape = {
  ALIBABA_FUNCTION_COMPUTE_URL?: string;
  ALIBABA_FUNCTION_COMPUTE_KEY?: string;
};

export async function suggestItems(
  ctx: SuggestionContext,
  candidates: CatalogueItem[],
): Promise<{ items: Suggestion[]; provider: Provider }> {
  const env = process.env as EnvShape;

  if (env.ALIBABA_FUNCTION_COMPUTE_URL) {
    try {
      const items = await callAlibabaFunctionCompute(ctx, candidates, env);
      return { items, provider: "alibaba-qwen" };
    } catch (err) {
      log(
        "WARN",
        `[penasihat] Alibaba FC failed → falling back to heuristic: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  return { items: rankCandidatesHeuristic(ctx, candidates), provider: "heuristic" };
}

async function callAlibabaFunctionCompute(
  ctx: SuggestionContext,
  candidates: CatalogueItem[],
  env: EnvShape,
): Promise<Suggestion[]> {
  const url = env.ALIBABA_FUNCTION_COMPUTE_URL;
  if (!url) throw new Error("ALIBABA_FUNCTION_COMPUTE_URL not set");

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
      body: JSON.stringify({ context: ctx, candidates }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Alibaba FC returned ${res.status}`);
    const data = (await res.json()) as { items: Suggestion[] };
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("Alibaba FC returned empty suggestions");
    }
    return data.items;
  } finally {
    clearTimeout(timeout);
  }
}

function rankCandidatesHeuristic(
  ctx: SuggestionContext,
  candidates: CatalogueItem[],
): Suggestion[] {
  const fits = candidates.filter((c) => c.price_cents <= ctx.combinedCapCents);
  // Prefer items closest to ~70% of the combined cap (well-utilised but headroom)
  const targetPrice = ctx.combinedCapCents * 0.7;

  return fits
    .sort((a, b) => Math.abs(a.price_cents - targetPrice) - Math.abs(b.price_cents - targetPrice))
    .slice(0, 5)
    .map((item) => ({
      itemId: item.id,
      itemName: item.name_bm,
      priceCents: item.price_cents,
      allocationPct: Math.round((item.price_cents / ctx.combinedCapCents) * 100),
      reasoningBm: `Padan dengan kapasiti pool RM ${(ctx.combinedCapCents / 100).toFixed(0)} dan keperluan "${ctx.statedNeed}".`,
      reasoningEn: `Fits pool capacity of RM ${(ctx.combinedCapCents / 100).toFixed(0)} and stated need "${ctx.statedNeed}".`,
    }));
}
