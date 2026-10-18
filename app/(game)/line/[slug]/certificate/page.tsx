import { TERMINAL_DISPLAY } from "@/lib/tasks/terminal";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
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
  getLineCompletions,
  getLatestSimulationRunForLine,
  getLatestSimulationRunsByLine,
} from "@/lib/db";
import { formatNT } from "@/components/Money";
import { readStoredResult, UNREADABLE_RESULT_TEXT } from "@/lib/sims/types";
import { lineButtonBackground } from "@/lib/color";
import { FloatCard } from "@/components/game/FloatCard";
import { StationSign } from "@/components/game/StationSign";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { Icon } from "@/components/game/icons";
import { SecondaryButton } from "@/components/linePage/parts";
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
    case "cunqian_savings_v1":
    case "cunqian_savings_v2": {
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
    case "xinyong_credit_card_v1":
    case "xinyong_credit_card_v2": {
      const { totalInterest } = result.outcome;
      if (result.kind === "xinyong_credit_card_v2" && result.outcome.missedCount > 0)
        return {
          label: "信用卡帳單模擬",
          value: `遲繳 ${result.outcome.missedCount} 期 · 違約金 ${formatNT(result.outcome.totalLateFees)} · 利息 ${formatNT(totalInterest)}`,
        };
      return {
        label: "信用卡帳單模擬",
        value:
          totalInterest > 0
            ? `三期共付循環利息 ${formatNT(totalInterest)}`
            : "三期全額繳清，零利息",
      };
    }
    case "touzi_investing_v2":
    case "touzi_investing_v3": {
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
    case "zhapian_fraud_v2":
    case "xuedai_student_loan_v1":
    case "xuedai_student_loan_v2":
    case "baoshui_tax_v1":
    case "zuwu_lease_v1":
    case "baoxian_sales_pitch_v1":
    case "baoxian_sales_pitch_v2":
    case "chuangye_bubble_tea_v1":
    case "chuangye_bubble_tea_v2":
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
    case "capstone_buy_vs_rent_v1":
    case "capstone_buy_vs_rent_v2": {
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
    case "xinyong_protect_card_v1":
    case "qixin_need_want_v1":
    case "cunqian_savings_rate_v1":
    case "touzi_crash_v1":
    case "baoxian_fourrisks_v1":
    case "zhapian_case1_v1":
    case "zhapian_case2_v1":
    case "zhapian_case3_v1":
    case "zhapian_case4_v1":
    case "zhapian_case5_v1":
    case "zhapian_case6_v1": {
      const { score, total } = result.outcome;
      const pct = total === 0 ? 100 : Math.round((score / total) * 100);
      return { label: TERMINAL_DISPLAY[result.kind].label, value: `任務得分 ${pct} 分` };
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
  let completed = new Set<string>();
  try {
    student = await getCurrentStudent();
    if (student) {
      [progress, run, completed] = await Promise.all([
        getProgress(student.id),
        getLatestSimulationRunForLine(student.id, line.slug),
        getLineCompletions(student.id),
      ]);
    }
  } catch {
    /* not configured */
  }

  if (!student) {
    return (
      <div className="lp-page lp-page--center">
        <FloatCard as="div" strong>
          <h1 className="lp-h1">完成證書</h1>
          <p className="lp-muted">先用你的代碼登入，才能看到你的完成證書。</p>
          <PrimaryButton href={homeFor(null)} block>
            前往我的路線圖
          </PrimaryButton>
        </FloatCard>
      </div>
    );
  }

  const mode = effectiveMode(student?.mode ?? null);
  const status = lineStatus(line, moduleDoneSet(progress), run, mode, completed.has(line.slug));
  if (!status.complete || !run) {
    return (
      <div className="lp-page lp-page--center">
        <FloatCard as="div" strong>
          <StationSign line={line} station={line.name} code={line.enName.toUpperCase()} />
          <h1 className="lp-h1">還沒完成這條線</h1>
          <p className="lp-muted">
            走完 {line.name} 的所有站與終點模擬，就會拿到完成證書。
          </p>
          <PrimaryButton href={`/line/${line.slug}`} line={line} block>
            回到 {line.name}
          </PrimaryButton>
        </FloatCard>
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
    const statuses = allLineStatuses(allProgress, runsByLine, mode, completed);
    const next = statuses.find((s) => s.line.slug !== line.slug && !s.complete);
    if (next) {
      nextLineName = next.line.name;
      nextLineHref = `/line/${next.line.slug}`;
    }
  } catch {
    /* not configured — the plain /lines link above still works */
  }

  const lineVars = {
    "--line-color": line.color,
    "--line-ink": line.colorInk,
    "--band-bg": lineButtonBackground(line),
  } as CSSProperties;

  return (
    <div className="lp-page lp-page--narrow" style={lineVars}>
      <h1 className="sr-only">{line.name} 完成證書</h1>
      {/* Transfer moment: you've finished a line; this is the natural point
          to surface the passport and suggest where to go next. */}
      <FloatCard as="section" strong title={`轉乘 · 完成 ${line.name}`} index={0}>
        <h2 className="lp-h1">走完這條線了！</h2>
        <p className="lp-lead">
          {nextLineName
            ? `錢途護照已經蓋上這條線的紀念戳章。要不要轉乘到「${nextLineName}」？`
            : "錢途護照已經蓋上這條線的紀念戳章。你已經走完所有路線了！"}
        </p>
        <div className="lp-actions">
          <PrimaryButton href="/passport">
            查看錢途護照
            <Icon name="arrow" size={18} />
          </PrimaryButton>
          <SecondaryButton href={nextLineHref}>
            {nextLineName ? `轉乘：${nextLineName}` : "回顧所有路線"}
            <Icon name="arrow" size={18} />
          </SecondaryButton>
        </div>
      </FloatCard>

      {/* The certificate, styled for a screenshot */}
      <FloatCard as="article" strong className="lp-cert" index={1}>
        <div className="lp-cert-band">錢途 · 完成證書</div>
        <div className="lp-cert-body">
          <p className="lp-muted">這張證書頒給</p>
          <p className="lp-cert-name">{student.name}</p>
          <p className="lp-muted" style={{ marginTop: "var(--space-5)" }}>
            完成了
          </p>
          <p className="lp-cert-line">{line.name}</p>
          <span className="lp-cert-en" lang="en">
            {line.enName}
          </span>

          <ul className="lp-cert-list">
            {mods.map((m) => {
              const p = moduleScore(progress, m.number);
              return (
                <li key={m.number} className="lp-cert-row">
                  <span className="lp-cert-station">
                    {/* The tick is earned, not decorative. */}
                    <span
                      className="lp-tick"
                      style={{
                        background: p ? "var(--line-color)" : "transparent",
                        border: p ? undefined : "2px solid var(--ink-muted)",
                      }}
                      aria-hidden="true"
                    >
                      {p && (
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none">
                          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {m.station}
                    <span className="sr-only">{p ? "（已完成）" : "（未作答）"}</span>
                  </span>
                  {p && (
                    <span className="lp-cert-score">
                      {p.quiz_score} / {p.quiz_total}
                    </span>
                  )}
                </li>
              );
            })}
            <li className="lp-cert-row lp-cert-row--result">
              <span>{result.label}</span>
              <span className="lp-cert-value">{result.value}</span>
            </li>
          </ul>

          <p className="lp-caption g-num" style={{ marginTop: "var(--space-9)" }}>
            完成日期 {dateStr}
          </p>
        </div>
      </FloatCard>

      <FloatCard as="div" index={2}>
        <p className="lp-muted" style={{ textAlign: "center" }}>
          截圖這張證書，分享給同學吧！
        </p>
        <div className="lp-actions" style={{ justifyContent: "center" }}>
          <SecondaryButton href={homeFor(student?.mode ?? null)}>回到我的路線圖</SecondaryButton>
          <PrimaryButton href="/lines">挑下一條線</PrimaryButton>
        </div>
      </FloatCard>
    </div>
  );
}
