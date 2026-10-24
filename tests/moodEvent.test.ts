/**
 * 06 P2 task 9: the 情緒消費 event. It comes only when stress is up; its
 * safest option is the three questions; it has text and is labelled 示意.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { eventIsIllustrative } from "@/components/play/playModel";
import { MOOD_EVENT_MIN_STRESS } from "@/lib/lifeGame/constants";
import { RANDOM_EVENT_IDS, SAFEST_OPTION, drawEvents, newGame } from "@/lib/lifeGame/engine";
import { EVENT_TEXT } from "@/lib/lifeGame/eventText";
import { LINE_SLUGS } from "@/lib/lines";

const ctx = { completed: new Set<string>(LINE_SLUGS), profile: {}, studentLoanMonthly: 3_000 };

function seen(stress: number): number {
  let n = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const s = newGame(seed, ctx);
    s.stats.stress = stress;
    for (let turn = 0; turn < 24; turn++) {
      s.turn = turn;
      if (drawEvents(s).some((e) => e.id === "mood_buy")) n++;
    }
  }
  return n;
}

test("情緒消費: never below the stress threshold, sometimes above it", () => {
  assert.equal(seen(MOOD_EVENT_MIN_STRESS - 1), 0);
  assert.ok(seen(70) > 0);
});

test("情緒消費: a real choice whose safest option is the three questions", () => {
  assert.ok(RANDOM_EVENT_IDS.includes("mood_buy"));
  assert.equal(SAFEST_OPTION.mood_buy, "gates");
  assert.deepEqual(EVENT_TEXT.mood_buy.options.map((o) => o.id), ["buy", "gates", "close"]);
  assert.ok(eventIsIllustrative("mood_buy"));
});
