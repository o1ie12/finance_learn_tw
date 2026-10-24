/**
 * The life game's required tests (02-LIFE-GAME §9, tests 1 to 12).
 *
 * Test 13 (hidden tab) needs a browser and lives with the UI tests.
 *
 * Each test pins one rule and fails when that rule is removed from the
 * engine. Where a test edits a state object directly between actions (to
 * inject card charges, force an event, or set a balance), it is a scripted
 * harness: it sets up the situation the rule is about, then lets the engine
 * apply the rule through its public entry points.
 *
 * Runs with Node's built-in runner through tsx: `npx tsx --test tests/lifeGame.test.ts`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  applyAction,
  newGame,
  runAutopilot,
  syncWithContext,
  isChoiceEvent,
  STARTER_JOB_IDS,
  type ApplyResult,
  type GameContext,
} from "@/lib/lifeGame/engine";
import { handleAction } from "@/lib/lifeGame/api";
import { priceAt, biggestMonthlyFall, SERIES_LENGTH } from "@/lib/lifeGame/prices";
import { stressParts, stressLevel, type StressInput } from "@/lib/lifeGame/stats";
import { unlockedMoves, LINE_UNLOCKS, START_MOVES } from "@/lib/lifeGame/unlocks";
import { payslipFor } from "@/lib/lifeGame/payroll";
import { mulberry32 } from "@/lib/lifeGame/rng";
import {
  BILL_SOURCES,
  LifeStateSchema,
  type Action,
  type ActionsPayload,
  type BillSource,
  type LifeState,
  type PendingEvent,
  type TurnRecord,
} from "@/lib/lifeGame/types";
import { computeCreditCard, NO_CARRY, ROUNDS } from "@/lib/sims/creditCard";
import { parseSimResult, readStoredResult, creditRecordOf } from "@/lib/sims/types";
import { SEED_ROWS } from "@/lib/historicalPricesSeed";

// --- helpers -----------------------------------------------------------------------

const EMPTY_CTX: GameContext = { completed: new Set(), profile: {}, studentLoanMonthly: null };
const ALL_LINES = Object.keys(LINE_UNLOCKS);
/** Every line done, no 職涯線 profile (so a starter job), a 學貸 repayment from turn 24. */
const ALL_CTX: GameContext = { completed: new Set(ALL_LINES), profile: {}, studentLoanMonthly: 3_000 };

function ok(r: ApplyResult | ReturnType<typeof handleAction>, what = ""): LifeState {
  if (!r.ok) assert.fail(`${what} refused: ${r.error} ${"detail" in r ? (r.detail ?? "") : ""}`);
  return r.state;
}

function step(s: LifeState, action: Action, ctx: GameContext): LifeState {
  const next = ok(applyAction(s, action, ctx), action.type);
  // Tests written before 生活風格 (05 Part B) go straight on with 普通.
  return action.type === "payBills" ? ok(applyAction(next, { type: "lifestyle", level: "normal" }, ctx), "lifestyle") : next;
}

/** Choice options per choice event, risky ones first. */
const OPTIONS: Record<string, string[]> = {
  birthday: ["go", "skip"],
  concert: ["buy", "skip"],
  japan_trip: ["go", "short", "skip"],
  new_phone: ["installment", "cash", "wait"],
  mood_buy: ["buy", "gates", "close"],
  scam_msg: ["click", "ignore", "call165"],
  friend_loan: ["lend", "half", "no"],
  guarantor: ["yes", "no"],
  family_help: ["give5000", "give2000", "no"],
  rent_up: ["move", "accept"],
  course_sale: ["buy", "skip"],
  market_drop: ["sellAll", "add", "hold"],
  bonus: ["half", "spend", "invest", "save"],
};

type Choice = { option: string; payWith?: "cash" | "card"; amount?: number };

/** A risky player: random moves, random bill cover, mostly risky event options. */
function riskyPolicy(policySeed: number) {
  const r = mulberry32(policySeed);
  const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(r() * xs.length)];
  return {
    saveFirst(s: LifeState): number {
      const cash = Math.max(s.accounts.cash, 0);
      const x = r();
      // Sometimes save everything, so the bills come up short.
      return x < 0.25 ? cash : x < 0.5 ? 0 : x < 0.75 ? s.plan.saveFirst : Math.floor(cash * r());
    },
    cover(): BillSource[] {
      const xs = [...BILL_SOURCES].sort(() => r() - 0.5);
      return r() < 0.2 ? [] : xs.slice(0, 1 + Math.floor(r() * xs.length));
    },
    moves(s: LifeState): ActionsPayload {
      const m: ActionsPayload = {};
      const cash = Math.max(s.accounts.cash, 0);
      const f = (n: number) => Math.floor(n);
      if (r() < 0.3) m.etfBroad = f(cash * r() * 0.6);
      if (r() < 0.15) m.etfDividend = f(cash * r() * 0.3);
      if (r() < 0.15 && s.holdings.etfBroad.units > 0) m.sellBroadUnits = s.holdings.etfBroad.units * r();
      if (r() < 0.1 && s.holdings.etfDividend.units > 0) m.sellDividendUnits = s.holdings.etfDividend.units;
      if (r() < 0.1) m.timeDeposit = f(cash * 0.2);
      if (r() < 0.1 && s.accounts.timeDeposits.length) m.breakDeposit = 0;
      if (r() < 0.1) m.withdrawDemand = f(s.accounts.demand * r());
      if (r() < 0.1) m.demand = f(cash * 0.1);
      if (r() < 0.05) m.housingFund = f(cash * 0.1);
      const owed = s.debts.card.statementTotal - s.debts.card.paidThisTurn;
      if (r() < 0.3 && owed > 0) m.cardRepay = f(owed * r());
      if (r() < 0.1) m.give = 500;
      if (r() < 0.06 && !s.sideBusiness?.active) m.startSideBusiness = true;
      if (r() < 0.05) m.startSkill = true;
      if (r() < 0.1) m.insurance = { medical: r() < 0.5, accident: r() < 0.5, life: r() < 0.2 };
      if (r() < 0.02) m.moveOut = pick(["shared", "studio"] as const);
      if (r() < 0.1) m.bills = { food: 6_000 + f(r() * 9_000), daily: 800 + f(r() * 2_200), transport: pick(["tpass", "bike"] as const) };
      if (r() < 0.1) m.plan = { saveFirst: f(r() * 8_000), etfMonthly: r() < 0.5 ? 0 : 1_000 + f(r() * 4_000), givingMonthly: r() < 0.3 ? 300 : 0 };
      if (r() < 0.05) m.pensionRate = pick([0, 0.03, 0.06]);
      return m;
    },
    lifestyle(): "save" | "normal" | "enjoy" {
      return pick(["save", "normal", "enjoy"] as const);
    },
    choice(s: LifeState, e: PendingEvent): Choice {
      const opts = OPTIONS[e.id];
      const option = r() < 0.7 ? opts[0] : pick(opts);
      const c: Choice = { option };
      if (e.id === "concert" && r() < 0.7) c.payWith = "card";
      if (e.id === "market_drop" && option === "add") c.amount = Math.floor(Math.max(s.accounts.cash, 0) * r());
      return c;
    },
    ledgerCells(s: LifeState) {
      const right = { ...s.pending.ledger };
      if (r() < 0.5) right.events += 1; // a wrong try now and then
      return right;
    },
  };
}

