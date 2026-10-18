/**
 * Class mode for the life game (02-LIFE-GAME §8).
 *
 *  1. Teams in one room share the seed: same choices, same months and events.
 *  2. The leaderboard ranks by 財務健康分, never by net worth: a reckless team
 *     with a high net worth and card debt ranks below a steady one.
 *  3. The leaderboard never reads a client-sent score.
 *
 * Runs with Node's built-in runner through tsx: `npx tsx --test tests/classLife.test.ts`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import { handleAction } from "@/lib/lifeGame/api";
import {
  CLASS_TEAMS,
  classGameContext,
  classTeamId,
  loadOrCreateClassTeam,
  normalizeTeam,
  persistClassTeam,
  type ClassSaveStore,
  rankTeams,
  startTeamState,
  teamFromId,
} from "@/lib/lifeGame/class";
import { isChoiceEvent, SAFEST_OPTION } from "@/lib/lifeGame/engine";
import { healthScore } from "@/lib/lifeGame/stats";
import type { LifeState, PendingEvent } from "@/lib/lifeGame/types";
import type { LifeGameSave } from "@/lib/types";

const ROOM = "5b0c7a0e-8f2a-4c9e-9d37-2f6f3c1a7b11";
const OTHER_ROOM = "0d6a1f3e-1b2c-4d5e-8f90-123456789abc";

/** The riskier option of each choice event, so the run takes branches that cost money. */
const RISKY: Record<string, string> = {
  birthday: "go",
  concert: "buy",
  japan_trip: "go",
  new_phone: "installment",
  scam_msg: "ignore",
  friend_loan: "lend",
  guarantor: "no",
  family_help: "give5000",
  rent_up: "accept",
  course_sale: "buy",
  market_drop: "hold",
  bonus: "spend",
};

function act(s: LifeState, body: unknown): LifeState {
  const r = handleAction(s, body, classGameContext());
  if (!r.ok) assert.fail(`refused: ${r.error} ${"detail" in r ? (r.detail ?? "") : ""}`);
  return r.state;
}

/**
 * One team plays `turns` months through the same entry point the class
 * action route uses (handleAction, with expect), making the same choices
 * every time. Returns the events it was dealt each month and the end state.
 */
function playTeam(seed: number, turns: number): { dealt: PendingEvent[][]; end: LifeState } {
  let s = startTeamState(seed);
  const dealt: PendingEvent[][] = [];
  const send = (action: unknown) => {
    s = act(s, { expect: { turn: s.turn, phase: s.phase }, action });
  };
  for (let t = 0; t < turns; t++) {
    send({ type: "collectPay" });
    send({ type: "saveFirst", amount: Math.min(s.plan.saveFirst, Math.max(s.accounts.cash, 0)) });
    send({ type: "payBills" });
    send({ type: "actions", moves: { demand: Math.floor(Math.max(s.accounts.cash - 3_000, 0) / 2), confirmReadiness: true } });
    dealt.push(structuredClone(s.pending.events));
    const choices: Record<string, { option: string }> = {};
    for (const e of s.pending.events) {
      if (isChoiceEvent(e.id)) choices[e.key] = { option: RISKY[e.id] ?? SAFEST_OPTION[e.id] };
    }
    send({ type: "events", choices });
    while (s.phase === "ledger") send({ type: "ledger", cells: { ...s.pending.ledger } });
    assert.equal(s.phase, "payday");
  }
  return { dealt, end: s };
}

// --- 1. shared seed ----------------------------------------------------------------

test("class life 1: two teams on the room's seed see identical events for the same choices", () => {
  const seed = 424242;
  const teamA = playTeam(seed, 24);
  const teamB = playTeam(seed, 24);
  assert.equal(teamA.end.turn, 24);
  assert.ok(teamA.dealt.some((d) => d.length > 0), "the run should deal at least one event");
  assert.deepEqual(teamB.dealt, teamA.dealt);
  assert.deepEqual(teamB.end, teamA.end);
  // The seed is what makes them equal: a room with another seed deals another life.
  const otherRoom = playTeam(seed + 1, 24);
  assert.notDeepEqual(otherRoom.dealt, teamA.dealt);
});

