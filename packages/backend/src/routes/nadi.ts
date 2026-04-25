/**
 * NADI centre lookup API.
 *
 * Data source: scraped from https://www.nadi.my via tools/scrape-nadi.py.
 * Loaded once at boot from the bundled JSON dataset (no DB roundtrip per
 * request — these centres are reference data, not application state).
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
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { ApiError, errorResponse } from "../lib/errors.js";
import { successResponse } from "../lib/response.js";
import { log } from "../middleware/logger.js";

// ---------------------------------------------------------------------------
// Dataset
// ---------------------------------------------------------------------------

export type NadiCentre = {
  id: string;
  name: string;
  state: string;
  district_hint: string | null;
  raw_position: number;
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "nadi-centres-selangor.json");

let centres: NadiCentre[] = [];

try {
  const raw = readFileSync(DATA_PATH, "utf-8");
  centres = JSON.parse(raw) as NadiCentre[];
  log("INFO", `[nadi] loaded ${centres.length} centres from ${DATA_PATH}`);
} catch (err) {
  log("ERROR", `[nadi] failed to load dataset: ${err instanceof Error ? err.message : err}`);
}

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

const listCentresQuerySchema = z.object({
  state: z.string().optional(),
  district: z.string().optional(),
  q: z.string().optional(), // case-insensitive name search
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
nadiRouter.get("/centres", zValidator("query", listCentresQuerySchema), (c) => {
  const { state, district, q, limit = 50, offset = 0 } = c.req.valid("query");

  let result = centres;

  if (state) {
    const s = state.toLowerCase();
    result = result.filter((centre) => centre.state.toLowerCase() === s);
  }

  if (district) {
    const d = district.toLowerCase();
    result = result.filter((centre) =>
      centre.district_hint != null && centre.district_hint.toLowerCase().includes(d),
    );
  }

  if (q) {
    const needle = q.toLowerCase();
    result = result.filter((centre) =>
      centre.name.toLowerCase().includes(needle) ||
      centre.id.toLowerCase().includes(needle),
    );
  }

  const total = result.length;
  const paged = result.slice(offset, offset + limit);

  return c.json(
    successResponse({
      centres: paged,
      meta: { total, limit, offset, returned: paged.length },
    }),
  );
});

// GET /api/v1/nadi/centres/:id
nadiRouter.get("/centres/:id", zValidator("param", idParamSchema), (c) => {
  const { id } = c.req.valid("param");
  const centre = centres.find((cc) => cc.id === id);
  if (!centre) {
    throw ApiError.notFound("NADI centre");
  }
  return c.json(successResponse(centre));
});

// GET /api/v1/nadi/states
nadiRouter.get("/states", (c) => {
  const states = Array.from(new Set(centres.map((cc) => cc.state))).sort();
  const summary = states.map((state) => ({
    state,
    count: centres.filter((cc) => cc.state === state).length,
  }));
  return c.json(successResponse({ states: summary }));
});

// GET /api/v1/nadi/districts?state=Selangor
nadiRouter.get("/districts", zValidator("query", districtsQuerySchema), (c) => {
  const { state } = c.req.valid("query");
  const stateLc = state.toLowerCase();

  const districts = centres
    .filter((cc) => cc.state.toLowerCase() === stateLc && cc.district_hint != null)
    .reduce<Map<string, number>>((acc, cc) => {
      const key = cc.district_hint!;
      acc.set(key, (acc.get(key) ?? 0) + 1);
      return acc;
    }, new Map());

  const list = Array.from(districts.entries())
    .map(([district_hint, count]) => ({ district_hint, count }))
    .sort((a, b) => b.count - a.count);

  return c.json(successResponse({ state, districts: list }));
});
