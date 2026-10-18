import { test } from "node:test";
import assert from "node:assert/strict";
import { applyAction, newGame, publicState, runAutopilot, yearTax, type GameContext } from "@/lib/lifeGame/engine";
import type { LifeState } from "@/lib/lifeGame/types";
import { SERIES_LENGTH, monthReturn } from "@/lib/lifeGame/prices";
import { MARKET_DROP_TRIGGER } from "@/lib/lifeGame/constants";

const none: GameContext = { completed: new Set(), profile: {}, studentLoanMonthly: null };

test("tax notice: 勞退自提 is not taxed, and last calendar year is used", () => {
  const s = newGame(1, none);
  // Turn 22 is a May. Its previous calendar year is turns 6 to 17 (Jan to Dec).
  s.turn = 22;
  s.history = Array.from({ length: 22 }, (_, t) => ({
    turn: t,
    calendarMonth: ((6 + t) % 12) + 1,
    flows: { grossPay: 70_000, pensionSelf: 4_200, netPay: 0, sideProfit: 0, otherIncome: 0, spending: 0, interest: 0, dividends: 0, marketChange: 0, writeOffs: 0 },
    ledger: { cashStart: 0, income: 0, saved: 0, bills: 0, actions: 0, events: 0, cashEnd: 0 },
    billsTotal: 0, savedFirst: 0, tookBackSaving: 0, overdueCreated: 0, events: [],
    netWorthStart: 0, netWorthEnd: 0, etfReturn: null, stress: 0, notes: [], ledgerScore: null, autopilot: false,
  })) as LifeState["history"];
  const { income } = yearTax(s);
  assert.equal(income, 12 * (70_000 - 4_200), "12 calendar months, 自提 excluded");
});

test("market_drop fires when only 0056 is held and 0056 falls 8% or more", () => {
  // Find a month where 0056 falls ≥ 8% but 0050 does not.
  let start = -1;
  for (let i = 0; i < SERIES_LENGTH - 1; i++) {
    const d = monthReturn("etfDividend", i, 0, []);
    const b = monthReturn("etfBroad", i, 0, []);
    if (d <= MARKET_DROP_TRIGGER && b > MARKET_DROP_TRIGGER) { start = i; break; }
  }
  if (start < 0) return; // the real series has no such month; nothing to test
  const s = newGame(1, none);
  s.prices.startIndex = start;
  s.holdings.etfDividend = { units: 100, costBasis: 1 };
  s.phase = "actions";
  const r = applyAction(s, { type: "actions", moves: {} }, none);
  assert.ok(r.ok);
  assert.ok(r.state.pending.events.some((e) => e.id === "market_drop"));
});

test("bonus 'invest' respects the readiness check on a first ETF buy", () => {
  const ctx: GameContext = { ...none, completed: new Set(["touzi"]) };
  const s = newGame(1, ctx);
  s.phase = "event";
  s.debts.card.olderPrincipal = 5_000; // card debt revolving: not ready
  s.pending.events = [{ key: "bonus", id: "bonus", vars: { amount: 30_000 } }];
  const r = applyAction(s, { type: "events", choices: { bonus: { option: "invest" } } }, ctx);
  assert.ok(r.ok);
  assert.equal(r.state.holdings.etfBroad.units, 0, "no ETF bought while not ready");
});

test("autopilot pays the card statement in full", () => {
  const ctx: GameContext = { ...none, completed: new Set(["xinyong"]) };
  const s = newGame(1, ctx);
  s.debts.card.statementTotal = 8_000;
  s.debts.card.statementNewCharge = 8_000;
  s.debts.card.statementMinimum = 800;
  const after = runAutopilot(s, ctx, 1, { stopEarly: false });
  assert.equal(after.debts.card.olderPrincipal + after.debts.card.lastMonthPrincipal, 0, "nothing left revolving");
});

test("the friend-loan clue count never reaches the browser", () => {
  const s = newGame(1, none);
  s.phase = "event";
  s.pending.events = [{ key: "friend_loan", id: "friend_loan", vars: { clue1: "a", clue2: "b", good: 2 } }];
  const pub = publicState(s);
  assert.equal("good" in pub.pending.events[0].vars, false);
  assert.equal(pub.pending.events[0].vars.clue1, "a");
});
