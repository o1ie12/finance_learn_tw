/**
 * Formula answers for content (types.ts `ComputeRef`). Content never types a
 * figure that a formula owns (04 header: "code wins"); it names the formula
 * and this file works it out from the repo's own constants, so a station and
 * a simulation can never disagree.
 *
 * Pure: safe on the server and the client.
 */

import { netPay as payrollNetPay } from "@/lib/lifeGame/payroll";
import {
  NO_CARRY,
  applyPayment,
  interestOn,
  minimumPaymentFor,
} from "@/lib/sims/creditCard";
import { amortised, LOAN_ANNUAL_RATE, LOAN_REPAYMENT_YEARS } from "@/lib/sims/studentLoan";
import { ANNUAL_RATE as CARD_RATE_CAP } from "@/lib/sims/creditCard";
import { TIME_DEPOSIT_1Y } from "@/lib/rates";
import { MANDATORY_AUTO_INSURANCE } from "@/lib/insurance";
import type { ComputeRef, RepoRate } from "./types";

/** The student's onboarding goal, when they set one. */
export interface Goal {
  amount: number;
  months: number;
}

export interface ComputeContext {
  goal?: Goal | null;
}

function finite(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

/** 實發: gross minus 勞保 and 健保 自付, no 自提 (lib/lifeGame/payroll.ts). */
export function netPay(gross: number): number {
  return payrollNetPay(gross);
}

/** 最低應繳 for a statement of `total` (lib/sims/creditCard.ts). */
export function cardMinimum(total: number): number {
  return minimumPaymentFor(total);
}

/**
 * Interest billed on the NEXT statement when only the minimum is paid on a
 * statement of `total` that is all new spending (no carry, no prior
 * interest). Uses creditCard.ts's own payment order and accrual rule, so it
 * matches the 信用線 simulation: 6,390 → minimum 600 → interest 107.
 */
export function cardInterestIfMinimum(total: number): number {
  const minimum = minimumPaymentFor(total);
  const carry = applyPayment(NO_CARRY, 0, total, minimum, 0);
  return interestOn(carry);
}

/**
 * Monthly 就學貸款 repayment for `principal`, amortised at LOAN_ANNUAL_RATE
 * over LOAN_REPAYMENT_YEARS, by the 學貸線 engine's own amortised().
 */
export function studentLoanMonthly(principal: number): number {
  if (principal <= 0) return 0;
  return amortised(principal, LOAN_ANNUAL_RATE, LOAN_REPAYMENT_YEARS);
}

/** Monthly saving for the goal, rounded UP to NT$100. Null with no goal. */
export function goalMonthly(goal: Goal | null | undefined): number | null {
  if (!goal || !finite(goal.amount) || !finite(goal.months)) return null;
  if (goal.amount <= 0 || goal.months <= 0) return null;
  return Math.ceil(goal.amount / goal.months / 100) * 100;
}

/** One year's interest at the 一年期定存 rate (lib/rates.ts): 50,000 → 850. */
export function depositInterest(principal: number): number {
  return Math.round(principal * TIME_DEPOSIT_1Y.rate);
}

/**
 * Money saved every month for `years`, compounded monthly at `annualRate`
 * (an end-of-month deposit): P × ((1 + r/12)^(12y) − 1) ÷ (r/12).
 */
export function savingsFV(monthly: number, annualRate: number, years: number): number {
  const n = Math.round(years * 12);
  if (annualRate === 0) return Math.round(monthly * n);
  const r = annualRate / 12;
  return Math.round((monthly * ((1 + r) ** n - 1)) / r);
}

/** The rule of 72: about how many years until money (or a debt) doubles. */
export function rule72(annualRate: number): number {
  return 72 / (annualRate * 100);
}

/** The exact doubling time at a yearly rate, compounded yearly. */
export function doublingYears(annualRate: number): number {
  return Math.log(2) / Math.log(1 + annualRate);
}

/** Price plus `years` of yearly costs plus any one-off costs. */
export function ownershipCost(price: number, yearly: number[], years: number, extras: number[] = []): number {
  return price + yearly.reduce((a, b) => a + b, 0) * years + extras.reduce((a, b) => a + b, 0);
}

/** A year's shortfall: the one-off costs minus what twelve months leave over (positive = a gap). */
export function budgetGap(monthlyIncome: number, monthlySpend: number, extras: number[]): number {
  return extras.reduce((a, b) => a + b, 0) - (monthlyIncome - monthlySpend) * 12;
}

/**
 * Paying several debts from one monthly budget. Each month every debt grows
 * by its monthly interest, every unpaid debt gets its minimum, and what is
 * left goes to the first unpaid debt in `order` (avalanche: highest rate
 * first; snowball: smallest balance first). A paid-off debt's minimum stays
 * in the budget. Returns the total interest (whole NT$) and the months
 * until every debt is gone (capped at 600).
 */
export function debtPayoff(
  debts: { balance: number; annualRate: number; min: number }[],
  budget: number,
  order: number[],
): { interest: number; months: number } {
  const bal = debts.map((d) => d.balance);
  let interest = 0;
  let months = 0;
  while (bal.some((b) => b > 0.005) && months < 600) {
    months++;
    bal.forEach((b, i) => {
      if (b <= 0) return;
      const add = (b * debts[i].annualRate) / 12;
      interest += add;
      bal[i] = b + add;
    });
    let left = budget;
    bal.forEach((b, i) => {
      if (b <= 0) return;
      const pay = Math.min(b, debts[i].min, left);
      bal[i] -= pay;
      left -= pay;
    });
    for (const i of order) {
      if (left <= 0) break;
      if (bal[i] <= 0) continue;
      const pay = Math.min(bal[i], left);
      bal[i] -= pay;
      left -= pay;
    }
  }
  return { interest: Math.round(interest), months };
}

/** The repo's verified rate as a fraction (0.017 for 1.7%). */
function repoRateFraction(of: RepoRate): number {
  return of === "timeDeposit1y" ? TIME_DEPOSIT_1Y.rate : of === "cardCap" ? CARD_RATE_CAP : LOAN_ANNUAL_RATE;
}
const rateOf = (r: number | RepoRate) => (typeof r === "number" ? r : repoRateFraction(r));

/**
 * A content number: either literal, or a formula worked out here. Null when
 * the formula cannot be computed (goalMonthly with no goal, or a malformed
 * ref); callers treat a null answer as "not scorable for this student".
 */
export function resolveNumber(ref: number | ComputeRef, ctx: ComputeContext = {}): number | null {
  if (typeof ref === "number") return finite(ref) ? ref : null;
  if (!ref || typeof ref !== "object") return null;
  switch (ref.fn) {
    case "netPay":
      return finite(ref.gross) ? netPay(ref.gross) : null;
    case "netPayMinus":
      return finite(ref.gross) && finite(ref.minus) ? netPay(ref.gross) - ref.minus : null;
    case "cardMinimum":
      return finite(ref.total) ? cardMinimum(ref.total) : null;
    case "cardInterestIfMinimum":
      return finite(ref.total) ? cardInterestIfMinimum(ref.total) : null;
    case "studentLoanMonthly":
      return finite(ref.principal) ? studentLoanMonthly(ref.principal) : null;
    case "goalMonthly":
      return goalMonthly(ctx.goal);
    case "depositInterest":
      return finite(ref.principal) ? depositInterest(ref.principal) : null;
    case "repoRate":
      return Math.round(repoRateFraction(ref.of) * 100 * 1000) / 1000;
    case "savingsFV":
      return savingsFV(ref.monthly, ref.annualRate, ref.years);
    case "rule72":
      return rule72(rateOf(ref.annualRate));
    case "doublingYears":
      return doublingYears(rateOf(ref.annualRate));
    case "sum":
      return ref.of.reduce((a, b) => a + b, 0);
    case "insuranceCap":
      return ref.of === "medical" ? MANDATORY_AUTO_INSURANCE.medicalPerVictim : MANDATORY_AUTO_INSURANCE.deathPerVictim;
    case "ownershipCost":
      return ownershipCost(ref.price, ref.yearly, ref.years, ref.extras);
    case "budgetGap":
      return budgetGap(ref.monthlyIncome, ref.monthlySpend, ref.extras);
    case "debtPayoff":
      return debtPayoff(ref.debts, ref.budget, ref.order)[ref.field];
    case "diff": {
      const a = resolveNumber(ref.a, ctx);
      const b = resolveNumber(ref.b, ctx);
      return a === null || b === null ? null : a - b;
    }
    case "div": {
      const a = resolveNumber(ref.a, ctx);
      if (a === null || !ref.by) return null;
      const v = a / ref.by;
      return ref.roundUpTo ? Math.ceil(v / ref.roundUpTo) * ref.roundUpTo : v;
    }
    default:
      return null;
  }
}

/** Every ComputeRef fn, for content validation. */
export const COMPUTE_FNS: readonly ComputeRef["fn"][] = [
  "netPay",
  "netPayMinus",
  "cardMinimum",
  "cardInterestIfMinimum",
  "studentLoanMonthly",
  "goalMonthly",
  "depositInterest",
  "repoRate",
  "savingsFV",
  "rule72",
  "doublingYears",
  "ownershipCost",
  "budgetGap",
  "debtPayoff",
  "diff",
  "div",
  "sum",
  "insuranceCap",
];
