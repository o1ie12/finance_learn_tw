import type { Metadata } from "next";
import Link from "next/link";
import DashboardCodeForm from "@/components/DashboardCodeForm";
import SignOutButton from "@/components/SignOutButton";
import LinkGoogleAccount from "@/components/LinkGoogleAccount";
import LineNetworkPanel from "@/components/LineNetworkPanel";
import { LINES } from "@/lib/lines";
import { getModule } from "@/lib/modules";
import { buildLineStations } from "@/lib/buildStations";
import {
  allLineStatuses,
  nextActionAcrossLines,
} from "@/lib/progressModel";
import { getCurrentStudent } from "@/lib/session";
import { reviewEligibleLines } from "@/lib/reviewModel";
import { loadSimPortfolioView, toClientView } from "@/lib/simPortfolioModel";
import InvestReplayWidget from "@/components/InvestReplayWidget";
import { buildStamps } from "@/components/Passport";
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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string; linked_error?: string }>;
}) {
  const { linked, linked_error } = await searchParams;
  const googleFeedback =
    linked === "1" ? "linked" : linked_error === "already_used" ? "already_used" : undefined;

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

  const statuses = allLineStatuses(progress, runsByLine);
  const next = nextActionAcrossLines(statuses);
  const dueForReview = reviewEligibleLines(LINES, runsByLine);
  const stamps = buildStamps(runsByLine);

  // Banner: station name + its subtitle for the single next action.
  let bannerLabel = "";
  let bannerSubtitle = "";
  if (next) {
    if (next.step.kind === "station" && next.step.moduleNumber) {
      bannerLabel = next.step.label;
      bannerSubtitle = getModule(next.step.moduleNumber)?.title ?? "";
    } else {
      bannerLabel = next.line.sim.station;
      bannerSubtitle = next.line.sim.title;
    }
  }

  const stationsDone = progress.filter((p) => p.completed_at).length;
  const stationsTotal = LINES.reduce((n, l) => n + l.stationModules.length, 0);
  const simsDone = statuses.filter((s) => s.simDone).length;
  const completedLines = statuses.filter((s) => s.complete);

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-10 sm:px-6 sm:py-14">
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
        <div className="flex flex-wrap items-center justify-end gap-2">
          {student.access_code && (
            <span className="money rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm tracking-[0.15em]">
              {student.access_code}
            </span>
          )}
          <SignOutButton />
        </div>
      </header>

      <div className="mt-3">
        <LinkGoogleAccount googleEmail={student.google_email} feedback={googleFeedback} />
      </div>

      {/* Hero: 目前位置 + 下一站 + CTA — unchanged. */}
      <section aria-labelledby="continue-heading" className="mt-6 rounded-2xl bg-ink px-8 py-7">
        <h2 id="continue-heading" className="sr-only">
          接下來
        </h2>
        {next ? (
          <Link
            href={next.step.href}
            className="flex flex-wrap items-center justify-between gap-5 transition-opacity hover:opacity-90"
          >
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: next.line.color }}
                  aria-hidden="true"
                />
                <span
                  className="money text-[13px] font-bold"
                  style={{ color: next.line.color }}
                >
                  目前位置 · {next.line.name}
                </span>
              </span>
              <p className="font-display text-[26px] font-black leading-tight text-white">
                下一站：{bannerLabel}
              </p>
              <p className="mt-1 text-sm text-[#A9AEB4]">{bannerSubtitle}</p>
            </div>
            <span
              className="shrink-0 whitespace-nowrap rounded-[10px] px-6 py-3.5 text-[15px] font-bold text-white"
              style={{ background: next.line.color }}
            >
              繼續前往 <span aria-hidden="true">→</span>
            </span>
          </Link>
        ) : (
          <div className="text-center">
            <p className="text-2xl font-black text-white">所有線都跑完了！🎉</p>
            <p className="mt-2 text-sm text-white/75">
              你完成了 起點 的全部內容。可以回去複習，或把你的完成證書分享給同學。
            </p>
          </div>
        )}
      </section>

      {/* 路網地圖 + 路線進度, combined: chips/dots/progress rows all read
          and write the same selected line, so there's one place to both
          glance at every line's progress and look at any one line's
          stations — no separate page for that anymore. */}
      <div className="mt-6">
        <LineNetworkPanel
          initialLineId={next?.line.slug ?? LINES[0].slug}
          lines={statuses.map((s) => {
            const stations = buildLineStations(
              s.line,
              progress,
              runsByLine[s.line.slug] ?? null,
            );
            // Only a line the student has *started* shows a "current" node
            // on the map; unstarted lines stay fully dimmed.
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

      {/* 護照 preview — surfaced in the hero area (not buried past the map)
          since it's the one metric in the stat-card row with an actual
          destination page worth visiting. */}
      <Link
        href="/passport"
        className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-hairline bg-surface px-6 py-4 transition-colors hover:border-ink/30"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" aria-hidden="true">
            {stamps.map((s) => (
              <span
                key={s.lineSlug}
                className="h-3 w-3 shrink-0 rounded-full"
                style={
                  s.earned
                    ? { background: s.color }
                    : { background: "transparent", border: `1.5px solid var(--color-hairline)` }
                }
              />
            ))}
          </div>
          <span className="text-sm text-ink-soft">
            {stamps.filter((s) => s.earned).length}/{stamps.length} 個戳章
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="money text-lg font-bold">{student.points_total} 點</span>
          <span className="text-sm font-semibold text-line-2">查看護照 →</span>
        </div>
      </Link>

      {/* 複習站 — badge/notification only, no push infra. Only shows once a
          line has sat completed for 7+ real days. */}
      {dueForReview.length > 0 && (
        <section aria-labelledby="review-heading" className="mt-6">
          <h2
            id="review-heading"
            className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-faint"
          >
            該複習了
          </h2>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {dueForReview.map(({ line, daysAgo }) => (
              <Link
                key={line.slug}
                href={`/line/${line.slug}/review`}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2 text-sm font-semibold transition-colors hover:border-ink"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: line.color }}
                  aria-hidden="true"
                />
                {line.name}
                <span className="text-ink-faint">· 完成 {daysAgo} 天了</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 歷史回放投資模擬 widget — unlocked once 投資線's terminal sim is done,
          visible platform-wide from that point on (spec 2b). */}
      {runsByLine.touzi && (
        <section aria-labelledby="invest-replay-heading" className="mt-6">
          <h2
            id="invest-replay-heading"
            className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-faint"
          >
            歷史回放投資模擬
          </h2>
          <div className="mt-3">
            <InvestReplayWidget view={investReplayView} />
          </div>
        </section>
      )}

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
