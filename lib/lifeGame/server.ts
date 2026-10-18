import "server-only";

/**
 * Server-side glue for the life game: gather the facts the engine needs from
 * the rest of the app (completions, profile, 學貸線's repayment), and load,
 * create and save games. Only API routes and server components call this.
 */

import {
  createLifeSave,
  getLatestSimulationRunsByLine,
  getLineCompletions,
  getProgress,
  getSoloLifeSave,
  getTeamLifeSave,
  updateLifeSave,
} from "@/lib/db";
import { effectiveMode } from "@/lib/modeModel";
import { allLineStatuses } from "@/lib/progressModel";
import { readStoredResult } from "@/lib/sims/types";
import { readProfile } from "@/lib/studentProfile";
import type { LifeGameSave, Student } from "@/lib/types";
import { newGame, syncWithContext, type GameContext } from "./engine";
import { newSeed } from "./rng";
import { LifeStateSchema, type LifeState } from "./types";

export interface LoadedGame {
  save: LifeGameSave;
  state: LifeState;
  ctx: GameContext;
}

/** Completed lines: sticky completions ∪ live status, in the student's mode (02 §7.1). */
export async function completedLines(student: Student): Promise<Set<string>> {
  const [progress, runsByLine, sticky] = await Promise.all([
    getProgress(student.id),
    getLatestSimulationRunsByLine(student.id),
    getLineCompletions(student.id),
  ]);
  const statuses = allLineStatuses(progress, runsByLine, effectiveMode(student.mode), sticky);
  const done = new Set<string>(sticky);
  for (const s of statuses) if (s.complete) done.add(s.line.slug);
  return done;
}

export async function gameContextFor(student: Student): Promise<GameContext> {
  const profile = readProfile(student.profile);
  const [completed, runsByLine] = await Promise.all([
    completedLines(student),
    getLatestSimulationRunsByLine(student.id),
  ]);
  let studentLoanMonthly: number | null = null;
  const loanRun = runsByLine["xuedai"];
  if (loanRun) {
    const r = readStoredResult(loanRun.kind, loanRun.outcome_summary);
    if (r && r.kind === "xuedai_student_loan_v2") studentLoanMonthly = Math.round(r.outcome.monthlyRepayment);
  }
  return {
    completed,
    profile: {
      careerPathId: profile.careerPathId,
      monthlyIncome: profile.monthlyIncome,
      creditRecord: profile.creditRecord,
    },
    studentLoanMonthly,
    goal: profile.goal ? { name: profile.goal.name, amount: profile.goal.amount, months: profile.goal.months } : null,
  };
}

function parseState(raw: unknown): LifeState | null {
  const parsed = LifeStateSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

/** Load the student's solo game, creating one if none exists (02 §9 test 12). */
export async function loadOrCreateSolo(student: Student): Promise<LoadedGame | { error: "save_unreadable" }> {
  const ctx = await gameContextFor(student);
  let save = await getSoloLifeSave(student.id);
  if (!save) {
    const seed = newSeed();
    const state = newGame(seed, ctx);
    save = await createLifeSave({
      student_id: student.id,
      class_team_id: null,
      state,
      state_version: state.version,
      seed,
    });
  }
  const state = parseState(save.state);
  if (!state) return { error: "save_unreadable" };
  return { save, state: syncWithContext(state, ctx), ctx };
}

/** A class team's shared save, created with the room's seed (02 §8). */
export async function loadOrCreateTeam(
  student: Student,
  classTeamId: string,
  seed: number,
): Promise<LoadedGame | { error: "save_unreadable" }> {
  const ctx = await gameContextFor(student);
  let save = await getTeamLifeSave(classTeamId);
  if (!save) {
    const state = newGame(seed, ctx);
    save = await createLifeSave({
      student_id: student.id,
      class_team_id: classTeamId,
      state,
      state_version: state.version,
      seed,
    });
  }
  const state = parseState(save.state);
  if (!state) return { error: "save_unreadable" };
  return { save, state: syncWithContext(state, ctx), ctx };
}

/** Save with optimistic concurrency; null when someone else saved first. */
export async function persist(save: LifeGameSave, state: LifeState): Promise<LifeGameSave | null> {
  return updateLifeSave(save.id, LifeStateSchema.parse(state), save.updated_at);
}
