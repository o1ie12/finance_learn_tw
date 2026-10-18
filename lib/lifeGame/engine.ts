/**
 * The life game's turn engine (02 §4). Pure: every function takes a state
 * and returns a new one; nothing reads the clock, the network or
 * Math.random. The server runs it; the browser only sends Actions.
 *
 * Bookkeeping: every balance change goes through one of the helpers below,
 * which records it in two places at once:
 *   - `pending.flows`  the net-worth identity (02 §9 test 3):
 *       ΔNW = income − spending + interest + dividends + market change − write-offs
 *   - `pending.ledger` the cash identity the student fills in (02 §4.1):
 *       cashEnd = cashStart + income − saved − bills − actions − events
 * A change that skips the helpers would break the identities, and the tests
 * would catch it.
 */

import {
  BONUS,
  COURSE_SKILL,
  LIFESTYLE,
  LIFESTYLE_SAVE_STREAK,
  LIFESTYLE_SAVE_STRESS,
  LIFESTYLE_SAVE_STRESS_CAP,
  EVENT_COSTS,
  ETF_MONTHLY_MIN,
  FAST_FORWARD_TURNS,
  FRIEND_LOAN,
  GAME_CARD_LIMIT,

  GUARANTEE,
  HISTORY_FULL_TURNS,
  HOUSING_FUND_RATE,
  INSURANCE,
  LAYOFF_MONTHS,
  LEDGER_EVERY,
  LEDGER_TRIES,
  MARKET_DROP_TRIGGER,
  MAX_RANDOM_EVENTS_PER_TURN,
  MIN_BROKER_FEE,
  BUY_FEE_RATE,
  SELL_TAX_RATE,
  DEMAND_RATE,
  TIME_DEPOSIT_RATE,
  TIME_DEPOSIT_TERM,
  DIVIDEND_YIELD,
  RAISE,
  SIDE_BUSINESS,
  SKILL,
  STARTING_CASH,
  START_AGE_MONTHS,
  START_CALENDAR_MONTH,
  STATE_VERSION,
  BILLS,
  FLEX_BOUNDS,
  roundMoney,
} from "./constants";
import { billSheet, installmentPayment, paymentOrder, billsTotal, type BillContext } from "./bills";
import { applyPayment, interestOn, lateFeeFor, minimumPaymentFor, NO_CARRY } from "@/lib/sims/creditCard";
import { findPath } from "@/lib/sims/careers";
import { PERSONAL_EXEMPTION, SALARY_DEDUCTION_CAP, STANDARD_DEDUCTION, correctTax } from "@/lib/sims/taxFiling";
import { payslipFor, unemploymentBenefit } from "./payroll";
import { monthReturn, priceAt, SERIES_LENGTH, wrapsUpTo, type Fund } from "./prices";
import { draw, drawInt, drawNormal, streamFor } from "./rng";
import {
  cardBalance,
  cardRevolving,
  efMonths,
  etfValue,
  freedomPct,
  monthlyDebtPayments,
  netWorth,
  stressParts,
} from "./stats";
import { unlockedMoves } from "./unlocks";
import { FRIEND_CLUES, FRIEND_REPAY_CHANCE } from "./eventText";
import {
  LifeStateSchema,
  type Action,
  type ActionsPayload,
  type BillSource,
  type LifestyleLevel,
  type EventResolution,
  type Flows,
  type LedgerCells,
  type LifeState,
  type Pending,
  type PendingEvent,
  type PublicLifeState,
} from "./types";
import type { CreditRecordValue } from "@/lib/studentProfile";

// --- context ---------------------------------------------------------------------

/** Facts from outside the save, gathered by the server on every load. */
export interface GameContext {
  /** Completed line slugs (sticky completions ∪ live lineStatus, mode-aware). */
  completed: ReadonlySet<string>;
  profile: {
    careerPathId?: string;
    monthlyIncome?: number;
    creditRecord?: CreditRecordValue;
  };
  /** Monthly repayment from the student's 學貸線 run, if any. */
  studentLoanMonthly: number | null;
  goal?: { name: string; amount: number; months: number } | null;
}

function billCtx(ctx: GameContext): BillContext {
  return { studentLoanMonthly: ctx.studentLoanMonthly };
}

export function calendarMonth(turn: number): number {
  return ((START_CALENDAR_MONTH - 1 + turn) % 12) + 1;
}

// --- starter jobs (02 §3.1) --------------------------------------------------------

/**
 * Four entries from 職涯線's paths, one per interest bucket: one near the
 * minimum wage, one about NT$32,000, two more in the same starting range.
 * Only three paths from different buckets fall between NT$29,500 and
 * NT$32,000, so the fourth is 技術工 at NT$35,000 (plan.md C6).
 */
export const STARTER_JOB_IDS = ["art-designer", "biz-accounting", "svc-care", "voc-tech"] as const;

function starterJob(seed: number): LifeState["job"] {
  const id = STARTER_JOB_IDS[drawInt(seed, 0, "starterJob", 0, STARTER_JOB_IDS.length - 1)];
  const path = findPath(id)!;
  return { id: path.id, title: path.name, grossMonthly: path.startingIncome, source: "starter" };
}

function careerJob(ctx: GameContext): LifeState["job"] | null {
  if (!ctx.completed.has("zhiya")) return null;
  const id = ctx.profile.careerPathId;
  const income = ctx.profile.monthlyIncome;
  if (!id || !income) return null;
  const path = findPath(id);
  return { id, title: path?.name ?? "你選的工作", grossMonthly: income, source: "careerLine" };
}


// --- new game ----------------------------------------------------------------------

function emptyFlows(): Flows {
  return { grossPay: 0, netPay: 0, sideProfit: 0, otherIncome: 0, spending: 0, interest: 0, dividends: 0, marketChange: 0, writeOffs: 0 };
}

function emptyLedger(cashStart: number): LedgerCells {
  return { cashStart, income: 0, saved: 0, bills: 0, actions: 0, events: 0, cashEnd: cashStart };
}

function freshPending(s: LifeState): Pending {
  return {
    cashStart: s.accounts.cash,
    netWorthStart: netWorth(s, s.turn).total,
    flows: emptyFlows(),
    ledger: emptyLedger(s.accounts.cash),
    savedFirst: 0,
    tookBackSaving: 0,
    billsTotal: 0,
    wants: 0,
    overdueCreated: 0,
    events: [],
    resolved: [],
    etfReturn: null,
    coveredByInsurance: false,
    bigEventHit: false,
    gaveThisTurn: false,
    stressAdjust: 0,
    notes: [],
    ledgerTries: 0,
    ledgerScore: null,
    ledgerChecked: null,
    autopilot: false,
    priceBefore: {
      etfBroad: priceAt("etfBroad", s.prices.startIndex, s.turn, s.prices.wraps),
      etfDividend: priceAt("etfDividend", s.prices.startIndex, s.turn, s.prices.wraps),
    },
  };
}

function roundTo100(n: number): number {
  return Math.round(n / 100) * 100;
}

export function newGame(seed: number, ctx: GameContext): LifeState {
  const job = careerJob(ctx) ?? starterJob(seed);
  const startIndex = drawInt(seed, 0, "priceStart", 0, SERIES_LENGTH - 1);
  const base: LifeState = {
    version: STATE_VERSION,
    seed: seed >>> 0,
    turn: 0,
    startCalendarMonth: START_CALENDAR_MONTH,
    ageMonths: START_AGE_MONTHS,
    phase: "payday",
    job,
    housing: "family",
    rentExtra: 0,
    bills: { food: BILLS.food, daily: BILLS.daily, transport: "tpass" },
    accounts: { cash: STARTING_CASH, demand: 0, timeDeposits: [], housingFund: 0 },
    pension: { rate: 0, balance: 0 },
    holdings: { etfBroad: { units: 0, costBasis: 0 }, etfDividend: { units: 0, costBasis: 0 } },
    prices: { startIndex, wraps: [] },
    dividends12: [],
    debts: {
      card: {
        ...NO_CARRY,
        statementInterest: 0,
        statementNewCharge: 0,
        statementTotal: 0,
        statementMinimum: 0,
        paidThisTurn: 0,
        chargesThisTurn: 0,
        consecutiveMissed: 0,
        everRevolved: false,
        everMissed: false,
      },
      installments: [],
      guarantee: null,
      guaranteeOwed: 0,
      overdueBills: 0,
    },
    receivables: [],
    insurance: { medical: false, accident: false, life: false },
    insuranceNext: null,
    // Default plan: save 10% of gross first, rounded to NT$100 (示意 default).
    plan: { saveFirst: roundTo100(job.grossMonthly * 0.1), etfMonthly: 0, givingMonthly: 0 },
    lifestyle: { last: "normal", saveStreak: 0 },
    skills: [],
    sideBusiness: null,
    jobless: null,
    moveOutNext: null,
    unlocked: unlockedMoves(ctx.completed),
    creditRecord: ctx.profile.creditRecord ?? "good",
    givingTotal: 0,
    readiness: { warned: false, proceeded: false, turn: null, reason: null },
    goal: ctx.goal ? { ...ctx.goal, startTurn: 0 } : null,
    history: [],
    years: [],
    stats: { stress: 0, efMonths: 0, freedomPct: 0, netWorth: 0 },
    flags: { seenFullRides: 0, lastLedgerTurn: -1 },
    pending: undefined as unknown as Pending,
  };
  base.pending = freshPending(base);
  base.stats = computeStats(base, ctx, base.pending, 0);
  return LifeStateSchema.parse(base);
}

