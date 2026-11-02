/** 10 DATA-3 (next-e): what 今天 offers next, for the file's five fixtures. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { LINES, type LineSlug } from "@/lib/lines";
import { requiredStations } from "@/lib/modeModel";
import { lineStatus } from "@/lib/progressModel";
import { todayStop, NEXT_ORDER } from "@/lib/todayStop";
import type { SimulationRun } from "@/lib/types";

const run = (slug: string) => ({ id: "r", student_id: "s", line_slug: slug, kind: null, created_at: "" }) as unknown as SimulationRun;
const mods = (slug: LineSlug) => requiredStations(LINES.find((l) => l.slug === slug)!, "sim_first").map((m) => m.number);
const statuses = (done: number[], sims: LineSlug[] = []) =>
  LINES.map((l) => lineStatus(l, new Set(done), sims.includes(l.slug) ? run(l.slug) : null, "sim_first", false));
const slugOf = (s: ReturnType<typeof todayStop>) => (s.kind === "turn" ? "turn" : s.line.slug);

test("next-e: the order is 職涯, 存錢, 消費, 信用, 投資, then the map's order", () => {
  assert.deepEqual(NEXT_ORDER.slice(0, 5), ["zhiya", "cunqian", "qixin", "xinyong", "touzi"]);
  assert.equal(NEXT_ORDER.length, LINES.length);
});

test("next-e: a new student starts 職涯線", () => {
  assert.equal(slugOf(todayStop(statuses([]))), "zhiya");
});

test("next-e: only 消費 done → 職涯線, not a later line", () => {
  assert.equal(slugOf(todayStop(statuses(mods("qixin"), ["qixin"]))), "zhiya");
});

test("next-e: only 投資 started → continue 投資", () => {
  const stop = todayStop(statuses([mods("touzi")[0]]));
  assert.equal(slugOf(stop), "touzi");
});

test("next-e: all core done → the first applied line on the map", () => {
  const core: LineSlug[] = ["zhiya", "cunqian", "qixin", "xinyong", "touzi"];
  const stop = todayStop(statuses(core.flatMap(mods), core));
  assert.equal(slugOf(stop), NEXT_ORDER[5]);
});

test("next-e: only a line's last station done → continue that line at its first station", () => {
  const stop = todayStop(statuses([], ["touzi"]));
  assert.equal(slugOf(stop), "touzi");
  assert.ok(stop.kind === "station" && stop.moduleNumber === mods("touzi")[0]);
});

test("next-e: two lines started → the one touched last", () => {
  const s = statuses([mods("touzi")[0], mods("xinyong")[0]]);
  assert.equal(slugOf(todayStop(s, { touzi: 2, xinyong: 1 })), "touzi");
  assert.equal(slugOf(todayStop(s, { touzi: 1, xinyong: 2 })), "xinyong");
});
