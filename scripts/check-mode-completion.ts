/**
 * Item A acceptance check: completion and "next" honour the student's mode.
 *
 * Exists because the failure it guards against is silent — before this, a
 * sim_first student was told deep stations were optional while the progress
 * model still demanded them, so the line could never complete and its
 * certificate was unreachable. Nothing errored; the line just never finished.
 *
 * Run: npx tsx scripts/check-mode-completion.ts
 */
import { getLine } from "@/lib/lines";
import { lineStatus } from "@/lib/progressModel";
import { requiredStations } from "@/lib/modeModel";
import type { ModuleProgress, SimulationRun } from "@/lib/types";

const line = getLine("zhapian")!; // 5 stations: 3 core, 2 deep
const run = { id: "r1" } as unknown as SimulationRun;

const core = requiredStations(line, "sim_first").map((m) => m.number);
const all = requiredStations(line, "full").map((m) => m.number);
const deep = all.filter((n) => !core.includes(n));

let fail = 0;
const check = (label: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fail++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${label} — got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
};

console.log(`詐騙線: core=${core.join(",")} deep=${deep.join(",")}\n`);

console.log("A1. sim_first: core stations + sim = complete, without any deep station");
{
  const done = new Set(core);
  const s = lineStatus(line, done, run, "sim_first");
  check("complete", s.complete, true);
  check("next", s.next, null);
  check("stationsTotal counts only required", s.stationsTotal, core.length);
}

console.log("\nA2. full mode is unchanged — the same progress is NOT complete");
{
  const done = new Set(core);
  const s = lineStatus(line, done, run, "full");
  check("complete", s.complete, false);
  check("next is a deep station", s.next?.moduleNumber, deep[0]);
}

console.log("\nA3. full mode completes only with every station");
{
  const s = lineStatus(line, new Set(all), run, "full");
  check("complete", s.complete, true);
}

console.log("\nA4. a deep station is never 'next' in sim_first");
for (let i = 0; i <= core.length; i++) {
  const done = new Set(core.slice(0, i));
  const s = lineStatus(line, done, null, "sim_first");
  const n = s.next?.moduleNumber;
  const bad = n !== undefined && deep.includes(n);
  if (bad) fail++;
  console.log(`  ${bad ? "FAIL" : "ok  "} ${i} core done -> next = ${s.next?.label ?? "(sim)"}`);
}

console.log("\nA5. switching mode mid-line recomputes, no stale state");
{
  const done = new Set(core); // core done, deep not
  const a = lineStatus(line, done, run, "sim_first");
  const b = lineStatus(line, done, run, "full");
  check("sim_first complete", a.complete, true);
  check("full incomplete on identical progress", b.complete, false);
}

console.log(fail === 0 ? "\nALL PASS" : `\n${fail} FAILURE(S)`);
process.exit(fail === 0 ? 0 : 1);
