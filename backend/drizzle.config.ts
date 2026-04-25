import type { Config } from "drizzle-kit";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is required for drizzle-kit");

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: dbUrl },
  strict: true,
  verbose: true,
} satisfies Config;
