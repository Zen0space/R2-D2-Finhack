import { createHash, randomInt } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "db";
import { ApiError } from "../lib/errors.js";
import { createFeatureErrorHandler } from "../lib/feature-error-handler.js";
import { successResponse } from "../lib/response.js";
import { isSmtpConfigured, sendSmtpMail, SmtpError } from "../lib/smtp.js";

const CODE_TTL_MINUTES = 10;

const requestCodeSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120).optional(),
});

const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

export const authVerificationRouter = new Hono();

authVerificationRouter.onError(createFeatureErrorHandler("auth-verification"));

authVerificationRouter.post("/registration-code", async (c) => {
  const body = parseJson(requestCodeSchema, await readJson(c.req));
  const email = normalizeEmail(body.email);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw ApiError.conflict("Akaun dengan e-mel ini sudah wujud.");
  }

  if (!isSmtpConfigured()) {
    throw ApiError.internal("SMTP belum dikonfigurasi. Sila set SMTP_HOST dan SMTP_FROM.");
  }

  const code = createCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  await prisma.verification.deleteMany({
    where: { identifier: registrationIdentifier(email) },
  });

  await prisma.verification.create({
    data: {
      identifier: registrationIdentifier(email),
      value: hashCode(email, code),
      expiresAt,
    },
  });

  try {
    await sendSmtpMail({
      to: email,
      subject: "Kod pengesahan DuitLater",
      text: buildVerificationText(code, body.name),
      html: buildVerificationHtml(code, body.name),
    });
  } catch (error) {
    await prisma.verification.deleteMany({
      where: { identifier: registrationIdentifier(email) },
    });

    if (error instanceof SmtpError) {
      throw ApiError.badRequest(
        "E-mel pengesahan tidak dapat dihantar. Sila guna alamat e-mel sebenar yang boleh menerima mesej.",
      );
    }

    throw error;
  }

  return c.json(
    successResponse({
      email,
      expiresInMinutes: CODE_TTL_MINUTES,
    }),
  );
});

authVerificationRouter.post("/verify-registration-code", async (c) => {
  const body = parseJson(verifyCodeSchema, await readJson(c.req));
  const email = normalizeEmail(body.email);

  const verification = await prisma.verification.findFirst({
    where: {
      identifier: registrationIdentifier(email),
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!verification || verification.value !== hashCode(email, body.code)) {
    throw ApiError.badRequest("Kod pengesahan tidak sah atau sudah tamat tempoh.");
  }

  await prisma.verification.delete({
    where: { id: verification.id },
  });

  return c.json(successResponse({ email, verified: true }));
});

function createCode() {
  return randomInt(100000, 1000000).toString();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function registrationIdentifier(email: string) {
  return `registration:${email}`;
}

function hashCode(email: string, code: string) {
  const secret = process.env.BETTER_AUTH_SECRET ?? "duitlater";
  return createHash("sha256")
    .update(`${secret}:${normalizeEmail(email)}:${code}`)
    .digest("hex");
}

function buildVerificationText(code: string, name?: string) {
  const greeting = name ? `Salam ${name},` : "Salam,";
  return `${greeting}

Kod pengesahan DuitLater anda ialah:

${code}

Kod ini tamat tempoh dalam ${CODE_TTL_MINUTES} minit. Jika anda tidak meminta kod ini, abaikan e-mel ini.
`;
}

function buildVerificationHtml(code: string, name?: string) {
  const greeting = name ? `Salam ${escapeHtml(name)},` : "Salam,";
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2933">
      <p>${greeting}</p>
      <p>Kod pengesahan DuitLater anda ialah:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>
      <p>Kod ini tamat tempoh dalam ${CODE_TTL_MINUTES} minit.</p>
      <p>Jika anda tidak meminta kod ini, abaikan e-mel ini.</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseJson<T extends z.ZodTypeAny>(schema: T, value: unknown): z.infer<T> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw ApiError.badRequest("Invalid request body", result.error.flatten());
  }

  return result.data;
}

async function readJson(req: { json: () => Promise<unknown> }) {
  try {
    return await req.json();
  } catch {
    throw ApiError.badRequest("Request body must be valid JSON");
  }
}
