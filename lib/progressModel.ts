import { LINES, lineModules, type LineMeta } from "@/lib/lines";
import { getModule } from "@/lib/modules";
import type { ModuleProgress, SimulationRun } from "@/lib/types";

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
  complete: boolean; // every station + the terminal simulation done
  next: NextStep | null; // first unfinished step in this line
}

export function moduleDoneSet(progress: ModuleProgress[]): Set<number> {
  return new Set(
    progress.filter((p) => p.completed_at).map((p) => p.module_number),
  );
}

export function lineStatus(
  line: LineMeta,
  done: Set<number>,
  run: SimulationRun | null,
): LineStatus {
  const mods = lineModules(line);
  const stationsDone = mods.filter((m) => done.has(m.number)).length;
  const simDone = Boolean(run);
  const simReady = line.sim.ready;
  const complete = stationsDone === mods.length && (simDone || !simReady);
  const started = stationsDone > 0 || simDone;

  // First unfinished step: an incomplete station, else the terminal sim.
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
): LineStatus[] {
  const done = moduleDoneSet(progress);
  return LINES.map((line) =>
    lineStatus(line, done, runsByLine[line.slug] ?? null),
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
