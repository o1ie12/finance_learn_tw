/** 06 F3.9: verifiedOn warns at 12 months, fails at 18, and must be YYYY-MM. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkVerifiedOn } from "@/lib/tasks/validate";

const now = new Date(2026, 9, 24); // 2026-10
const level = (v: string) => checkVerifiedOn(v, now, "p", "f")[0]?.level ?? "ok";

test("verifiedOn: fresh is fine, 12 months warns, 18 months fails", () => {
  assert.equal(level("2026-10"), "ok");
  assert.equal(level("2025-11"), "ok"); // 11 months
  assert.equal(level("2025-10"), "warning"); // 12
  assert.equal(level("2025-05"), "warning"); // 17
  assert.equal(level("2025-04"), "error"); // 18
  assert.equal(level("2026-13"), "error"); // not a month
  assert.equal(checkVerifiedOn(undefined, now, "p", "f").length, 0);
});
