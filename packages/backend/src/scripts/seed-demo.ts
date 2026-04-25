/**
 * Demo seed — populate the DB with persona-shaped data for the FINHACK pitch.
 *
 * Personas (mapped from PRD):
 *   - Mak Cik Aminah   — Felda settler · 47 · PayLater RM 300 (initiator)
 *   - Pak Cik Razali   — Felda smallholder · 58 · PayLater RM 400
 *   - Adik Faiz        — gig worker · 24 · PayLater RM 500
 *   - Pakcik Hamid     — kampung handyman · 51 · PayLater RM 350
 *   - Cik Hidayah      — NADI Felda Gedangsa staff · NADI_STAFF role
 *
 * Pool pre-formed at LOCKED state · combined cap RM 1,550 · ready for the
 * /suggest call on stage. Run AFTER seed-kampung.ts has populated kampungs.
 *
 * Run:
 *   pnpm --filter backend tsx src/scripts/seed-demo.ts
 *
 * Idempotent — uses upsert so re-running is safe. NOTE: Better Auth's
 * password hashing uses scrypt internally; we go through the auth API
 * to create users so passwords are hashed correctly.
 */

import "dotenv/config";
import { customAlphabet } from "nanoid";
import { prisma } from "db";
import { auth } from "../lib/auth.js";

const inviteCodeNanoid = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);
const DEMO_PASSWORD = "FeldaG3dangsa!";

type Persona = {
  email: string;
  name: string;
  individualPaylaterCents: number;
  role: "MEMBER" | "NADI_STAFF";
};

const PERSONAS: Persona[] = [
  { email: "aminah@duitlater.demo",  name: "Mak Cik Aminah",  individualPaylaterCents: 30000, role: "MEMBER" },
  { email: "razali@duitlater.demo",  name: "Pak Cik Razali",  individualPaylaterCents: 40000, role: "MEMBER" },
  { email: "faiz@duitlater.demo",    name: "Adik Faiz",       individualPaylaterCents: 50000, role: "MEMBER" },
  { email: "hamid@duitlater.demo",   name: "Pakcik Hamid",    individualPaylaterCents: 35000, role: "MEMBER" },
  { email: "hidayah@duitlater.demo", name: "Cik Hidayah",     individualPaylaterCents: 30000, role: "NADI_STAFF" },
];

