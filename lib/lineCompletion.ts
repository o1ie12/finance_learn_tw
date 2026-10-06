import "server-only";
import {
  getProgress,
  getLatestSimulationRunForLine,
  recordLineCompletion,
} from "@/lib/db";
import { getLine } from "@/lib/lines";
import { effectiveMode } from "@/lib/modeModel";
import { lineStatus, moduleDoneSet } from "@/lib/progressModel";
import type { Student } from "@/lib/types";

/**
 * Record a line's completion the moment a submission completes it.
 *
 * Called after every station quiz and every simulation run — the only two
 * events that can complete a line. Completion is judged LIVE here (on today's
 * required stations), never from the stored record, so this can only ever add
 * a completion that was actually earned. Once recorded it is kept: a station
 * added to the line later does not take it back (lib/progressModel.ts).
 */
export async function recordCompletionIfDone(
  student: Student,
  lineSlug: string,
): Promise<boolean> {
  const line = getLine(lineSlug);
  if (!line) return false;
  const [progress, run] = await Promise.all([
    getProgress(student.id),
    getLatestSimulationRunForLine(student.id, lineSlug),
  ]);
  const status = lineStatus(line, moduleDoneSet(progress), run, effectiveMode(student.mode), false);
  if (!status.complete) return false;
  await recordLineCompletion(student.id, lineSlug);
  return true;
}
