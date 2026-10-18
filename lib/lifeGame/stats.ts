/**
 * Stats (02 §5): emergency fund, stress, net worth, freedom %, and the class
 * leaderboard's 財務健康分 (02 §8). Pure functions of state.
 */

import { CASH_BUFFER, GIVING_STRESS_RELIEF, GUARANTEE, roundMoney } from "./constants";
import { installmentPayment, installmentRemaining, monthlyEssentials, type BillContext } from "./bills";
import { priceAt } from "./prices";
import type { LifeState } from "./types";

export function etfValue(s: LifeState, turn = s.turn): { etfBroad: number; etfDividend: number } {
  const pB = priceAt("etfBroad", s.prices.startIndex, turn, s.prices.wraps);
  const pD = priceAt("etfDividend", s.prices.startIndex, turn, s.prices.wraps);
  return {
    etfBroad: roundMoney(s.holdings.etfBroad.units * pB),
    etfDividend: roundMoney(s.holdings.etfDividend.units * pD),
  };
}

/** Everything the card is owed right now, billed or not. */
export function cardBalance(s: LifeState): number {
  const c = s.debts.card;
  return Math.max(c.statementTotal - c.paidThisTurn, 0) + c.chargesThisTurn;
}

/** Principal still revolving (carried past a due date). */
export function cardRevolving(s: LifeState): number {
  const c = s.debts.card;
  return c.olderPrincipal + c.lastMonthPrincipal;
}

export function timeDepositTotal(s: LifeState): number {
  return s.accounts.timeDeposits.reduce((sum, d) => sum + d.amount, 0);
}

export interface NetWorthBreakdown {
  cash: number;
  demand: number;
  timeDeposits: number;
  housingFund: number;
  etf: number;
  receivables: number;
  card: number;
  installments: number;
  guarantee: number;
  overdue: number;
  total: number;
}

/**
 * Net worth (02 §5). The price used is the price at `priceTurn`: during a
 * turn, before the month's market move, that is `s.turn`; after the move it
 * is `s.turn + 1`. 勞退 is shown separately and not counted.
 */
export function netWorth(s: LifeState, priceTurn = s.turn): NetWorthBreakdown {
  const v = etfValue(s, priceTurn);
  const b: Omit<NetWorthBreakdown, "total"> = {
    cash: s.accounts.cash,
    demand: s.accounts.demand,
    timeDeposits: timeDepositTotal(s),
    housingFund: s.accounts.housingFund,
    etf: v.etfBroad + v.etfDividend,
    // Every receivable not yet settled counts at face value; one that fails
    // is written off on its due turn.
    receivables: s.receivables.reduce((sum, r) => sum + r.amount, 0),
    card: cardBalance(s),
    installments: s.debts.installments.reduce((sum, i) => sum + installmentRemaining(i), 0),
    guarantee: s.debts.guaranteeOwed,
    overdue: s.debts.overdueBills,
  };
  return {
    ...b,
    total:
      b.cash + b.demand + b.timeDeposits + b.housingFund + b.etf + b.receivables -
      b.card - b.installments - b.guarantee - b.overdue,
  };
}

/** Emergency fund in months, one decimal (02 §5). */
export function efMonths(s: LifeState, ctx: BillContext): number {
  const essentials = monthlyEssentials(s, ctx);
  if (essentials <= 0) return 0;
  const pool = s.accounts.demand + timeDepositTotal(s) + Math.max(s.accounts.cash - CASH_BUFFER, 0);
  return Math.floor((pool / essentials) * 10) / 10;
}

/** Card minimum + installments + guarantee payment, as due next month. */
export function monthlyDebtPayments(s: LifeState): number {
  const c = s.debts.card;
  const card = c.statementTotal > 0 ? Math.min(c.statementMinimum, c.statementTotal) : 0;
  const inst = s.debts.installments.reduce((sum, i) => sum + installmentPayment(i), 0);
  const guarantee = s.debts.guaranteeOwed > 0 ? Math.min(GUARANTEE.monthlyPayment, s.debts.guaranteeOwed) : 0;
  return card + inst + guarantee;
}

export type StressLevel = "low" | "mid" | "high";

