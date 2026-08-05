import type { Metadata } from "next";
import Link from "next/link";
import LineTrack from "@/components/LineTrack";
import DashboardCodeForm from "@/components/DashboardCodeForm";
import SignOutButton from "@/components/SignOutButton";
import { LINES } from "@/lib/lines";
import { buildLineStations } from "@/lib/buildStations";
import {
  allLineStatuses,
  nextActionAcrossLines,
} from "@/lib/progressModel";
import { getCurrentStudent } from "@/lib/session";
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
  const next = nextActionAcrossLines(statuses);
  const stationsDone = progress.filter((p) => p.completed_at).length;
  const stationsTotal = LINES.reduce((n, l) => n + l.stationModules.length, 0);
  const simsDone = statuses.filter((s) => s.simDone).length;
  const completedLines = statuses.filter((s) => s.complete);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {student.name} 的路線圖
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

      {/* Continue where you left off — one obvious next action, always. */}
      <section aria-labelledby="continue-heading" className="mt-6">
        <h2 id="continue-heading" className="sr-only">
          接下來
        </h2>
        {next ? (
          <Link
            href={next.step.href}
            className="block rounded-2xl p-6 text-white transition-transform hover:-translate-y-0.5"
            style={{ background: "#151a21", borderTop: `5px solid ${next.line.color}` }}
          >
            <p
              className="font-display text-xs font-bold uppercase tracking-widest"
              style={{ color: "#fff", opacity: 0.7 }}
            >
              接下來 · {next.line.name}
            </p>
            <p className="mt-2 text-2xl font-black">
              {next.step.kind === "sim" ? "終點模擬：" : "下一站："}
              {next.step.label}
            </p>
            <p className="mt-2 text-sm text-white/75">
              從上次的地方繼續 <span aria-hidden="true">→</span>
            </p>
          </Link>
        ) : (
          <div className="rounded-2xl bg-ink p-6 text-center text-white">
            <p className="text-2xl font-black">四條線都跑完了！🎉</p>
            <p className="mt-2 text-sm text-white/75">
              你完成了 起點 的全部內容。可以回去複習，或把你的完成證書分享給同學。
            </p>
          </div>
        )}
      </section>

      {/* Multi-line transit map */}
      <section aria-labelledby="map-heading" className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 id="map-heading" className="text-xl font-bold">
            所有路線
          </h2>
          <Link href="/lines" className="text-sm font-medium text-line-2 underline">
            瀏覽目錄
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {statuses.map((s) => {
            const stations = buildLineStations(
              s.line,
              progress,
              runsByLine[s.line.slug] ?? null,
            );
            const label = s.complete
              ? "已完成 ✓"
              : `${s.stationsDone}/${s.stationsTotal} 站${s.simDone ? " · 模擬完成" : ""}`;
            return (
              <LineTrack
                key={s.line.slug}
                line={s.line}
                stations={stations}
                progressLabel={label}
              />
            );
          })}
        </div>
      </section>

      {/* Summary */}
      <section aria-labelledby="summary-heading" className="mt-8">
        <h2 id="summary-heading" className="sr-only">
          完成統計
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-hairline bg-surface p-4 text-center">
            <p className="money text-2xl font-bold">
              {stationsDone}
              <span className="text-sm text-ink-faint">/{stationsTotal}</span>
            </p>
            <p className="mt-1 text-xs text-ink-soft">站完成</p>
          </div>
          <div className="rounded-2xl border border-hairline bg-surface p-4 text-center">
            <p className="money text-2xl font-bold">
              {simsDone}
              <span className="text-sm text-ink-faint">/{LINES.length}</span>
            </p>
            <p className="mt-1 text-xs text-ink-soft">模擬完成</p>
          </div>
          <div className="rounded-2xl border border-hairline bg-surface p-4 text-center">
            <p className="money text-2xl font-bold">{completedLines.length}</p>
            <p className="mt-1 text-xs text-ink-soft">完成證書</p>
          </div>
        </div>
      </section>

      {/* Certificates for completed lines */}
      {completedLines.length > 0 && (
        <section aria-labelledby="cert-heading" className="mt-8">
          <h2 id="cert-heading" className="text-xl font-bold">
            你的完成證書
          </h2>
          <div className="mt-3 space-y-3">
            {completedLines.map((s) => (
              <Link
                key={s.line.slug}
                href={`/line/${s.line.slug}/certificate`}
                className="flex items-center justify-between rounded-2xl border border-hairline bg-surface p-4 hover:border-ink/30"
                style={{ borderLeft: `4px solid ${s.line.color}` }}
              >
                <span>
                  <span className="font-bold">{s.line.name}</span>
                  <span className="ml-2 text-sm text-ink-soft">完成證書</span>
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: s.line.colorInk }}
                >
                  查看 →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
