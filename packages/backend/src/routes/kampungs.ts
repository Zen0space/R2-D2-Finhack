/**
 * Kampung — read-only routes (list + trust score).
 *
 * Trust score is recalculated on every repayment event (see repayments.ts);
 * this router exposes the current value plus a small breakdown for the
 * dashboard widget.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "db";
import { ApiError } from "../lib/errors.js";
import { successResponse } from "../lib/response.js";

export const kampungsRouter = new Hono();

const idParamSchema = z.object({ id: z.string().min(1) });
const listQuerySchema = z.object({
  state: z.string().optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});

// GET /api/v1/kampungs
kampungsRouter.get("/", zValidator("query", listQuerySchema), async (c) => {
  const { state, q, limit = 50 } = c.req.valid("query");

  const kampungs = await prisma.kampung.findMany({
    where: {
      ...(state ? { state: { equals: state, mode: "insensitive" } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { districtHint: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    take: limit,
    select: {
      id: true,
      name: true,
      state: true,
      districtHint: true,
      nadiCentreId: true,
      trustScore: true,
    },
  });

  return c.json(
    successResponse({
      kampungs: kampungs.map((k) => ({
        ...k,
        trustScore: Number(k.trustScore),
      })),
      meta: { count: kampungs.length, limit },
    }),
  );
});

// GET /api/v1/kampungs/:id
kampungsRouter.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");

  const kampung = await prisma.kampung.findUnique({
    where: { id },
    include: {
      _count: { select: { pools: true, users: true } },
    },
  });

  if (!kampung) {
    throw ApiError.notFound("Kampung");
  }

  return c.json(
    successResponse({
      id: kampung.id,
      name: kampung.name,
      state: kampung.state,
      districtHint: kampung.districtHint,
      nadiCentreId: kampung.nadiCentreId,
      trustScore: Number(kampung.trustScore),
      counts: kampung._count,
    }),
  );
});

// GET /api/v1/kampungs/:id/trust — detailed trust score breakdown
kampungsRouter.get("/:id/trust", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");

  const kampung = await prisma.kampung.findUnique({
    where: { id },
    select: { id: true, name: true, trustScore: true },
  });

  if (!kampung) {
    throw ApiError.notFound("Kampung");
  }

  // Aggregate signals across all pools in this kampung
  const obligations = await prisma.paylaterObligation.findMany({
    where: { transaction: { pool: { kampungId: id } } },
    select: { totalCycles: true, cyclesPaid: true },
  });

  const totalCycles = obligations.reduce((sum, o) => sum + o.totalCycles, 0);
  const totalPaid = obligations.reduce((sum, o) => sum + o.cyclesPaid, 0);
  const completionRate = totalCycles === 0 ? 0 : (totalPaid / totalCycles) * 100;

  const score = Number(kampung.trustScore);
  let label_bm = "Baru";
  if (score >= 85) label_bm = "Sangat baik";
  else if (score >= 70) label_bm = "Baik";
  else if (score >= 50) label_bm = "Sederhana";
  else label_bm = "Perlu perhatian";

  return c.json(
    successResponse({
      kampungId: kampung.id,
      kampungName: kampung.name,
      score,
      label_bm,
      signals: {
        totalCycles,
        totalPaid,
        completionRatePct: Math.round(completionRate * 10) / 10,
        poolCount: await prisma.pool.count({ where: { kampungId: id } }),
      },
    }),
  );
});