/**
 * Re-derive everything that comes from outside the save (02 §7.1): unlocks
 * from completions, the chosen job once 職涯線 is done, the goal. Called on
 * every load, so a line finished after the save existed unlocks its move.
 */
export function syncWithContext(state: LifeState, ctx: GameContext): LifeState {
  const s = structuredClone(state);
  s.unlocked = unlockedMoves(ctx.completed);
  const chosen = careerJob(ctx);
  if (chosen && s.job.source === "starter") {
    s.job = chosen;
    s.pending.notes.push(`你完成了職涯線，現在做的是自己選的工作：${chosen.title}。`);
  }
  if (!s.goal && ctx.goal) s.goal = { ...ctx.goal, startTurn: s.turn };
  return s;
}

// --- bookkeeping helpers ----------------------------------------------------------

type Cell = "income" | "saved" | "bills" | "actions" | "events";

/** Move cash, recording it on the student's ledger under `cell`. */
function cashMove(s: LifeState, delta: number, cell: Cell): void {
  s.accounts.cash += delta;
  if (cell === "income") s.pending.ledger.income += delta;
  else s.pending.ledger[cell] -= delta;
  s.pending.ledger.cashEnd = s.accounts.cash;
}

function spend(s: LifeState, amount: number): void {
  s.pending.flows.spending += amount;
}

function note(s: LifeState, text: string): void {
  s.pending.notes.push(text);
}

function priceNow(s: LifeState, fund: Fund, afterMove: boolean): number {
  return priceAt(fund, s.prices.startIndex, s.turn + (afterMove ? 1 : 0), s.prices.wraps);
}

/** Market value of one fund at the current trading price, whole dollars. */
function mv(s: LifeState, fund: Fund, afterMove: boolean): number {
  return roundMoney(s.holdings[fund].units * priceNow(s, fund, afterMove));
}

function buyFee(amount: number, standing: boolean): number {
  const fee = roundMoney(amount * BUY_FEE_RATE);
  // Brokers do not apply the NT$20 board-lot minimum to 定期定額 orders.
  return standing ? fee : Math.max(fee, MIN_BROKER_FEE);
}

/**
 * Buy `amount` of a fund with cash. Fees are spending; the rounding gap
 * between cost and market value is booked as market change.
 */
function buyEtf(s: LifeState, fund: Fund, amount: number, cell: Cell, afterMove: boolean, standing = false): void {
  if (amount <= 0) return;
  const fee = buyFee(amount, standing);
  if (fee >= amount) return;
  const price = priceNow(s, fund, afterMove);
  const before = mv(s, fund, afterMove);
  s.holdings[fund].units += (amount - fee) / price;
  s.holdings[fund].costBasis += amount;
  const after = mv(s, fund, afterMove);
  cashMove(s, -amount, cell);
  spend(s, fee);
  s.pending.flows.marketChange += after - before - (amount - fee);
}

/** Sell units of a fund; proceeds go to cash under `cell`. Returns net proceeds. */
function sellEtf(s: LifeState, fund: Fund, units: number, cell: Cell, afterMove: boolean): number {
  const h = s.holdings[fund];
  const u = Math.min(units, h.units);
  if (u <= 0) return 0;
  const price = priceNow(s, fund, afterMove);
  const before = mv(s, fund, afterMove);
  const gross = roundMoney(u * price);
  const fee = Math.max(roundMoney(gross * BUY_FEE_RATE), MIN_BROKER_FEE);
  const tax = roundMoney(gross * SELL_TAX_RATE);
  const net = Math.max(gross - fee - tax, 0);
  h.costBasis = h.units > 0 ? roundMoney(h.costBasis * (1 - u / h.units)) : 0;
  h.units = Math.max(h.units - u, 0);
  if (h.units < 1e-9) {
    h.units = 0;
    h.costBasis = 0;
  }
  const after = mv(s, fund, afterMove);
  cashMove(s, net, cell);
  spend(s, gross - net);
  s.pending.flows.marketChange += after - before + gross;
  return net;
}

/** Units of a fund to sell to raise `cash` after fees and tax. */
function unitsToRaise(s: LifeState, fund: Fund, cash: number, afterMove: boolean): number {
  const price = priceNow(s, fund, afterMove);
  const grossNeeded = Math.max(cash + MIN_BROKER_FEE, cash / (1 - BUY_FEE_RATE - SELL_TAX_RATE)) + 2;
  return Math.min(s.holdings[fund].units, grossNeeded / price);
}

/**
 * Break a 定存: the money comes back with the 活存 rate for the months held
 * (示意 simplification, 02 §3.4), so interest already paid above that rate
 * is clawed back. Goes to cash under `cell` or into 活存.
 */
function breakDeposit(s: LifeState, index: number, to: "cash" | "demand", cell: Cell): number {
  const d = s.accounts.timeDeposits[index];
  if (!d) return 0;
  const held = Math.max(s.turn - d.startTurn, 0);
  const clawback = roundMoney((d.amount * (TIME_DEPOSIT_RATE - DEMAND_RATE) * held) / 12);
  s.accounts.timeDeposits.splice(index, 1);
  const back = d.amount - clawback;
  s.pending.flows.interest -= clawback;
  if (to === "cash") cashMove(s, back, cell);
  else s.accounts.demand += back;
  note(s, `提前解約一筆定存 NT$${d.amount.toLocaleString("en-US")}，利息改用活存利率計算。`);
  return back;
}

function cardAvailable(s: LifeState): number {
  return Math.max(GAME_CARD_LIMIT - cardBalance(s), 0);
}

/** Spend on the card: consumed now, owed on the next statement. */
function chargeCard(s: LifeState, amount: number): number {
  const x = Math.min(amount, cardAvailable(s));
  if (x <= 0) return 0;
  s.debts.card.chargesThisTurn += x;
  spend(s, x);
  return x;
}

/** Pay toward the current card statement with cash. */
function payCard(s: LifeState, amount: number, cell: Cell): number {
  const c = s.debts.card;
  const x = Math.min(amount, Math.max(c.statementTotal - c.paidThisTurn, 0), Math.max(s.accounts.cash, 0));
  if (x <= 0) return 0;
  c.paidThisTurn += x;
  cashMove(s, -x, cell);
  return x;
}

/**
 * Pay a cost that is consumed (an event, a gift). Cash first; if short,
 * 活存, then 定存; anything left becomes a 欠款. Never touches the card or
 * ETF without the student choosing it.
 */
function payCost(s: LifeState, cost: number, cell: Cell): { paid: number; overdue: number } {
  if (cost <= 0) return { paid: 0, overdue: 0 };
  spend(s, cost);
  let short = cost - Math.max(s.accounts.cash, 0);
  if (short > 0 && s.accounts.demand > 0) {
    const x = Math.min(short, s.accounts.demand);
    s.accounts.demand -= x;
    cashMove(s, x, "saved");
    short -= x;
  }
  while (short > 0 && s.accounts.timeDeposits.length) {
    const got = breakDeposit(s, s.accounts.timeDeposits.length - 1, "cash", "saved");
    short -= got;
  }
  const fromCash = Math.min(cost, Math.max(s.accounts.cash, 0));
  cashMove(s, -fromCash, cell);
  const overdue = cost - fromCash;
  if (overdue > 0) {
    s.debts.overdueBills += overdue;
    s.pending.overdueCreated += overdue;
    note(s, `錢不夠，NT$${overdue.toLocaleString("en-US")} 變成欠款，下個月要繳。`);
  }
  return { paid: fromCash, overdue };
}

/** Income that lands in cash (bonus, benefit, invoice, repayment). */
function receive(s: LifeState, amount: number, kind: "other" | "side" | "repayment"): void {
  if (amount === 0) return;
  if (kind === "other") s.pending.flows.otherIncome += amount;
  if (kind === "side") s.pending.flows.sideProfit += amount;
  // A repayment turns a receivable back into cash: no net-worth change.
  cashMove(s, amount, "income");
}

// --- phase: payday ----------------------------------------------------------------

