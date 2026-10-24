/**
 * 06 E18, the checks that need no browser: no raw hex in component code
 * outside the art, and the copy rules (no emoji, no 我們, none of the retired
 * labels). Scoped to the Part E code (PART_E below); each rebuilt screen adds
 * its folder here, so the older screens do not fail it before their turn.
 *
 *   node scripts/check-design-static.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const PART_E = [
  "components/ui",
  "components/doc",
  "components/shell",
  "components/flow",
  "components/status",
  "components/map",
  "components/creator",
  "components/linePage/LinePageE.tsx",
  "components/linePage/lineE.module.css",
  "components/game/TurnFlow.tsx",
  "components/game/MoneyStrip.tsx",
  "components/game/turn.module.css",
  "components/game/turnMood.ts",
  "components/transition/train.module.css",
  "app/(app)",
  "lib/design",
];
// Art may use raw hex (E2.1): the character, the scenes, the train.
const ART = ["components/art", "components/transition/Train.tsx"];
const ROOT = new URL("..", import.meta.url).pathname;

function files(dir) {
  if (statSync(join(ROOT, dir)).isFile()) return [join(ROOT, dir)];
  const out = [];
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(tsx?|css)$/.test(f)) out.push(p);
    }
  };
  walk(join(ROOT, dir));
  return out;
}

const problems = [];
const HEX = /#[0-9A-Fa-f]{3,8}\b/;
// Emoji and pictographs (not CJK, not punctuation).
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/u;
const RETIRED = ["我的工具", "提交", "下一張", "下一題", "我們"];

for (const dir of PART_E) {
  for (const f of files(dir)) {
    const rel = f.replace(ROOT, "");
    const lines = readFileSync(f, "utf8").split("\n");
    lines.forEach((line, i) => {
      const code = line.replace(/\/\/.*$|\/\*.*?\*\/|^\s*\*.*$/g, "");
      // Raw hex: .tsx only (E18 Tokens). lineVars computes against --ink's
      // value and is the one documented exception.
      if (rel.endsWith(".tsx") && HEX.test(code)) problems.push(`${rel}:${i + 1} raw hex`);
      if (EMOJI.test(code)) problems.push(`${rel}:${i + 1} emoji`);
      for (const w of RETIRED) if (code.includes(w)) problems.push(`${rel}:${i + 1} retired word 「${w}」`);
    });
  }
}
for (const dir of ART) {
  for (const f of files(dir)) {
    const rel = f.replace(ROOT, "");
    readFileSync(f, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (EMOJI.test(line)) problems.push(`${rel}:${i + 1} emoji`);
      });
  }
}

// Art budgets (E9.1.6, E17): each scene ≤ 20KB source, ≤ 60 elements, one
// <text> at most, no filters, masks or animation inside the SVG.
for (const f of files("components/art/scenes").filter((f) => !f.endsWith("index.tsx"))) {
  const rel = f.replace(ROOT, "");
  const src = readFileSync(f, "utf8");
  const size = statSync(f).size;
  if (size > 20_000) problems.push(`${rel} is ${size} bytes (scene budget 20KB)`);
  const elements = (src.match(/<(rect|path|circle|ellipse|text|g|polygon|line|polyline)\b/g) ?? []).length;
  if (elements > 60) problems.push(`${rel} has ${elements} elements (scene budget 60)`);
  if ((src.match(/<text\b/g) ?? []).length > 1) problems.push(`${rel} has more than one <text>`);
  if (/<(filter|mask|animate)/.test(src)) problems.push(`${rel} uses a filter, mask or SVG animation`);
}

for (const p of problems) console.log("FAIL", p);
console.log(`check-design-static: ${problems.length} problems in ${PART_E.join(", ")}`);
process.exit(problems.length ? 1 : 0);
