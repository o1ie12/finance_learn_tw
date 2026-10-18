import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getClassParticipants, getClassRoomByCode, joinClassRoom } from "@/lib/db";
import { normalizeAccessCode } from "@/lib/accessCode";
import { DISPLAY_NAME_MAX, normalizeTeam } from "@/lib/lifeGame/class";
import { CLASS_PARTICIPANT_COOKIE, accessCookieOptions, getCurrentStudent } from "@/lib/session";
import { isLifeRoom, serverError } from "../_lib/guard";

export const runtime = "nodejs";

/**
 * Join a life round as a member of a team. Body: { code, display_name?, team }.
 * Class players must be signed in: a team save records a student as its
 * captain (migration-21, student_id NOT NULL). Sets the same httpOnly
 * participant cookie the quiz uses, which is what lets this browser act for
 * its team.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;
  const code = typeof b.code === "string" ? normalizeAccessCode(b.code) : "";
  const team = normalizeTeam(b.team);
  if (!code) return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  if (!team) return NextResponse.json({ error: "invalid_team" }, { status: 400 });

  try {
    const student = await getCurrentStudent();
    if (!student) return NextResponse.json({ error: "no_session" }, { status: 401 });

    const typed = typeof b.display_name === "string" ? b.display_name.replace(/\s+/g, " ").trim() : "";
    const displayName = [...(typed || student.name || "同學")].slice(0, DISPLAY_NAME_MAX).join("");

    const room = await getClassRoomByCode(code);
    if (!room) return NextResponse.json({ error: "room_not_found" }, { status: 404 });
    // A quiz room's code is for /class/play, not here.
    if (!isLifeRoom(room)) return NextResponse.json({ error: "not_life_room" }, { status: 409 });
    if (room.status === "finished") return NextResponse.json({ error: "room_finished" }, { status: 409 });

    // Joining again from the same browser into the same team reuses the row,
    // so a reload does not count the student twice.
    const store = await cookies();
    const existingId = store.get(CLASS_PARTICIPANT_COOKIE)?.value;
    let participant = existingId
      ? (await getClassParticipants(room.id)).find((p) => p.id === existingId && normalizeTeam(p.team) === team)
      : undefined;
    participant ??= await joinClassRoom(room.id, displayName, team);

    const res = NextResponse.json({
      participant_id: participant.id,
      room_id: room.id,
      team,
      status: room.status,
    });
    res.cookies.set(CLASS_PARTICIPANT_COOKIE, participant.id, {
      ...accessCookieOptions(),
      maxAge: 60 * 60 * 6,
    });
    return res;
  } catch (e) {
    return serverError(e, "class life join failed");
  }
}