export interface StressInput {
  efMonths: number;
  cardRevolving: number;
  debtPayments: number;
  netPay: number;
  overdue: boolean;
  bigEventHit: boolean;
  coveredByInsurance: boolean;
  gave: boolean;
  /** Event choices that add or remove stress this turn (birthday, family_help, scam). */
  adjust: number;
}

export type StressReason =
  | "noFund"
  | "thinFund"
  | "cardDebt"
  | "debtLoad"
  | "overdue"
  | "bigEvent"
  | "eventChoice"
  | "calm";

export function stressParts(i: StressInput): { score: number; parts: { reason: StressReason; points: number }[] } {
  const parts: { reason: StressReason; points: number }[] = [];
  if (i.efMonths < 1) parts.push({ reason: "noFund", points: 25 });
  else if (i.efMonths < 3) parts.push({ reason: "thinFund", points: 10 });
  if (i.cardRevolving > 0) parts.push({ reason: "cardDebt", points: 20 });
  if (i.netPay > 0 ? i.debtPayments / i.netPay > 0.3 : i.debtPayments > 0) parts.push({ reason: "debtLoad", points: 15 });
  if (i.overdue) parts.push({ reason: "overdue", points: 20 });
  if (i.bigEventHit) parts.push({ reason: "bigEvent", points: 10 });
  if (i.adjust > 0) parts.push({ reason: "eventChoice", points: i.adjust });
  let score = 20 + parts.reduce((sum, p) => sum + p.points, 0);
  if (i.coveredByInsurance) score -= 5;
  if (i.gave) score -= GIVING_STRESS_RELIEF;
  if (i.adjust < 0) score += i.adjust;
  return { score: Math.min(100, Math.max(0, score)), parts };
}

export function stressLevel(score: number): StressLevel {
  return score >= 65 ? "high" : score >= 35 ? "mid" : "low";
}

export const STRESS_LABEL: Record<StressLevel, string> = { low: "低", mid: "中", high: "高" };

/**
 * The mood bubble's text: the biggest single reason (01 §6.1). At a low
 * level the reason is always a calm one: "安心" never sits beside a worry.
 */
export function moodLine(level: StressLevel, reason: StressReason, efMonthsNow = 3): string {
  if (level === "low") {
    return efMonthsNow >= 3 ? "安心：有緊急預備金" : "安心：帳單都繳清了，預備金慢慢存";
  }
  const why: Record<StressReason, string> = {
    noFund: "還沒有緊急預備金",
    thinFund: "預備金還不到三個月",
    cardDebt: "卡費還沒繳清",
    debtLoad: "每月要還的錢太多",
    overdue: "欠款在變多",
    bigEvent: "這個月出了一筆大開銷",
    eventChoice: "這個月有點煩心的事",
    calm: "有緊急預備金",
  };
  const head = level === "mid" ? "有點緊張" : "壓力很大";
  return `${head}：${why[reason]}`;
}

/** The biggest positive contributor, or calm. */
export function topStressReason(parts: { reason: StressReason; points: number }[]): StressReason {
  if (!parts.length) return "calm";
  return [...parts].sort((a, b) => b.points - a.points)[0].reason;
}

/** One line for the 角色狀態 card ("有存款，沒有卡債"). */
export function statusLine(s: LifeState, ef: number): string {
  const saved = ef >= 1 ? "有存款" : "存款還不夠";
  const card = cardRevolving(s) > 0 ? "有卡債" : "沒有卡債";
  return `${saved}，${card}`;
}

/** Freedom % = passive monthly income ÷ gross salary × 100, one decimal (02 §5). */
export function freedomPct(interestThisMonth: number, dividends12: number[], grossMonthly: number): number {
  if (grossMonthly <= 0) return 0;
  const passive = Math.max(interestThisMonth, 0) + dividends12.reduce((a, b) => a + b, 0) / 12;
  return Math.floor((passive / grossMonthly) * 1000) / 10;
}

/** 財務健康分 (02 §8), computed on the server from saved state. */
export function healthScore(s: LifeState): number {
  const h =
    40 * Math.min(s.stats.efMonths / 6, 1) +
    40 * Math.min(s.stats.freedomPct / 10, 1) +
    20 * (1 - s.stats.stress / 100) -
    (cardRevolving(s) > 0 ? 15 : 0) -
    (s.debts.overdueBills > 0 ? 15 : 0);
  return Math.max(0, Math.round(h));
}
