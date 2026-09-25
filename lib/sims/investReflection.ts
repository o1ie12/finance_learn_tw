import type { InterestId } from "@/lib/studentProfile";

/**
 * 投資線 in linkout mode — the student uses TWSE's own tool, then reports back.
 *
 * There is no market maths here, and that is the point of the mode: the
 * numbers come from a real exchange-run tool rather than from illustrative
 * bands this repo made up. What this module models is the part the linkout
 * cannot — what the student went in with, what they came back having decided,
 * and whether those two things agree.
 *
 * Inactive until lib/investLinkout.ts is switched on. Fully computable and
 * contract-checked in the meantime, so activation is a flag rather than a
 * build.
 */

/** What the student says they mainly looked at. */
export const FOCUS_OPTIONS = [
  { id: "etf", label: "ETF（像 0050、0056）" },
  { id: "single", label: "個別公司的股票" },
  { id: "browsing", label: "只是到處看看，還沒鎖定" },
] as const;
export type FocusId = (typeof FOCUS_OPTIONS)[number]["id"];

/** The one thing that surprised them. Fixed, reviewed options — never free text. */
export const SURPRISE_OPTIONS = [
  { id: "volatility", label: "價格上下的幅度比我想的大" },
  { id: "fees", label: "手續費和稅比我想的多" },
  { id: "slow", label: "短期內幾乎看不出變化" },
  { id: "amount", label: "我能投入的金額比我以為的少" },
  { id: "nothing", label: "沒有特別意外的地方" },
] as const;
export type SurpriseId = (typeof SURPRISE_OPTIONS)[number]["id"];

/** Whether they intend to act, once they can. */
export const INTENT_OPTIONS = [
  { id: "yes", label: "會，等我有錢就開始" },
  { id: "later", label: "再想想，我想先多了解一點" },
  { id: "no", label: "不會，這不適合現在的我" },
] as const;
export type IntentId = (typeof INTENT_OPTIONS)[number]["id"];

export function isFocusId(v: unknown): v is FocusId {
  return FOCUS_OPTIONS.some((o) => o.id === v);
}
export function isSurpriseId(v: unknown): v is SurpriseId {
  return SURPRISE_OPTIONS.some((o) => o.id === v);
}
export function isIntentId(v: unknown): v is IntentId {
  return INTENT_OPTIONS.some((o) => o.id === v);
}

export interface InvestReflectionInput {
  /** Resolved server-side from the profile — what they actually have. */
  suggestedAmount: number;
  /** True when that figure came from 存錢線 rather than the default. */
  fromSavingsLine: boolean;
  /** True when 消費 recorded a month that ended short. */
  inShortfall: boolean;
  /** Their own interest bucket, for the closing note. May be absent. */
  interest?: InterestId | null;
  /** What they decided to put in, in the tool. Not capped by the suggestion. */
  plannedAmount: number;
  focus: FocusId;
  surprise: SurpriseId;
  intent: IntentId;
}

export interface InvestReflectionOutcome {
  suggestedAmount: number;
  fromSavingsLine: boolean;
  inShortfall: boolean;
  plannedAmount: number;
  /** plannedAmount − suggestedAmount. Positive means beyond their position. */
  overCommitment: number;
  /** True when they planned to put in more than they actually have. */
  beyondPosition: boolean;
  /** Share of what they have that they committed, 0–1+. */
  shareOfAvailable: number;
  focus: FocusId;
  surprise: SurpriseId;
  intent: IntentId;
  /** Money placed into something that can move. 定存-like intent is not this. */
  hasInvested: boolean;
  investedAmount: number;
}

export function computeInvestReflection(
  input: InvestReflectionInput,
): InvestReflectionOutcome {
  const suggestedAmount = Math.max(0, Math.round(input.suggestedAmount));
  const plannedAmount = Math.max(0, Math.round(input.plannedAmount));
  const overCommitment = plannedAmount - suggestedAmount;

  // "Still browsing" is not a position, and a plan of zero is not one either.
  // Recording either as invested would have the capstone raise an
  // opportunity-cost question about money that was never committed — the same
  // distinction the custom simulator draws between 買 0050 and 放定存.
  const hasInvested = plannedAmount > 0 && input.focus !== "browsing";

  return {
    suggestedAmount,
    fromSavingsLine: input.fromSavingsLine,
    inShortfall: input.inShortfall,
    plannedAmount,
    overCommitment,
    beyondPosition: overCommitment > 0,
    shareOfAvailable:
      suggestedAmount > 0 ? plannedAmount / suggestedAmount : plannedAmount > 0 ? 1 : 0,
    focus: input.focus,
    surprise: input.surprise,
    intent: input.intent,
    hasInvested,
    investedAmount: hasInvested ? plannedAmount : 0,
  };
}