function doPayday(s: LifeState): void {
  if (s.jobless) {
    s.pending.flows.grossPay += 0;
    receive(s, s.jobless.benefit, "other");
    note(s, `這個月領失業給付 NT$${s.jobless.benefit.toLocaleString("en-US")}。`);
  } else {
    const slip = payslipFor(s.job.grossMonthly, s.pension.rate);
    s.pending.flows.grossPay += slip.gross;
    s.pending.flows.netPay += slip.net;
    s.pension.balance += slip.pensionSelf;
    s.pending.flows.pensionSelf = (s.pending.flows.pensionSelf ?? 0) + slip.pensionSelf;
    cashMove(s, slip.net, "income");
  }
  if (s.sideBusiness?.active) {
    const profit = roundMoney(SIDE_BUSINESS.mean + SIDE_BUSINESS.spread * drawNormal(s.seed, s.turn, "sideProfit"));
    if (profit >= 0) receive(s, profit, "side");
    else {
      s.pending.flows.sideProfit += profit;
      const fromCash = Math.min(-profit, Math.max(s.accounts.cash, 0));
      cashMove(s, -fromCash, "income");
      if (-profit > fromCash) {
        s.debts.overdueBills += -profit - fromCash;
        s.pending.overdueCreated += -profit - fromCash;
      }
      note(s, `副業這個月虧了 NT$${(-profit).toLocaleString("en-US")}。`);
    }
  }
  s.phase = "saveFirst";
}

// --- phase: save first --------------------------------------------------------------

function doSaveFirst(s: LifeState, amount: number, remember: boolean): void {
  const x = Math.min(amount, Math.max(s.accounts.cash, 0));
  s.accounts.demand += x;
  cashMove(s, -x, "saved");
  s.pending.savedFirst = x;
  if (remember) s.plan.saveFirst = x;
  s.phase = "bills";
}

// --- phase: bills -------------------------------------------------------------------

export const DEFAULT_COVER: BillSource[] = ["saving", "demand", "deposit", "card", "etf"];

function doPayBills(s: LifeState, ctx: GameContext, cover: BillSource[]): void {
  const items = paymentOrder(billSheet(s, billCtx(ctx)));
  const total = billsTotal(items);
  s.pending.billsTotal = total;
  const spendUnpaidCap = items.filter((b) => b.kind === "spend").reduce((a, b) => a + b.amount, 0);

  let short = total - Math.max(s.accounts.cash, 0);
  let cardCover = 0;
  for (const src of cover) {
    if (short <= 0) break;
    if (src === "saving") {
      const x = Math.min(short, s.pending.savedFirst - s.pending.tookBackSaving, s.accounts.demand);
      if (x > 0) {
        s.accounts.demand -= x;
        cashMove(s, x, "saved");
        s.pending.tookBackSaving += x;
        short -= x;
      }
    } else if (src === "demand") {
      const x = Math.min(short, s.accounts.demand);
      if (x > 0) {
        s.accounts.demand -= x;
        cashMove(s, x, "saved");
        short -= x;
      }
    } else if (src === "deposit") {
      while (short > 0 && s.accounts.timeDeposits.length) {
        short -= breakDeposit(s, s.accounts.timeDeposits.length - 1, "cash", "saved");
      }
    } else if (src === "card" && s.unlocked.includes("card")) {
      // The card can pay spending, never the card's own bill or a debt.
      const x = Math.min(short, spendUnpaidCap - cardCover, cardAvailable(s));
      if (x > 0) {
        cardCover += x;
        short -= x;
      }
    } else if (src === "etf") {
      for (const fund of ["etfBroad", "etfDividend"] as Fund[]) {
        if (short <= 0) break;
        const units = unitsToRaise(s, fund, short, false);
        if (units > 0) short -= sellEtf(s, fund, units, "saved", false);
      }
    }
  }

  // Pay in order with cash; the card covers spend items left unpaid.
  let cashLeft = Math.max(s.accounts.cash, 0);
  let cardLeft = cardCover;
  for (const b of items) {
    const fromCash = Math.min(b.amount, cashLeft);
    cashLeft -= fromCash;
    let unpaid = b.amount - fromCash;
    let fromCard = 0;
    if (unpaid > 0 && b.kind === "spend" && cardLeft > 0) {
      fromCard = Math.min(unpaid, cardLeft);
      cardLeft -= fromCard;
      unpaid -= fromCard;
    }
    if (fromCash > 0) cashMove(s, -fromCash, "bills");
    if (fromCard > 0) {
      // chargeCard books the spending.
      chargeCard(s, fromCard);
    }
    if (b.kind === "spend") {
      spend(s, fromCash + unpaid);
      if (unpaid > 0) {
        s.debts.overdueBills += unpaid;
        s.pending.overdueCreated += unpaid;
      }
      continue;
    }
    // paydown items
    if (b.id === "card") {
      s.debts.card.paidThisTurn += fromCash;
    } else if (b.id.startsWith("installment:")) {
      const i = s.debts.installments[Number(b.id.split(":")[1])];
      i.turnsLeft -= 1;
      if (unpaid > 0) {
        s.debts.overdueBills += unpaid;
        s.pending.overdueCreated += unpaid;
      }
    } else if (b.id === "guarantee") {
      s.debts.guaranteeOwed -= b.amount;
      if (unpaid > 0) {
        s.debts.overdueBills += unpaid;
        s.pending.overdueCreated += unpaid;
      }
    } else if (b.id === "overdue") {
      s.debts.overdueBills -= fromCash;
    }
  }
  s.debts.installments = s.debts.installments.filter((i) => i.turnsLeft > 0);

  if (s.pending.tookBackSaving > 0) note(s, "這個月存太多了，帳單不夠付。");
  if (s.pending.overdueCreated > 0) {
    note(s, `有 NT$${s.pending.overdueCreated.toLocaleString("en-US")} 的帳單沒繳，變成欠款，下個月要補。`);
  }
  s.phase = "lifestyle";
}

// --- phase: lifestyle (05 Part B) ----------------------------------------------------

/**
 * This month's 想要 spending, paid like a bill: cash first, then the card if
 * it is unlocked. Fun is not a debt: what neither covers is simply not spent.
 * Booked in the ledger's 帳單 cell.
 */
/** Stress from a 省 streak this month: +5 a month from the third, at most +15. */
export function lifestyleStress(saveStreak: number): number {
  const months = saveStreak - LIFESTYLE_SAVE_STREAK + 1;
  return months > 0 ? Math.min(months * LIFESTYLE_SAVE_STRESS, LIFESTYLE_SAVE_STRESS_CAP) : 0;
}

function doLifestyle(s: LifeState, level: LifestyleLevel): void {
  const want = LIFESTYLE[level];
  const fromCash = Math.min(want, Math.max(s.accounts.cash, 0));
  if (fromCash > 0) {
    cashMove(s, -fromCash, "bills");
    spend(s, fromCash);
  }
  const fromCard = want > fromCash && s.unlocked.includes("card") ? chargeCard(s, want - fromCash) : 0;
  s.pending.wants = fromCash + fromCard;
  if (s.pending.wants < want) note(s, "錢不夠，這個月想要的花費只好少一點。");

  s.lifestyle = { last: level, saveStreak: level === "save" ? s.lifestyle.saveStreak + 1 : 0 };
  const extra = lifestyleStress(s.lifestyle.saveStreak);
  if (extra > 0) {
    s.pending.stressAdjust += extra;
    note(s, `連續 ${s.lifestyle.saveStreak} 個月都省，壓力變大了：完全沒有娛樂的生活很難撐久。`);
  }
  s.phase = "actions";
}

// --- phase: actions -----------------------------------------------------------------

export type ApplyResult =
  | { ok: true; state: LifeState }
  | { ok: false; error: string; detail?: string; needsConfirm?: { kind: "readiness"; reason: string } };

function has(s: LifeState, move: LifeState["unlocked"][number]): boolean {
  return s.unlocked.includes(move);
}

/** Readiness check before the first ETF buy (02 §3.4). Null when ready. */
export function readinessProblem(s: LifeState, ctx: GameContext): string | null {
  const reasons: string[] = [];
  if (cardRevolving(s) > 0) reasons.push("你還有卡債在循環");
  if (efMonths(s, billCtx(ctx)) < 1) reasons.push("緊急預備金還不到一個月");
  return reasons.length ? reasons.join("，") : null;
}

function everBoughtEtf(s: LifeState): boolean {
  return s.readiness.turn !== null || s.holdings.etfBroad.units > 0 || s.holdings.etfDividend.units > 0;
}

/** Money coming into cash at the actions step: 活存 withdrawals, a broken 定存, ETF sales. */
function applyInflows(s: LifeState, m: ActionsPayload): void {
  if (m.withdrawDemand) {
    const x = Math.min(m.withdrawDemand, s.accounts.demand);
    s.accounts.demand -= x;
    cashMove(s, x, "actions");
  }
  if (m.breakDeposit !== undefined) breakDeposit(s, m.breakDeposit, "cash", "actions");
  if (m.sellBroadUnits) sellEtf(s, "etfBroad", m.sellBroadUnits, "actions", false);
  if (m.sellDividendUnits) sellEtf(s, "etfDividend", m.sellDividendUnits, "actions", false);
}

