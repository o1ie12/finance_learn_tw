/**
 * 業務員對話 (保險線 terminal) — a sequential three-round pitch/decision
 * game, not a financial-math simulation. "都不買" (decline everything) is a
 * genuinely valid, positively-framed winning ending, not a fallback —
 * matching the brief's explicit instruction.
 */

import { TIME_DEPOSIT_1Y } from "@/lib/rates";

export type ProductId = "savings" | "accident" | "reimbursement";

export interface Product {
  id: ProductId;
  name: string;
  pitch: string; // what the salesperson says
  truth: string; // the balanced reality, shown after the student decides
}

export const PRODUCTS: Product[] = [
  {
    id: "savings",
    name: "儲蓄險",
    pitch: "這張保單存錢又有保障，比放銀行定存划算多了，而且滿期還可以領回一大筆錢喔！",
    truth: "儲蓄險的保障部分通常很低，主要功能是強迫儲蓄，提前解約經常會虧本，流動性也遠不如定存。",
  },
  {
    id: "accident",
    name: "意外險",
    pitch: "意外險保費便宜，萬一發生意外骨折、燒燙傷，都有一筆理賠金，年輕人風險最高，真的該有一張。",
    truth: "意外險保障意外事故導致的傷殘或身故，保費相對便宜，是許多人優先建立的基礎保障之一。",
  },
  {
    id: "reimbursement",
    name: "醫療實支實付",
    pitch: "健保不會全額給付病房差額跟自費藥物，這張實支實付可以補上這個缺口，住院比較不會有壓力。",
    truth: "實支實付依實際自費醫療支出理賠，補上健保給付範圍外的缺口，是常見的醫療保障補強方式。",
  },
];

/**
 * The 儲蓄險 the first salesperson pitches. AN EXAMPLE POLICY: every figure
 * here is illustrative and labelled so on screen — it is not any insurer's
 * product. What is real is the comparison rate (臺灣銀行 一年期定存, from
 * lib/rates.ts) and the method: the IRR is computed from the policy's own
 * cash flows, the same question station 32 tells students to ask.
 *
 * Shape follows the common pattern station 32 describes: six years of
 * premiums, a 解約金 below the premiums paid for the first several years, and
 * a 宣告利率 that is quoted but not guaranteed.
 */
export const SAVINGS_POLICY = {
  annualPremium: 30_000,
  premiumYears: 6,
  /** 宣告利率 as quoted in the pitch. Not guaranteed; not what you earn. */
  declaredRate: 0.0225,
  /** 解約金 at the end of each policy year, years 1–10. Illustrative. */
  surrenderValues: [
    12_000, 40_000, 70_000, 103_000, 138_000, 174_500, 180_000, 185_500, 191_000, 196_500,
  ],
} as const;

/** Annual IRR of paying `premium` at the start of years 1..min(n, premiumYears)
 * and receiving `value` at the end of year n. Bisection; exact to 1e-7. */
export function surrenderIrr(year: number): number {
  const { annualPremium, premiumYears, surrenderValues } = SAVINGS_POLICY;
  const value = surrenderValues[year - 1];
  const npv = (r: number) => {
    let v = value / Math.pow(1 + r, year);
    for (let t = 0; t < Math.min(year, premiumYears); t++)
      v -= annualPremium / Math.pow(1 + r, t);
    return v;
  };
  let lo = -0.99;
  let hi = 1;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (npv(mid) > 0) lo = mid;
    else hi = mid;
  }
  return Math.round(((lo + hi) / 2) * 1e7) / 1e7;
}

export function premiumsPaidBy(year: number): number {
  return SAVINGS_POLICY.annualPremium * Math.min(year, SAVINGS_POLICY.premiumYears);
}

export type SavingsVerdict =
  | "declined"
  | "bought_after_checking"
  | "bought_without_checking";

export type Decision = "buy" | "decline";

export interface SalesPitchInput {
  decisions: Record<ProductId, Decision>;
  /** Whether the student asked to see the 解約金表 before deciding. */
  askedForTable?: boolean;
}

export interface SalesPitchOutcome {
  decisions: Record<ProductId, Decision>;
  bought: ProductId[];
  boughtSavings: boolean;
  allDeclined: boolean;
  askedForTable: boolean;
  savingsVerdict: SavingsVerdict;
  /** The policy's IRR if surrendered at the end of year 6 and year 10. */
  irrAt6: number;
  irrAt10: number;
  /** 臺灣銀行 一年期定存, the comparison. */
  depositRate: number;
  /** What a year-6 surrender returns against what was paid in. */
  surrenderAt6: number;
  paidBy6: number;
}

export function isDecision(v: unknown): v is Decision {
  return v === "buy" || v === "decline";
}

export function computeSalesPitch(input: SalesPitchInput): SalesPitchOutcome {
  const bought = PRODUCTS.filter((p) => input.decisions[p.id] === "buy").map((p) => p.id);
  const boughtSavings = bought.includes("savings");
  const askedForTable = Boolean(input.askedForTable);
  return {
    decisions: input.decisions,
    bought,
    boughtSavings,
    allDeclined: bought.length === 0,
    askedForTable,
    savingsVerdict: !boughtSavings
      ? "declined"
      : askedForTable
        ? "bought_after_checking"
        : "bought_without_checking",
    irrAt6: surrenderIrr(6),
    irrAt10: surrenderIrr(10),
    depositRate: TIME_DEPOSIT_1Y.rate,
    surrenderAt6: SAVINGS_POLICY.surrenderValues[5],
    paidBy6: premiumsPaidBy(6),
  };
}
