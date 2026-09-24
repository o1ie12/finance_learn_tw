import type { SimulationRun } from "@/lib/types";
import { readStoredResult } from "@/lib/sims/types";

/**
 * 錢途護照 stamps — sorts a completed simulation's choices into one of a
 * small set of outcome titles. Deliberately non-judgmental: a reflection of
 * a choice, not a grade, same tone as the AI coach's feedback. Pure function
 * over data already captured for the coach — nothing new is stored; a stamp
 * is just this function applied to the student's latest run for that line,
 * so replaying a simulation naturally updates the stamp with zero extra
 * bookkeeping (see getLatestSimulationRunsByLine).
 *
 * Branches on the run's `kind`, not its line. A line that replaces its
 * simulation mints a new kind, so this file cannot silently read the wrong
 * shape: TypeScript narrows `outcome` per case, and a field belonging to a
 * different simulation fails to compile. An unrecognised or missing kind
 * returns null rather than a guessed stamp — which is what previously went
 * wrong here, when a credit-card run was awarded a housing stamp.
 *
 * Deviations from the brief's exact title lists, where the underlying
 * choice data doesn't cleanly map to it:
 *
 * - qixin: the sim captures a savings-RATE slider (0–100%), not an explicit
 *   "budgeted first vs. spent first" order of operations. Read a rate ≥50%
 *   as prioritizing savings (Planner) and <50% as prioritizing spending
 *   (Spender) — the closest honest equivalent, not a structural gap.
 * - touzi: the brief's "Diversifier" assumes a multi-select choice, but the
 *   sim is a single pick among four options (savings/0050/0056/spend) — no
 *   diversification is possible, so "Diversifier" can never be earned as
 *   written. Mapped savings→Saver (exact match) and buy0050→Risk-Taker (the
 *   highest-variance option), plus two titles for the choices the brief's
 *   three-way split doesn't cover.
 * - xinyong: the line's simulation is credit-card billing, not the housing
 *   decision the brief's Roommate / Independent titles assumed. Stamps
 *   reflect the only choice the sim actually makes — whether each statement
 *   was paid in full.
 */

export interface OutcomeTitle {
  id: string;
  title: string; // Chinese display title (matches the site's language)
  enTitle: string; // English archetype name from the brief, shown as a subtitle
}

function record(v: unknown): Record<string, unknown> {
  return (v ?? {}) as Record<string, unknown>;
}

