import type { RouteStation } from "@/components/RouteMap";
import { MODULES, SIMULATION_STATION } from "@/lib/modules";
import type { ModuleProgress, SimulationRun } from "@/lib/types";

/**
 * Turn stored progress into the transit-map station list. The first
 * not-yet-completed stop becomes the "current" station; the simulation is the
 * terminal station and is "current" only once every module is done.
 */
export function buildStations(
  progress: ModuleProgress[],
  latestRun: SimulationRun | null,
): RouteStation[] {
  const doneByNumber = new Map(
    progress.filter((p) => p.completed_at).map((p) => [p.module_number, p]),
  );

  let currentAssigned = false;
  const stations: RouteStation[] = MODULES.map((m) => {
    const done = doneByNumber.get(m.number);
    let status: RouteStation["status"];
    if (done) {
      status = "done";
    } else if (!currentAssigned) {
      status = "current";
      currentAssigned = true;
    } else {
      status = "todo";
    }
    return {
      key: `m${m.number}`,
      label: m.station,
      title: m.title,
      color: m.color,
      href: `/course/${m.number}`,
      status,
      meta: done ? `${done.quiz_score} / ${done.quiz_total}` : undefined,
    };
  });

  const simStatus: RouteStation["status"] = latestRun
    ? "done"
    : currentAssigned
      ? "todo"
      : "current";

  stations.push({
    key: "sim",
    label: SIMULATION_STATION.station,
    title: SIMULATION_STATION.title,
    color: "#151a21",
    href: "/simulation",
    status: simStatus,
    terminal: true,
  });

  return stations;
}
