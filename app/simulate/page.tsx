import type { Metadata } from "next";
import DashboardCodeForm from "@/components/DashboardCodeForm";
import RouteNetworkView from "@/components/RouteNetworkView";
import { getCurrentStudent } from "@/lib/session";
import { loadSimPortfolioView, toClientView } from "@/lib/simPortfolioModel";
import {
  getProgress,
  getLatestSimulationRunsByLine,
  isNotConfigured,
} from "@/lib/db";
import type { Student, ModuleProgress, SimulationRun } from "@/lib/types";

export const metadata: Metadata = {
  title: "模擬",
  description: "直接進入每一條線的情境模擬，不必先讀完課程。",
};

/**
 * 模擬 — the same route map as 學習, with the simulations as its only stops.
 *
 * Intentionally not a separate layout. It renders the identical
 * RouteNetworkView so that switching between the two destinations changes
 * what is on the map, not the shape of the page around it.
 */
export default async function SimulatePage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string; linked_error?: string }>;
}) {
  // Google link/sign-in now lands on the student's own home, so this page
  // has to read the same feedback params /dashboard does.
  const { linked, linked_error } = await searchParams;
  const googleFeedback =
    linked === "1"
      ? ("linked" as const)
      : linked_error === "already_used"
        ? ("already_used" as const)
        : undefined;

  let student: Student | null = null;
  let notConfigured = false;
  let progress: ModuleProgress[] = [];
  let runsByLine: Record<string, SimulationRun> = {};
  let investReplayView: ReturnType<typeof toClientView> | null = null;

  try {
    student = await getCurrentStudent();
    if (student) {
      [progress, runsByLine] = await Promise.all([
        getProgress(student.id),
        getLatestSimulationRunsByLine(student.id),
      ]);
      if (runsByLine.touzi) {
        const view = await loadSimPortfolioView(student.id);
        investReplayView = view ? toClientView(view) : null;
      }
    }
  } catch (e) {
    if (isNotConfigured(e)) notConfigured = true;
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-black tracking-tight">模擬</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          模擬結果會存進你的學習紀錄。輸入代碼就能接續。
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

  return (
    <RouteNetworkView
      variant="simulate"
      student={student}
      progress={progress}
      runsByLine={runsByLine}
      investReplayView={investReplayView}
      googleFeedback={googleFeedback}
    />
  );
}
