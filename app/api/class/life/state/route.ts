import { NextResponse } from "next/server";
import { loadTeamGame } from "@/lib/lifeGame/classServer";
import { playerBody, requirePlayer, serverError } from "../_lib/guard";

export const runtime = "nodejs";

/**
 * The participant's team game: GET ?room_id=. Loads the team's shared save,
 * creating it with the room's seed on first open. Also tells the page the
 * room's status, so it can wait for the teacher's start.
 */
export async function GET(req: Request) {
  const roomId = new URL(req.url).searchParams.get("room_id");
  try {
    const player = await requirePlayer(roomId);
    if (player instanceof NextResponse) return player;
    const loaded = await loadTeamGame(player.student, player.room.id, player.team, player.seed);
    if ("error" in loaded) return NextResponse.json({ error: loaded.error }, { status: 500 });
    return NextResponse.json(playerBody(player, loaded.state, loaded.ctx));
  } catch (e) {
    return serverError(e, "class life state failed");
  }
}
