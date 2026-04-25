/**
 * NADI centre lookup API.
 *
 * Backed by the `nadi_centre` Postgres table (seeded from tools/scrape-nadi.py
 * via packages/db/prisma/seed-nadi.ts).
 *
 * Used by the DuitLater frontend to:
 *   - populate the kampung selector during pool formation
 *   - validate pool memberships are tied to a real NADI centre
 *   - render the NADI Felda Gedangsa pilot site in onboarding flows
 *
 * Endpoints:
 *   GET /api/v1/nadi/centres                 — list all centres (optional filters)
 *   GET /api/v1/nadi/centres/:id             — single centre by id
 *   GET /api/v1/nadi/states                  — distinct states present in dataset
 *   GET /api/v1/nadi/districts?state=...     — district hints for a state
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "db";

import { ApiError, errorResponse } from "../lib/errors.js";
import { successResponse } from "../lib/response.js";
import { log } from "../middleware/logger.js";
import { requireAuth } from "../middleware/require-auth.js";
import { generateNadiWeeklySummary } from "../services/nadi-summary.js";

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

const listCentresQuerySchema = z.object({
  state: z.string().optional(),
  district: z.string().optional(),
  q: z.string().optional(), // case-insensitive name/id search
  limit: z.coerce.number().int().positive().max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const districtsQuerySchema = z.object({
  state: z.string().min(1),
});

const idParamSchema = z.object({
  id: z.string().min(1),
});

const summaryBodySchema = z.object({
  kampungId: z.string().min(1),
  weekStart: z.coerce.date(),
});

// ---------------------------------------------------------------------------
// Serialization — keep wire shape identical to the previous JSON-backed API
// ---------------------------------------------------------------------------

type NadiCentreRow = {
  id: string;
  name: string;
  state: string;
  districtHint: string | null;
  rawPosition: number;
};

const toWire = (row: NadiCentreRow) => ({
  id: row.id,
  name: row.name,
  state: row.state,
  district_hint: row.districtHint,
  raw_position: row.rawPosition,
});

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const nadiRouter = new Hono();

nadiRouter.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(errorResponse(err), err.statusCode as 400 | 401 | 403 | 404 | 500);
  }
  log("ERROR", `[nadi] ${err instanceof Error ? err.message : String(err)}`);
  return c.json(errorResponse(ApiError.internal()), 500);
});

function buildWeekRange(weekStart: Date) {
  const normalizedStart = new Date(
    Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate()),
  );
  const weekEnd = new Date(normalizedStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  return { weekEnd, weekStart: normalizedStart };
}

function getExpectedPaidCycles(deliveredAt: Date | null, totalCycles: number, asOf: Date) {
  if (!deliveredAt) {
    return 0;
  }

  const elapsedMs = asOf.getTime() - deliveredAt.getTime();

  if (elapsedMs <= 0) {
    return 0;
  }

  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  return Math.min(totalCycles, Math.max(Math.floor(elapsedDays / 30), 0));
}

// GET /api/v1/nadi/centres
nadiRouter.get("/centres", zValidator("query", listCentresQuerySchema), async (c) => {
  const { state, district, q, limit = 50, offset = 0 } = c.req.valid("query");

  const where = {
    ...(state ? { state: { equals: state, mode: "insensitive" as const } } : {}),
    ...(district
      ? { districtHint: { contains: district, mode: "insensitive" as const } }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { id: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.nadiCentre.count({ where }),
    prisma.nadiCentre.findMany({
      where,
      orderBy: { rawPosition: "asc" },
      skip: offset,
      take: limit,
      select: {
        id: true,
        name: true,
        state: true,
        districtHint: true,
        rawPosition: true,
      },
    }),
  ]);

  return c.json(
    successResponse({
      centres: rows.map(toWire),
      meta: { total, limit, offset, returned: rows.length },
    }),
  );
});

// GET /api/v1/nadi/centres/:id
nadiRouter.get("/centres/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const centre = await prisma.nadiCentre.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      state: true,
      districtHint: true,
      rawPosition: true,
    },
  });
  if (!centre) {
    throw ApiError.notFound("NADI centre");
  }
  return c.json(successResponse(toWire(centre)));
});

// GET /api/v1/nadi/states
nadiRouter.get("/states", async (c) => {
  const grouped = await prisma.nadiCentre.groupBy({
    by: ["state"],
    _count: { _all: true },
    orderBy: { state: "asc" },
  });
  const summary = grouped.map((g) => ({ state: g.state, count: g._count._all }));
  return c.json(successResponse({ states: summary }));
});

// GET /api/v1/nadi/districts?state=Selangor
nadiRouter.get("/districts", zValidator("query", districtsQuerySchema), async (c) => {
  const { state } = c.req.valid("query");

  const grouped = await prisma.nadiCentre.groupBy({
    by: ["districtHint"],
    where: {
      state: { equals: state, mode: "insensitive" },
      districtHint: { not: null },
    },
    _count: { _all: true },
  });

  const list = grouped
    .map((g) => ({ district_hint: g.districtHint, count: g._count._all }))
    .sort((a, b) => b.count - a.count);

  return c.json(successResponse({ state, districts: list }));
});

// POST /api/v1/nadi/summary
nadiRouter.post(
  "/summary",
  requireAuth,
  zValidator("json", summaryBodySchema),
  async (c) => {
    const user = c.get("user");
    const { kampungId, weekStart } = c.req.valid("json");

    if (user.role !== "NADI_STAFF" && user.role !== "ADMIN") {
      throw ApiError.forbidden("Only NADI staff can generate a weekly summary");
    }

    if (user.role !== "ADMIN" && user.kampungId !== kampungId) {
      throw ApiError.forbidden("This summary is outside your kampung scope");
    }

    const { weekEnd, weekStart: normalizedWeekStart } = buildWeekRange(weekStart);

    const kampung = await prisma.kampung.findUnique({
      where: { id: kampungId },
      select: { id: true, name: true, trustScore: true },
    });

    if (!kampung) {
      throw ApiError.notFound("Kampung");
    }

    const [
      poolsFormedCount,
      activePools,
      pendingDeliveryCount,
      weeklyTransactions,
      obligations,
      repaymentsThisWeek,
    ] = await Promise.all([
      prisma.pool.count({
        where: {
          kampungId,
          createdAt: { gte: normalizedWeekStart, lt: weekEnd },
        },
      }),
      prisma.pool.count({
        where: {
          kampungId,
          state: "ACTIVE",
        },
      }),
      prisma.pool.count({
        where: {
          kampungId,
          state: "APPROVED",
        },
      }),
      prisma.poolTransaction.findMany({
        where: {
          pool: { kampungId },
          approvedAt: { gte: normalizedWeekStart, lt: weekEnd },
        },
        select: {
          catalogueItem: {
            select: {
              name: true,
              nameMs: true,
            },
          },
        },
      }),
      prisma.paylaterObligation.findMany({
        where: {
          transaction: { pool: { kampungId } },
        },
        select: {
          cyclesPaid: true,
          totalCycles: true,
          transaction: {
            select: {
              deliveredAt: true,
            },
          },
        },
      }),
      prisma.repayment.count({
        where: {
          obligation: {
            transaction: {
              pool: { kampungId },
            },
          },
          paidAt: { gte: normalizedWeekStart, lt: weekEnd },
        },
      }),
    ]);

    const itemCounts = new Map<string, number>();

    for (const transaction of weeklyTransactions) {
      const itemName =
        transaction.catalogueItem.nameMs ?? transaction.catalogueItem.name ?? "Item pool";
      itemCounts.set(itemName, (itemCounts.get(itemName) ?? 0) + 1);
    }

    const topItemNameBm =
      [...itemCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;

    const totalCycles = obligations.reduce((sum, obligation) => sum + obligation.totalCycles, 0);
    const totalPaid = obligations.reduce((sum, obligation) => sum + obligation.cyclesPaid, 0);
    const previousTotalPaid = Math.max(totalPaid - repaymentsThisWeek, 0);
    const previousScore =
      totalCycles > 0 ? 60 + 40 * (previousTotalPaid / totalCycles) : 60;
    const trustScore = Number(kampung.trustScore);
    const trustDelta = Math.round((trustScore - previousScore) * 10) / 10;

    const latePaymentEvents = obligations.reduce((sum, obligation) => {
      const expectedPaidCycles = getExpectedPaidCycles(
        obligation.transaction.deliveredAt,
        obligation.totalCycles,
        weekEnd,
      );

      return sum + Math.max(expectedPaidCycles - obligation.cyclesPaid, 0);
    }, 0);

    const { provider, summary } = await generateNadiWeeklySummary({
      activePools,
      kampungId,
      kampungName: kampung.name,
      latePaymentEvents,
      pendingDeliveryCount,
      poolsFormedCount,
      repaymentsThisWeek,
      topItemNameBm,
      trustDelta,
      trustScore,
      weekEnd: weekEnd.toISOString(),
      weekStart: normalizedWeekStart.toISOString(),
    });

    return c.json(
      successResponse({
        generatedAt: new Date().toISOString(),
        metrics: {
          activePools,
          latePaymentEvents,
          pendingDeliveryCount,
          poolsFormedCount,
          repaymentsThisWeek,
          topItemNameBm,
          trustDelta,
          trustScore,
        },
        provider,
        summary,
        weekEnd: weekEnd.toISOString(),
        weekStart: normalizedWeekStart.toISOString(),
      }),
    );
  },
);
