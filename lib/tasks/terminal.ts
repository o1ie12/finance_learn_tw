/**
 * Terminal task kinds: the task sets that replace a line's simulation page
 * (plan.md §2.3). Each is a simulation_runs kind, registered everywhere the
 * existing kinds are (lib/sims/types.ts and the exhaustive switches), so
 * old rows keep their meaning and the contract script can check them.
 *
 * Pure (no server-only imports): the contract script, the stamp, the coach
 * and the certificate all read from here.
 */

import { resolveNumber } from "./compute";
import type { ChoiceStep, OrderStep, RateStep, SortStep, TaskSet, TaskStep } from "./types";

/** Append-only, like SIM_KINDS. Must match content/lines/*.ts. */
export const TERMINAL_TASK_KINDS = [
  "xinyong_protect_card_v1",
  "qixin_need_want_v1",
  "cunqian_savings_rate_v1",
  "touzi_crash_v1",
  "baoxian_fourrisks_v1",
  "zhapian_case1_v1",
  "zhapian_case2_v1",
  "zhapian_case3_v1",
  "zhapian_case4_v1",
  "zhapian_case5_v1",
  "zhapian_case6_v1",
] as const;
export type TerminalTaskKind = (typeof TERMINAL_TASK_KINDS)[number];

export function isTerminalTaskKind(v: unknown): v is TerminalTaskKind {
  return typeof v === "string" && (TERMINAL_TASK_KINDS as readonly string[]).includes(v);
}

/** Display for the passport stamp and certificate: a good result and a learning one. */
export const TERMINAL_DISPLAY: Record<
  TerminalTaskKind,
  { label: string; high: { id: string; title: string; enTitle: string }; low: { id: string; title: string; enTitle: string } }
> = {
  xinyong_protect_card_v1: {
    label: "保護你的卡",
    high: { id: "card-guardian", title: "守卡達人", enTitle: "The Card Guardian" },
    low: { id: "card-learner", title: "練習守卡中", enTitle: "The Card Learner" },
  },
  qixin_need_want_v1: {
    label: "需要還是想要",
    high: { id: "need-sorter", title: "分得清楚", enTitle: "The Need Sorter" },
    low: { id: "want-watcher", title: "還在分辨", enTitle: "The Want Watcher" },
  },
  cunqian_savings_rate_v1: {
    label: "誰比較會存",
    high: { id: "rate-reader", title: "看比例的人", enTitle: "The Rate Reader" },
    low: { id: "rate-learner", title: "學看比例中", enTitle: "The Rate Learner" },
  },
  touzi_crash_v1: {
    label: "真實的暴跌月",
    high: { id: "steady-hand", title: "穩住的手", enTitle: "The Steady Hand" },
    low: { id: "shaken-hand", title: "被嚇到了", enTitle: "The Shaken Hand" },
  },
  baoxian_fourrisks_v1: {
    label: "人身四大風險",
    high: { id: "risk-mapper", title: "風險看得懂", enTitle: "The Risk Mapper" },
    low: { id: "risk-learner", title: "學看風險中", enTitle: "The Risk Learner" },
  },
  zhapian_case1_v1: caseDisplay(1, "半價球鞋"),
  zhapian_case2_v1: caseDisplay(2, "地檢署來電"),
  zhapian_case3_v1: caseDisplay(3, "投資老師群組"),
  zhapian_case4_v1: caseDisplay(4, "客服說誤設分期"),
  zhapian_case5_v1: caseDisplay(5, "日領 3,000 的工作"),
  zhapian_case6_v1: caseDisplay(6, "好朋友借點數"),
};

function caseDisplay(n: number, name: string) {
  return {
    label: `詐騙案件 ${n}：${name}`,
    high: { id: "fraud-detective", title: "詐騙偵探", enTitle: "The Fraud Detective" },
    low: { id: "fraud-trainee", title: "見習偵探", enTitle: "The Trainee Detective" },
  };
}

/** A result is "high" at 80% or more of the scored total. */
export function isHighScore(score: number, total: number): boolean {
  return total === 0 || score / total >= 0.8;
}

/** Full-credit answers for a task set (contract checks and tests). */
export function modelAnswers(task: TaskSet): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const step of task.steps) out[step.id] = modelAnswer(step);
  return out;
}

export function modelAnswer(step: TaskStep): unknown {
  switch (step.type) {
    case "choice": {
      const s = step as ChoiceStep;
      return { option: s.correct ?? s.options[0].id, reason: s.correctReason };
    }
    case "rate":
      return { ratings: Object.fromEntries((step as RateStep).items.map((i) => [i.id, i.answer])) };
    case "find":
      return { selected: step.targets };
    case "number":
      return { value: resolveNumber(step.answer, {}) };
    case "sort":
      return {
        placements: Object.fromEntries(
          (step as SortStep).items.filter((i) => i.box).map((i) => [i.id, i.box as string]),
        ),
      };
    case "order":
      return { order: (step as OrderStep).answer };
  }
}
