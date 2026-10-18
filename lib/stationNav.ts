/**
 * Where the train goes after a station (01 §6.5 panel 5): the line's next
 * required station in the student's mode, else its simulation page, else
 * home. Pure.
 */

import type { LineMeta } from "@/lib/lines";
import { requiredStations } from "@/lib/modeModel";
import type { StudentMode } from "@/lib/types";

export interface NextStop {
  href: string;
  lineName: string;
  lineColor: string;
  stationName: string;
  blurb: string;
}

export function nextStopAfter(line: LineMeta, moduleNumber: number | null, mode: StudentMode): NextStop {
  const req = requiredStations(line, mode);
  const idx = moduleNumber === null ? req.length : req.findIndex((m) => m.number === moduleNumber);
  const next = idx >= 0 ? req[idx + 1] : undefined;
  if (next) {
    return {
      href: `/line/${line.slug}/course/${next.number}`,
      lineName: line.name,
      lineColor: line.color,
      stationName: next.station,
      blurb: next.subtitle,
    };
  }
  if (moduleNumber !== null) {
    return {
      href: `/line/${line.slug}/simulation`,
      lineName: line.name,
      lineColor: line.color,
      stationName: line.sim.station,
      blurb: line.sim.subtitle,
    };
  }
  return { href: `/line/${line.slug}`, lineName: line.name, lineColor: line.color, stationName: "路線總覽", blurb: line.short };
}

/** The /play URL that plays one month and then rides to `stop`. */
export function playThenRide(stop: NextStop): string {
  const q = new URLSearchParams({
    return: stop.href,
    toLine: stop.lineName,
    toColor: stop.lineColor,
    toStation: stop.stationName,
    toBlurb: stop.blurb,
  });
  return `/play?${q.toString()}`;
}
