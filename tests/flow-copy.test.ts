/**
 * 11 COPY-1 (flow-copy-e), VERIFY-1 (claims-e): the station's stop names are
 * typed only in content/flow.ts; every number on the landing has a source.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { FLOW_STEPS } from "@/content/flow";
import { SOURCES } from "@/content/sources";

const walk = (d: string): string[] =>
  readdirSync(d).flatMap((n) => {
    const f = join(d, n);
    return statSync(f).isDirectory() ? walk(f) : /\.tsx?$/.test(n) ? [f] : [];
  });

test("flow-copy-e: no page under app/ types 想一想 or 先懂 (they come from content/flow.ts)", () => {
  const hits = walk("app")
    .filter((f) => !f.startsWith(join("app", "dev")))
    .filter((f) => /想一想|先懂/.test(readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")));
  assert.deepEqual(hits, []);
});

test("flow-copy-e: the stops are the station screen's four; 先懂 is not one", () => {
  assert.deepEqual(FLOW_STEPS.map((s) => s.label), ["想一想", "任務", "對答案", "人生"]);
  const landing = readFileSync("components/landing/Landing.tsx", "utf8");
  assert.match(landing, /\{STOPS\.length\} 個停靠/);
  assert.ok(!/先懂/.test(landing));
});

test("claims-e: every figure on the landing names a source in content/sources.ts", () => {
  const landing = readFileSync("components/landing/Landing.tsx", "utf8");
  const block = landing.slice(landing.indexOf("const TAIWAN"), landing.indexOf("];", landing.indexOf("const TAIWAN")));
  const figures = [...block.matchAll(/figure: "([^"]+)"/g)].map((m) => m[1]);
  const sources = [...block.matchAll(/source: "([^"]+)"/g)].map((m) => m[1]);
  assert.equal(figures.length, 4);
  assert.equal(sources.length, figures.length, "one source per figure");
  for (const id of [...sources, "capitalGains"]) {
    const s = (SOURCES as Record<string, { url: string; checkedOn: string }>)[id];
    assert.ok(s, `${id} is in content/sources.ts`);
    assert.match(s.url, /^https:\/\/law\.moj\.gov\.tw\//);
    assert.match(s.checkedOn, /^\d{4}-\d{2}-\d{2}$/);
  }
});
