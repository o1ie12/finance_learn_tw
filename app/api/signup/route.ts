import { NextResponse } from "next/server";
import { createStudent, isNotConfigured } from "@/lib/db";
import {
  ACCESS_COOKIE,
  HAS_SESSION_COOKIE,
  accessCookieOptions,
  hasSessionCookieOptions,
} from "@/lib/session";

export const runtime = "nodejs";

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const name = str(b?.name, 40);
  const school = str(b?.school, 60);
  const grade = str(b?.grade, 20);

  if (!name || !school || !grade) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const student = await createStudent({ name, school, grade });
    const res = NextResponse.json({
      access_code: student.access_code,
      name: student.name,
    });
    res.cookies.set(ACCESS_COOKIE, student.access_code, accessCookieOptions());
    res.cookies.set(HAS_SESSION_COOKIE, "1", hasSessionCookieOptions());
    return res;
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json(
        { error: "backend_not_configured" },
        { status: 503 },
      );
    }
    console.error("signup failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
