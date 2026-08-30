import type { Metadata } from "next";
import Link from "next/link";
import SingleLineMap from "@/components/SingleLineMap";
import DashboardCodeForm from "@/components/DashboardCodeForm";
import { LINES } from "@/lib/lines";
import { buildLineStations } from "@/lib/buildStations";
import { allLineStatuses, nextActionAcrossLines } from "@/lib/progressModel";
import { getCurrentStudent } from "@/lib/session";
import { getProgress, getLatestSimulationRunsByLine, isNotConfigured } from "@/lib/db";
import type { Student, ModuleProgress, SimulationRun } from "@/lib/types";

export const metadata: Metadata = {
  title: "路網圖",
  description: "起點的完整路網：所有路線、所有站點，一次看。",
};

export default async function NetworkPage() {
  let student: Student | null = null;
  let notConfigured = false;
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
  } catch (e) {
    if (isNotConfigured(e)) notConfigured = true;
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-black tracking-tight">路網圖</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          用代碼找回你在任何裝置上的學習進度，才能看到你的路網。
        </p>
        <div className="mt-6">
          {notConfigured ? (
            <div className="rounded-2xl border border-hairline bg-surface p-6">
              <p className="text-[15px] leading-relaxed text-ink-soft">
                系統的資料庫尚未設定，暫時無法讀取進度。設定完成後即可使用。
              </p>
            </div>
          ) : (
            <DashboardCodeForm />
          )}
        </div>
      </div>
    );
  }

  const statuses = allLineStatuses(progress, runsByLine);
  // Same value driving the dashboard's 目前位置 card — land on the map
  // already showing the line the student is actually on, not an arbitrary
  // first line. Falls back to the flagship line once everything's complete
  // (nextActionAcrossLines returns null then).
  const next = nextActionAcrossLines(statuses);
  const initialLineId = next?.line.slug ?? LINES[0].slug;

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-faint">
            完整路網圖
          </p>
          <h1 className="mt-1.5 text-3xl font-black tracking-tight sm:text-4xl">
            {student.name} 的路網
          </h1>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-line-2 underline"
        >
          ← 回到我的路線圖
        </Link>
      </header>

      <div className="mt-6">
        <SingleLineMap
          initialLineId={initialLineId}
          lines={statuses.map((s) => {
            const stations = buildLineStations(
              s.line,
              progress,
              runsByLine[s.line.slug] ?? null,
            );
            // Only a line the student has *started* shows a "current" node
            // on the map; unstarted lines stay fully dimmed — same rule the
            // dashboard's map used.
            const mapped = s.started
              ? stations
              : stations.map((st) =>
                  st.status === "current"
                    ? { ...st, status: "todo" as const }
                    : st,
                );
            return { line: s.line, stations: mapped };
          })}
        />
      </div>

      <div className="mt-3 text-right">
        <Link href="/lines" className="text-sm font-medium text-line-2 underline">
          瀏覽所有路線 <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
