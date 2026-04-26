/**
 * Penasihat — pool item suggester.
 *
 * Routes:
 *   1. BEDROCK_API_KEY set → call Claude Haiku 4.5 via Amazon Bedrock's
 *      OpenAI-compatible endpoint, wrapped by BAML for typed I/O.
 *   2. Else → fall back to deterministic heuristic ranking.
 *
 * Failover: any thrown error from BAML (network, timeout, malformed JSON)
 * falls through to the heuristic. Same wire shape regardless of provider.
 */

import { b, getWeatherForDate, type WeatherSignal } from "baml";
import { prisma } from "db";
import { log } from "../middleware/logger.js";

export type SuggestionContext = {
  poolId: string;
  combinedCapCents: number;
  statedNeed: string;
  statedNeedCategory: string;
  kampungName: string;
  kampungId: string;
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

export type Provider = "anthropic-claude-haiku-bedrock" | "heuristic";

function economicPostureFor(combinedCapCents: number): string {
  if (combinedCapCents < 100_000) return "conservative"; // < RM 1000
  if (combinedCapCents < 500_000) return "balanced";    // < RM 5000
  return "aggressive";
}

async function recentItemsForKampung(kampungId: string): Promise<string[]> {
  const completed = await prisma.poolTransaction.findMany({
    where: { pool: { kampungId, state: "COMPLETED" } },
    select: { catalogueItem: { select: { name: true, nameMs: true } } },
    take: 5,
    orderBy: { approvedAt: "desc" },
  });
  return completed
    .map((t) => t.catalogueItem.nameMs ?? t.catalogueItem.name)
    .filter((name): name is string => Boolean(name));
}

export async function suggestItems(
  ctx: SuggestionContext,
  candidates: CatalogueItem[],
): Promise<{ items: Suggestion[]; provider: Provider; weather: WeatherSignal }> {
  const weather = getWeatherForDate();

  if (process.env.BEDROCK_API_KEY) {
    try {
      const recentItems = await recentItemsForKampung(ctx.kampungId);
      const items = await b.SuggestPoolItems(
        {
          poolId: ctx.poolId,
          combinedCapCents: ctx.combinedCapCents,
          statedNeed: ctx.statedNeed,
          statedNeedCategory: ctx.statedNeedCategory,
          kampungName: ctx.kampungName,
          monthOfYear: ctx.monthOfYear,
          weather,
          economicPosture: economicPostureFor(ctx.combinedCapCents),
          recentItems,
        },
        candidates,
      );
      return { items, provider: "anthropic-claude-haiku-bedrock", weather };
    } catch (err) {
      log(
        "WARN",
        `[penasihat] Bedrock call failed → falling back to heuristic: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  return {
    items: rankCandidatesHeuristic(ctx, candidates, weather),
    provider: "heuristic",
    weather,
  };
}

function rankCandidatesHeuristic(
  ctx: SuggestionContext,
  candidates: CatalogueItem[],
  weather: WeatherSignal,
): Suggestion[] {
  const fits = candidates.filter((c) => c.price_cents <= ctx.combinedCapCents);
  // Prefer items closest to ~70% of the combined cap (well-utilised but headroom)
  const targetPrice = ctx.combinedCapCents * 0.7;

  const seasonalBlurb = weather.isRaining
    ? "musim hujan, sesuai untuk stok keperluan asas"
    : "cuaca cerah, mudah untuk angkut barang";

  return fits
    .sort((a, b) => Math.abs(a.price_cents - targetPrice) - Math.abs(b.price_cents - targetPrice))
    .slice(0, 5)
    .map((item) => ({
      itemId: item.id,
      itemName: item.name_bm,
      priceCents: item.price_cents,
      allocationPct: Math.round((item.price_cents / ctx.combinedCapCents) * 100),
      reasoningBm: `Padan dengan kapasiti pool RM ${(ctx.combinedCapCents / 100).toFixed(0)} · ${seasonalBlurb}.`,
      reasoningEn: `Fits pool capacity of RM ${(ctx.combinedCapCents / 100).toFixed(0)} (${weather.season}, ${weather.isRaining ? "raining" : "dry"}).`,
    }));
}
