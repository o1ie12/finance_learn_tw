import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createStudentWithGoogle, isNotConfigured } from "@/lib/db";
import { verifyPendingGoogleIdentity } from "@/lib/googleAccount";
import {
  PENDING_GOOGLE_COOKIE,
  UID_COOKIE,
  HAS_SESSION_COOKIE,
  accessCookieOptions,
  hasSessionCookieOptions,
} from "@/lib/session";

export const runtime = "nodejs";

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

// "Start fresh" — the second half of the cold Google sign-in choice. Only
// reachable with a verified pending identity from the OAuth callback; the
// client never supplies the google_uid/email itself.
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

  const b = body as Record<string, unknown>;
  const name = str(b?.name, 40);
  const school = str(b?.school, 60);
  const grade = str(b?.grade, 20);
  if (!name || !school || !grade) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const student = await createStudentWithGoogle({
      name,
      school,
      grade,
      google_uid: pending.google_uid,
      google_email: pending.google_email,
    });
    const res = NextResponse.json({ ok: true, name: student.name });
    res.cookies.set(UID_COOKIE, student.id, accessCookieOptions());
    res.cookies.set(HAS_SESSION_COOKIE, "1", hasSessionCookieOptions());
    res.cookies.set(PENDING_GOOGLE_COOKIE, "", { ...accessCookieOptions(), maxAge: 0 });
    return res;
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    }
    console.error("google create failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
