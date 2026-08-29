import { NextResponse } from "next/server";
import { getClassParticipants, isNotConfigured } from "@/lib/db";

export const runtime = "nodejs";

// Polled by the teacher's host screen for a live leaderboard.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const roomId = url.searchParams.get("room_id");
  if (!roomId) return NextResponse.json({ error: "invalid_room" }, { status: 400 });

  try {
    const participants = await getClassParticipants(roomId);
    return NextResponse.json({ participants });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    }
    console.error("class leaderboard failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