test("class life 1b: every team starts from the same neutral context (standing moves only)", () => {
  const ctx = classGameContext();
  assert.equal(ctx.completed.size, 0);
  assert.deepEqual(ctx.profile, {});
  assert.equal(ctx.studentLoanMonthly, null);
  const s = startTeamState(7);
  assert.deepEqual([...s.unlocked].sort(), ["demand", "give"]);
  assert.equal(s.job.source, "starter");
  assert.deepEqual(startTeamState(7), s);
});

/** lib/db.ts's three save functions over an array, same contract (rows come back as copies). */
function memoryStore(): ClassSaveStore & { rows: LifeGameSave[] } {
  const rows: LifeGameSave[] = [];
  let clock = Date.parse("2026-10-01T00:00:00Z");
  return {
    rows,
    async getTeamLifeSave(id) {
      const row = rows.find((r) => r.class_team_id === id);
      return row ? structuredClone(row) : null;
    },
    async createLifeSave(input) {
      const existing = rows.find((r) => r.class_team_id === input.class_team_id);
      if (existing) return structuredClone(existing);
      const now = new Date(clock++).toISOString();
      const row: LifeGameSave = { id: `save-${rows.length}`, ...input, created_at: now, updated_at: now };
      rows.push(row);
      return structuredClone(row);
    },
    async updateLifeSave(id, state, expected) {
      const row = rows.find((r) => r.id === id);
      if (!row || row.updated_at !== expected) return null;
      Object.assign(row, { state, updated_at: new Date(clock++).toISOString() });
      return structuredClone(row);
    },
  };
}

test("class life 1c: the loader gives each team the room's seed and one shared save", async () => {
  const db = memoryStore();
  const seed = 31337;
  const a = await loadOrCreateClassTeam(db, { id: "stu-1" }, ROOM, "第1隊", seed);
  const b = await loadOrCreateClassTeam(db, { id: "stu-2" }, ROOM, "第2隊", seed);
  assert.ok(!("error" in a) && !("error" in b));
  assert.equal(a.save.class_team_id, `${ROOM}:第1隊`);
  assert.equal(a.save.student_id, "stu-1"); // the captain
  assert.deepEqual(a.state, b.state);
  assert.deepEqual(a.state, startTeamState(seed));

  // A teammate opening the game later gets the same save, not a new one.
  const again = await loadOrCreateClassTeam(db, { id: "stu-3" }, ROOM, "第1隊", seed);
  assert.ok(!("error" in again));
  assert.equal(again.save.id, a.save.id);
  assert.equal(db.rows.length, 2);

  // Two teammates sending the same step: the second write loses.
  const next = act(a.state, { action: { type: "collectPay" } });
  assert.ok(await persistClassTeam(db, a.save, next));
  assert.equal(await persistClassTeam(db, again.save, next), null);
});

test("class life: team names and team ids", () => {
  assert.equal(normalizeTeam("  第3隊 "), "第3隊");
  assert.equal(normalizeTeam("火箭  隊"), "火箭 隊");
  assert.equal(normalizeTeam(""), null);
  assert.equal(normalizeTeam("一二三四五六七八九十一二三"), null); // 13 characters
  assert.equal(normalizeTeam("一二三四五六七八九十一二"), "一二三四五六七八九十一二");
  assert.equal(normalizeTeam(42), null);
  for (const t of CLASS_TEAMS) assert.equal(normalizeTeam(t), t);
  const id = classTeamId(ROOM, "第1隊");
  assert.equal(teamFromId(id, ROOM), "第1隊");
  assert.equal(teamFromId(id, OTHER_ROOM), null);
});

// --- 2. ranking by health ----------------------------------------------------------

function steadyTeam(): LifeState {
  const s = startTeamState(99);
  s.turn = 12;
  s.stats = { efMonths: 6, freedomPct: 1.2, stress: 25, netWorth: 180_000 };
  return s;
}

