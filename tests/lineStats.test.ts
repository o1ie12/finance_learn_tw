/**
 * 06 G5 items 1, 2, 3, 5 and 7: one count and one start line everywhere,
 * last stations labelled honestly, unverified tasks hidden.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildLineStations } from "@/lib/buildStations";
import { LINES, START_LINE, endStation } from "@/lib/lines";
import { lineStats } from "@/lib/lineStats";
import { RECOMMENDED_ORDER } from "@/lib/lifeGame/unlocks";
import { lessonForStation, libraryLessons, terminalLesson, findTaskSet } from "@/lib/tasks/registry";
import { isHiddenTask, UNVERIFIED_TASKS } from "@/lib/tasks/hidden";
import { SHORTS } from "@/content/shorts";

test("G5-2: 站 counts every station and the last one; 分鐘 sums all of them", () => {
  for (const line of LINES) {
    const s = lineStats(line);
    assert.equal(s.stations, buildLineStations(line, [], null, "sim_first").length, `${line.slug}: the line page's rows`);
    const sum = line.stationModules.reduce((a, n) => a + (lessonForStation(line.slug, n)?.minutes ?? 0), 0);
    assert.ok(s.minutes >= sum + (terminalLesson(line.slug)?.minutes ?? 0), `${line.slug}: minutes include the last station`);
  }
  // 信用線: CR01 10 + CR02 9 + 護卡站 is more than the old 19.
  assert.ok(lineStats(LINES.find((l) => l.slug === "xinyong")!).minutes > 19);
});

test("G5-2: the landing, /lines, the line page and 今天 read the same count", () => {
  for (const f of ["components/landing/Landing.tsx", "components/LineCard.tsx", "app/(app)/line/[slug]/page.tsx", "lib/routeBoard.ts"]) {
    const src = readFileSync(f, "utf8");
    assert.match(src, /lineStats\(/, `${f} uses lineStats`);
    assert.doesNotMatch(src, /lineMinutes\(|stationModules\.length/, `${f} computes no count of its own`);
  }
});

test("G5-3: one start line", () => {
  assert.equal(RECOMMENDED_ORDER[0], START_LINE, "今天's order starts with it");
  assert.match(readFileSync("components/landing/Landing.tsx", "utf8"), /START_LINE/);
  assert.match(readFileSync("app/(site)/lines/page.tsx", "utf8"), /START_LINE/);
  assert.match(readFileSync("app/(game)/onboarding/goal/page.tsx", "utf8"), /getLine\(START_LINE\)/);
  assert.doesNotMatch(readFileSync("components/LineCard.tsx", "utf8"), /旗艦/);
});

test("G5-1: a last station is 終點模擬 only when it is a scenario", () => {
  for (const line of LINES) {
    const end = terminalLesson(line.slug);
    if (!end) continue; // the original simulations are scenarios
    const scenario = end.task.steps.length > 1 && end.task.materials.length > 0;
    if (!scenario) assert.equal(endStation(line).scenario, false, `${line.slug}: ${end.task.id} is not a scenario`);
  }
  const xinyong = endStation(LINES.find((l) => l.slug === "xinyong")!);
  assert.equal(xinyong.name, "護卡站");
  assert.equal(xinyong.title, "保護你的卡");
});

test("G5-7: unverified tasks are hidden from the line page, Shorts and the API", () => {
  for (const id of UNVERIFIED_TASKS) {
    assert.equal(findTaskSet(id), null);
    for (const line of LINES) assert.ok(!libraryLessons(line.slug).some((l) => l.task.id === id));
    for (const s of SHORTS) if (s.from === id) assert.ok(isHiddenTask(s.id));
  }
  assert.equal(isHiddenTask("xinyong.payoff.v1"), false, "雪球還是雪崩 is verified (VERIFIED.md item 5)");
});

test("G9 item 1: a line's simulation and the life game start from the same pay", async () => {
  const { DEFAULT_MONTHLY_INCOME } = await import("@/lib/studentProfile");
  const { STARTER_GROSS } = await import("@/lib/onboarding");
  assert.equal(DEFAULT_MONTHLY_INCOME, STARTER_GROSS);
});

test("G9 item 2: stations alone never finish a line, its last node or its stamp", async () => {
  const { lineStatus } = await import("@/lib/progressModel");
  for (const line of LINES) {
    if (!line.sim.ready) continue;
    const done = new Set(line.stationModules);
    const st = lineStatus(line, done, null, "sim_first", false);
    assert.equal(st.complete, false, `${line.slug}: complete without the last station`);
    const progress = line.stationModules.map((n) => ({ module_number: n, completed_at: "2026-10-24T00:00:00Z" })) as never;
    const end = buildLineStations(line, progress, null, "sim_first").at(-1)!;
    assert.notEqual(end.status, "done", `${line.slug}: the last node shows done`);
  }
});
