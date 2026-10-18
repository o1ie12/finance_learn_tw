import { test } from "node:test";
import assert from "node:assert/strict";
import { LINES } from "@/lib/lines";
import { lineStatus } from "@/lib/progressModel";
import { requiredStations } from "@/lib/modeModel";
import { todayStop } from "@/lib/todayStop";
import { streakFrom, taipeiDay } from "@/lib/streak";
import type { SimulationRun } from "@/lib/types";

const fakeRun = (slug: string) => ({ id: "r", student_id: "s", line_slug: slug, kind: null, created_at: "" }) as unknown as SimulationRun;

function statuses(done: Set<number>, sims: Set<string>) {
  return LINES.map((l) => lineStatus(l, done, sims.has(l.slug) ? fakeRun(l.slug) : null, "sim_first", false));
}

test("today's stop: a fresh student starts 職涯線 (recommended order, not array order)", () => {
  const stop = todayStop(statuses(new Set(), new Set()));
  assert.ok(stop.kind === "station");
  assert.equal(stop.line.slug, "zhiya");
});

test("today's stop: a line in progress wins over the recommended order", () => {
  // One 信用線 station done: 信用線 is in progress although 職涯線 comes first.
  const xinyong = LINES.find((l) => l.slug === "xinyong")!;
  const first = requiredStations(xinyong, "sim_first")[0].number;
  const stop = todayStop(statuses(new Set([first]), new Set()));
  assert.ok(stop.kind !== "turn");
  assert.equal(stop.line.slug, "xinyong");
});

test("today's stop: everything complete → play one month", () => {
  const all = new Set(LINES.flatMap((l) => requiredStations(l, "sim_first").map((m) => m.number)));
  const stop = todayStop(statuses(all, new Set(LINES.map((l) => l.slug))));
  assert.equal(stop.kind, "turn");
});

test("streak: consecutive Taipei days ending today or yesterday", () => {
  assert.equal(taipeiDay(new Date("2026-10-17T16:30:00Z")), "2026-10-18"); // 00:30 Taipei
  assert.equal(streakFrom(["2026-10-16", "2026-10-17", "2026-10-18"], "2026-10-18"), 3);
  assert.equal(streakFrom(["2026-10-16", "2026-10-17"], "2026-10-18"), 2); // yesterday still counts
  assert.equal(streakFrom(["2026-10-15", "2026-10-16"], "2026-10-18"), 0); // gap
  assert.equal(streakFrom([], "2026-10-18"), 0);
});
