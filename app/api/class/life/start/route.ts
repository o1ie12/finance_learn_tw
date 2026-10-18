import { NextResponse } from "next/server";
import { getClassRoom, setClassRoomStatus } from "@/lib/db";
import { isLifeRoom, isRoomId, serverError } from "../_lib/guard";

export const runtime = "nodejs";

/** Start or finish a life round. Body: { room_id, host_token, status: "active" | "finished" }. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;
  if (!isRoomId(b.room_id) || typeof b.host_token !== "string") {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  if (b.status !== "active" && b.status !== "finished") {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }
  try {
    // Only life rooms: this route never changes a quiz room.
    const room = await getClassRoom(b.room_id);
    if (!isLifeRoom(room)) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const result = await setClassRoomStatus(room.id, b.host_token, b.status);
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: result.reason === "not_found" ? 404 : 403 });
    }
    return NextResponse.json({ room_id: result.room.id, status: result.room.status });
  } catch (e) {
    return serverError(e, "class life start failed");
  }
}