interface StepStats {
  refusedMoves: number;
}

/** One full turn through applyAction, every step the way the browser sends it. */
function playTurn(s: LifeState, ctx: GameContext, p: ReturnType<typeof riskyPolicy>, stats?: StepStats): LifeState {
  s = step(s, { type: "collectPay" }, ctx);
  s = step(s, { type: "saveFirst", amount: p.saveFirst(s) }, ctx);
  s = ok(applyAction(s, { type: "payBills", cover: p.cover() }, ctx), "payBills");
  s = ok(applyAction(s, { type: "lifestyle", level: p.lifestyle() }, ctx), "lifestyle");
  const moves = p.moves(s);
  let res = applyAction(s, { type: "actions", moves }, ctx);
  if (!res.ok && res.error === "readiness") res = applyAction(s, { type: "actions", moves: { ...moves, confirmReadiness: true } }, ctx);
  if (!res.ok) {
    if (stats) stats.refusedMoves++;
    res = applyAction(s, { type: "actions", moves: {} }, ctx);
  }
  s = ok(res, "actions");
  const choices: Record<string, Choice> = {};
  for (const e of s.pending.events) if (isChoiceEvent(e.id)) choices[e.key] = p.choice(s, e);
  s = step(s, { type: "events", choices }, ctx);
  while (s.phase === "ledger") s = step(s, { type: "ledger", cells: p.ledgerCells(s) }, ctx);
  assert.equal(s.phase, "payday");
  return s;
}

const median = (xs: number[]) => {
  const a = [...xs].sort((x, y) => x - y);
  return a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
};

// --- 1. determinism ----------------------------------------------------------------------

test("life game 1: same seed and choices give identical states after 24 turns", () => {
  const play = (seed: number) => {
    const p = riskyPolicy(99);
    let s = newGame(seed, ALL_CTX);
    for (let t = 0; t < 24; t++) s = playTurn(s, ALL_CTX, p);
    return s;
  };
  const a = play(12345);
  const b = play(12345);
  assert.equal(a.turn, 24);
  assert.deepEqual(a, b);
  // The seed matters: another seed, same choices, is a different life.
  assert.notDeepEqual(play(54321).history, a.history);

  const auto = (seed: number) => runAutopilot(newGame(seed, ALL_CTX), ALL_CTX, 24, { stopEarly: false });
  const x = auto(777);
  assert.equal(x.turn, 24);
  assert.deepEqual(x, auto(777));
});

// --- 2. save first -------------------------------------------------------------------------

test("life game 2: saving comes out before bills, and net pay − saved = money available", () => {
  const ctx = ALL_CTX;
  let s = newGame(2024, ctx);
  const save = [0, 3_000, 6_400, 10_000, 100_000_000]; // the last one: everything
  for (let t = 0; t < 24; t++) {
    // Bills and saving cannot run before payday; bills cannot run before saving.
    assert.equal(applyAction(s, { type: "payBills" }, ctx).ok, false);
    assert.deepEqual(
      (applyAction(s, { type: "saveFirst", amount: 100 }, ctx) as { error: string }).error,
      "wrong_phase",
    );
    s = step(s, { type: "collectPay" }, ctx);
    const early = applyAction(s, { type: "payBills" }, ctx);
    assert.equal(early.ok, false);
    assert.equal((early as { error: string }).error, "wrong_phase");

    const cashStart = s.pending.cashStart;
    const netPay = s.pending.flows.netPay;
    assert.equal(netPay, payslipFor(s.job.grossMonthly, s.pension.rate).net);
    const want = save[t % save.length];
    s = step(s, { type: "saveFirst", amount: want }, ctx);
    const saved = s.pending.savedFirst;
    assert.equal(saved, Math.min(want, cashStart + netPay));
    // What the bill step starts from.
    assert.equal(s.phase, "bills");
    assert.equal(s.accounts.cash, cashStart + netPay - saved);
    const l = s.pending.ledger;
    assert.equal(l.income, netPay);
    assert.equal(l.saved, saved);
    assert.equal(l.income - l.saved, l.cashEnd - l.cashStart, "net pay − saved = money available");
    assert.equal(l.bills + l.actions + l.events, 0, "nothing paid before saving");

    s = step(s, { type: "payBills" }, ctx);
    s = step(s, { type: "actions", moves: {} }, ctx);
    const choices: Record<string, Choice> = {};
    for (const e of s.pending.events) if (isChoiceEvent(e.id)) choices[e.key] = { option: e.id === "bonus" ? "spend" : OPTIONS[e.id].at(-1)! };
    s = step(s, { type: "events", choices }, ctx);
    if (s.phase === "ledger") s = step(s, { type: "ledger", cells: s.pending.ledger }, ctx);

    const h = s.history.at(-1)!;
    assert.equal(h.turn, t);
    assert.equal(h.savedFirst, saved);
    // The summary: what came in minus what was saved is what bills, moves
    // and events had to work with.
    const L = h.ledger;
    assert.equal(L.cashStart + L.income - L.saved, L.cashEnd + L.bills + L.actions + L.events);
    if (h.events.every((e) => e.paid === 0 && e.gain === 0)) {
      assert.equal(L.income, h.flows.netPay + h.flows.sideProfit + h.flows.otherIncome);
      assert.equal(L.saved, h.savedFirst - h.tookBackSaving);
    }
  }
  // Saving everything leaves the bills short, and the saving is taken back.
  assert.ok(s.history.some((h) => h.tookBackSaving > 0), "a too-big saving was taken back");
});

