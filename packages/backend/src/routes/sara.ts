/**
 * SARA (Sumbangan Asas Rahmah) API
 *
 * Wraps the seeded MyKasih catalogue as a SARA-flavoured endpoint —
 * MyKasih Foundation administers the SARA programme on behalf of the
 * Ministry, so the same item catalogue + subsidy column is used here.
 *
 * Eligibility check is a deterministic mock: real verification happens
 * via checkstatus.mykasih.net which requires their gateway. The mock
 * is keyed on the last digit of the IC so demos are reproducible.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Prisma, prisma } from "db";
import { z } from "zod";
import { ApiError, errorResponse } from "../lib/errors.js";
import { successResponse } from "../lib/response.js";
import { createFeatureErrorHandler } from "../lib/feature-error-handler.js";

const INSENSITIVE: Prisma.QueryMode = "insensitive";
const PAGE_SIZE = 24;

// SARA monthly quota tiers (in cents) — informed by the public programme structure.
// SARA 2026 distributes RM 60–RM 200 per household per month depending on tier.
const SARA_TIERS = {
  T1: { label: "T1 · Single B40", monthlyCents: 6_000 },
  T2: { label: "T2 · Family ≤4", monthlyCents: 12_000 },
  T3: { label: "T3 · Family 5+", monthlyCents: 20_000 },
} as const;

type Tier = keyof typeof SARA_TIERS;

const icSchema = z.object({
  icNumber: z
    .string()
    .regex(/^\d{6}-?\d{2}-?\d{4}$/, "IC must be 12 digits, e.g. 901231-14-5678 or 901231145678")
    .transform((v) => v.replace(/-/g, "")),
});

const listSchema = z.object({
  category: z.string().optional(),
  q: z.string().min(1).max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  affordableUnder: z.coerce.number().int().min(0).optional(),
});

function rmToCents(decimal: Prisma.Decimal | string | number): number {
  return Math.round(Number(decimal) * 100);
}

type ProductRow = {
  id: string;
  name: string;
  nameMs: string | null;
  brand: string | null;
  category: string;
  description: string | null;
  unit: string;
  priceRm: Prisma.Decimal;
  subsidyRm: Prisma.Decimal;
  imageUrl: string | null;
  stock: number;
};

function shapeItem(p: ProductRow) {
  const priceCents = rmToCents(p.priceRm);
  const subsidyCents = rmToCents(p.subsidyRm);
  const effectiveCents = Math.max(0, priceCents - subsidyCents);
  return {
    id: p.id,
    name: p.name,
    nameMs: p.nameMs,
    brand: p.brand,
    category: p.category,
    description: p.description,
    unit: p.unit,
    priceCents,
    subsidyCents,
    effectiveCents,
    discountPct: priceCents > 0 ? Math.round((subsidyCents / priceCents) * 100) : 0,
    imageUrl: p.imageUrl,
    stock: p.stock,
  };
}

export const saraRouter = new Hono();

saraRouter.onError(createFeatureErrorHandler("sara"));

// GET /api/v1/sara/program — overview stats
saraRouter.get("/program", async (c) => {
  const [totalItems, byCategory, agg] = await Promise.all([
    prisma.mykasihProduct.count({ where: { isActive: true } }),
    prisma.mykasihProduct.groupBy({
      by: ["category"],
      where: { isActive: true },
      _count: { id: true },
    }),
    prisma.mykasihProduct.aggregate({
      where: { isActive: true },
      _sum: { subsidyRm: true, priceRm: true },
      _avg: { subsidyRm: true },
    }),
  ]);

  return c.json(
    successResponse({
      programme: "Sumbangan Asas Rahmah (SARA)",
      operator: "MyKasih Foundation",
      eligibility: "Verified B40 households via MyKasih registry",
      tiers: Object.entries(SARA_TIERS).map(([code, t]) => ({
        code,
        label: t.label,
        monthlyCents: t.monthlyCents,
      })),
      totalItems,
      categories: byCategory
        .map((r) => ({ category: r.category, count: r._count.id }))
        .sort((a, b) => b.count - a.count),
      catalogueValue: {
        totalRetailCents: rmToCents(agg._sum.priceRm ?? 0),
        totalSubsidyCents: rmToCents(agg._sum.subsidyRm ?? 0),
        averageSubsidyCents: rmToCents(agg._avg.subsidyRm ?? 0),
      },
      sources: {
        statusCheck: "https://checkstatus.mykasih.net/sara2/checkstatus",
        merchantList: "https://checkstatus.mykasih.net/sara2/merchant-list",
      },
    }),
  );
});

// GET /api/v1/sara/categories
saraRouter.get("/categories", async (c) => {
  const rows = await prisma.mykasihProduct.groupBy({
    by: ["category"],
    where: { isActive: true },
    _count: { id: true },
    _sum: { subsidyRm: true },
    orderBy: { category: "asc" },
  });

  return c.json(
    successResponse(
      rows.map((r) => ({
        category: r.category,
        count: r._count.id,
        totalSubsidyCents: rmToCents(r._sum.subsidyRm ?? 0),
      })),
    ),
  );
});

// GET /api/v1/sara/catalogue
saraRouter.get(
  "/catalogue",
  zValidator("query", listSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse(
          ApiError.badRequest(
            "Invalid query parameters",
            result.error.issues.map((i) => ({ path: i.path, message: i.message })),
          ),
        ),
        400,
      );
    }
  }),
  async (c) => {
    const { category, q, page, affordableUnder } = c.req.valid("query");
    const skip = (page - 1) * PAGE_SIZE;

    const where: Prisma.MykasihProductWhereInput = {
      isActive: true,
      ...(category ? { category: category as Prisma.MykasihProductWhereInput["category"] } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: INSENSITIVE } },
              { nameMs: { contains: q, mode: INSENSITIVE } },
              { brand: { contains: q, mode: INSENSITIVE } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.mykasihProduct.findMany({
        where,
        orderBy: [{ subsidyRm: "desc" }, { priceRm: "asc" }],
        take: PAGE_SIZE,
        skip,
      }),
      prisma.mykasihProduct.count({ where }),
    ]);

    let items = rows.map(shapeItem);
    if (typeof affordableUnder === "number") {
      items = items.filter((it) => it.effectiveCents <= affordableUnder);
    }

    return c.json(
      successResponse(items, {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      }),
    );
  },
);

// GET /api/v1/sara/catalogue/:id
saraRouter.get("/catalogue/:id", async (c) => {
  const id = c.req.param("id");
  const row = await prisma.mykasihProduct.findUnique({ where: { id } });
  if (!row || !row.isActive) {
    throw ApiError.notFound(`SARA item not found: ${id}`);
  }
  return c.json(successResponse(shapeItem(row)));
});

// POST /api/v1/sara/eligibility/check
// Mock check — real verification at checkstatus.mykasih.net needs the SARA gateway.
saraRouter.post(
  "/eligibility/check",
  zValidator("json", icSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse(
          ApiError.badRequest(
            "Invalid IC number",
            result.error.issues.map((i) => ({ path: i.path, message: i.message })),
          ),
        ),
        400,
      );
    }
  }),
  async (c) => {
    const { icNumber } = c.req.valid("json");

    // Deterministic mock: the last digit of the IC decides outcome so demos are repeatable.
    const lastDigit = Number(icNumber.slice(-1));
    const eligible = lastDigit !== 0; // 90% eligible
    const tier: Tier = lastDigit < 3 ? "T1" : lastDigit < 7 ? "T2" : "T3";

    if (!eligible) {
      return c.json(
        successResponse({
          eligible: false,
          icNumberMasked: `${icNumber.slice(0, 6)}-XX-${icNumber.slice(-4)}`,
          reason: "Not in MyKasih SARA registry. Apply at https://bantuantunai.hasil.gov.my",
          checkAuthoritativeAt: "https://checkstatus.mykasih.net/sara2/checkstatus",
        }),
      );
    }

    // Pseudo-balance: tier monthly quota minus a deterministic redeemed amount based on IC.
    const monthlyCents = SARA_TIERS[tier].monthlyCents;
    const redeemedCents = Math.min(
      monthlyCents,
      (Number(icNumber.slice(-3)) % 100) * 50, // 0…4950 cents
    );
    const remainingCents = Math.max(0, monthlyCents - redeemedCents);

    return c.json(
      successResponse({
        eligible: true,
        icNumberMasked: `${icNumber.slice(0, 6)}-XX-${icNumber.slice(-4)}`,
        tier,
        tierLabel: SARA_TIERS[tier].label,
        monthlyQuotaCents: monthlyCents,
        redeemedThisMonthCents: redeemedCents,
        remainingThisMonthCents: remainingCents,
        cycleResetsOn: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          1,
        ).toISOString(),
        checkAuthoritativeAt: "https://checkstatus.mykasih.net/sara2/checkstatus",
        merchantListAt: "https://checkstatus.mykasih.net/sara2/merchant-list",
        notice: "Mock response — real eligibility lives on the MyKasih gateway.",
      }),
    );
  },
);
