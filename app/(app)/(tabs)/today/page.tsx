import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RouteBoard } from "@/components/today/RouteBoard";
import { nt } from "@/components/play/playModel";
import { Icon } from "@/components/ui/icons";
import { SHORTS } from "@/content/shorts";
import { isHiddenTask } from "@/lib/tasks/hidden";
import { getLatestSimulationRunsByLine, getLineCompletions, getProgress, getTaskResults } from "@/lib/db";
import { stationLetterCode } from "@/lib/design/lineCode";
import { lineVars } from "@/lib/design/lineVars";
import { loadGameHome } from "@/lib/gameHome";
import { getLine } from "@/lib/lines";
import { effectiveMode } from "@/lib/modeModel";
import { needsOnboarding } from "@/lib/onboarding";
import { allLineStatuses } from "@/lib/progressModel";
import { routeBoard } from "@/lib/routeBoard";
import { getCurrentStudent } from "@/lib/session";
import s from "@/components/today/today.module.css";

export const metadata: Metadata = { title: "今天" };

/**
 * 今天 (2026-10-24 redesign): where to continue, the life simulation at a
 * glance, and the route map. A course platform first; the metro is the way
 * the courses are drawn.
 */
export default async function TodayPage() {
  const student = await getCurrentStudent().catch(() => null);
  // 06 G5 item 8: signed out, 今天 goes to sign-up (which also has the code login).
  if (!student) redirect("/signup");
  if (needsOnboarding(student)) redirect("/onboarding/goal");

  const mode = effectiveMode(student.mode);
  const [data, results, progress, runsByLine, sticky] = await Promise.all([
    loadGameHome(student),
    getTaskResults(student.id).catch(() => []),
    getProgress(student.id),
    getLatestSimulationRunsByLine(student.id),
    getLineCompletions(student.id),
  ]);
  const lines = routeBoard(allLineStatuses(progress, runsByLine, mode, sticky), progress, runsByLine, mode);
  const stationsDone = lines.reduce((a, l) => a + l.done, 0);

  const stop = data.stop;
  // 06 F3.10, G9 item 3: the card's Short comes from the card's own line (a
  // Short's id is short.<line>.<task>.<step>); none there, no button.
  const doneTasks = new Set(results.map((r) => r.task_set_id));
  const shorts = SHORTS.filter((x) => !isHiddenTask(x.id) && stop.kind !== "turn" && x.from.split(".")[0] === stop.lineSlug);
  const short = shorts.find((x) => !doneTasks.has(x.id)) ?? shorts[0] ?? null;

  const line = stop.lineSlug ? getLine(stop.lineSlug) : null;
  const go = stop.kind === "turn" ? "/turn" : stop.href.replace(/^\/line\/([^/]+)\/course\//, "/line/$1/station/");
  const code = line && stop.stationNumber ? stationLetterCode(line, stop.stationNumber) : null;
  const g = data.game;
  const last = g?.state.history.at(-1) ?? null;
  const cashChange = last ? last.ledger.cashEnd - last.ledger.cashStart : 0;
  const ef = Math.floor((g?.view.efMonths ?? 0) * 10) / 10;

  return (
    <div className={s.page}>
      <div className={s.inner}>
        <header className={s.head}>
          <div>
            <h1 className={s.h1}>你好，{data.name}</h1>
            <p className={s.sub}>今天花 {stop.minutes} 分鐘，再完成一站。</p>
          </div>
          <span className={s.streak}>
            <Icon name="flame" size={18} filled />
            連續 {data.streak} 天
          </span>
        </header>

        <div className={s.top}>
          <article className={`${s.card} ${s.cont}`} style={line ? lineVars(line) : undefined}>
            <div className={s.contArt} data-turn={stop.kind === "turn" || undefined}>
              <div className={s.sign}>
                <span className={s.signStripe} aria-hidden="true" />
                <div>
                  <div className={s.signKicker}>下一站 NEXT{code ? ` · ${code}` : ""}</div>
                  <div className={s.signName}>{stop.kind === "turn" ? "這個月" : stop.stationName}</div>
                </div>
              </div>
            </div>
            <div className={s.contBody}>
              <div className={s.kickerLine}>
                {stop.kind === "turn" ? "人生模擬" : `繼續學習 · ${line?.name ?? ""}${stop.stationNumber && stop.stationsTotal ? ` · 第 ${stop.stationNumber} 站，共 ${stop.stationsTotal} 站` : ""}`}
              </div>
              <h2 className={s.contTitle}>{stop.kind === "turn" ? "這個月，你要怎麼安排你的錢？" : `${stop.stationName}${stop.taskTitle ? `：${stop.taskTitle}` : ""}`}</h2>
              <p className={s.contText}>{stop.learn ?? stop.doLine}</p>
              <div className={s.chips}>
                <span className={s.chipSoft}>約 {stop.minutes} 分鐘</span>
                <span className={s.chipSoft}>{stop.doLine}</span>
              </div>
              <div className={s.contActions}>
                <Link href={go} className={s.inkBtn}>
                  {stop.kind === "turn" ? "繼續" : "上車"}
                  <Icon name="chevron" size={18} />
                </Link>
                {short ? (
                  <Link href={`/short/${short.id}`} className={s.ghostBtn}>3 分鐘版</Link>
                ) : null}
              </div>
            </div>
          </article>

          <aside className={`${s.glassCard} ${s.life}`} aria-label="人生模擬">
            <div className={s.lifeHead}>
              <span className={s.kicker}>人生模擬</span>
              <span className={s.pill}>第 {(g?.state.turn ?? 0) + 1} 個月</span>
            </div>
            <div>
              <div className={s.small}>現金</div>
              <div className={s.big}>{nt(g?.state.accounts.cash ?? 0)}</div>
              {cashChange ? (
                <div className={cashChange > 0 ? s.up : s.down}>
                  {cashChange > 0 ? "▲" : "▼"} {nt(Math.abs(cashChange))} 上個月
                </div>
              ) : null}
            </div>
            <div className={s.efRow}>
              <div className={s.efLabel}><span>緊急預備金</span><b>{ef.toFixed(1)} / 3 個月</b></div>
              <div className={s.bar}><span style={{ width: `${Math.min(ef / 3, 1) * 100}%` }} /></div>
            </div>
            <div className={s.lifeGrid}>
              <div className={s.tile}><span className={s.small}>存款</span><b>{nt(data.money.saved.amount)}</b></div>
              <div className={s.tile}><span className={s.small}>壓力</span><b>{g ? (g.view.stress.level === "low" ? "低" : g.view.stress.level === "mid" ? "中" : "高") : "低"}</b></div>
            </div>
            <Link href="/turn" className={s.whiteBtn}>進入這個月</Link>
          </aside>
        </div>

        <RouteBoard lines={lines} stationsDone={stationsDone} linesDone={lines.filter((l) => l.complete).length} />
      </div>
    </div>
  );
}
