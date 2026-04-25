import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Prisma, prisma } from "db";
import { ApiError, errorResponse } from "../lib/errors.js";
import { successResponse } from "../lib/response.js";
import { listProductsQuerySchema, getProductParamSchema } from "../validators/mykasih.js";
import { log } from "../middleware/logger.js";

const PAGE_SIZE = 20;
const INSENSITIVE: Prisma.QueryMode = "insensitive";

export const mykasihRouter = new Hono();

mykasihRouter.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(errorResponse(err), err.statusCode as 400 | 404 | 500);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return c.json(errorResponse(ApiError.badRequest("Resource already exists")), 400);
      case "P2025":
        return c.json(errorResponse(ApiError.notFound("Resource")), 404);
      case "P2003":
        return c.json(errorResponse(ApiError.badRequest("Related resource not found")), 400);
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return c.json(errorResponse(ApiError.badRequest("Invalid database input")), 400);
  }

  log("ERROR", `[mykasih] ${err instanceof Error ? err.message : String(err)}`);
  return c.json(errorResponse(ApiError.internal()), 500);
});

// GET /api/v1/mykasih/categories
mykasihRouter.get("/categories", async (c) => {
  const rows = await prisma.mykasihProduct.groupBy({
    by: ["category"],
    where: { isActive: true },
    _count: { id: true },
    orderBy: { category: "asc" },
  });

  return c.json(
    successResponse(
      rows.map((r) => ({ category: r.category, count: r._count.id })),
    ),
  );
});

// GET /api/v1/mykasih/products
mykasihRouter.get(
  "/products",
  zValidator("query", listProductsQuerySchema, (result, c) => {
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
    const { category, q, page, sort, order, inStock } = c.req.valid("query");

    const skip = (page - 1) * PAGE_SIZE;

    const where = {
      isActive: true,
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { name:        { contains: q, mode: INSENSITIVE } },
              { nameMs:      { contains: q, mode: INSENSITIVE } },
              { brand:       { contains: q, mode: INSENSITIVE } },
              { description: { contains: q, mode: INSENSITIVE } },
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
          id: true, name: true, nameMs: true, brand: true,
          category: true, unit: true, priceRm: true, subsidyRm: true,
          imageUrl: true, stock: true, barcode: true,
        },
        orderBy: { [sort]: order },
        skip,
        take: PAGE_SIZE,
      }),
    ]);

    return c.json(
      successResponse(products, {
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
      }),
    );
  },
);

// GET /api/v1/mykasih/products/:id
mykasihRouter.get(
  "/products/:id",
  zValidator("param", getProductParamSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse(ApiError.badRequest("Invalid product ID")),
        400,
      );
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");

    const product = await prisma.mykasihProduct.findUnique({ where: { id } });

    if (!product) {
      return c.json(errorResponse(ApiError.notFound(`Product "${id}"`)), 404);
    }

    return c.json(successResponse(product));
  },
);
