import "server-only";

/**
 * Server-side loader for class 人生賽局 team saves: the pure core in
 * ./class.ts, wired to lib/db.ts. Only API routes import this file; browser
 * code imports ./class.ts (pure helpers and types) only.
 */

import { createLifeSave, getTeamLifeSave, updateLifeSave } from "@/lib/db";
import type { LifeGameSave, Student } from "@/lib/types";
import {
  loadOrCreateClassTeam as loadCore,
  persistClassTeam as persistCore,
  type ClassSaveStore,
  type LoadedTeamGame,
} from "./class";
import type { LifeState } from "./types";

const store: ClassSaveStore = { getTeamLifeSave, createLifeSave, updateLifeSave };

/** The team's shared save, created with the room's seed on first open; the opener becomes captain. */
export function loadTeamGame(
  student: Pick<Student, "id">,
  roomId: string,
  team: string,
  seed: number,
): Promise<LoadedTeamGame | { error: "save_unreadable" }> {
  return loadCore(store, student, roomId, team, seed);
}

/** Save with optimistic concurrency; null when a teammate saved first. */
export function persistTeamGame(save: LifeGameSave, state: LifeState): Promise<LifeGameSave | null> {
  return persistCore(store, save, state);
}
