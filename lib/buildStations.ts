import { requiredStations } from "@/lib/modeModel";
import type { StudentMode } from "@/lib/types";
import type { RouteStation } from "@/components/RouteMap";
import { lineModules, type LineMeta } from "@/lib/lines";
import { moduleDoneSet } from "@/lib/progressModel";
import type { ModuleProgress, SimulationRun } from "@/lib/types";

/**
 * Build one line's station list for the transit map: its station modules plus
 * the terminal simulation. Every stop shares the line's color (MRT metaphor).
 * The first unfinished station is "current"; the terminal is "current" only
 * once every station is done.
 */
export function buildLineStations(
  line: LineMeta,
  progress: ModuleProgress[],
  run: SimulationRun | null,
  mode: StudentMode,
): RouteStation[] {
  const done = moduleDoneSet(progress);
  // Only a REQUIRED station can be "current". In sim_first the deep stations
  // are shown but optional, and marking one as the next stop put the map's
  // dot on a station the hero card (which is mode-aware) was not pointing
  // at — two "next" indicators on one screen, disagreeing.
  const required = new Set(requiredStations(line, mode).map((m) => m.number));
  const scoreByModule = new Map(
    progress.filter((p) => p.completed_at).map((p) => [p.module_number, p]),
  );

  let currentAssigned = false;
  const stations: RouteStation[] = lineModules(line).map((m) => {
    const isDone = done.has(m.number);
    const isRequired = required.has(m.number);
    let status: RouteStation["status"];
    if (isDone) {
      status = "done";
    } else if (isRequired && !currentAssigned) {
      status = "current";
      currentAssigned = true;
    } else {
      status = "todo";
    }
    const p = scoreByModule.get(m.number);
    return {
      key: `${line.slug}-m${m.number}`,
      label: m.station,
      title: m.title,
      color: line.color,
      colorInk: line.colorInk,
      href: `/line/${line.slug}/course/${m.number}`,
      status,
      required: isRequired,
      meta: p
        ? `${p.quiz_score} / ${p.quiz_total}`
        : isRequired
          ? undefined
          : "選讀",
    };
  });

  const simStatus: RouteStation["status"] = run
    ? "done"
    : currentAssigned || required.size === 0
      ? "todo"
      : "current";

  stations.push({
    key: `${line.slug}-sim`,
    label: line.sim.station,
    title: line.sim.title,
    color: line.color,
    colorInk: line.colorInk,
    href: line.sim.ready ? `/line/${line.slug}/simulation` : undefined,
    status: simStatus,
    terminal: true,
    required: true,
    meta: line.sim.ready ? undefined : "即將推出",
  });

  return stations;
}
