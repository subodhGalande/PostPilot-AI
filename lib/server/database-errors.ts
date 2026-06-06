import { NextResponse } from "next/server";

const DATABASE_ERROR_CODES = new Set(["P1000", "P1001", "P1002", "P1010"]);

const DATABASE_ERROR_PATTERNS = [
  "database server",
  "database_url",
  "connection refused",
  "can't reach database server",
  "authentication failed",
  "error parsing connection string",
  "invalid prisma",
  "prismaclientinitializationerror",
  "prisma client initialization",
];

function getErrorText(error: unknown) {
  if (error instanceof Error) {
    return `${error.name} ${error.message}`;
  }

  return String(error);
}

export function isDatabaseConnectionError(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && DATABASE_ERROR_CODES.has(code)) {
      return true;
    }
  }

  const errorText = getErrorText(error).toLowerCase();

  return DATABASE_ERROR_PATTERNS.some((pattern) => errorText.includes(pattern));
}

export function databaseConnectionErrorResponse() {
  return NextResponse.json(
    {
      error: "Database connection failed",
      message:
        "Server database connection failed. Check DATABASE_URL and database availability.",
    },
    { status: 503 },
  );
}
