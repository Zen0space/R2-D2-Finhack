/**
 * Standalone Penasihat smoke test.
 *
 * Calls b.SuggestPoolItems directly with hardcoded mock inputs — no DB,
 * no HTTP, no auth. Just BAML → Bedrock → Claude Haiku 4.5 → parsed.
 *
 * Usage (from repo root):
 *   pnpm --filter backend test:penasihat
 *
 * Requires OPENAI_API_KEY + OPENAI_BASE_URL in
 * packages/backend/.env (auto-loaded via dotenv/config).
 */

import "dotenv/config";
import { b, getWeatherForDate } from "baml";

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error(
      "❌ OPENAI_API_KEY missing. Add it to packages/backend/.env or export it in the shell.",
    );
    process.exit(1);
  }

  const weather = getWeatherForDate();

  console.log("🧪 Penasihat smoke test");
  console.log("   model:    anthropic.claude-haiku-4-5-20251001-v1:0");
  console.log(`   endpoint: ${process.env.OPENAI_BASE_URL}`);
  console.log(`   weather:  ${weather.season} · ${weather.isRaining ? "raining" : "dry"} · ${weather.expectedTempC}°C`);
  console.log("");

  const start = Date.now();

  const items = await b.SuggestPoolItems(
    {
      poolId: "test-pool-1",
      combinedCapCents: 240_000, // RM 2,400
      statedNeed: "Mesin jahit untuk usahawan kampung",
      statedNeedCategory: "EQUIPMENT",
      kampungName: "Felda Gedangsa",
      monthOfYear: new Date().getMonth() + 1,
      weather,
      economicPosture: "balanced",
      recentItems: ["Beras 100kg + Minyak 12L", "Alat Sekolah 8 Anak"],
    },
    [
      { id: "demo-mesin-jahit",     name_bm: "Mesin Jahit Brother",        category: "HOUSEHOLD", price_cents: 100_000 },
      { id: "demo-beras-100kg",     name_bm: "Beras 100kg + Minyak 12L",   category: "GROCERY",   price_cents: 58_000 },
      { id: "demo-school-pack",     name_bm: "Alat Sekolah 8 Anak",        category: "HOUSEHOLD", price_cents: 72_000 },
      { id: "demo-water-filter",    name_bm: "Penapis Air Komuniti",       category: "HOUSEHOLD", price_cents: 150_000 },
      { id: "demo-generator-5kw",   name_bm: "Generator 5kW",              category: "HOUSEHOLD", price_cents: 200_000 },
      { id: "demo-tarp-large",      name_bm: "Khemah Pasar Tani 6m × 6m",  category: "HOUSEHOLD", price_cents: 80_000 },
    ],
  );

  const ms = Date.now() - start;
  console.log(`✅ ${items.length} suggestion(s) returned in ${ms}ms\n`);
  console.log(JSON.stringify(items, null, 2));
}

main().catch((err) => {
  console.error("❌ Penasihat call failed:");
  console.error(err);
  process.exit(1);
});
