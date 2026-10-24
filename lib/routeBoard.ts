/**
 * The route board's data (今天 and 路線, 2026-10-24 redesign): every line with
 * its stations, codes and the student's progress, from the same progress
 * model as the rest of the app. Pure apart from its inputs.
 */
import type { CSSProperties } from "react";
import { LINE_PAGES } from "@/content/linePages";
import { buildLineStations } from "@/lib/buildStations";
import { stationLetterCode } from "@/lib/design/lineCode";
import { lineVars } from "@/lib/design/lineVars";
import { LINES, type LineSlug } from "@/lib/lines";
import { lineStats } from "@/lib/lineStats";
import type { LineStatus } from "@/lib/progressModel";
import type { ModuleProgress, SimulationRun, StudentMode } from "@/lib/types";

export interface BoardStation {
  name: string;
  code: string;
  status: "done" | "next" | "todo";
  terminal: boolean;
  /** The last station is a scenario (終點模擬). */
  scenario: boolean;
  href: string | null;
}

export interface BoardLine {
  slug: LineSlug;
  name: string;
  /** The line's letter code, e.g. CR. */
  code: string;
  vars: CSSProperties;
  minutes: number;
  promise: string;
  stations: BoardStation[];
  done: number;
  total: number;
  started: boolean;
  complete: boolean;
  next: BoardStation | null;
}

/** Part E stations open on /station/; the older flow keeps /course/. */
const toStation = (href?: string) => (href ? href.replace(/^\/line\/([^/]+)\/course\//, "/line/$1/station/") : null);

export function routeBoard(
  statuses: LineStatus[],
  progress: ModuleProgress[],
  runsByLine: Record<string, SimulationRun>,
  mode: StudentMode,
): BoardLine[] {
  return LINES.map((line, i) => {
    const st = statuses[i];
    const built = buildLineStations(line, progress, runsByLine[line.slug] ?? null, mode);
    const stations: BoardStation[] = built.map((r, j) => ({
      name: r.label,
      code: stationLetterCode(line, j + 1),
      status: r.status === "done" ? "done" : r.status === "current" ? "next" : "todo",
      terminal: Boolean(r.terminal),
      scenario: r.scenario !== false,
      href: toStation(r.href),
    }));
    const done = stations.filter((x) => x.status === "done").length;
    return {
      slug: line.slug,
      name: line.name,
      code: stationLetterCode(line, 1).replace(/\d+$/, ""),
      vars: lineVars(line),
      minutes: lineStats(line).minutes,
      promise: LINE_PAGES[line.slug].promise,
      stations,
      done,
      total: stations.length,
      started: st.started && !st.complete,
      complete: st.complete,
      next: stations.find((x) => x.status === "next") ?? null,
    };
  });
}
