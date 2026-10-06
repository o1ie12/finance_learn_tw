import type { InterestId, CreditRecordValue } from "@/lib/studentProfile";

/**
 * Credit Card Billing Simulation (信用線 terminal) — pure, testable math.
 *
 * Three monthly billing rounds. Each round: the student sees a bill and
 * chooses "pay in full" or "pay minimum."
 * Minimum payment = 10% of outstanding balance, rounded to nearest NT$100.
 *
 * How revolving interest actually works — verified 2026-10-06 against
 * 國泰世華 信用卡約定條款 §15 (cathaybk.com.tw, built on the 金管會 standard
 * contract) and 台新銀行「循環信用利息及違約金」 (taishinbank.com.tw, 基準日
 * 115-01-02):
 *  - Paid in full by the due date → no interest at all.
 *  - Otherwise each charge accrues interest DAILY from its 入帳日 (the day the
 *    bank pays the merchant), on the part of it left UNPAID, until settled:
 *    unpaid × days × annual rate ÷ 365. Paying 4,000 of a 7,000 charge
 *    means interest on 3,000 from the 入帳日 — not on 7,000, and not from
 *    the statement or the due date.
 *  - That interest appears on the NEXT statement, so a first bill never
 *    shows interest even when only the minimum is paid.
 *  - Interest and fees are not revolving principal: no interest on interest.
 *  - If what remains after paying is under NT$1,000, no interest that period.
 *  - Rate: 15% here, the 銀行法 §47-1 ceiling banks price up to.
 *
 * Simplifications, stated so they are never mistaken for the rule: every
 * cycle is 30 days, and each month's spending posts on average halfway
 * through the cycle, 15 days before its statement.
 */

export const CREDIT_LIMIT = 20000;
export const ANNUAL_RATE = 0.15; // 銀行法第47-1條 statutory cap
export const DAILY_RATE = ANNUAL_RATE / 365;
export const STATEMENT_CYCLE_DAYS = 30; // simplification
export const POSTED_DAYS_BEFORE_STATEMENT = 15; // simplification: mid-cycle
export const NO_INTEREST_BELOW = 1000; // 約定條款: 繳款後未繳金額不足壹仟元免計

/**
 * What is still owed after a statement is paid, kept apart because each part
 * accrues differently: principal posted before the last statement accrues a
 * full cycle; last month's new spending also accrues from its 入帳日; unpaid
 * interest accrues nothing.
 */
export interface Carry {
  olderPrincipal: number;
  lastMonthPrincipal: number;
  unpaidInterest: number;
}
export const NO_CARRY: Carry = { olderPrincipal: 0, lastMonthPrincipal: 0, unpaidInterest: 0 };

function carryTotal(c: Carry): number {
  return c.olderPrincipal + c.lastMonthPrincipal + c.unpaidInterest;
}

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

/**
 * What the three purchases are called, per interest bucket.
 *
 * Flavour only. The amounts, the interest rate and the minimum-payment rule
 * are identical for every student — a bill that costs more because of what
 * someone said they liked would be a different simulation, and the lesson
 * here is about revolving interest, not about the purchase.
 *
 * Fixed and reviewed, one set per bucket, never generated: the same rule as
 * 職涯線's interest variants. The middle round stays everyday living in every
 * bucket because everyone eats and commutes; it is written in that bucket's
 * world rather than invented as a different kind of purchase.
 */
export const ROUND_REASON_VARIANTS: Record<
  InterestId,
  [string, string, string]
> = {
  art: ["買繪圖軟體一年訂閱", "畫材採買與日常餐飲", "換一台繪圖螢幕"],
  tech: ["買一副新耳機", "日常餐飲與雲端訂閱", "升級電腦零件"],
  business: ["買面試用的正式服裝", "日常餐飲與通勤月票", "報名一個進修課程"],
  service: ["買制服與工作用品", "日常餐飲與通勤", "換一雙工作用的鞋"],
  vocational: ["買一組工具", "日常餐飲與工地交通", "考證照的教材費"],
};

/**
 * The three bills, worded for this student. Falls back to the generic
 * wording when 職涯線 has not been run and no interest is stored.
 */
export function roundsFor(interest: InterestId | null | undefined): BillRound[] {
  if (!interest) return ROUNDS;
  const variant = ROUND_REASON_VARIANTS[interest];
  if (!variant) return ROUNDS;
  return ROUNDS.map((r, i) => ({ ...r, reason: variant[i] }));
}

