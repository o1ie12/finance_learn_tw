import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MoveCards } from "@/components/status/MoveCards";
import Link from "next/link";
import { PageFrame, PageHeader, pageStyles as ps } from "@/components/page/Page";
import { loadGameHome } from "@/lib/gameHome";
import { CARD_MOVES, MOVE_TEXT } from "@/lib/lifeGame/moveText";
import { MOVE_LABEL } from "@/lib/lifeGame/unlocks";
import { needsOnboarding } from "@/lib/onboarding";
import { getCurrentStudent } from "@/lib/session";

export const metadata: Metadata = { title: "行動" };

/**
 * 行動 (06 E8.7): what the student can do with money, as the same cards as
 * the turn's 行動 step. Moves are used inside a turn (step 5), so this tab
 * reads only; 進入這個月 opens the turn.
 */
export default async function MovesPage() {
  const student = await getCurrentStudent().catch(() => null);
  if (!student) redirect("/dashboard");
  if (needsOnboarding(student)) redirect("/onboarding/goal");
  const data = await loadGameHome(student);
  const view = data.game?.view;
  const unlocked = new Set(data.game?.state.unlocked ?? ["demand", "give"]);
  const cards = CARD_MOVES.filter((m) => unlocked.has(m)).map((m) => ({ id: m, name: MOVE_LABEL[m], ...MOVE_TEXT[m]! }));
  const locked = (view?.moves ?? [])
    .filter((m) => CARD_MOVES.includes(m.id) && !m.unlocked)
    .map((m) => ({ name: m.label, rule: m.lockedHint ?? "還沒解鎖" }));
  return (
    <PageFrame>
      <PageHeader
        kicker="人生模擬 · 每個月的第 5 步"
        title="行動"
        intro="繳完帳單後，用這些行動安排剩下的錢：存起來、投資、還債或幫助別人。這裡先看有哪些，真正做是在每個月裡。"
        actions={
          <Link href="/turn" className={ps.primary}>
            進入這個月
          </Link>
        }
      />
      <MoveCards cards={cards} locked={locked} />
    </PageFrame>
  );
}
