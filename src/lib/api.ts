import { NextResponse } from "next/server";

type PgErrorLike = {
  code?: string;
};

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function parseId(rawId: string) {
  const parsed = Number(rawId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export function isPgError(error: unknown): error is PgErrorLike {
  return typeof error === "object" && error !== null && "code" in error;
}

export function normalizeSemester(rawSemester: string | undefined) {
  const semester = rawSemester?.trim();
  if (!semester || !/^\d{4}\.[12]$/.test(semester)) {
    return null;
  }
  return semester;
}