function doActions(s: LifeState, ctx: GameContext, m: ActionsPayload): ApplyResult | null {
  // Validation first, so a refused action changes nothing.
  const need = (cond: boolean, move: string) => (cond ? null : `locked:${move}`);
  const checks = [
    m.timeDeposit || m.breakDeposit !== undefined ? need(has(s, "timeDeposit"), "timeDeposit") : null,
    m.housingFund ? need(has(s, "housingFund"), "housingFund") : null,
    m.etfBroad ? need(has(s, "etfBroad"), "etfBroad") : null,
    m.etfDividend ? need(has(s, "etfDividend"), "etfDividend") : null,
    m.sellBroadUnits || m.sellDividendUnits ? need(has(s, "etfSell"), "etfSell") : null,
    m.cardRepay ? need(has(s, "cardRepay"), "cardRepay") : null,
    m.insurance ? need(has(s, "insurance"), "insurance") : null,
    m.startSkill ? need(has(s, "skill"), "skill") : null,
    m.startSideBusiness ? need(has(s, "sideBusiness"), "sideBusiness") : null,
    m.moveOut ? need(has(s, "moveOut"), "moveOut") : null,
    m.bills ? need(has(s, "editBills"), "editBills") : null,
    m.plan?.etfMonthly ? need(has(s, "etfMonthly"), "etfMonthly") : null,
  ].filter(Boolean);
  if (checks.length) return { ok: false, error: "locked", detail: String(checks[0]) };
  if (m.plan?.etfMonthly && m.plan.etfMonthly > 0 && m.plan.etfMonthly < ETF_MONTHLY_MIN) {
    return { ok: false, error: "below_minimum", detail: "etfMonthly" };
  }
  if (m.startSideBusiness && s.sideBusiness?.active) return { ok: false, error: "already_active" };
  if (m.breakDeposit !== undefined && !s.accounts.timeDeposits[m.breakDeposit]) {
    return { ok: false, error: "no_such_deposit" };
  }

  // Readiness before the first ETF buy.
  const buyingEtf = (m.etfBroad ?? 0) > 0 || (m.etfDividend ?? 0) > 0 || (m.plan?.etfMonthly ?? 0) > 0;
  if (buyingEtf && !everBoughtEtf(s)) {
    const problem = readinessProblem(s, ctx);
    if (problem && !m.confirmReadiness) {
      return { ok: false, error: "readiness", needsConfirm: { kind: "readiness", reason: problem } };
    }
    s.readiness = { warned: problem !== null, proceeded: true, turn: s.turn, reason: problem };
  }

  // Cash check: apply the inflows (withdraw, break, sell) to a copy to get
  // the exact cash they produce, then every outflow must fit. cardRepay is
  // capped at what the statement still asks for.
  const due = Math.max(s.debts.card.statementTotal - s.debts.card.paidThisTurn, 0);
  const cardRepay = Math.min(m.cardRepay ?? 0, due);
  const dry = structuredClone(s);
  applyInflows(dry, m);
  const cashAfterInflows = Math.max(dry.accounts.cash, 0);
  const standingEtf = has(s, "etfMonthly") ? (m.plan?.etfMonthly ?? s.plan.etfMonthly) : 0;
  const standingGive = m.plan?.givingMonthly ?? s.plan.givingMonthly;
  const outflow =
    (m.demand ?? 0) + (m.timeDeposit ?? 0) + (m.housingFund ?? 0) + (m.etfBroad ?? 0) + (m.etfDividend ?? 0) +
    cardRepay + (m.give ?? 0) + (m.startSideBusiness ? SIDE_BUSINESS.setup : 0);
  if (outflow > cashAfterInflows) {
    return { ok: false, error: "insufficient_cash" };
  }

  // Settings that take effect next turn.
  if (m.plan) {
    if (m.plan.saveFirst !== undefined) s.plan.saveFirst = m.plan.saveFirst;
    if (m.plan.etfMonthly !== undefined) s.plan.etfMonthly = m.plan.etfMonthly;
    if (m.plan.givingMonthly !== undefined) s.plan.givingMonthly = m.plan.givingMonthly;
  }
  if (m.pensionRate !== undefined) s.pension.rate = Math.round(m.pensionRate * 100) / 100;
  if (m.bills) {
    const clamp = (v: number, b: { min: number; max: number }) => Math.min(Math.max(v, b.min), b.max);
    if (m.bills.food !== undefined) s.bills.food = clamp(m.bills.food, FLEX_BOUNDS.food);
    if (m.bills.daily !== undefined) s.bills.daily = clamp(m.bills.daily, FLEX_BOUNDS.daily);
    if (m.bills.transport) s.bills.transport = m.bills.transport;
  }
  if (m.insurance) {
    s.insuranceNext = { ...m.insurance };
    if (m.insurance.life && !s.insurance.life) {
      note(s, "目前沒有人靠你的收入生活，壽險可以晚點再考慮。");
    }
  }
  if (m.moveOut) s.moveOutNext = m.moveOut;

  // Inflows.
  applyInflows(s, m);

  // Standing plan items run first (02 §4 step 4) and are shown.
  if (standingEtf > 0) {
    if (s.accounts.cash >= standingEtf + outflow) {
      buyEtf(s, "etfBroad", standingEtf, "actions", false, true);
      note(s, `定期定額買進市值型 ETF NT$${standingEtf.toLocaleString("en-US")}。`);
    } else note(s, "現金不夠，這個月的定期定額沒有扣款。");
  }
  if (standingGive > 0) {
    if (s.accounts.cash >= standingGive + outflow) {
      spend(s, standingGive);
      cashMove(s, -standingGive, "actions");
      s.givingTotal += standingGive;
      s.pending.gaveThisTurn = true;
    } else note(s, "現金不夠，這個月的固定助人先暫停。");
  }

  // Outflows.
  if (m.demand) {
    const x = Math.min(m.demand, Math.max(s.accounts.cash, 0));
    s.accounts.demand += x;
    cashMove(s, -x, "actions");
  }
  if (m.timeDeposit) {
    const x = Math.min(m.timeDeposit, Math.max(s.accounts.cash, 0));
    if (x > 0) {
      s.accounts.timeDeposits.push({ amount: x, startTurn: s.turn, termMonths: TIME_DEPOSIT_TERM });
      cashMove(s, -x, "actions");
    }
  }
  if (m.housingFund) {
    const x = Math.min(m.housingFund, Math.max(s.accounts.cash, 0));
    s.accounts.housingFund += x;
    cashMove(s, -x, "actions");
  }
  if (m.etfBroad) buyEtf(s, "etfBroad", Math.min(m.etfBroad, Math.max(s.accounts.cash, 0)), "actions", false);
  if (m.etfDividend) buyEtf(s, "etfDividend", Math.min(m.etfDividend, Math.max(s.accounts.cash, 0)), "actions", false);
  if (cardRepay) payCard(s, cardRepay, "actions");
  if (m.give) {
    const x = Math.min(m.give, Math.max(s.accounts.cash, 0));
    if (x > 0) {
      spend(s, x);
      cashMove(s, -x, "actions");
      s.givingTotal += x;
      s.pending.gaveThisTurn = true;
    }
  }
  if (m.startSkill && !s.skills.some((k) => k.monthsLeft > 0)) {
    s.skills.push({ id: `skill-${s.turn}`, doneTurn: null, monthsLeft: SKILL.months, monthly: SKILL.monthly });
    note(s, `開始學一項技能：每月 NT$${SKILL.monthly.toLocaleString("en-US")}，共 ${SKILL.months} 個月，從下個月的帳單開始。`);
  }
  if (m.startSideBusiness) {
    spend(s, SIDE_BUSINESS.setup);
    cashMove(s, -SIDE_BUSINESS.setup, "actions");
    s.sideBusiness = { active: true, startedTurn: s.turn };
  }

  startEventPhase(s, ctx);
  return null;
}

// --- phase: events ------------------------------------------------------------------

interface RandomEventDef {
  id: string;
  chance: number;
  eligible: (s: LifeState) => boolean;
}

/** Random events in priority order (02 §6 table order). */
const RANDOM_EVENTS: RandomEventDef[] = [
  { id: "phone_break", chance: 0.04, eligible: () => true },
  { id: "dental", chance: 0.03, eligible: () => true },
  { id: "scooter_service", chance: 0.05, eligible: () => true },
  { id: "accident", chance: 0.02, eligible: () => true },
  { id: "hospital", chance: 0.01, eligible: () => true },
  { id: "birthday", chance: 0.08, eligible: () => true },
  { id: "concert", chance: 0.04, eligible: () => true },
  { id: "japan_trip", chance: 0.02, eligible: () => true },
  { id: "new_phone", chance: 0.03, eligible: (s) => !s.debts.installments.some((i) => i.label === "新手機") },
  { id: "scam_msg", chance: 0.03, eligible: () => true },
  { id: "friend_loan", chance: 0.03, eligible: () => true },
  { id: "guarantor", chance: 0.01, eligible: (s) => s.unlocked.includes("card") && !s.debts.guarantee && s.debts.guaranteeOwed === 0 },
  { id: "family_help", chance: 0.02, eligible: () => true },
  { id: "rent_up", chance: 0.02, eligible: (s) => s.housing !== "family" },
  { id: "invoice", chance: 0.05, eligible: () => true },
  { id: "course_sale", chance: 0.03, eligible: (s) => s.unlocked.includes("skill") },
  { id: "layoff", chance: 0.005, eligible: (s) => !s.jobless },
];

