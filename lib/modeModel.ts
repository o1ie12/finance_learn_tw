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

/**
 * What a student gets before they have chosen. Simulation-first is the
 * product's intended starting point: reach a real decision without required
 * reading, and let the stations be there for whoever wants them.
 *
 * This is load-bearing right now — students.mode is null for every existing
 * account, so this constant, not a stored preference, decides what almost
 * everyone sees.
 */
export const DEFAULT_MODE: StudentMode = "sim_first";

/** Where a student with this mode should land when they arrive or sign in. */
export function homeFor(mode: StudentMode | null): string {
  return effectiveMode(mode) === "sim_first" ? "/simulate" : "/dashboard";
}

/** Mode to use before a student has picked one. */
export function effectiveMode(mode: StudentMode | null): StudentMode {
  return mode ?? DEFAULT_MODE;
}

/**
 * The stations a student must finish for the line to count as complete, in
 * this mode. sim_first requires core only; full requires all of them.
 *
 * Deliberately not called "visible" — in sim_first the deep stations are
 * still shown and still linked, they simply are not required. Conflating
 * "shown" with "required" is what made completion unreachable in sim_first:
 * the UI told students the deep stations were optional while the progress
 * model quietly kept demanding them.
 */
export function requiredStations(
  line: LineMeta,
  mode: StudentMode,
): ModuleMeta[] {
  const all = lineModules(line);
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
