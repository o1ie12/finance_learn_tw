import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CLASS_PARTICIPANT_COOKIE } from "@/lib/session";
import { submitClassResult, isNotConfigured } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const participantId = b.participant_id;
  const score = Number(b.score);
  const totalMs = Number(b.total_ms);

  if (typeof participantId !== "string") {
    return NextResponse.json({ error: "invalid_participant" }, { status: 400 });
  }
  // Only the browser that joined as this participant may submit for them.
  // Anyone holding a projected class code could otherwise post a perfect
  // score under any participant id read off the leaderboard.
  const store = await cookies();
  if (store.get(CLASS_PARTICIPANT_COOKIE)?.value !== participantId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!Number.isFinite(score) || score < 0 || score > 10) {
    return NextResponse.json({ error: "invalid_score" }, { status: 400 });
  }
  if (!Number.isFinite(totalMs) || totalMs < 0) {
    return NextResponse.json({ error: "invalid_time" }, { status: 400 });
  }

  try {
    const participant = await submitClassResult(participantId, score, totalMs);
    if (!participant) {
      return NextResponse.json({ error: "participant_not_found" }, { status: 404 });
    }
    return NextResponse.json({ participant });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    }
    console.error("class submit failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
