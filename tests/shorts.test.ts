/** 06 F3.10: every Short resolves to one standalone step of a real task. */
import { isHiddenTask } from "@/lib/tasks/hidden";
import { test } from "node:test";
import assert from "node:assert/strict";
import { SHORTS } from "@/content/shorts";
import { SHORT_KIND, findTaskSet, shortLesson } from "@/lib/tasks/registry";

test("Shorts: each resolves to one step, with no document, never a station", () => {
  assert.ok(SHORTS.length >= 3);
  for (const ref of SHORTS) {
    const found = shortLesson(ref.id);
    assert.ok(found, `${ref.id} resolves`);
    assert.equal(found.task.steps.length, 1);
    assert.equal(found.task.materials.length, 0);
    assert.ok(!("materialIndex" in found.task.steps[0]), `${ref.id} needs no document`);
    assert.equal(found.lesson.placement, "library");
    assert.equal(found.task.kind, SHORT_KIND);
    // A Short from a task with an unverified fact stays hidden (06 G5 item 7).
    if (isHiddenTask(ref.id)) assert.equal(findTaskSet(ref.id), null, `${ref.id} is hidden`);
    else assert.equal(findTaskSet(ref.id)?.task.id, ref.id, "the API finds it");
    assert.ok(!/\{\{/.test(JSON.stringify(found.task.steps[0])), `${ref.id} has its figures filled`);
  }
  assert.equal(new Set(SHORTS.map((r) => r.id)).size, SHORTS.length);
});
