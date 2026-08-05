import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLine, lineModules } from "@/lib/lines";
import {
  lineStatus,
  moduleDoneSet,
  moduleScore,
} from "@/lib/progressModel";
import { getCurrentStudent } from "@/lib/session";
import { getProgress, getLatestSimulationRunForLine } from "@/lib/db";
import { formatNT } from "@/components/Money";
import type { Student, ModuleProgress, SimulationRun } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const line = getLine(slug);
  return {
    title: line ? `${line.name} 完成證書` : "完成證書",
    robots: { index: false, follow: false },
  };
}

function n(v: unknown, d = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : d;
}

/** One-line key result for the line's simulation, from stored outcome. */
function simResult(run: SimulationRun): { label: string; value: string } {
  const o = run.outcome_summary as Record<string, unknown>;
  switch (run.line_slug) {
    case "qixin":
      return o.deficit
        ? { label: "第一份薪水模擬", value: `每月短缺 ${formatNT(Math.abs(n(o.leftover)))}` }
        : { label: "第一份薪水模擬", value: `一年可存 ${formatNT(n(o.annualSavings))}` };
    case "cunqian": {
      const user = (o.user as Record<string, unknown>) ?? {};
      return {
        label: "存錢目標模擬",
        value: `${user.reachedGoal ? "達標，存到" : "存到"} ${formatNT(n(user.finalAmount))}`,
      };
    }
    case "xinyong": {
      const chosen = (o.chosen as Record<string, unknown>) ?? {};
      return { label: "租屋決策模擬", value: `每月結餘 ${formatNT(n(chosen.leftover))}` };
    }
    case "touzi": {
      const chosen = (o.chosen as Record<string, unknown>) ?? {};
      if (chosen.id === "spend") return { label: "第一次投資模擬", value: "選擇把錢花掉" };
      return {
        label: "第一次投資模擬",
        value: `一年可能落在 ${formatNT(n(chosen.low))}–${formatNT(n(chosen.high))}`,
      };
    }
    default:
      return { label: "模擬", value: "已完成" };
  }
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const line = getLine(slug);
  if (!line) notFound();

  let student: Student | null = null;
  let progress: ModuleProgress[] = [];
  let run: SimulationRun | null = null;
  try {
    student = await getCurrentStudent();
    if (student) {
      [progress, run] = await Promise.all([
        getProgress(student.id),
        getLatestSimulationRunForLine(student.id, line.slug),
      ]);
    }
  } catch {
    /* not configured */
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-black">完成證書</h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          先用你的代碼登入，才能看到你的完成證書。
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-ink px-6 py-3 text-base font-semibold text-white"
        >
          前往我的路線圖
        </Link>
      </div>
    );
  }

  const status = lineStatus(line, moduleDoneSet(progress), run);
  if (!status.complete || !run) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-black">還沒完成這條線</h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          走完 {line.name} 的所有站與終點模擬，就會拿到完成證書。
        </p>
        <Link
          href={`/line/${line.slug}`}
          className="mt-6 inline-flex rounded-xl bg-ink px-6 py-3 text-base font-semibold text-white"
          style={{ borderTop: `3px solid ${line.color}` }}
        >
          回到 {line.name}
        </Link>
      </div>
    );
  }

  const mods = lineModules(line);
  const result = simResult(run);
  const dateStr = new Date(run.created_at).toLocaleDateString("zh-TW");

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      {/* The certificate — styled for a screenshot */}
      <div
        className="overflow-hidden rounded-3xl border-2 bg-surface"
        style={{ borderColor: line.color }}
      >
        <div className="px-6 py-4 text-white" style={{ background: line.colorInk }}>
          <p className="font-display text-sm font-bold uppercase tracking-widest">
            起點 · 完成證書
          </p>
        </div>
        <div className="p-6 text-center sm:p-8">
          <p className="text-sm text-ink-soft">這張證書頒給</p>
          <p className="mt-1 text-3xl font-black">{student.name}</p>
          <p className="mt-4 text-sm text-ink-soft">完成了</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: line.colorInk }}>
            {line.name}
          </p>
          <p className="font-display text-xs uppercase tracking-wider text-ink-faint">
            {line.enName}
          </p>

          <div className="mt-6 space-y-2 text-left">
            {mods.map((m) => {
              const p = moduleScore(progress, m.number);
              return (
                <div
                  key={m.number}
                  className="flex items-center justify-between rounded-xl bg-bg px-4 py-2.5"
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-white"
                      style={{ background: line.color }}
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none">
                        <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {m.station}
                  </span>
                  {p && (
                    <span className="money text-sm text-ink-soft">
                      {p.quiz_score} / {p.quiz_total}
                    </span>
                  )}
                </div>
              );
            })}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-2.5"
              style={{ background: "color-mix(in srgb," + line.color + " 12%,white)" }}
            >
              <span className="text-sm font-semibold">{result.label}</span>
              <span className="money text-sm font-semibold" style={{ color: line.colorInk }}>
                {result.value}
              </span>
            </div>
          </div>

          <p className="mt-6 text-xs text-ink-faint">
            完成日期 {dateStr} · {student.school}
          </p>
        </div>
      </div>

      <p className="mt-5 text-center text-sm text-ink-soft">
        截圖這張證書，分享給同學吧！
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-5 py-2.5 text-base font-medium hover:border-ink"
        >
          回到我的路線圖
        </Link>
        <Link
          href="/lines"
          className="inline-flex items-center justify-center rounded-xl bg-ink px-5 py-2.5 text-base font-semibold text-white hover:-translate-y-0.5"
        >
          挑下一條線
        </Link>
      </div>
    </div>
  );
}
