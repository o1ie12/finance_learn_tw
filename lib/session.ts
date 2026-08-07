import "server-only";
import { cookies } from "next/headers";
import { getStudentByCode, getStudentById } from "@/lib/db";
import type { Student } from "@/lib/types";

export const ACCESS_COOKIE = "fs_access_code";
// General-purpose session cookie (student id), additive alongside the
// original access-code cookie above. Google sign-in uses this one, since a
// Google-only account has no access_code to store. The access-code cookie
// and its behavior are untouched — existing code-based sessions keep
// working exactly as before, forever.
export const UID_COOKIE = "fs_uid";
// Short-lived carrier for a verified-but-not-yet-linked Google identity,
// between the OAuth callback and the "enter a code" / "start fresh" choice
// screen. See lib/googleAccount.ts for why this exists and how it's signed.
export const PENDING_GOOGLE_COOKIE = "fs_pending_google";
export const PENDING_GOOGLE_MAX_AGE = 10 * 60; // matches PENDING_TTL_MS in lib/googleAccount.ts
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

export async function readUid(): Promise<string | null> {
  const store = await cookies();
  return store.get(UID_COOKIE)?.value ?? null;
}

export async function readPendingGoogleCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(PENDING_GOOGLE_COOKIE)?.value ?? null;
}

/**
 * Resolve the signed-in student from either session cookie. Checks the
 * general uid cookie (Google sign-in, and any future auth method) first,
 * then falls back to the original access-code cookie unchanged — so a
 * student signed in only the old way resolves exactly as before.
 * Re-throws BackendNotConfiguredError so callers can distinguish
 * "not signed in" from "backend needs setup".
 */
export async function getCurrentStudent(): Promise<Student | null> {
  const uid = await readUid();
  if (uid) {
    const student = await getStudentById(uid);
    if (student) return student;
  }
  const code = await readAccessCode();
  if (!code) return null;
  return getStudentByCode(code);
}
