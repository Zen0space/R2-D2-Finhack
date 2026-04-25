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
    return c.json(errorResponse(err), err.statusCode as 400 | 404 | 500);
  }
  log("ERROR", `[nadi] ${err instanceof Error ? err.message : String(err)}`);
  return c.json(errorResponse(ApiError.internal()), 500);
});

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
