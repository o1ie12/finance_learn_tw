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
// A non-httpOnly marker mirroring "is there an active session" — carries no
// data, just "1" or absent, so client JS (SiteHeader) can route the logo to
// /dashboard vs / without a fetch or making every page dynamically rendered.
// Set/cleared alongside ACCESS_COOKIE or UID_COOKIE (whichever auth method
// just signed the student in), never read server-side for anything that
// matters (the real session check is still an httpOnly cookie + a DB lookup).
export const HAS_SESSION_COOKIE = "fs_signed_in";

// Same idea as HAS_SESSION_COOKIE: a non-httpOnly mirror of students.mode,
// so the header can send a returning student to the destination matching
// their mode without a fetch on every page or making every page dynamic.
// Never trusted for anything that matters — the database row is the truth,
// and every page that branches on mode reads it server-side from there.
export const MODE_COOKIE = "fs_mode";
// Set on joining a class room; a score may only be submitted for the
// participant this browser joined as. Participants are anonymous (a display
// name and a room code), so there is no student session to check instead.
export const CLASS_PARTICIPANT_COOKIE = "fs_class_participant";
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

export function hasSessionCookieOptions() {
  return {
    httpOnly: false,
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
