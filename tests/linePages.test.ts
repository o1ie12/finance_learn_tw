/** 06 F3.5, F3.6: every line has its program copy, within the rules. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { LINE_PAGES } from "@/content/linePages";
import { LINE_SLUGS } from "@/lib/lines";
import { validateLinePages } from "@/lib/tasks/validate";

test("line pages: all twelve lines pass", () => {
  assert.deepEqual(validateLinePages(LINE_PAGES, LINE_SLUGS, "f"), []);
});

test("line pages: a missing line, a short skill list, 我 and a job promise fail", () => {
  const bad = {
    ...LINE_PAGES,
    xinyong: { ...LINE_PAGES.xinyong, skills: ["一", "二"], promise: "我們帶你學會，保證找到工作。" },
  } as Record<string, (typeof LINE_PAGES)["xinyong"]>;
  delete bad.zuwu;
  const msgs = validateLinePages(bad, LINE_SLUGS, "f").map((i) => i.message);
  assert.ok(msgs.some((m) => m.includes("no program copy")));
  assert.ok(msgs.some((m) => m.includes("4 to 6")));
  assert.ok(msgs.some((m) => m.includes("我")));
  assert.ok(msgs.some((m) => m.includes("job-outcome")));
});

test("line pages: no line has a practitioner video until one is provided (D2)", () => {
  assert.ok(Object.values(LINE_PAGES).every((p) => p.intro === undefined));
});
