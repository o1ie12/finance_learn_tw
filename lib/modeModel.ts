import { lineModules, type LineMeta } from "@/lib/lines";
import type { ModuleMeta } from "@/lib/modules";
import type { StudentMode } from "@/lib/types";

/**
 * What each entry mode shows, derived from one content base.
 *
 * The two modes exist to serve two different partners from the same
 * material: one wants a student to reach an interactive decision without
 * required reading, the other wants the full curriculum-aligned path. They
 * are a *view*, not a second set of content — which is why everything here
 * is computed from the same `lineModules()` the full path already uses. If
 * this file ever starts holding content of its own, the modes have forked
 * and the whole arrangement has failed.
 */

export const DEFAULT_MODE: StudentMode = "full";

/** Mode to use before a student has picked one. */
export function effectiveMode(mode: StudentMode | null): StudentMode {
  return mode ?? DEFAULT_MODE;
}

/** Stations to show on a line, for a given mode. */
export function visibleStations(
  line: LineMeta,
  mode: StudentMode,
): ModuleMeta[] {
  const all = lineModules(line);
  // sim_first keeps deep stations reachable by direct link — they are just
  // not part of the path. Hiding them from the route would turn "optional"
  // into "gone", and a student who wants the detail should still find it.
  return mode === "sim_first" ? all.filter((m) => m.tier === "core") : all;
}

/** Stations present on the line but not on this mode's path. */
export function optionalStations(
  line: LineMeta,
  mode: StudentMode,
): ModuleMeta[] {
  if (mode !== "sim_first") return [];
  return lineModules(line).filter((m) => m.tier === "deep");
}

/**
 * Whether reading is required before the simulation. In sim_first it never
 * is — that is the entire point of the mode.
 */
export function readingRequired(mode: StudentMode): boolean {
  return mode === "full";
}

export interface SimTip {
  moduleNumber: number;
  station: string;
  text: string;
}

/**
 * The inline tips shown inside a simulation in sim_first mode: one per core
 * station on that line, in station order.
 *
 * Falls back to `subtitle` where a station has no purpose-written `tip`, so
 * the mechanism works today and improves as real copy lands. Returns nothing
 * in full mode — a student who has read the stations does not need the same
 * sentences repeated back at them mid-decision.
 */
export function simTips(line: LineMeta, mode: StudentMode): SimTip[] {
  if (mode !== "sim_first") return [];
  return lineModules(line)
    .filter((m) => m.tier === "core")
    .map((m) => ({
      moduleNumber: m.number,
      station: m.station,
      text: m.tip ?? m.subtitle,
    }));
}