// --- 3. no money from nowhere ----------------------------------------------------------

function checkRecord(h: TurnRecord, prev: TurnRecord | undefined, label: string) {
  const f = h.flows;
  const where = `${label} turn ${h.turn}`;
  for (const [k, v] of Object.entries({ ...f, ...h.ledger, nwS: h.netWorthStart, nwE: h.netWorthEnd })) {
    assert.ok(Number.isInteger(v), `${where}: ${k} = ${v} is not whole NT$`);
  }
  assert.equal(
    h.netWorthEnd - h.netWorthStart,
    f.netPay + f.sideProfit + f.otherIncome - f.spending + f.interest + f.dividends + f.marketChange - f.writeOffs,
    `${where}: net worth change ≠ flows ${JSON.stringify(f)}`,
  );
  const L = h.ledger;
  assert.equal(L.cashStart + L.income - L.saved - L.bills - L.actions - L.events, L.cashEnd, `${where}: cash ledger ${JSON.stringify(L)}`);
  if (prev) {
    assert.equal(h.turn, prev.turn + 1);
    assert.equal(h.netWorthStart, prev.netWorthEnd, `${where}: net worth moved between turns`);
    assert.equal(L.cashStart, prev.ledger.cashEnd, `${where}: cash moved between turns`);
  }
}

test("life game 3: every turn, net worth change = income − spending + interest + dividends + market − write-offs", () => {
  const seen = {
    writeOff: 0, guaranteeCalled: 0, friendDefault: 0, sellAll: 0, addOnDrop: 0, installment: 0,
    cardInterest: 0, cardCovered: 0, overdue: 0, sideLoss: 0, depositBroken: 0, tookBack: 0, dividends: 0,
    bonusHalf: 0, moved: 0, studentLoan: 0, turns: 0,
  };
  const stats: StepStats = { refusedMoves: 0 };
  for (let seed = 1; seed <= 110; seed++) {
    const p = riskyPolicy(seed * 7919);
    let s = newGame(seed, ALL_CTX);
    // guarantor is rare (1% a month), so every fifth seed is offered it on
    // turn 0 and signs; the call or release comes 6 to 18 turns later.
    let prev: TurnRecord | undefined;
    for (let t = 0; t < 36; t++) {
      const interestBefore = s.debts.card.statementInterest;
      if (interestBefore > 0) seen.cardInterest++;
      if (seed % 5 === 0 && t === 0) {
        s = step(s, { type: "collectPay" }, ALL_CTX);
        s = step(s, { type: "saveFirst", amount: 0 }, ALL_CTX);
        s = step(s, { type: "payBills" }, ALL_CTX);
        s = step(s, { type: "actions", moves: {} }, ALL_CTX);
        s.pending.events = [{ key: "guarantor", id: "guarantor", vars: {} }];
        s = step(s, { type: "events", choices: { guarantor: { option: "yes" } } }, ALL_CTX);
      } else {
        s = playTurn(s, ALL_CTX, p, stats);
      }
      const h = s.history.at(-1)!;
      checkRecord(h, prev, `seed ${seed}`);
      assert.equal(s.accounts.cash, h.ledger.cashEnd);
      prev = h;
      seen.turns++;
      if (h.flows.writeOffs > 0) seen.writeOff++;
      if (h.events.some((e) => e.id === "guarantee_called")) seen.guaranteeCalled++;
      if (h.events.some((e) => e.id === "friend_default")) seen.friendDefault++;
      if (h.events.some((e) => e.id === "market_drop" && e.option === "sellAll")) seen.sellAll++;
      if (h.events.some((e) => e.id === "market_drop" && e.option === "add")) seen.addOnDrop++;
      if (h.events.some((e) => e.id === "new_phone" && e.option === "installment")) seen.installment++;
      if (h.events.some((e) => e.id === "bonus" && e.option === "half")) seen.bonusHalf++;
      if (h.overdueCreated > 0) seen.overdue++;
      if (h.flows.sideProfit < 0) seen.sideLoss++;
      if (h.flows.interest < 0) seen.depositBroken++;
      if (h.tookBackSaving > 0) seen.tookBack++;
      if (h.flows.dividends > 0) seen.dividends++;
      if (s.debts.card.statementNewCharge > 0) seen.cardCovered++;
      if (s.housing !== "family") seen.moved++;
      if (s.turn > 24 && ALL_CTX.studentLoanMonthly) seen.studentLoan++;
    }
    LifeStateSchema.parse(s);
  }
  // The run went through the risky corners, not around them.
  for (const [k, v] of Object.entries(seen)) assert.ok(v > 0, `the risky run never hit ${k}`);
  assert.ok(seen.turns >= 100 * 36);
});

// --- 4. card interest ----------------------------------------------------------------------