export const RANDOM_EVENT_IDS = RANDOM_EVENTS.map((e) => e.id);

/** Choice events and the option autopilot takes (the safest one). */
export const SAFEST_OPTION: Record<string, string> = {
  birthday: "skip",
  concert: "skip",
  japan_trip: "skip",
  new_phone: "wait",
  scam_msg: "ignore",
  friend_loan: "no",
  guarantor: "no",
  family_help: "give2000",
  rent_up: "accept",
  course_sale: "skip",
  market_drop: "hold",
  bonus: "save",
};

export function isChoiceEvent(id: string): boolean {
  return id in SAFEST_OPTION;
}

/** Draw this turn's events. Pure in (seed, turn, state). */
export function drawEvents(s: LifeState): PendingEvent[] {
  const events: PendingEvent[] = [];
  const month = calendarMonth(s.turn);

  // Scheduled: due dates (do not count toward the limit).
  s.receivables.forEach((r, idx) => {
    if (r.dueTurn === s.turn) {
      events.push({ key: `repay:${idx}`, id: r.willRepay ? "friend_repaid" : "friend_default", vars: { amount: r.amount } });
    }
  });
  if (s.debts.guarantee && s.debts.guarantee.triggerTurn === s.turn) {
    events.push({
      key: "guarantee",
      id: s.debts.guarantee.willTrigger ? "guarantee_called" : "guarantee_released",
      vars: { amount: s.debts.guarantee.amount },
    });
  }

  // market_drop: triggered by the data, not rolled.
  // The worst monthly return among the funds the student holds.
  const held = (["etfBroad", "etfDividend"] as Fund[]).filter((f) => s.holdings[f].units > 0);
  const rets = held.map((f) => monthReturn(f, s.prices.startIndex, s.turn, s.prices.wraps));
  const ret = rets.length ? Math.min(...rets) : null;
  if (ret !== null && ret <= MARKET_DROP_TRIGGER) {
    const value = mv(s, "etfBroad", true) + mv(s, "etfDividend", true);
    events.push({ key: "market_drop", id: "market_drop", vars: { pct: Math.round(-ret * 1000) / 10, value } });
  }

  // Scheduled yearly events.
  if (month === 12 && !s.jobless && draw(s.seed, s.turn, "bonus") < BONUS.chance) {
    events.push({ key: "bonus", id: "bonus", vars: { amount: s.job.grossMonthly * BONUS.months } });
  }
  if (s.turn > 0 && s.turn % RAISE.every === 0 && !s.jobless) {
    const skilled = s.skills.some((k) => k.doneTurn !== null && s.turn - k.doneTurn < RAISE.every);
    const chance = skilled ? RAISE.chanceWithSkill : RAISE.chance;
    if (draw(s.seed, s.turn, "raise") < chance) {
      events.push({ key: "raise", id: "raise", vars: { salary: roundMoney(s.job.grossMonthly * (1 + RAISE.pct)) } });
    }
  }
  if (month === 5 && s.turn >= 12) {
    events.push({ key: "tax_notice", id: "tax_notice", vars: { result: taxResultText(s) } });
  }

  // Random: roll every eligible event, keep the first two by priority.
  let kept = 0;
  for (const e of RANDOM_EVENTS) {
    if (kept >= MAX_RANDOM_EVENTS_PER_TURN) break;
    if (!e.eligible(s)) continue;
    if (draw(s.seed, s.turn, `event:${e.id}`) >= e.chance) continue;
    const vars: Record<string, string | number> = {};
    if (e.id === "friend_loan") {
      const clues = friendClues(s.seed, s.turn);
      vars.clue1 = clues.texts[0];
      vars.clue2 = clues.texts[1];
      vars.good = clues.good;
    }
    events.push({ key: e.id, id: e.id, vars });
    kept++;
  }
  return events;
}

export function friendClues(seed: number, turn: number): { texts: [string, string]; good: number } {
  const pool = [
    ...FRIEND_CLUES.good.map((t) => ({ t, good: true })),
    ...FRIEND_CLUES.bad.map((t) => ({ t, good: false })),
  ];
  const next = streamFor(seed, turn, "friendClues");
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const two = pool.slice(0, 2);
  return { texts: [two[0].t, two[1].t], good: two.filter((c) => c.good).length };
}

/** Last 12 turns' taxable salary through the 報稅線 engine's 115年度 figures. */
/** Calendar year index of a turn, counted from the game's first July. */
function yearIndex(turn: number): number {
  return Math.floor((START_CALENDAR_MONTH - 1 + turn) / 12);
}

/**
 * Last calendar year's tax, by the 報稅線 engine (lib/sims/taxFiling.ts,
 * 115年度 figures): salary and bonus, minus 勞退自提 (not counted as that
 * year's salary income, 勞工退休金條例 §14 III), minus 免稅額, 標準扣除額
 * and 薪資所得特別扣除額, then correctTax.
 */
export function yearTax(s: LifeState): { income: number; tax: number } {
  const lastYear = yearIndex(s.turn) - 1;
  const months = s.history.filter((h) => yearIndex(h.turn) === lastYear);
  const salary =
    months.reduce((sum, h) => sum + h.flows.grossPay - (h.flows.pensionSelf ?? 0), 0) +
    months.reduce((sum, h) => sum + h.events.filter((e) => e.id === "bonus").reduce((a, e) => a + e.gain, 0), 0);
  const income = Math.max(salary, 0);
  const salaryDeduction = Math.min(income, SALARY_DEDUCTION_CAP);
  const net = income - PERSONAL_EXEMPTION - STANDARD_DEDUCTION - salaryDeduction;
  return { income, tax: net > 0 ? correctTax(net) : 0 };
}

function taxResultText(s: LifeState): string {
  if (!s.unlocked.includes("realTax")) return "退稅 NT$0（示意）。完成報稅線看懂這張單";
  const { tax } = yearTax(s);
  // The game withholds nothing monthly, so the notice is a bill or nothing.
  return tax > 0 ? `要補繳 NT$${tax.toLocaleString("en-US")}` : "所得扣掉免稅額和扣除額後是 0，不用繳稅";
}

function startEventPhase(s: LifeState, ctx: GameContext): void {
  void ctx;
  // The month passes: prices move from this month's close to next month's.
  s.prices.wraps = wrapsUpTo(s.prices.startIndex, s.turn + 1, s.prices.wraps);
  const ret = monthReturn("etfBroad", s.prices.startIndex, s.turn, s.prices.wraps);
  s.pending.etfReturn = ret;
  const before = mv(s, "etfBroad", false) + mv(s, "etfDividend", false);
  const after = mv(s, "etfBroad", true) + mv(s, "etfDividend", true);
  s.pending.flows.marketChange += after - before;
  s.pending.events = drawEvents(s);
  s.phase = "event";
}

function applyInsurance(s: LifeState, id: string, cost: number): { pay: number; covered: number } {
  if (id === "hospital" && s.insurance.medical) {
    const covered = Math.min(roundMoney(cost * INSURANCE.medical.share), INSURANCE.medical.capPerEvent);
    return { pay: cost - covered, covered };
  }
  if (id === "accident" && s.insurance.accident) {
    const covered = Math.min(roundMoney(cost * INSURANCE.accident.share), INSURANCE.accident.capPerEvent);
    return { pay: cost - covered, covered };
  }
  return { pay: cost, covered: 0 };
}

const FIXED_COST: Record<string, number> = {
  phone_break: EVENT_COSTS.phone_break,
  dental: EVENT_COSTS.dental,
  scooter_service: EVENT_COSTS.scooter_service,
  accident: EVENT_COSTS.accident,
  hospital: EVENT_COSTS.hospital,
};

