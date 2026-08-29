import { NextResponse } from "next/server";
import { createClassRoom, isNotConfigured } from "@/lib/db";
import { isLineSlug } from "@/lib/lines";
import { getPrePostQuestions } from "@/lib/prePostQuestions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const lineSlug = (body as Record<string, unknown>)?.line_slug;
  if (!isLineSlug(lineSlug)) {
    return NextResponse.json({ error: "invalid_line" }, { status: 400 });
  }
  if (getPrePostQuestions(lineSlug).length === 0) {
    return NextResponse.json({ error: "no_questions_for_line" }, { status: 400 });
  }

  try {
    const room = await createClassRoom(lineSlug);
    return NextResponse.json({
      room_id: room.id,
      code: room.code,
      host_token: room.host_token,
      line_slug: room.line_slug,
      status: room.status,
    });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    }
    console.error("class create failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
