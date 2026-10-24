import "server-only";
import { getTaskResults } from "@/lib/db";
import type { LineSlug } from "@/lib/lines";
import { drawIndices, hashString } from "./draw";
import { lineContent, terminalLesson } from "./registry";
import type { StationLesson } from "./types";
import { isWrappedTask } from "./wrapped";

/** The terminal task set to run, or null when the line keeps its simulation. */
export async function pickTerminal(slug: LineSlug, studentId: string): Promise<StationLesson | null> {
  if (slug === "zhapian") {
    // A case not yet played (station or simulation page: both are logged in
    // task_results), picked by a seed from the student and how many they
    // have played, so a refresh shows the same case.
    // Case files only: a wrapped station quiz is not a case (05 A1).
    const cases = (lineContent(slug)?.lessons ?? []).filter((l) => !isWrappedTask(l.task));
    const played = new Set((await getTaskResults(studentId)).map((r) => r.task_set_id));
    const unplayed = cases.filter((c) => !played.has(c.task.id));
    const pool = unplayed.length ? unplayed : cases;
    if (!pool.length) return null;
    const pick = drawIndices(pool.length, 1, hashString(`${studentId}|zhapian|${played.size}`))[0];
    return { ...pool[pick], placement: "terminal" };
  }
  return terminalLesson(slug);
}