function recklessTeam(): LifeState {
  const s = startTeamState(99);
  s.turn = 12;
  // Big ETF bet paid off on paper, no emergency fund, card debt rolling.
  s.stats = { efMonths: 0.4, freedomPct: 3.5, stress: 70, netWorth: 950_000 };
  s.debts.card.olderPrincipal = 40_000;
  return s;
}

test("class life 2: a reckless high-net-worth team with card debt ranks below a steady one", () => {
  const steady = steadyTeam();
  const reckless = recklessTeam();
  assert.ok(reckless.stats.netWorth > steady.stats.netWorth, "the reckless team is richer on paper");

  const board = rankTeams(
    [
      { class_team_id: classTeamId(ROOM, "冒險隊"), state: reckless },
      { class_team_id: classTeamId(ROOM, "穩健隊"), state: steady },
    ],
    ROOM,
  );
  assert.deepEqual(
    board.map((r) => r.team),
    ["穩健隊", "冒險隊"],
  );
  assert.equal(board[0].rank, 1);
  assert.equal(board[0].health, healthScore(steady));
  assert.equal(board[1].health, healthScore(reckless));
  assert.ok(board[1].cardDebt);
  // 02 §8 formula: 40 + 40·0.12 + 20·0.75 = 59.8 → 60; reckless: 40·0.0667 + 40·0.35 + 20·0.3 - 15 = 7.67 → 8.
  assert.equal(board[0].health, 60);
  assert.equal(board[1].health, 8);
});

test("class life 2b: saves from another room and unreadable saves are left out", () => {
  const board = rankTeams(
    [
      { class_team_id: classTeamId(OTHER_ROOM, "第1隊"), state: steadyTeam() },
      { class_team_id: classTeamId(ROOM, "第2隊"), state: { version: 1, junk: true } },
      { class_team_id: null, state: steadyTeam() },
      { class_team_id: classTeamId(ROOM, "第3隊"), state: recklessTeam() },
    ],
    ROOM,
  );
  assert.deepEqual(
    board.map((r) => r.team),
    ["第3隊"],
  );
});

// --- 3. no client-sent score -------------------------------------------------------

test("class life 3: the leaderboard recomputes the score and ignores any score a client planted", () => {
  const reckless = recklessTeam();
  // A save row carrying planted numbers, at the row level and inside the state.
  const planted = {
    class_team_id: classTeamId(ROOM, "冒險隊"),
    score: 100,
    health: 100,
    state: { ...structuredClone(reckless), score: 100, health: 100, stats: { ...reckless.stats, health: 100 } },
  };
  const board = rankTeams([planted, { class_team_id: classTeamId(ROOM, "穩健隊"), state: steadyTeam() }], ROOM);
  const row = board.find((r) => r.team === "冒險隊");
  assert.ok(row);
  assert.equal(row.health, healthScore(reckless));
  assert.equal(row.rank, 2);
});

test("class life 3b: an action that tries to send a score or balance is refused", () => {
  const s = startTeamState(5);
  for (const body of [
    { action: { type: "collectPay" }, score: 100 },
    { action: { type: "collectPay" }, health: 100 },
    { action: { type: "actions", moves: { demand: 0 }, stats: { netWorth: 1e7 } } },
  ]) {
    const r = handleAction(s, body, classGameContext());
    assert.equal(r.ok, false);
    assert.equal(!r.ok && r.error, "forbidden_field");
  }
});

test("class life 3c: the leaderboard route reads nothing from the request but room_id", () => {
  const src = readFileSync(path.join(process.cwd(), "app/api/class/life/leaderboard/route.ts"), "utf8");
  assert.ok(!/req\.(json|text|formData)\(/.test(src), "the leaderboard must not read a request body");
  const params = [...src.matchAll(/searchParams\.get\(\s*["'`]([^"'`]+)["'`]\s*\)/g)].map((m) => m[1]);
  assert.deepEqual(params, ["room_id"]);
  assert.match(src, /rankTeams\(/);
});
