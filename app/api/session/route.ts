import { NextResponse } from "next/server";
import { getStudentByCode, isNotConfigured } from "@/lib/db";
import {
  ACCESS_COOKIE,
  UID_COOKIE,
  HAS_SESSION_COOKIE,
  accessCookieOptions,
  hasSessionCookieOptions,
  getCurrentStudent,
} from "@/lib/session";
import { normalizeAccessCode } from "@/lib/accessCode";

export const runtime = "nodejs";

// Current session (used by the client to know sign-in state).
export async function GET() {
  try {
    const student = await getCurrentStudent();
    return NextResponse.json({
      student: student
        ? { name: student.name, access_code: student.access_code }
        : null,
    });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json(
        { error: "backend_not_configured" },
        { status: 503 },
      );
    }
    console.error("session get failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// Resume on another device by entering the access code.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const raw = (body as Record<string, unknown>)?.access_code;
  const code = normalizeAccessCode(typeof raw === "string" ? raw : "");
  if (!code) {
    return NextResponse.json({ error: "missing_code" }, { status: 400 });
  }

  try {
    const student = await getStudentByCode(code);
    if (!student) {
      return NextResponse.json(
        { ok: false, error: "not_found" },
        { status: 404 },
      );
    }
    const res = NextResponse.json({
      ok: true,
      student: { name: student.name, access_code: student.access_code },
    });
    res.cookies.set(ACCESS_COOKIE, code, accessCookieOptions());
    res.cookies.set(HAS_SESSION_COOKIE, "1", hasSessionCookieOptions());
    return res;
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json(
        { error: "backend_not_configured" },
        { status: 503 },
      );
    }
    console.error("session post failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// Sign out on this device.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_COOKIE, "", { ...accessCookieOptions(), maxAge: 0 });
  res.cookies.set(UID_COOKIE, "", { ...accessCookieOptions(), maxAge: 0 });
  res.cookies.set(HAS_SESSION_COOKIE, "", {
    ...hasSessionCookieOptions(),
    maxAge: 0,
  });
  return res;
}
