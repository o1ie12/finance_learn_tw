/**
 * Credit Card Billing Simulation (信用線 terminal) — pure, testable math.
 *
 * Three monthly billing rounds. Each round: the student sees a bill and
 * chooses "pay in full" or "pay minimum." Unpaid balance accrues interest
 * at 15% annual (銀行法 §47-1 cap) simplified to 1.25%/month.
 * Minimum payment = 10% of outstanding balance, rounded to nearest NT$100.
 */

export const CREDIT_LIMIT = 20000;
export const ANNUAL_RATE = 0.15; // 銀行法第47-1條 statutory cap
export const MONTHLY_RATE = ANNUAL_RATE / 12; // ≈ 1.25%

export interface BillRound {
  month: number; // 1, 2, 3
  label: string;
  reason: string;
  newCharge: number;
}

export const ROUNDS: BillRound[] = [
  {
    month: 1,
    label: "第一期帳單",
    reason: "買一台二手筆電應急",
    newCharge: 8000,
  },
  {
    month: 2,
    label: "第二期帳單",
    reason: "日常餐飲與交通",
    newCharge: 3500,
  },
  {
    month: 3,
    label: "第三期帳單",
    reason: "母親節禮物＋朋友聚餐",
    newCharge: 5000,
  },
];

export type PayChoice = "full" | "minimum";

export interface RoundResult {
  month: number;
  label: string;
  reason: string;
  newCharge: number;
  carryIn: number; // balance carried from previous month
  interestAccrued: number; // interest on carryIn
  totalOwed: number; // carryIn + interestAccrued + newCharge
  minimumPayment: number; // 10% of totalOwed, rounded to nearest 100
  choice: PayChoice;
  amountPaid: number;
  carryOut: number; // balance carried to next month
}

export type CreditRecord = "良好" | "普通";

export interface CreditCardOutcome {
  rounds: RoundResult[];
  totalPaid: number;
  totalInterest: number;
  totalIfNoInterest: number; // sum of all new charges
  creditRecord: CreditRecord;
  consequenceLine: string;
}

function roundTo100(n: number): number {
  return Math.round(n / 100) * 100;
}

export function computeRound(
  round: BillRound,
  carryIn: number,
  choice: PayChoice,
): RoundResult {
  const interestAccrued = Math.round(carryIn * MONTHLY_RATE);
  const totalOwed = carryIn + interestAccrued + round.newCharge;
  const minimumPayment = Math.max(roundTo100(totalOwed * 0.1), 100);

  const amountPaid = choice === "full" ? totalOwed : minimumPayment;
  const carryOut = totalOwed - amountPaid;

  return {
    month: round.month,
    label: round.label,
    reason: round.reason,
    newCharge: round.newCharge,
    carryIn,
    interestAccrued,
    totalOwed,
    minimumPayment,
    choice,
    amountPaid,
    carryOut,
  };
}

export function computeCreditCard(choices: PayChoice[]): CreditCardOutcome {
  const rounds: RoundResult[] = [];
  let carry = 0;
  let totalInterest = 0;
  let everCarried = false;

  for (let i = 0; i < ROUNDS.length; i++) {
    const r = computeRound(ROUNDS[i], carry, choices[i]);
    rounds.push(r);
    carry = r.carryOut;
    totalInterest += r.interestAccrued;
    if (r.carryOut > 0) everCarried = true;
  }

  const totalPaid = rounds.reduce((s, r) => s + r.amountPaid, 0);
  const totalIfNoInterest = ROUNDS.reduce((s, r) => s + r.newCharge, 0);

  const creditRecord: CreditRecord = everCarried ? "普通" : "良好";

  const consequenceLine =
    creditRecord === "良好"
      ? "半年後你想申請手機分期，銀行馬上核准。"
      : "銀行放款員看了一下你的循環利息紀錄，額度只給了你原本申請的一半。";

  return {
    rounds,
    totalPaid,
    totalInterest,
    totalIfNoInterest,
    creditRecord,
    consequenceLine,
  };
}
