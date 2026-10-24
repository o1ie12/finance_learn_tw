/**
 * 06 F3.1: every task set has a complete brief (sender, message, learn, do,
 * minutes) and no message is longer than 60 characters.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { afterLesson, allLineContent } from "@/lib/tasks/registry";
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
      if (!(b?.minutes >= 1 && b.minutes <= 20)) problems.push(`${id}: minutes ${b?.minutes}`);
    }
  }
  assert.deepEqual(problems, []);
});
