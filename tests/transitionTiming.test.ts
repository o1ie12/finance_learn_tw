/**
 * Train transition timing (01-DESIGN-SYSTEM §7.3).
 *
 * The schedule is the contract between the component's timers and the CSS
 * animation lengths. The source check guards the hidden-tab rule: every
 * phase change comes from setTimeout, never from a frame callback or an
 * end-of-transition event.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  transitionSchedule,
  FULL_DONE_MS,
  SHORT_DONE_MS,
  REDUCED_DONE_MS,
} from "@/lib/transitionTiming";

test("full ride: 2.6s with the five phases at their product times", () => {
  const s = transitionSchedule({ reducedMotion: false, seenFullRides: 0 });
  assert.equal(s.mode, "full");
  assert.equal(s.doneAtMs, 2600);
  assert.equal(FULL_DONE_MS, 2600);
  assert.deepEqual(s.steps, [
    { atMs: 0, phase: "doorsOpen" },
    { atMs: 500, phase: "walkIn" },
    { atMs: 1200, phase: "doorsClose" },
    { atMs: 1700, phase: "depart" },
    { atMs: 2300, phase: "card" },
  ]);
});

test("steps are ascending and all finish before onDone", () => {
  for (const seen of [0, 1, 2, 3, 10]) {
    for (const reducedMotion of [false, true]) {
      const s = transitionSchedule({ reducedMotion, seenFullRides: seen });
      for (let i = 1; i < s.steps.length; i++) {
        assert.ok(s.steps[i].atMs > s.steps[i - 1].atMs);
      }
      assert.ok(s.steps.every((st) => st.atMs < s.doneAtMs));
      assert.equal(s.steps.at(-1)?.phase, "card");
    }
  }
});

test("two full rides still play in full; the third seen ride makes it short", () => {
  assert.equal(transitionSchedule({ reducedMotion: false, seenFullRides: 2 }).mode, "full");
  const s = transitionSchedule({ reducedMotion: false, seenFullRides: 3 });
  assert.equal(s.mode, "short");
  assert.equal(s.doneAtMs, 400);
  assert.equal(SHORT_DONE_MS, 400);
  assert.deepEqual(s.steps, [{ atMs: 0, phase: "card" }]);
});

test("reduced motion is a 120ms crossfade, whatever the ride count", () => {
  for (const seen of [0, 5]) {
    const s = transitionSchedule({ reducedMotion: true, seenFullRides: seen });
    assert.equal(s.mode, "reduced");
    assert.equal(s.doneAtMs, 120);
    assert.deepEqual(s.steps, [{ atMs: 0, phase: "card" }]);
  }
  assert.equal(REDUCED_DONE_MS, 120);
});

test("callers cannot mutate the shared full schedule", () => {
  const a = transitionSchedule({ reducedMotion: false, seenFullRides: 0 });
  a.steps[0].atMs = 999;
  const b = transitionSchedule({ reducedMotion: false, seenFullRides: 0 });
  assert.equal(b.steps[0].atMs, 0);
});

for (const file of ["TrainTransition.tsx", "Train.tsx"]) {
  test(`${file} drives phases with setTimeout only`, () => {
    const src = readFileSync(join(process.cwd(), "components/transition", file), "utf8");
    assert.doesNotMatch(src, /requestAnimationFrame/);
    assert.doesNotMatch(src, /transitionend/i); // also catches onTransitionEnd
    assert.doesNotMatch(src, /animationend/i);
    assert.match(src, /setTimeout/);
    assert.match(src, /transitionSchedule\(/);
  });
}
