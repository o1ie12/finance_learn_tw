import { LINES, type LineMeta } from "@/lib/lines";
import { getModule } from "@/lib/modules";
import { requiredStations } from "@/lib/modeModel";
import type { ModuleProgress, SimulationRun, StudentMode } from "@/lib/types";

export interface NextStep {
  kind: "station" | "sim";
  moduleNumber?: number;
  href: string;
  label: string; // e.g. 「記帳站」 or 「第一份薪水模擬」
}

export interface LineStatus {
  line: LineMeta;
  stationsDone: number;
  stationsTotal: number;
  simDone: boolean;
  started: boolean;
  // Every station this student's mode REQUIRES, plus the terminal
  // simulation. In sim_first the deep stations are optional, so they do not
  // hold completion hostage — the UI already tells students as much.
  complete: boolean;
  next: NextStep | null; // first unfinished step in this line
}

export function moduleDoneSet(progress: ModuleProgress[]): Set<number> {
  return new Set(
    progress.filter((p) => p.completed_at).map((p) => p.module_number),
  );
}

/**
 * `mode` is required rather than defaulted: completion and "what's next" both
 * depend on it, and a caller that forgets would silently hold a sim_first
 * student to the full-mode bar — the bug this parameter exists to remove.
 */
export function lineStatus(
  line: LineMeta,
  done: Set<number>,
  run: SimulationRun | null,
  mode: StudentMode,
): LineStatus {
  const mods = requiredStations(line, mode);
  const stationsDone = mods.filter((m) => done.has(m.number)).length;
  const simDone = Boolean(run);
  const simReady = line.sim.ready;
  const complete = stationsDone === mods.length && (simDone || !simReady);
  const started = stationsDone > 0 || simDone;

  // First unfinished REQUIRED station, else the terminal sim. A deep station
  // can never surface here for a sim_first student, because it is not in the
  // required set to begin with.
  let next: NextStep | null = null;
  const firstTodo = mods.find((m) => !done.has(m.number));
  if (firstTodo) {
    next = {
      kind: "station",
      moduleNumber: firstTodo.number,
      href: `/line/${line.slug}/course/${firstTodo.number}`,
      label: firstTodo.station,
    };
  } else if (!simDone && simReady) {
    next = {
      kind: "sim",
      href: `/line/${line.slug}/simulation`,
      label: line.sim.title,
    };
  }

  return {
    line,
    stationsDone,
    stationsTotal: mods.length,
    simDone,
    started,
    complete,
    next,
  };
}

export function allLineStatuses(
  progress: ModuleProgress[],
  runsByLine: Record<string, SimulationRun>,
  mode: StudentMode,
): LineStatus[] {
  const done = moduleDoneSet(progress);
  return LINES.map((line) =>
    lineStatus(line, done, runsByLine[line.slug] ?? null, mode),
  );
}

/**
 * The single "continue where you left off" action. Prefers a line the student
 * has already started, otherwise the first not-yet-complete line in canonical
 * order. Returns null only when every line is complete.
 */
export function nextActionAcrossLines(
  statuses: LineStatus[],
): { line: LineMeta; step: NextStep } | null {
  const openable = statuses.filter((s) => !s.complete && s.next);
  if (openable.length === 0) return null;
  const started = openable.find((s) => s.started);
  const pick = started ?? openable[0];
  return { line: pick.line, step: pick.next! };
}

/** Quiz score for a module, if completed. */
export function moduleScore(
  progress: ModuleProgress[],
  moduleNumber: number,
): ModuleProgress | undefined {
  return progress.find(
    (p) => p.module_number === moduleNumber && p.completed_at,
  );
}

/** Human label for a module number (station name). */
export function stationName(moduleNumber: number): string {
  return getModule(moduleNumber)?.station ?? `站 ${moduleNumber}`;
}
