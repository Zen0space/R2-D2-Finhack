/**
 * Repayments — monthly cycle payment for an obligation.
 *
 * Append-only ledger discipline: a Repayment row is the canonical record
 * that money moved. PaylaterObligation.cyclesPaid is the rolled-up counter
 * derived from these rows. Recalculates kampung trust on every payment.
 *
 * Simulated TNG flow for hackathon demo — always succeeds with a fake
 * reference. In production, this would gate on a real TNG webhook callback.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Prisma, prisma } from "db";

import { requireAuth } from "../middleware/require-auth.js";
import { ApiError, errorResponse } from "../lib/errors.js";
import { successResponse } from "../lib/response.js";
import { log } from "../middleware/logger.js";

export const repaymentsRouter = new Hono();

repaymentsRouter.use("*", requireAuth);

repaymentsRouter.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(errorResponse(err), err.statusCode as 400 | 401 | 403 | 404 | 409 | 500);
  }
  log("ERROR", `[repayments] ${err instanceof Error ? err.message : String(err)}`);
  return c.json(errorResponse(ApiError.internal()), 500);
});

const paySchema = z.object({
  obligationId: z.string().min(1),
  cycleNumber: z.number().int().min(1),
});

// POST /api/v1/repayments/pay
repaymentsRouter.post("/pay", zValidator("json", paySchema), async (c) => {
  const { obligationId, cycleNumber } = c.req.valid("json");
  const user = c.get("user");

  const obligation = await prisma.paylaterObligation.findUnique({
    where: { id: obligationId },
    include: {
      transaction: { include: { pool: { select: { id: true, kampungId: true } } } },
    },
  });

  if (!obligation) throw ApiError.notFound("Obligation");
  if (obligation.userId !== user.id) {
    throw ApiError.forbidden("Cannot pay another member's obligation");
  }
  if (cycleNumber > obligation.totalCycles) {
    throw ApiError.badRequest("Cycle number exceeds obligation duration");
  }
  if (cycleNumber <= obligation.cyclesPaid) {
    throw ApiError.conflict("Cycle already paid");
  }
  if (cycleNumber !== obligation.cyclesPaid + 1) {
    throw ApiError.badRequest(
      `Must pay cycles in order. Next due: ${obligation.cyclesPaid + 1}`,
    );
  }

  // Per-cycle amount — even split across totalCycles
  const perCycleCents = Math.round(obligation.shareAmountCents / obligation.totalCycles);
  const tngReference = `SIM-RPM-${Date.now()}-${cycleNumber}`;

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.repayment.create({
      data: {
        obligationId,
        userId: user.id,
        cycleNumber,
        amountCents: perCycleCents,
        tngReference,
      },
    });

    const updatedObligation = await tx.paylaterObligation.update({
      where: { id: obligationId },
      data: { cyclesPaid: { increment: 1 } },
    });

    const siblingObligations = await tx.paylaterObligation.findMany({
      where: { transactionId: obligation.transactionId },
      select: { cyclesPaid: true, totalCycles: true },
    });
    const poolCompleted =
      siblingObligations.length > 0 &&
      siblingObligations.every((entry) => entry.cyclesPaid >= entry.totalCycles);

    if (poolCompleted) {
      await tx.pool.update({
        where: { id: obligation.transaction.pool.id },
        data: { state: "COMPLETED" },
      });
    }

    return { payment, poolCompleted, updatedObligation };
  });

  // Recalculate kampung trust score (post-transaction so it sees latest data)
  await recalculateKampungTrust(obligation.transaction.pool.kampungId);

  return c.json(
    successResponse({
      repayment: {
        id: result.payment.id,
        cycleNumber: result.payment.cycleNumber,
        amountCents: result.payment.amountCents,
        tngReference: result.payment.tngReference,
        paidAt: result.payment.paidAt,
      },
      obligation: {
        id: result.updatedObligation.id,
        cyclesPaid: result.updatedObligation.cyclesPaid,
        totalCycles: result.updatedObligation.totalCycles,
        shareAmountCents: result.updatedObligation.shareAmountCents,
        progressPct: Math.round(
          (result.updatedObligation.cyclesPaid / result.updatedObligation.totalCycles) * 100,
        ),
      },
      poolCompleted: result.poolCompleted,
    }),
  );
});

// GET /api/v1/repayments/mine — current user's repayment history
repaymentsRouter.get("/mine", async (c) => {
  const user = c.get("user");

  const repayments = await prisma.repayment.findMany({
    where: { userId: user.id },
    orderBy: { paidAt: "desc" },
    take: 50,
    include: {
      obligation: {
        select: {
          id: true,
          shareAmountCents: true,
          totalCycles: true,
          transaction: { select: { pool: { select: { id: true, name: true } } } },
        },
      },
    },
  });

  return c.json(
    successResponse({
      repayments: repayments.map((r) => ({
        id: r.id,
        cycleNumber: r.cycleNumber,
        amountCents: r.amountCents,
        tngReference: r.tngReference,
        paidAt: r.paidAt,
        pool: r.obligation.transaction.pool,
      })),
    }),
  );
});

// ---------------------------------------------------------------------------
// Trust score helper
// ---------------------------------------------------------------------------

export async function recalculateKampungTrust(kampungId: string): Promise<number> {
  const obligations = await prisma.paylaterObligation.findMany({
    where: { transaction: { pool: { kampungId } } },
    select: { totalCycles: true, cyclesPaid: true },
  });

  const totalCycles = obligations.reduce((s, o) => s + o.totalCycles, 0);
  const totalPaid = obligations.reduce((s, o) => s + o.cyclesPaid, 0);

  // Score: 60 baseline (no signal yet) → 100 (perfect repayment)
  // Formula: 60 + (40 * completion_rate)
  let score = 60;
  if (totalCycles > 0) {
    const completionRate = totalPaid / totalCycles;
    score = 60 + 40 * completionRate;
  }

  const rounded = new Prisma.Decimal(Math.round(score * 100) / 100);
  await prisma.kampung.update({
    where: { id: kampungId },
    data: { trustScore: rounded },
  });

  return Number(rounded);
}