test("life game 4: a minimum-payment card run matches 信用線's hand-checked numbers", () => {
  const ctx: GameContext = { completed: new Set(["xinyong"]), profile: {}, studentLoanMonthly: null };
  const sim = computeCreditCard(["minimum", "minimum", "minimum"]);
  assert.deepEqual(sim.rounds.map((r) => r.interestAccrued), [0, 133, 142]);
  assert.deepEqual(sim.rounds.map((r) => r.minimumPayment), [800, 1100, 1500]);

  let s = newGame(4, ctx);
  assert.ok(s.unlocked.includes("card"));
  const statements: { interest: number; total: number; minimum: number }[] = [];
  const paid: number[] = [];
  for (let t = 0; t < 3; t++) {
    s = step(s, { type: "collectPay" }, ctx);
    s = step(s, { type: "saveFirst", amount: 0 }, ctx);
    s = step(s, { type: "payBills" }, ctx); // pays the card's minimum, nothing more
    paid.push(s.debts.card.paidThisTurn);
    s = step(s, { type: "actions", moves: {} }, ctx);
    // Harness: this month's card spending, the 信用線 rounds' charges.
    s.debts.card.chargesThisTurn += ROUNDS[t].newCharge;
    const choices: Record<string, Choice> = {};
    for (const e of s.pending.events) if (isChoiceEvent(e.id)) choices[e.key] = { option: OPTIONS[e.id].at(-1)! };
    s = step(s, { type: "events", choices }, ctx);
    if (s.phase === "ledger") s = step(s, { type: "ledger", cells: s.pending.ledger }, ctx);
    const c = s.debts.card;
    statements.push({ interest: c.statementInterest, total: c.statementTotal, minimum: c.statementMinimum });
  }
  assert.deepEqual(statements.map((x) => x.interest), [0, 133, 142]);
  assert.deepEqual(statements.map((x) => x.minimum), [800, 1100, 1500]);
  assert.deepEqual(statements.map((x) => x.total), sim.rounds.map((r) => r.totalOwed));
  // The game paid exactly the minimum each month after the first statement.
  assert.deepEqual(paid, [0, 800, 1100]);
  assert.equal(s.creditRecord, "fair");
});

// --- 5. insurance ------------------------------------------------------------------------

function eventTurn(eventId: string, insurance: LifeState["insurance"]) {
  let s = newGame(5, ALL_CTX);
  s = step(s, { type: "collectPay" }, ALL_CTX);
  s = step(s, { type: "saveFirst", amount: 0 }, ALL_CTX);
  s = step(s, { type: "payBills" }, ALL_CTX);
  s = step(s, { type: "actions", moves: {} }, ALL_CTX);
  assert.equal(s.phase, "event");
  // Harness: the policies in force and enough cash, then exactly this event.
  s.insurance = insurance;
  s.accounts.cash += 50_000;
  s.pending.events = [{ key: eventId, id: eventId, vars: {} }];
  const cashBefore = s.accounts.cash;
  const spendBefore = s.pending.flows.spending;
  s = step(s, { type: "events", choices: {} }, ALL_CTX);
  const r = s.history.at(-1)!.events.find((e) => e.id === eventId)!;
  return { r, cashPaid: cashBefore - s.accounts.cash, spent: s.history.at(-1)!.flows.spending - spendBefore };
}

test("life game 5: 醫療險 pays 90% of hospital; nothing covers a broken phone", () => {
  const none = { medical: false, accident: false, life: false };
  const all = { medical: true, accident: true, life: true };

  const covered = eventTurn("hospital", { ...none, medical: true });
  assert.equal(covered.r.cost, 30_000);
  assert.equal(covered.r.paid, 3_000);
  assert.equal(covered.r.covered, 27_000);
  assert.equal(covered.cashPaid, 3_000);
  assert.equal(covered.spent, 3_000);

  const bare = eventTurn("hospital", none);
  assert.equal(bare.r.paid, 30_000);
  assert.equal(bare.r.covered, 0);
  assert.equal(bare.cashPaid, 30_000);

  // Other policies do not pay a hospital stay.
  assert.equal(eventTurn("hospital", { medical: false, accident: true, life: true }).r.paid, 30_000);

  const phone = eventTurn("phone_break", all);
  assert.equal(phone.r.paid, 6_000);
  assert.equal(phone.r.covered, 0);
  assert.equal(phone.cashPaid, 6_000);

  // 意外險 pays 100% of the accident.
  assert.equal(eventTurn("accident", { ...none, accident: true }).r.paid, 0);
  assert.equal(eventTurn("accident", none).r.paid, 12_000);
});

// --- 6. readiness ------------------------------------------------------------------------

function atActions(seed: number, ctx: GameContext): LifeState {
  let s = newGame(seed, ctx);
  s = step(s, { type: "collectPay" }, ctx);
  s = step(s, { type: "saveFirst", amount: 0 }, ctx);
  s = step(s, { type: "payBills" }, ctx);
  assert.equal(s.phase, "actions");
  return s;
}

test("life game 6: the first ETF buy with card debt warns; ready students buy straight away", () => {
  const ctx: GameContext = { completed: new Set(["touzi", "xinyong"]), profile: {}, studentLoanMonthly: null };

  // Card debt revolving, emergency fund already over a month.
  const debt = atActions(6, ctx);
  debt.debts.card.olderPrincipal = 5_000; // harness: a revolving balance
  debt.accounts.demand = 30_000; // harness: a fund over a month (生活風格 spending leaves less cash)
  const warned = applyAction(debt, { type: "actions", moves: { etfBroad: 2_000 } }, ctx);
  assert.equal(warned.ok, false);
  if (warned.ok) return;
  assert.equal(warned.error, "readiness");
  assert.equal(warned.needsConfirm?.kind, "readiness");
  assert.match(warned.needsConfirm!.reason, /卡債/);
  assert.doesNotMatch(warned.needsConfirm!.reason, /緊急預備金/, "fund is over a month here");
  // Refused means nothing changed.
  assert.equal(debt.holdings.etfBroad.units, 0);

  const went = ok(applyAction(debt, { type: "actions", moves: { etfBroad: 2_000, confirmReadiness: true } }, ctx));
  assert.ok(went.holdings.etfBroad.units > 0);
  assert.equal(went.readiness.warned, true);
  assert.equal(went.readiness.proceeded, true);
  assert.equal(went.readiness.turn, 0);
  assert.match(went.readiness.reason!, /卡債/);

  // No debt, fund at least a month: buys, no warning.
  const ready = atActions(6, ctx);
  ready.accounts.demand += 20_000; // harness: a fund well over one month
  const bought = applyAction(ready, { type: "actions", moves: { etfBroad: 2_000 } }, ctx);
  assert.equal(bought.ok, true);
  if (!bought.ok) return;
  assert.ok(bought.state.holdings.etfBroad.units > 0);
  assert.equal(bought.state.readiness.warned, false);
  assert.equal(bought.state.readiness.reason, null);

  // No debt but almost no fund: warns about the fund.
  const thin = atActions(6, ctx);
  thin.accounts.cash = 5_000; // harness: nothing above the cash buffer
  const thinRes = applyAction(thin, { type: "actions", moves: { etfBroad: 2_000 } }, ctx);
  assert.equal(thinRes.ok, false);
  if (!thinRes.ok) assert.match(thinRes.needsConfirm!.reason, /緊急預備金/);
});

