import { NextResponse } from "next/server";
import { handleAction } from "@/lib/lifeGame/api";
import { loadTeamGame, persistTeamGame } from "@/lib/lifeGame/classServer";
import { playerBody, requirePlayer, serverError } from "../_lib/guard";

export const runtime = "nodejs";

/**
 * Apply one step of the team's turn. POST ?room_id= (or room_id in the body)
 * with body { expect?: {turn, phase}, action }: the query form is what
 * components/play/PlayScreen's `endpoints` prop sends.
 * Only a joined participant of this room may act, and only while the room
 * is active. The engine runs here; anything that tries to set a balance or
 * a score is refused (lib/lifeGame/api.ts), and the save is written with
 * optimistic concurrency so two teammates cannot both apply a step.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }
  const { room_id: bodyRoomId, ...request } = body as Record<string, unknown>;
  const roomId = new URL(req.url).searchParams.get("room_id") ?? bodyRoomId;
  try {
    const player = await requirePlayer(roomId);
    if (player instanceof NextResponse) return player;
    if (player.room.status !== "active") {
      return NextResponse.json({ error: "room_not_active", status: player.room.status }, { status: 409 });
    }
    const loaded = await loadTeamGame(player.student, player.room.id, player.team, player.seed);
    if ("error" in loaded) return NextResponse.json({ error: loaded.error }, { status: 500 });

    // Everything but room_id goes through the same check as the solo game,
    // so a stray `score` or `cash` anywhere in the body is refused.
    const result = handleAction(loaded.state, request, loaded.ctx);
    if (!result.ok) {
      const status = result.error === "stale" ? 409 : result.error === "forbidden_field" ? 400 : 422;
      return NextResponse.json(
        {
          error: result.error,
          detail: "detail" in result ? result.detail : undefined,
          needsConfirm: "needsConfirm" in result ? result.needsConfirm : undefined,
        },
        { status },
      );
    }
    const saved = await persistTeamGame(loaded.save, result.state);
    if (!saved) return NextResponse.json({ error: "stale" }, { status: 409 });
    return NextResponse.json(playerBody(player, result.state, loaded.ctx));
  } catch (e) {
    return serverError(e, "class life action failed");
  }
}
