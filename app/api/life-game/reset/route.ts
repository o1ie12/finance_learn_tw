import { NextResponse } from "next/server";
import { isNotConfigured } from "@/lib/db";
import { getCurrentStudent } from "@/lib/session";
import { resetSolo } from "@/lib/lifeGame/server";
import { gamePayload } from "@/lib/lifeGame/view";

export const runtime = "nodejs";

/**
 * 06 E7.14: start the student's own life game over. Body must be JSON
 * { confirm: "reset" }: a cross-site form cannot send application/json, and
 * nothing resets by accident. Class team saves are never touched.
 */
export async function POST(req: Request) {
  if (!req.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ error: "json_required" }, { status: 415 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if ((body as { confirm?: unknown } | null)?.confirm !== "reset") {
    return NextResponse.json({ error: "confirm_required" }, { status: 400 });
  }
  try {
    const student = await getCurrentStudent();
    if (!student) return NextResponse.json({ error: "no_session" }, { status: 401 });
    const loaded = await resetSolo(student);
    if (!loaded) return NextResponse.json({ error: "stale" }, { status: 409 });
    return NextResponse.json(gamePayload(loaded.state, loaded.ctx));
  } catch (e) {
    if (isNotConfigured(e)) return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    console.error("life-game reset failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
