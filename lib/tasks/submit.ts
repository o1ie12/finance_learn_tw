import "server-only";

/**
 * Submitting a station or library task (03 §4). The server scores it from
 * the content; the browser sends answers only. A station counts as done
 * when the task passes, or on the second attempt (students are never locked
 * out), or on the first submit of an all-reflection task; only then is
 * module_progress written, through the same rules as POST /api/progress.
 */

import {
  addPoints,
  bumpDailyActivity,
  countTaskAttempts,
  getProgress,
  insertTaskResult,
  updateStudentProfile,
  upsertModuleProgress,
} from "@/lib/db";
import { recordCompletionIfDone } from "@/lib/lineCompletion";
import { STATION_POINTS } from "@/lib/points";
import { readProfile } from "@/lib/studentProfile";
import { taipeiDay } from "@/lib/streak";
import type { Student } from "@/lib/types";
import { findTaskSet } from "./registry";
import { profilePatchForTask } from "./profileWrites";
import { sanitizeAnswers, sanitizeHook } from "./sanitize";
import { answerKey, publicTask, type AnswerKey } from "./publicLesson";
import { prepareLesson } from "./prepare";
import { revealWithReadiness } from "@/lib/lifeGame/readinessReveal";
import { pickReveal } from "./reveal";
import { scoreTask, type TaskScore } from "./scoring";
import { separateWrites } from "./writes";
import type { TaskResult } from "./types";

export interface SubmitOutcome {
  /** The resolved answers for the model-answer screens (05 A2): sent only now. */
  answerKey: AnswerKey;
  result: TaskResult;
  score: TaskScore;
  passed: boolean;
  stationDone: boolean;
  reveal: string;
  attempt: number;
}

export type SubmitError = "unknown_task" | "terminal_task";

export async function submitTask(
  student: Student,
  body: { taskSetId: string; answers: unknown; hookAnswer: unknown },
): Promise<SubmitOutcome | { error: SubmitError }> {
  const found = findTaskSet(body.taskSetId);
  if (!found) return { error: "unknown_task" };
  if (found.lesson.placement === "terminal") return { error: "terminal_task" };
  const { line, lesson, task } = found;

  const profile = readProfile(student.profile);
  const goal = profile.goal ? { amount: profile.goal.amount, months: profile.goal.months } : null;
  // Rebuilt from the content's step shapes: nothing else is scored or stored.
  const answers = sanitizeAnswers(task, body.answers);
  const hookAnswer = sanitizeHook(lesson.hook.options, body.hookAnswer);
  // Reads first, all at once; then the writes, all at once (05 A8.5: every
  // round trip to the database is ~100–200 ms, so they must not queue).
  const [priorAttempts, revealText, prior] = await Promise.all([
    countTaskAttempts(student.id, task.id),
    revealWithReadiness(student, pickReveal(lesson.reveal, hookAnswer, answers), line.slug),
    getProgress(student.id),
  ]);
  const attempt = priorAttempts + 1;
  const reveal = revealText ?? "";
  const score = scoreTask(task, answers, { goal, studentId: student.id, attempt });

  // 06 F3.3: a write step's text goes to the student's own profile only.
  const split = separateWrites(task, answers, score.steps, profile.writes);
  const result: TaskResult = {
    kind: task.kind,
    taskSetId: task.id,
    score: score.score,
    total: score.total,
    steps: split.steps,
    hookAnswer,
    revealShown: reveal,
    provenance: { goal: goal !== null },
    attempt,
    shown: publicTask(task, { taskSetId: task.id, studentId: student.id, attempt }).shown,
  };
  const writes: Promise<unknown>[] = [
    insertTaskResult({
      student_id: student.id,
      line_slug: line.slug,
      station_id: lesson.stationId,
      task_set_id: task.id,
      kind: task.kind,
      score: score.score,
      total: score.total,
      attempt,
      result,
    }),
  ];

  const patch = profilePatchForTask(task.kind, answers, task);
  if (split.writes) patch.writes = split.writes;
  if (Object.keys(patch).length) writes.push(updateStudentProfile(student.id, patch));

  let stationDone = false;
  if (lesson.placement === "station" && lesson.stationId !== null && (score.passed || attempt >= 2)) {
    const already = prior.some((p) => p.module_number === lesson.stationId && p.completed_at);
    // An earned result is never overwritten (old quiz scores keep their meaning).
    if (!already) {
      const pct = score.total === 0 ? 100 : Math.round((score.score / score.total) * 100);
      // Line completion reads the progress row, so it waits for it.
      writes.push(
        upsertModuleProgress(student.id, lesson.stationId, pct, 100).then(() => recordCompletionIfDone(student, line.slug)),
        addPoints(student.id, STATION_POINTS),
        bumpDailyActivity(student.id, taipeiDay(new Date())),
      );
    }
    stationDone = true;
  }
  await Promise.all(writes);
  // The key carries the prepared after-tip (e.g. 投資線's real six months).
  const key = answerKey(prepareLesson(lesson).task, goal);
  return { answerKey: key, result, score, passed: score.passed, stationDone, reveal, attempt };
}
