import { lineModules, type LineMeta } from "@/lib/lines";
import { lessonForStation, terminalLesson } from "@/lib/tasks/registry";

/**
 * An original simulation (the lines whose last station is not a task set)
 * has no minutes in its content; this is the estimate used for it.
 */
export const ORIGINAL_SIM_MINUTES = 10;

/**
 * 06 G5 item 2, the one rule: 站 = every station including the last one;
 * 分鐘 = the sum of all of them, from the content (each station's lesson
 * minutes, else the module's). The landing, /lines, the line page and 今天
 * all read this, and tests/lineStats.test.ts holds them to it.
 */
export function lineStats(line: LineMeta): { stations: number; minutes: number } {
  const stationMinutes = lineModules(line).reduce((sum, m) => sum + (lessonForStation(line.slug, m.number)?.minutes ?? m.minutes), 0);
  const end = terminalLesson(line.slug)?.minutes ?? ORIGINAL_SIM_MINUTES;
  return { stations: line.stationModules.length + 1, minutes: stationMinutes + end };
}
