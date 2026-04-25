/**
 * GET /api/v1/user — current user + kampung + individual PayLater allowance.
 *
 * Source of truth for the dashboard's "PayLater Saya" card and the kampung
 * trust score widget. Resolves session via Better Auth.
 */

import { Hono } from "hono";
import { prisma } from "db";
import { requireAuth } from "../middleware/require-auth.js";
import { ApiError } from "../lib/errors.js";
import { successResponse } from "../lib/response.js";
import { createFeatureErrorHandler } from "../lib/feature-error-handler.js";

export const userRouter = new Hono();

userRouter.use("*", requireAuth);

userRouter.onError(createFeatureErrorHandler("user"));

userRouter.get("/", async (c) => {
  const sessionUser = c.get("user");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      individualPaylaterCents: true,
      kampungId: true,
      kampung: {
        select: {
          id: true,
          name: true,
          state: true,
          districtHint: true,
          nadiCentreId: true,
          trustScore: true,
        },
      },
    },
  });

  if (!user) {
    throw ApiError.notFound("User");
  }

  return c.json(
    successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      individualPaylaterCents: user.individualPaylaterCents,
      individualPaylaterRm: (user.individualPaylaterCents / 100).toFixed(2),
      kampung: user.kampung
        ? {
            id: user.kampung.id,
            name: user.kampung.name,
            state: user.kampung.state,
            districtHint: user.kampung.districtHint,
            nadiCentreId: user.kampung.nadiCentreId,
            trustScore: Number(user.kampung.trustScore),
          }
        : null,
    }),
  );
});
