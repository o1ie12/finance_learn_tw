/**
 * Every page at 1440 × 900 and 390 × 844 (first screen), for a look-alike
 * audit: a student with two 信用線 stations done, then the signed-out site.
 *
 *   BASE_URL=http://localhost:3210 node tests/e2e/audit-shots.mjs [outDir]
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const OUT = process.argv[2] ?? new URL("../../docs/design/screens/audit/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const json = { "content-type": "application/json" };
const code = (await (await fetch(BASE + "/api/signup", { method: "POST", headers: json, body: JSON.stringify({ name: "小安", grade: "高二" }) })).json()).access_code;
const cookie = `fs_access_code=${code}; fs_signed_in=1`;
const post = (p, b) => fetch(BASE + p, { method: "POST", headers: { ...json, cookie }, body: JSON.stringify(b) });
for (const p of ["/api/avatar", "/api/goal"]) await post(p, { skip: true });
for (const id of ["xinyong.bank.v1", "xinyong.bank.v1", "xinyong.statement.v1", "xinyong.statement.v1"]) await post("/api/task", { taskSetId: id, answers: {}, hookAnswer: null });

const SIGNED_IN = [
  ["today", "/today"], ["status", "/status"], ["map", "/map"], ["moves", "/moves"], ["settings", "/settings"],
  ["line", "/line/xinyong"], ["station", "/line/touzi/station/5"], ["end", "/line/xinyong/end"], ["bonus", "/line/xinyong/bonus/xinyong.friendloan.v1"],
  ["turn", "/turn"], ["tools", "/tools"], ["passport", "/passport"], ["certificate", "/line/touzi/certificate"],
  ["review", "/line/xinyong/review"], ["branch", "/line/zhiya/branch/jiaban"], ["test", "/line/xinyong/test/pre"],
  ["article", "/line/xinyong/course/4?read=1"], ["simulation", "/line/zhiya/simulation"], ["transfer", "/transfer"], ["goal", "/onboarding/goal"],
];
const SIGNED_OUT = [["landing", "/"], ["lines", "/lines"], ["signup", "/signup"], ["about", "/about"], ["privacy", "/privacy"], ["terms", "/terms"], ["404", "/no-such-page"]];

const browser = await chromium.launch();
for (const [W, H] of [[1440, 900], [390, 844]]) {
  for (const [list, signed] of [[SIGNED_IN, true], [SIGNED_OUT, false]]) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H } });
    if (signed) await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((n, i) => ({ name: n, value: i ? "1" : code, domain: "localhost", path: "/" })));
    const page = await ctx.newPage();
    for (const [name, path] of list) {
      await page.goto(BASE + path, { waitUntil: "networkidle" }).catch(() => {});
      await page.addStyleTag({ content: "nextjs-portal{display:none!important}" }).catch(() => {});
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${OUT}${name}-${W}.png` });
    }
    await ctx.close();
  }
}
await browser.close();
console.log("done", OUT);
