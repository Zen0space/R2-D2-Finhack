/**
 * Unified frontend error model for the DuitLater API.
 *
 * Backend always replies with one of two shapes:
 *
 *   { success: true,  data: T,    meta?: ... }
 *   { success: false, error: { code, message, details? } }
 *
 * `apiFetch` rejects with `ApiRequestError` whenever the HTTP status is not
 * 2xx, surfacing the backend's structured `error` object so callers can
 * distinguish recoverable cases (e.g. 404, 403) from generic failures.
 *
 * `formatErrorMessage` is the single helper components should reach for when
 * rendering a user-facing message (toast, banner, inline form error) — it
 * normalises ApiRequestError, plain Error, string, and `unknown` into one
 * BM-friendly fallback path.
 */

export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiSuccessEnvelope<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorEnvelope = {
  success: false;
  error: ApiErrorPayload;
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function apiFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<ApiSuccessEnvelope<T>> {
  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorEnvelope | null;
    const errorPayload = body?.error;

    throw new ApiRequestError(
      errorPayload?.message ?? `Request failed (${response.status})`,
      response.status,
      errorPayload?.code,
      errorPayload?.details,
    );
  }

  return (await response.json()) as ApiSuccessEnvelope<T>;
}

/**
 * Normalises any thrown value into a user-facing string. Components should
 * pass a feature-specific BM fallback so the message stays meaningful even
 * when the error is opaque (network failure, unknown thrown value, etc.).
 */
export function formatErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "string" && error.length > 0) {
    return error;
  }

  return fallback;
}
