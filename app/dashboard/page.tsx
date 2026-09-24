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
  title: "我的路線圖",
  description: "你的學習首頁：所有路線的進度、下一步，以及完成的模擬與證書。",
};

/**
 * 學習 — the full-depth view. This and /simulate render the same
 * RouteNetworkView with different variants, which is what makes switching
 * between them read as the content changing rather than a navigation.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string; linked_error?: string }>;
}) {
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
      // 2b's widget only unlocks once 投資線's terminal sim is done.
      if (runsByLine.touzi) {
        const view = await loadSimPortfolioView(student.id);
        investReplayView = view ? toClientView(view) : null;
      }
    }
  } catch (e) {
    if (isNotConfigured(e)) notConfigured = true;
  }

  // Not signed in (or backend down): resume-by-code gate.
  if (!student) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-black tracking-tight">我的路線圖</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          用代碼找回你在任何裝置上的學習進度。
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
      variant="learn"
      student={student}
      progress={progress}
      runsByLine={runsByLine}
      investReplayView={investReplayView}
      googleFeedback={googleFeedback}
    />
  );
}
