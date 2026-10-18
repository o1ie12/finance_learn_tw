/**
 * 05 A1: every station runs the 5-step station flow. A station with no task
 * set of its own wraps its quiz (lib/tasks/wrapped.ts); none falls back to
 * the old reading page and quiz, which now opens only from 「看完整課文」.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { LINES } from "@/lib/lines";
import { getModule } from "@/lib/modules";
import { lessonForStation } from "@/lib/tasks/registry";
import { WRAPPED_STATIONS } from "@/content/stations";
import { CONTENT_BY_SLUG } from "@/content";
import { validateAll } from "@/lib/tasks/validate";

test("every station of every line has a station-flow lesson", () => {
  const missing: string[] = [];
  for (const line of LINES) {
    for (const n of line.stationModules) {
      if (!lessonForStation(line.slug, n)) missing.push(`${line.slug} station ${n}`);
    }
  }
  assert.deepEqual(missing, []);
});

test("a wrapped station asks its whole quiz, with 1 to 3 lesson cards and a hook", () => {
  for (const line of LINES) {
    for (const n of line.stationModules) {
      const copy = WRAPPED_STATIONS[n];
      if (!copy) continue;
      const lesson = lessonForStation(line.slug, n);
      if (lesson?.task.id !== `${line.slug}.m${n}.v1`) continue; // an authored task set wins
      const mod = getModule(n)!;
      assert.equal(lesson.task.steps.length, mod.quiz.length, `station ${n}`);
      assert.ok(lesson.lessonCards.length >= 1 && lesson.lessonCards.length <= 3, `station ${n} cards`);
      assert.ok(lesson.hook.options.length >= 2, `station ${n} hook`);
      assert.ok(lesson.lifeGameTurn, `station ${n} turn`);
      lesson.task.steps.forEach((s, i) => {
        assert.equal(s.type, "choice");
        if (s.type === "choice") assert.equal(s.correct, `o${mod.quiz[i].answer}`);
      });
    }
  }
});

test("every wrapped copy belongs to a station on a line", () => {
  for (const n of Object.keys(WRAPPED_STATIONS).map(Number)) {
    const line = LINES.find((l) => l.stationModules.includes(n));
    assert.ok(line, `station ${n} is on a line`);
  }
});

test("the wrapped lessons pass the content validator", () => {
  const entries = Object.entries(CONTENT_BY_SLUG).map(([slug, content]) => ({ file: `wrapped:${slug}`, content, fileSlug: slug }));
  const errors = validateAll(entries).filter((i) => i.level === "error");
  assert.deepEqual(errors.map((e) => `${e.file} ${e.path}: ${e.message}`), []);
});
