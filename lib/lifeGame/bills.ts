/**
 * The monthly bill sheet (02 §3.3).
 *
 * Items are either `spend` (money consumed: rent, food, premiums) or
 * `paydown` (money moving against something already owed: the card's
 * minimum, installments, a called guarantee, last month's 欠款). The split
 * matters for the books: spending lowers net worth, a paydown does not.
 */

import { BILLS, GUARANTEE, INSURANCE, TRANSPORT } from "./constants";
import type { LifeState } from "./types";

export type BillKind = "spend" | "paydown";

export interface BillItem {
  id: string;
  label: string;
  amount: number;
  kind: BillKind;
  /** Counts toward monthly essentials (the emergency-fund denominator). */
  essential: boolean;
  /** Paid on this day of the month (示意, for the BillSheet document). */
  day: number;
  illustrative: boolean;
}

export const STUDENT_LOAN_GRACE_TURNS = 24; // GRACE_YEARS × 12, see studentLoan.ts

export function installmentPayment(i: { monthly: number; turnsLeft: number; lastMonthly: number }): number {
  if (i.turnsLeft <= 0) return 0;
  return i.turnsLeft === 1 ? i.lastMonthly : i.monthly;
}

export function installmentRemaining(i: { monthly: number; turnsLeft: number; lastMonthly: number }): number {
  if (i.turnsLeft <= 0) return 0;
  return i.monthly * (i.turnsLeft - 1) + i.lastMonthly;
}

export interface BillContext {
  /** Monthly student-loan repayment from 學貸線, when its move is unlocked. */
  studentLoanMonthly: number | null;
}

export function billSheet(s: LifeState, ctx: BillContext): BillItem[] {
  const items: BillItem[] = [];
  const add = (item: Omit<BillItem, "illustrative"> & { illustrative?: boolean }) => {
    if (item.amount > 0) items.push({ illustrative: true, ...item });
  };

  if (s.housing === "family") {
    add({ id: "family", label: "孝親費", amount: BILLS.familyContribution, kind: "spend", essential: true, day: 1 });
  } else {
    const rent = (s.housing === "shared" ? BILLS.rentShared : BILLS.rentStudio) + s.rentExtra;
    add({ id: "rent", label: s.housing === "shared" ? "房租（雅房）" : "房租（套房）", amount: rent, kind: "spend", essential: true, day: 1 });
    add({ id: "utilities", label: "水電瓦斯", amount: BILLS.utilitiesRenting, kind: "spend", essential: true, day: 15 });
  }
  add({ id: "food", label: "餐費", amount: s.bills.food, kind: "spend", essential: true, day: 1 });
  add({
    id: "transport",
    label: s.bills.transport === "tpass" ? "交通（TPASS 月票）" : "交通（騎腳踏車）",
    amount: TRANSPORT[s.bills.transport],
    kind: "spend",
    essential: true,
    day: 1,
    illustrative: s.bills.transport !== "tpass",
  });
  add({ id: "phone", label: "手機", amount: BILLS.phone, kind: "spend", essential: true, day: 20 });
  add({ id: "daily", label: "日用品", amount: s.bills.daily, kind: "spend", essential: true, day: 10 });

  const premium =
    (s.insurance.medical ? INSURANCE.medical.premium : 0) +
    (s.insurance.accident ? INSURANCE.accident.premium : 0) +
    (s.insurance.life ? INSURANCE.life.premium : 0);
  add({ id: "premium", label: "保費", amount: premium, kind: "spend", essential: false, day: 5 });

  if (ctx.studentLoanMonthly && s.unlocked.includes("studentLoan") && s.turn >= STUDENT_LOAN_GRACE_TURNS) {
    add({
      id: "studentLoan",
      label: "學貸還款",
      amount: ctx.studentLoanMonthly,
      kind: "spend",
      essential: true,
      day: 25,
      illustrative: false,
    });
  }

  const skillCost = s.skills.reduce((sum, k) => sum + (k.monthsLeft > 0 ? k.monthly : 0), 0);
  add({ id: "skill", label: "課程費", amount: skillCost, kind: "spend", essential: false, day: 10 });

  const card = s.debts.card;
  if (card.statementTotal > 0) {
    add({
      id: "card",
      label: "卡費（最低應繳）",
      amount: Math.min(card.statementMinimum, card.statementTotal),
      kind: "paydown",
      essential: false,
      day: 25,
      illustrative: false,
    });
  }
  s.debts.installments.forEach((i, idx) => {
    add({ id: `installment:${idx}`, label: `分期：${i.label}`, amount: installmentPayment(i), kind: "paydown", essential: false, day: 25 });
  });
  if (s.debts.guaranteeOwed > 0) {
    add({
      id: "guarantee",
      label: "保證人代償",
      amount: Math.min(GUARANTEE.monthlyPayment, s.debts.guaranteeOwed),
      kind: "paydown",
      essential: false,
      day: 25,
    });
  }
  if (s.debts.overdueBills > 0) {
    add({ id: "overdue", label: "上個月的欠款", amount: s.debts.overdueBills, kind: "paydown", essential: false, day: 1, illustrative: false });
  }
  return items;
}

/** Order bills are paid in when cash is short: debts first, so late fees are avoided. */
export function paymentOrder(items: BillItem[]): BillItem[] {
  const rank = (b: BillItem) =>
    b.id === "card" ? 0 : b.kind === "paydown" ? 1 : b.essential ? 2 : 3;
  return [...items].sort((a, b) => rank(a) - rank(b));
}

/** Monthly essentials: living costs only (02 §5), the emergency-fund denominator. */
export function monthlyEssentials(s: LifeState, ctx: BillContext): number {
  return billSheet(s, ctx)
    .filter((b) => b.essential)
    .reduce((sum, b) => sum + b.amount, 0);
}

export function billsTotal(items: BillItem[]): number {
  return items.reduce((sum, b) => sum + b.amount, 0);
}
