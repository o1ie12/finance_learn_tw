/**
 * The two non-httpOnly mirror cookies, readable from client components.
 *
 * lib/session.ts owns the canonical names but imports server-only modules,
 * so client code could not import it and three components each kept a
 * private copy of the string. This file is the one client-safe home for the
 * names and for reading them; the server keeps setting them.
 */
import { homeFor } from "@/lib/modeModel";
import type { StudentMode } from "@/lib/types";

/** Mirrors lib/session.ts MODE_COOKIE. */
export const MODE_COOKIE = "fs_mode";
/** Mirrors lib/session.ts HAS_SESSION_COOKIE. */
export const HAS_SESSION_COOKIE = "fs_signed_in";

function cookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const hit = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1) : null;
}

export function readModeCookie(): StudentMode | null {
  const v = cookie(MODE_COOKIE);
  return v === "sim_first" || v === "full" ? v : null;
}

export function hasSessionCookie(): boolean {
  return cookie(HAS_SESSION_COOKIE) === "1";
}

/** Where "home" is for the signed-in student, per their stored mode. */
export function readHomeHref(): string {
  return homeFor(readModeCookie());
}