export type PayChoice = "full" | "minimum";

export interface RoundResult {
  month: number;
  label: string;
  reason: string;
  newCharge: number;
  carryIn: number; // everything carried from the previous statement
  interestAccrued: number; // billed this statement, on unpaid principal since its 入帳日
  totalOwed: number; // carryIn + interestAccrued + newCharge
  minimumPayment: number; // 10% of totalOwed, rounded to nearest 100
  choice: PayChoice;
  amountPaid: number;
  carryOut: number; // balance carried to next month
  /** carryOut broken down, to feed the next round. */
  carryState: Carry;
}

export type CreditRecord = "良好" | "普通";

/**
 * The same result as a stable internal value.
 *
 * `creditRecord` above is what the screen says, and screens get reworded.
 * Later lines — the capstone reads this to set a mortgage rate — must not
 * depend on the wording, so the outcome carries both: the label to display
 * and the value to reason about. 'poor' is in the type with no producer yet,
 * so introducing one is a change inside this file alone.
 */
export type { CreditRecordValue };

export interface CreditCardOutcome {
  rounds: RoundResult[];
  totalPaid: number;
  totalInterest: number;
  totalIfNoInterest: number; // sum of all new charges
  creditRecord: CreditRecord;
  /** The stable counterpart of creditRecord. Read this, not the label. */
  record: CreditRecordValue;
  consequenceLine: string;
}

/**
 * Map a display label to its stable value.
 *
 * Exists only for rows written before `record` was stored. New results carry
 * `record` directly; nothing else should ever go label-first.
 */
export function legacyRecordValue(label: string): CreditRecordValue {
  return label === "良好" ? "good" : "fair";
}

function roundTo100(n: number): number {
  return Math.round(n / 100) * 100;
}

/** Interest billed on the statement that follows a carry. */
export function interestOn(c: Carry): number {
  if (carryTotal(c) < NO_INTEREST_BELOW) return 0;
  return Math.round(
    DAILY_RATE *
      (c.olderPrincipal * STATEMENT_CYCLE_DAYS +
        c.lastMonthPrincipal * (POSTED_DAYS_BEFORE_STATEMENT + STATEMENT_CYCLE_DAYS)),
  );
}

export function computeRound(
  round: BillRound,
  carry: Carry,
  choice: PayChoice,
): RoundResult {
  const carryIn = carryTotal(carry);
  const interestAccrued = interestOn(carry);
  const totalOwed = carryIn + interestAccrued + round.newCharge;
  const minimumPayment = Math.max(roundTo100(totalOwed * 0.1), 100);

  const amountPaid = choice === "full" ? totalOwed : minimumPayment;

  // 沖抵順序 (約定條款): interest first, then older principal, then this
  // month's new spending.
  let left = amountPaid;
  const take = (owed: number) => {
    const paid = Math.min(owed, left);
    left -= paid;
    return owed - paid;
  };
  const unpaidInterest = take(carry.unpaidInterest + interestAccrued);
  const olderPrincipal = take(carry.olderPrincipal + carry.lastMonthPrincipal);
  const lastMonthPrincipal = take(round.newCharge);
  const carryState = { olderPrincipal, lastMonthPrincipal, unpaidInterest };

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
    carryOut: carryTotal(carryState),
    carryState,
  };
}

export function computeCreditCard(
  choices: PayChoice[],
  interest?: InterestId | null,
): CreditCardOutcome {
  const bills = roundsFor(interest);
  const rounds: RoundResult[] = [];
  let carry = NO_CARRY;
  let totalInterest = 0;
  let everCarried = false;

  for (let i = 0; i < bills.length; i++) {
    const r = computeRound(bills[i], carry, choices[i]);
    rounds.push(r);
    carry = r.carryState;
    totalInterest += r.interestAccrued;
    if (r.carryOut > 0) everCarried = true;
  }

  const totalPaid = rounds.reduce((s, r) => s + r.amountPaid, 0);
  const totalIfNoInterest = bills.reduce((s, r) => s + r.newCharge, 0);

  const creditRecord: CreditRecord = everCarried ? "普通" : "良好";
  const record: CreditRecordValue = everCarried ? "fair" : "good";

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
    record,
    consequenceLine,
  };
}
