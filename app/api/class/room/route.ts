import { NextResponse } from "next/server";
import { getClassRoomByCode, isNotConfigured } from "@/lib/db";
import { normalizeAccessCode } from "@/lib/accessCode";

export const runtime = "nodejs";

// Polled by a waiting student to find out when the teacher starts the round.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = normalizeAccessCode(url.searchParams.get("code") ?? "");
  if (!code) return NextResponse.json({ error: "invalid_code" }, { status: 400 });

  try {
    const room = await getClassRoomByCode(code);
    if (!room) return NextResponse.json({ error: "room_not_found" }, { status: 404 });
    return NextResponse.json({
      room_id: room.id,
      line_slug: room.line_slug,
      status: room.status,
    });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    }
    console.error("class room lookup failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
