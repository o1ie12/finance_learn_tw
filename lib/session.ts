import "server-only";
import { cookies } from "next/headers";
import { getStudentByCode } from "@/lib/db";
import type { Student } from "@/lib/types";

export const ACCESS_COOKIE = "fs_access_code";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function accessCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  };
}

export async function readAccessCode(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value ?? null;
}

export async function setAccessCookie(code: string): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, code, accessCookieOptions());
}

export async function clearAccessCookie(): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, "", { ...accessCookieOptions(), maxAge: 0 });
}

/**
 * Resolve the signed-in student from the access-code cookie.
 * Returns null when there is no cookie or no matching student.
 * Re-throws BackendNotConfiguredError so callers can distinguish
 * "not signed in" from "backend needs setup".
 */
export async function getCurrentStudent(): Promise<Student | null> {
  const code = await readAccessCode();
  if (!code) return null;
  return getStudentByCode(code);
}
