/**
 * 05 Part B: the monthly 生活風格 step. 省 several months in a row adds
 * stress: +5 a month from the third, at most +15; 普通 or 享受 resets it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { lifestyleStress, newGame, runAutopilot, type GameContext } from "@/lib/lifeGame/engine";
import type { LifestyleLevel } from "@/lib/lifeGame/types";

const CTX: GameContext = { completed: new Set(["zhiya", "cunqian"]), profile: {}, studentLoanMonthly: null };

/**
 * Plays one month per choice and returns the stress the 生活風格 step added
 * each month. Autopilot calls `moves` at the 行動 step, right after
 * 生活風格 and before any event, so stressAdjust is the streak's alone.
 */
function addedByMonth(choices: LifestyleLevel[], seed = 5): number[] {
  const added: number[] = [];
  let s = newGame(seed, CTX);
  for (const level of choices) {
    s = runAutopilot(s, CTX, 1, {
      stopEarly: false,
      lifestyle: () => level,
      moves: (x) => {
        added.push(x.pending.stressAdjust);
        return {};
      },
    });
  }
  return added;
}

test("lifestyleStress: nothing before the third 省 month, then +5 a month, capped at +15", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 12].map(lifestyleStress), [0, 0, 0, 5, 10, 15, 15, 15]);
});

test("省 every month: stress grows by 5 a month to +15 and stays there", () => {
  assert.deepEqual(addedByMonth(Array(8).fill("save")), [0, 0, 5, 10, 15, 15, 15, 15]);
});

test("普通 or 享受 resets the streak, and 省 starts counting again from zero", () => {
  for (const reset of ["normal", "enjoy"] as const) {
    assert.deepEqual(
      addedByMonth(["save", "save", "save", "save", reset, "save", "save", "save"]),
      [0, 0, 5, 10, 0, 0, 0, 5],
      reset,
    );
  }
});

test("the default is last month's choice; a new game starts on 普通", () => {
  const s = newGame(3, CTX);
  assert.deepEqual(s.lifestyle, { last: "normal", saveStreak: 0 });
  const after = runAutopilot(s, CTX, 2, { stopEarly: false, lifestyle: (x) => (x.turn === 0 ? "enjoy" : x.lifestyle.last) });
  assert.equal(after.lifestyle.last, "enjoy");
});
