import { Hono } from "hono";
import { prisma } from "db";
import type { MykasihCategory } from "db";
import { ApiError, errorResponse } from "../lib/errors.js";

const VALID_CATEGORIES = new Set<MykasihCategory>([
  "GROCERY", "DAIRY", "PRODUCE", "HOUSEHOLD",
  "PERSONAL_CARE", "BABY", "BEVERAGE", "FROZEN",
]);

const VALID_SORT = new Set(["name", "priceRm", "subsidyRm", "createdAt"]);
const VALID_ORDER = new Set(["asc", "desc"]);
const PAGE_SIZE = 20;
const MAX_Q_LENGTH = 100;

export const mykasihRouter = new Hono();

// GET /api/v1/mykasih/categories
mykasihRouter.get("/categories", async (c) => {
  try {
    const rows = await prisma.mykasihProduct.groupBy({
      by: ["category"],
      where: { isActive: true },
      _count: { id: true },
      orderBy: { category: "asc" },
    });

    return c.json({
      success: true,
      data: rows.map((r) => ({
        category: r.category,
        count: r._count.id,
      })),
    });
  } catch (err) {
    throw ApiError.internal("Failed to fetch categories");
  }
});

// GET /api/v1/mykasih/products
// Query params: category, q, page, sort, order, inStock
mykasihRouter.get("/products", async (c) => {
  const { category, q, page = "1", sort = "name", order = "asc", inStock } =
    c.req.query();

  // --- validation ---
  if (category && !VALID_CATEGORIES.has(category as MykasihCategory)) {
    return c.json(
      errorResponse(
        ApiError.badRequest(
          `Invalid category "${category}". Valid values: ${[...VALID_CATEGORIES].join(", ")}`,
        ),
      ),
      400,
    );
  }

  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1 || !Number.isInteger(pageNum)) {
    return c.json(
      errorResponse(ApiError.badRequest(`"page" must be a positive integer, got "${page}"`)),
      400,
    );
  }

  if (!VALID_SORT.has(sort)) {
    return c.json(
      errorResponse(
        ApiError.badRequest(
          `Invalid sort field "${sort}". Valid values: ${[...VALID_SORT].join(", ")}`,
        ),
      ),
      400,
    );
  }

  if (!VALID_ORDER.has(order)) {
    return c.json(
      errorResponse(ApiError.badRequest(`"order" must be "asc" or "desc", got "${order}"`)),
      400,
    );
  }

  if (q && q.length > MAX_Q_LENGTH) {
    return c.json(
      errorResponse(ApiError.badRequest(`Search query "q" must be ${MAX_Q_LENGTH} characters or fewer`)),
      400,
    );
  }

  if (inStock !== undefined && inStock !== "true" && inStock !== "false") {
    return c.json(
      errorResponse(ApiError.badRequest(`"inStock" must be "true" or "false", got "${inStock}"`)),
      400,
    );
  }

  // --- query ---
  try {
    const skip = (pageNum - 1) * PAGE_SIZE;

    const where = {
      isActive: true,
      ...(category ? { category: category as MykasihCategory } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { nameMs: { contains: q, mode: "insensitive" as const } },
              { brand: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(inStock === "true" ? { stock: { gt: 0 } } : {}),
    };

    const [total, products] = await Promise.all([
      prisma.mykasihProduct.count({ where }),
      prisma.mykasihProduct.findMany({
        where,
        select: {
          id: true,
          name: true,
          nameMs: true,
          brand: true,
          category: true,
          unit: true,
          priceRm: true,
          subsidyRm: true,
          imageUrl: true,
          stock: true,
          barcode: true,
        },
        orderBy: { [sort]: order },
        skip,
        take: PAGE_SIZE,
      }),
    ]);

    return c.json({
      success: true,
      data: products,
      meta: {
        total,
        page: pageNum,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (err) {
    throw ApiError.internal("Failed to fetch products");
  }
});

// GET /api/v1/mykasih/products/:id
mykasihRouter.get("/products/:id", async (c) => {
  const { id } = c.req.param();

  if (!id || id.trim().length === 0) {
    return c.json(errorResponse(ApiError.badRequest("Product ID is required")), 400);
  }

  try {
    const product = await prisma.mykasihProduct.findUnique({ where: { id } });

    if (!product) {
      return c.json(errorResponse(ApiError.notFound(`Product "${id}"`)), 404);
    }

    return c.json({ success: true, data: product });
  } catch (err) {
    throw ApiError.internal("Failed to fetch product");
  }
});
