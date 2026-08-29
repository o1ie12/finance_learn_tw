import { NextResponse } from "next/server";
import { setClassRoomStatus, isNotConfigured } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const roomId = b.room_id;
  const hostToken = b.host_token;
  const action = b.action;
  if (typeof roomId !== "string" || typeof hostToken !== "string") {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  if (action !== "active" && action !== "finished") {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  try {
    const result = await setClassRoomStatus(roomId, hostToken, action);
    if (!result.ok) {
      const status = result.reason === "not_found" ? 404 : 403;
      return NextResponse.json({ error: result.reason }, { status });
    }
    return NextResponse.json({ room: result.room });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    }
    console.error("class start failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
