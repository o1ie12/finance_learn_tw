/**
 * What the turn screen shows, computed on the server from the full state
 * (prices need the seed data, hidden rolls stay hidden). The browser gets
 * `publicState(state)` plus this view; it renders, it never recomputes money.
 */

import { billSheet, billsTotal, monthlyEssentials, type BillItem } from "./bills";
import { calendarMonth, publicState, readinessProblem, stressInputs, type GameContext } from "./engine";
import { payslipFor, type Payslip } from "./payroll";
import { dataMonthAt, priceAt } from "./prices";
import {
  cardBalance,
  cardRevolving,
  efMonths,
  moodLine,
  netWorth,
  statusLine,
  stressLevel,
  stressParts,
  topStressReason,
  type StressLevel,
} from "./stats";
import { lineForMove, MOVE_LABEL } from "./unlocks";
import { MOVE_IDS, type LifeState, type MoveId, type PublicLifeState } from "./types";
import { LINES } from "@/lib/lines";
import { DIVIDEND_YIELD, ETF_MONTHLY_MIN, GAME_CARD_LIMIT, INSURANCE } from "./constants";

export interface MoveView {
  id: MoveId;
  label: string;
  unlocked: boolean;
  /** "完成 X線 解鎖" when locked. */
  lockedHint: string | null;
}

export interface TurnView {
  calendarMonth: number;
  monthNumber: number; // 第 N 個月 (1-based)
  dataMonth: string; // the real month behind this turn's prices
  payslip: Payslip | null;
  unemploymentBenefit: number | null;
  bills: BillItem[];
  billsTotal: number;
  essentials: number;
  prices: { etfBroad: number; etfDividend: number };
  pricesAfterMove: { etfBroad: number; etfDividend: number } | null;
  etf: { broadValue: number; dividendValue: number };
  card: { balance: number; revolving: number; due: number; minimum: number; paid: number; available: number };
  netWorth: number;
  /** Top-bar pills (01 §6.4): 存款 (活存 + 定存 + 房屋基金), 投資 (ETF value), 負債 (everything owed). */
  totals: { savings: number; invest: number; debt: number };
  efMonths: number;
  stress: { score: number; level: StressLevel; mood: string; status: string };
  moves: MoveView[];
  readinessProblem: string | null;
  constants: { etfMonthlyMin: number; insurance: typeof INSURANCE; dividendYield: typeof DIVIDEND_YIELD };
}

export function turnView(s: LifeState, ctx: GameContext): TurnView {
  const bctx = { studentLoanMonthly: ctx.studentLoanMonthly };
  const afterMove = s.phase === "event" || s.phase === "ledger";
  const pt = s.turn + (afterMove ? 1 : 0);
  const pB = priceAt("etfBroad", s.prices.startIndex, s.turn, s.prices.wraps);
  const pD = priceAt("etfDividend", s.prices.startIndex, s.turn, s.prices.wraps);
  const pB1 = priceAt("etfBroad", s.prices.startIndex, s.turn + 1, s.prices.wraps);
  const pD1 = priceAt("etfDividend", s.prices.startIndex, s.turn + 1, s.prices.wraps);
  const bills = billSheet(s, bctx);
  const ef = efMonths(s, bctx);
  const parts = stressParts(stressInputs(s, ctx));
  const level = stressLevel(s.stats.stress);
  const c = s.debts.card;
  const nw = netWorth(s, pt);
  const moves: MoveView[] = MOVE_IDS.map((id) => {
    const unlocked = s.unlocked.includes(id);
    const line = lineForMove(id);
    const lineName = line ? LINES.find((l) => l.slug === line)?.name : null;
    return { id, label: MOVE_LABEL[id], unlocked, lockedHint: unlocked || !lineName ? null : `完成 ${lineName} 解鎖` };
  });
  return {
    calendarMonth: calendarMonth(s.turn),
    monthNumber: s.turn + 1,
    dataMonth: dataMonthAt(s.prices.startIndex, s.turn),
    payslip: s.jobless ? null : payslipFor(s.job.grossMonthly, s.pension.rate),
    unemploymentBenefit: s.jobless ? s.jobless.benefit : null,
    bills,
    billsTotal: billsTotal(bills),
    essentials: monthlyEssentials(s, bctx),
    prices: afterMove ? { etfBroad: pB1, etfDividend: pD1 } : { etfBroad: pB, etfDividend: pD },
    pricesAfterMove: afterMove ? { etfBroad: pB1, etfDividend: pD1 } : null,
    etf: {
      broadValue: Math.round(s.holdings.etfBroad.units * (afterMove ? pB1 : pB)),
      dividendValue: Math.round(s.holdings.etfDividend.units * (afterMove ? pD1 : pD)),
    },
    card: {
      balance: cardBalance(s),
      revolving: cardRevolving(s),
      due: Math.max(c.statementTotal - c.paidThisTurn, 0),
      minimum: c.statementMinimum,
      paid: c.paidThisTurn,
      available: Math.max(GAME_CARD_LIMIT - cardBalance(s), 0),
    },
    netWorth: nw.total,
    totals: {
      savings: nw.demand + nw.timeDeposits + nw.housingFund,
      invest: nw.etf,
      debt: nw.card + nw.installments + nw.guarantee + nw.overdue,
    },
    efMonths: ef,
    stress: {
      score: s.stats.stress,
      level,
      mood: moodLine(level, topStressReason(parts.parts), ef),
      status: statusLine(s, ef),
    },
    moves,
    readinessProblem: readinessProblem(s, ctx),
    constants: { etfMonthlyMin: ETF_MONTHLY_MIN, insurance: INSURANCE, dividendYield: DIVIDEND_YIELD },
  };
}

export interface GamePayload {
  state: PublicLifeState;
  view: TurnView;
}

export function gamePayload(s: LifeState, ctx: GameContext): GamePayload {
  return { state: publicState(s), view: turnView(s, ctx) };
}
