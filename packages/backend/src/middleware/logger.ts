import type { MiddlewareHandler } from "hono";

const reset = "\x1b[0m";
const dim = "\x1b[2m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const red = "\x1b[31m";
const cyan = "\x1b[36m";

function statusColor(status: number): string {
  if (status >= 500) return red;
  if (status >= 400) return yellow;
  return green;
}

function statusLabel(status: number): string {
  if (status >= 500) return "ERROR";
  if (status >= 400) return "WARN";
  return "OK";
}

export const requestLogger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  const status = c.res.status;
  const color = statusColor(status);
  const label = statusLabel(status);
  console.log(
    `${dim}[API]${reset} ${cyan}${c.req.method}${reset} ${c.req.path} ` +
      `${color}[${label} ${status}]${reset} ${dim}${ms}ms${reset}`
  );
};

export function log(level: "DEBUG" | "INFO" | "WARN" | "ERROR", msg: string) {
  const color = level === "ERROR" ? red : level === "WARN" ? yellow : level === "DEBUG" ? dim : green;
  console.log(`${color}[${level}]${reset} ${msg}`);
}