function resolveEvent(
  ctx: GameContext,
  s: LifeState,
  e: PendingEvent,
  choice: { option: string; payWith?: "cash" | "card"; amount?: number } | undefined,
): EventResolution | { error: string } {
  const r: EventResolution = { id: e.id, option: choice?.option ?? null, cost: 0, paid: 0, covered: 0, gain: 0, note: "" };
  const opt = choice?.option;
  const netPayRef = s.jobless ? s.jobless.benefit : payslipFor(s.job.grossMonthly, s.pension.rate).net;
  const bigHit = (paid: number) => {
    if (paid > netPayRef * 0.5) s.pending.bigEventHit = true;
  };

  if (isChoiceEvent(e.id)) {
    if (!opt) return { error: `choice_required:${e.key}` };
  }

  switch (e.id) {
    case "phone_break":
    case "dental":
    case "scooter_service":
    case "accident":
    case "hospital": {
      const cost = FIXED_COST[e.id];
      const { pay, covered } = applyInsurance(s, e.id, cost);
      r.cost = cost;
      r.covered = covered;
      payCost(s, pay, "events");
      r.paid = pay;
      if (covered > 0) {
        s.pending.coveredByInsurance = true;
        r.note = `保險付了 NT$${covered.toLocaleString("en-US")}，你只付了 NT$${pay.toLocaleString("en-US")}。`;
      }
      bigHit(pay);
      return r;
    }
    case "birthday":
      if (opt === "go") {
        r.cost = r.paid = EVENT_COSTS.birthday;
        payCost(s, EVENT_COSTS.birthday, "events");
      } else if (opt === "skip") s.pending.stressAdjust += 2;
      else return { error: "bad_option" };
      return r;
    case "concert":
      if (opt === "buy") {
        r.cost = EVENT_COSTS.concert;
        if (choice?.payWith === "card" && s.unlocked.includes("card") && cardAvailable(s) >= EVENT_COSTS.concert) {
          chargeCard(s, EVENT_COSTS.concert);
          r.note = "用信用卡付，下個月的帳單會出現。";
        } else payCost(s, EVENT_COSTS.concert, "events");
        r.paid = EVENT_COSTS.concert;
      } else if (opt !== "skip") return { error: "bad_option" };
      return r;
    case "japan_trip": {
      const cost = opt === "go" ? EVENT_COSTS.japanTrip : opt === "short" ? EVENT_COSTS.japanTripShort : opt === "skip" ? 0 : -1;
      if (cost < 0) return { error: "bad_option" };
      r.cost = r.paid = cost;
      payCost(s, cost, "events");
      bigHit(cost);
      return r;
    }
    case "new_phone":
      if (opt === "cash") {
        r.cost = r.paid = EVENT_COSTS.newPhone;
        payCost(s, EVENT_COSTS.newPhone, "events");
        bigHit(EVENT_COSTS.newPhone);
      } else if (opt === "installment") {
        // Consumed now; owed over 12 turns: 11 × 2,667 + 2,663 = 32,000.
        r.cost = EVENT_COSTS.newPhone;
        spend(s, EVENT_COSTS.newPhone);
        s.debts.installments.push({
          label: "新手機",
          monthly: EVENT_COSTS.newPhoneMonthly,
          turnsLeft: EVENT_COSTS.newPhoneTurns,
          lastMonthly: EVENT_COSTS.newPhoneLast,
        });
        r.note = s.unlocked.includes("card")
          ? "刷卡分 12 期，0 利率，每月 NT$2,667。分期還是在花錢。"
          : "分 12 期，每月 NT$2,667。分期還是在花錢。";
      } else if (opt !== "wait") return { error: "bad_option" };
      return r;
    case "scam_msg":
      if (opt === "click") {
        r.cost = r.paid = EVENT_COSTS.scamLoss;
        payCost(s, EVENT_COSTS.scamLoss, "events");
        s.pending.stressAdjust += 10;
        r.note = "連結是假的，帳戶被盜刷了 NT$10,000。";
      } else if (opt !== "ignore" && opt !== "call165") return { error: "bad_option" };
      return r;
    case "friend_loan": {
      const lend = opt === "lend" ? FRIEND_LOAN.amount : opt === "half" ? FRIEND_LOAN.amount / 2 : opt === "no" ? 0 : -1;
      if (lend < 0) return { error: "bad_option" };
      if (lend > 0) {
        const x = Math.min(lend, Math.max(s.accounts.cash, 0) + s.accounts.demand);
        if (x > s.accounts.cash) {
          const pull = x - s.accounts.cash;
          s.accounts.demand -= pull;
          cashMove(s, pull, "saved");
        }
        cashMove(s, -x, "events");
        const good = Number(e.vars.good ?? 0);
        const willRepay = draw(s.seed, s.turn, "friendRepay") < FRIEND_REPAY_CHANCE[Math.min(good, 2)];
        s.receivables.push({ from: "同學", amount: x, dueTurn: s.turn + FRIEND_LOAN.dueInTurns, willRepay });
        r.cost = x;
        r.paid = x;
        r.note = `借出 NT$${x.toLocaleString("en-US")}，說好 ${FRIEND_LOAN.dueInTurns} 個月後還。`;
      }
      return r;
    }
    case "guarantor":
      if (opt === "yes") {
        const ahead = drawInt(s.seed, s.turn, "guaranteeTurn", GUARANTEE.minTurnsAhead, GUARANTEE.maxTurnsAhead);
        const willTrigger = draw(s.seed, s.turn, "guaranteeRoll") < GUARANTEE.triggerChance;
        s.debts.guarantee = { amount: GUARANTEE.amount, triggerTurn: s.turn + ahead, willTrigger };
        r.note = "你簽了名。之後如果學長繳不出來，銀行會找你。";
      } else if (opt !== "no") return { error: "bad_option" };
      return r;
    case "family_help": {
      const give = opt === "give5000" ? EVENT_COSTS.familyHelpHigh : opt === "give2000" ? EVENT_COSTS.familyHelpLow : opt === "no" ? 0 : -1;
      if (give < 0) return { error: "bad_option" };
      if (give > 0) {
        r.cost = r.paid = give;
        payCost(s, give, "events");
        s.givingTotal += give;
        s.pending.gaveThisTurn = true;
      } else s.pending.stressAdjust += 5;
      return r;
    }
    case "rent_up":
      if (opt === "accept") {
        s.rentExtra += BILLS.rentRaise;
      } else if (opt === "move") {
        r.cost = r.paid = BILLS.movingCost;
        payCost(s, BILLS.movingCost, "events");
        s.rentExtra = 0;
      } else return { error: "bad_option" };
      return r;
    case "invoice":
      r.gain = EVENT_COSTS.invoice;
      receive(s, EVENT_COSTS.invoice, "other");
      return r;
    case "course_sale":
      if (opt === "buy") {
        r.cost = r.paid = COURSE_SKILL.cost;
        payCost(s, COURSE_SKILL.cost, "events");
        s.skills.push({ id: `course-${s.turn}`, doneTurn: null, monthsLeft: COURSE_SKILL.months, monthly: 0 });
      } else if (opt !== "skip") return { error: "bad_option" };
      return r;
    case "layoff":
      s.jobless = { turnsLeft: LAYOFF_MONTHS, benefit: unemploymentBenefit(s.job.grossMonthly) };
      r.note = `接下來 ${LAYOFF_MONTHS} 個月，每月領失業給付 NT$${s.jobless.benefit.toLocaleString("en-US")}。`;
      return r;
    case "market_drop":
      if (opt === "sellAll") {
        sellEtf(s, "etfBroad", s.holdings.etfBroad.units, "events", true);
        sellEtf(s, "etfDividend", s.holdings.etfDividend.units, "events", true);
        r.note = "你全部賣掉了。接下來幾個月，看看真實的走勢。";
      } else if (opt === "add") {
        const x = Math.min(choice?.amount ?? 0, Math.max(s.accounts.cash, 0));
        if (x > 0) buyEtf(s, "etfBroad", x, "events", true);
        r.cost = x;
        r.note = x > 0 ? `加碼 NT$${x.toLocaleString("en-US")}。` : "現金不夠加碼。";
      } else if (opt !== "hold") return { error: "bad_option" };
      return r;
    case "bonus": {
      const amount = Number(e.vars.amount);
      r.gain = amount;
      receive(s, amount, "other");
      if (opt === "save") {
        s.accounts.demand += amount;
        cashMove(s, -amount, "saved");
      } else if (opt === "invest") {
        const notReady = !everBoughtEtf(s) ? readinessProblem(s, ctx) : null;
        if (s.unlocked.includes("etfBroad") && !notReady) {
          buyEtf(s, "etfBroad", amount, "events", true);
          if (!everBoughtEtf(s) || s.readiness.turn === null) s.readiness = { ...s.readiness, proceeded: true, turn: s.turn };
        } else if (notReady) {
          s.accounts.demand += amount;
          cashMove(s, -amount, "saved");
          r.note = `先存進活存：${notReady}。先管好錢，再讓錢長大。`;
        } else {
          s.accounts.demand += amount;
          cashMove(s, -amount, "saved");
          r.note = "還沒解鎖 ETF，先存進活存。完成投資線後就能投資。";
        }
      } else if (opt === "half") {
        const half = Math.floor(amount / 2);
        payCost(s, amount - half, "events");
        s.accounts.demand += half;
        cashMove(s, -half, "saved");
        r.cost = r.paid = amount - half;
      } else if (opt === "spend") {
        payCost(s, amount, "events");
        r.cost = r.paid = amount;
      } else return { error: "bad_option" };
      return r;
    }
    case "raise":
      s.job.grossMonthly = Number(e.vars.salary);
      return r;
    case "tax_notice": {
      if (s.unlocked.includes("realTax")) {
        const { tax } = yearTax(s);
        if (tax > 0) {
          r.cost = r.paid = tax;
          payCost(s, tax, "events");
        }
      }
      return r;
    }
    case "friend_repaid": {
      const idx = Number(e.key.split(":")[1]);
      const rec = s.receivables[idx];
      r.gain = rec.amount;
      receive(s, rec.amount, "repayment");
      rec.amount = 0;
      return r;
    }
    case "friend_default": {
      const idx = Number(e.key.split(":")[1]);
      const rec = s.receivables[idx];
      s.pending.flows.writeOffs += rec.amount;
      r.cost = rec.amount;
      rec.amount = 0;
      return r;
    }
    case "guarantee_called":
      s.debts.guaranteeOwed += Number(e.vars.amount);
      s.pending.flows.writeOffs += Number(e.vars.amount);
      s.debts.guarantee = null;
      r.cost = Number(e.vars.amount);
      return r;
    case "guarantee_released":
      s.debts.guarantee = null;
      return r;
    default:
      return { error: `unknown_event:${e.id}` };
  }
}

