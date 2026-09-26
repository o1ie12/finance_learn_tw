import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLine } from "@/lib/lines";
import {
  lineStatus,
  moduleDoneSet,
  moduleScore,
  allLineStatuses,
} from "@/lib/progressModel";
import { effectiveMode, requiredStations, homeFor } from "@/lib/modeModel";
import { getCurrentStudent } from "@/lib/session";
import {
  getProgress,
  getLatestSimulationRunForLine,
  getLatestSimulationRunsByLine,
} from "@/lib/db";
import { formatNT } from "@/components/Money";
import { readStoredResult, UNREADABLE_RESULT_TEXT } from "@/lib/sims/types";
import PlatformPanel from "@/components/mrt/PlatformPanel";
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

/** One-line key result for the line's simulation, from the stored outcome.
 *
 * Branches on the run's `kind`, so the shape is known before any field is
 * read. A run whose kind this build does not recognise — including rows
 * written before the contract existed — returns a neutral line rather than a
 * figure. This certificate previously printed "租屋決策模擬 — 每月結餘 NT$0"
 * for every credit-card run, on a page that invites students to screenshot
 * and share it. */
function simResult(run: SimulationRun): { label: string; value: string } {
  const result = readStoredResult(run.kind, run.outcome_summary);
  if (!result) return { label: "模擬", value: UNREADABLE_RESULT_TEXT };

  switch (result.kind) {
    case "zhiya_career_choice_v1": {
      const { pathName, startingIncome } = result.outcome;
      return {
        label: "職涯抉擇模擬",
        value: `${pathName} · 起薪約 ${formatNT(startingIncome)}`,
      };
    }
    case "qixin_salary_v1": {
      const { deficit, leftover, annualSavings } = result.outcome;
      return {
        label: "第一份薪水模擬",
        value: deficit
          ? `每月短缺 ${formatNT(Math.abs(leftover))}`
          : `一年可存 ${formatNT(annualSavings)}`,
      };
    }
    case "xiaofei_needs_wants_v1": {
      const { savings, absorbedShortfall } = result.outcome;
      return {
        label: "消費模擬",
        value: absorbedShortfall
          ? `留下 ${formatNT(savings)}，撐得過意外支出`
          : "月底沒有餘裕應付意外支出",
      };
    }
    case "cunqian_savings_v1": {
      const { reachedGoal, finalAmount } = result.outcome.user;
      return {
        label: "存錢目標模擬",
        value: `${reachedGoal ? "達標，存到" : "存到"} ${formatNT(finalAmount)}`,
      };
    }
    case "xinyong_housing_v1":
      return {
        label: "租屋決策模擬",
        value: `每月結餘 ${formatNT(result.outcome.chosen.leftover)}`,
      };
    case "xinyong_credit_card_v1": {
      const { totalInterest } = result.outcome;
      return {
        label: "信用卡帳單模擬",
        value:
          totalInterest > 0
            ? `三期共付循環利息 ${formatNT(totalInterest)}`
            : "三期全額繳清，零利息",
      };
    }
    case "touzi_investing_v2": {
      const { id, low, high } = result.outcome.chosen;
      // Timing is only a decision for a security; 定存 has none to print.
      const how =
        result.outcome.historical === null
          ? ""
          : `${result.outcome.timing === "dca" ? "定期定額" : "一次投入"} · `;
      if (id === "spend") return { label: "第一次投資模擬", value: "選擇把錢花掉" };
      return {
        label: "第一次投資模擬",
        value: `${how}一年可能落在 ${formatNT(low)}–${formatNT(high)}${
          result.outcome.startFromSavingsLine ? "" : "（起始金額為預設值）"
        }`,
      };
    }
    case "touzi_investing_v1": {
      const { id, low, high } = result.outcome.chosen;
      if (id === "spend") return { label: "第一次投資模擬", value: "選擇把錢花掉" };
      return {
        label: "第一次投資模擬",
        value: `一年可能落在 ${formatNT(low)}–${formatNT(high)}${
          result.outcome.startFromSavingsLine === true ? "" : "（起始金額為預設值）"
        }`,
      };
    }
    // The applied lines have no headline figure on the certificate today.
    case "zhapian_fraud_v1":
    case "xuedai_student_loan_v1":
    case "baoshui_tax_v1":
    case "zuwu_lease_v1":
    case "baoxian_sales_pitch_v1":
    case "chuangye_bubble_tea_v1":
      return { label: "模擬", value: "已完成" };
    case "touzi_twse_reflection_v1": {
      const { hasInvested, plannedAmount } = result.outcome;
      return {
        label: "投資工具實作",
        value: hasInvested ? `規劃投入 ${formatNT(plannedAmount)}` : "先觀察，暫不投入",
      };
    }
    case "baoshui_tax_filing_v1": {
      const { stepsCorrect, isRefund, balance } = result.outcome;
      return {
        label: "報稅實作模擬",
        value: `三關答對 ${stepsCorrect} 關 · ${isRefund ? "退稅" : "補稅"} ${formatNT(Math.abs(balance))}`,
      };
    }
    case "capstone_buy_vs_rent_v1": {
      const { choice, verdict } = result.outcome;
      const what = choice === "buy" ? "買房" : "租屋";
      const how =
        verdict === "comfortable"
          ? "負擔得起"
          : verdict === "stretched"
            ? "勉強撐得住"
            : "目前還不可行";
      const { incomeKnown, savingsKnown, creditKnown } = result.outcome;
      const partly =
        incomeKnown !== true || savingsKnown !== true || creditKnown !== true
          ? "（部分數字為預設值）"
          : "";
      return { label: "買房 vs 租屋抉擇模擬", value: `${what} · ${how}${partly}` };
    }
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
          href={homeFor(null)}
          className="mt-6 inline-flex rounded-xl bg-ink px-6 py-3 text-base font-semibold text-white"
        >
          前往我的路線圖
        </Link>
      </div>
    );
  }

  const mode = effectiveMode(student?.mode ?? null);
  const status = lineStatus(line, moduleDoneSet(progress), run, mode);
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

  // The stations this certificate can honestly vouch for. Completion is
  // mode-aware — a sim_first student completes a line on its core stations —
  // so listing every station put ticks next to ones they never opened, on a
  // page that tells them to screenshot and share it.
  const mods = requiredStations(line, mode);
  const result = simResult(run);
  const dateStr = new Date(run.created_at).toLocaleDateString("zh-TW");

  // Transfer suggestion: the first other line the student hasn't finished yet.
  let nextLineName: string | null = null;
  let nextLineHref = "/lines";
  try {
    const [allProgress, runsByLine] = await Promise.all([
      getProgress(student.id),
      getLatestSimulationRunsByLine(student.id),
    ]);
    const statuses = allLineStatuses(allProgress, runsByLine, mode);
    const next = statuses.find((s) => s.line.slug !== line.slug && !s.complete);
    if (next) {
      nextLineName = next.line.name;
      nextLineHref = `/line/${next.line.slug}`;
    }
  } catch {
    /* not configured — the plain /lines link above still works */
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Transfer moment — you've finished a line; this is the natural point
          to surface the passport and suggest where to go next. */}
      <PlatformPanel color={line.color} eyebrow={`轉乘 · 完成 ${line.name}`} className="mb-6">
        <h2 className="text-2xl font-black">走完這條線了！</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-white/85">
          {nextLineName
            ? `錢途護照已經蓋上這條線的紀念戳章。要不要轉乘到「${nextLineName}」？`
            : "錢途護照已經蓋上這條線的紀念戳章。你已經走完所有路線了！"}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/passport"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-ink hover:-translate-y-0.5"
          >
            查看錢途護照 →
          </Link>
          <Link
            href={nextLineHref}
            className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            {nextLineName ? `轉乘：${nextLineName}` : "回顧所有路線"} →
          </Link>
        </div>
      </PlatformPanel>

      {/* The certificate — styled for a screenshot */}
      <div
        className="overflow-hidden rounded-3xl border-2 bg-surface"
        style={{ borderColor: line.color }}
      >
        <div className="px-6 py-4 text-white" style={{ background: line.colorInk }}>
          <p className="font-display text-sm font-bold uppercase tracking-widest">
            錢途 · 完成證書
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
                    {/* The tick is earned, not decorative. */}
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-white"
                      style={{
                        background: p ? line.color : "transparent",
                        border: p ? undefined : "1.5px solid var(--color-hairline)",
                      }}
                      aria-hidden="true"
                    >
                      {p && (
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none">
                          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
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

          <p className="mt-6 text-xs text-ink-faint">完成日期 {dateStr}</p>
        </div>
      </div>

      <p className="mt-5 text-center text-sm text-ink-soft">
        截圖這張證書，分享給同學吧！
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link
          href={homeFor(student?.mode ?? null)}
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
