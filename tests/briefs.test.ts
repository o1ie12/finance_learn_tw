/**
 * 06 F3.1: every task set has a complete brief (sender, message, learn, do,
 * minutes) and no message is longer than 60 characters. 10 DATA-1: the
 * minutes are the content estimate (lib/tasks/minutes.ts), on the lesson and
 * the brief alike.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { afterLesson, allLineContent } from "@/lib/tasks/registry";
import { estimateMinutes } from "@/lib/tasks/minutes";
import { charLength } from "@/lib/tasks/validate";

test("every task set has a complete brief, message ≤ 60 characters", () => {
  const problems: string[] = [];
  for (const line of allLineContent()) {
    const lessons = [...line.lessons, ...(afterLesson(line.slug) ? [afterLesson(line.slug)!] : [])];
    for (const l of lessons) {
      const b = l.task.brief;
      const id = l.task.id;
      if (!b?.from?.name || !b.from.role || !b.from.org) problems.push(`${id}: no sender`);
      if (!b?.message || !b.learn || !b.do) problems.push(`${id}: message, learn or do missing`);
      if (charLength(b?.message ?? "") > 60) problems.push(`${id}: message ${charLength(b.message)} characters`);
      if (l.placement !== "library" || line.lessons.includes(l)) {
        if (b?.minutes !== estimateMinutes(l.task) || l.minutes !== b.minutes) problems.push(`${id}: minutes ${l.minutes} / ${b?.minutes}, estimate ${estimateMinutes(l.task)}`);
      }
    }
  }
  assert.deepEqual(problems, []);
});
