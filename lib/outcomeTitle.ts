import type { SimulationRun } from "@/lib/types";

/**
 * 起點護照 stamps — sorts a completed simulation's choices into one of a
 * small set of outcome titles. Deliberately non-judgmental: a reflection of
 * a choice, not a grade, same tone as the AI coach's feedback. Pure function
 * over data already captured for the coach — nothing new is stored; a stamp
 * is just this function applied to the student's latest run for that line,
 * so replaying a simulation naturally updates the stamp with zero extra
 * bookkeeping (see getLatestSimulationRunsByLine).
 *
 * Deviations from the brief's exact title lists, where the underlying
 * choice data doesn't cleanly map to it (documented in the PR too):
 *
 * - qixin: the sim captures a savings-RATE slider (0–100%), not an explicit
 *   "budgeted first vs. spent first" order of operations. Read a rate ≥50%
 *   as prioritizing savings (Planner) and <50% as prioritizing spending
 *   (Spender) — the closest honest equivalent, not a structural gap.
 * - xinyong: the sim has three housing choices (parents / roommates /
 *   alone), but the brief only names two titles (Roommate / Independent).
 *   "Parents" doesn't fit either — added a third title, Homebody, rather
 *   than mislabeling it as one of the other two.
 * - touzi: the brief's "Diversifier" assumes a multi-select choice, but the
 *   sim is a single pick among four options (savings/0050/0056/spend) — no
 *   diversification is possible, so "Diversifier" can never be earned as
 *   written. Mapped savings→Saver (exact match) and buy0050→Risk-Taker (the
 *   highest-variance option, matching "concentrated in a single
 *   higher-variance option"); added two new titles for the two choices the
 *   brief's three-way split doesn't cover: buy0056 (a real middle-ground
 *   option the sim offers) and spend (opting out of investing entirely).
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
  switch (run.line_slug) {
    case "qixin": {
      const rate = run.savings_rate ?? 0;
      return rate >= 50
        ? { id: "planner", title: "規劃者", enTitle: "The Planner" }
        : { id: "spender", title: "花費者", enTitle: "The Spender" };
    }

    case "cunqian": {
      const choices = record(run.spending_choices);
      const responses = Array.isArray(choices.temptationResponses)
        ? (choices.temptationResponses as unknown[])
        : [];
      const gaveIn = responses.some(Boolean);
      return gaveIn
        ? { id: "impulse-buyer", title: "衝動購物者", enTitle: "The Impulse Buyer" }
        : { id: "steady-saver", title: "穩健儲蓄者", enTitle: "The Steady Saver" };
    }

    case "xinyong": {
      const choices = record(run.spending_choices);
      const housing = choices.housing;
      if (housing === "roommates")
        return { id: "roommate", title: "合租族", enTitle: "The Roommate" };
      if (housing === "alone")
        return { id: "independent", title: "獨居族", enTitle: "The Independent" };
      // "parents" — not covered by the brief's two titles; see file header.
      return { id: "homebody", title: "顧家族", enTitle: "The Homebody" };
    }

    case "touzi": {
      const choices = record(run.spending_choices);
      const choice = choices.choice;
      if (choice === "savings")
        return { id: "saver", title: "定存族", enTitle: "The Saver" };
      if (choice === "buy0050")
        return { id: "risk-taker", title: "風險承擔者", enTitle: "The Risk-Taker" };
      if (choice === "buy0056")
        return { id: "balancer", title: "平衡型投資者", enTitle: "The Balancer" };
      if (choice === "spend")
        return { id: "enjoyer", title: "及時行樂者", enTitle: "The Enjoyer" };
      return null;
    }

    // 詐騙線's terminal is a skill-based judgment game (there genuinely is a
    // right answer per card, unlike the preference-based choices above), so
    // a score-tiered stamp fits — framed as a starting point, not a grade.
    case "zhapian": {
      const o = record(run.outcome_summary);
      const correct = Number(o.correct) || 0;
      const total = Number(o.total) || 20; // FRAUD_CARDS.length, avoiding a cross-import just for a fallback
      const pct = total > 0 ? correct / total : 0;
      return pct >= 0.75
        ? { id: "fraud-buster", title: "反詐達人", enTitle: "The Fraud Buster" }
        : { id: "fraud-rookie", title: "反詐新手", enTitle: "The Fraud Rookie" };
    }

    // 學貸線: reflects the funding mix chosen, not a grade — how much of
    // the 4-year total is covered by a loan vs. paid without one.
    case "xuedai": {
      const choices = record(run.spending_choices);
      const pct = Number(choices.loanCoversPct) || 0;
      if (pct === 0)
        return { id: "debt-free", title: "無貸一身輕", enTitle: "The Debt-Free" };
      return pct >= 50
        ? { id: "loan-leaner", title: "貸款規劃者", enTitle: "The Loan Planner" }
        : { id: "loan-lighter", title: "輕貸族", enTitle: "The Light Borrower" };
    }

    // 報稅線: which fictional character the student chose to file for.
    case "baoshui": {
      const choices = record(run.spending_choices);
      const character = choices.character;
      if (character === "mingming")
        return { id: "tax-mingming", title: "小明的報稅員", enTitle: "Mingming's Filer" };
      if (character === "kai")
        return { id: "tax-kai", title: "阿凱的報稅員", enTitle: "Kai's Filer" };
      return { id: "tax-amei", title: "阿美的報稅員", enTitle: "Amei's Filer" };
    }

    // 租屋線: also skill-based (there's a real right answer per clause).
    case "zuwu": {
      const o = record(run.outcome_summary);
      const correct = Number(o.correctFlags) || 0;
      const totalBad = Number(o.totalBad) || 8;
      const falseFlags = Array.isArray(o.falseFlags) ? o.falseFlags.length : 0;
      return correct >= totalBad && falseFlags === 0
        ? { id: "contract-eagle-eye", title: "合約鷹眼", enTitle: "The Eagle Eye" }
        : { id: "contract-learner", title: "租客新手", enTitle: "The Tenant-in-Training" };
    }

    default:
      return null;
  }
}
