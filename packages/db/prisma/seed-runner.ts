/**
 * Seed runner — applies one-shot seeds in declared order, tracking each in
 * the `_seed_history` table so the same seed never runs twice.
 *
 * Add a new seed:
 *   1. Create prisma/seed-<topic>.ts that exports `name` and `run(prisma)`.
 *   2. Append it to the SEEDS array below.
 *   3. On next deploy, the runner detects it isn't in _seed_history and runs it.
 *
 * Re-running a seed is harmless because each seed uses upsert, but the registry
 * keeps boot fast (skip already-applied seeds) and gives us a clear audit trail.
 *
 * To force a re-run during development:
 *   DELETE FROM _seed_history WHERE name = '<seed-name>';
 */

import "dotenv/config";
import { prisma } from "../src/index.js";
import * as nadiSeed from "./seed-nadi.js";
import * as kampungSeed from "./seed-kampung.js";

type Seed = {
  name: string;
  run: (client: typeof prisma) => Promise<void>;
};

// Order matters — kampungs reference NADI centre ids semantically (not FK),
// but readability favours seeding NADI centres first.
const SEEDS: Seed[] = [
  { name: nadiSeed.name, run: nadiSeed.run },
  { name: kampungSeed.name, run: kampungSeed.run },
];

async function ensureRegistry() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS _seed_history (
      name        TEXT        PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function isApplied(name: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM _seed_history WHERE name = ${name}
  `;
  return rows.length > 0;
}

async function record(name: string) {
  await prisma.$executeRaw`
    INSERT INTO _seed_history (name) VALUES (${name})
  `;
}

async function main() {
  await ensureRegistry();

  let applied = 0;
  let skipped = 0;

  for (const seed of SEEDS) {
    if (await isApplied(seed.name)) {
      console.log(`[seed-runner] skip   ${seed.name} (already applied)`);
      skipped += 1;
      continue;
    }
    console.log(`[seed-runner] apply  ${seed.name}`);
    await seed.run(prisma);
    await record(seed.name);
    applied += 1;
  }

  console.log(`[seed-runner] done — applied=${applied}, skipped=${skipped}`);
}

main()
  .catch((err) => {
    console.error("[seed-runner] failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