// --- 7. real prices ------------------------------------------------------------------------

/** Month-end closes of 0050, built here from SEED_ROWS without the engine's helper. */
function independentCloses(ticker: string): { month: string; close: number }[] {
  const rows = SEED_ROWS.filter((r) => r.ticker === ticker).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const byMonth = new Map<string, { date: string; close: number }>();
  for (const r of rows) {
    const m = r.date.slice(0, 7);
    const cur = byMonth.get(m);
    if (!cur || r.date > cur.date) byMonth.set(m, { date: r.date, close: r.closing_price });
  }
  return [...byMonth.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([month, v]) => ({ month, close: v.close }));
}

function seedWithStart(pred: (startIndex: number) => boolean): number {
  for (let seed = 0; seed < 100_000; seed++) if (pred(newGame(seed, EMPTY_CTX).prices.startIndex)) return seed;
  throw new Error("no seed found");
}

test("life game 7: the ETF path is the real 0050 month-end closes, and market_drop fires on every ≤ −8% month", () => {
  const closes = independentCloses("0050");
  assert.equal(closes.length, SERIES_LENGTH);

  // Price path for a fixed seed, month by month until the series ends.
  for (const seed of [42, seedWithStart((i) => i === 0)]) {
    const start = newGame(seed, EMPTY_CTX).prices.startIndex;
    for (let t = 0; start + t < SERIES_LENGTH; t++) {
      assert.equal(priceAt("etfBroad", start, t, []), closes[start + t].close, `seed ${seed} turn ${t}`);
    }
  }

  // The biggest monthly fall in the data.
  let fall = { index: 1, change: 0 };
  for (let i = 1; i < closes.length; i++) {
    const c = closes[i].close / closes[i - 1].close - 1;
    if (c < fall.change) fall = { index: i, change: c };
  }
  assert.equal(closes[fall.index].month, "2020-03");
  assert.ok(Math.abs(fall.change - -0.141) < 0.001, `biggest fall ${fall.change}`);
  assert.deepEqual(biggestMonthlyFall(), { index: fall.index, month: "2020-03", change: fall.change });
  const dropMonths = closes
    .map((c, i) => (i > 0 ? { i, ret: c.close / closes[i - 1].close - 1 } : null))
    .filter((x): x is { i: number; ret: number } => x !== null && x.ret <= -0.08);
  assert.ok(dropMonths.length > 0, "the series has months at or below −8%");

  // A game from the first month, holding ETF from turn 0, plays the whole
  // series. Every month's price is the real close, the biggest fall shows up
  // as that turn's return, and market_drop fires exactly on the ≤ −8% months.
  const ctx: GameContext = { completed: new Set(["touzi"]), profile: {}, studentLoanMonthly: null };
  const seed = seedWithStart((i) => i === 0);
  let s = newGame(seed, ctx);
  const firedTurns: number[] = [];
  for (let t = 0; t < SERIES_LENGTH - 1; t++) {
    s = runAutopilot(s, ctx, 1, {
      stopEarly: false,
      moves: (x) => {
        assert.equal(x.pending.priceBefore.etfBroad, closes[x.turn].close, `game price at turn ${x.turn}`);
        return x.turn === 0 ? { etfBroad: 3_000, plan: { etfMonthly: 1_000 } } : {};
      },
    });
    const h = s.history.at(-1)!;
    assert.ok(s.holdings.etfBroad.units > 0, "still holding");
    const ret = closes[t + 1].close / closes[t].close - 1;
    assert.equal(h.etfReturn, ret, `turn ${t} return`);
    const fired = h.events.some((e) => e.id === "market_drop");
    assert.equal(fired, ret <= -0.08, `turn ${t} (${closes[t + 1].month}) return ${ret}`);
    if (fired) firedTurns.push(t);
    if (t + 1 === fall.index) assert.equal(h.etfReturn, fall.change);
  }
  assert.deepEqual(firedTurns, dropMonths.map((d) => d.i - 1));

  // Without ETF, the same month passes with no market_drop.
  const fallSeed = seedWithStart((i) => i <= fall.index - 1 && i >= fall.index - 6);
  let bare = newGame(fallSeed, ctx);
  const turnOfFall = fall.index - 1 - bare.prices.startIndex;
  bare = runAutopilot(bare, ctx, turnOfFall + 1, { stopEarly: false });
  const fallRec = bare.history.find((h) => h.turn === turnOfFall)!;
  assert.equal(fallRec.etfReturn, fall.change);
  assert.ok(!fallRec.events.some((e) => e.id === "market_drop"));
});

// --- 8. realism Monte Carlo ------------------------------------------------------------------

const JOB_CTX: GameContext = {
  completed: new Set(["zhiya", "touzi", "cunqian"]),
  profile: { careerPathId: "svc-care", monthlyIncome: 32_000 },
  studentLoanMonthly: null,
};

const PLAN_20 = (x: LifeState): ActionsPayload => (x.turn === 12 ? { plan: { etfMonthly: 6_400, saveFirst: 0 } } : {});

/** The plan, plus every dollar of cash and 活存 above NT$5,000 into 市值型 ETF from turn 12. */
const ALL_IN = (x: LifeState): ActionsPayload => {
  if (x.turn < 12) return {};
  const standing = 6_400;
  const pool = Math.max(x.accounts.cash, 0) + x.accounts.demand;
  const buy = pool - 5_000 - standing;
  return {
    ...PLAN_20(x),
    ...(x.accounts.demand > 0 ? { withdrawDemand: x.accounts.demand } : {}),
    ...(buy > 0 ? { etfBroad: buy } : {}),
  };
};

