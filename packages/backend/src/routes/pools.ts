/**
 * Pool router — full lifecycle endpoints.
 *
 * State machine:
 *   DRAFT → LOCKED → SUGGESTING → VOTING → APPROVED → ACTIVE → COMPLETED
 *                                                          (or DISSOLVED)
 *
 * Forward-only transitions. Each endpoint validates the current state
 * before mutating.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Prisma, prisma, type Pool, type PoolMember, type User } from "db";
import { customAlphabet } from "nanoid";

import { requireAuth } from "../middleware/require-auth.js";
import { ApiError, errorResponse } from "../lib/errors.js";
import { successResponse } from "../lib/response.js";
import { log } from "../middleware/logger.js";
import {
  suggestItems,
  type CatalogueItem,
  type Suggestion,
} from "../services/penasihat.js";
import { simulateApproval } from "../services/tng-simulated.js";
import { recalculateKampungTrust } from "./repayments.js";

export const poolsRouter = new Hono();

// 8-char invite code · uppercase + digits, no ambiguous chars (0/O · 1/I)
const inviteCodeNanoid = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

const MAX_POOL_SIZE = 8;
const MIN_POOL_SIZE = 2;
const DEFAULT_REPAYMENT_CYCLES = 6;

// ---------------------------------------------------------------------------
// Auth + error envelope
// ---------------------------------------------------------------------------

poolsRouter.use("*", requireAuth);

poolsRouter.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(errorResponse(err), err.statusCode as 400 | 401 | 403 | 404 | 409 | 500);
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") return c.json(errorResponse(ApiError.notFound("Pool")), 404);
    if (err.code === "P2002") return c.json(errorResponse(ApiError.conflict("Conflict")), 409);
  }
  log("ERROR", `[pools] ${err instanceof Error ? err.message : String(err)}`);
  return c.json(errorResponse(ApiError.internal()), 500);
});

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

const createPoolSchema = z.object({
  kampungId: z.string().min(1),
  name: z.string().min(3).max(80),
  statedNeed: z.string().min(5).max(500),
  category: z.enum([
    "EQUIPMENT",
    "GROCERY",
    "SCHOOL_SUPPLIES",
    "AGRICULTURAL",
    "APPLIANCE",
    "TRANSPORT",
    "OTHER",
  ]),
  targetBudgetCents: z.number().int().positive(),
});

const idParamSchema = z.object({ id: z.string().min(1) });
const codeParamSchema = z.object({ code: z.string().length(8) });
const joinSchema = z.object({ code: z.string().length(8) });
const selectItemSchema = z.object({ catalogueItemId: z.string().min(1) });
const voteSchema = z.object({ vote: z.enum(["YES", "NO"]) });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function poolView(
  pool: Pool & {
    members: (PoolMember & { user: Pick<User, "id" | "name" | "email" | "individualPaylaterCents"> })[];
    kampung: { id: string; name: string; districtHint: string | null };
  },
) {
  return {
    id: pool.id,
    name: pool.name,
    statedNeed: pool.statedNeed,
    category: pool.category,
    state: pool.state,
    kampung: pool.kampung,
    targetBudgetCents: pool.targetBudgetCents,
    combinedCapCents: pool.combinedCapCents,
    inviteCode: pool.inviteCode,
    selectedCatalogueItemId: pool.selectedCatalogueItemId,
    initiatorUserId: pool.initiatorUserId,
    members: pool.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      userName: m.user.name,
      userEmail: m.user.email,
      individualPaylaterCents: m.user.individualPaylaterCents,
      individualAllowanceAtLockCents: m.individualAllowanceAtLockCents,
      joinedAt: m.joinedAt,
    })),
    memberCount: pool.members.length,
    createdAt: pool.createdAt,
    lockedAt: pool.lockedAt,
    approvedAt: pool.approvedAt,
    deliveredAt: pool.deliveredAt,
  };
}

function assertState(pool: Pool, allowed: Pool["state"][], action: string): void {
  if (!allowed.includes(pool.state)) {
    throw ApiError.conflict(
      `Cannot ${action} when pool is ${pool.state}. Required: ${allowed.join(" or ")}.`,
    );
  }
}

// ---------------------------------------------------------------------------
// E2.1 — POST /api/v1/pools (create)
// ---------------------------------------------------------------------------

poolsRouter.post("/", zValidator("json", createPoolSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  const kampung = await prisma.kampung.findUnique({ where: { id: body.kampungId } });
  if (!kampung) throw ApiError.badRequest("Unknown kampungId");

  const inviteCode = inviteCodeNanoid();

  const pool = await prisma.pool.create({
    data: {
      kampungId: body.kampungId,
      initiatorUserId: user.id,
      name: body.name,
      statedNeed: body.statedNeed,
      category: body.category,
      targetBudgetCents: body.targetBudgetCents,
      combinedCapCents: user.individualPaylaterCents,
      state: "DRAFT",
      inviteCode,
      members: {
        create: {
          userId: user.id,
          individualAllowanceAtLockCents: 0, // snapshot taken at lock
        },
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, individualPaylaterCents: true } } } },
      kampung: { select: { id: true, name: true, districtHint: true } },
    },
  });

  return c.json(successResponse({ pool: poolView(pool) }), 201);
});

// ---------------------------------------------------------------------------
// E2.5 — GET /api/v1/pools/mine
// ---------------------------------------------------------------------------

poolsRouter.get("/mine", async (c) => {
  const user = c.get("user");

  const memberships = await prisma.poolMember.findMany({
    where: { userId: user.id },
    include: {
      pool: {
        include: {
          members: { include: { user: { select: { id: true, name: true, email: true, individualPaylaterCents: true } } } },
          kampung: { select: { id: true, name: true, districtHint: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return c.json(
    successResponse({
      pools: memberships.map((m) => poolView(m.pool)),
    }),
  );
});

// ---------------------------------------------------------------------------
// E2.6 — GET /api/v1/pools/by-code/:code (public preview for join page)
// ---------------------------------------------------------------------------

poolsRouter.get("/by-code/:code", zValidator("param", codeParamSchema), async (c) => {
  const { code } = c.req.valid("param");

  const pool = await prisma.pool.findUnique({
    where: { inviteCode: code },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, individualPaylaterCents: true } } } },
      kampung: { select: { id: true, name: true, districtHint: true } },
    },
  });

  if (!pool) throw ApiError.notFound("Pool with that code");

  return c.json(successResponse({ pool: poolView(pool) }));
});

// ---------------------------------------------------------------------------
// E2.5 — GET /api/v1/pools/:id (full detail)
// ---------------------------------------------------------------------------

poolsRouter.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  const pool = await prisma.pool.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, individualPaylaterCents: true } } } },
      kampung: { select: { id: true, name: true, districtHint: true } },
    },
  });

  if (!pool) throw ApiError.notFound("Pool");

  // Soft-gate: only members or NADI staff can see full detail
  const isMember = pool.members.some((m) => m.userId === user.id);
  if (!isMember && user.role !== "NADI_STAFF" && user.role !== "ADMIN") {
    throw ApiError.forbidden("You are not a member of this pool");
  }

  return c.json(successResponse({ pool: poolView(pool) }));
});

// ---------------------------------------------------------------------------
// E2.2 — POST /api/v1/pools/:id/invite (regenerate code)
// ---------------------------------------------------------------------------

poolsRouter.post("/:id/invite", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  const pool = await prisma.pool.findUnique({ where: { id } });
  if (!pool) throw ApiError.notFound("Pool");
  if (pool.initiatorUserId !== user.id) {
    throw ApiError.forbidden("Only the initiator can regenerate the invite code");
  }
  assertState(pool, ["DRAFT"], "regenerate invite code");

  const newCode = inviteCodeNanoid();
  const updated = await prisma.pool.update({
    where: { id },
    data: { inviteCode: newCode },
  });

  return c.json(
    successResponse({
      poolId: updated.id,
      inviteCode: updated.inviteCode,
      shareUrl: `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/join/${newCode}`,
    }),
  );
});

// ---------------------------------------------------------------------------
// E2.3 — POST /api/v1/pools/join (accept code)
// ---------------------------------------------------------------------------

poolsRouter.post("/join", zValidator("json", joinSchema), async (c) => {
  const { code } = c.req.valid("json");
  const user = c.get("user");

  const pool = await prisma.pool.findUnique({
    where: { inviteCode: code },
    include: { _count: { select: { members: true } } },
  });

  if (!pool) throw ApiError.notFound("Pool with that code");
  assertState(pool, ["DRAFT"], "join pool");

  if (pool._count.members >= MAX_POOL_SIZE) {
    throw ApiError.conflict(`Pool is full (max ${MAX_POOL_SIZE} members)`);
  }

  const existing = await prisma.poolMember.findUnique({
    where: { poolId_userId: { poolId: pool.id, userId: user.id } },
  });
  if (existing) throw ApiError.conflict("Already a member of this pool");

  const member = await prisma.poolMember.create({
    data: {
      poolId: pool.id,
      userId: user.id,
      individualAllowanceAtLockCents: 0, // snapshot at lock
    },
  });

  // Update combined cap optimistically (sum of individualPaylaterCents of members so far)
  const allMembers = await prisma.poolMember.findMany({
    where: { poolId: pool.id },
    include: { user: { select: { individualPaylaterCents: true } } },
  });
  const newCombined = allMembers.reduce((sum, m) => sum + m.user.individualPaylaterCents, 0);
  await prisma.pool.update({
    where: { id: pool.id },
    data: { combinedCapCents: newCombined },
  });

  return c.json(
    successResponse({
      poolId: pool.id,
      memberId: member.id,
      memberCount: allMembers.length,
      combinedCapCents: newCombined,
    }),
    201,
  );
});

// ---------------------------------------------------------------------------
// E2.4 — POST /api/v1/pools/:id/lock
// ---------------------------------------------------------------------------

poolsRouter.post("/:id/lock", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  const pool = await prisma.pool.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, individualPaylaterCents: true } } } },
    },
  });

  if (!pool) throw ApiError.notFound("Pool");
  if (pool.initiatorUserId !== user.id) {
    throw ApiError.forbidden("Only the initiator can lock the pool");
  }
  assertState(pool, ["DRAFT"], "lock pool");
  if (pool.members.length < MIN_POOL_SIZE) {
    throw ApiError.badRequest(`Need at least ${MIN_POOL_SIZE} members to lock`);
  }

  // Snapshot individualPaylaterCents per member at lock time + sum
  const updates = await prisma.$transaction(async (tx) => {
    const memberUpdates = await Promise.all(
      pool.members.map((m) =>
        tx.poolMember.update({
          where: { id: m.id },
          data: { individualAllowanceAtLockCents: m.user.individualPaylaterCents },
        }),
      ),
    );
    const combined = memberUpdates.reduce((s, m) => s + m.individualAllowanceAtLockCents, 0);

    const updatedPool = await tx.pool.update({
      where: { id },
      data: {
        state: "LOCKED",
        combinedCapCents: combined,
        lockedAt: new Date(),
      },
    });
    return { pool: updatedPool, combined, snapshotCount: memberUpdates.length };
  });

  return c.json(
    successResponse({
      poolId: updates.pool.id,
      state: updates.pool.state,
      combinedCapCents: updates.combined,
      memberSnapshots: updates.snapshotCount,
      lockedAt: updates.pool.lockedAt,
    }),
  );
});

// ---------------------------------------------------------------------------
// E3.2 — POST /api/v1/pools/:id/suggest (AI Penasihat)
// ---------------------------------------------------------------------------

poolsRouter.post("/:id/suggest", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  const pool = await prisma.pool.findUnique({
    where: { id },
    include: {
      members: { select: { userId: true } },
      kampung: { select: { name: true, districtHint: true } },
    },
  });

  if (!pool) throw ApiError.notFound("Pool");
  if (!pool.members.some((m) => m.userId === user.id)) {
    throw ApiError.forbidden("Not a member of this pool");
  }
  assertState(pool, ["LOCKED", "SUGGESTING"], "request suggestions");

  // Cache check: if a suggestion was made within last 30 minutes, return that
  const recentCutoff = new Date(Date.now() - 30 * 60 * 1000);
  const cached = await prisma.poolSuggestion.findFirst({
    where: { poolId: id, suggestedAt: { gte: recentCutoff } },
    orderBy: { suggestedAt: "desc" },
  });
  if (cached) {
    return c.json(
      successResponse({
        items: cached.itemsJson,
        provider: cached.provider,
        cached: true,
        suggestedAt: cached.suggestedAt,
      }),
    );
  }

  // Build candidate set from MykasihProduct (within combined cap)
  const products = await prisma.mykasihProduct.findMany({
    where: {
      isActive: true,
      priceRm: { lte: new Prisma.Decimal(pool.combinedCapCents / 100) },
    },
    take: 60, // cap candidate set size for prompt budget
    orderBy: { priceRm: "desc" },
  });

  if (products.length === 0) {
    throw ApiError.badRequest(
      "No catalogue items fit the combined cap. Try a larger pool or seed products.",
    );
  }

  const candidates: CatalogueItem[] = products.map((p) => ({
    id: p.id,
    name_bm: p.nameMs ?? p.name,
    category: p.category,
    price_cents: Math.round(Number(p.priceRm) * 100),
  }));

  const result = await suggestItems(
    {
      poolId: pool.id,
      combinedCapCents: pool.combinedCapCents,
      statedNeed: pool.statedNeed,
      statedNeedCategory: pool.category,
      kampungName: pool.kampung.name,
      monthOfYear: new Date().getMonth() + 1,
    },
    candidates,
  );

  // Persist + transition state
  const [, suggestion] = await prisma.$transaction([
    prisma.pool.update({
      where: { id },
      data: { state: "SUGGESTING" },
    }),
    prisma.poolSuggestion.create({
      data: {
        poolId: id,
        itemsJson: result.items as unknown as Prisma.InputJsonValue,
        provider: result.provider,
      },
    }),
  ]);

  return c.json(
    successResponse({
      items: result.items as Suggestion[],
      provider: result.provider,
      cached: false,
      suggestedAt: suggestion.suggestedAt,
    }),
  );
});

// ---------------------------------------------------------------------------
// E3.3 — POST /api/v1/pools/:id/select-item
// ---------------------------------------------------------------------------

poolsRouter.post(
  "/:id/select-item",
  zValidator("param", idParamSchema),
  zValidator("json", selectItemSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { catalogueItemId } = c.req.valid("json");
    const user = c.get("user");

    const pool = await prisma.pool.findUnique({
      where: { id },
      include: { members: { select: { userId: true } } },
    });
    if (!pool) throw ApiError.notFound("Pool");
    if (pool.initiatorUserId !== user.id) {
      throw ApiError.forbidden("Only the initiator can select an item");
    }
    assertState(pool, ["LOCKED", "SUGGESTING"], "select item");

    const item = await prisma.mykasihProduct.findUnique({
      where: { id: catalogueItemId },
    });
    if (!item) throw ApiError.notFound("Catalogue item");
    if (Math.round(Number(item.priceRm) * 100) > pool.combinedCapCents) {
      throw ApiError.badRequest("Item price exceeds combined pool cap");
    }

    const updated = await prisma.pool.update({
      where: { id },
      data: {
        selectedCatalogueItemId: catalogueItemId,
        state: "VOTING",
      },
    });

    return c.json(
      successResponse({
        poolId: updated.id,
        state: updated.state,
        selectedCatalogueItemId: updated.selectedCatalogueItemId,
        voteRequiredFromMembers: pool.members.length,
      }),
    );
  },
);

// ---------------------------------------------------------------------------
// E4.1 + E4.2 — POST /api/v1/pools/:id/vote
//   On majority YES → auto-create transaction + obligations + simulated TNG
//   approval per member.
// ---------------------------------------------------------------------------

poolsRouter.post(
  "/:id/vote",
  zValidator("param", idParamSchema),
  zValidator("json", voteSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { vote } = c.req.valid("json");
    const user = c.get("user");

    const pool = await prisma.pool.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, individualPaylaterCents: true } } } },
      },
    });
    if (!pool) throw ApiError.notFound("Pool");
    assertState(pool, ["VOTING"], "vote on pool");
    if (!pool.selectedCatalogueItemId) {
      throw ApiError.badRequest("No item selected for voting");
    }
    if (!pool.members.some((m) => m.userId === user.id)) {
      throw ApiError.forbidden("Not a member of this pool");
    }

    // Record vote (one per user per item · upsert allowed if user changes mind before majority)
    await prisma.poolVote.upsert({
      where: {
        poolId_userId_itemId: {
          poolId: id,
          userId: user.id,
          itemId: pool.selectedCatalogueItemId,
        },
      },
      create: {
        poolId: id,
        userId: user.id,
        itemId: pool.selectedCatalogueItemId,
        vote,
      },
      update: { vote, votedAt: new Date() },
    });

    // Tally
    const votes = await prisma.poolVote.findMany({
      where: { poolId: id, itemId: pool.selectedCatalogueItemId },
    });
    const yesCount = votes.filter((v) => v.vote === "YES").length;
    const noCount = votes.filter((v) => v.vote === "NO").length;
    const totalMembers = pool.members.length;
    const majorityThreshold = Math.floor(totalMembers / 2) + 1;

    let approved = false;
    let transactionId: string | null = null;

    if (yesCount >= majorityThreshold) {
      // Majority reached — approve + create transaction + obligations
      const item = await prisma.mykasihProduct.findUniqueOrThrow({
        where: { id: pool.selectedCatalogueItemId },
      });
      const totalCents = Math.round(Number(item.priceRm) * 100);

      // Run TNG simulated approval per member (proportional shares)
      const memberApprovals = await Promise.all(
        pool.members.map(async (m) => {
          const sharePct =
            (m.user.individualPaylaterCents / pool.combinedCapCents) * 100;
          const shareCents = Math.round((sharePct / 100) * totalCents);
          const approval = await simulateApproval({
            userId: m.user.id,
            amountCents: shareCents,
          });
          return { member: m, sharePct, shareCents, reference: approval.reference };
        }),
      );

      const txn = await prisma.$transaction(async (tx) => {
        const transaction = await tx.poolTransaction.create({
          data: {
            poolId: id,
            catalogueItemId: pool.selectedCatalogueItemId!,
            totalAmountCents: totalCents,
          },
        });

        await tx.paylaterObligation.createMany({
          data: memberApprovals.map((a) => ({
            transactionId: transaction.id,
            poolMemberId: a.member.id,
            userId: a.member.userId,
            shareAmountCents: a.shareCents,
            sharePct: new Prisma.Decimal(Math.round(a.sharePct * 100) / 100),
            tngReference: a.reference,
            totalCycles: DEFAULT_REPAYMENT_CYCLES,
          })),
        });

        await tx.pool.update({
          where: { id },
          data: { state: "APPROVED", approvedAt: new Date() },
        });

        return transaction;
      });

      approved = true;
      transactionId = txn.id;
    }

    return c.json(
      successResponse({
        vote,
        tally: { yes: yesCount, no: noCount, totalMembers, majorityThreshold },
        approved,
        transactionId,
      }),
    );
  },
);

// ---------------------------------------------------------------------------
// E4.3 — POST /api/v1/pools/:id/confirm-delivery
//   (Simplified: any authenticated user can confirm. Production: NADI_STAFF role.)
// ---------------------------------------------------------------------------

poolsRouter.post(
  "/:id/confirm-delivery",
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const pool = await prisma.pool.findUnique({
      where: { id },
      include: { transaction: true },
    });
    if (!pool) throw ApiError.notFound("Pool");
    assertState(pool, ["APPROVED"], "confirm delivery");
    if (!pool.transaction) {
      throw ApiError.badRequest("Pool has no transaction yet");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedTxn = await tx.poolTransaction.update({
        where: { poolId: id },
        data: { deliveredAt: new Date() },
      });
      const updatedPool = await tx.pool.update({
        where: { id },
        data: { state: "ACTIVE", deliveredAt: new Date() },
      });
      return { pool: updatedPool, transaction: updatedTxn };
    });

    return c.json(
      successResponse({
        poolId: updated.pool.id,
        state: updated.pool.state,
        deliveredAt: updated.pool.deliveredAt,
        transactionId: updated.transaction.id,
      }),
    );
  },
);

// ---------------------------------------------------------------------------
// E5.2 — GET /api/v1/pools/:id/ledger (repayment ledger view)
// ---------------------------------------------------------------------------

poolsRouter.get("/:id/ledger", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  const pool = await prisma.pool.findUnique({
    where: { id },
    include: { members: { select: { userId: true } } },
  });
  if (!pool) throw ApiError.notFound("Pool");
  if (!pool.members.some((m) => m.userId === user.id) && user.role !== "NADI_STAFF") {
    throw ApiError.forbidden("Not a member of this pool");
  }

  const obligations = await prisma.paylaterObligation.findMany({
    where: { transaction: { poolId: id } },
    include: {
      user: { select: { id: true, name: true } },
      repayments: { orderBy: { cycleNumber: "asc" } },
    },
  });

  const ledger = obligations.map((o) => {
    const perCycleCents = Math.round(o.shareAmountCents / o.totalCycles);
    const cycles = Array.from({ length: o.totalCycles }, (_, idx) => {
      const num = idx + 1;
      const paidEntry = o.repayments.find((r) => r.cycleNumber === num);
      return {
        cycleNumber: num,
        amountCents: perCycleCents,
        status: paidEntry ? "PAID" : num <= o.cyclesPaid + 1 ? "DUE" : "PENDING",
        paidAt: paidEntry?.paidAt ?? null,
        tngReference: paidEntry?.tngReference ?? null,
      };
    });

    return {
      obligationId: o.id,
      member: { id: o.user.id, name: o.user.name },
      shareAmountCents: o.shareAmountCents,
      sharePct: Number(o.sharePct),
      perCycleCents,
      totalCycles: o.totalCycles,
      cyclesPaid: o.cyclesPaid,
      progressPct: Math.round((o.cyclesPaid / o.totalCycles) * 100),
      cycles,
    };
  });

  return c.json(
    successResponse({
      poolId: id,
      ledger,
      totals: {
        memberCount: ledger.length,
        cyclesPaid: ledger.reduce((s, l) => s + l.cyclesPaid, 0),
        cyclesTotal: ledger.reduce((s, l) => s + l.totalCycles, 0),
      },
    }),
  );
});
