import type { Metadata } from "next";
import { pageMeta } from "@/lib/pageMeta";
import Link from "next/link";
import { RouteBoard } from "@/components/today/RouteBoard";
import { getLatestSimulationRunsByLine, getLineCompletions, getProgress } from "@/lib/db";
import { FLOW_STEPS } from "@/content/flow";
import { LINES, START_LINE, getLine } from "@/lib/lines";
import { lineStats } from "@/lib/lineStats";
import { DEFAULT_MODE, effectiveMode } from "@/lib/modeModel";
import { allLineStatuses } from "@/lib/progressModel";
import { routeBoard } from "@/lib/routeBoard";
import { getCurrentStudent } from "@/lib/session";
import type { ModuleProgress, SimulationRun } from "@/lib/types";
import s from "./lines.module.css";

export const metadata: Metadata = pageMeta({
  title: "所有路線",
  description: "錢途的 12 條路線、54 站：每一站讀一份真的帳單、契約或薪資單，做一個決定，結果帶進你的人生模擬。",
  path: "/lines",
});

/**
 * The line catalogue (06 G5 item 4, 2026-11-02): the same route board as
 * 今天 (rows with progress, one open line, four zones), with how it works
 * above it. Signed out, every line shows from the start.
 */
export default async function LinesPage() {
  let progress: ModuleProgress[] = [];
  let runsByLine: Record<string, SimulationRun> = {};
  let completed = new Set<string>();
  let signedIn = false;
  let mode = DEFAULT_MODE;
  try {
    const student = await getCurrentStudent();
    if (student) {
      signedIn = true;
      mode = effectiveMode(student.mode);
      [progress, runsByLine, completed] = await Promise.all([getProgress(student.id), getLatestSimulationRunsByLine(student.id), getLineCompletions(student.id)]);
    }
  } catch {
    /* not configured: the catalogue without progress */
  }
  const lines = routeBoard(allLineStatuses(progress, runsByLine, mode, completed), progress, runsByLine, mode);
  const stations = LINES.reduce((a, l) => a + lineStats(l).stations, 0);
  const start = getLine(START_LINE)!;

  return (
    <div className={s.page}>
      <header className={s.head}>
        <p className={s.kicker}>路線圖 · {LINES.length} 條路線 · {stations} 站</p>
        <h1 className={s.h1}>選一條線，開始做任務</h1>
        <p className={s.intro}>每一條線是一個主題，線上的每一站是一份真實格式的工作任務。不用先讀完課文：直接做，做完看專家怎麼想，結果會帶進你的人生模擬。建議從{start.name}開始。</p>
        <ol className={s.how}>
          {/* 11 COPY-1: the stops from content/flow.ts. */}
          {FLOW_STEPS.map((st, i) => (
            <li key={st.id}>
              <b>{i + 1}</b>
              <span>
                <strong>{st.label}</strong>
                {st.meaning}
              </span>
            </li>
          ))}
        </ol>
        <div className={s.actions}>
          <Link href={signedIn ? "/today" : `/line/${START_LINE}`} className={s.primary}>
            {signedIn ? "回到今天" : `從${start.name}開始`}
          </Link>
          {!signedIn ? (
            <Link href="/signup" className={s.secondary}>
              免費建立學習卡
            </Link>
          ) : null}
        </div>
      </header>
      <RouteBoard lines={lines} stationsDone={lines.reduce((a, l) => a + l.done, 0)} linesDone={lines.filter((l) => l.complete).length} />
    </div>
  );
}
