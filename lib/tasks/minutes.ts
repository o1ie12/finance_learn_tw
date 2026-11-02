/**
 * 10 DATA-1: a station's minutes, from its content: 2 for 想一想 and the
 * brief, 2 per question, 1 per document. The registry writes this onto every
 * lesson (lesson.minutes and task.brief.minutes), so no hand-typed minutes
 * are read anywhere.
 */
import type { TaskSet } from "./types";

export function estimateMinutes(task: Pick<TaskSet, "steps" | "materials">): number {
  return 2 + 2 * task.steps.length + task.materials.length;
}
