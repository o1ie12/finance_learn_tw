import type { Metadata } from "next";
import Link from "next/link";
import { TRANSFER_STATIONS } from "@/lib/transferStations";
import { getLine } from "@/lib/lines";
import { getCurrentStudent } from "@/lib/session";
import { getProgress, getLatestSimulationRunsByLine, getLineCompletions } from "@/lib/db";
import { allLineStatuses } from "@/lib/progressModel";
import { effectiveMode } from "@/lib/modeModel";
import type { Student, ModuleProgress, SimulationRun } from "@/lib/types";
import { FloatCard } from "@/components/game/FloatCard";
import { Icon } from "@/components/game/icons";
import "@/components/linePage/linePage.css";

export const metadata: Metadata = {
  title: "轉乘站",
  description: "完成兩條相關的路線後解鎖，看見它們之間的連結。",
};

export default async function TransferListPage() {
  let student: Student | null = null;
  let progress: ModuleProgress[] = [];
  let runsByLine: Record<string, SimulationRun> = {};
  let completed = new Set<string>();
  try {
    student = await getCurrentStudent();
    if (student) {
      [progress, runsByLine, completed] = await Promise.all([
        getProgress(student.id),
        getLatestSimulationRunsByLine(student.id),
        getLineCompletions(student.id),
      ]);
    }
  } catch {
    /* not configured */
  }

  const statuses = student
    ? allLineStatuses(progress, runsByLine, effectiveMode(student.mode), completed)
    : [];
  const doneSet = new Set(statuses.filter((s) => s.complete).map((s) => s.line.slug));

  return (
    <div className="lp-page lp-page--narrow">
      <FloatCard as="div" strong index={0}>
        <p className="lp-eyebrow" lang="en">
          TRANSFER STATIONS
        </p>
        <h1 className="lp-h1">轉乘站</h1>
        <p className="lp-muted">
          完成兩條相關的路線後解鎖，看見它們之間的連結。這些站不重複教新東西，只是把你已經學過的兩件事接在一起。
        </p>
      </FloatCard>

      <FloatCard title="所有轉乘站" index={1}>
        <ul className="lp-rows">
          {TRANSFER_STATIONS.map((t) => {
            const lineA = getLine(t.lineA);
            const lineB = getLine(t.lineB);
            if (!lineA || !lineB) return null;
            const unlocked = doneSet.has(t.lineA) && doneSet.has(t.lineB);

            const content = (
              <>
                <span className="lp-row-text">
                  <span className="lp-dualbar" aria-hidden="true">
                    <span style={{ background: lineA.color }} />
                    <span style={{ background: lineB.color }} />
                  </span>
                  <span className="lp-row-title">{t.title}</span>
                  <span className="lp-row-sub">
                    {lineA.name} × {lineB.name}
                  </span>
                  {!unlocked && (
                    <span className="lp-row-sub">完成 {lineA.name} 與 {lineB.name} 後解鎖</span>
                  )}
                </span>
                <span className="lp-row-end">
                  {unlocked ? (
                    <Icon name="arrow" size={18} />
                  ) : (
                    <span className="g-chip g-chip--locked">
                      <Icon name="lock" size={12} />
                      未解鎖
                    </span>
                  )}
                </span>
              </>
            );

            return (
              <li key={t.id}>
                {unlocked ? (
                  <Link href={`/transfer/${t.id}`} className="lp-row">
                    {content}
                  </Link>
                ) : (
                  <div className="lp-row">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </FloatCard>
    </div>
  );
}
