import "server-only";

/**
 * 02 §3.4: when a student buys their first ETF despite the readiness
 * warning (card debt or under a month of emergency fund), the choice is
 * named in the next bias reveal they see. Appends one sentence to that
 * reveal and marks the save so it is named once.
 */

import { getSoloLifeSave, updateLifeSave } from "@/lib/db";
import type { Student } from "@/lib/types";
import { LifeStateSchema } from "./types";

export async function revealWithReadiness(student: Student, reveal: string, _lineSlug: string): Promise<string> {
  void _lineSlug;
  const save = await getSoloLifeSave(student.id);
  if (!save) return reveal;
  const parsed = LifeStateSchema.safeParse(save.state);
  if (!parsed.success) return reveal;
  const r = parsed.data.readiness;
  if (!r.warned || !r.proceeded || r.named) return reveal;
  const note = `另外，你在人生遊戲裡第 ${(r.turn ?? 0) + 1} 個月，${r.reason ?? "還沒準備好"}時就買了 ETF：系統提醒過「先管好錢，再讓錢長大」，你選了還是要買。這就是急著讓錢變多。`;
  const next = { ...parsed.data, readiness: { ...r, named: true } };
  // Best effort: if the game was saved meanwhile, the note shows again next time.
  await updateLifeSave(save.id, next, save.updated_at).catch(() => null);
  return `${reveal}${reveal.endsWith("。") ? "" : "。"}${note}`;
}
