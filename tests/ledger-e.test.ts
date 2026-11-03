/**
 * 10 LIFE-1, LIFE-2, LIFE-4 (ledger-e): the month's record box, summary and
 * idle-cash line against the engine.
 *   LIFE-1: with each 生活風格 level, the box (publicState during 記帳) shows
 *           every row exactly as the ledger accepts it; only 月底現金 is hidden.
 *   LIFE-2: the summary's parts of 花掉 add up to it.
 *   LIFE-4: no moves with plenty of cash names the unallocated cash; a month
 *           with moves does not.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { idleCash, spendParts } from "@/components/play/playModel";
import { applyAction, isChoiceEvent, newGame, publicState, type GameContext } from "@/lib/lifeGame/engine";
import type { Action, LifeState, LifestyleLevel } from "@/lib/lifeGame/types";

const CTX: GameContext = { completed: new Set(), profile: {}, studentLoanMonthly: null };
const SAFE: Record<string, string> = { new_phone: "wait", scam_msg: "ignore", friend_loan: "no", guarantor: "no", family_help: "no", rent_up: "accept", market_drop: "hold", bonus: "save", japan_trip: "skip", birthday: "skip", concert: "skip", mood_buy: "close", course_sale: "skip" };

function act(s: LifeState, a: Action): LifeState {
  const r = applyAction(s, a, CTX);
  if (!r.ok) assert.fail(`${a.type} refused: ${r.error}`);
  return r.state;
}

/** Plays whole months to the ledger check (the third), with `level` every month. */
function toLedger(seed: number, level: LifestyleLevel, moves: (s: LifeState) => object = () => ({})): LifeState {
  let s = newGame(seed, CTX);
  for (let guard = 0; guard < 40 && s.phase !== "ledger"; guard++) {
    if (s.phase === "payday") s = act(s, { type: "collectPay" });
    else if (s.phase === "saveFirst") s = act(s, { type: "saveFirst", amount: Math.min(s.plan.saveFirst, Math.max(s.accounts.cash, 0)) });
    else if (s.phase === "bills") s = act(s, { type: "payBills" });
    else if (s.phase === "lifestyle") s = act(s, { type: "lifestyle", level });
    else if (s.phase === "actions") s = act(s, { type: "actions", moves: moves(s) } as Action);
    else if (s.phase === "event") {
      const choices: Record<string, { option: string }> = {};
      for (const e of s.pending.events) if (isChoiceEvent(e.id)) choices[e.key] = { option: SAFE[e.id] ?? "skip" };
      s = act(s, { type: "events", choices } as Action);
    }
  }
  assert.equal(s.phase, "ledger");
  return s;
}

for (const level of ["save", "normal", "enjoy"] as const) {
  test(`ledger-e LIFE-1: with 生活風格 ${level}, the record box shows the ledger's own numbers`, () => {
    const s = toLedger(11, level);
    const box = publicState(s).pending.ledger;
    for (const k of ["cashStart", "income", "saved", "bills", "actions", "events"] as const) {
      assert.equal(box[k], s.pending.ledger[k], `${k}`);
    }
    assert.equal(box.cashEnd, 0, "月底現金 is the student's to work out");
    // The box's numbers, put in as they are, pass the check.
    const done = act(s, { type: "ledger", cells: { ...box, cashEnd: box.cashStart + box.income - box.saved - box.bills - box.actions - box.events } });
    assert.equal(done.history.at(-1)!.ledgerScore, 1);
  });
}

test("ledger-e LIFE-2: the parts of 花掉 add up to it, every month, every level", () => {
  for (const level of ["save", "normal", "enjoy"] as const) {
    for (const seed of [1, 7, 42]) {
      let s = toLedger(seed, level);
      s = act(s, { type: "ledger", cells: s.pending.ledger });
      for (const r of s.history) {
        const parts = spendParts(r);
        assert.ok(parts.length > 0, "a new record has its parts");
        assert.equal(parts.reduce((a, p) => a + p.amount, 0), r.flows.spending, `turn ${r.turn} ${level}`);
        assert.equal(parts.find((p) => p.label === "想要的花費")?.amount ?? 0, r.wants ?? 0);
      }
    }
  }
});

test("ledger-e LIFE-4: no moves with plenty of cash names it; a month with a move does not", () => {
  let s = toLedger(5, "save");
  s = act(s, { type: "ledger", cells: s.pending.ledger });
  const idle = s.history.filter((r) => idleCash(r) > 0);
  for (const r of idle) {
    const l = r.ledger;
    assert.equal(idleCash(r), l.cashStart + l.income - l.saved - l.bills, "the amount 行動 showed as 還沒分配");
    assert.ok(idleCash(r) > 3 * r.billsTotal);
  }
  let m = toLedger(5, "save", (st) => ({ demand: Math.floor(Math.max(st.accounts.cash, 0) / 2) }));
  m = act(m, { type: "ledger", cells: m.pending.ledger });
  assert.ok(m.history.every((r) => r.ledger.actions === 0 || idleCash(r) === 0), "a month with a move never shows the line");
});

test("ledger-e LIFE-4: the rule on a month that meets it, and on one that does not", () => {
  let s = toLedger(5, "save");
  s = act(s, { type: "ledger", cells: s.pending.ledger });
  const r = s.history[0];
  const rich = { ...r, billsTotal: 10_000, ledger: { ...r.ledger, cashStart: 40_000, income: 30_000, saved: 0, bills: 10_000, actions: 0 } };
  assert.equal(idleCash(rich), 60_000, "60,000 unallocated > 3 × 10,000 bills");
  assert.equal(idleCash({ ...rich, ledger: { ...rich.ledger, actions: 5_000 } }), 0, "a move: no line");
  assert.equal(idleCash({ ...rich, ledger: { ...rich.ledger, cashStart: 0 } }), 0, "20,000 is not more than 3 months of bills");
});