export function outcomeTitleFor(run: SimulationRun): OutcomeTitle | null {
  const result = readStoredResult(run.kind, run.outcome_summary);
  // Unknown or legacy kind: no stamp, rather than a stamp from the wrong sim.
  if (!result) return null;

  switch (result.kind) {
    // 職涯線: reflects the SHAPE of the path chosen, not its worth. A long
    // run-up and an immediate start are different trades, not better and
    // worse, so neither stamp outranks the other.
    case "zhiya_career_choice_v1": {
      const { monthsWithoutIncome } = result.outcome;
      if (monthsWithoutIncome >= 18)
        return { id: "long-game", title: "長線佈局者", enTitle: "The Long Game" };
      if (monthsWithoutIncome <= 3)
        return { id: "quick-starter", title: "即戰力", enTitle: "The Quick Starter" };
      return { id: "steady-builder", title: "穩紮穩打", enTitle: "The Steady Builder" };
    }

    case "qixin_salary_v1": {
      const rate = run.savings_rate ?? 0;
      return rate >= 50
        ? { id: "planner", title: "規劃者", enTitle: "The Planner" }
        : { id: "spender", title: "花費者", enTitle: "The Spender" };
    }

    // 消費線: reflects how the month was shaped, not whether it was "right".
    // Covering your needs and keeping slack is a real skill; spending it all
    // is a common and recoverable mistake, so neither title scolds.
    case "xiaofei_needs_wants_v1": {
      const { verdict, savings } = result.outcome;
      if (verdict === "short")
        return { id: "overspent", title: "月底族", enTitle: "The Month-Ender" };
      if (verdict === "tight")
        return { id: "no-slack", title: "剛剛好族", enTitle: "The Just-Enough" };
      return savings > 0
        ? { id: "buffer-builder", title: "留餘裕族", enTitle: "The Buffer Builder" }
        : { id: "balanced-spender", title: "分配有度", enTitle: "The Balanced" };
    }

    case "cunqian_savings_v1": {
      const choices = record(run.spending_choices);
      const responses = Array.isArray(choices.temptationResponses)
        ? (choices.temptationResponses as unknown[])
        : [];
      return responses.some(Boolean)
        ? { id: "impulse-buyer", title: "衝動購物者", enTitle: "The Impulse Buyer" }
        : { id: "steady-saver", title: "穩健儲蓄者", enTitle: "The Steady Saver" };
    }

    // Retired shape, still present in history. Kept so old runs keep the
    // stamp they were actually awarded instead of losing it.
    case "xinyong_housing_v1": {
      const housing = record(run.spending_choices).housing;
      if (housing === "roommates")
        return { id: "roommate", title: "合租族", enTitle: "The Roommate" };
      if (housing === "alone")
        return { id: "independent", title: "獨居族", enTitle: "The Independent" };
      return { id: "homebody", title: "顧家族", enTitle: "The Homebody" };
    }

    case "xinyong_credit_card_v1": {
      const { totalInterest, rounds } = result.outcome;
      if (totalInterest === 0)
        return { id: "full-payer", title: "全額繳清族", enTitle: "The Full Payer" };
      const stillOwing = rounds[rounds.length - 1]?.carryOut ?? 0;
      return stillOwing > 0
        ? { id: "revolver", title: "循環族", enTitle: "The Revolver" }
        : { id: "catch-up-payer", title: "中途補繳族", enTitle: "The Catch-Up Payer" };
    }

    case "touzi_investing_v1": {
      switch (result.outcome.chosen.id) {
        case "savings":
          return { id: "saver", title: "定存族", enTitle: "The Saver" };
        case "buy0050":
          return { id: "risk-taker", title: "風險承擔者", enTitle: "The Risk-Taker" };
        case "buy0056":
          return { id: "balancer", title: "平衡型投資者", enTitle: "The Balancer" };
        case "spend":
          return { id: "enjoyer", title: "及時行樂者", enTitle: "The Enjoyer" };
        default:
          return null;
      }
    }

    // 詐騙線's terminal is a skill-based judgment game (there genuinely is a
    // right answer per card, unlike the preference-based choices above), so
    // a score-tiered stamp fits — framed as a starting point, not a grade.
    case "zhapian_fraud_v1": {
      const { correct, total } = result.outcome;
      const pct = total > 0 ? correct / total : 0;
      return pct >= 0.75
        ? { id: "fraud-buster", title: "反詐達人", enTitle: "The Fraud Buster" }
        : { id: "fraud-rookie", title: "反詐新手", enTitle: "The Fraud Rookie" };
    }

    // 學貸線: reflects the funding mix chosen, not a grade.
    case "xuedai_student_loan_v1": {
      const pct = result.outcome.loanCoversPct;
      if (pct === 0)
        return { id: "debt-free", title: "無貸一身輕", enTitle: "The Debt-Free" };
      return pct >= 50
        ? { id: "loan-leaner", title: "貸款規劃者", enTitle: "The Loan Planner" }
        : { id: "loan-lighter", title: "輕貸族", enTitle: "The Light Borrower" };
    }

    // 報稅線: which fictional character the student chose to file for.
    case "baoshui_tax_v1": {
      switch (result.outcome.character.id) {
        case "mingming":
          return { id: "tax-mingming", title: "小明的報稅員", enTitle: "Mingming's Filer" };
        case "kai":
          return { id: "tax-kai", title: "阿凱的報稅員", enTitle: "Kai's Filer" };
        default:
          return { id: "tax-amei", title: "阿美的報稅員", enTitle: "Amei's Filer" };
      }
    }

    // 租屋線: also skill-based (there's a real right answer per clause).
    case "zuwu_lease_v1": {
      const { correctFlags, totalBad, falseFlags } = result.outcome;
      return correctFlags >= totalBad && falseFlags.length === 0
        ? { id: "contract-eagle-eye", title: "合約鷹眼", enTitle: "The Eagle Eye" }
        : { id: "contract-learner", title: "租客新手", enTitle: "The Tenant-in-Training" };
    }

    // 保險線: "都不買" is a genuinely valid, positively-framed ending, not a
    // fallback — matching the brief's explicit instruction.
    case "baoxian_sales_pitch_v1": {
      if (result.outcome.allDeclined)
        return { id: "savvy-decliner", title: "精明拒絕者", enTitle: "The Savvy Decliner" };
      if (result.outcome.boughtSavings)
        return { id: "savings-buyer", title: "儲蓄險買家", enTitle: "The Savings Buyer" };
      return { id: "protector", title: "保障規劃者", enTitle: "The Protector" };
    }

    // 創業線: survival is the headline result, then a read on strategy.
    case "chuangye_bubble_tea_v1": {
      const { survived, priceId } = result.outcome;
      if (!survived)
        return { id: "went-bankrupt", title: "撐不到最後", enTitle: "The Cautionary Tale" };
      if (priceId === "low")
        return { id: "volume-player", title: "薄利多銷型", enTitle: "The Volume Player" };
      if (priceId === "high")
        return { id: "premium-player", title: "高價精品型", enTitle: "The Premium Player" };
      return { id: "steady-operator", title: "穩健經營者", enTitle: "The Steady Operator" };
    }
  }
}
