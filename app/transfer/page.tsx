import type { Metadata } from "next";
import Link from "next/link";
import { TRANSFER_STATIONS } from "@/lib/transferStations";
import { getLine } from "@/lib/lines";
import { getCurrentStudent } from "@/lib/session";
import { getProgress, getLatestSimulationRunsByLine } from "@/lib/db";
import { allLineStatuses } from "@/lib/progressModel";
import type { Student, ModuleProgress, SimulationRun } from "@/lib/types";

export const metadata: Metadata = {
  title: "轉乘站",
  description: "完成兩條相關的路線後解鎖，看見它們之間的連結。",
};

export default async function TransferListPage() {
  let student: Student | null = null;
  let progress: ModuleProgress[] = [];
  let runsByLine: Record<string, SimulationRun> = {};
  try {
    student = await getCurrentStudent();
    if (student) {
      [progress, runsByLine] = await Promise.all([
        getProgress(student.id),
        getLatestSimulationRunsByLine(student.id),
      ]);
    }
  } catch {
    /* not configured */
  }

  const statuses = student ? allLineStatuses(progress, runsByLine) : [];
  const doneSet = new Set(statuses.filter((s) => s.complete).map((s) => s.line.slug));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-display text-xs font-bold uppercase tracking-widest text-ink-faint">
        Transfer Stations
      </p>
      <h1 className="mt-1.5 text-4xl font-black tracking-tight">轉乘站</h1>
      <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-ink-soft">
        完成兩條相關的路線後解鎖，看見它們之間的連結——這些站不重複教新東西，只是把你已經學過的兩件事接在一起。
      </p>

      <div className="mt-8 space-y-3">
        {TRANSFER_STATIONS.map((t) => {
          const lineA = getLine(t.lineA);
          const lineB = getLine(t.lineB);
          if (!lineA || !lineB) return null;
          const unlocked = doneSet.has(t.lineA) && doneSet.has(t.lineB);

          const content = (
            <div
              className={`rounded-2xl border p-5 transition-colors ${
                unlocked ? "border-hairline bg-surface hover:border-ink/40" : "border-hairline bg-surface opacity-60"
              }`}
            >
              <div className="flex h-1 w-16 overflow-hidden rounded-full" aria-hidden="true">
                <div className="flex-1" style={{ background: lineA.color }} />
                <div className="flex-1" style={{ background: lineB.color }} />
              </div>
              <p className="mt-3 font-bold">{t.title}</p>
              <p className="mt-1 text-sm text-ink-soft">
                {lineA.name} × {lineB.name}
              </p>
              {!unlocked && (
                <p className="mt-2 text-xs font-medium text-ink-faint">
                  完成 {lineA.name} 與 {lineB.name} 後解鎖
                </p>
              )}
            </div>
          );

          return unlocked ? (
            <Link key={t.id} href={`/transfer/${t.id}`}>
              {content}
            </Link>
          ) : (
            <div key={t.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
