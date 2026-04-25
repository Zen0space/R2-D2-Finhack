import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import withSerwistInit from "@serwist/next";

const revision =
  (spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout ?? "").trim() ||
  randomUUID();

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ url: "/offline", revision }],
  disable: process.env.NODE_ENV === "development",
  swDest: "public/sw.js",
  swSrc: "src/app/sw.ts",
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
};

export default withSerwist(nextConfig);
