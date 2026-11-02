import type { LineMeta } from "@/lib/lines";
import { lineFacts } from "@/lib/stationFacts";

export { ORIGINAL_SIM_MINUTES } from "@/lib/stationFacts";

/**
 * 06 G5 item 2, the one rule: 站 = every station including the last one;
 * 分鐘 = the sum of all of them. 10 DATA-1: both come from lib/stationFacts.
 * The landing, /lines, the line page and 今天 all read this, and
 * tests/lineStats.test.ts holds them to it.
 */
export function lineStats(line: LineMeta): { stations: number; minutes: number } {
  const f = lineFacts(line);
  return { stations: f.total, minutes: f.minutes };
}
