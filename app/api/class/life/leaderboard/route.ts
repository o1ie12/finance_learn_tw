import { NextResponse } from "next/server";
import { getClassParticipants, getClassRoom, listLifeSavesForRoom } from "@/lib/db";
import { normalizeTeam, rankTeams } from "@/lib/lifeGame/class";
import { isLifeRoom, isRoomId, serverError } from "../_lib/guard";

export const runtime = "nodejs";

/**
 * The life round's leaderboard, polled by the teacher's screen: GET ?room_id=.
 * Ranked by 財務健康分, computed here from each team's saved state (02 §8).
 * This route reads nothing from the request but the room id: no score,
 * total or balance a browser sends can reach the ranking.
 */
export async function GET(req: Request) {
  const roomId = new URL(req.url).searchParams.get("room_id");
  if (!isRoomId(roomId)) return NextResponse.json({ error: "invalid_room" }, { status: 400 });
  try {
    const room = await getClassRoom(roomId);
    if (!isLifeRoom(room)) return NextResponse.json({ error: "room_not_found" }, { status: 404 });
    const [saves, participants] = await Promise.all([listLifeSavesForRoom(room.id), getClassParticipants(room.id)]);

    const members = new Map<string, number>();
    for (const p of participants) {
      const team = normalizeTeam(p.team);
      if (team) members.set(team, (members.get(team) ?? 0) + 1);
    }
    const standings = rankTeams(saves, room.id).map((s) => ({ ...s, members: members.get(s.team) ?? 0 }));
    const started = new Set(standings.map((s) => s.team));
    const waitingTeams = [...members.entries()]
      .filter(([team]) => !started.has(team))
      .map(([team, count]) => ({ team, members: count }))
      .sort((a, b) => a.team.localeCompare(b.team, "zh-Hant"));

    return NextResponse.json(
      { status: room.status, players: participants.length, standings, waitingTeams },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (e) {
    return serverError(e, "class life leaderboard failed");
  }
}
