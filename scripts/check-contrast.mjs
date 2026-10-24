/**
 * 06 E18: recomputes the contrast pairs in E2.4 from app/tokens.css (light
 * and increased contrast; there is no dark mode since 2026-10-24) and checks all 12 line colors from
 * lib/lines.ts (E2.5 a, b, c). Prints a table; exits 1 on any miss. The one
 * known exempt pair (ink-3 on track: a disabled button's label) is listed,
 * not failed.
 *
 *   node scripts/check-contrast.mjs
 */
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/tokens.css", import.meta.url), "utf8");
const linesTs = readFileSync(new URL("../lib/lines.ts", import.meta.url), "utf8");

/** The custom properties declared in the first block after `marker`. */
function block(marker) {
  const at = css.indexOf(marker);
  if (at < 0) throw new Error(`tokens.css: no block after ${marker}`);
  const open = css.indexOf("{", css.indexOf(marker.includes("@media") ? "{" : marker, at) + (marker.includes("@media") ? 1 : 0));
  let depth = 1;
  let i = open + 1;
  while (depth > 0 && i < css.length) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") depth--;
    i++;
  }
  const body = css.slice(open + 1, i - 1);
  const out = {};
  for (const m of body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\b/g)) out[m[1]] = m[2].toLowerCase();
  return out;
}

const light = block(":root,\n.game-shell,\n.fl-shell {");
const moreLight = { ...light, ...block("@media (prefers-contrast: more) {") };

// --- color math -------------------------------------------------------------
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const toHex = (rgb) => "#" + rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, "0")).join("");
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const unlin = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const lum = (h) => {
  const [r, g, b] = hex(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
function toOklab(h) {
  const [r, g, b] = hex(h).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function fromOklab([L, A, B]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return toHex([
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(unlin));
}
/** CSS color-mix(in oklab, a, b p%) */
const mix = (a, b, p) => {
  const [x, y] = [toOklab(a), toOklab(b)];
  return fromOklab(x.map((v, i) => v * (1 - p / 100) + y[i] * (p / 100)));
};

// --- the table ----------------------------------------------------------------
const rows = [];
const report = [];
let misses = 0;
function check(set, label, fg, bg, need, exempt = false) {
  const r = ratio(fg, bg);
  const ok = r >= need;
  if (!ok && !exempt) misses++;
  rows.push(`${ok ? "ok  " : exempt ? "EXMP" : "MISS"} ${set.padEnd(13)} ${label.padEnd(44)} ${r.toFixed(2).padStart(6)}  (needs ${need})`);
}

for (const [set, t] of [["light", light], ["more light", moreLight]]) {
  check(set, "ink on surface", t.ink, t.surface, 4.5);
  check(set, "ink-2 on surface", t["ink-2"], t.surface, 4.5);
  check(set, "ink-3 on surface", t["ink-3"], t.surface, 4.5);
  check(set, "ink-3 on paper", t["ink-3"], t.paper, 4.5);
  check(set, "ink-3 on surface-2", t["ink-3"], t["surface-2"], 4.5);
  check(set, "white on ink (primary button)", t["ink-inv"], t.ink, 4.5);
  for (const k of ["good", "warn", "bad", "info", "money"]) check(set, `${k} on white`, t[k], t.surface, 4.5);
  check(set, "focus ring on paper", t.focus, t.paper, 3);
  check(set, "sign English line on ink", t["ink-inv-2"], t.ink, 4.5);
  check(set, "ink-3 on track (disabled label)", t["ink-3"], t.track, 4.5, true);
}

// --- the 12 lines (E2.5) --------------------------------------------------------
const lines = [...linesTs.matchAll(/slug: "([a-z]+)",[\s\S]*?color: "(#[0-9A-Fa-f]{6})",\s*colorInk: "(#[0-9A-Fa-f]{6})",(?:\s*lineInk: "(#[0-9A-Fa-f]{6})")?/g)].map((m) => ({
  slug: m[1],
  color: m[2].toLowerCase(),
  ink: (m[4] ?? m[3]).toLowerCase(),
}));
if (lines.length !== 12) {
  console.error(`expected 12 lines in lib/lines.ts, found ${lines.length}`);
  process.exit(1);
}
for (const l of lines) {
  const soft = mix(l.color, "#ffffff", 88);
  check("line", `${l.slug}: (a) ink ${l.ink} on soft ${soft}`, l.ink, soft, 4.5);
  // (b) A stripe and the 4px card border are graphics. Two base colors are
  // too light for white and the spec forbids changing them, so a miss here is
  // reported for a decision, not failed: the line's name always appears in
  // text beside the stripe.
  const b = ratio(l.color, light.surface);
  if (b < 3) report.push(`${l.slug}: line ${l.color} on surface is ${b.toFixed(2)} (graphic, needs 3)`);
  // (c) Sign text on the line color: white, or ink where ink reads better
  // (lib/design/lineVars.ts picks the same way).
  const on = ratio("#ffffff", l.color) >= ratio(light.ink, l.color) ? "#ffffff" : light.ink;
  check("line", `${l.slug}: (c) ${on === "#ffffff" ? "white" : "ink"} on line (20px bold)`, on, l.color, 3);
}

console.log(rows.join("\n"));
const exempt = rows.filter((r) => r.startsWith("EXMP")).length;
if (report.length) console.log("\nFor a decision (not failed):\n  " + report.join("\n  "));
console.log(`\ncheck-contrast: ${rows.length} pairs, ${misses} misses, ${exempt} exempt (disabled text)`);
process.exit(misses ? 1 : 0);