function doEvents(s: LifeState, ctx: GameContext, choices: Record<string, { option: string; payWith?: "cash" | "card"; amount?: number }>): ApplyResult | null {
  // Validate every choice before applying any.
  for (const e of s.pending.events) {
    if (isChoiceEvent(e.id) && !choices[e.key]) return { ok: false, error: "choice_required", detail: e.key };
  }
  for (const e of s.pending.events) {
    const res = resolveEvent(ctx, s, e, choices[e.key]);
    if ("error" in res) return { ok: false, error: res.error };
    s.pending.resolved.push(res);
  }
  s.receivables = s.receivables.filter((r) => r.amount > 0);
  monthEnd(s, ctx);
  return null;
}

// --- month end ----------------------------------------------------------------------

function settleCard(s: LifeState): void {
  const c = s.debts.card;
  let lateFee = 0;
  if (c.statementTotal > 0) {
    const missed = c.paidThisTurn < Math.min(c.statementMinimum, c.statementTotal);
    if (missed) {
      lateFee = lateFeeFor(c.statementTotal, c.consecutiveMissed);
      c.consecutiveMissed += 1;
      c.everMissed = true;
      note(s, `卡費沒繳到最低應繳，被收違約金 NT$${lateFee.toLocaleString("en-US")}。`);
    } else c.consecutiveMissed = 0;
  }
  const carry = applyPayment(
    { olderPrincipal: c.olderPrincipal, lastMonthPrincipal: c.lastMonthPrincipal, unpaidInterest: c.unpaidInterest },
    c.statementInterest,
    c.statementNewCharge,
    c.paidThisTurn,
    lateFee,
  );
  // The 違約金 is spending (a fee), owed on the card.
  spend(s, lateFee);
  const interest = interestOn(carry);
  spend(s, interest);
  if (carry.olderPrincipal + carry.lastMonthPrincipal > 0) c.everRevolved = true;
  const total = carry.olderPrincipal + carry.lastMonthPrincipal + carry.unpaidInterest + interest + c.chargesThisTurn;
  c.olderPrincipal = carry.olderPrincipal;
  c.lastMonthPrincipal = carry.lastMonthPrincipal;
  c.unpaidInterest = carry.unpaidInterest;
  c.statementInterest = interest;
  c.statementNewCharge = c.chargesThisTurn;
  c.statementTotal = total;
  c.statementMinimum = total > 0 ? Math.min(minimumPaymentFor(total), total) : 0;
  c.paidThisTurn = 0;
  c.chargesThisTurn = 0;
  if (interest > 0) note(s, `這期卡費有循環利息 NT$${interest.toLocaleString("en-US")}。`);
  // The game's record starts from the profile's and only worsens (02 §3.6).
  const derived: CreditRecordValue = c.everMissed ? "poor" : c.everRevolved ? "fair" : "good";
  const rank = { good: 0, fair: 1, poor: 2 } as const;
  if (rank[derived] > rank[s.creditRecord]) s.creditRecord = derived;
}

function monthEnd(s: LifeState, ctx: GameContext): void {
  settleCard(s);

  // Interest on end balances (02 §3.4). 定存 interest is paid monthly into
  // 活存 (按月領息); the 房屋基金 keeps its own.
  let interest = roundMoney((s.accounts.demand * DEMAND_RATE) / 12);
  for (const d of s.accounts.timeDeposits) interest += roundMoney((d.amount * TIME_DEPOSIT_RATE) / 12);
  const hfInterest = roundMoney((s.accounts.housingFund * HOUSING_FUND_RATE) / 12);
  s.accounts.demand += interest;
  s.accounts.housingFund += hfInterest;
  const earned = interest + hfInterest;
  s.pending.flows.interest += earned;

  // Matured 定存 (12 months) move to 活存.
  const matured = s.accounts.timeDeposits.filter((d) => s.turn + 1 - d.startTurn >= TIME_DEPOSIT_TERM);
  if (matured.length) {
    s.accounts.timeDeposits = s.accounts.timeDeposits.filter((d) => s.turn + 1 - d.startTurn < TIME_DEPOSIT_TERM);
    for (const d of matured) s.accounts.demand += d.amount;
    note(s, "有一筆定存到期了，本金轉回活存。");
  }

  // Dividends, on the month's closing value, into 活存.
  const month = calendarMonth(s.turn);
  let dividends = 0;
  for (const fund of ["etfBroad", "etfDividend"] as Fund[]) {
    const y = DIVIDEND_YIELD[fund];
    if (y.months.includes(month)) dividends += roundMoney((mv(s, fund, true) * y.rate) / y.months.length);
  }
  if (dividends > 0) {
    s.accounts.demand += dividends;
    s.pending.flows.dividends += dividends;
    note(s, `ETF 配息 NT$${dividends.toLocaleString("en-US")}，進了活存。`);
  }
  s.dividends12 = [...s.dividends12, dividends].slice(-12);

  // Skills, unemployment.
  for (const k of s.skills) {
    if (k.monthsLeft > 0) {
      k.monthsLeft -= 1;
      if (k.monthsLeft === 0) {
        k.doneTurn = s.turn;
        note(s, "你學完了一項技能，下次調薪的機會變大了。");
      }
    }
  }
  if (s.jobless) {
    s.jobless.turnsLeft -= 1;
    if (s.jobless.turnsLeft <= 0) {
      s.jobless = null;
      note(s, "你找到新工作了，下個月恢復領薪水。");
    }
  }
  s.ageMonths += 1;

  s.stats = computeStats(s, ctx, s.pending, earned, true);
  s.pending.ledger.cashEnd = s.accounts.cash;

  const ledgerTurn = (s.turn + 1) % LEDGER_EVERY === 0 && !s.pending.autopilot;
  s.phase = ledgerTurn ? "ledger" : s.phase;
  if (!ledgerTurn) finishTurn(s, ctx);
}

function computeStats(s: LifeState, ctx: GameContext, p: Pending, interestThisMonth: number, afterMove = false) {
  const ef = efMonths(s, billCtx(ctx));
  const netPayRef = s.jobless ? s.jobless.benefit : payslipFor(s.job.grossMonthly, s.pension.rate).net;
  const { score } = stressParts({
    efMonths: ef,
    cardRevolving: cardRevolving(s),
    debtPayments: monthlyDebtPayments(s),
    netPay: netPayRef,
    overdue: s.debts.overdueBills > 0,
    bigEventHit: p.bigEventHit,
    coveredByInsurance: p.coveredByInsurance,
    gave: p.gaveThisTurn,
    adjust: p.stressAdjust,
  });
  return {
    stress: score,
    efMonths: ef,
    freedomPct: freedomPct(interestThisMonth, s.dividends12, s.job.grossMonthly),
    netWorth: netWorth(s, s.turn + (afterMove ? 1 : 0)).total,
  };
}

/** Inputs for the stress breakdown shown on screen (same numbers as stats). */
export function stressInputs(s: LifeState, ctx: GameContext) {
  return {
    efMonths: efMonths(s, billCtx(ctx)),
    cardRevolving: cardRevolving(s),
    debtPayments: monthlyDebtPayments(s),
    netPay: s.jobless ? s.jobless.benefit : payslipFor(s.job.grossMonthly, s.pension.rate).net,
    overdue: s.debts.overdueBills > 0,
    bigEventHit: s.pending.bigEventHit,
    coveredByInsurance: s.pending.coveredByInsurance,
    gave: s.pending.gaveThisTurn,
    adjust: s.pending.stressAdjust,
  };
}

function finishTurn(s: LifeState, ctx: GameContext): void {
  const p = s.pending;
  s.history.push({
    turn: s.turn,
    calendarMonth: calendarMonth(s.turn),
    flows: p.flows,
    ledger: { ...p.ledger, cashEnd: s.accounts.cash },
    billsTotal: p.billsTotal,
    wants: p.wants,
    savedFirst: p.savedFirst,
    tookBackSaving: p.tookBackSaving,
    overdueCreated: p.overdueCreated,
    events: p.resolved,
    netWorthStart: p.netWorthStart,
    netWorthEnd: s.stats.netWorth,
    etfReturn: p.etfReturn,
    stress: s.stats.stress,
    notes: p.notes,
    ledgerScore: p.ledgerScore,
    ledgerChecked: p.ledgerChecked,
    autopilot: p.autopilot,
  });
  compactHistory(s);
  if (p.ledgerScore !== null) s.flags.lastLedgerTurn = s.turn;

  s.turn += 1;
  // Choices made this turn take effect now.
  if (s.insuranceNext) {
    s.insurance = s.insuranceNext;
    s.insuranceNext = null;
  }
  if (s.moveOutNext) {
    s.housing = s.moveOutNext;
    s.rentExtra = 0;
    s.moveOutNext = null;
  }
  s.phase = "payday";
  s.pending = freshPending(s);
  void ctx;
}

