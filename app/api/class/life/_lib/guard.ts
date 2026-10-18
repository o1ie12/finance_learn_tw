import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getClassParticipants, getClassRoom, isNotConfigured } from "@/lib/db";
import { normalizeTeam } from "@/lib/lifeGame/class";
import { gamePayload } from "@/lib/lifeGame/view";
import type { GameContext } from "@/lib/lifeGame/engine";
import type { LifeState } from "@/lib/lifeGame/types";
import { CLASS_PARTICIPANT_COOKIE, getCurrentStudent } from "@/lib/session";
import type { ClassParticipant, ClassRoom, Student } from "@/lib/types";

/** Room ids are uuids; anything else is refused before it reaches a query. */
export function isRoomId(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);
}

export function isLifeRoom(room: ClassRoom | null): room is ClassRoom {
  return !!room && room.kind === "life";
}

export interface ClassPlayer {
  room: ClassRoom;
  seed: number;
  participant: ClassParticipant;
  team: string;
  student: Student;
}

/**
 * Who may touch a team's game: a signed-in student (a save needs a
 * student_id, migration-21) whose browser joined this life room (the
 * participant cookie set by /api/class/life/join, same guard as the quiz's
 * /api/class/submit). Returns the player, or the response to send.
 */
export async function requirePlayer(roomId: unknown): Promise<ClassPlayer | NextResponse> {
  if (!isRoomId(roomId)) return NextResponse.json({ error: "invalid_room" }, { status: 400 });
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "no_session" }, { status: 401 });
  const room = await getClassRoom(roomId);
  if (!isLifeRoom(room)) return NextResponse.json({ error: "room_not_found" }, { status: 404 });
  if (typeof room.seed !== "number") {
    console.error("life room without a seed", room.id);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  const store = await cookies();
  const participantId = store.get(CLASS_PARTICIPANT_COOKIE)?.value;
  if (!participantId) return NextResponse.json({ error: "not_joined" }, { status: 403 });
  const participants = await getClassParticipants(room.id);
  const participant = participants.find((p) => p.id === participantId);
  const team = participant ? normalizeTeam(participant.team) : null;
  if (!participant || !team) return NextResponse.json({ error: "not_joined" }, { status: 403 });
  return { room, seed: room.seed, participant, team, student };
}

/** The body every player endpoint returns: the turn payload plus the room's status. */
export function playerBody(player: ClassPlayer, state: LifeState, ctx: GameContext) {
  return {
    ...gamePayload(state, ctx),
    room: { id: player.room.id, status: player.room.status },
    team: player.team,
  };
}

export function serverError(e: unknown, label: string): NextResponse {
  if (isNotConfigured(e)) return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
  console.error(label, e);
  return NextResponse.json({ error: "server_error" }, { status: 500 });
}
