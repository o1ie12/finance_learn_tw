import { NextResponse } from "next/server";
import { getClassRoomByCode, joinClassRoom, isNotConfigured } from "@/lib/db";
import { normalizeAccessCode } from "@/lib/accessCode";
import { CLASS_PARTICIPANT_COOKIE, accessCookieOptions } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const code = typeof b.code === "string" ? normalizeAccessCode(b.code) : "";
  const displayName = typeof b.display_name === "string" ? b.display_name.trim().slice(0, 40) : "";

  if (!code) return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  if (!displayName) return NextResponse.json({ error: "invalid_name" }, { status: 400 });

  try {
    const room = await getClassRoomByCode(code);
    if (!room) return NextResponse.json({ error: "room_not_found" }, { status: 404 });
    if (room.status === "finished") {
      return NextResponse.json({ error: "room_finished" }, { status: 409 });
    }

    const participant = await joinClassRoom(room.id, displayName);
    const res = NextResponse.json({
      participant_id: participant.id,
      room_id: room.id,
      line_slug: room.line_slug,
      status: room.status,
    });
    // Binds this browser to the participant it just created, so /submit can
    // refuse a score posted for anyone else. Short-lived: a class is a
    // session, not an account.
    res.cookies.set(CLASS_PARTICIPANT_COOKIE, participant.id, {
      ...accessCookieOptions(),
      maxAge: 60 * 60 * 6,
    });
    return res;
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    }
    console.error("class join failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