/** Keep the last 36 turns in full; summarise older ones by year (02 §2). */
function compactHistory(s: LifeState): void {
  while (s.history.length > HISTORY_FULL_TURNS + 12) {
    const year = s.history.splice(0, 12);
    s.years.push({
      fromTurn: year[0].turn,
      toTurn: year[year.length - 1].turn,
      income: year.reduce((a, h) => a + h.flows.netPay + h.flows.sideProfit + h.flows.otherIncome, 0),
      spending: year.reduce((a, h) => a + h.flows.spending, 0),
      netWorthEnd: year[year.length - 1].netWorthEnd,
    });
  }
}

// --- ledger (02 §4.1) ------------------------------------------------------------------

export const LEDGER_HINTS: Record<keyof LedgerCells, string> = {
  cashStart: "月初現金是上個月月底留下的現金。",
  income: "收入是實發金額，不是應發；這個月拿到的獎金、還款也算。",
  saved: "存錢是月初先存的錢，扣掉後來拿回來付帳單的部分。",
  bills: "帳單是這個月用現金付掉的部分，包括生活風格的想要花費；刷卡和沒繳的不算。",
  actions: "行動是這個月做的選擇花掉的現金，賣出拿回的要扣掉。",
  events: "事件是人生事件用現金付掉的錢。",
  cashEnd: "月底現金 = 月初 + 收入 − 存錢 − 帳單 − 行動 − 事件。",
};

const LEDGER_KEYS = Object.keys(LEDGER_HINTS) as (keyof LedgerCells)[];

function doLedger(s: LifeState, ctx: GameContext, cells: Partial<LedgerCells>): void {
  const answer = s.pending.ledger;
  const checked: Record<string, { ok: boolean; hint: string }> = {};
  let right = 0;
  for (const k of LEDGER_KEYS) {
    const ok = cells[k] === answer[k];
    if (ok) right++;
    checked[k] = { ok, hint: ok ? "" : LEDGER_HINTS[k] };
  }
  s.pending.ledgerTries += 1;
  s.pending.ledgerChecked = checked;
  if (right === LEDGER_KEYS.length || s.pending.ledgerTries >= LEDGER_TRIES) {
    s.pending.ledgerScore = right / LEDGER_KEYS.length;
    finishTurn(s, ctx);
  }
}

// --- public entry points --------------------------------------------------------------

/**
 * Apply one Action. Returns a new state, or an error and the unchanged state
 * stays as it was. Never trusts a number from the browser beyond the
 * amounts the student chose, each of which is checked against balances.
 */
export function applyAction(state: LifeState, action: Action, ctx: GameContext): ApplyResult {
  const s = structuredClone(state);
  const wrong = (expected: LifeState["phase"]) =>
    ({ ok: false, error: "wrong_phase", detail: `expected ${expected}, at ${s.phase}` }) as const;

  switch (action.type) {
    case "collectPay":
      if (s.phase !== "payday") return wrong("payday");
      doPayday(s);
      break;
    case "saveFirst":
      if (s.phase !== "saveFirst") return wrong("saveFirst");
      doSaveFirst(s, action.amount, action.remember ?? false);
      break;
    case "payBills":
      if (s.phase !== "bills") return wrong("bills");
      // An explicit empty list means "cover nothing": the shortfall becomes a
      // 欠款. Omitted means the default order (02 §4 step 3).
      doPayBills(s, ctx, action.cover ?? DEFAULT_COVER);
      break;
    case "lifestyle":
      if (s.phase !== "lifestyle") return wrong("lifestyle");
      doLifestyle(s, action.level);
      break;
    case "actions": {
      if (s.phase !== "actions") return wrong("actions");
      const err = doActions(s, ctx, action.moves);
      if (err) return err;
      break;
    }
    case "events": {
      if (s.phase !== "event") return wrong("event");
      const err = doEvents(s, ctx, action.choices);
      if (err) return err;
      break;
    }
    case "ledger":
      if (s.phase !== "ledger") return wrong("ledger");
      doLedger(s, ctx, action.cells);
      break;
    case "fastForward": {
      if (s.phase !== "payday") return wrong("payday");
      if (!s.unlocked.includes("fastForward")) return { ok: false, error: "locked", detail: "fastForward" };
      return { ok: true, state: LifeStateSchema.parse(runAutopilot(s, ctx, FAST_FORWARD_TURNS)) };
    }
  }
  return { ok: true, state: LifeStateSchema.parse(s) };
}

/**
 * Autopilot (02 §4): the standing plan each month, choice events take the
 * safest option, no ledger. Stops early if stress reaches 高 or a 欠款
 * appears. Also used by the Monte Carlo tests.
 */
export function runAutopilot(
  state: LifeState,
  ctx: GameContext,
  turns: number,
  opts: {
    stopEarly?: boolean;
    moves?: (s: LifeState) => ActionsPayload;
    choose?: (s: LifeState, e: PendingEvent) => string;
    lifestyle?: (s: LifeState) => LifestyleLevel;
  } = {},
): LifeState {
  let s = structuredClone(state);
  const stopEarly = opts.stopEarly ?? true;
  for (let i = 0; i < turns; i++) {
    s.pending.autopilot = true;
    doPayday(s);
    doSaveFirst(s, s.plan.saveFirst, false);
    doPayBills(s, ctx, DEFAULT_COVER);
    // The student's last 生活風格 choice, unless a test picks one.
    doLifestyle(s, opts.lifestyle ? opts.lifestyle(s) : s.lifestyle.last);
    // Autopilot pays the card statement in full when cash allows (the safe
    // choice, 02 §4 fast-forward), on top of the minimum the bills paid.
    const due = Math.max(s.debts.card.statementTotal - s.debts.card.paidThisTurn, 0);
    const planned = opts.moves ? opts.moves(s) : {};
    const moves = planned.cardRepay !== undefined || due === 0
      ? planned
      : { ...planned, cardRepay: Math.min(due, Math.max(s.accounts.cash - (planned.etfBroad ?? 0) - (planned.demand ?? 0), 0)) };
    const err = doActions(s, ctx, { ...moves, confirmReadiness: true });
    if (err) {
      // A planned move did not fit this month: run with the standing plan only.
      doActions(s, ctx, { confirmReadiness: true });
    }
    const choices: Record<string, { option: string }> = {};
    for (const e of s.pending.events) {
      if (isChoiceEvent(e.id)) choices[e.key] = { option: opts.choose ? opts.choose(s, e) : SAFEST_OPTION[e.id] };
    }
    const evErr = doEvents(s, ctx, choices);
    if (evErr && !evErr.ok) throw new Error(`autopilot event failed: ${evErr.error}`);
    if (s.phase === "ledger") finishTurn(s, ctx);
    s = structuredClone(s);
    if (stopEarly && (s.stats.stress >= 65 || s.debts.overdueBills > 0)) break;
  }
  return s;
}

/** The state as the browser may see it (hidden rolls and the seed removed). */
export function publicState(s: LifeState): PublicLifeState {
  const { seed: _seed, receivables, debts, ...rest } = s;
  void _seed;
  // During the ledger check the answers stay on the server (the student is
  // filling them in); past turns' answers are in history as usual.
  const ledgerSafe = s.phase === "ledger" ? { ...rest.pending, ledger: hiddenLedger(rest.pending.ledger) } : rest.pending;
  // The friend-loan clue count is a direct hint at the hidden repayment roll.
  const pending = {
    ...ledgerSafe,
    events: ledgerSafe.events.map((e) => {
      if (!("good" in e.vars)) return e;
      const vars = { ...e.vars };
      delete vars.good;
      return { ...e, vars };
    }),
  };
  return {
    ...rest,
    pending,
    receivables: receivables.map((r) => ({ from: r.from, amount: r.amount, dueTurn: r.dueTurn })),
    debts: { ...debts, guarantee: debts.guarantee ? { amount: debts.guarantee.amount } : null },
  };
}

function hiddenLedger(l: LedgerCells): LedgerCells {
  // Only the opening cash is shown (the student needs it as the starting row).
  return { cashStart: l.cashStart, income: 0, saved: 0, bills: 0, actions: 0, events: 0, cashEnd: 0 };
}

/** Is a payday-phase cash identity still exact? (used by tests and the API as a guard) */
export function ledgerBalances(p: Pending, cashNow: number): boolean {
  const l = p.ledger;
  return l.cashStart + l.income - l.saved - l.bills - l.actions - l.events === cashNow;
}

export { etfValue, installmentPayment };