function startJob(seed: number): LifeState {
  const s = newGame(seed, JOB_CTX);
  s.plan.saveFirst = 6_400; // 20% of NT$32,000, turns 0 to 11
  return s;
}

test("life game 8a: saving 20% of NT$32,000 into ETF from turn 12, median freedom at turn 120 is 3% to 20%", () => {
  const free: number[] = [];
  for (let seed = 0; seed < 500; seed++) {
    // One call runs the same per-turn loop as 120 single-turn calls, faster.
    const s = runAutopilot(startJob(seed), JOB_CTX, 120, { stopEarly: false, moves: PLAN_20 });
    assert.equal(s.turn, 120);
    assert.equal(s.job.source, "careerLine");
    assert.ok(s.holdings.etfBroad.units > 0);
    free.push(s.stats.freedomPct);
  }
  const m = median(free);
  assert.ok(m >= 3 && m <= 20, `median freedom ${m}%`);
});

test("life game 8b/8c: all-in investing cannot reach 100% freedom within 15 years; most players see a 10% fall", () => {
  const SEEDS = 500;
  const maxFree: number[] = [];
  let sawDrawdown = 0;
  for (let seed = 0; seed < SEEDS; seed++) {
    const nw: number[] = [];
    let best = 0;
    const s = runAutopilot(startJob(seed), JOB_CTX, 180, {
      stopEarly: false,
      moves: (x) => {
        // At the actions step: last month's closing net worth and freedom.
        if (x.turn > 0) {
          nw.push(x.pending.netWorthStart);
          best = Math.max(best, x.stats.freedomPct);
        }
        return ALL_IN(x);
      },
    });
    assert.equal(s.turn, 180);
    nw.push(s.stats.netWorth); // nw[t] = net worth at the end of turn t
    maxFree.push(best); // highest freedom at the end of any turn before 180
    let peak = -Infinity;
    let fell = false;
    for (let t = 0; t < nw.length; t++) {
      if (t > 12 && peak > 0 && nw[t] <= 0.9 * peak) fell = true;
      peak = Math.max(peak, nw[t]);
    }
    if (fell) sawDrawdown++;
  }
  assert.ok(median(maxFree) < 100, `median best freedom ${median(maxFree)}%`);
  assert.ok(sawDrawdown / SEEDS >= 0.3, `only ${sawDrawdown}/${SEEDS} saw a 10% fall`);
});

// --- 9. server authority -----------------------------------------------------------------------

test("life game 9: the API refuses client balances and scores, and ignores unknown keys", () => {
  const s = newGame(9, ALL_CTX);
  const frozen = structuredClone(s);
  const forbidden: [unknown, string][] = [
    [{ action: { type: "collectPay" }, cash: 1_000_000 }, "cash"],
    [{ action: { type: "collectPay" }, score: 100 }, "score"],
    [{ action: { type: "collectPay" }, balance: 5 }, "balance"],
    [{ action: { type: "collectPay" }, state: { accounts: { cash: 9 } } }, "state"],
    [{ action: { type: "actions", moves: { demand: 100, balance: 999 } } }, "balance"],
    [{ action: { type: "ledger", cells: { cashEnd: 1 }, netWorth: 1e9 } }, "netWorth"],
    [{ action: { type: "collectPay", stats: { freedomPct: 100 } } }, "stats"],
  ];
  for (const [body, key] of forbidden) {
    const r = handleAction(s, body, ALL_CTX);
    assert.equal(r.ok, false, JSON.stringify(body));
    if (!r.ok) {
      assert.equal(r.error, "forbidden_field");
      assert.equal((r as { detail: string }).detail, key);
    }
  }
  assert.deepEqual(s, frozen, "a refused call changes nothing");

  // Unknown keys are dropped: the result is the same as the clean action.
  const clean = ok(handleAction(s, { action: { type: "collectPay" } }, ALL_CTX));
  const extra = ok(handleAction(s, { action: { type: "collectPay", pay: 1_000_000, net: 999_999 }, bonus: 5 }, ALL_CTX));
  assert.deepEqual(extra, clean);
  const saveClean = ok(handleAction(clean, { action: { type: "saveFirst", amount: 1_000 } }, ALL_CTX));
  const saveExtra = ok(handleAction(clean, { action: { type: "saveFirst", amount: 1_000, demandAfter: 1e9, cashLeft: 1e9 } }, ALL_CTX));
  assert.deepEqual(saveExtra, saveClean);
  const billed = ok(
    handleAction(ok(handleAction(saveClean, { action: { type: "payBills" } }, ALL_CTX)), { action: { type: "lifestyle", level: "normal" } }, ALL_CTX),
  );
  const movesClean = ok(handleAction(billed, { action: { type: "actions", moves: {} } }, ALL_CTX));
  const movesExtra = ok(handleAction(billed, { action: { type: "actions", moves: { gift: 1e6, units: 5, credit: 1e6 } } }, ALL_CTX));
  assert.deepEqual(movesExtra, movesClean);
  // Amounts the browser does choose are checked against balances.
  const greedy = handleAction(billed, { action: { type: "actions", moves: { demand: 10_000_000 } } }, ALL_CTX);
  assert.equal(greedy.ok, false);
  assert.equal(handleAction(s, { action: { type: "saveFirst", amount: -5 } }, ALL_CTX).ok, false);

  // A stale view is refused.
  const stale = handleAction(s, { expect: { turn: 3, phase: "payday" }, action: { type: "collectPay" } }, ALL_CTX);
  assert.equal(stale.ok, false);
  if (!stale.ok) assert.equal(stale.error, "stale");
  const wrongPhase = handleAction(s, { expect: { turn: 0, phase: "bills" }, action: { type: "collectPay" } }, ALL_CTX);
  assert.equal(!wrongPhase.ok && wrongPhase.error, "stale");
  assert.equal(handleAction(s, { expect: { turn: 0, phase: "payday" }, action: { type: "collectPay" } }, ALL_CTX).ok, true);
});

// --- 10. stress levels ---------------------------------------------------------------------

