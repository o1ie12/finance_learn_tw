import { NextResponse } from "next/server";
import { createLifeClassRoom } from "@/lib/db";
import { newSeed } from "@/lib/lifeGame/rng";
import { serverError } from "../_lib/guard";

export const runtime = "nodejs";

/**
 * Open a 人生賽局 class round (02 §8): a `life` room with one fresh seed that
 * every team plays. The host token is returned only here; it is what lets
 * the teacher start and finish the round.
 */
export async function POST() {
  try {
    const room = await createLifeClassRoom(newSeed());
    return NextResponse.json({
      room_id: room.id,
      code: room.code,
      host_token: room.host_token,
      status: room.status,
    });
  } catch (e) {
    return serverError(e, "class life create failed");
  }
}
