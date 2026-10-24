/**
 * 06 G3: a student mid-station when the order changes lands on the same stop
 * by name. Seeded positions for every stop, in both orders.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePosition, resumeAt, type SavedPosition, type Stop } from "@/lib/flowPosition";

const STOPS: Stop[] = ["hook", "task", "lesson", "compare"];
const EXPECT: Record<Stop, string> = { hook: "hook", task: "brief", lesson: "card", compare: "brief" };

test("G3: every stop, saved in the old order (v1) or the new (v2), opens on the same stop", () => {
  for (const v of [1, 2] as const) {
    for (const stop of STOPS) {
      const saved: SavedPosition = { v, stop, attempt: 1 };
      assert.equal(resumeAt(parsePosition(JSON.stringify(saved)), 1, true), EXPECT[stop], `v${v} ${stop}`);
    }
  }
});

test("G3: the old 'lesson' goes to the new lesson; with no cards, to the task", () => {
  assert.equal(resumeAt({ v: 1, stop: "lesson", attempt: 2 }, 2, true), "card");
  assert.equal(resumeAt({ v: 1, stop: "lesson", attempt: 2 }, 2, false), "brief");
  assert.equal(resumeAt({ v: 1, stop: "task", attempt: 2 }, 2, true), "brief", "task stays task");
});

test("G3: a position from an older attempt is stale; junk is ignored", () => {
  assert.equal(resumeAt({ v: 1, stop: "lesson", attempt: 1 }, 2, true), null);
  for (const raw of [null, "", "x", "{}", JSON.stringify({ v: 3, stop: "task", attempt: 1 }), JSON.stringify({ v: 1, stop: "quiz", attempt: 1 }), JSON.stringify({ v: 1, stop: "task" })])
    assert.equal(parsePosition(raw), null, String(raw));
});
