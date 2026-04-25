import { z } from "zod";

const CATEGORIES = [
  "GROCERY", "DAIRY", "PRODUCE", "HOUSEHOLD",
  "PERSONAL_CARE", "BABY", "BEVERAGE", "FROZEN",
] as const;

const SORT_FIELDS = ["name", "priceRm", "subsidyRm", "createdAt"] as const;

export const listProductsQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  q:        z.string().max(100).optional(),
  page:     z.coerce.number().int().min(1).default(1),
  sort:     z.enum(SORT_FIELDS).default("name"),
  order:    z.enum(["asc", "desc"]).default("asc"),
  inStock:  z.enum(["true", "false"]).optional(),
});

export const getProductParamSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
