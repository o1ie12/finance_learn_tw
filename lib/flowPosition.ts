/**
 * 06 G3: where a student is inside a station, saved by stop NAME (never an
 * index) so a change of order cannot send anyone to the wrong place.
 *
 * Stops: hook (想一想), task (the ticket and the steps), lesson (先懂, the side
 * notes), compare (對答案 and after). `v` is the order the position was saved
 * in: 1 = lesson before task (before Part G), 2 = task before lesson.
 *
 * Saved on the device (localStorage), per student and task set. Nothing is
 * written to the database, so a saved position can never clobber a profile.
 */
export type Stop = "hook" | "task" | "lesson" | "compare";
export interface SavedPosition {
  v: 1 | 2;
  stop: Stop;
  /** The attempt it was saved in: a newer attempt makes it stale. */
  attempt: number;
}
/** Where a flow opens. */
export type ResumeAt = "hook" | "brief" | "card";

export const positionKey = (studentId: string, taskSetId: string) => `finline:pos:${studentId}:${taskSetId}`;

export function parsePosition(raw: string | null): SavedPosition | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<SavedPosition>;
    if ((p.v === 1 || p.v === 2) && ["hook", "task", "lesson", "compare"].includes(p.stop as string) && typeof p.attempt === "number") {
      return { v: p.v, stop: p.stop as Stop, attempt: p.attempt };
    }
  } catch {
    /* not ours */
  }
  return null;
}

/**
 * The migration (G3): open a saved position in the current order.
 * - A position from an older attempt is stale: null (start as usual).
 * - hook stays hook.
 * - task stays task (the ticket).
 * - lesson goes to lesson, whichever order it was saved in. In the new order
 *   the side notes come after the task; with no result yet, moving on from
 *   them leads to the task (StationFlowE).
 * - compare can only be reached after a submit, which starts a new attempt,
 *   so a same-attempt compare means the result was not kept: the task.
 * Lesson cards missing: lesson goes to the task.
 */
export function resumeAt(saved: SavedPosition | null, attempt: number, hasCards: boolean): ResumeAt | null {
  if (!saved || saved.attempt !== attempt) return null;
  switch (saved.stop) {
    case "hook":
      return "hook";
    case "lesson":
      return hasCards ? "card" : "brief";
    case "task":
    case "compare":
      return "brief";
  }
}