test("life game 10: each stress rule moves the score as 02 §5 says, and lands in its level", () => {
  const calm: StressInput = {
    efMonths: 3, cardRevolving: 0, debtPayments: 0, netPay: 30_000,
    overdue: false, bigEventHit: false, coveredByInsurance: false, gave: false, adjust: 0,
  };
  const at = (over: Partial<StressInput>) => {
    const { score } = stressParts({ ...calm, ...over });
    return { score, level: stressLevel(score) };
  };
  const cases: [string, Partial<StressInput>, number, "low" | "mid" | "high"][] = [
    ["calm: fund ≥ 3 months, no debt", {}, 20, "low"],
    ["fund under 1 month (+25)", { efMonths: 0.9 }, 45, "mid"],
    ["fund 1 to 3 months (+10)", { efMonths: 1 }, 30, "low"],
    ["fund just under 3 months (+10)", { efMonths: 2.9 }, 30, "low"],
    ["card revolving (+20)", { cardRevolving: 1 }, 40, "mid"],
    ["debt payments over 30% of net pay (+15)", { debtPayments: 9_001 }, 35, "mid"],
    ["debt payments at exactly 30% (no points)", { debtPayments: 9_000 }, 20, "low"],
    ["no pay but debts due (+15)", { netPay: 0, debtPayments: 1 }, 35, "mid"],
    ["overdue bill (+20)", { overdue: true }, 40, "mid"],
    ["big event after insurance (+10)", { bigEventHit: true }, 30, "low"],
    ["insurance covered an event (−5)", { efMonths: 2, bigEventHit: true, coveredByInsurance: true }, 35, "mid"],
    ["gave money (−3)", { efMonths: 2, bigEventHit: true, coveredByInsurance: true, gave: true }, 32, "low"],
    ["no fund and card debt: high", { efMonths: 0, cardRevolving: 5_000 }, 65, "high"],
    ["thin fund, card debt, overdue: high", { efMonths: 2, cardRevolving: 5_000, overdue: true }, 70, "high"],
    ["everything at once, clamped to 100", { efMonths: 0, cardRevolving: 1, debtPayments: 20_000, overdue: true, bigEventHit: true }, 100, "high"],
    ["skipping a birthday (+2)", { efMonths: 2, adjust: 2 }, 32, "low"],
    ["calm and generous, never below 0", { gave: true, coveredByInsurance: true }, 12, "low"],
  ];
  for (const [name, over, score, level] of cases) assert.deepEqual(at(over), { score, level }, name);
  // Level boundaries (02 §5): 0–34 低, 35–64 中, 65–100 高.
  assert.deepEqual([0, 34, 35, 64, 65, 100].map(stressLevel), ["low", "low", "mid", "mid", "high", "high"]);

  // The game uses the same rules: a new graduate with NT$10,000 cash has
  // under a month of fund and nothing else.
  const s = newGame(10, EMPTY_CTX);
  assert.ok(s.stats.efMonths < 1);
  assert.equal(s.stats.stress, 45);
});

// --- 11. unlocks -------------------------------------------------------------------------

test("life game 11: moves unlock from completions, including ones finished after the save", () => {
  const moves = unlockedMoves(new Set(["xinyong"]));
  assert.ok(moves.includes("card") && moves.includes("cardRepay"));
  for (const m of START_MOVES) assert.ok(moves.includes(m));
  assert.ok(!moves.includes("etfBroad"));
  assert.deepEqual(new Set(unlockedMoves(new Set())), new Set(START_MOVES));
  assert.ok(!unlockedMoves(new Set(["not-a-line"])).includes("etfBroad"));

  // An existing save, made before 投資線 was done.
  const before: GameContext = { completed: new Set(["cunqian"]), profile: {}, studentLoanMonthly: null };
  let s = runAutopilot(newGame(11, before), before, 2, { stopEarly: false });
  assert.ok(!s.unlocked.includes("etfBroad"));
  let atAct = step(step(step(s, { type: "collectPay" }, before), { type: "saveFirst", amount: 0 }, before), { type: "payBills" }, before);
  const locked = applyAction(atAct, { type: "actions", moves: { etfBroad: 2_000, confirmReadiness: true } }, before);
  assert.equal(!locked.ok && locked.error, "locked");

  // 投資線 completed since: the next load unlocks the move, and it works.
  const after: GameContext = { ...before, completed: new Set(["cunqian", "touzi"]) };
  atAct = syncWithContext(atAct, after);
  assert.ok(atAct.unlocked.includes("etfBroad"));
  assert.ok(atAct.unlocked.includes("timeDeposit"), "earlier unlocks stay");
  const bought = ok(applyAction(atAct, { type: "actions", moves: { etfBroad: 2_000, confirmReadiness: true } }, after));
  assert.ok(bought.holdings.etfBroad.units > 0);

  // A starter job becomes the 職涯線 job once zhiya is done with a path.
  s = newGame(11, EMPTY_CTX);
  assert.equal(s.job.source, "starter");
  assert.ok((STARTER_JOB_IDS as readonly string[]).includes(s.job.id));
  const career: GameContext = { completed: new Set(["zhiya"]), profile: { careerPathId: "svc-care", monthlyIncome: 32_000 }, studentLoanMonthly: null };
  const synced = syncWithContext(s, career);
  assert.equal(synced.job.source, "careerLine");
  assert.equal(synced.job.id, "svc-care");
  assert.equal(synced.job.grossMonthly, 32_000);
  assert.ok(synced.unlocked.includes("skill"));
  // A path without a completed line does not switch the job.
  assert.equal(syncWithContext(s, { ...career, completed: new Set() }).job.source, "starter");
  // The next payday pays the new salary.
  const paid = step(synced, { type: "collectPay" }, career);
  assert.equal(paid.pending.flows.netPay, payslipFor(32_000).net);
});

// --- 12. old data ------------------------------------------------------------------------

