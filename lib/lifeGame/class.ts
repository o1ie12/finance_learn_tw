/**
 * Class mode for the life game (02-LIFE-GAME §8): a teacher's `life` room,
 * teams that share the room's seed, and a leaderboard ranked by 財務健康分.
 *
 * The quiz class mode is untouched (docs/redesign/plan.md, conflict C1). A
 * life room is a class_rooms row with kind 'life'; readers branch on kind,
 * never on line_slug.
 *
 * Everything here is importable from the browser and from tests: nothing
 * imports lib/db.ts. The loader core at the bottom takes the storage as a
 * parameter; routes call the server-only wrappers in ./classServer.ts.
 *
 * Decisions where the spec is silent:
 *  - Every team plays with the same neutral GameContext: no completed lines
 *    (standing moves only: 存活存 and 助人), no profile (the seed picks the
 *    starter job), no student loan. The spec says every team faces the same
 *    months and events; a captain's own lines or 職涯線 salary would make two
 *    teams' games differ, and a shared save would change whenever a
 *    different teammate loaded it.
 *  - A team save needs a student_id (migration-21: NOT NULL, references
 *    students), so class players must be signed in. The member who first
 *    opens the team's game becomes its captain; any joined member of that
 *    team may advance it.
 */

import type { LifeGameSave, Student } from "@/lib/types";
import { newGame, syncWithContext, type GameContext } from "./engine";
import { cardRevolving, healthScore, stressLevel, type StressLevel } from "./stats";
import { LifeStateSchema, type LifeState } from "./types";

// --- teams -------------------------------------------------------------------------

/** The team picker's fixed names. A class may also type its own (≤ 12 chars). */
export const CLASS_TEAMS = ["第1隊", "第2隊", "第3隊", "第4隊", "第5隊", "第6隊", "第7隊", "第8隊"] as const;

export const TEAM_NAME_MAX = 12;
export const DISPLAY_NAME_MAX = 20;

/**
 * A team name as stored: trimmed, inner whitespace collapsed, 1 to 12
 * characters (by code point), no control characters. Null when invalid.
 */
export function normalizeTeam(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.normalize("NFC").replace(/\s+/g, " ").trim();
  if (!t) return null;
  if (/[\u0000-\u001f\u007f]/.test(t)) return null;
  if ([...t].length > TEAM_NAME_MAX) return null;
  return t;
}

/** `${room_id}:${team}` (migration-21). */
export function classTeamId(roomId: string, team: string): string {
  return `${roomId}:${team}`;
}

/** The team part of a class_team_id in this room, or null if it belongs elsewhere. */
export function teamFromId(id: string | null, roomId: string): string | null {
  const prefix = `${roomId}:`;
  if (!id || !id.startsWith(prefix)) return null;
  const team = id.slice(prefix.length);
  return team || null;
}

// --- the shared game ---------------------------------------------------------------

/** The one context every class team plays with (see the file comment). */
export function classGameContext(): GameContext {
  return { completed: new Set<string>(), profile: {}, studentLoanMonthly: null, goal: null };
}

/** A team's first state for the room's seed. Same seed, same game. */
export function startTeamState(seed: number): LifeState {
  const ctx = classGameContext();
  return syncWithContext(newGame(seed, ctx), ctx);
}

// --- leaderboard -------------------------------------------------------------------

export interface TeamStanding {
  rank: number;
  team: string;
  /** 財務健康分 (02 §8), computed here from the saved state. */
  health: number;
  efMonths: number;
  freedomPct: number;
  stress: number;
  stressLevel: StressLevel;
  /** Shown to the teacher only as context; never a sort key. */
  netWorth: number;
  cardDebt: boolean;
  overdue: boolean;
  /** Turns finished (0 before the first month ends). */
  turn: number;
}

/**
 * Rank a room's team saves by 財務健康分, highest first. Ties go to the
 * larger emergency fund, then the lower stress, then the team name. Net
 * worth is never a sort key: ranking by it rewards maximum risk (02 §8).
 *
 * Reads only `class_team_id` and `state`. Whatever else a row carries, and
 * any field the state schema does not know (a `score`, a `health`), is
 * ignored: the score is recomputed from the parsed state every time.
 * Unreadable saves are left out.
 */
export function rankTeams(
  saves: readonly Pick<LifeGameSave, "class_team_id" | "state">[],
  roomId: string,
): TeamStanding[] {
  const rows: Omit<TeamStanding, "rank">[] = [];
  for (const save of saves) {
    const team = teamFromId(save.class_team_id, roomId);
    if (!team) continue;
    const parsed = LifeStateSchema.safeParse(save.state);
    if (!parsed.success) continue;
    const s = parsed.data;
    rows.push({
      team,
      health: healthScore(s),
      efMonths: s.stats.efMonths,
      freedomPct: s.stats.freedomPct,
      stress: s.stats.stress,
      stressLevel: stressLevel(s.stats.stress),
      netWorth: s.stats.netWorth,
      cardDebt: cardRevolving(s) > 0,
      overdue: s.debts.overdueBills > 0,
      turn: s.turn,
    });
  }
  rows.sort(
    (a, b) =>
      b.health - a.health ||
      b.efMonths - a.efMonths ||
      a.stress - b.stress ||
      a.team.localeCompare(b.team, "zh-Hant"),
  );
  return rows.map((r, i) => ({ rank: i + 1, ...r }));
}

// --- loader core (storage passed in) ----------------------------------------------------------

/**
 * The storage the loader needs: the shape of lib/db.ts's save functions.
 * lib/lifeGame/classServer.ts passes the real ones; tests pass an in-memory
 * store. Declared here, not imported, so this file never pulls lib/db.ts
 * (server-only) into a browser bundle.
 */
export interface ClassSaveStore {
  getTeamLifeSave(classTeamId: string): Promise<LifeGameSave | null>;
  createLifeSave(input: {
    student_id: string;
    class_team_id: string | null;
    state: unknown;
    state_version: number;
    seed: number;
  }): Promise<LifeGameSave>;
  updateLifeSave(id: string, state: unknown, expectedUpdatedAt: string): Promise<LifeGameSave | null>;
}

export interface LoadedTeamGame {
  save: LifeGameSave;
  state: LifeState;
  ctx: GameContext;
}

/**
 * Load the team's shared save, creating it with the room's seed on first
 * open. The creating student is recorded as captain. The store is passed in
 * (./classServer.ts hands it lib/db.ts) so this file stays importable from the
 * browser bundle and from tests.
 */
export async function loadOrCreateClassTeam(
  db: ClassSaveStore,
  student: Pick<Student, "id">,
  roomId: string,
  team: string,
  seed: number,
): Promise<LoadedTeamGame | { error: "save_unreadable" }> {
  const ctx = classGameContext();
  const id = classTeamId(roomId, team);
  let save = await db.getTeamLifeSave(id);
  if (!save) {
    const state = startTeamState(seed);
    save = await db.createLifeSave({
      student_id: student.id,
      class_team_id: id,
      state,
      state_version: state.version,
      seed,
    });
  }
  const parsed = LifeStateSchema.safeParse(save.state);
  if (!parsed.success) return { error: "save_unreadable" };
  return { save, state: syncWithContext(parsed.data, ctx), ctx };
}

/** Save with optimistic concurrency; null when a teammate saved first. */
export async function persistClassTeam(
  db: ClassSaveStore,
  save: LifeGameSave,
  state: LifeState,
): Promise<LifeGameSave | null> {
  return db.updateLifeSave(save.id, LifeStateSchema.parse(state), save.updated_at);
}
