import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { linkGoogleByAccessCode, isNotConfigured } from "@/lib/db";
import { verifyPendingGoogleIdentity } from "@/lib/googleAccount";
import { normalizeAccessCode } from "@/lib/accessCode";
import {
  PENDING_GOOGLE_COOKIE,
  UID_COOKIE,
  HAS_SESSION_COOKIE,
  accessCookieOptions,
  hasSessionCookieOptions,
} from "@/lib/session";

export const runtime = "nodejs";

// "Already have a code from before? Enter it to link" — the other half of
// the cold Google sign-in choice. Attaches the verified pending identity to
// whichever account owns that code; never creates a new one.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const store = await cookies();
  const pending = verifyPendingGoogleIdentity(store.get(PENDING_GOOGLE_COOKIE)?.value);
  if (!pending) {
    return NextResponse.json({ error: "google_session_expired" }, { status: 400 });
  }

  const raw = (body as Record<string, unknown>)?.access_code;
  const code = normalizeAccessCode(typeof raw === "string" ? raw : "");
  if (!code) {
    return NextResponse.json({ error: "missing_code" }, { status: 400 });
  }

  try {
    const result = await linkGoogleByAccessCode(code, pending.google_uid, pending.google_email);
    if (!result.ok) {
      const status = result.reason === "code_not_found" ? 404 : 409;
      return NextResponse.json({ ok: false, error: result.reason }, { status });
    }
    const res = NextResponse.json({ ok: true, name: result.student.name });
    res.cookies.set(UID_COOKIE, result.student.id, accessCookieOptions());
    res.cookies.set(HAS_SESSION_COOKIE, "1", hasSessionCookieOptions());
    res.cookies.set(PENDING_GOOGLE_COOKIE, "", { ...accessCookieOptions(), maxAge: 0 });
    return res;
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    }
    console.error("google link-by-code failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
