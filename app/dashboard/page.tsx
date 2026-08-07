import type { Metadata } from "next";
import DashboardCodeForm from "@/components/DashboardCodeForm";
import SignOutButton from "@/components/SignOutButton";
import DashboardMapView from "@/components/DashboardMapView";
import DashboardCardGrid from "@/components/DashboardCardGrid";
import DashboardABTest from "@/components/DashboardABTest";
import { allLineStatuses } from "@/lib/progressModel";
import { getCurrentStudent } from "@/lib/session";
import {
  getProgress,
  getLatestSimulationRunsByLine,
  isNotConfigured,
  markSeenAbDashboardTest,
} from "@/lib/db";
import { isDashboardAbTestEnabled } from "@/lib/config";
import type { Student, ModuleProgress, SimulationRun } from "@/lib/types";

export const metadata: Metadata = {
  title: "我的路線圖",
  description: "你的學習首頁：所有路線的進度、下一步，以及完成的模擬與證書。",
};

export default async function DashboardPage() {
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

  const statuses = allLineStatuses(progress, runsByLine);

  // ---------------------------------------------------------------------
  // TEMPORARY: dashboard map-vs-card-grid pilot test (ENABLE_DASHBOARD_AB_TEST).
  // The first time a student lands here with at least one completed terminal
  // simulation and hasn't seen the comparison screen yet, show it once instead
  // of the normal dashboard, then mark it seen so it never shows again.
  // Follow-up: once the pilot group's feedback picks a winner, either extend
  // that design site-wide or delete DashboardABTest, DashboardCardGrid, this
  // branch, and the seen_ab_dashboard_test column/flag entirely.
  const hasCompletedAnySim = statuses.some((s) => s.simDone);
  const showAbTest =
    isDashboardAbTestEnabled() &&
    !student.seen_ab_dashboard_test &&
    hasCompletedAnySim;

  if (showAbTest) {
    try {
      await markSeenAbDashboardTest(student.id);
    } catch (e) {
      console.error("markSeenAbDashboardTest failed", e);
    }
  }
  // ---------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-faint">
            我的路線圖
          </p>
          <h1 className="mt-1.5 text-3xl font-black tracking-tight sm:text-4xl">
            {student.name} 的路網
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {student.school} · {student.grade}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="money rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm tracking-[0.15em]">
            {student.access_code}
          </span>
          <SignOutButton />
        </div>
      </header>

      {showAbTest ? (
        <DashboardABTest
          variantA={
            <DashboardMapView
              statuses={statuses}
              progress={progress}
              runsByLine={runsByLine}
            />
          }
          variantB={<DashboardCardGrid statuses={statuses} />}
          feedbackFormUrl={process.env.AB_TEST_FEEDBACK_FORM_URL ?? null}
        />
      ) : (
        <DashboardMapView
          statuses={statuses}
          progress={progress}
          runsByLine={runsByLine}
        />
      )}
    </div>
  );
}
