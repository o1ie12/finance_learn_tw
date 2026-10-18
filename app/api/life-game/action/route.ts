import { NextResponse } from "next/server";
import { bumpDailyActivity, isNotConfigured } from "@/lib/db";
import { getCurrentStudent } from "@/lib/session";
import { handleAction } from "@/lib/lifeGame/api";
import { loadOrCreateSolo, persist } from "@/lib/lifeGame/server";
import { gamePayload } from "@/lib/lifeGame/view";
import { taipeiDay } from "@/lib/streak";

export const runtime = "nodejs";

/**
 * Apply one step of the turn. Body: { expect?: {turn, phase}, action }.
 * The engine runs here; the browser never sends balances or scores
 * (lib/lifeGame/api.ts refuses them).
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  try {
    const student = await getCurrentStudent();
    if (!student) return NextResponse.json({ error: "no_session" }, { status: 401 });
    const loaded = await loadOrCreateSolo(student);
    if ("error" in loaded) return NextResponse.json({ error: loaded.error }, { status: 500 });

    const result = handleAction(loaded.state, body, loaded.ctx);
    if (!result.ok) {
      const status = result.error === "stale" ? 409 : result.error === "forbidden_field" ? 400 : 422;
      return NextResponse.json(
        { error: result.error, detail: "detail" in result ? result.detail : undefined, needsConfirm: "needsConfirm" in result ? result.needsConfirm : undefined },
        { status },
      );
    }
    const saved = await persist(loaded.save, result.state);
    if (!saved) return NextResponse.json({ error: "stale" }, { status: 409 });

    // A finished turn counts toward the streak (02 §7.3).
    if (result.state.turn > loaded.state.turn) {
      await bumpDailyActivity(student.id, taipeiDay(new Date()));
    }
    return NextResponse.json(gamePayload(result.state, loaded.ctx));
  } catch (e) {
    if (isNotConfigured(e)) return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    console.error("life-game action failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
