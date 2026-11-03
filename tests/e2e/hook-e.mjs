/**
 * 10 HOOK-1 (hook-e): on the compare screen (/dev/compare fixtures), the
 * 「你一開始的想法」 block shows the student's own 想一想 option and its line:
 * two options on three stations give two different texts; a task with no
 * lines (a 加碼任務) shows no block at all. Plain fetches.
 *
 *   BASE_URL=http://localhost:3210 node tests/e2e/hook-e.mjs
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const results = [];
const check = (ok, what) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, "|").replace(/\|+/g, "|");
const block = async (task, hook) => {
  const t = text(await (await fetch(`${BASE}/dev/compare/${task}?fixture=some${hook ? `&hook=${hook}` : ""}`)).text());
  const at = t.indexOf("你一開始的想法");
  return at < 0 ? null : t.slice(at, t.indexOf("|", t.indexOf("|", at + 8) + 1) + 1);
};

for (const [task, a, b] of [
  ["xinyong.protect.v1", "click", "call"],
  ["touzi.ready.v1", "sell", "hold"],
  ["zhiya.interest.v1", "go", "calc"],
]) {
  const [ta, tb] = [await block(task, a), await block(task, b)];
  check(!!ta && !!tb, `${task}: the block shows for ${a} and ${b}`);
  check(ta !== tb, `${task}: ${a} and ${b} give different text`);
}
check((await block("xinyong.friendloan.v1", null)) === null, "a task with no lines shows no block");

console.log(results.join("\n"));
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`hook-e: ${results.length} checks, ${fails} failing`);
process.exit(fails ? 1 : 0);
