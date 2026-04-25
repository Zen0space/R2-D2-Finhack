/**
 * Seed NadiCentre table from the scraped NADI Selangor dataset.
 *
 * Idempotent — uses upsert keyed on the scraper id (e.g. "selangor-felda-gedangsa").
 *
 * Two ways to invoke:
 *   1. Standalone CLI:   pnpm --filter db exec tsx prisma/seed-nadi.ts
 *   2. Via seed-runner:  imported as { name, run } and gated by _seed_history.
 */

import "dotenv/config";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "../src/index.js";

type NadiCentreJson = {
  id: string;
  name: string;
  state: string;
  district_hint: string | null;
  raw_position: number;
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(
  __dirname,
  "..",
  "..",
  "backend",
  "src",
  "data",
  "nadi-centres-selangor.json",
);

export const name = "2026-04-25_nadi_centres";

export async function run(client: PrismaClient = prisma) {
  console.log(`[seed-nadi] reading ${DATA_PATH}`);
  const raw = readFileSync(DATA_PATH, "utf-8");
  const centres = JSON.parse(raw) as NadiCentreJson[];
  console.log(`[seed-nadi] found ${centres.length} centres`);

  let created = 0;
  let updated = 0;

  for (const centre of centres) {
    const result = await client.nadiCentre.upsert({
      where: { id: centre.id },
      create: {
        id: centre.id,
        name: centre.name,
        state: centre.state,
        districtHint: centre.district_hint,
        rawPosition: centre.raw_position,
      },
      update: {
        name: centre.name,
        state: centre.state,
        districtHint: centre.district_hint,
        rawPosition: centre.raw_position,
      },
    });
    if (result.updatedAt.getTime() === result.createdAt.getTime()) {
      created += 1;
    } else {
      updated += 1;
    }
  }

  console.log(`[seed-nadi] created=${created}, updated=${updated}`);

  const total = await client.nadiCentre.count();
  console.log(`[seed-nadi] total rows in nadi_centre: ${total}`);
}

// CLI entrypoint — only runs when invoked directly via tsx prisma/seed-nadi.ts
const isDirectInvocation =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("seed-nadi.ts");

if (isDirectInvocation) {
  run()
    .catch((err) => {
      console.error("[seed-nadi] failed:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