async function main() {
  console.log("[seed-demo] start");

  // 1. Find FELDA GEDANGSA kampung (must be seeded already by seed-kampung.ts)
  const kampung = await prisma.kampung.findUnique({
    where: { nadiCentreId: "selangor-felda-gedangsa" },
  });
  if (!kampung) {
    throw new Error(
      "FELDA GEDANGSA kampung not seeded. Run `pnpm --filter db tsx prisma/seed-kampung.ts` first.",
    );
  }
  console.log(`[seed-demo] kampung: ${kampung.name} (id=${kampung.id})`);

  // 2. Create users via Better Auth (so passwords hashed correctly)
  const users: Awaited<ReturnType<typeof prisma.user.update>>[] = [];
  for (const p of PERSONAS) {
    const existing = await prisma.user.findUnique({ where: { email: p.email } });
    if (existing) {
      // Already exists — update role/kampung/allowance for consistency
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: p.name,
          kampungId: kampung.id,
          individualPaylaterCents: p.individualPaylaterCents,
          role: p.role,
        },
      });
      users.push(updated);
      console.log(`[seed-demo]   ↻ ${p.name} (existing · updated)`);
    } else {
      const result = await auth.api.signUpEmail({
        body: { email: p.email, password: DEMO_PASSWORD, name: p.name },
        asResponse: false,
      });
      const userId = result.user.id;
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          kampungId: kampung.id,
          individualPaylaterCents: p.individualPaylaterCents,
          role: p.role,
        },
      });
      users.push(updated);
      console.log(`[seed-demo]   + ${p.name} (created · ${p.role})`);
    }
  }

  const aminah = users.find((u) => u.email === "aminah@duitlater.demo")!;
  const razali = users.find((u) => u.email === "razali@duitlater.demo")!;
  const faiz   = users.find((u) => u.email === "faiz@duitlater.demo")!;
  const hamid  = users.find((u) => u.email === "hamid@duitlater.demo")!;

  // 3. Seed a few demo MyKasih products (idempotent via upsert)
  const products = [
    { id: "demo-mesin-jahit", name: "Brother Sewing Machine",      nameMs: "Mesin Jahit Brother",      category: "HOUSEHOLD" as const, priceRm: 1000, subsidyRm: 0,   unit: "unit" },
    { id: "demo-beras-100kg", name: "Rice 100kg + Cooking Oil 12L", nameMs: "Beras 100kg + Minyak 12L", category: "GROCERY" as const,  priceRm: 580,  subsidyRm: 50,  unit: "set"  },
    { id: "demo-school-pack", name: "School Supplies for 8 Kids",   nameMs: "Alat Sekolah 8 Anak",      category: "HOUSEHOLD" as const, priceRm: 720,  subsidyRm: 100, unit: "set"  },
    { id: "demo-generator",   name: "Generator 2.5kVA",             nameMs: "Generator 2.5kVA",         category: "HOUSEHOLD" as const, priceRm: 1100, subsidyRm: 0,   unit: "unit" },
    { id: "demo-ayam-50",     name: "Chick + Feed 50 Birds",        nameMs: "Anak Ayam + Makanan 50",   category: "HOUSEHOLD" as const, priceRm: 480,  subsidyRm: 0,   unit: "set"  },
    { id: "demo-knapsack",    name: "Knapsack Sprayer",             nameMs: "Mesin Sembur Galas",       category: "HOUSEHOLD" as const, priceRm: 350,  subsidyRm: 0,   unit: "unit" },
  ];
  for (const p of products) {
    await prisma.mykasihProduct.upsert({
      where: { id: p.id },
      create: { ...p, isActive: true },
      update: p,
    });
  }
  console.log(`[seed-demo] catalogue: ${products.length} demo products upserted`);

  // 4. Pre-form a sample pool · LOCKED · ready for /suggest demo
  const POOL_NAME = "Pool Felda Gedangsa Mac";
  const inviteCode = inviteCodeNanoid();

  // Cleanup any prior demo pool with same name
  await prisma.pool.deleteMany({ where: { name: POOL_NAME, kampungId: kampung.id } });

  const combined = aminah.individualPaylaterCents
    + razali.individualPaylaterCents
    + faiz.individualPaylaterCents
    + hamid.individualPaylaterCents;

  const pool = await prisma.pool.create({
    data: {
      kampungId: kampung.id,
      initiatorUserId: aminah.id,
      name: POOL_NAME,
      statedNeed: "Mesin jahit untuk start home tailoring side income",
      category: "EQUIPMENT",
      targetBudgetCents: 180000,
      combinedCapCents: combined,
      inviteCode,
      state: "LOCKED",
      lockedAt: new Date(),
      members: {
        create: [
          { userId: aminah.id, individualAllowanceAtLockCents: aminah.individualPaylaterCents },
          { userId: razali.id, individualAllowanceAtLockCents: razali.individualPaylaterCents },
          { userId: faiz.id,   individualAllowanceAtLockCents: faiz.individualPaylaterCents   },
          { userId: hamid.id,  individualAllowanceAtLockCents: hamid.individualPaylaterCents  },
        ],
      },
    },
  });

  console.log(`[seed-demo] pool: ${pool.name} (id=${pool.id})`);
  console.log(`[seed-demo]   members: 4 (Aminah · Razali · Faiz · Hamid)`);
  console.log(`[seed-demo]   combined cap: RM ${(combined / 100).toFixed(2)}`);
  console.log(`[seed-demo]   invite code: ${inviteCode}`);
  console.log(`[seed-demo]   state: LOCKED · ready for POST /pools/${pool.id}/suggest`);

  // 5. Print credentials summary for the team
  console.log();
  console.log("=== DEMO CREDENTIALS (password: " + DEMO_PASSWORD + ") ===");
  for (const p of PERSONAS) {
    console.log(`  ${p.email.padEnd(30)} | ${p.name.padEnd(18)} | ${p.role.padEnd(10)} | RM ${(p.individualPaylaterCents / 100).toFixed(2)}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[seed-demo] failed:", err);
  process.exit(1);
});
