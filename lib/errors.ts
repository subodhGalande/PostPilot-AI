export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type ErrorCategory =
  | "auth-expired"
  | "rate-limit"
  | "validation"
  | "conflict"
  | "server-config"
  | "network"
  | "unknown";

export interface ClassifiedError {
  category: ErrorCategory;
  message: string;
  shouldRedirect: boolean;
}

export function classifyApiError(error: unknown): ClassifiedError {
  let status: number | undefined;
  let message = "An unexpected error occurred. Please try again.";

  if (error instanceof ApiError) {
    status = error.status;
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
    // Capture network-related fetch errors
    if (
      error.name === "TypeError" &&
      (error.message.includes("fetch") ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("network"))
    ) {
      return {
        category: "network",
        message: "Connection lost. Please check your internet connection.",
        shouldRedirect: false,
      };
    }
    // Inspect status property if attached to generic Error (standard pattern for some APIs/fetch clients)
    if ("status" in error && typeof (error as any).status === "number") {
      status = (error as any).status;
    }
  }

  const messageLower = message.toLowerCase();

  // 1. Differentiate API Key / Config issue
  if (
    messageLower.includes("api_key") ||
    messageLower.includes("api key") ||
    messageLower.includes("not configured")
  ) {
    return {
      category: "server-config",
      message: "Service temporarily unavailable due to server configuration issues.",
      shouldRedirect: false,
    };
  }

  // 2. Differentiate Session Expiry
  if (
    status === 401 ||
    messageLower.includes("unauthorized") ||
    messageLower.includes("jwt") ||
    messageLower.includes("session expired")
  ) {
    return {
      category: "auth-expired",
      message: "Your session has expired. Redirecting to login...",
      shouldRedirect: true,
    };
  }

  // 3. Differentiate Rate Limits
  if (
    status === 429 ||
    messageLower.includes("too many requests") ||
    messageLower.includes("rate limit") ||
    messageLower.includes("quota")
  ) {
    return {
      category: "rate-limit",
      message: "Too many requests. Please wait a moment and try again.",
      shouldRedirect: false,
    };
  }

  // 4. Differentiate Version Conflicts
  if (status === 409 || messageLower.includes("conflict")) {
    return {
      category: "conflict",
      message: "This draft was updated in another tab. Please refresh to get the latest version.",
      shouldRedirect: false,
    };
  }

  // 5. Differentiate Validation / Bad Requests
  if (
    status === 400 ||
    messageLower.includes("validation") ||
    messageLower.includes("invalid request")
  ) {
    return {
      category: "validation",
      message: message || "Invalid request fields.",
      shouldRedirect: false,
    };
  }

  // 6. Generic Server Error
  if (status && status >= 500) {
    return {
      category: "server-config",
      message: "Server error. Please try again later.",
      shouldRedirect: false,
    };
  }

  // 7. Unknown / Fallback
  return {
    category: "unknown",
    message: message || "Something went wrong. Please try again.",
    shouldRedirect: false,
  };
}
