import { NextResponse } from "next/server";
import { isNotConfigured } from "@/lib/db";
import { getCurrentStudent } from "@/lib/session";
import { loadOrCreateSolo } from "@/lib/lifeGame/server";
import { gamePayload } from "@/lib/lifeGame/view";

export const runtime = "nodejs";

/** Load the student's life game, creating one on first visit. */
export async function GET() {
  try {
    const student = await getCurrentStudent();
    if (!student) return NextResponse.json({ error: "no_session" }, { status: 401 });
    const loaded = await loadOrCreateSolo(student);
    if ("error" in loaded) return NextResponse.json({ error: loaded.error }, { status: 500 });
    return NextResponse.json(gamePayload(loaded.state, loaded.ctx));
  } catch (e) {
    if (isNotConfigured(e)) return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    console.error("life-game get failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
