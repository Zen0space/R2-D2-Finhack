export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, "BAD_REQUEST", message, details);
  }

  static notFound(resource: string) {
    return new ApiError(404, "NOT_FOUND", `${resource} not found`);
  }

  static internal(message = "An unexpected error occurred") {
    return new ApiError(500, "INTERNAL_ERROR", message);
  }
}

export function errorResponse(err: ApiError) {
  return {
    success: false as const,
    error: {
      code: err.code,
      message: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
    },
  };
}
