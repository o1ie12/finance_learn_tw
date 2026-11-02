/**
 * 10 DATA-1: one source for a station's facts. 今天, the line page, the map
 * sheet, the station page and the line totals all read these; nothing else
 * carries its own copy of a name, a promise or minutes.
 *
 * Minutes are the station content's (lesson.minutes, which the registry
 * computes from the task: lib/tasks/minutes.ts). A last station without a
 * task set (an original simulation) uses ORIGINAL_SIM_MINUTES.
 */
import { stationLetterCode } from "@/lib/design/lineCode";
import { endStation, lineModules, type LineMeta } from "@/lib/lines";
import { lessonForStation, terminalLesson } from "@/lib/tasks/registry";

/** An original simulation's estimate (it has no task content to count). */
export const ORIGINAL_SIM_MINUTES = 10;

export interface StationFacts {
  /** The module number; null for the last station. */
  number: number | null;
  code: string;
  name: string;
  promise: string;
  minutes: number;
  /** Questions in the station's task; null for an original simulation. */
  questions: number | null;
  terminal: boolean;
}

export function stationFacts(line: LineMeta, number: number | null): StationFacts {
  const index = number === null ? line.stationModules.length + 1 : line.stationModules.indexOf(number) + 1;
  const code = stationLetterCode(line, index);
  if (number === null) {
    const lesson = terminalLesson(line.slug);
    const end = endStation(line);
    return {
      number: null,
      code,
      name: end.name,
      promise: lesson?.doLine ?? end.title,
      minutes: lesson?.minutes ?? ORIGINAL_SIM_MINUTES,
      questions: lesson ? lesson.task.steps.length : null,
      terminal: true,
    };
  }
  const mod = lineModules(line).find((m) => m.number === number);
  const lesson = lessonForStation(line.slug, number);
  return {
    number,
    code,
    name: mod?.station ?? "",
    promise: lesson?.doLine ?? mod?.title ?? "",
    minutes: lesson?.minutes ?? mod?.minutes ?? ORIGINAL_SIM_MINUTES,
    questions: lesson ? lesson.task.steps.length : null,
    terminal: false,
  };
}

/** Every station of a line, last one included, and the totals. */
export function lineFacts(line: LineMeta): { stations: StationFacts[]; total: number; minutes: number } {
  const stations = [...line.stationModules.map((n) => stationFacts(line, n)), stationFacts(line, null)];
  return { stations, total: stations.length, minutes: stations.reduce((a, s) => a + s.minutes, 0) };
}
