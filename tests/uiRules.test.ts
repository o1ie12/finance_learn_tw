/**
 * Guards for two hard rules across the whole game UI, not only one file:
 *  - rule 9: no state change may wait on requestAnimationFrame or a
 *    transitionend/animationend event (a hidden tab never fires them);
 *  - rule 6: every place that draws the avatar feeds it only the student's
 *    chosen parts and a mood derived from stress, never money or progress.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { countSteps, scheduleCount, COUNT_MS } from "@/components/game/countSteps";

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

/** Source without comments, so explanations of the rule never trip it. */
function code(file: string): string {
  return readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const UI_DIRS = ["game", "play", "tasks", "station", "onboarding", "transition", "home", "documents", "avatar", "classLife"].map(
  (d) => join("components", d),
);

test("rule 9: no rAF or transition/animation-end dependence in the game UI", () => {
  const offenders: string[] = [];
  for (const dir of UI_DIRS) {
    for (const f of walk(dir)) {
      const src = code(f);
      if (/requestAnimationFrame|transitionend|animationend|onTransitionEnd|onAnimationEnd/i.test(src)) offenders.push(f);
    }
  }
  assert.deepEqual(offenders, []);
});

test("AnimatedNumber's count lands on the exact value at 500ms, with timeouts only", () => {
  const frames = countSteps(1_000, 12_345);
  assert.equal(frames.at(-1)?.at, COUNT_MS);
  assert.equal(frames.at(-1)?.value, 12_345);
  // A fake timer API: run everything due by 500ms.
  const queue: { at: number; fn: () => void }[] = [];
  let shown = 1_000;
  scheduleCount(1_000, 12_345, (n) => (shown = n), {
    timers: {
      setTimeout: (fn, ms) => queue.push({ at: ms, fn }),
      clearTimeout: () => {},
    },
  });
  queue.filter((q) => q.at <= COUNT_MS).sort((a, b) => a.at - b.at).forEach((q) => q.fn());
  assert.equal(shown, 12_345);
});

const FORBIDDEN = /money|cash|netWorth|spend|purchase|price|wealth|salary|income|progress|unlock|points|balance|savings/i;

/** The text inside {...} after `name=` in a JSX element, balanced on braces. */
function attr(element: string, name: string): string | null {
  const i = element.search(new RegExp(`\\b${name}=\\{`));
  if (i < 0) return null;
  let depth = 0;
  const start = element.indexOf("{", i);
  for (let j = start; j < element.length; j++) {
    if (element[j] === "{") depth++;
    else if (element[j] === "}" && --depth === 0) return element.slice(start + 1, j);
  }
  return null;
}

test("rule 6: every <Avatar> call site passes only parts and a stress-derived mood", () => {
  const files = [...walk("components"), ...walk("app")].filter((f) => !f.startsWith(join("components", "avatar")));
  let checked = 0;
  for (const f of files) {
    const src = code(f);
    for (const m of src.matchAll(/<(Avatar|AvatarArt)\b[\s\S]*?\/>/g)) {
      checked++;
      const el = m[0];
      const avatar = attr(el, "avatar") ?? "";
      const mood = attr(el, "mood");
      assert.ok(!FORBIDDEN.test(avatar), `${f}: avatar={${avatar}} reads money or progress`);
      if (mood !== null) {
        assert.ok(!FORBIDDEN.test(mood), `${f}: mood={${mood}} reads money or progress`);
        assert.match(mood, /mood|Mood|"calm"|"tense"|"stressed"/, `${f}: mood={${mood}} must come from moodFromStressLevel`);
      }
    }
  }
  assert.ok(checked >= 3, `expected several call sites, found ${checked}`);
});
