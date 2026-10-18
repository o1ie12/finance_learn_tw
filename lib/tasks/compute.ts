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
import { TIME_DEPOSIT_1Y } from "@/lib/rates";
import type { ComputeRef } from "./types";

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
];
