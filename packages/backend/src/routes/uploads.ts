import { createHash, randomUUID } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { prisma } from "db";
import { requireAuth } from "../middleware/require-auth.js";
import { ApiError, errorResponse } from "../lib/errors.js";
import { successResponse } from "../lib/response.js";
import { log } from "../middleware/logger.js";

type UploadFileLike = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

const DEFAULT_ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export const uploadsRouter = new Hono();

uploadsRouter.use("*", requireAuth);
uploadsRouter.use(
  "*",
  bodyLimit({
    maxSize: getMaxUploadBytes(),
    onError: (c) =>
      c.json(
        errorResponse(new ApiError(413, "PAYLOAD_TOO_LARGE", "Upload exceeds size limit")),
        413,
      ),
  }),
);

uploadsRouter.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(errorResponse(err), err.statusCode as 400 | 401 | 413 | 500);
  }

  log("ERROR", `[uploads] ${err instanceof Error ? err.message : String(err)}`);
  return c.json(errorResponse(ApiError.internal()), 500);
});

// POST /api/v1/uploads
uploadsRouter.post("/", async (c) => {
  if ((process.env.UPLOAD_DRIVER ?? "local") !== "local") {
    throw ApiError.badRequest("Only local upload storage is currently supported");
  }

  const body = await c.req.parseBody();
  const file = body.file;
  if (!isUploadFile(file)) {
    throw ApiError.badRequest('Expected multipart field "file"');
  }

  const allowedMime = getAllowedMimeTypes();
  if (!allowedMime.includes(file.type)) {
    throw ApiError.badRequest("Unsupported file type", { allowedMime });
  }

  const maxBytes = getMaxUploadBytes();
  if (file.size <= 0) {
    throw ApiError.badRequest("Uploaded file is empty");
  }
  if (file.size > maxBytes) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Upload exceeds size limit");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.byteLength !== file.size) {
    throw ApiError.badRequest("Upload size mismatch");
  }
  if (!matchesMagicBytes(file.type, bytes)) {
    throw ApiError.badRequest("File content does not match declared type");
  }

  const now = new Date();
  const extension = MIME_EXTENSIONS[file.type];
  const storedName = `${randomUUID()}.${extension}`;
  const relativeDir = [
    now.getUTCFullYear().toString(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
  ].join("/");
  const relativePath = `${relativeDir}/${storedName}`;
  const uploadRoot = path.resolve(process.env.UPLOAD_ROOT ?? ".local/uploads");
  const targetDir = path.join(uploadRoot, relativeDir);
  const targetPath = path.join(targetDir, storedName);
  const tempPath = `${targetPath}.tmp-${process.pid}-${Date.now()}`;
  const publicPath = normalizePublicPath(process.env.UPLOAD_PUBLIC_PATH ?? "/uploads");
  const publicUrl = `${publicPath}/${relativePath}`;
  const sha256 = createHash("sha256").update(bytes).digest("hex");

  await mkdir(targetDir, { recursive: true });
  await writeFile(tempPath, bytes, { flag: "wx" });
  await rename(tempPath, targetPath);

  const asset = await prisma.uploadAsset.create({
    data: {
      ownerUserId: c.get("user").id,
      originalName: sanitizeOriginalName(file.name),
      storedName,
      relativePath,
      publicUrl,
      mimeType: file.type,
      sizeBytes: bytes.byteLength,
      sha256,
    },
    select: {
      id: true,
      originalName: true,
      publicUrl: true,
      mimeType: true,
      sizeBytes: true,
      sha256: true,
      createdAt: true,
    },
  });

  return c.json(successResponse({ upload: asset }), 201);
});

function isUploadFile(value: unknown): value is UploadFileLike {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<UploadFileLike>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.size === "number" &&
    typeof candidate.arrayBuffer === "function"
  );
}

function getMaxUploadBytes() {
  const maxMb = Number(process.env.UPLOAD_MAX_MB ?? "10");
  const safeMb = Number.isFinite(maxMb) && maxMb > 0 ? maxMb : 10;
  return Math.min(safeMb, 25) * 1024 * 1024;
}

function getAllowedMimeTypes() {
  return (process.env.UPLOAD_ALLOWED_MIME ?? DEFAULT_ALLOWED_MIME.join(","))
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value in MIME_EXTENSIONS);
}

function matchesMagicBytes(mimeType: string, bytes: Buffer) {
  switch (mimeType) {
    case "image/jpeg":
      return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      return (
        bytes.length >= 8 &&
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      );
    case "image/webp":
      return (
        bytes.length >= 12 &&
        bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
        bytes.subarray(8, 12).toString("ascii") === "WEBP"
      );
    case "application/pdf":
      return bytes.length >= 4 && bytes.subarray(0, 4).toString("ascii") === "%PDF";
    default:
      return false;
  }
}

function normalizePublicPath(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

function sanitizeOriginalName(value: string) {
  return value.replace(/[^\w .-]/g, "_").slice(0, 180) || "upload";
}
