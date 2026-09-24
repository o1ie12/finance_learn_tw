import { NextResponse } from "next/server";
import { setStudentMode, isNotConfigured } from "@/lib/db";
import {
  getCurrentStudent,
  MODE_COOKIE,
  hasSessionCookieOptions,
} from "@/lib/session";
import type { StudentMode } from "@/lib/types";

export const runtime = "nodejs";

function isMode(v: unknown): v is StudentMode {
  return v === "sim_first" || v === "full";
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const mode = (body as Record<string, unknown>)?.mode;
  if (!isMode(mode)) {
    return NextResponse.json({ error: "invalid_mode" }, { status: 400 });
  }

  try {
    const student = await getCurrentStudent();
    if (!student) {
      return NextResponse.json({ error: "no_session" }, { status: 401 });
    }
    // Switching is allowed, not just the first choice. Mode is a view over one
    // content base, so changing it never touches progress, runs or stamps.
    await setStudentMode(student.id, mode);
    const res = NextResponse.json({ mode });
    // Mirror it where the header can read it without a round trip.
    res.cookies.set(MODE_COOKIE, mode, hasSessionCookieOptions());
    return res;
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json(
        { error: "backend_not_configured" },
        { status: 503 },
      );
    }
    console.error("mode post failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