test("life game 12: a student with no save gets a new game; old sim results read as before", () => {
  const s = newGame(1_234_567, EMPTY_CTX);
  assert.doesNotThrow(() => LifeStateSchema.parse(s));
  assert.equal(s.turn, 0);
  assert.equal(s.phase, "payday");
  assert.equal(s.accounts.cash, 10_000);
  assert.deepEqual(new Set(s.unlocked), new Set(START_MOVES));
  assert.equal(s.job.source, "starter");
  assert.equal(s.creditRecord, "good");
  assert.equal(s.goal, null);
  // It plays.
  const played = runAutopilot(s, EMPTY_CTX, 3, { stopEarly: false });
  assert.equal(played.turn, 3);

  // 信用線's results are unchanged by the game reusing its engine.
  assert.deepEqual(NO_CARRY, { olderPrincipal: 0, lastMonthPrincipal: 0, unpaidInterest: 0 });
  const min = computeCreditCard(["minimum", "minimum", "minimum"]);
  assert.deepEqual(min.rounds.map((r) => r.interestAccrued), [0, 133, 142]);
  assert.deepEqual(min.rounds.map((r) => r.minimumPayment), [800, 1100, 1500]);
  assert.deepEqual(min.rounds.map((r) => r.totalOwed), [8000, 10833, 14875]);
  assert.equal(min.totalInterest, 275);
  assert.equal(min.record, "fair");
  assert.equal(computeCreditCard(["full", "full", "full"]).totalInterest, 0);
  const missed = computeCreditCard(["missed", "missed", "full"]);
  assert.equal(missed.totalLateFees, 700);
  assert.equal(missed.record, "poor");

  // A stored xinyong_credit_card_v2 outcome, as written before the game existed.
  const oldV2 = {
    rounds: [
      { carryOut: 7200, lateFee: 0 },
      { carryOut: 9733, lateFee: 0 },
      { carryOut: 13375, lateFee: 0 },
    ],
    totalPaid: 3400,
    totalInterest: 275,
    totalIfNoInterest: 16500,
    creditRecord: "普通",
    record: "fair",
    totalLateFees: 0,
    missedCount: 0,
  };
  const parsed = parseSimResult({ kind: "xinyong_credit_card_v2", outcome: oldV2 });
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.result.kind, "xinyong_credit_card_v2");
    assert.deepEqual(parsed.result.outcome, oldV2);
  }
  // The same numbers the engine produces today.
  assert.deepEqual(min.rounds.map((r) => r.carryOut), oldV2.rounds.map((r) => r.carryOut));
  assert.equal(min.totalPaid, oldV2.totalPaid);
  assert.ok(parseSimResult({ kind: "xinyong_credit_card_v2", outcome: min }).ok);
  // A v1 row from before `record` existed still reads, and maps to fair.
  const oldV1 = { totalPaid: 3400, totalInterest: 275, totalIfNoInterest: 16500, creditRecord: "普通", rounds: [{ carryOut: 7200 }] };
  const v1 = readStoredResult("xinyong_credit_card_v1", oldV1);
  assert.ok(v1);
  assert.equal(creditRecordOf(oldV1), "fair");
});

// --- follow-ups from the /play build -------------------------------------------

import { newGame as newGame2, applyAction as applyAction2, publicState as publicState2 } from "@/lib/lifeGame/engine";

function step2(s: ReturnType<typeof newGame2>, action: Parameters<typeof applyAction2>[1]) {
  const ctx = { completed: new Set<string>(), profile: {}, studentLoanMonthly: null };
  const r = applyAction2(s, action, ctx);
  assert.ok(r.ok, `action ${action.type} failed: ${r.ok ? "" : r.error}`);
  if (action.type !== "payBills") return r.state;
  const l = applyAction2(r.state, { type: "lifestyle", level: "normal" }, ctx);
  assert.ok(l.ok, "lifestyle failed");
  return l.state;
}

test("ledger answers never reach the browser during the ledger check", () => {
  const ctx = { completed: new Set<string>(), profile: {}, studentLoanMonthly: null };
  let s = newGame2(424242, ctx);
  for (let i = 0; i < 3 && s.phase !== "ledger"; i++) {
    s = step2(s, { type: "collectPay" });
    s = step2(s, { type: "saveFirst", amount: 1000 });
    s = step2(s, { type: "payBills" });
    s = step2(s, { type: "actions", moves: {} });
    const choices: Record<string, { option: string }> = {};
    for (const e of s.pending.events) choices[e.key] = { option: "skip" };
    const r = applyAction2(s, { type: "events", choices }, ctx);
    if (!r.ok) {
      // A choice event with other option ids: take the first safe one.
      for (const e of s.pending.events) choices[e.key] = { option: ({ new_phone: "wait", scam_msg: "ignore", friend_loan: "no", guarantor: "no", family_help: "no", rent_up: "accept", market_drop: "hold", bonus: "save", japan_trip: "skip" } as Record<string, string>)[e.id] ?? "skip" };
      s = step2(s, { type: "events", choices });
    } else s = r.state;
  }
  assert.equal(s.phase, "ledger", "the third turn ends on the ledger check");
  assert.ok(s.pending.ledger.income > 0, "the server knows the answers");
  const pub = publicState2(s);
  assert.equal(pub.pending.ledger.income, 0);
  assert.equal(pub.pending.ledger.cashEnd, 0);
  assert.equal(pub.pending.ledger.cashStart, s.pending.ledger.cashStart, "the opening row is shown");
});

test("payBills with an empty cover list covers nothing: the shortfall becomes 欠款", () => {
  const ctx = { completed: new Set<string>(), profile: {}, studentLoanMonthly: null };
  let s = newGame2(99, ctx);
  s = step2(s, { type: "collectPay" });
  // Save almost everything first, so the bills cannot be paid from cash.
  s = step2(s, { type: "saveFirst", amount: s.accounts.cash - 1000 });
  const none = step2(s, { type: "payBills", cover: [] });
  assert.ok(none.debts.overdueBills > 0, "nothing was pulled back; the rest is overdue");
  assert.equal(none.pending.tookBackSaving, 0);
  const dflt = step2(s, { type: "payBills" });
  assert.equal(dflt.debts.overdueBills, 0, "the default order takes the saving back instead");
  assert.ok(dflt.pending.tookBackSaving > 0);
});
